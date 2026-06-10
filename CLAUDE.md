# CLAUDE.md — ADHD Learning Panel

## What this is

A local, single-user web app that turns a curated queue of ~54 lecture courses
into one obvious daily action. The user has severe ADHD: any strategic planning
at use-time causes stalling. The app's job is to remove ALL decisions — it says
"this course, this session, press play," celebrates every checkmark, and shows
tangible progress. Tone everywhere: warm, zero guilt, small wins.

The planning brain (Claude, in chat) owns all content and rules. Claude Code
owns implementation. This file is the contract between them.

## Non-negotiable rules

1. **`catalog.js` and `config.js` are READ-ONLY.** Never edit, reformat,
   re-order, or "fix" them — even if you believe there is an error. If you
   find a suspected error, STOP and report it. Runtime corrections (pasted
   playlist links, fixed session counts, renamed titles, archiving) live in
   localStorage overrides, never in these files.
2. **Never change the queue order, star values, or scoring formulas.**
3. **No frameworks, no build tools, no npm, no server.** Plain HTML + CSS +
   vanilla JS. The app MUST work by double-clicking `index.html` (file://).
   This is why data ships as `.js` files setting `window.*` — `fetch()` of
   local JSON is blocked on file:// and must not be used.
4. **Git discipline.** Commit BEFORE starting any phase or change (snapshot of
   the old version) and AFTER completing it, with meaningful messages.
5. **Minimal-change discipline.** For every task: identify the SMALLEST file
   range consistent with the request; change only that; report (a) any diff
   not strictly necessary, (b) any cross-file connection logic that had to be
   revised to keep the pipeline consistent.
6. **Bug protocol.** Never patch the surface. Identify at least 3 candidate
   structural/root causes, say which checks you ran, then fix the root.
7. **Build only the current phase.** Do not scaffold future-phase features.
8. External dependencies allowed: Chart.js via CDN `<script>` tag (Phase 2
   only). Nothing else. Confetti must be a tiny hand-rolled implementation.

## Files

```
learning-panel/
├── CLAUDE.md      this file
├── catalog.js     window.CATALOG — courses, queue, stuck zones (READ-ONLY)
├── config.js      window.CONFIG — scoring constants (READ-ONLY)
├── index.html     single page, all views          (Phase 1+)
├── styles.css     all styling                     (Phase 1+)
├── app.js         all logic                       (Phase 1+)
└── prompts/       build prompts from the planning brain (never executed code)
```

Load order in index.html: config.js → catalog.js → app.js.

## State schema (localStorage key: `lp_state_v1`)

Append-only event log + overrides. **Never store derived scores** — recompute
everything from events on every render. JSON shape:

```js
{
  version: 1,
  activeCourseId: null,        // null = automatic (first incomplete in queue)
  currentBook: null,           // or { title: string, startedAt: ISO }
  events: [
    // every entry: { t: ISO-8601 UTC timestamp, type, ...fields }
    { t, type: "session",  courseId, session },   // session = 1-based number
    { t, type: "persist",  courseId, session, reason, context: [n,n,n] }, // Phase 3
    { t, type: "book" },                          // one per book day  (Phase 3)
    { t, type: "bookFinish", title },             //                   (Phase 3)
    { t, type: "skipCourse",   courseId },        // sanctioned skips
    { t, type: "unskipCourse", courseId },
    { t, type: "activateConditional", courseId }, // e.g. "5.60"       (Phase 3)
    { t, type: "verifyDone", courseId }           // verifyOnFirstOpen cleared
  ],
  overrides: {
    playlistUrls: {},   // courseId -> url
    sessions: {},       // courseId -> corrected count (e.g. 6.S191)
    titles: {},         // courseId -> corrected display title
    archived: []        // courseIds user archived (duplicate Susskind etc.)
  },
  insertedCourses: []   // Phase 3 add-course: full course objects
}
```

## Canonical semantics (all phases must compute these identically)

**Day key.** A "day" runs 07:00 → 06:59 America/Denver (CONFIG values).
Canonical implementation — use exactly this logic:

```js
function dayKey(date = new Date()) {
  const shifted = new Date(date.getTime() - CONFIG.dayBoundaryHour * 3600e3);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CONFIG.timezone, year: "numeric", month: "2-digit", day: "2-digit"
  }).format(shifted);                      // -> "YYYY-MM-DD"
}
```

**mergedCourse(c).** Catalog course with overrides applied (sessions, title,
playlistUrl, archived). All UI reads go through this.

**computeQueue().** Ordered array of queue courses: primary-lane courses by
queuePos → remove user-archived → insert activated conditionals immediately
before their `insertBefore` target → insert `insertedCourses` at their
computed spots (Phase 3). Displayed position = array index + 1.

**doneCount(courseId).** Number of DISTINCT session numbers in "session"
events for that course. Sessions are strictly linear: the ✓ button always
checks the next unchecked session (no out-of-order checking).

**skipped(courseId).** Has skipCourse event not followed by unskipCourse.

**currentCourse().** `state.activeCourseId` if set, unfinished, not skipped,
not archived; otherwise the first course in computeQueue() with
doneCount < sessions, not skipped. Completing the active course resets
activeCourseId to null (back to automatic).

**Open-course URL.** overrides.playlistUrls[id] || catalog playlistUrl ||
`https://www.youtube.com/results?search_query=` + encoded searchQuery.
The Open button must never dead-end.

**Points.** session event → that course's `stars`. book → CONFIG.bookDayPoints.
bookFinish → CONFIG.bookFinishBonus. persist → 0 points (feeds the weekly
ring instead). Day score = sum of points of events whose dayKey(t) matches.

**Progress.** Per-course raw = done/total; adjusted = raw^CONFIG.adjustedProgressExponent
(early sessions move the bar fastest — intentional). Overall bar =
Σ(stars×done) / Σ(stars×total) over computeQueue(), EXCLUDING skipped and
archived courses from both numerator and denominator.

## Visual direction

Calm and spacious: large type, one dominant card, generous whitespace, soft
shadows, rounded corners. Track colors come from `CATALOG.tracks[track].color`
as accents (chips, bar fills) — never full-screen color. Buttons: one huge
primary action per screen. Confetti burst on every session checkmark (small,
fast, dependency-free). Microcopy: encouraging, never guilt-inducing — no
"you missed", no red warnings for inactivity. Claude Code decides all CSS,
layout details, responsiveness, and function decomposition autonomously
within these constraints.

## Phase plan

- **Phase 1** — shell, Today card (open + checkmark), progress bars, queue
  page, verify-on-first-open flow, link pasting, state engine.
- **Phase 2** — 7am lazy rollover with "Yesterday" card, daily score, streaks
  with weekly grace day, Chart.js day/week/month views, week calendar page.
- **Phase 3** — persist flow + stuck-zone rule engine, book days, add-course
  flow, export/import backup + Sunday reminder, light lane, conditional
  course activation.

## Definition of done (every phase)

1. Old version committed before work; new version committed after.
2. The phase's manual test checklist passes via double-clicked index.html
   with zero console errors.
3. Final report: files created/changed; anything done beyond the literal
   spec and why; cross-file connection logic future phases must know about.
