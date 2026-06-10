/* =====================================================================
   catalog.js  —  ADHD Learning Panel: COURSE CATALOG (data only)
   Authored by Claude (planning brain), 2026-06-10, v1.0
   ---------------------------------------------------------------------
   READ-ONLY FILE. Claude Code must NEVER modify this file.
   Runtime corrections (pasted playlist links, fixed session counts,
   renamed truncated titles) are stored as overrides in localStorage
   state and merged over this catalog at load time.
   ---------------------------------------------------------------------
   SCHEMA per course:
     id          unique slug
     title       full display title
     short       compact name for cards/chips
     source      channel / institution
     track       C|P|M|A|E|F|G|B  (see tracks below)
     lane        "primary"     = the ordered queue
                 "light"       = low-energy lane (served by Low Energy button)
                 "reference"   = dip-in by topic, never queued
                 "conditional" = greyed out until user activates
                 "archived"    = kept, hidden by default
     queuePos    1..54 for primary lane, null otherwise
     insertBefore (conditional lane only) id it slots in front of when activated
     sessions    number of checkable sessions (user-overridable in app)
     stars       1-10 reward weight per session (difficulty-led, +/-1 length nudge)
     difficulty  1-10 raw difficulty
     pace        "short" (~2-3 days) | "long" (~3-4 days)
     optional    true = skipping is sanctioned, no penalty
     added       true = recommended by planner, not in user's saved playlists
     verifyOnFirstOpen  true = title/count ambiguous in library; confirm once
     playlistUrl ""  until user pastes (app falls back to a YouTube search link
                 built from searchQuery, so the Open button always works)
     searchQuery fallback search string
     prereqIds   hard ordering dependencies (ids)
     prereqNote  human explanation
     whyHere     one-line placement rationale
     stuckZones  [{ range:[a,b], label, kind, prereqRef?, tip }]
                 kind: "temporary" -> push 1-3 sessions, it clears
                       "prereq"    -> targeted lectures from prereqRef course
                       "research"  -> 20-min AI-explainer move, then rewatch
   ===================================================================== */

window.CATALOG = {
  version: "1.0",
  generated: "2026-06-10",

  tracks: {
    C: { name: "CS & Algorithms",          color: "#4f8ef7" },
    P: { name: "Probability & Statistics", color: "#9b59b6" },
    M: { name: "Mathematics",              color: "#e67e22" },
    A: { name: "AI & Machine Learning",    color: "#16a085" },
    E: { name: "Economics & Game Theory",  color: "#c0392b" },
    F: { name: "Physics",                  color: "#34495e" },
    G: { name: "Engineering & Control",    color: "#7f8c8d" },
    B: { name: "Mind & Brain",             color: "#d35400" }
  },

  courses: [

  /* ================= PRIMARY QUEUE (1-54) ================= */

  { id: "6.0001", title: "MIT 6.0001 Introduction to CS and Programming in Python (Fall 2016)",
    short: "6.0001 Python", source: "MIT OpenCourseWare", track: "C", lane: "primary",
    queuePos: 1, sessions: 12, stars: 2, difficulty: 2, pace: "short",
    optional: false, added: true, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MIT 6.0001 Introduction to Computer Science Python Fall 2016 playlist",
    prereqIds: [],
    prereqNote: "None. Code is learned by typing: pair every lecture with 20 minutes of typing the examples yourself.",
    whyHere: "ADDED: 6.0002, 6.006, CS109 and CS336 all assume working Python; learner starts from zero.",
    stuckZones: [
      { range: [8, 12], label: "OOP and recursion", kind: "temporary",
        tip: "Normal hump for every first-time programmer. Push 2-3 sessions and keep typing the examples; watching alone will not stick." }
    ] },

  { id: "cs109", title: "Stanford CS109 Introduction to Probability for Computer Scientists",
    short: "CS109 Probability", source: "Stanford Online", track: "P", lane: "primary",
    queuePos: 2, sessions: 29, stars: 4, difficulty: 4, pace: "long",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "Stanford CS109 Introduction to Probability for Computer Scientists playlist",
    prereqIds: ["6.0001"],
    prereqNote: "Uses Python for demos - 6.0001 first.",
    whyHere: "Gentlest probability entry; doubles as Python practice.",
    stuckZones: [
      { range: [3, 6], label: "Counting and combinatorics", kind: "temporary",
        tip: "Everyone fumbles counting at first; it clicks with examples. Push 2-3 sessions." },
      { range: [14, 19], label: "Continuous distributions and Gaussians", kind: "research",
        tip: "Ask Claude for the 'PDF vs CDF in plain words' walkthrough, then rewatch the lecture." },
      { range: [22, 27], label: "MLE / MAP / inference", kind: "research",
        tip: "This is a preview of ML thinking. One worked example from Claude makes these lectures land." }
    ] },

  { id: "6.0002", title: "MIT 6.0002 Introduction to Computational Thinking and Data Science",
    short: "6.0002 Comp Thinking", source: "MIT OpenCourseWare", track: "C", lane: "primary",
    queuePos: 3, sessions: 15, stars: 3, difficulty: 3, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MIT 6.0002 Introduction to Computational Thinking and Data Science playlist",
    prereqIds: ["6.0001"],
    prereqNote: "Direct sequel to 6.0001.",
    whyHere: "Applied warm-up: optimization, simulation, basic data science.",
    stuckZones: [
      { range: [6, 9], label: "Stochastic thinking and Monte Carlo", kind: "temporary",
        tip: "Dense but short; clears by the random-walk examples." }
    ] },

  { id: "6.042j", title: "MIT 6.042J Mathematics for Computer Science",
    short: "6.042J Math for CS", source: "MIT OpenCourseWare", track: "C", lane: "primary",
    queuePos: 4, sessions: 111, stars: 5, difficulty: 4, pace: "long",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MIT 6.042J Mathematics for Computer Science 2010 playlist",
    prereqIds: [],
    prereqNote: "The 111 videos include recitation/problem sessions. Recitations are optional speed-ups - skipping them is fine and lectures alone complete the course; every video watched still earns points.",
    whyHere: "Proofs, discrete math, graphs - the mathematical maturity that 6.006, graph theory, 18.226 and 18.100A all build on.",
    stuckZones: [
      { range: [5, 15], label: "Induction and well-ordering proofs", kind: "temporary",
        tip: "THE classic wall of this course. Persist 3+ sessions and write one induction proof by hand per lecture - it flips like a switch." },
      { range: [30, 45], label: "Number theory", kind: "research",
        tip: "Ask Claude to walk RSA end-to-end once; the lectures then feel concrete instead of abstract." },
      { range: [70, 95], label: "Probability section", kind: "temporary",
        tip: "Heavy overlap with CS109 - treat as fast review at 1.5x speed." }
    ] },

  { id: "gt-furter", title: "Graph Theory Basics (Marius Furter)",
    short: "Graph Theory Basics", source: "Marius Furter", track: "C", lane: "primary",
    queuePos: 5, sessions: 11, stars: 2, difficulty: 2, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "Marius Furter Graph Theory Basics playlist",
    prereqIds: [],
    prereqNote: "None.",
    whyHere: "Quick win that hands you the vocabulary for the graph halves of 6.006 and 6.046J.",
    stuckZones: [] },

  { id: "18.06", title: "MIT 18.06 Linear Algebra (Strang)",
    short: "18.06 Linear Algebra", source: "MIT OpenCourseWare", track: "M", lane: "primary",
    queuePos: 6, sessions: 36, stars: 5, difficulty: 5, pace: "long",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MIT 18.06 Linear Algebra Spring 2005 Strang playlist",
    prereqIds: [],
    prereqNote: "None beyond algebra comfort.",
    whyHere: "Unlocks ML (CS156, 18.065), matrix calculus, quantum mechanics and functional analysis. Highest-leverage course in the catalog.",
    stuckZones: [
      { range: [5, 10], label: "Vector spaces and the four subspaces", kind: "research",
        tip: "The famous 18.06 hump - nearly everyone hits it. Ask Claude to draw 'the big picture of the four subspaces', then rewatch Lecture 10." },
      { range: [21, 25], label: "Eigenvalues and diagonalization", kind: "temporary",
        tip: "The mechanics feel arbitrary until Lecture 25, where they consolidate. Push through." },
      { range: [29, 34], label: "SVD and friends", kind: "research",
        tip: "One Claude session on 'what is SVD for, with a data example' pays for itself - and pre-loads 18.065." }
    ] },

  { id: "6.006", title: "MIT 6.006 Introduction to Algorithms (Spring 2020)",
    short: "6.006 Algorithms", source: "MIT OpenCourseWare", track: "C", lane: "primary",
    queuePos: 7, sessions: 32, stars: 7, difficulty: 7, pace: "long",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MIT 6.006 Introduction to Algorithms Spring 2020 playlist",
    prereqIds: ["6.0001", "6.042j"],
    prereqNote: "Assumes Python fluency and roughly the first half of 6.042J (proofs, big-O, graphs). The archived 2011 run (47 videos) is your alternate-explanation source.",
    whyHere: "Core algorithms; the gateway to 6.046J and algorithmic game theory.",
    stuckZones: [
      { range: [1, 6], label: "Code-heavy examples", kind: "prereq", prereqRef: "6.0001",
        tip: "If the Python (not the algorithm) is the blocker, redo 6.0001 Lectures 8-12, then return." },
      { range: [15, 22], label: "Dynamic programming", kind: "research",
        tip: "The canonical wall. Have Claude walk ONE problem (rod cutting) end-to-end, then rewatch - usually clears in 2-3 sessions." }
    ] },

  { id: "stat110", title: "Harvard Statistics 110: Probability (Blitzstein)",
    short: "Stat 110", source: "Harvard University", track: "P", lane: "primary",
    queuePos: 8, sessions: 35, stars: 6, difficulty: 6, pace: "long",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "Harvard Statistics 110 Probability Blitzstein playlist",
    prereqIds: ["cs109"],
    prereqNote: "CS109 first makes this far smoother; Blitzstein then takes you genuinely deeper.",
    whyHere: "The probability backbone for ML, information theory, stochastic processes and Bayesian persuasion.",
    stuckZones: [
      { range: [4, 8], label: "Conditioning", kind: "temporary",
        tip: "'Conditioning is the soul of statistics' - and the famous wall of Stat 110. Persist; the gambler's-ruin and Monty Hall lectures resolve it." },
      { range: [16, 20], label: "Moment generating functions", kind: "research",
        tip: "Ask Claude 'why do MGFs exist at all' - one good answer demystifies four lectures." }
    ] },

  { id: "6.046j", title: "MIT 6.046J Design and Analysis of Algorithms",
    short: "6.046J Algorithms II", source: "MIT OpenCourseWare", track: "C", lane: "primary",
    queuePos: 9, sessions: 34, stars: 8, difficulty: 8, pace: "long",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MIT 6.046J Design and Analysis of Algorithms 2015 playlist",
    prereqIds: ["6.006"],
    prereqNote: "Direct sequel to 6.006.",
    whyHere: "Algorithm design at full strength; feeds algorithmic game theory.",
    stuckZones: [
      { range: [2, 5], label: "Divide and conquer / FFT", kind: "research",
        tip: "The FFT lecture is notoriously dense. Get Claude's 'polynomial multiplication via FFT' walkthrough before rewatching." },
      { range: [12, 18], label: "Randomized and amortized analysis", kind: "temporary",
        tip: "Dense stretch; clears with examples. Push 2-3 sessions." },
      { range: [24, 30], label: "Network flow and complexity", kind: "prereq", prereqRef: "gt-furter",
        tip: "If graph vocabulary feels shaky, skim Furter's basics again - one evening." }
    ] },

  { id: "6.034", title: "MIT 6.034 Artificial Intelligence (Winston, Fall 2010)",
    short: "6.034 AI", source: "MIT OpenCourseWare", track: "A", lane: "primary",
    queuePos: 10, sessions: 30, stars: 5, difficulty: 5, pace: "long",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MIT 6.034 Artificial Intelligence Fall 2010 Winston playlist",
    prereqIds: ["6.0001"],
    prereqNote: "Light prerequisites; Winston teaches ideas-first.",
    whyHere: "Classic, gentle on-ramp to AI before the math-heavy ML courses.",
    stuckZones: [
      { range: [10, 14], label: "Search and games", kind: "temporary",
        tip: "Tedious rather than deep; push through." },
      { range: [16, 18], label: "SVMs and kernels", kind: "prereq", prereqRef: "18.06",
        tip: "Winston's SVM lectures lean on linear algebra - 18.06's projection and eigen lectures are the fix." }
    ] },

  { id: "agt-bryce", title: "Algorithmic Game Theory (Professor Bryce)",
    short: "Algorithmic Game Theory", source: "Professor Bryce", track: "E", lane: "primary",
    queuePos: 11, sessions: 26, stars: 6, difficulty: 6, pace: "long",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "Professor Bryce Algorithmic Game Theory playlist",
    prereqIds: ["6.006", "stat110"],
    prereqNote: "Teaches its own game-theory basics - no separate game theory course needed first.",
    whyHere: "Econ-track anchor, pulled early per your priority rule; needs the algorithms already behind you.",
    stuckZones: [
      { range: [1, 5], label: "Equilibrium concepts", kind: "temporary",
        tip: "New vocabulary, not hard math; clears fast." },
      { range: [12, 18], label: "Mechanism design and auctions", kind: "research",
        tip: "Tim Roughgarden's free AGT lecture notes are the canonical backup - or ask Claude for the Vickrey auction walkthrough." }
    ] },

  { id: "cs156", title: "Caltech CS 156 Machine Learning (Abu-Mostafa)",
    short: "CS156 Learning from Data", source: "Caltech", track: "A", lane: "primary",
    queuePos: 12, sessions: 18, stars: 6, difficulty: 6, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "Caltech CS 156 Machine Learning Abu-Mostafa Learning from Data playlist",
    prereqIds: ["18.06", "cs109"],
    prereqNote: "Linear algebra and probability are used from lecture one.",
    whyHere: "The best 'why does learning work at all' course in existence; theory spine for everything ML after it.",
    stuckZones: [
      { range: [5, 8], label: "VC dimension and generalization theory", kind: "research",
        tip: "THE wall of this course and also its heart. Budget 2-3 extra days; between sessions, ask Claude for the 'growth function in pictures' explainer." }
    ] },

  { id: "18.065", title: "MIT 18.065 Matrix Methods in Data Analysis (Strang)",
    short: "18.065 Matrix Methods", source: "MIT OpenCourseWare", track: "A", lane: "primary",
    queuePos: 13, sessions: 36, stars: 6, difficulty: 6, pace: "long",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MIT 18.065 Matrix Methods in Data Analysis Signal Processing Machine Learning playlist",
    prereqIds: ["18.06"],
    prereqNote: "Assumes 18.06 cold - especially eigenvalues and SVD.",
    whyHere: "Strang's bridge from linear algebra to ML; sets up 6.S191 and 18.S096.",
    stuckZones: [
      { range: [1, 8], label: "Matrix factorization review", kind: "prereq", prereqRef: "18.06",
        tip: "If Lectures 1-8 feel fast, revisit 18.06 Lectures 21-34 (eigen/SVD); this course assumes them." },
      { range: [25, 33], label: "Optimization and deep learning math", kind: "research",
        tip: "Pairs beautifully with 6.S191 - ask Claude to connect backprop to the matrix calculus shown here." }
    ] },

  { id: "mathcamp", title: "All Math Camp Lectures, in order (Arizona Math Camp)",
    short: "Math Camp", source: "Arizona Math Camp", track: "M", lane: "primary",
    queuePos: 14, sessions: 105, stars: 5, difficulty: 4, pace: "long",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "Arizona Math Camp all lectures in order playlist",
    prereqIds: [],
    prereqNote: "Econ-PhD math camp: analysis, linear algebra, multivariable calculus, optimization.",
    whyHere: "Doubles as your multivariable-calculus course (replaces adding 18.02 to this plan) and as proof reps before 18.100A. Linear algebra section = 1.5x-speed review of 18.06.",
    stuckZones: [
      { range: [1, 30], label: "Real analysis basics", kind: "temporary",
        tip: "With 'a little' proof background, this is exactly the reps you need. Slow is fine here - it pre-pays for 18.100A." },
      { range: [31, 55], label: "Linear algebra section", kind: "temporary",
        tip: "Overlaps 18.06 - watch at 1.5x as review." },
      { range: [60, 85], label: "Constrained optimization / KKT", kind: "research",
        tip: "Ask Claude for one Lagrangian example worked twice (graphically, then algebraically). These lectures then click - and they are the setup for EE364A." }
    ] },

  { id: "ee364a", title: "Stanford EE364A Convex Optimization (Boyd)",
    short: "EE364A Convex Opt", source: "Stanford Online", track: "M", lane: "primary",
    queuePos: 15, sessions: 18, stars: 7, difficulty: 7, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "Stanford EE364A Convex Optimization Boyd playlist",
    prereqIds: ["18.06", "mathcamp"],
    prereqNote: "Linear algebra plus the multivariable/KKT material from Math Camp.",
    whyHere: "Optimization underlies ML and economic theory alike; placed right after its prerequisites mature.",
    stuckZones: [
      { range: [2, 4], label: "Convex sets/functions notation", kind: "research",
        tip: "Notation-dense start. A one-page Claude cheat-sheet of the symbols removes most of the friction." },
      { range: [8, 10], label: "Duality", kind: "research",
        tip: "The wall. Persist 3 sessions and ask for the 'duality as best lower bound' picture." }
    ] },

  { id: "mackay-it", title: "Information Theory, Pattern Recognition (MacKay, via Jakob Foerster)",
    short: "MacKay Info Theory", source: "Jakob Foerster (upload)", track: "A", lane: "primary",
    queuePos: 16, sessions: 16, stars: 6, difficulty: 6, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MacKay Information Theory Pattern Recognition Neural Networks lectures playlist",
    prereqIds: ["stat110"],
    prereqNote: "Solid probability; MacKay's free book is the perfect companion.",
    whyHere: "Legendary Cambridge course; the information-theoretic lens that deep learning and causality both borrow.",
    stuckZones: [
      { range: [3, 6], label: "Typicality and source coding", kind: "temporary",
        tip: "Feels abstract, then suddenly obvious around Lecture 6. Push through." },
      { range: [9, 12], label: "Noisy-channel coding theorem", kind: "research",
        tip: "One of the great theorems - worth a Claude 'proof sketch in plain words' before the lecture, not after." }
    ] },

  { id: "bayes-persuasion", title: "Bayesian Persuasion and Information Design (OneMathStory)",
    short: "Bayesian Persuasion", source: "OneMathStory", track: "E", lane: "primary",
    queuePos: 17, sessions: 13, stars: 8, difficulty: 8, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "OneMathStory Bayesian Persuasion Information Design playlist",
    prereqIds: ["agt-bryce", "stat110"],
    prereqNote: "Research-level material. If game theory still feels thin after AGT, the rescue is Yale ECON 159 (Ben Polak) - add it via Add Course only if actually needed.",
    whyHere: "Econ-track capstone, scheduled the moment its two pillars (game theory + deep probability) are done.",
    stuckZones: [
      { range: [3, 7], label: "Concavification argument", kind: "research",
        tip: "The core trick of the whole field. Read the first 5 pages of Kamenica-Gentzkow (2011) or ask Claude to walk the prosecutor example; the lectures are then smooth." }
    ] },

  { id: "6.s191", title: "MIT 6.S191 Introduction to Deep Learning (Amini) - latest year only",
    short: "6.S191 Deep Learning", source: "Alexander Amini", track: "A", lane: "primary",
    queuePos: 18, sessions: 10, stars: 4, difficulty: 5, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: true,
    playlistUrl: "", searchQuery: "MIT 6.S191 Introduction to Deep Learning latest playlist",
    prereqIds: ["18.065", "6.0001"],
    prereqNote: "Your saved playlist holds ~90 videos spanning MANY years of the same course. Do the LATEST year only (~10 lectures) and fix the session count in-app after opening the playlist.",
    whyHere: "Fast, modern deep-learning pass; the practical complement to CS156's theory.",
    stuckZones: [
      { range: [7, 9], label: "Transformers / attention", kind: "research",
        tip: "If the attention lecture moves fast, ask Claude for 'attention in 10 lines of pseudocode', then rewatch." }
    ] },

  { id: "18.03", title: "MIT 18.03 Differential Equations (Mattuck)",
    short: "18.03 Diff Equations", source: "MIT OpenCourseWare", track: "M", lane: "primary",
    queuePos: 19, sessions: 32, stars: 5, difficulty: 5, pace: "long",
    optional: false, added: true, verifyOnFirstOpen: false,
    playlistUrl: "https://www.youtube.com/playlist?list=PLEC88901EBADDD980",
    searchQuery: "MIT 18.03 Differential Equations Mattuck playlist",
    prereqIds: [],
    prereqNote: "Solid single-variable calculus is exactly the right prep - which you have. Lectures are numbered 1-35 but 18, 34 and 35 were never recorded, so 32 videos.",
    whyHere: "ADDED: the one structural gap. Six saved courses (6.003, 2.003SC, 2.003J, control, 8.03, 8.04) assume ODEs and nothing in the library teaches them. Unlocks the entire physics + engineering back half.",
    stuckZones: [
      { range: [9, 14], label: "Second-order equations and complex roots", kind: "temporary",
        tip: "Mechanical at first; the spring-mass examples make it concrete. Push through." },
      { range: [15, 16], label: "Fourier series", kind: "temporary",
        tip: "Two lectures that pay off directly in 8.03 and 6.003." },
      { range: [19, 23], label: "Laplace transform", kind: "research",
        tip: "Ask Claude 'why does Laplace turn calculus into algebra' - then these lectures are routine. Exactly what the control course assumes." }
    ] },

  { id: "18.s096", title: "MIT 18.S096 Matrix Calculus for Machine Learning and Beyond",
    short: "18.S096 Matrix Calculus", source: "MIT OpenCourseWare", track: "M", lane: "primary",
    queuePos: 20, sessions: 17, stars: 6, difficulty: 6, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MIT 18.S096 Matrix Calculus Machine Learning playlist",
    prereqIds: ["18.06", "mathcamp"],
    prereqNote: "18.06 plus multivariable comfort from Math Camp.",
    whyHere: "Makes backprop and the math behind 6.S191 rigorous.",
    stuckZones: [
      { range: [1, 4], label: "Matrix-derivative notation", kind: "research",
        tip: "Notation shock IS the hump of this course. A Claude cheat-sheet of the d(trace)/dX rules removes it." }
    ] },

  { id: "simons-foml", title: "Foundations of Machine Learning Boot Camp (Simons Institute)",
    short: "Simons FoML", source: "Simons Institute", track: "A", lane: "primary",
    queuePos: 21, sessions: 19, stars: 7, difficulty: 7, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "Simons Institute Foundations of Machine Learning boot camp playlist",
    prereqIds: ["cs156", "stat110"],
    prereqNote: "Workshop talks by different speakers - they are INDEPENDENT. Skipping an impenetrable talk is allowed and is not a defeat.",
    whyHere: "Research-level ML theory, after CS156 supplies the foundations.",
    stuckZones: [
      { range: [1, 19], label: "Any single talk", kind: "temporary",
        tip: "Boot-camp rule: one real attempt, log persist, then skip without guilt and keep moving." }
    ] },

  { id: "cs234", title: "Stanford CS234 Reinforcement Learning",
    short: "CS234 RL", source: "Stanford Online", track: "A", lane: "primary",
    queuePos: 22, sessions: 16, stars: 7, difficulty: 7, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "Stanford CS234 Reinforcement Learning playlist",
    prereqIds: ["cs156", "stat110", "6.s191"],
    prereqNote: "Probability, ML foundations, and deep-learning basics.",
    whyHere: "RL after both the theory (CS156) and practice (6.S191) are in place.",
    stuckZones: [
      { range: [2, 4], label: "MDPs and Bellman equations", kind: "temporary",
        tip: "Everyone marinates here; the gridworld examples resolve it." },
      { range: [8, 10], label: "Policy gradients", kind: "research",
        tip: "Ask Claude to derive REINFORCE in 15 lines, then rewatch." }
    ] },

  { id: "cs330", title: "Stanford CS330 Deep Multi-Task and Meta Learning",
    short: "CS330 Meta-Learning", source: "Stanford Online", track: "A", lane: "primary",
    queuePos: 23, sessions: 18, stars: 7, difficulty: 7, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "Stanford CS330 Deep Multi-Task Meta Learning playlist",
    prereqIds: ["6.s191"],
    prereqNote: "Deep learning assumed. Your second saved CS330 year (17 videos) is archived as the alternate-explanation source.",
    whyHere: "Meta-learning after deep learning.",
    stuckZones: [
      { range: [3, 6], label: "MAML and meta-learning math", kind: "research",
        tip: "The bi-level optimization is the hump; one worked walkthrough from Claude fixes it." }
    ] },

  { id: "cs336", title: "Stanford CS336 Language Modeling from Scratch",
    short: "CS336 LLMs", source: "Stanford Online", track: "A", lane: "primary",
    queuePos: 24, sessions: 17, stars: 8, difficulty: 8, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "Stanford CS336 Language Modeling from Scratch playlist",
    prereqIds: ["6.s191", "6.0001"],
    prereqNote: "The most implementation-heavy course in the catalog. Watching lectures alone is a valid completion for this plan; the assignments are optional extra credit, and pairing with Claude Code on them is fair play.",
    whyHere: "Modern LLM internals, after deep learning.",
    stuckZones: [
      { range: [1, 17], label: "Systems/code density throughout", kind: "prereq", prereqRef: "6.0001",
        tip: "If code is the constant blocker, that is a Python-fluency signal, not an ML signal. Drill small Python exercises for a few days before continuing." }
    ] },

  { id: "causality-bc", title: "Causality Boot Camp (Simons Institute)",
    short: "Causality Boot Camp", source: "Simons Institute", track: "A", lane: "primary",
    queuePos: 25, sessions: 15, stars: 7, difficulty: 7, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "Simons Institute Causality Boot Camp playlist",
    prereqIds: ["stat110", "cs156"],
    prereqNote: "Boot camp - independent talks; the skip rule applies.",
    whyHere: "Causal inference once statistics and ML are both in place; directly relevant to experiment-aversion research methodology.",
    stuckZones: [
      { range: [4, 8], label: "do-calculus and graphical criteria", kind: "research",
        tip: "Ask Claude for the 'backdoor path in pictures' explainer; the rest follows." }
    ] },

  { id: "6.041sc", title: "MIT 6.041SC Probabilistic Systems Analysis and Applied Probability",
    short: "6.041SC Probability", source: "MIT OpenCourseWare", track: "P", lane: "primary",
    queuePos: 26, sessions: 76, stars: 6, difficulty: 5, pace: "long",
    optional: true, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MIT 6.041SC Probabilistic Systems Analysis playlist",
    prereqIds: ["stat110"],
    prereqNote: "OPTIONAL REVIEW - this would be your third pass over core probability after CS109 and Stat 110.",
    whyHere: "Skipping this entirely is sanctioned and costs nothing. Keep it only if you want probability bulletproof before 6.262; the Skip button on this course is guilt-free by design.",
    stuckZones: [] },

  { id: "6.262", title: "MIT 6.262 Discrete Stochastic Processes (Gallager)",
    short: "6.262 Stochastic Proc", source: "MIT OpenCourseWare", track: "P", lane: "primary",
    queuePos: 27, sessions: 25, stars: 9, difficulty: 9, pace: "long",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MIT 6.262 Discrete Stochastic Processes Gallager playlist",
    prereqIds: ["stat110"],
    prereqNote: "Gallager's graduate course. Stat 110 done well suffices; the 6.041SC review helps but is not required.",
    whyHere: "Graduate probability - the deepest course in the probability track.",
    stuckZones: [
      { range: [8, 15], label: "Renewal theory", kind: "research",
        tip: "The hardest stretch of probability in this whole plan. One lecture per day is a fine pace; use Claude between every session and persist hard." }
    ] },

  { id: "8.01", title: "8.01 Physics I: Classical Mechanics (Lewin)",
    short: "8.01 Mechanics", source: "For the Allure of Physics", track: "F", lane: "primary",
    queuePos: 28, sessions: 37, stars: 4, difficulty: 4, pace: "long",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "Walter Lewin 8.01 Physics I Classical Mechanics playlist",
    prereqIds: [],
    prereqNote: "Single-variable calculus is exactly the right prep - which you have.",
    whyHere: "Physics begins here; Lewin's demos make it the easiest serious physics on YouTube.",
    stuckZones: [
      { range: [19, 24], label: "Rotational dynamics and angular momentum", kind: "temporary",
        tip: "The standard hump; the gyroscope demos make it worth it. Push through." }
    ] },

  { id: "8.02", title: "8.02 Physics II: Electricity and Magnetism (Lewin)",
    short: "8.02 E&M", source: "For the Allure of Physics", track: "F", lane: "primary",
    queuePos: 29, sessions: 37, stars: 5, difficulty: 5, pace: "long",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "Walter Lewin 8.02 Physics II Electricity Magnetism playlist",
    prereqIds: ["8.01", "mathcamp"],
    prereqNote: "Mechanics, plus the surface/line integrals Math Camp covered.",
    whyHere: "Second pillar of physics; needed background for 8.03 and quantum.",
    stuckZones: [
      { range: [3, 9], label: "Flux integrals (Gauss's law)", kind: "prereq", prereqRef: "mathcamp",
        tip: "If surface/line integrals feel alien, revisit Math Camp's multivariable section - two evenings." },
      { range: [25, 30], label: "RLC circuits and induction", kind: "temporary",
        tip: "Computational rather than deep; clears with practice." }
    ] },

  { id: "8.03", title: "8.03 Physics III: Vibrations and Waves (Lewin)",
    short: "8.03 Vibrations & Waves", source: "For the Allure of Physics", track: "F", lane: "primary",
    queuePos: 30, sessions: 24, stars: 6, difficulty: 6, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "Walter Lewin 8.03 Vibrations and Waves playlist",
    prereqIds: ["8.02", "18.03"],
    prereqNote: "E&M plus differential equations - this is where 18.03 starts paying physics dividends.",
    whyHere: "The bridge from classical physics to quantum mechanics.",
    stuckZones: [
      { range: [5, 8], label: "Coupled oscillators and normal modes", kind: "temporary",
        tip: "The course's hump; the demos carry you. Push through." },
      { range: [10, 13], label: "Fourier decomposition", kind: "prereq", prereqRef: "18.03",
        tip: "Direct payoff of 18.03 Lectures 15-16 - rewatch those two if rusty." }
    ] },

  { id: "2.003sc", title: "MIT 2.003SC Engineering Dynamics",
    short: "2.003SC Dynamics", source: "MIT OpenCourseWare", track: "G", lane: "primary",
    queuePos: 31, sessions: 39, stars: 6, difficulty: 6, pace: "long",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MIT 2.003SC Engineering Dynamics playlist",
    prereqIds: ["8.01", "18.03"],
    prereqNote: "Mechanics plus ODEs.",
    whyHere: "Engineering track opens once its two prerequisites are done.",
    stuckZones: [
      { range: [18, 26], label: "3D rotation / rigid-body angular momentum", kind: "temporary",
        tip: "The heaviest stretch; persist and use the recitation videos." },
      { range: [30, 36], label: "Lagrangian methods", kind: "research",
        tip: "A Claude preview of 'why Lagrangians' helps now - and pre-loads Susskind's Classical Mechanics later." }
    ] },

  { id: "douglas-control", title: "Classical Control Theory (Brian Douglas)",
    short: "Classical Control", source: "Brian Douglas", track: "G", lane: "primary",
    queuePos: 32, sessions: 46, stars: 4, difficulty: 4, pace: "long",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "Brian Douglas Classical Control Theory playlist",
    prereqIds: ["18.03"],
    prereqNote: "The friendliest control material on the internet; many short videos - a great momentum course.",
    whyHere: "Gentle, practical control before the more formal 6.003.",
    stuckZones: [
      { range: [5, 10], label: "Laplace-domain thinking", kind: "prereq", prereqRef: "18.03",
        tip: "Direct application of 18.03 Lectures 19-23." },
      { range: [15, 25], label: "Root locus and Bode plots", kind: "temporary",
        tip: "Pattern-recognition skills; they build with reps, not insight flashes. Keep going." }
    ] },

  { id: "6.003", title: "MIT 6.003 Signals and Systems",
    short: "6.003 Signals", source: "MIT OpenCourseWare", track: "G", lane: "primary",
    queuePos: 33, sessions: 25, stars: 6, difficulty: 6, pace: "long",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MIT 6.003 Signals and Systems Fall 2011 playlist",
    prereqIds: ["18.03"],
    prereqNote: "ODEs assumed throughout.",
    whyHere: "Formal signals foundation; ties together Fourier, Laplace and the control intuition from Douglas.",
    stuckZones: [
      { range: [3, 6], label: "Convolution", kind: "research",
        tip: "THE hump of signals. Ask Claude for the 'flip-and-slide' graphical walkthrough, then rewatch Lecture 4." },
      { range: [12, 18], label: "Fourier / Laplace / Z transforms", kind: "prereq", prereqRef: "18.03",
        tip: "All of these cash out 18.03; rewatch its Fourier and Laplace lectures if shaky." }
    ] },

  { id: "2.003j", title: "MIT 2.003J Dynamics and Control",
    short: "2.003J Dynamics & Control", source: "MIT OpenCourseWare", track: "G", lane: "primary",
    queuePos: 34, sessions: 9, stars: 5, difficulty: 5, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MIT 2.003J Dynamics and Control playlist",
    prereqIds: ["2.003sc", "douglas-control"],
    prereqNote: "Short capstone tying dynamics to control.",
    whyHere: "Nine sessions to consolidate the whole engineering block - an easy completion win.",
    stuckZones: [] },

  { id: "ssk-cm", title: "Susskind - Classical Mechanics (Stanford Lecture Collection)",
    short: "Susskind Classical Mech", source: "Stanford", track: "F", lane: "primary",
    queuePos: 35, sessions: 10, stars: 5, difficulty: 5, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: true,
    playlistUrl: "", searchQuery: "Susskind Stanford Classical Mechanics lecture collection playlist",
    prereqIds: ["8.01"],
    prereqNote: "Lewin's 8.01 first; Susskind then gives you the elegant formalism.",
    whyHere: "Lagrangians and Hamiltonians - the language all later theoretical physics is written in.",
    stuckZones: [
      { range: [3, 7], label: "Lagrangian / Hamiltonian formalism", kind: "research",
        tip: "The whole point of the course. Ask Claude for 'least action in plain words' between Lectures 3 and 4." }
    ] },

  { id: "ssk-sr", title: "Susskind - Special Relativity (Stanford Lecture Collection)",
    short: "Susskind Special Rel", source: "Stanford", track: "F", lane: "primary",
    queuePos: 36, sessions: 10, stars: 5, difficulty: 5, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: true,
    playlistUrl: "", searchQuery: "Susskind Stanford Special Relativity lecture collection playlist",
    prereqIds: ["8.01"],
    prereqNote: "Mechanics only.",
    whyHere: "Required ramp for general relativity later.",
    stuckZones: [
      { range: [3, 6], label: "4-vectors and spacetime diagrams", kind: "temporary",
        tip: "The notation settles by Lecture 6. Push through." }
    ] },

  { id: "ssk-qe", title: "Susskind - Quantum Entanglements Part 1 (Stanford)",
    short: "Susskind Quantum Ent.", source: "Stanford", track: "F", lane: "primary",
    queuePos: 37, sessions: 9, stars: 6, difficulty: 6, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: true,
    playlistUrl: "", searchQuery: "Susskind Stanford Quantum Entanglements Part 1 playlist",
    prereqIds: ["18.06"],
    prereqNote: "Linear algebra is doing the real work here.",
    whyHere: "Quantum thinking via states and operators, before the wave-mechanics machinery of 8.04.",
    stuckZones: [
      { range: [1, 4], label: "Bra-ket notation and state vectors", kind: "research",
        tip: "Notation shock. One Claude cheat-sheet ('kets are column vectors, bras are row vectors') fixes it." }
    ] },

  { id: "ssk-qm", title: "Susskind - Modern Physics: Quantum Mechanics (Stanford)",
    short: "Susskind Quantum Mech", source: "Stanford", track: "F", lane: "primary",
    queuePos: 38, sessions: 10, stars: 6, difficulty: 6, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: true,
    playlistUrl: "", searchQuery: "Susskind Stanford Modern Physics Quantum Mechanics playlist",
    prereqIds: ["ssk-qe"],
    prereqNote: "Continues directly from Quantum Entanglements.",
    whyHere: "Completes the conceptual quantum ramp before MIT's 8.04.",
    stuckZones: [] },

  { id: "8.04", title: "MIT 8.04 Quantum Physics I (Zwiebach, Spring 2016)",
    short: "8.04 Quantum I", source: "MIT OpenCourseWare", track: "F", lane: "primary",
    queuePos: 39, sessions: 25, stars: 7, difficulty: 7, pace: "long",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MIT 8.04 Quantum Physics I Spring 2016 Zwiebach playlist",
    prereqIds: ["8.03", "18.03", "18.06", "ssk-qm"],
    prereqNote: "Waves, ODEs, linear algebra, and the Susskind conceptual ramp. Your archived 115-clip Adams 2013 version is gold for SECOND explanations when stuck.",
    whyHere: "Real quantum mechanics, scheduled only after every one of its four pillars is in place.",
    stuckZones: [
      { range: [3, 7], label: "Wave mechanics / Schrodinger machinery", kind: "prereq", prereqRef: "18.03",
        tip: "ODE techniques at full speed; rewatch 18.03's second-order lectures if it hurts." },
      { range: [10, 15], label: "Operators and eigenstates", kind: "prereq", prereqRef: "18.06",
        tip: "Eigen-everything. 18.06 Lectures 21-25 are the fix." },
      { range: [1, 25], label: "Any Zwiebach explanation not landing", kind: "research",
        tip: "Watch the same topic in the archived Adams 2013 clips - different angle, same course." }
    ] },

  { id: "18.086", title: "MIT 18.086 Mathematical Methods for Engineers II (Strang)",
    short: "18.086 Math Methods II", source: "MIT OpenCourseWare", track: "M", lane: "primary",
    queuePos: 40, sessions: 29, stars: 7, difficulty: 7, pace: "long",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MIT 18.086 Mathematical Methods for Engineers II playlist",
    prereqIds: ["18.03", "18.06"],
    prereqNote: "ODEs and linear algebra.",
    whyHere: "Numerical methods and PDEs - the computational capstone of the math track.",
    stuckZones: [
      { range: [5, 12], label: "Numerical PDE schemes", kind: "research",
        tip: "Ask Claude to implement one finite-difference scheme with you in 20 lines of Python - the stability discussion becomes concrete." }
    ] },

  { id: "9.35", title: "MIT 9.35 Perception (Spring 2021)",
    short: "9.35 Perception", source: "MIT OpenCourseWare", track: "B", lane: "primary",
    queuePos: 41, sessions: 23, stars: 4, difficulty: 4, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MIT 9.35 Perception Spring 2021 playlist",
    prereqIds: [],
    prereqNote: "None hard; the statistics you will already have makes the psychophysics easy.",
    whyHere: "Brain track proper begins; directly relevant to cognitive-experiment research.",
    stuckZones: [
      { range: [4, 8], label: "Psychophysics and signal detection", kind: "prereq", prereqRef: "stat110",
        tip: "Signal-detection theory is applied probability - you will have it by the time you are here." }
    ] },

  { id: "9.40", title: "MIT 9.40 Introduction to Neural Computation",
    short: "9.40 Neural Computation", source: "MIT OpenCourseWare", track: "B", lane: "primary",
    queuePos: 42, sessions: 20, stars: 6, difficulty: 6, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MIT 9.40 Introduction to Neural Computation playlist",
    prereqIds: ["18.03", "stat110", "18.06"],
    prereqNote: "ODEs, probability and linear algebra all show up.",
    whyHere: "Quantitative neuroscience once its three math pillars are done.",
    stuckZones: [
      { range: [5, 9], label: "Neuron differential-equation models", kind: "prereq", prereqRef: "18.03",
        tip: "Hodgkin-Huxley is ODEs in a lab coat; 18.03's first-order lectures are the fix." }
    ] },

  { id: "res9-003", title: "MIT RES.9-003 Brains, Minds and Machines Summer Course",
    short: "Brains Minds Machines", source: "MIT OpenCourseWare", track: "B", lane: "primary",
    queuePos: 43, sessions: 60, stars: 6, difficulty: 6, pace: "long",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MIT RES.9-003 Brains Minds and Machines summer course playlist",
    prereqIds: ["cs156", "9.40"],
    prereqNote: "Summer-course talks by many speakers - independent; the skip rule applies.",
    whyHere: "The AI-meets-neuroscience capstone of the brain track.",
    stuckZones: [
      { range: [1, 60], label: "Any single talk", kind: "temporary",
        tip: "Same rule as the Simons boot camps: one real attempt, then skip without guilt." }
    ] },

  { id: "18.100a", title: "MIT 18.100A Real Analysis (Rodriguez, Fall 2020)",
    short: "18.100A Real Analysis", source: "MIT OpenCourseWare", track: "M", lane: "primary",
    queuePos: 44, sessions: 25, stars: 7, difficulty: 7, pace: "long",
    optional: false, added: true, verifyOnFirstOpen: false,
    playlistUrl: "https://www.youtube.com/playlist?list=PLUl4u3cNGP61O7HkcF7UImpM0cR_L2gSw",
    searchQuery: "MIT 18.100A Real Analysis Fall 2020 Rodriguez playlist",
    prereqIds: ["6.042j", "mathcamp"],
    prereqNote: "Proof maturity from 6.042J plus Math Camp's analysis section are exactly the on-ramp for 'a little' prior proof background. Exactly 25 lectures.",
    whyHere: "ADDED: 18.102 formally requires real analysis and is genuinely inaccessible without it.",
    stuckZones: [
      { range: [2, 6], label: "Epsilon arguments, sup/inf", kind: "research",
        tip: "This is where analysis clicks or does not. Budget extra days, persist 3+ sessions, and have Claude walk one epsilon-delta proof per day until it is boring." },
      { range: [9, 12], label: "Bolzano-Weierstrass and completeness", kind: "temporary",
        tip: "Dense theorems; they consolidate by Lecture 12." },
      { range: [23, 25], label: "Uniform convergence", kind: "research",
        tip: "The payoff lectures - and the exact concept 18.102 builds on. Worth a Claude preview." }
    ] },

  { id: "18.102", title: "MIT 18.102 Introduction to Functional Analysis",
    short: "18.102 Functional Analysis", source: "MIT OpenCourseWare", track: "M", lane: "primary",
    queuePos: 45, sessions: 23, stars: 9, difficulty: 9, pace: "long",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MIT 18.102 Introduction to Functional Analysis playlist",
    prereqIds: ["18.100a", "18.06"],
    prereqNote: "Real analysis plus linear algebra. With 8.962, the hardest course in the catalog - one lecture per day is a victory pace.",
    whyHere: "Pure-math summit of the math track.",
    stuckZones: [
      { range: [1, 6], label: "Normed / Banach space machinery", kind: "research",
        tip: "Definitions stack fast; keep a running Claude-maintained glossary and review it before each session." },
      { range: [12, 18], label: "Hilbert spaces and spectral ideas", kind: "temporary",
        tip: "Persist; the structure repays everything at the end." }
    ] },

  { id: "18.226", title: "MIT 18.226 Probabilistic Methods in Combinatorics",
    short: "18.226 Probabilistic Methods", source: "MIT OpenCourseWare", track: "M", lane: "primary",
    queuePos: 46, sessions: 11, stars: 8, difficulty: 8, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MIT 18.226 Probabilistic Methods in Combinatorics playlist",
    prereqIds: ["6.042j", "stat110"],
    prereqNote: "Combinatorics and probability, both long since done by this point.",
    whyHere: "Short, elegant graduate course - a satisfying late-stage win.",
    stuckZones: [
      { range: [5, 8], label: "Lovasz Local Lemma", kind: "research",
        tip: "Famous result; ask Claude for the proof sketch BEFORE the lecture, not after." }
    ] },

  { id: "ssk-modern-10", title: "Stanford - Modern Physics Lecture Collection (10 videos)",
    short: "Stanford Modern Physics A", source: "Stanford", track: "F", lane: "primary",
    queuePos: 47, sessions: 10, stars: 5, difficulty: 5, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: true,
    playlistUrl: "", searchQuery: "Susskind Stanford Modern Physics lecture collection playlist",
    prereqIds: ["ssk-qm"],
    prereqNote: "Title truncated in your library - open once, identify which Susskind course it is, rename in-app, archive if it duplicates one already done.",
    whyHere: "Later-stage Susskind material; exact identity confirmed on first open.",
    stuckZones: [] },

  { id: "ssk-quantum-8", title: "Stanford - Quantum Lecture Collection (8 videos)",
    short: "Stanford Quantum B", source: "Stanford", track: "F", lane: "primary",
    queuePos: 48, sessions: 8, stars: 6, difficulty: 6, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: true,
    playlistUrl: "", searchQuery: "Susskind Stanford quantum lecture collection playlist",
    prereqIds: ["ssk-qe"],
    prereqNote: "Title truncated - confirm identity on first open; archive if duplicate.",
    whyHere: "Later-stage quantum material.",
    stuckZones: [] },

  { id: "ssk-classical-alt", title: "Stanford - Modern Physics: Classical Mechanics (9 videos)",
    short: "Stanford Classical Alt", source: "Stanford", track: "F", lane: "primary",
    queuePos: 49, sessions: 9, stars: 5, difficulty: 5, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: true,
    playlistUrl: "", searchQuery: "Susskind Stanford Modern Physics Classical Mechanics playlist",
    prereqIds: ["8.01"],
    prereqNote: "Likely overlaps the Classical Mechanics collection at queue #35 - confirm on first open and archive if it is a duplicate.",
    whyHere: "Parked late so a duplicate costs no momentum.",
    stuckZones: [] },

  { id: "ssk-modern-12", title: "Stanford - Modern Physics Lecture Collection (12 videos)",
    short: "Stanford Modern Physics B", source: "Stanford", track: "F", lane: "primary",
    queuePos: 50, sessions: 12, stars: 5, difficulty: 5, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: true,
    playlistUrl: "", searchQuery: "Susskind Stanford Modern Physics 12 lectures playlist",
    prereqIds: ["ssk-qm"],
    prereqNote: "Title truncated - confirm identity on first open (possibly Statistical Mechanics or Cosmology).",
    whyHere: "Later-stage Susskind material.",
    stuckZones: [] },

  { id: "theoretical-minimum", title: "Stanford - The Theoretical Minimum (Susskind)",
    short: "Theoretical Minimum", source: "Stanford", track: "F", lane: "primary",
    queuePos: 51, sessions: 10, stars: 6, difficulty: 6, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: true,
    playlistUrl: "", searchQuery: "Susskind Stanford Theoretical Minimum lecture collection playlist",
    prereqIds: ["ssk-qe"],
    prereqNote: "Susskind's book-companion course - a lovely consolidation pass.",
    whyHere: "Consolidates the whole Susskind arc.",
    stuckZones: [] },

  { id: "stanford-gr", title: "Stanford - General Relativity (Susskind Lecture Collection)",
    short: "Susskind General Rel", source: "Stanford", track: "F", lane: "primary",
    queuePos: 52, sessions: 10, stars: 7, difficulty: 7, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "Susskind Stanford General Relativity lecture collection playlist",
    prereqIds: ["ssk-sr", "ssk-cm"],
    prereqNote: "Special relativity and Lagrangian mechanics first.",
    whyHere: "The mandatory on-ramp for MIT 8.962 - do not skip straight to MIT's GR.",
    stuckZones: [
      { range: [3, 7], label: "Metric tensor and curvature intuition", kind: "research",
        tip: "Ask Claude for the 'rubber sheet is a lie - what curvature really means' explainer between sessions." }
    ] },

  { id: "8.962", title: "MIT 8.962 General Relativity (Spring 2020)",
    short: "8.962 General Relativity", source: "MIT OpenCourseWare", track: "F", lane: "primary",
    queuePos: 53, sessions: 23, stars: 10, difficulty: 10, pace: "long",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MIT 8.962 General Relativity Spring 2020 playlist",
    prereqIds: ["stanford-gr", "18.03"],
    prereqNote: "Graduate GR - the summit of this catalog. One lecture per day maximum; persistence events here are normal and expected.",
    whyHere: "The hardest, most rewarding course in the library - earned by everything before it.",
    stuckZones: [
      { range: [1, 5], label: "Tensor notation and index gymnastics", kind: "research",
        tip: "The entire entry fee. Drill index manipulation with Claude 30 min/day alongside Lectures 1-5; after that the course opens up." },
      { range: [14, 19], label: "Einstein field equations and curvature", kind: "temporary",
        tip: "The heaviest stretch; slow is normal. Persist." }
    ] },

  { id: "2.43", title: "MIT 2.43 Advanced Thermodynamics",
    short: "2.43 Advanced Thermo", source: "MIT OpenCourseWare", track: "G", lane: "primary",
    queuePos: 54, sessions: 25, stars: 9, difficulty: 9, pace: "long",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MIT 2.43 Advanced Thermodynamics playlist",
    prereqIds: ["5.60"],
    prereqNote: "Graduate thermodynamics. Its prerequisite (undergrad thermo, MIT 5.60) is CONDITIONAL - activate it in-app if and when you commit to this course; otherwise both stay parked at the end.",
    whyHere: "Parked last: far from the rest of the plan and gated on a conditional prerequisite.",
    stuckZones: [
      { range: [8, 14], label: "Exergy / availability analysis", kind: "research",
        tip: "The conceptually new core; one worked example from Claude beats three rewatches." }
    ] },

  /* ================= CONDITIONAL ================= */

  { id: "5.60", title: "MIT 5.60 Thermodynamics and Kinetics (Spring 2008)",
    short: "5.60 Thermodynamics", source: "MIT OpenCourseWare", track: "G", lane: "conditional",
    queuePos: null, insertBefore: "2.43", sessions: 36, stars: 5, difficulty: 5, pace: "long",
    optional: false, added: true, verifyOnFirstOpen: true,
    playlistUrl: "", searchQuery: "MIT 5.60 Thermodynamics Kinetics Spring 2008 playlist",
    prereqIds: [],
    prereqNote: "Session count approximate - confirm on first open.",
    whyHere: "ADDED (conditional): only exists to unlock 2.43. Activate via its button if you commit to advanced thermo; it then slots in directly before 2.43.",
    stuckZones: [] },

  /* ================= LIGHT LANE (Low Energy button) ================= */

  { id: "sts042j", title: "MIT STS.042J Einstein, Oppenheimer, Feynman: Physics in the 20th Century",
    short: "Physics in the 20th Century", source: "MIT OpenCourseWare", track: "F", lane: "light",
    queuePos: null, sessions: 25, stars: 3, difficulty: 2, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MIT STS.042J Einstein Oppenheimer Feynman Physics 20th Century playlist",
    prereqIds: [],
    prereqNote: "Zero prerequisites - pure narrative history of physics.",
    whyHere: "The canonical recovery-day course: real learning, no math, full points.",
    stuckZones: [] },

  { id: "9.13", title: "MIT 9.13 The Human Brain (Kanwisher)",
    short: "9.13 The Human Brain", source: "MIT OpenCourseWare", track: "B", lane: "light",
    queuePos: null, sessions: 17, stars: 3, difficulty: 3, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MIT 9.13 The Human Brain Kanwisher playlist",
    prereqIds: [],
    prereqNote: "None - one of the most watchable courses MIT has ever filmed.",
    whyHere: "Light-lane brain course; also gentle context for 9.35 and 9.40 later.",
    stuckZones: [] },

  { id: "hl-calc", title: "Highlights of Calculus (Strang)",
    short: "Highlights of Calculus", source: "MIT OpenCourseWare", track: "M", lane: "light",
    queuePos: null, sessions: 18, stars: 2, difficulty: 2, pace: "short",
    optional: false, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MIT Highlights of Calculus Strang playlist",
    prereqIds: [],
    prereqNote: "None.",
    whyHere: "Strang's refresher - the ideal warm-up lane while 6.0001 is the main course in week one.",
    stuckZones: [] },

  /* ================= REFERENCE ================= */

  { id: "wrath-gt", title: "Graph Theory (Wrath of Math)",
    short: "Graph Theory Encyclopedia", source: "Wrath of Math", track: "C", lane: "reference",
    queuePos: null, sessions: 168, stars: 4, difficulty: 3, pace: "long",
    optional: true, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "Wrath of Math Graph Theory full course playlist",
    prereqIds: [],
    prereqNote: "An encyclopedia, not a march. The app never queues it.",
    whyHere: "Dip in by topic whenever 6.006/6.046J graph lectures need backup; every session watched still earns full points.",
    stuckZones: [] },

  /* ================= ARCHIVED ================= */

  { id: "6.006-2011", title: "MIT 6.006 Introduction to Algorithms (2011, with recitations)",
    short: "6.006 (2011 archive)", source: "MIT OpenCourseWare", track: "C", lane: "archived",
    queuePos: null, sessions: 47, stars: 7, difficulty: 7, pace: "long",
    optional: true, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MIT 6.006 Introduction to Algorithms 2011 playlist",
    prereqIds: [],
    prereqNote: "Older run with recitations.",
    whyHere: "Designated alternate-explanation source when the 2020 run of 6.006 is stuck.",
    stuckZones: [] },

  { id: "cs330-alt", title: "Stanford CS330 Deep Multi-Task and Meta Learning (second saved year)",
    short: "CS330 (alt year)", source: "Stanford Online", track: "A", lane: "archived",
    queuePos: null, sessions: 17, stars: 7, difficulty: 7, pace: "short",
    optional: true, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "Stanford CS330 Deep Multi-Task Meta Learning playlist",
    prereqIds: [],
    prereqNote: "Duplicate year of CS330.",
    whyHere: "Alternate explanations for the primary CS330.",
    stuckZones: [] },

  { id: "8.04-clips", title: "MIT 8.04 Quantum Physics I (Adams, Spring 2013, clip format)",
    short: "8.04 Adams clips", source: "MIT OpenCourseWare", track: "F", lane: "archived",
    queuePos: null, sessions: 115, stars: 7, difficulty: 7, pace: "long",
    optional: true, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "MIT 8.04 Quantum Physics I Spring 2013 Adams playlist",
    prereqIds: [],
    prereqNote: "Adams 2013 in short-clip form.",
    whyHere: "The designated second-explanation source for 8.04 (Zwiebach).",
    stuckZones: [] },

  { id: "ssk-mega", title: "Leonard Susskind - Physics Lectures (194-video mega playlist)",
    short: "Susskind mega playlist", source: "Kaoru GreenEmerald", track: "F", lane: "archived",
    queuePos: null, sessions: 194, stars: 5, difficulty: 6, pace: "long",
    optional: true, added: false, verifyOnFirstOpen: false,
    playlistUrl: "", searchQuery: "Leonard Susskind physics lectures complete playlist",
    prereqIds: [],
    prereqNote: "Duplicates the individual Stanford collections already queued.",
    whyHere: "Kept as a backup index only.",
    stuckZones: [] },

  { id: "watch-later", title: "Watch Later (private playlist)",
    short: "Watch Later", source: "Private", track: "C", lane: "archived",
    queuePos: null, sessions: 18, stars: 1, difficulty: 1, pace: "short",
    optional: true, added: false, verifyOnFirstOpen: true,
    playlistUrl: "", searchQuery: "",
    prereqIds: [],
    prereqNote: "Contents unknown to the planner.",
    whyHere: "Triage anything important from it into the plan via the Add Course flow.",
    stuckZones: [] }

  ]
};
