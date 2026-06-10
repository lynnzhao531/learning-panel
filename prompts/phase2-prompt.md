# PHASE 2 BUILD PROMPT — Rollover, Scores, Streaks, Charts, Week Page

## ENFORCEMENT RULES — READ FIRST, APPLY THROUGHOUT

1. Read `CLAUDE.md` in full. Then read `app.js` in full and list (to yourself
   and in the final report) the Phase 1 connection-logic functions you found
   (dayKey, computeQueue, currentCourse, doneCount, points/progress helpers).
   If their names differ from CLAUDE.md, ADAPT to the existing names — do not
   rename Phase 1 code. If their SEMANTICS differ from CLAUDE.md, stop and
   report before building anything.
2. Change range: MODIFY `index.html`, `styles.css`, `app.js` only. No new
   files. No new dependencies — see rule 7.
3. Git: commit the current (Phase 1) state BEFORE starting; commit again
   after Phase 2 is complete and tested.
4. `catalog.js` and `config.js` remain READ-ONLY and untouchable, as do queue
   order, stars, and all scoring formulas.
5. Minimal-change discipline: do not refactor working Phase 1 code except
   where this spec requires touching it. The ONLY Phase 1 UI you may alter:
   (a) the header points chip format, (b) the Today card gains one ETA line,
   (c) the tab bar gains two tabs. Report any diff beyond these and the new
   features as "not strictly necessary" with justification.
6. Build ONLY Phase 2. Still forbidden: persist UI, book days, add-course,
   export/import, light lane, conditional activation (all Phase 3).
7. **Charts are dependency-free.** Do NOT add Chart.js or any CDN script.
   This supersedes CLAUDE.md's allowance (allowed, not required): the app
   must work fully offline. Implement charts as styled DIV bars.

## AUTHORIZED SCHEMA ADDITIONS (this prompt is the authorization record)

- Top-level `ui: { yesterdayDismissedFor: null }`. Migration: if a loaded
  state lacks `ui`, add it with that default. No other schema changes.
- Test events: events created by the console test helper (below) carry
  `test: true`. All real code treats them exactly like normal events.

## WHAT YOU KNOW / WHAT YOU DECIDE / WHAT IS FORBIDDEN

- You KNOW: CLAUDE.md, the Phase 1 code, the data files.
- You DECIDE: all visual design of cards/charts/calendar, bar styling and
  animation, layout, function decomposition, copy wording within the
  no-guilt rule.
- FORBIDDEN: changing day-boundary semantics, scoring math, streak rules as
  specified below, queue/stars, or the two data files.

## BUILD SPEC

### 1. Derived-series engine (connection logic — name these exactly)
- `dailySummaries()` → Map of dayKey → { points, sessionCount,
  courseIds: Set, persistCount, bookLogged } built in ONE pass over
  state.events using the existing dayKey(). persistCount/bookLogged will be
  zero until Phase 3 — compute them generically from event types now so
  Phase 3 needs no changes here.
- `streakInfo()` → { streak, todayPoints, todayMet, graceUsedRecently }.
  **Streak rules (verbatim — do not redesign):** walk completed days
  backward starting from YESTERDAY's dayKey (today is in progress and can
  never break a streak). A day is "met" if its points >=
  CONFIG.dailyGoalPoints. Met → streak += 1 and continue. Not met → excuse
  the day IF the number of already-excused days among the 7 consecutive
  dayKeys ending at this day is < CONFIG.streakGraceDaysPerWeek; excused
  days add 0 but do not break the chain. Otherwise the walk stops. Also stop
  upon passing the earliest event in the log. Days with zero events count as
  "not met" (they can be excused like any other day).
- **Weekday math on dayKeys** (prevents off-by-one bugs): to get a weekday
  or do date arithmetic on a dayKey string, parse it as
  `new Date(key + "T12:00:00Z")` and use getUTCDay()/UTC arithmetic only.
  Weeks run Monday–Sunday.

### 2. Yesterday card (lazy rollover — no schedulers, no timers)
On every render of the Today tab: if `state.ui.yesterdayDismissedFor !==
dayKey(now)`, show a dismissible card ABOVE the Today card summarizing the
previous dayKey: points earned, sessions checked, courses touched (track
chips), and streak status from streakInfo(). Dismissing sets
`ui.yesterdayDismissedFor = dayKey(now)` — so it shows once per day, first
open after the 7am boundary, and an accidental reload does not lose it.
Copy rules: if yesterday had activity → celebratory summary. If yesterday
was excused by grace → mention it gently ("grace day used — streak intact").
If the streak ended → "New streak starts today 🌱". Never the words
"missed", "failed", or "broke".

### 3. Header + Today card touch-ups (the only Phase 1 UI edits)
- Header chip becomes "⭐ {todayPoints} / {CONFIG.dailyGoalPoints} today"
  and gains a subtle filled state once met.
- Today card gains one quiet ETA line under the progress bars: remaining
  sessions and projected finish, computed as
  remainingDays = ceil(remaining / (course.sessions / etaDays)) where
  etaDays = CONFIG.etaDaysShort if pace === "short" else CONFIG.etaDaysLong.
  Render as "~{remainingDays} days to finish at your pace (≈ {weekday})".

### 4. Week tab (new)
Calendar grid of one week, Monday–Sunday, defaulting to the current week,
with ‹ › navigation to earlier/later weeks (later capped at current).
Each day cell: weekday label, points, session count, small colored dots for
the tracks touched (max 4 dots then "+"), goal-met days subtly filled,
today outlined. Below the grid: that week's activity log grouped by day —
e.g. "Tue · 6.0001 sessions 3–5 · ⭐ 6". Empty days simply absent from the
log (no guilt rows).

### 5. Stats tab (new) — Apple-Health style, all dependency-free
- Top row: streak ("🔥 {streak} day streak" or the 🌱 zero-state) with
  grace status line; lifetime chips: total points, total sessions, courses
  completed.
- One bar chart with a Day / Week / Month toggle:
  - Day: last 14 dayKeys, one bar per day (today included, animated).
  - Week: last 12 Monday-start weeks, total points per week.
  - Month: last 12 months (group by dayKey.slice(0,7)), total points.
  Bars are DIVs with height proportional to value; a thin horizontal goal
  line on the Day view at CONFIG.dailyGoalPoints; tapping/clicking a bar
  reveals its exact value and label. Met-goal days use the accent fill,
  others a lighter shade of the same accent — a difference, never a warning.

### 6. Console test helper (no UI, authorized)
Expose `window.__test = { addSession(courseId, daysAgo, count = 1),
removeTestEvents() }`. addSession appends `count` session events for that
course with timestamps shifted back `daysAgo` days (continuing from the
course's current doneCount; events carry test: true). removeTestEvents
strips all test:true events. Document both in the final report. This exists
solely so time logic can be tested without waiting for real days.

## MANUAL TEST CHECKLIST (run all; report pass/fail per item)

1. Open index.html (file://, WiFi OFF): renders, console clean, zero network
   requests — Week and Stats tabs present.
2. Check a session → header chip increments; Stats Day view's today bar
   grows immediately.
3. `__test.addSession("cs109", 1, 4)` then reload → Yesterday card appears
   with 16 points and CS109's track chip; dismiss → stays gone after
   reload; reappears if you set `ui.yesterdayDismissedFor` to an old day
   via console and reload.
4. Add goal-meeting sessions for daysAgo 1, 2, 3 → streak shows 3.
5. Leave daysAgo 4 empty, add goal-meeting sessions for daysAgo 5 and 6 →
   streak grows through the gap with grace noted; add a second empty gap
   inside the same 7-day window (e.g. clear/skip daysAgo 7 while 8 and 9 are
   met) → streak stops at the second gap (grace = 1 verified).
6. Week tab: current week shows today's points; ‹ navigates to the injected
   week; the day log lists "CS109 sessions …" on the right day; › cannot go
   past the current week.
7. Stats toggles: Day shows 14 bars with the goal line; Week and Month
   group the injected data correctly; tapping a bar shows its value.
8. Today card shows the ETA line and it shrinks after checking sessions.
9. `__test.removeTestEvents()` → all injected data vanishes from every view;
   real checkmarks from item 2 remain.

## ENFORCEMENT RULES — REPEATED, VERBATIM INTENT

- Modify ONLY index.html, styles.css, app.js. No new files, no dependencies,
  no CDN scripts — charts are styled DIVs.
- catalog.js / config.js / queue order / stars / scoring / streak rules as
  written above: UNTOUCHABLE.
- Commit before starting and after finishing.
- Final report must include: (a) the Phase 1 connection functions found and
  reused, (b) new connection functions added (dailySummaries, streakInfo)
  with signatures, (c) every diff outside the three authorized Phase 1 UI
  touch-points, justified, (d) confirmation the ONLY schema addition was
  ui.yesterdayDismissedFor plus test:true flags, (e) the checklist results
  item by item.
