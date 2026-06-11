# FINAL VERIFICATION — the whole app, end to end

Written for you, not for Claude Code. Do this once, after Phase 3's own
checklist passes. It takes ~15 minutes and walks the app the way she will
actually live in it. (You can also paste this file to Claude Code afterwards
and ask it to self-audit each item — but do the human pass yourself first;
you're checking *feel*, not just function.)

## Part 1 — One simulated week (test data)

Open the app, then in the browser console build a fake week:

```js
__test.addSession("6.0001", 6, 4)   // 6 days ago: 4 sessions (8 pts)
__test.addSession("6.0001", 5, 4)   // 5 days ago (8 pts)  <- below goal!
__test.addSession("6.0001", 4, 4)   // wait - 12 sessions done = course complete
```

Note what just happened: 6.0001 only has 12 sessions, so the third line
finished it. That's the test.

1. **Today card** auto-advanced to CS109 and shows "Session 1 of 29". ✓?
2. **Queue** shows 6.0001 completed with a ✓ and CS109 highlighted. ✓?
3. **Overall progress bar** moved off zero. ✓?
4. **Stats → streak**: days at 8 pts are below the 12-pt goal — confirm the
   grace logic did what you expect (one sub-goal day excused per 7, the
   second one ends the streak). The numbers should *make sense to you*
   without reading code. If they don't, that's a finding.
5. **Week tab ‹** into last week: bars/log match the injected days. ✓?

## Part 2 — A stuck day, a tired day, a book day

6. Switch to 18.06 in the queue, `__test.addSession("18.06", 0, 5)`, then
   tap **Stuck → Just dense**. The advice should name the four-subspaces
   stretch and hand you a copyable prompt. Paste that prompt into a Claude
   chat for real once — confirm the round trip feels effortless, because
   that round trip *is* the research move she'll live on. ✓?
7. Tap **Low energy** → pick 9.13 → check one session. Confetti, 3 points,
   zero shame in any copy on screen. ✓?
8. **Book day** → name a book → +10. Tomorrow-she would still keep her
   streak on a book-only day — you verified that in Phase 3 item 6; here
   just confirm the button is appropriately *small*. ✓?

## Part 3 — The safety nets

9. **Export** → a JSON file lands in Downloads. Open it in a text editor:
   human-readable, complete. ✓?
10. **Import** that same file → state identical; a safety copy
    auto-downloaded first. ✓?
11. Activate **5.60** in the parked section → it slots in before 2.43. ✓?
12. **Add course** with the mini-prompt: paste its output JSON from a real
    Claude chat → the confirm step shows a landing position that respects
    prereqs and track difficulty. Cancel or keep, your call. ✓?

## Part 4 — Go live (the reset ritual)

When every item above feels right:

```js
__test.removeTestEvents()
localStorage.removeItem("lp_state_v1")   // full factory reset
```

Reload. The app greets her with 6.0001, Session 1 of 12, one big button.
Then:

- Make the **first real checkmark** together if you can — the confetti on
  session 1 of 1,401 is the whole point of the build.
- Do the **first export** immediately and put the file somewhere synced.
- Tell her the only rule she ever needs: *open the app, press the big
  button.* Everything else is optional forever.

## Part 5 — How changes flow from now on

- **Suspected data error** (wrong session count, dead link): fix it in-app
  via the verify/paste affordances. Only bring it to me if the *catalog
  itself* is wrong — I patch catalog.js here and you re-download.
- **New course**: Add Course + mini-prompt handles it. If it's a big
  structural addition (a whole new track), export the state, paste it here,
  and I'll replan properly.
- **Behavior changes** (new feature, different pacing, tuning a constant):
  discuss here → I write a surgical prompt with the enforcement rules →
  Claude Code applies it. Constants in config.js you can also just edit
  yourself — that file exists so tuning never requires touching logic.
- **Every Sunday**: the banner asks for one click. Let it.

That's the system. 54 courses, 1,401 sessions, 8,236 points — one obvious
button at a time.
