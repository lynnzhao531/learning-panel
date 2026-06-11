# PHASE 4 BUILD PROMPT — Cross-Device Sync (Private Gist)

## ENFORCEMENT RULES — READ FIRST, APPLY THROUGHOUT

1. Read `CLAUDE.md` in full. Pre-flight: read `app.js` fully and inventory
   the Phase 1–3 connection functions (state load/save, appendEvent, dayKey,
   computeQueue, currentCourse, dailySummaries, streakInfo, persistAdvice,
   export/import). Adapt to existing names; never rename. If semantics
   differ from CLAUDE.md or the phase prompts, stop and report.
2. Change range: MODIFY `index.html`, `styles.css`, `app.js` only.
3. Git: commit the current Phase 3 state BEFORE starting; commit after.
4. `catalog.js` / `config.js` / queue order / stars / scoring: untouchable.
5. The app stays LOCAL-FIRST. Every interaction must work instantly with no
   network, exactly as today; sync is a background layer. No UI action may
   ever block on a request.
6. The ONLY external endpoint permitted is `https://api.github.com` (gist
   API). No SDKs, no other hosts, no CDN scripts.

## AUTHORIZED AMENDMENTS (this prompt is the authorization record)

- **Events gain `id`** (string, unique). New events: `e_` + timestamp ms +
  `_` + 6 random base36 chars, created inside appendEvent. Migration: bump
  state version to 2; a v1 loader assigns each legacy event the
  deterministic id `e_{t}_{type}_{courseId||""}_{session||""}` (append
  `_2`, `_3`… on collision within the array), saves once, and never
  re-migrates.
- **Top-level `touched`**: `{ overrides, ui, currentBook, insertedCourses,
  activeCourseId }` → ISO timestamp of last local write to that section.
  Every existing write path to those sections must update its entry.
- **New localStorage key `lp_sync_v1`** (NEVER inside `lp_state_v1`):
  `{ token, gistId, lastSyncedAt, enabled }`. The token must never appear
  in state, in exports, in console logs, or in error messages (redact to
  `ghp_…last4`). Export/import behavior is otherwise unchanged and still
  excludes sync credentials by construction.
- UI touch-points (the only Phase 1–3 UI edits allowed): the header gains a
  small sync status dot + relative time ("synced · just now"), and a ⚙
  button opening the Sync panel.

## WHAT YOU KNOW / DECIDE / FORBIDDEN

- You KNOW: all existing code; the gist API (REST v3, JSON).
- You DECIDE: panel layout, status-dot styling, copy within the no-guilt
  rule, function decomposition, debounce/backoff implementation details.
- FORBIDDEN: changing merge semantics below, adding endpoints or
  dependencies, syncing through the public repo, storing the token
  anywhere but `lp_sync_v1`.

## BUILD SPEC

### 1. Sync panel (⚙)
Fields/actions: token input (masked), **Connect**, **Sync now**,
**Disconnect** (clears `lp_sync_v1` only — local state untouched), and a
plain-words status line. On Connect:
1. `GET /gists` (authenticated, paginate if needed) and look for a gist
   whose **description === "learning-panel-sync"**.
2. Found → store its id, pull, merge, render. Not found → `POST /gists`
   with `{ description: "learning-panel-sync", public: false, files:
   { "learning-panel-state.json": { content: <current state JSON> } } }`
   and store the new id.
So device 1 creates the space; devices 2–3 need only the same token.
Show clear failures in plain words: bad token (401), token without gist
scope (404/403 on POST), offline.

### 2. Sync engine (background, local-first)
- **Push**: any state write → debounce ~2s → read-merge-write:
  `GET` the gist, merge remote into local (rules in §3), `PATCH` the merged
  JSON back, update `lastSyncedAt`. Coalesce overlapping pushes.
- **Pull**: on app load, on `visibilitychange`→visible, on window `focus`,
  on `online`, and every 30s while visible (no polling when hidden).
  If merged result differs from local → save + re-render.
- **Gist >1MB guard**: if the file object has `truncated: true`, fetch its
  `raw_url` for the full content.
- **Failure behavior**: silent, with exponential backoff 30s → 2m → 5m;
  status dot goes gray "offline — will sync when back"; NEVER an error
  modal, NEVER guilt copy. Queued changes simply push on next success.
- **Status states**: setup-needed (no token) / syncing / synced + relative
  time / offline. Tapping the dot = Sync now.

### 3. Merge rules — verbatim, do not redesign
```
merge(local, remote):
  events  = union by event.id, sorted by t (stable; ties keep both)
  for section in [overrides, ui, currentBook, insertedCourses, activeCourseId]:
      winner = side with later touched[section] (missing => epoch)
      take winner's section AND its touched[section]
  version = max(local.version, remote.version)
```
Properties to preserve: a session checked on two offline devices yields two
events whose union still computes correct doneCount (distinct sessions);
nothing in merge may ever DELETE events. If remote JSON is unparseable,
do not clobber it: stop pushing, surface "sync space unreadable — export a
backup and reconnect" in the panel, keep working locally.

### 4. Scope honesty
No real-time websocket, no conflict UI, no multi-user. One person, three
devices, union-merge, ≤30s background latency, instant on focus. That is
the contract.

## MANUAL TEST CHECKLIST (run all; report pass/fail per item)

1. No token configured: app behaves exactly as Phase 3 (WiFi off, console
   clean, no requests to api.github.com at all).
2. Connect with a gist-scope token on "device A" (normal browser profile):
   gist created, dot turns synced. Open the gist on github.com — private,
   contains the state JSON, contains NO token.
3. "Device B" (second profile or another browser), same token, Connect →
   auto-discovers the gist, pulls A's state, identical Today card.
4. Check a session on A → within ~35s (or instantly on focusing B's tab) B
   shows it: points chip, queue, Stats bar all updated.
5. Offline union: disconnect network on both; check session 5 on A and
   session-equivalent work on B (different course); reconnect both → both
   devices converge to the union — all events present, doneCounts correct,
   nothing lost.
6. Section LWW: paste a playlist URL on A, then 10s later archive a course
   on B → after sync both devices show BOTH changes only if writes touched
   different... they touch the same `overrides` section, so expect the
   LATER write's whole section to win; verify behavior matches the rule
   exactly and report it (this is the known, accepted tradeoff).
7. Legacy migration: load a saved pre-Phase-4 state (use an old export) →
   every event gains an id exactly once; second reload changes nothing.
8. Export a backup → file contains events/overrides/ui etc. and NO token,
   NO gistId. Import it → sync settings survive untouched.
9. Rate sanity: with the tab visible for 5 minutes idle, network log shows
   ~10 GETs and zero PATCHes; checking 4 sessions quickly produces ONE
   coalesced PATCH.
10. Disconnect in the panel → lp_sync_v1 cleared, local state intact, app
    fully functional offline; Reconnect restores sync to the same gist.
11. Regression sweep: confetti, Yesterday card, streaks, persist advice,
    book day, light lane, add-course, Sunday banner all unchanged.

## ENFORCEMENT RULES — REPEATED, VERBATIM INTENT

- Modify ONLY index.html, styles.css, app.js. Only endpoint:
  api.github.com. Local-first: nothing ever blocks on network.
- Token: only in lp_sync_v1; never in state, exports, logs, or errors.
- Merge rules implemented exactly as §3; merges never delete events.
- catalog.js / config.js / queue / stars / scoring: untouchable.
- Commit before and after. Final report: (a) connection functions reused,
  (b) new functions (syncPull, syncPush, merge, migrateV1) with signatures,
  (c) every diff outside the two named UI touch-points, justified,
  (d) confirmation schema changes were exactly: event ids, touched map,
  version 2, lp_sync_v1 — nothing else, (e) checklist results item by item.
