# PHASE 1 BUILD PROMPT — ADHD Learning Panel

## ENFORCEMENT RULES — READ FIRST, APPLY THROUGHOUT

1. Read `CLAUDE.md` in full before doing anything. It is the contract; if
   anything in this prompt conflicts with it, STOP and report — do not choose.
2. Isolate the change range before working. For Phase 1 (fresh build) the
   permitted range is EXACTLY: create `index.html`, `styles.css`, `app.js`,
   and `.gitignore`. No other file may be created or modified.
3. Save the old version first: run `git init` (if needed) and make an initial
   commit of the pristine state (CLAUDE.md, catalog.js, config.js, prompts/)
   BEFORE creating any new file. Commit again after Phase 1 is complete.
4. `catalog.js` and `config.js` are READ-ONLY. Do not edit, reformat, or
   "improve" them. Do not change queue order, stars, or scoring. If you
   suspect an error in them, stop and report it instead of fixing.
5. Build ONLY what this prompt specifies. No Phase 2/3 scaffolding: no
   Chart.js, no stats page, no persist UI, no book buttons, no add-course,
   no export/import, no light-lane UI.

## WHAT YOU KNOW / WHAT YOU DECIDE / WHAT IS FORBIDDEN

- You KNOW: everything in CLAUDE.md (architecture, state schema, canonical
  semantics — dayKey, mergedCourse, computeQueue, currentCourse, points,
  progress) plus the data in catalog.js and config.js.
- You DECIDE autonomously: all CSS and layout, exact DOM structure, function
  decomposition, the confetti implementation, responsive behavior, neutral
  microcopy wording (within the no-guilt rule).
- FORBIDDEN to decide: anything touching course order, stars, session counts,
  scoring math, or the two data files. Schema changes to state require
  stopping and reporting.

## BUILD SPEC

### 0. Setup
`.gitignore` with `.DS_Store`. index.html loads scripts in order:
config.js → catalog.js → app.js. Everything must work over file://.

### 1. State engine (app.js)
Implement per CLAUDE.md: load/save `lp_state_v1` (initialize on first run),
`appendEvent(evt)` helper, and the canonical functions `dayKey`,
`mergedCourse`, `computeQueue`, `doneCount`, `skipped`, `currentCourse`,
`openUrlFor(course)`, `pointsToday()`, per-course raw/adjusted progress, and
overall progress. These are connection logic for all later phases — keep them
as small, named, pure functions near the top of app.js.

### 2. App shell
Header: app title (pick something warm and short), overall progress bar with
percentage (star-weighted, per CLAUDE.md), and today's points so far as a
small "⭐ N today" chip. Two tabs: **Today** and **Queue**. No other nav.

### 3. Today card (the centerpiece — one dominant card, zero decisions)
Shows for `currentCourse()`:
- Track color chip + track name, course short title, "Session N of M".
- Big primary button **▶ Open course** → opens `openUrlFor(course)` in a new
  tab. Never dead-ends (search-link fallback per CLAUDE.md).
- Big primary button **✓ Done — session N** → appends the session event,
  fires confetti, advances the card. If that was the final session: a bigger
  celebration state ("Course complete! 🎉") and the card advances to the next
  course in the queue.
- Per-course progress: main bar = adjusted (raw^0.7), with a thin raw bar and
  "n of N sessions" beneath it.
- Inline link affordance: if the course has no usable playlist URL yet, show a
  small "Paste playlist link" input on the card; saving writes to
  overrides.playlistUrls and upgrades the Open button immediately.
- Verify panel: if `verifyOnFirstOpen` is true for this course and no
  verifyDone event exists, show a compact one-time panel above the buttons:
  "Quick check — is this the right playlist?" with three optional fields
  (paste link / corrected session count / corrected title) plus two buttons:
  **Save** (writes overrides + verifyDone event) and **Looks right** (just
  verifyDone). Number inputs must be validated (positive integer).
- A quiet one-line `whyHere` from the catalog at the bottom of the card, so
  the purpose is always legible.

### 4. Queue page
Full `computeQueue()` list, one row per course: position number, track color
chip, short title, star rating ("★ 6"), mini progress bar, "n/N" count.
- Current course visually highlighted; completed courses get a ✓ and muted
  styling; skipped courses show "skipped" with a small "unskip" action.
- Courses with `optional: true` (e.g. 6.041SC) show a small **Skip — no
  penalty** action that appends skipCourse after a one-tap confirm.
- Tapping any other unfinished course expands a row action: **Switch to this
  course** (one confirm tap) → sets `activeCourseId`. When active course ≠
  automatic, the Today card shows a quiet "following your pick — resume queue
  order" link that clears activeCourseId. Switching is deliberately one tap
  deeper than everything else.
- Rows also expose the paste-link input when the course lacks a URL.

### 5. Polish requirements
Confetti on every checkmark (tiny, hand-rolled, no library). All writes go
through appendEvent/save helpers. Re-render from state after every action —
no stale UI. No console errors on file://. No guilt language anywhere.

## MANUAL TEST CHECKLIST (run all; report pass/fail per item)

1. Double-click index.html → app renders, console clean.
2. Today card shows 6.0001, "Session 1 of 12"; Open button opens a YouTube
   SEARCH for it (no URL pasted yet).
3. Paste a playlist link on the card → Open now uses it; survives reload.
4. Press ✓ → confetti, card shows "Session 2 of 12", adjusted bar moved
   noticeably more than 1/12; reload → still session 2; "⭐ 2 today" chip.
5. Queue tab: 54 rows in order, track colors, 6.0001 highlighted, 18.03 row's
   Open works immediately (baked-in URL).
6. Skip 6.041SC via its Skip action → marked skipped; overall progress bar
   excludes it; unskip works.
7. Switch to 6.S191 from the queue → Today card follows AND shows the verify
   panel (it is verifyOnFirstOpen). Set sessions to 11 via the panel → card
   shows "Session 1 of 11"; verify panel never reappears. "Resume queue
   order" returns the card to 6.0001.
8. Check all 12 sessions of 6.0001 → completion celebration, card auto-
   advances to CS109; overall bar > 0%.

## ENFORCEMENT RULES — REPEATED, VERBATIM INTENT

- Change range is ONLY: index.html, styles.css, app.js, .gitignore.
- catalog.js / config.js / queue order / stars / scoring: UNTOUCHABLE.
- Commit before starting and after finishing.
- Report at the end: (a) files created, (b) every choice that went beyond the
  literal spec and why, (c) the exact names/signatures of the connection-logic
  functions (state engine + canonical semantics) that Phases 2–3 will reuse,
  (d) the manual checklist results item by item.
