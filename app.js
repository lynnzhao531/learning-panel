/* =====================================================================
   app.js — ADHD Learning Panel (Phase 1)
   ---------------------------------------------------------------------
   Plain vanilla JS, no modules, no build, runs on file://.
   Load order (index.html): config.js -> catalog.js -> app.js.
   READ-ONLY data lives in window.CONFIG and window.CATALOG.

   This file owns ALL logic. The "connection-logic" functions (state
   engine + canonical semantics) are grouped at the top and named exactly
   as in CLAUDE.md so later phases reuse them unchanged:
     dayKey, mergedCourse, computeQueue, doneCount, skipped,
     currentCourse, openUrlFor, pointsToday, rawProgress,
     adjustedProgress, overallProgress.
   ===================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* small generic helpers                                              */
  /* ------------------------------------------------------------------ */

  var STATE_KEY = "lp_state_v1";

  function nowISO() { return new Date().toISOString(); }

  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function pct(x) { return Math.round(x * 100); }

  /* ================================================================== */
  /* STATE ENGINE                                                       */
  /* ================================================================== */

  var DEFAULT_STATE = function () {
    return {
      version: 1,
      activeCourseId: null,
      currentBook: null,
      events: [],
      overrides: { playlistUrls: {}, sessions: {}, titles: {}, archived: [] },
      insertedCourses: []
    };
  };

  var state = null;

  function loadState() {
    var raw = null;
    try { raw = localStorage.getItem(STATE_KEY); } catch (e) { raw = null; }
    if (!raw) { state = DEFAULT_STATE(); saveState(); return; }
    try {
      state = JSON.parse(raw);
    } catch (e) {
      state = DEFAULT_STATE();
    }
    // defensive normalisation (never throws on a partial/older blob)
    if (typeof state !== "object" || state === null) state = DEFAULT_STATE();
    if (state.version == null) state.version = 1;
    if (!Array.isArray(state.events)) state.events = [];
    if (!("activeCourseId" in state)) state.activeCourseId = null;
    if (!("currentBook" in state)) state.currentBook = null;
    if (!state.overrides || typeof state.overrides !== "object") state.overrides = {};
    if (!state.overrides.playlistUrls) state.overrides.playlistUrls = {};
    if (!state.overrides.sessions) state.overrides.sessions = {};
    if (!state.overrides.titles) state.overrides.titles = {};
    if (!Array.isArray(state.overrides.archived)) state.overrides.archived = [];
    if (!Array.isArray(state.insertedCourses)) state.insertedCourses = [];
  }

  function saveState() {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); }
    catch (e) { /* storage full / blocked — app stays usable this session */ }
  }

  function appendEvent(evt) {
    evt.t = nowISO();
    state.events.push(evt);
    saveState();
  }

  /* ================================================================== */
  /* CANONICAL SEMANTICS (identical across all phases)                  */
  /* ================================================================== */

  // Day boundary 07:00 -> 06:59 America/Denver (exact logic from CLAUDE.md).
  function dayKey(date) {
    if (date == null) date = new Date();
    var shifted = new Date(date.getTime() - CONFIG.dayBoundaryHour * 3600e3);
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: CONFIG.timezone, year: "numeric", month: "2-digit", day: "2-digit"
    }).format(shifted); // -> "YYYY-MM-DD"
  }

  // All known courses (catalog + Phase-3 inserted). Pure lookup pool.
  function allCourses() {
    return CATALOG.courses.concat(state.insertedCourses || []);
  }

  function getCourseRaw(id) {
    var list = allCourses();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  // Catalog course with localStorage overrides applied. All UI reads go here.
  function mergedCourse(c) {
    if (!c) return null;
    var ov = state.overrides;
    var sessions = c.sessions;
    if (ov.sessions[c.id] != null) sessions = ov.sessions[c.id];
    var title = (ov.titles[c.id] != null) ? ov.titles[c.id] : c.title;
    var playlistUrl = (ov.playlistUrls[c.id] != null && ov.playlistUrls[c.id] !== "")
      ? ov.playlistUrls[c.id] : c.playlistUrl;
    var userArchived = ov.archived.indexOf(c.id) !== -1;
    var m = {};
    for (var k in c) if (Object.prototype.hasOwnProperty.call(c, k)) m[k] = c[k];
    m.sessions = sessions;
    m.title = title;
    m.playlistUrl = playlistUrl;
    m.userArchived = userArchived;
    return m;
  }

  function mergedById(id) { return mergedCourse(getCourseRaw(id)); }

  // Ordered queue: primary lane by queuePos -> drop user-archived ->
  // insert activated conditionals before their insertBefore target ->
  // insert insertedCourses (Phase 3). Conditional/inserted paths are inert
  // until Phase 3 supplies the events/data, but the pipeline is canonical
  // so every phase computes the same array. Display position = index + 1.
  function computeQueue() {
    var ov = state.overrides;
    var primary = [];
    var list = allCourses();
    for (var i = 0; i < list.length; i++) {
      var c = list[i];
      if (c.lane === "primary" && ov.archived.indexOf(c.id) === -1) primary.push(c);
    }
    primary.sort(function (a, b) { return (a.queuePos || 0) - (b.queuePos || 0); });

    // activated conditionals (Phase 3 creates these events; none in Phase 1)
    var activated = {};
    for (var e = 0; e < state.events.length; e++) {
      if (state.events[e].type === "activateConditional") activated[state.events[e].courseId] = true;
    }
    var queue = primary.slice();
    function insertBeforeTarget(course) {
      var idx = -1;
      for (var q = 0; q < queue.length; q++) {
        if (queue[q].id === course.insertBefore) { idx = q; break; }
      }
      if (idx === -1) queue.push(course); else queue.splice(idx, 0, course);
    }
    for (var a = 0; a < list.length; a++) {
      if (list[a].lane === "conditional" && activated[list[a].id]
          && ov.archived.indexOf(list[a].id) === -1) {
        insertBeforeTarget(list[a]);
      }
    }
    // insertedCourses (Phase 3) — empty in Phase 1
    return queue.map(mergedCourse);
  }

  // Number of DISTINCT session numbers checked for a course.
  function doneCount(courseId) {
    var seen = {};
    var n = 0;
    for (var i = 0; i < state.events.length; i++) {
      var ev = state.events[i];
      if (ev.type === "session" && ev.courseId === courseId && !seen[ev.session]) {
        seen[ev.session] = true; n++;
      }
    }
    return n;
  }

  // Sessions are strictly linear: next unchecked session number.
  function nextSession(courseId) { return doneCount(courseId) + 1; }

  // Has a skipCourse not later cancelled by unskipCourse.
  function skipped(courseId) {
    var s = false;
    for (var i = 0; i < state.events.length; i++) {
      var ev = state.events[i];
      if (ev.courseId !== courseId) continue;
      if (ev.type === "skipCourse") s = true;
      else if (ev.type === "unskipCourse") s = false;
    }
    return s;
  }

  function hasVerifyDone(courseId) {
    for (var i = 0; i < state.events.length; i++) {
      var ev = state.events[i];
      if (ev.type === "verifyDone" && ev.courseId === courseId) return true;
    }
    return false;
  }

  function isComplete(courseId) {
    var m = mergedById(courseId);
    if (!m) return false;
    return doneCount(courseId) >= m.sessions;
  }

  // Active pick if valid, else first queue course still needing sessions.
  function currentCourse() {
    if (state.activeCourseId) {
      var m = mergedById(state.activeCourseId);
      if (m && !isComplete(m.id) && !skipped(m.id) && !m.userArchived) return m;
    }
    var q = computeQueue();
    for (var i = 0; i < q.length; i++) {
      if (!skipped(q[i].id) && doneCount(q[i].id) < q[i].sessions) return q[i];
    }
    return null; // everything complete/skipped
  }

  // The Open button must never dead-end.
  function openUrlFor(course) {
    var ov = state.overrides;
    if (ov.playlistUrls[course.id]) return ov.playlistUrls[course.id];
    if (course.playlistUrl) return course.playlistUrl;
    return "https://www.youtube.com/results?search_query=" +
      encodeURIComponent(course.searchQuery || course.title || course.id);
  }

  function hasUsableUrl(course) {
    var ov = state.overrides;
    return !!(ov.playlistUrls[course.id] || course.playlistUrl);
  }

  /* ---- points & progress -------------------------------------------- */

  function pointsForEvent(ev) {
    switch (ev.type) {
      case "session":
        var c = getCourseRaw(ev.courseId);
        return c ? c.stars : 0;       // stars are never overridable
      case "book": return CONFIG.bookDayPoints;
      case "bookFinish": return CONFIG.bookFinishBonus;
      default: return 0;             // persist & structural events = 0 points
    }
  }

  function pointsToday() {
    var key = dayKey();
    var total = 0;
    for (var i = 0; i < state.events.length; i++) {
      if (dayKey(new Date(state.events[i].t)) === key) total += pointsForEvent(state.events[i]);
    }
    return total;
  }

  function rawProgress(courseId) {
    var m = mergedById(courseId);
    if (!m || !m.sessions) return 0;
    return clamp01(doneCount(courseId) / m.sessions);
  }

  function adjustedProgress(courseId) {
    return Math.pow(rawProgress(courseId), CONFIG.adjustedProgressExponent);
  }

  // Star-weighted, over the queue, excluding skipped & archived from both sides.
  function overallProgress() {
    var q = computeQueue();
    var num = 0, den = 0;
    for (var i = 0; i < q.length; i++) {
      var c = q[i];
      if (skipped(c.id) || c.userArchived) continue;
      var stars = getCourseRaw(c.id).stars;
      num += stars * doneCount(c.id);
      den += stars * c.sessions;
    }
    return den === 0 ? 0 : num / den;
  }

  /* ================================================================== */
  /* MUTATIONS (every write goes through appendEvent/saveState + render) */
  /* ================================================================== */

  var ui = {
    view: "today",          // 'today' | 'queue'
    expandedRow: null,      // courseId whose queue row is expanded
    pendingConfirm: null,   // string token of a 2-step confirm in flight
    celebrateId: null       // course just completed (ephemeral banner)
  };

  function checkSession(courseId) {
    var m = mergedById(courseId);
    if (!m) return;
    var s = nextSession(courseId);
    if (s > m.sessions) return; // already complete
    appendEvent({ type: "session", courseId: courseId, session: s });
    var finished = doneCount(courseId) >= m.sessions;
    if (finished) {
      ui.celebrateId = courseId;
      if (state.activeCourseId === courseId) { state.activeCourseId = null; saveState(); }
      bigConfetti();
    } else {
      confettiBurst();
    }
    render();
  }

  function savePlaylistUrl(courseId, url) {
    url = (url || "").trim();
    if (!url) return;
    state.overrides.playlistUrls[courseId] = url;
    saveState();
    render();
  }

  function saveVerify(courseId, url, sessionsStr, title) {
    url = (url || "").trim();
    title = (title || "").trim();
    if (url) state.overrides.playlistUrls[courseId] = url;
    if (title) state.overrides.titles[courseId] = title;
    if (sessionsStr != null && String(sessionsStr).trim() !== "") {
      var n = Number(sessionsStr);
      if (!Number.isInteger(n) || n <= 0) {
        alert("Session count must be a positive whole number.");
        return;
      }
      state.overrides.sessions[courseId] = n;
    }
    appendEvent({ type: "verifyDone", courseId: courseId });
    render();
  }

  function looksRight(courseId) {
    appendEvent({ type: "verifyDone", courseId: courseId });
    render();
  }

  function skipCourse(courseId) {
    appendEvent({ type: "skipCourse", courseId: courseId });
    ui.pendingConfirm = null; ui.expandedRow = null;
    render();
  }

  function unskipCourse(courseId) {
    appendEvent({ type: "unskipCourse", courseId: courseId });
    render();
  }

  function switchTo(courseId) {
    state.activeCourseId = courseId;
    saveState();
    ui.pendingConfirm = null; ui.expandedRow = null;
    ui.view = "today";
    render();
  }

  function resumeAuto() {
    state.activeCourseId = null;
    saveState();
    render();
  }

  /* ================================================================== */
  /* CONFETTI (hand-rolled, dependency-free)                            */
  /* ================================================================== */

  var confettiCanvas = null, confettiCtx = null, confettiParticles = [], confettiRAF = null;

  function ensureConfettiCanvas() {
    if (confettiCanvas) return;
    confettiCanvas = document.createElement("canvas");
    confettiCanvas.id = "confetti-canvas";
    document.body.appendChild(confettiCanvas);
    confettiCtx = confettiCanvas.getContext("2d");
    resizeConfetti();
    window.addEventListener("resize", resizeConfetti);
  }

  function resizeConfetti() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }

  function spawnConfetti(count, originX, originY) {
    ensureConfettiCanvas();
    var colors = ["#4f8ef7", "#16a085", "#e67e22", "#9b59b6", "#d35400", "#f1c40f"];
    for (var i = 0; i < count; i++) {
      confettiParticles.push({
        x: originX, y: originY,
        vx: (Math.random() - 0.5) * 9,
        vy: Math.random() * -9 - 4,
        g: 0.32 + Math.random() * 0.15,
        size: 5 + Math.random() * 6,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 0.4,
        color: colors[(Math.random() * colors.length) | 0],
        life: 60 + Math.random() * 40
      });
    }
    if (!confettiRAF) confettiRAF = requestAnimationFrame(stepConfetti);
  }

  function stepConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    for (var i = confettiParticles.length - 1; i >= 0; i--) {
      var p = confettiParticles[i];
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vrot; p.life--;
      if (p.life <= 0 || p.y > confettiCanvas.height + 20) { confettiParticles.splice(i, 1); continue; }
      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate(p.rot);
      confettiCtx.fillStyle = p.color;
      confettiCtx.globalAlpha = Math.max(0, Math.min(1, p.life / 30));
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      confettiCtx.restore();
    }
    if (confettiParticles.length > 0) {
      confettiRAF = requestAnimationFrame(stepConfetti);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confettiRAF = null;
    }
  }

  function confettiBurst() {
    spawnConfetti(70, window.innerWidth / 2, window.innerHeight * 0.35);
  }
  function bigConfetti() {
    spawnConfetti(160, window.innerWidth * 0.5, window.innerHeight * 0.35);
    spawnConfetti(60, window.innerWidth * 0.3, window.innerHeight * 0.4);
    spawnConfetti(60, window.innerWidth * 0.7, window.innerHeight * 0.4);
  }

  /* ================================================================== */
  /* RENDERING                                                          */
  /* ================================================================== */

  function trackChip(course) {
    var t = CATALOG.tracks[course.track] || { name: course.track, color: "#888" };
    return '<span class="chip" style="background:' + t.color + '">' +
      escapeHtml(t.name) + "</span>";
  }

  function progressBar(adjusted, raw) {
    return '<div class="bar"><div class="bar-fill" style="width:' + pct(adjusted) + '%"></div>' +
      '<div class="bar-raw" style="width:' + pct(raw) + '%"></div></div>';
  }

  function render() {
    renderHeader();
    renderNav();
    var app = document.getElementById("app");
    if (ui.view === "today") app.innerHTML = renderToday();
    else app.innerHTML = renderQueue();
    wireEvents();
  }

  function renderHeader() {
    var op = overallProgress();                 // star-weighted fraction (formula unchanged)
    // Display refinement only: the whole-queue bar is intentionally hard to
    // move (54 star-weighted courses), so a finished short course is < 1%.
    // Keep a visible sliver and a non-zero label whenever op > 0.
    var widthCss = op > 0 ? "max(4px, " + (op * 100) + "%)" : "0%";
    var label = (op > 0 && op * 100 < 1) ? "&lt;1%" : pct(op) + "%";
    var head = document.getElementById("header");
    head.innerHTML =
      '<div class="brand">Next Lecture <span class="brand-sub">one play at a time</span></div>' +
      '<div class="overall">' +
        '<div class="bar big"><div class="bar-fill" style="width:' + widthCss + '"></div></div>' +
        '<div class="overall-pct">' + label + ' of the whole queue</div>' +
      '</div>' +
      '<div class="today-chip">\u2b50 ' + pointsToday() + ' today</div>';
  }

  function renderNav() {
    var nav = document.getElementById("nav");
    nav.innerHTML =
      navBtn("today", "Today") +
      navBtn("queue", "Queue");
  }
  function navBtn(view, label) {
    return '<button class="tab' + (ui.view === view ? " active" : "") +
      '" data-action="tab" data-view="' + view + '">' + label + "</button>";
  }

  /* ---- Today view --------------------------------------------------- */

  function renderToday() {
    var c = currentCourse();
    if (!c) {
      return '<div class="card celebrate-card"><h2>All caught up \ud83c\udf89</h2>' +
        '<p>Every queued course is complete or skipped. Beautiful work.</p></div>';
    }
    var done = doneCount(c.id);
    var sess = nextSession(c.id);
    var raw = rawProgress(c.id);
    var adj = adjustedProgress(c.id);

    var html = "";

    if (ui.celebrateId) {
      var done2 = mergedById(ui.celebrateId);
      html += '<div class="toast">Course complete! \ud83c\udf89 ' +
        escapeHtml(done2 ? done2.short : "") + ' \u2014 on to the next.</div>';
      ui.celebrateId = null;
    }

    var followingPick = state.activeCourseId && state.activeCourseId === c.id;

    html += '<div class="card today-card">';
    if (followingPick) {
      html += '<div class="pick-note">following your pick \u2014 ' +
        '<a href="#" data-action="resume">resume queue order</a></div>';
    }

    html += '<div class="card-top">' + trackChip(c) +
      '<span class="track-name">' + escapeHtml(CATALOG.tracks[c.track].name) + '</span></div>';
    html += '<h1 class="course-title">' + escapeHtml(c.short) + "</h1>";
    html += '<div class="session-line">Session ' + sess + ' of ' + c.sessions + "</div>";

    // verify panel (one-time)
    if (c.verifyOnFirstOpen && !hasVerifyDone(c.id)) {
      html += renderVerifyPanel(c);
    }

    // primary actions
    html += '<div class="actions">' +
      '<a class="btn primary big" href="' + escapeHtml(openUrlFor(c)) +
        '" target="_blank" rel="noopener" data-action="open">\u25b6 Open course</a>' +
      '<button class="btn primary big" data-action="check" data-id="' + c.id +
        '">\u2713 Done \u2014 session ' + sess + '</button>' +
      '</div>';

    // progress
    html += '<div class="progress-block">' +
      progressBar(adj, raw) +
      '<div class="progress-meta">' + done + ' of ' + c.sessions + ' sessions</div>' +
      '</div>';

    // paste-link affordance if no usable url
    if (!hasUsableUrl(c)) {
      html += '<div class="paste-row">' +
        '<input type="text" class="paste-input" data-id="' + c.id +
          '" placeholder="Paste playlist link (optional)">' +
        '<button class="btn small" data-action="paste" data-id="' + c.id + '">Save link</button>' +
        '</div>';
    }

    html += '<div class="why">' + escapeHtml(c.whyHere || "") + "</div>";
    html += "</div>"; // card
    return html;
  }

  function renderVerifyPanel(c) {
    return '<div class="verify">' +
      '<div class="verify-title">Quick check \u2014 is this the right playlist?</div>' +
      '<div class="verify-fields">' +
        '<input type="text" class="vf-url" placeholder="Paste correct playlist link (optional)">' +
        '<input type="number" min="1" step="1" class="vf-sessions" placeholder="Corrected session count (optional)">' +
        '<input type="text" class="vf-title" placeholder="Corrected title (optional)">' +
      '</div>' +
      '<div class="verify-actions">' +
        '<button class="btn small primary" data-action="verify-save" data-id="' + c.id + '">Save</button>' +
        '<button class="btn small" data-action="verify-ok" data-id="' + c.id + '">Looks right</button>' +
      '</div>' +
      '</div>';
  }

  /* ---- Queue view --------------------------------------------------- */

  function renderQueue() {
    var q = computeQueue();
    var rows = "";
    for (var i = 0; i < q.length; i++) {
      rows += renderQueueRow(q[i], i + 1);
    }
    return '<div class="queue">' + rows + "</div>";
  }

  function renderQueueRow(c, position) {
    var cur = currentCourse();
    var isCurrent = cur && cur.id === c.id;
    var complete = isComplete(c.id);
    var isSkipped = skipped(c.id);
    var done = doneCount(c.id);
    var adj = adjustedProgress(c.id);
    var expanded = ui.expandedRow === c.id;

    var cls = "qrow";
    if (isCurrent) cls += " current";
    if (complete) cls += " complete";
    if (isSkipped) cls += " skipped";

    var html = '<div class="' + cls + '" data-action="row-toggle" data-id="' + c.id + '">';
    html += '<div class="qpos">' + position + "</div>";
    html += '<div class="qchip">' + trackChip(c) + "</div>";
    html += '<div class="qmain">' +
      '<div class="qtitle">' + (complete ? "\u2713 " : "") + escapeHtml(c.short) +
        (isSkipped ? ' <span class="skip-tag">skipped</span>' : "") + "</div>" +
      '<div class="qbar">' + progressBar(adj, rawProgress(c.id)) + "</div>" +
      "</div>";
    html += '<div class="qstars">\u2605 ' + getCourseRaw(c.id).stars + "</div>";
    html += '<div class="qcount">' + done + "/" + c.sessions + "</div>";
    html += "</div>"; // qrow

    if (expanded) html += renderRowActions(c, isCurrent, complete, isSkipped);
    return html;
  }

  function renderRowActions(c, isCurrent, complete, isSkipped) {
    var html = '<div class="row-actions">';

    if (isSkipped) {
      html += '<button class="btn small" data-action="unskip" data-id="' + c.id + '">Unskip</button>';
    } else if (!complete && !isCurrent) {
      var confirming = ui.pendingConfirm === ("switch:" + c.id);
      html += '<button class="btn small primary" data-action="switch" data-id="' + c.id + '">' +
        (confirming ? "Confirm \u2014 switch?" : "Switch to this course") + "</button>";
    }

    if (c.optional && !isSkipped && !complete) {
      var confirmingSkip = ui.pendingConfirm === ("skip:" + c.id);
      html += '<button class="btn small warn" data-action="skip" data-id="' + c.id + '">' +
        (confirmingSkip ? "Confirm \u2014 skip?" : "Skip \u2014 no penalty") + "</button>";
    }

    if (!hasUsableUrl(c)) {
      html += '<span class="paste-row inline">' +
        '<input type="text" class="paste-input" data-id="' + c.id + '" placeholder="Paste playlist link">' +
        '<button class="btn small" data-action="paste" data-id="' + c.id + '">Save</button>' +
        '</span>';
    }

    html += "</div>";
    return html;
  }

  /* ================================================================== */
  /* EVENT WIRING                                                        */
  /* ================================================================== */

  function wireEvents() {
    // tabs
    forEachAction("tab", function (btn) {
      btn.addEventListener("click", function () {
        ui.view = btn.getAttribute("data-view");
        ui.expandedRow = null; ui.pendingConfirm = null;
        render();
      });
    });

    forEachAction("check", function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        checkSession(btn.getAttribute("data-id"));
      });
    });

    forEachAction("resume", function (a) {
      a.addEventListener("click", function (e) { e.preventDefault(); resumeAuto(); });
    });

    forEachAction("paste", function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var id = btn.getAttribute("data-id");
        var input = document.querySelector('.paste-input[data-id="' + cssEsc(id) + '"]');
        savePlaylistUrl(id, input ? input.value : "");
      });
    });

    forEachAction("verify-save", function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var card = btn.closest(".today-card");
        saveVerify(
          btn.getAttribute("data-id"),
          card.querySelector(".vf-url").value,
          card.querySelector(".vf-sessions").value,
          card.querySelector(".vf-title").value
        );
      });
    });
    forEachAction("verify-ok", function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        looksRight(btn.getAttribute("data-id"));
      });
    });

    // queue row toggle (expand)
    forEachAction("row-toggle", function (rowEl) {
      rowEl.addEventListener("click", function () {
        var id = rowEl.getAttribute("data-id");
        ui.expandedRow = (ui.expandedRow === id) ? null : id;
        ui.pendingConfirm = null;
        render();
      });
    });

    forEachAction("switch", function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var id = btn.getAttribute("data-id");
        var token = "switch:" + id;
        if (ui.pendingConfirm === token) { switchTo(id); }
        else { ui.pendingConfirm = token; render(); }
      });
    });

    forEachAction("skip", function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var id = btn.getAttribute("data-id");
        var token = "skip:" + id;
        if (ui.pendingConfirm === token) { skipCourse(id); }
        else { ui.pendingConfirm = token; render(); }
      });
    });

    forEachAction("unskip", function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        unskipCourse(btn.getAttribute("data-id"));
      });
    });

    // keep clicks inside inputs / open-link from bubbling to row-toggle
    var stoppers = document.querySelectorAll(".paste-input, .vf-url, .vf-sessions, .vf-title, [data-action=open]");
    for (var i = 0; i < stoppers.length; i++) {
      stoppers[i].addEventListener("click", function (e) { e.stopPropagation(); });
    }
  }

  function forEachAction(action, fn) {
    var nodes = document.querySelectorAll('[data-action="' + action + '"]');
    for (var i = 0; i < nodes.length; i++) fn(nodes[i]);
  }

  function cssEsc(s) { return String(s).replace(/["\\]/g, "\\$&"); }

  /* ================================================================== */
  /* BOOT                                                                */
  /* ================================================================== */

  function boot() {
    loadState();
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  // expose a tiny surface for debugging / later phases (no UI behaviour)
  window.LP = {
    get state() { return state; },
    dayKey: dayKey, computeQueue: computeQueue, currentCourse: currentCourse,
    doneCount: doneCount, pointsToday: pointsToday, overallProgress: overallProgress,
    render: render
  };
})();
