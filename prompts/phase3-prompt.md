# PHASE 3 BUILD PROMPT — Persist Engine, Book Days, Light Lane, Add Course, Backup

## ENFORCEMENT RULES — READ FIRST, APPLY THROUGHOUT

1. Read `CLAUDE.md` in full. Pre-flight: read `app.js` fully and inventory
   the Phase 1+2 connection functions (dayKey, computeQueue, currentCourse,
   doneCount, openUrlFor, points/progress helpers, dailySummaries,
   streakInfo). Adapt to existing names; never rename them. If semantics
   differ from CLAUDE.md, stop and report before building.
2. Change range: MODIFY `index.html`, `styles.css`, `app.js` only. No new
   files, no dependencies, no network requests.
3. Git: commit the current Phase 2 state BEFORE starting; commit after
   Phase 3 is complete and tested.
4. `catalog.js` and `config.js` remain READ-ONLY. Queue order, stars, and
   scoring formulas remain untouchable except the ONE authorized streak
   amendment below.
5. Minimal-change: Phase 1/2 UI may only change at the touch-points named in
   this spec. Report any diff beyond them as "not strictly necessary."
6. This is the last phase. Anything not in this spec stays unbuilt.

## AUTHORIZED AMENDMENTS (this prompt is the authorization record)

- Schema additions, all under `ui`: `lightLane: {day, courseId}|null`,
  `lastExportDay: null`, `backupBannerDismissedFor: null`. Migrate missing
  fields with defaults on load.
- `insertedCourses` entries are refined to `{ afterId, course }` (anchored
  insertion — see Add Course). This supersedes CLAUDE.md's looser wording.
- **Streak amendment (single line, inside streakInfo only):** a day counts
  as "met" if points >= CONFIG.dailyGoalPoints **OR** the day has a book
  event. Rationale: a book day is a sanctioned alternative and must never
  burn a grace day. dailySummaries already exposes bookLogged.
- Test helper gains: `__test.addPersist(courseId, session, daysAgo, reason)`
  and `__test.setWeekdayOverride(n|null)` (banner testing only; the
  override must affect ONLY the backup-banner weekday check).

## WHAT YOU KNOW / DECIDE / FORBIDDEN

- You KNOW: CLAUDE.md, all existing code, the data files — including each
  course's `stuckZones` (the rule engine's data).
- You DECIDE: all layout/visual design of the new panels, copy wording
  within the no-guilt rule, function decomposition.
- FORBIDDEN: redesigning the persist rules, insertion rule, star formula,
  or point values written below; touching the two data files.

## BUILD SPEC

### 1. Persist flow ("stuck but continuing")
Today card gains a quiet secondary action under the primary buttons:
**"Stuck? Log it & keep going 💪"** with a small chip beside it showing the
weekly ring count "💪 {n}/{CONFIG.persistWeeklyTarget} this week" (weeks
Monday–Sunday, as in Phase 2).

Tapping opens a one-tap reason sheet — exactly four options, no free text:
`notation` "New notation", `earlier-concept` "Builds on something earlier",
`new-concept` "Totally new concept", `dense` "Just dense". Picking one
appends: `{ t, type:"persist", courseId, session: doneCount+1, reason,
context: [last CONFIG.persistContextSessions checked session numbers] }`,
then shows the advice banner. Logging a persist is framed as a WIN
("logged — pushing through is the skill"), never as a confession.

**Rule engine — `persistAdvice(courseId, session, reason)`, verbatim:**
1. Zone match: stuckZones of the (merged) course where
   range[0] <= session <= range[1]. If several match, pick the narrowest
   range; tie → first listed. May be none.
2. repeatCount = number of persist events for this course within the last
   CONFIG.persistRepeatWindowDays whose session falls in the SAME zone
   (or, if no zone, any session of this course), including this one.
3. If repeatCount < CONFIG.persistRepeatThreshold, advise by zone.kind:
   - `temporary` → "Push on 1–3 sessions — this clears." + zone.tip.
   - `research` → zone.tip + a **copyable AI-explainer prompt** (template
     in §2) prefilled with course, session, zone label.
   - `prereq` → "Targeted fix, no checkmarks needed — quick raid, then come
     back:" + zone.tip + a button **"Open {prereq short title}"** that opens
     openUrlFor(prereqRef course) in a new tab. (Rewatching specific old
     lectures is outside progress tracking — deliberately.)
   No zone → generic by reason: notation/new-concept → research template;
   earlier-concept → "Skim your own recent sessions {context list} first";
   dense → temporary-style push-on advice.
4. If repeatCount >= threshold, ESCALATE one level: temporary → research;
   research → prereq if the zone has prereqRef, else suggest a light-lane
   day and a fresh start tomorrow (gently); prereq → strong recommendation
   to do the raid NOW before another session.
5. The banner is DERIVED, no new state: show advice for the most recent
   persist on the current course while fewer than 3 session events for that
   course exist after it; a small ✕ hides it for the render session.

**Weekly review (Stats tab):** under the streak row, a "Persistence this
week" block: the ring ({n}/{target}, filled when met) and a compact list of
the week's persist events — day, course, session, reason label, which rule
fired (zone label + kind, or "general"), and "pushed through ✓" if 1+
sessions of that course followed it.

### 2. AI-explainer template (embed verbatim, fill placeholders)
```
I'm watching {course title}, session {session}{, in the stretch "{zone label}"}.
I'm stuck on: [one line — what you just saw].
Explain it Feynman-style in under 300 words with one tiny concrete example,
assuming I know what a student knows {session - 1} sessions into this course.
End with one check question for me.
```
Render in a copy-on-click box.

### 3. Book days
Today card footer gains a SMALL, quiet button: **"📖 Book day instead"** —
visually subordinate to everything else (possible, never promoted).
- No `state.currentBook` → a one-field sheet ("What book?") → sets
  currentBook {title, startedAt: ISO} and logs today's `book` event.
- currentBook exists → one tap logs `book` for today ("Logged a day with
  {title} — ⭐ {CONFIG.bookDayPoints}").
- Max one book event per dayKey (guard; second tap shows "already counted —
  nice").
- While currentBook exists, a tiny **"Finished it! 🎉"** action: appends
  `bookFinish {title}` (+CONFIG.bookFinishBonus), big confetti, clears
  currentBook. Points flow through the existing engine untouched.

### 4. Light lane (low energy)
Second small Today-card footer button: **"🪫 Low energy — light lane"**.
Tap → three large chips: the light-lane courses (lane "light") with
remaining sessions, each showing next session number. Picking one sets
`ui.lightLane = { day: dayKey(now), courseId }`. While ui.lightLane.day ===
today, currentCourse() returns that course (unfinished), the card shows a
quiet "back to the queue" link (clears lightLane), and checkmarks earn the
light course's stars normally — full credit. A new day auto-reverts to the
queue (the day check fails). Light courses finished → chip disabled.

### 5. Conditional activation
Queue tab: render conditional-lane courses in a separate greyed "Parked —
conditional" section at the bottom, each with **"Activate — slots in before
{insertBefore short title}"**. One confirm tap → append
`activateConditional` event; computeQueue() inserts it immediately before
its insertBefore target (CLAUDE.md). One-way; say so in the confirm.

### 6. Add course
Queue tab header gains **"+ Add course"** → a panel with two entry paths
that land in the SAME validated form:
- **Paste-JSON path (primary):** a copy-on-click **Claude mini-prompt**:
```
Here's a course to add to my learning panel. Playlist URL: {url field}.
Reply with ONLY a JSON object: { "title", "short", "source",
"track" (one of C,P,M,A,E,F,G,B), "sessions" (count the playlist),
"difficulty" (1-10, calibrate: MIT 18.06 = 5, MIT 6.046J = 8),
"prereqIds" (choose ONLY from: {app injects current queue ids}),
"searchQuery", "stuckZones" ([] or one entry {range,label,kind,tip}) }.
No prose, no markdown fences.
```
  plus a textarea "Paste Claude's JSON" that fills the form on parse
  (reject with a readable message if malformed).
- **Manual path:** fields for url, title, short (optional → derive),
  sessions (positive int), track (select), difficulty (1–10 slider),
  prereqIds (multi-select of existing queue ids), optional stuckZone.

**Derived, not asked:** pace = sessions <= CONFIG.paceShortMaxSessions ?
"short" : "long". stars = clamp(difficulty + (sessions >= 50 ? 1 :
sessions <= 12 ? -1 : 0), 1, 10). lane "primary", added true, optional
false, verifyOnFirstOpen false, queuePos null.

**Insertion rule (verbatim):** in the current computeQueue() array,
anchorIndex = the maximum index among (a) every prereq course, (b) every
same-track course with difficulty <= the new course's difficulty,
(c) the current course. afterId = id at anchorIndex. Persist
`{ afterId, course }` into insertedCourses. computeQueue() places each
inserted course immediately after its afterId, in insertion order; if
afterId ever disappears (archived), append the course at the end and show a
one-line notice on the Queue tab. Show the computed landing position in the
form's confirm step before saving.

### 7. Export / import backup
- **Export** (one click, small 💾 in the header): downloads
  `learning-panel-backup-{dayKey}.json` — the FULL state object — via
  Blob + anchor download (works on file://). Sets ui.lastExportDay.
- **Import** (next to export or on Stats): file input → parse → validate
  (version present, events is array) → confirm dialog summarizing it
  (event count, date span) → FIRST auto-export the current state as a
  safety copy, THEN replace state and re-render.
- **Sunday banner:** if the weekday of dayKey(now) (canonical parse trick)
  equals CONFIG.backupReminderWeekday AND ui.lastExportDay !== today AND
  ui.backupBannerDismissedFor !== today → quiet banner "Sunday backup —
  one click 💾" with the export action and a dismiss ✕ (sets the dismissed
  field). `__test.setWeekdayOverride` affects only this check.

## MANUAL TEST CHECKLIST (run all; report pass/fail per item)

1. WiFi off, file:// open: clean console; all Phase 1/2 features still work
   (checkmark + confetti, queue, Yesterday card, Week, Stats).
2. Switch to 18.06; `__test.addSession("18.06", 0, 5)`; tap Stuck → "Just
   dense" → advice banner cites the four-subspaces zone (session 6 in
   range 5–10), research kind, copyable prompt mentions the zone; ring
   shows 1/5.
3. `__test.addPersist("18.06", 6, 1, "dense")` twice → next real persist in
   the same zone escalates (repeatCount >= 3 → prereq/stronger advice).
4. Check 3 sessions of 18.06 → banner gone by derivation.
5. Stats: ring count correct; weekly review lists each persist with the
   rule that fired and "pushed through ✓" where sessions followed.
6. Book: log a book day → +10 today, second tap blocked politely; via
   `__test` build yesterday as book-only (10 pts) with met days around it →
   streak passes through WITHOUT consuming grace (amendment verified).
7. "Finished it!" → +30, confetti, currentBook cleared; bookFinish in log.
8. Light lane: low-energy → three chips → pick 9.13 → card swaps, checkmark
   earns 3 pts; reload keeps it; set ui.lightLane.day to yesterday via
   console + reload → card back on the queue automatically.
9. Activate 5.60 → appears directly before 2.43; positions renumber; queue
   row count = 55.
10. Add course via JSON path (fake: track M, difficulty 6, prereqIds
    ["18.06"]) → confirm step shows landing position after the correct
    anchor; saved; survives reload; appears in overall progress denominator.
11. Export downloads a complete JSON; change something; import the file →
    state restored exactly; a safety export fired before the import.
12. `__test.setWeekdayOverride(0)` → Sunday banner appears; export → banner
    gone and lastExportDay set; override(null) restores normal behavior.
13. `__test.removeTestEvents()` → injected data gone; real events intact.

## ENFORCEMENT RULES — REPEATED, VERBATIM INTENT

- Modify ONLY index.html, styles.css, app.js. No new files or dependencies.
- catalog.js / config.js / queue order / stars / scoring: UNTOUCHABLE —
  except the single authorized streak line (met = goal OR book day).
- Persist rules, insertion rule, star formula, point values: implement
  exactly as written; redesigning them is out of scope.
- Commit before starting and after finishing.
- Final report: (a) connection functions reused and added (persistAdvice,
  insertion helper, export/import) with signatures; (b) every diff outside
  the named touch-points, justified; (c) confirmation the only schema
  changes were the three ui fields + insertedCourses shape; (d) checklist
  results item by item; (e) any catalog/config suspicion found — reported,
  not fixed.
