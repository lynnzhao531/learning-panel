/* =====================================================================
   config.js  —  ADHD Learning Panel: SCORING & BEHAVIOR CONSTANTS
   Authored by Claude (planning brain), 2026-06-10, v1.0
   ---------------------------------------------------------------------
   Claude Code may READ these values, never change them.
   The user tunes the plan by editing numbers here - one place only.
   ---------------------------------------------------------------------
   SCORING MODEL (Feynman version):
   - Every checked session earns the course's star value in points.
     Stars are difficulty-led, so points reward effort, while session
     COUNT already rewards length - no double counting.
   - A day's score = sum of points earned between 7:00am and 6:59am
     next day, Mountain Time. All scores are recomputed from the
     append-only event log on every app open: nothing is ever stored
     that could drift, and no scheduler is needed.
   - Per-course "adjusted" progress bar = (done/total)^0.7, so the
     first sessions visibly move the bar fastest (early momentum).
   - A finished book ~ 50% of a short course: short course ~ 20
     sessions x 4 stars = 80 pts, so book total = 10/day + 30 finish
     bonus ~ 40 pts over a typical read.
   ===================================================================== */

window.CONFIG = {

  /* ---- day boundary & time ---- */
  timezone: "America/Denver",
  dayBoundaryHour: 7,            // a "day" runs 07:00 -> 06:59 next day

  /* ---- daily scoring ---- */
  dailyGoalPoints: 12,           // threshold for streak credit (e.g. 2-3 sessions of a mid course)
  streakGraceDaysPerWeek: 1,     // one missed day per rolling week does NOT break the streak

  /* ---- book days ---- */
  bookDayPoints: 10,             // logging a book day (small button, possible, not promoted)
  bookFinishBonus: 30,           // marking the current book finished

  /* ---- persistence (weekly ring) ---- */
  persistWeeklyTarget: 5,        // goal: persist-through-confusion events per week
  persistContextSessions: 3,     // recent checkmarks attached to each persist event
  persistRepeatThreshold: 3,     // same stuck-zone persists within window ->
  persistRepeatWindowDays: 7,    //   escalate advice from "push on" to the zone's prereq/research move

  /* ---- progress display ---- */
  adjustedProgressExponent: 0.7, // per-course adjusted bar = (done/total)^0.7

  /* ---- pace & finish-date projection ---- */
  paceShortMaxSessions: 25,      // <= this counts as a "short" course
  etaDaysShort: 2.5,             // target days to finish a short course
  etaDaysLong: 3.5,              // target days to finish a long/hard course

  /* ---- safety net ---- */
  backupReminderWeekday: 0       // 0 = Sunday: show the export-backup banner
};
