/**
 * Animation configuration.
 *
 * The tunable numbers behind the two signature effects live here so they can be
 * corrected without touching component code.
 */

/** Settings for the two-bar heading wipe. Mirrors the original's prop shape. */
export type TextRevealSettings = {
  /** Colour of the first sweeping bar. */
  revealColor: string;
  /** Colour of the second sweeping bar. */
  revealColor2: string;
  /** Text colour before the reveal completes (hidden behind the bars). */
  beforeColor: string;
  /** Text colour after the reveal. */
  afterColor: string;
  /** Selection highlight background. */
  highlightColor: string;
  /** Selection highlight text colour. */
  highlightTextColor: string;
  /** Milliseconds for a single bar sweep. The full sequence runs four of these. */
  duration: number;
  /** Milliseconds held at full cover before the bars sweep back off. */
  pause: number;
  /** Milliseconds before the sequence starts. */
  delay: number;
  /** Bezier X1 — combined as cubic-bezier(easeIn, 0, easeOut, 1). */
  easeIn: number;
  /** Bezier X2. */
  easeOut: number;
  /** Which edge the bars sweep from. */
  direction: "left" | "right";
  /** Padding above and below the text that the bars extend to cover, in px. */
  overlayVerticalPadding: number;
  /** `inView` waits for the block to be scrolled to; `onAppear` plays on mount. */
  trigger: "inView" | "onAppear";
};

/**
 * Hero heading reveal — values taken from the owner's Framer inspector.
 *
 * Note the easing: the component builds `cubic-bezier(easeIn, 0, easeOut, 1)`,
 * so 0.3/0.7 gives cubic-bezier(0.3, 0, 0.7, 1) — a symmetric ease-in-out, and
 * the inverse of the component's own defaults.
 *
 * The before/after text colours are confirmed from the published CSS: fully
 * transparent white before, solid white after.
 *
 * ⚠️ `revealColor`/`revealColor2` are the Framer styles "Green 4" and
 * "Green 11". Those names are not in the published CSS, so the hex values below
 * are the closest matches in the extracted palette and are worth confirming.
 */
export const heroTextReveal: TextRevealSettings = {
  revealColor: "var(--mh-green-100)", // "Green 4" — pale green
  revealColor2: "var(--mh-ink-border)", // "Green 11" — dark green
  beforeColor: "transparent",
  afterColor: "var(--color-fg)",
  highlightColor: "var(--mh-green-100)",
  highlightTextColor: "var(--mh-ink-border)",
  duration: 620,
  pause: 25,
  delay: 40,
  easeIn: 0.3,
  easeOut: 0.7,
  direction: "left",
  overlayVerticalPadding: 0,
  trigger: "inView",
};

/**
 * Section headings.
 *
 * The same bars and timings as the hero — it is one effect used throughout, not
 * a second one that happens to look similar. What differs is that these are
 * scrolled to rather than landed on, so `trigger: "inView"` is doing real work
 * here: each block waits until it is 20% visible, then plays once and never
 * again.
 */
export const sectionTextReveal = {
  ...heroTextReveal,

  /**
   * These sections sit on the white wrappers, so the text resolves to ink.
   * Inheriting the hero's `afterColor` painted white on white and the
   * statement finished its reveal invisible.
   */
  afterColor: "var(--color-fg-on-light)",

  /**
   * From the owner's Reveal Blocks Item panel: 260ms per sweep, 25ms held at
   * full cover, no lead-in delay. Quicker per bar than the hero, which is what
   * lets a five-line statement stay one movement rather than a queue.
   *
   * The panel truncates the two bezier values, so the easing stays the hero's
   * 0.3 / 0.7 — worth confirming against Framer.
   */
  duration: 260,
  pause: 25,
  delay: 0,

  /**
   * Milliseconds each line waits behind the one above it, so a multi-line
   * statement resolves top to bottom instead of every line wiping at once.
   * Short on purpose: long enough to read as a sequence, well under the 620ms
   * of a single bar sweep so the lines still feel like one movement.
   */
  lineStagger: 180,
} as const;

/**
 * The section reveal for headings in the changing-background zone.
 *
 * These headings sit directly on the page, whose surface crossfades between
 * dark and white as sections take over — so no fixed `afterColor` can be
 * right for the heading's whole time on screen. The reveal finishes into the
 * live ink token the background transition drives, and the words re-colour in
 * step with the surface arriving underneath them.
 *
 * This replaces the original's hack of stacking an animated copy and a
 * static copy of every heading in opposite colours and trading them on
 * scroll: one element, its colour travelling with the background.
 *
 * `sectionTextReveal` (fixed ink) remains for headings on sections that keep
 * their own painted fill, like the About statement.
 */
export const sectionTextRevealDynamic = {
  ...sectionTextReveal,
  afterColor: "var(--color-fg-dynamic)",
} as const;

/**
 * The section reveal on a section that keeps its own *dark* fill.
 *
 * `sectionTextReveal` is the fixed-ink one, but its ink is the light surface's.
 * This is its opposite number, and it exists for the same reason: a section
 * that paints itself does not crossfade, so the live token is the wrong thing
 * to resolve into.
 *
 * The failure is quiet and worth knowing. The dynamic token follows whichever
 * section owns the viewport, and a dark section's pixels count at two thirds
 * in that contest — so a dark block with a taller light section under it loses
 * the moment the window is tall enough, and its heading finishes its reveal in
 * dark ink on its own dark ground. It is not dim or mistinted; it is absent,
 * on some window heights and not others.
 */
export const sectionTextRevealDark = {
  ...sectionTextReveal,
  afterColor: "var(--color-fg)",
} as const;

/**
 * The same reveal on the beige wrappers.
 *
 * One value differs: the leading bar sweeps in peach — Framer's "Orange 5",
 * which the palette already carries as `--mh-peach`. Pale green on beige is
 * two neighbouring near-whites, so the first bar all but disappears on exactly
 * the sections that are meant to show it, and the wipe reads as one dark bar
 * instead of two. The second stays "Green 11", as in the owner's panel, and
 * so do the selection colours.
 *
 * Every section that declares `data-bg="beige"` uses this.
 */
export const sectionTextRevealBeige = {
  ...sectionTextRevealDynamic,
  revealColor: "var(--mh-peach)",
} as const;

/**
 * Site-wide smooth scrolling.
 *
 * The original runs its Smooth Scroll component at intensity 10. Expressed here
 * as Lenis's `lerp` — the share of the remaining distance the page closes each
 * frame — which is the same 0-1 quantity on a different scale.
 *
 * Lower is heavier: at 0.1 the page keeps easing for a beat after the wheel
 * stops, which is the weight the original has.
 */
export const smoothScroll = {
  lerp: 0.1,
} as const;

/**
 * The hero's contents.
 *
 * Scroll Speed 120% on the whole section: as the stack scrolls, the hero's
 * heading and buttons creep upward instead of sitting rigid while About slides
 * over them. Subtle by design — 20% against the mark's 30%.
 *
 * Tracked against the stack rather than the hero itself. The hero is pinned, so
 * its own measured position never changes and a drift keyed to it would sit
 * still for exactly the stretch it is meant to move.
 */
export const heroParallax = {
  /** Per the Framer panel. The climb below is derived from it. */
  speed: 1.2,
  /** Total climb across the stack, as a share of the hero content's height. */
  drift: "146%",
} as const;

/**
 * The About section's 3D mark.
 *
 * Framer drives this with Scroll Speed at 130%: the mark travels 1.3x the page,
 * so it climbs past the statement above it instead of sitting still under it.
 *
 * Converted to a total climb, which is what a scroll-linked transform needs.
 * Outrunning the page by 30% across a traverse of one viewport plus the
 * section's height — 900 + 1100 here — comes to 600px, and the mark is 467
 * tall, so 600/467 is a shade over 128%.
 *
 * That lands where the original does: the mark rests 220px below the statement,
 * so by the time the section is centred it has climbed ~300px and overlaps the
 * last lines by ~80px, with the whole statement still on screen.
 *
 * Measured against the section rather than the mark, since the mark hangs far
 * below its section and its own box would enter the viewport far too late.
 */
/**
 * A team portrait, and what is behind it.
 *
 * The picture is cut into three standing strips, each a window onto the same
 * photograph at a different constraint — left, middle, right — so together
 * they read as one image. On hover each slides up out of the card, and because
 * they leave one after another the picture peels away in a stagger rather than
 * lifting as a slab. The bio underneath is uncovered as they go.
 *
 * Leaving reverses it, right strip first, so the picture closes the way it
 * opened rather than snapping back.
 */
export const teamCard = {
  /**
   * Milliseconds for one strip's travel, on `--ease-out` — a curve that only
   * decelerates. The picture is a big thing to move and the eye follows it the
   * whole way, so it wants to arrive rather than to stop.
   */
  slide: 760,

  /**
   * Milliseconds between one strip leaving and the next. Wide enough to read
   * as three separate departures and not as one edge going ragged.
   */
  stagger: 100,

  /** The name over the foot of the picture. */
  name: {
    /** Out as the card is entered: quick, it is not what anyone is watching. */
    out: 200,
    /** And back in, over this. */
    in: 300,
    /**
     * After this wait — the length of the strips' return, so the name arrives
     * behind the picture rather than racing it home. Snapping back the instant
     * the pointer left was the thing that read as cheap.
     */
    back: 720,
  },
} as const;

/**
 * The About page's mission card — three variants stepped through by scroll.
 *
 * The card is pinned in the middle of the screen and opens from its own
 * centreline, the two halves of a mask parting. It opens as the section is
 * arriving, so the reader meets a card that is already there rather than one
 * that appears; at each step it closes on the centreline, swaps its words and
 * its fill while it is shut, and opens again.
 *
 * `hold` is the scroll each variant is given, as a share of the viewport. It
 * is the one number to change to make the sequence longer or shorter: the
 * section's height is derived from it, so the pin lasts exactly as long as the
 * three variants need and not a pixel more.
 */
export const missionCards = {
  /**
   * The owner's schedule, in viewport heights of scroll. The first card is
   * given a long hold, then a stretch where nothing happens at all, and the
   * cards after it change on a shorter beat.
   *
   * The section's height is derived from these three, so the pin lasts exactly
   * as long as the sequence needs: `100vh` for the frame itself, plus the
   * whole schedule.
   */
  first: 100,
  spacer: 25,
  step: 75,

  /**
   * The opening move, in seconds. It plays once, on its own clock, when the
   * section first shows a sliver — it is a variant change, not something the
   * scroll drives. Scrubbed against the scroll instead, the card sat half
   * open at whatever position the page happened to be at.
   */
  open: { delay: 0.2, duration: 0.7 },

  /**
   * Milliseconds for one card's words and fill to give way to the next. The
   * mask is not involved: it plays on arrival and the card stays open from
   * there, so a step is a change of content inside a card that never moves.
   */
  swap: 250,

  /**
   * The heading's scramble, faster than the site's default pace.
   *
   * The footer's labels play once as the page is read; this one has to land
   * inside a swap, and at the default 90ms a two-word heading spent over a
   * second and a half resolving — long enough that the reader had moved on
   * before it finished saying the card had changed.
   */
  scramble: { tick: 45 },
} as const;

export const markParallax = {
  /** Per the Framer panel. The climb below is derived from it. */
  speed: 1.3,
  /** Total climb over a full traverse, as a share of the mark's height. */
  drift: "128%",
} as const;

/**
 * The careers page's photo fan, assembling itself.
 *
 * A port of the owner's `Image Animation` component, which is four variants
 * stepped through on appear:
 *
 *   Out         the frames are not there
 *   In          all seven land in one square, stacked on top of one another
 *   Scale Down  the pile shrinks
 *   Expand      the frames spread out into the arc
 *
 * The third beat is the point of the whole thing. A stack that simply opens
 * reads as a transition; a stack that draws breath first and *then* opens
 * reads as a gesture, and the shrink is that breath.
 *
 * ── The geometry ───────────────────────────────────────────────────────────
 *
 * The frames are 184x184 and Fixed in the Framer file, and they stay 184 at
 * every width — the fan is one object of a fixed size that the section simply
 * clips as the window narrows, rather than an arrangement that reflows. On a
 * phone that means the outermost frames are cut off by the window's edges,
 * which is the owner's design and not an overflow to be solved.
 *
 * 184 is not arbitrary. The content row at the design width is 1104, and
 * 1104/6 is exactly 184: seven frames at a sixth of the row, each lapping the
 * one before it by a sixth of its own width, span the row to the pixel. So the
 * fan is 1104 wide, centred, and lines up with the column of text above and
 * below it at the width the design was drawn at.
 */
export const photoFan = {
  /** A frame's side, in px. Fixed, as in the file. */
  card: 184,

  /** How much of a frame the next one covers, in px — a sixth of it. */
  overlap: 184 / 6,

  /**
   * How far apart two frames sit, as a share of one frame's own width. The
   * distance each frame travels to reach the middle of the pile is this times
   * how many places it is from the middle.
   *
   * A share rather than the 153.33px it works out to, because a percentage
   * `translate` resolves against the element's own box: changing `card` alone
   * then keeps the pile centred instead of leaving this to be recalculated.
   */
  advance: 500 / 6,

  /**
   * The arc, left to right: how far each frame is turned and how far it hangs
   * below the middle one. The drop is a share of the frame's own height rather
   * than a pixel figure, so the arc keeps its shape as the frames narrow.
   *
   * Small on purpose. At ±9 degrees the row read as a hand of cards being
   * dealt; the design is a set of prints laid down slightly askew.
   */
  arc: [
    { rotate: -7, drop: 10 },
    { rotate: -5, drop: 4.5 },
    { rotate: -3, drop: 1.5 },
    { rotate: 0, drop: 0 },
    { rotate: 3, drop: 1.5 },
    { rotate: 5, drop: 4.5 },
    { rotate: 7, drop: 10 },
  ],

  /**
   * ── What actually moves ───────────────────────────────────────────────────
   *
   * The turn and the scale belong to the *container*, not to the frames. The
   * pile is one object that rises, unwinds and settles; the frames inside it
   * only ever change position — piled, then fanned — and each keeps its own
   * angle from the arc above throughout. That is what gives the pile its
   * edges: seven frames at the same spot but at seven slightly different
   * angles read as a stack of prints rather than as one photograph.
   *
   * Turning the container is only equivalent to turning the pile because the
   * pile sits on the middle frame, and the middle frame's centre is the row's
   * centre. By the time the frames leave that spot the container is back at
   * zero, so the two never fight.
   *
   * Nothing fades. The entrance is the rise.
   */

  /** How far below its place the pile starts, in px. Absolute, in the file. */
  lift: 1200,

  /** The container's turn at each state, in degrees. */
  rotate: { out: -40, piled: -14, settled: 0 },

  /** And its scale: held oversized until the pile settles. */
  scale: { piled: 1.2, settled: 1 },

  /**
   * ── The sequence ─────────────────────────────────────────────────────────
   *
   * `delay` is the trigger — Appear for the first, After Delay for the rest,
   * each counted from the moment the state before it was entered. `duration`
   * is that state's own transition time.
   *
   *   0.0s  out → piled     0.4s   rises 1200 and unwinds -40 to -14
   *   0.4s  piled → settled 1.0s   -14 to 0, and 1.2 down to 1
   *   0.8s  settled → open  1.0s   the frames spread
   *
   * The delays are shorter than the durations, and that is the point rather
   * than an oversight. The rise lands exactly as the settle begins, and the
   * frames start spreading while the container is still settling — they are
   * different elements, so the two overlap instead of interrupting, and the
   * whole thing reads as one gesture rather than three.
   *
   * No stagger. All seven frames are one container with one transition in the
   * owner's file, so they move together.
   */
  steps: {
    piled: { delay: 0, duration: 400 },
    settled: { delay: 400, duration: 1000 },
    open: { delay: 400, duration: 1000 },
  },
} as const;

/**
 * Feature strip marquee.
 *
 * Expressed as a rate rather than a duration on purpose: the row renders the
 * card set twice and slides by one copy, so a fixed duration would silently
 * speed the row up every time a card is added. Deriving the duration from this
 * keeps the travel constant however many cards there are.
 */
export const featureMarquee = {
  /** Pixels per second the row travels, leftwards. Half the original's rate. */
  speed: 50,
} as const;

/**
 * Trust statistics count-up, mirroring the original's NumberCounter props.
 *
 * Every figure climbs from the same start number to its own end number when
 * the section is scrolled to — Replay off, Loop off, so each one runs once.
 * The original expresses pace as a "Number Speed"; here it is a duration, so
 * the whole row lands together regardless of how far each figure has to
 * travel, which is what the design shows.
 */
export const statCounter = {
  /** The Framer component's Start Number. */
  start: 1,
  /** Milliseconds from start to end number. */
  duration: 1800,
} as const;

/**
 * The closing panel's pixel fringe — ten rectangles, to the owner's numbers.
 *
 * Two variants in the original, scrolled between: the second is the panel
 * nearly bare, the first is the fringe fully out. Every offset is measured
 * from the panel's own box.
 *
 * `fixed` are bites of the page's dark taken out of the panel and never move.
 * The other seven are the panel's own green and only exist outside it: they
 * begin flush with an edge — where, being the same colour, they cannot be seen
 * — and grow or slide clear of it as the panel is scrolled to.
 */
export const ctaFringe = {
  fixed: [
    { w: 24, h: 24, top: 0, left: 24 },
    { w: 40, h: 10, bottom: 0, right: 64 },
    { w: 24, h: 10, bottom: 0, right: 0 },
  ],

  /** Above the head: one widens from nothing, three scale up from a tenth. */
  grown: [
    { w: 40, h: 12, top: -12, right: 0, grow: "width" },
    { w: 12, h: 12, top: -24, right: 40, grow: "scale" },
    { w: 24, h: 24, top: -24, left: 0, grow: "scale" },
    { w: 24, h: 24, top: -48, left: 24, grow: "scale" },
  ],

  /** Below the foot: each slides down out of the panel by its own distance. */
  dropped: [
    { w: 92, h: 40, bottom: 0, left: 40, drop: 40 },
    { w: 40, h: 40, bottom: 0, left: 172, drop: 40 },
    { w: 40, h: 40, bottom: 0, left: 132, drop: 80 },
  ],

  /** The scale the three scaling cells wait at. */
  restScale: 0.1,
} as const;

/**
 * Scramble-appear, from the owner's Framer University component.
 *
 * The text arrives from the left: a cursor walks the string, everything behind
 * it settled, a short run ahead of it churning through the character pool, and
 * everything beyond that not yet arrived. Colours are the component's own —
 * "Green 4" once settled, "Green 8" while churning.
 *
 * Framer expresses pace as a percentage; here it is the milliseconds a single
 * character takes, which is the thing actually being set.
 */
export const textScramble = {
  characters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?~",
  /** Characters churning ahead of the cursor at any moment. */
  letters: 6,
  /**
   * Milliseconds per character. Framer states this as a percentage of a pace
   * it does not show; twice the first reading is what matches the original,
   * which plays slower than the number suggested.
   */
  tick: 90,
  /** Milliseconds after the text comes into view. */
  delay: 200,
} as const;

/**
 * Before vs After.
 *
 * The three words are pinned and scroll-transformed: the outer two travel to
 * either side while all three fade. Values are the owner's, in px, and run
 * over the panel's own pin — from the cards panel entering the viewport to it
 * reaching the top, which is exactly the distance the words stay pinned.
 *
 * The rectangles on the light card follow the section's habit: they arrive
 * when the cards do, from outside the edge each settles against.
 */
export const beforeAfter = {
  /** How far "Before" travels left and "After" right, in px. */
  spread: 600,

  rects: [
    { w: "16%", h: "13%", left: 0, top: 0, dx: "-100%", dy: 0 },
    { w: "18%", h: "4%", right: 0, top: 0, dx: "100%", dy: 0 },
    { w: "5%", h: "18%", right: 0, top: "43%", dx: "100%", dy: 0 },
  ],
  /** Milliseconds for those rectangles. */
  reveal: 700,
  revealDelay: 150,
} as const;

/**
 * Testimonial carousel.
 *
 * The card has the two states the owner's Framer file has: bare, and with the
 * rectangles in. A card plays the second when it takes the centre — the first
 * one as the section is scrolled to, each later one as the arrow brings it
 * across — so the effect belongs to arriving rather than to hovering.
 *
 * Rectangles are in percentages of the card, which is 1120x516 in the file but
 * has to hold its arrangement as it narrows. Each waits outside the edge it
 * settles against; see `lib/hoverRect`.
 */
export const testimonialCarousel = {
  /** Milliseconds for one card to slide across. */
  slide: 700,
  /** Milliseconds for the rectangles, held back until the slide is over. */
  reveal: 700,
  /** Milliseconds before the rectangles start. */
  revealDelay: 150,

  rects: [
    { w: "18.6%", h: "6.4%", left: 0, top: 0, dx: "-100%", dy: 0 },
    { w: "17.6%", h: "25.3%", right: 0, top: 0, dx: "100%", dy: 0 },
    { w: "18.4%", h: "7%", right: 0, bottom: 0, dx: "100%", dy: 0 },
  ],
} as const;

/**
 * Tech stack tile hover.
 *
 * Three things move together: a checkerboard closes in on the tile's head and
 * foot, the mark settles from oversized to its true size, and the name fades
 * up under it.
 *
 * The board is given in tenths of the tile rather than pixels — the tiles are
 * squares that change size across breakpoints, and a cell has to stay square
 * with them. `cells` lists the filled ones as [row, column]; the arrangement
 * is the same at both ends, turned through half a turn, which is what makes
 * the two bands read as one pattern interrupted by the middle rather than as
 * two decorations.
 */
export const toolHover = {
  /** Shared with the other two hovers: bezier 0.8, 0, 0.2, 1 over 0.7s. */
  duration: 700,

  /** The mark waits at this scale inside its fixed 56px box. */
  markRestScale: 1.4,

  /**
   * How far the mark rises on hover, in px, to make room for the name.
   *
   * The name is out of the tile's flow — hung below the mark rather than
   * stacked under it — so that at rest the mark sits dead centre. Reserving
   * space for a name nobody can see puts the mark visibly high in the tile.
   */
  markRise: 28,

  /** Cells across and down, so one cell is a tenth of the tile. */
  grid: 10,

  cells: [
    [0, 0],
    [0, 2],
    [0, 7],
    [0, 9],
    [1, 1],
    [1, 3],
    [1, 6],
    [1, 8],
    [8, 1],
    [8, 3],
    [8, 6],
    [8, 8],
    [9, 0],
    [9, 2],
    [9, 7],
    [9, 9],
  ],
} as const;

/**
 * Trust statistic hover.
 *
 * The same gesture as the case study cards — blocks in a deeper step of the
 * panel's own pastel slide in from outside and sit flush against its edges —
 * but each of the four panels has its own arrangement, so the row does not
 * read as one effect applied four times.
 *
 * Rectangles are given at their hovered position with `dx`/`dy` back to where
 * they wait; see `lib/hoverRect`. Sizes and offsets are the owner's, in the
 * pixels of a panel roughly 300 wide. Each block is anchored to the edges it
 * settles against, so the arrangement holds as the panel changes width.
 */
export const statHover = {
  /** Shared with the case cards: bezier 0.8, 0, 0.2, 1 over 0.7s. */
  duration: 700,

  rects: {
    /** Corner to corner: a square into the top right, a bar into the foot. */
    peach: [
      { w: 70, h: 70, right: 0, top: 0, dx: 70, dy: -70 },
      { w: 140, h: 70, left: 0, bottom: 0, dx: -140, dy: 70 },
    ],
    /** Three edges at once — left, foot, and the corner between them. */
    green: [
      { w: 30, h: 80, left: 0, top: "calc(50% - 40px)", dx: -60, dy: 0 },
      { w: 112, h: 30, left: "calc(50% - 56px)", bottom: 0, dx: 0, dy: 60 },
      { w: 30, h: 30, right: 0, bottom: 0, dx: 60, dy: 0 },
    ],
    /**
     * One stepped trio rising into the foot at the right, and the same three
     * turned through half a turn to drop into the head at the left — the
     * middle square inset from its corner either way.
     */
    blue: [
      { w: 30, h: 30, left: 0, top: 0, dx: 0, dy: -60 },
      { w: 30, h: 30, left: 30, top: 30, dx: 0, dy: -90 },
      { w: 30, h: 30, left: 60, top: 0, dx: 0, dy: -60 },
      { w: 30, h: 30, right: 60, bottom: 0, dx: 0, dy: 60 },
      { w: 30, h: 30, right: 30, bottom: 30, dx: 0, dy: 90 },
      { w: 30, h: 30, right: 0, bottom: 0, dx: 0, dy: 60 },
    ],
    /**
     * The heaviest of the four: two tall blocks close over the head from
     * above, and a bar runs out from behind the left one, under the figure.
     */
    magenta: [
      { w: 50, h: 120, left: 0, top: 0, dx: 0, dy: -120 },
      { w: 85, h: 120, right: 0, top: 0, dx: 0, dy: -120 },
      // Anchored to both blocks rather than given a width: it has to meet the
      // right-hand one exactly, and the panel's width is not fixed. Which is
      // also why it waits at its own width plus its left offset — a pixel
      // figure could not clear an edge that moves.
      { h: 40, left: 50, right: 85, top: 120, dx: "calc(-100% - 50px)", dy: 0 },
    ],
  },
} as const;

/**
 * Button hover sweep.
 *
 * The original button is four stacked rectangles parked off the left edge,
 * clipped by the button. On hover they slide in one after another and together
 * form a solid accent fill; on leave they slide back out. The stagger is what
 * makes it read as a sweep rather than a fill.
 *
 * From the owner's Framer file:
 *
 *  - Four rectangles, each 11px tall in a 44px button — quarters, so they are
 *    expressed here as percentages and survive a resized or full-width button.
 *  - Resting X positions -270, -370, -470, -570 against a 267px-wide button.
 *    Stored as the overhang *past* the button's own width, so the offsets hold
 *    at any width: on mobile the button is full-bleed and a literal -270 would
 *    leave a sliver of the first bar on screen.
 *  - Delays step by 0.05s, and reverse on leave: entering, the bottom bar leads
 *    and the fill builds upward; leaving, the top bar goes first.
 *  - Transition: physics spring, mass 1, stiffness 300, damping 100.
 *
 * That spring has a damping ratio of 2.89 — overdamped, so it never overshoots
 * and its exact solution is a sum of two decaying exponentials. `--ease-button-
 * spring` in theme.css is that solution sampled as a CSS `linear()` easing,
 * which is why this is plain CSS and the button stays a server component. See
 * the note there before changing `duration`: the two are a matched pair.
 */
export const buttonSweep = {
  /**
   * Milliseconds for one bar's travel — the spring's settle time.
   *
   * The easing in theme.css is the spring's shape normalised across this
   * duration, so changing this number stretches the same spring in time rather
   * than distorting it: the result is exactly a softer spring of identical
   * damping ratio. At 2500 that is stiffness 192 / damping 80, against the
   * 300 / 100 the Framer file specifies — the same curve, 25% slower, because
   * the original read as hurried on screen. 90% of the travel now lands at
   * 943ms rather than 754ms.
   *
   * Only a change to the curve's *shape* needs the easing regenerated.
   */
  duration: 2500,

  /**
   * Top bar first. `overhang` is added to the button's own width to park the
   * bar off the left edge; at the original's 267px that reproduces Framer's
   * -270/-370/-470/-570 exactly.
   *
   * The delays step by 75ms rather than Framer's 50ms. At 50ms against a
   * ~950ms travel the four bars overlapped enough to arrive as one mass; the
   * wider step lets them read as four, which is the point of staggering them.
   */
  bars: [
    { overhang: 3, delayIn: 300, delayOut: 75 },
    { overhang: 103, delayIn: 225, delayOut: 150 },
    { overhang: 203, delayIn: 150, delayOut: 225 },
    { overhang: 303, delayIn: 75, delayOut: 300 },
  ],

  /**
   * The secondary button's label flips from light to dark as the accent
   * arrives underneath it. Framer handles this as part of the variant change;
   * these delays are ours, timed so the label turns once the sweep has reached
   * the middle of the button rather than before it.
   */
  label: { duration: 310, delayIn: 250, delayOut: 190 },
} as const;

/**
 * Mobile / tablet navigation overlay.
 *
 * Two animations run when the panel opens. The links travel in from the left
 * on the same spring as the button sweep — the Framer file specifies stiffness
 * 300, damping 100, mass 1 for both — and the hairline between each pair of
 * links draws itself left to right.
 *
 * Both are CSS: the links get `--ease-button-spring` (see the note in
 * theme.css — that easing *is* this spring), the rules get their own bezier.
 * Only the open/closed state is React's.
 */
export const mobileNav = {
  /**
   * Milliseconds for one link's travel. The spring's own settle time at the
   * specified constants, so the links move at the physics the file asks for
   * rather than the deliberately slackened 2500ms the buttons use. It is
   * overdamped, so this reads much faster than the number suggests: 90% of the
   * distance is covered in the first 830ms and the rest is sub-pixel.
   */
  linkDuration: 2000,

  /** Framer's per-link delay step, applied top to bottom. */
  linkStagger: 50,

  /**
   * Where each link starts, in pixels left of its resting place: -130 for the
   * first, stepping 10 further out down the list. Taken from the Framer file.
   *
   * The staggered delay alone was not enough to read as one-by-one — every
   * link covered the same distance, so they moved as a block that happened to
   * start at slightly different moments. Giving the lower ones further to
   * travel spreads out their *arrivals*, which is the part the eye follows.
   */
  linkOffsetStart: -130,
  linkOffsetStep: -10,

  /**
   * How long the header takes to grow from its closed height to the full
   * viewport. This is the whole "opening" gesture — there is no separate
   * panel sliding or fading in over the page, the strip itself becomes the
   * screen. It is also why the hero heading is still visible partway through
   * the owner's recording: the header simply has not reached it yet.
   *
   * 1s on bezier 0.8, 0, 0.2, 1, from the owner's transition panel. Long, but
   * that curve spends most of it barely moving at either end and crosses the
   * screen in the middle third, so it reads as a fast sweep with a soft start
   * and a soft landing rather than a slow one.
   */
  openDuration: 1000,

  /**
   * The hairline between links, from the owner's BorderReveal component: a
   * 1px rule whose width goes 0 to 100%, custom bezier, 1s, 200ms delay. Every
   * rule uses the same delay — the component triggers on visibility, and they
   * all become visible in the same frame — so they draw together beneath the
   * links arriving above them.
   *
   * They do not un-draw. Closing the panel in the recording clears every rule
   * at once while the links are still walking out, so the exit is its own much
   * shorter fade rather than the entrance run backwards.
   */
  rule: { duration: 1000, delay: 200, exitDuration: 150 },
} as const;

/**
 * Case study card hover.
 *
 * Blocks slide in from the four edges and sit over the card while the pointer
 * is on it, then retreat. Each one enters from the edge it is parked against,
 * so the card looks assembled from its own border rather than sprinkled.
 *
 * `edge` is where it comes from and which side it hugs. `x`/`y` place it along
 * that side, `w`/`h` size it — all percentages of the artwork half they live
 * in, so the arrangement holds at every width instead of drifting as the card
 * grows.
 *
 * Delays are deliberately uneven. An even stagger reads as a mechanical sweep;
 * clustering two or three arrivals and leaving a gap reads as scatter.
 */
export const caseHover = {
  /** From the owner's transition panel: bezier 0.8, 0, 0.2, 1 over 0.7s. */
  duration: 700,

  /** The cover image grows behind the blocks. */
  imageScale: 1.05,

  /**
   * The artwork half is 560x552 in the Framer file, and the rectangles are
   * placed in its pixels. Kept as pixels rather than converted to percentages:
   * this is a fixed arrangement in the original, and the reference is used
   * only for the half's aspect ratio.
   */
  reference: { width: 560, height: 552 },

  /**
   * The seven rectangles, from the owner's Framer layers.
   *
   * Each is given at its *hovered* position — the edges it is anchored to and
   * the offsets from them — plus `dx`/`dy`, how far from there it waits at
   * rest. Written that way because it is what the browser animates: the
   * element is laid out where it ends up, and `translate` carries it to and
   * from the outside. Animating `left`/`top` would relayout every frame.
   *
   * The three at the top left arrive from the left, the tall one at the top
   * right drops from above, and the three along the bottom rise from below.
   */
  rects: [
    { w: 92, h: 92, left: 0, top: 0, dx: -100, dy: 0 },
    { w: 40, h: 40, left: 92, top: 92, dx: -192, dy: 0 },
    { w: 92, h: 40, left: 0, top: 132, dx: -100, dy: 0 },
    { w: 32, h: 140, right: 0, top: 0, dx: 0, dy: -160 },
    { w: 40, h: 40, left: 0, bottom: 0, dx: 0, dy: 100 },
    { w: 40, h: 40, left: 40, bottom: 40, dx: 0, dy: 220 },
    { w: 40, h: 40, left: 80, bottom: 0, dx: 0, dy: 100 },
  ],
} as const;

/**
 * The page transition — three cards that wipe the screen between routes.
 *
 * A port of the owner's `StackedCardsTransition`. Leaving a page, the cards
 * cross in from the right one after another until the screen is covered;
 * arriving, they carry on past the left edge in the order they landed, so the
 * two halves read as one pass rather than a cover and an uncover.
 *
 * The reversal is the whole effect. The last card in is the first card out, so
 * the stack is peeled in the order it was laid — run the same order twice and
 * it reads as a curtain dropped and then dropped again.
 *
 * Colours are the site's three accents. That is not decoration: the wipe is the
 * only thing on screen for half a second, and three colours from anywhere else
 * would be the one moment the site looked like a different site.
 */
export const pageWipe = {
  /** Milliseconds for one card's travel, on the owner's curve. */
  duration: 400,

  /** Milliseconds between one card leaving and the next. */
  stagger: 40,

  /**
   * Milliseconds the covered screen is held before it opens again.
   *
   * Not a flourish. The new page's first paint happens somewhere in here, and
   * the hold is what keeps that paint behind the cards instead of showing
   * through the gap between the two animations.
   */
  hold: 160,

  /** Cards, so `stagger` can be multiplied without a magic number. */
  cards: 3,
} as const;

/**
 * Blog card hover.
 *
 * The case cards' gesture on a smaller object: blocks in the card's own tint
 * slide in from the edges and sit over the photograph while the pointer is on
 * it, then retreat. Same curve, same duration, same growing image behind them.
 *
 * Its own rectangles rather than a reuse of `caseHover.rects`: those are the
 * arrangement for a 560-wide frame, and a blog card's picture is barely half
 * that.
 *
 * Every number below is the owner's, in the pixels of a card at the design
 * width — where a three-across grid gives each card about 355. Kept as pixels
 * rather than converted to shares of the picture, because the grid's card is
 * within a whisker of that at every breakpoint it has: 346 on a phone, 405 on
 * a tablet, 355 on a desktop. A percentage would be a conversion that buys
 * nothing and loses the ability to check these against the file.
 */
export const postHover = {
  /** Shared with the case cards: bezier 0.8, 0, 0.2, 1 over 0.7s. */
  duration: 700,

  /** The picture grows behind the blocks. */
  imageScale: 1.05,

  /**
   * Each rectangle is given at its *hovered* position — the edges it is
   * anchored to and the offsets from them — with `dx`/`dy` back to where it
   * waits. See lib/hoverRect for why that way round.
   *
   * The first three are one run along the top right rather than a scatter:
   * 133, 37 and 0 from the right edge, so they meet exactly, and the middle
   * one rests a row lower than its neighbours. That offset is the whole shape
   * — three blocks landing flush would be a bar, and it is the step down and
   * back up that reads as blocks.
   *
   * They also fall different distances, 40 / 80 / 40, so the run assembles
   * rather than arriving as one piece.
   */
  rects: [
    { w: 37, h: 32, top: 0, right: 0, dx: 0, dy: -40 },
    { w: 96, h: 32, top: 32, right: 37, dx: 0, dy: -80 },
    { w: 96, h: 32, top: 0, right: 133, dx: 0, dy: -40 },
    /**
     * A tall bar into the left edge, and a square rising into the foot beside
     * it. The bar's foot rests exactly on the square's head, and its right
     * edge on the square's left — the two meet at a corner, which is the shape
     * the file draws.
     *
     * The file calls the bar centred, and at the design's picture height it
     * is: solve (H + 140)/2 = H − 103 and H is 346, which is what a 359 card
     * gives at this picture's proportion. But the grid hands a card 346, 359
     * or 405 depending on the breakpoint, and a centred bar only lands on the
     * square at one of those — at 405 it stops 22px short and the join opens.
     *
     * So the bar is anchored to the square instead. At the design height that
     * is the same position to a third of a pixel; everywhere else it is the
     * one that keeps them together.
     */
    { w: 32, h: 140, left: 0, bottom: 103, dx: -40, dy: 0 },
    { w: 103, h: 103, left: 32, bottom: 0, dx: 0, dy: 110 },
  ],

  /**
   * The arrow, which belongs to the hover and not to the card: the owner's
   * base variant carries no affordance of its own. It waits off the right
   * edge and arrives with the blocks, in the card's own tint — so it is one of
   * them that happens to hold a mark, which is why it takes their class rather
   * than carrying a second set of rules.
   */
  arrow: { size: 48, from: "100% 0" },
} as const;

/**
 * Background bar-pattern field.
 *
 * The original is not a continuous loop of bars growing from zero. It is a set
 * of discrete Framer variants ("Animation State 1..N"), each holding a fixed
 * arrangement, with Framer morphing between them. Reproduced here as: a fixed
 * set of bars whose heights change per state, animated with a spring.
 *
 * Confirmed by the owner: only height changes between states — bars keep their
 * horizontal position and width throughout.
 */
export const patternField = {
  /**
   * Arrangements cycled through, matching Framer's Animation State 1..5.
   *
   * Each participating cell appears in exactly one of these, so a bar is on
   * screen for a single beat and the field turns over continuously rather than
   * holding an arrangement long enough to read as static.
   */
  stateCount: 5,

  /**
   * Milliseconds each state is held before switching. From the owner's Framer
   * trigger: On Appear → Delay 2.4s → Set Variant.
   */
  stateInterval: 2400,

  /**
   * Open and close share one symmetric ease, so a cell collapses exactly as it
   * grew.
   *
   * Deliberately not a spring: a spring approaches its target asymptotically,
   * so `scaleY` crawls through the last fraction and leaves a hairline before
   * vanishing. A bezier lands on zero cleanly. Same 0.3/0.7 pair as the text
   * reveal.
   *
   * Kept well under `stateInterval` so a cell finishes moving and visibly rests
   * before the next state — at 2s it was still animating when the next tick
   * arrived, leaving the field permanently in motion.
   */
  transition: { duration: 1.1, ease: [0.3, 0, 0.7, 1] },

  /**
   * Maximum milliseconds a cell's start is offset by, so cells ripple rather
   * than flipping in lockstep. Set to 0 for a synchronised flip.
   */
  maxStagger: 260,

  /**
   * The field is a set of flush tracks, each holding a run of cells. Which way
   * round depends on the breakpoint:
   *
   *  - From tablet up, tracks are vertical columns down the left and right
   *    edges — the `1st`..`7th` groups in the Framer component — and bars grow
   *    up or down within their slot.
   *  - On mobile the whole arrangement turns ninety degrees: tracks are
   *    horizontal rows in a band across the top and bottom, and bars grow left
   *    or right. There is no room for a side field on a narrow screen.
   *
   * The generator is axis-agnostic; only these numbers and the rendering differ by
   * orientation.
   */
  vertical: {
    /** Columns per field. */
    tracks: 7,
    /** Cells stacked inside each column, sampled per column. */
    cellsPerTrack: { min: 5, max: 7 },
    /**
     * Relative column widths, sampled per column. Read as ratios, not pixels:
     * the field is a percentage of the viewport and divides itself between its
     * columns in these proportions, so they narrow with the screen. At a
     * desktop width they land within a few pixels of these numbers, which is
     * where they came from.
     */
    thickness: [26, 34, 48, 70],
  },

  horizontal: {
    /** Rows per band. */
    tracks: 3,
    /** Cells laid along each row, sampled per row. */
    cellsPerTrack: { min: 4, max: 6 },
    /** Row heights in px, sampled per row. */
    thickness: [30, 34, 38],
  },

  /**
   * Relative height weight of a cell, so slots within a column differ. The
   * reference shows cells ranging from roughly 7% to 27% of the field height,
   * so the spread is wide.
   */
  minCellWeight: 0.5,
  maxCellWeight: 2.2,

  /**
   * How full a cell's bar is when open, as a fraction of the cell. Kept near 1:
   * in the reference a bar fills its slot, and slot heights supply the variety.
   */
  minTarget: 0.82,
  maxTarget: 1,

  /**
   * Chance a cell takes part at all. Every participating cell is then given one
   * state to appear in, and the spacing rules reject a good share, so the count
   * that reaches the screen is far lower — tune against the rendered figure,
   * not this number. At 1 the field sits around eight bars a side, matching the
   * reference; lower it to thin the field out.
   */
  showProbability: 1,

  /**
   * Minimum vertical gap between two open cells in neighbouring columns, as a
   * fraction of the field height. Zero would let bars sit edge to edge and read
   * as one block; a little space keeps each bar its own shape.
   */
  minGap: 0.03,

  /**
   * Fixed PRNG seeds. These MUST stay constant — the field is generated during
   * render on both server and client, so a time- or Math.random-based source
   * would produce different markup on each side and cause a hydration error.
   */
  seeds: {
    left: 20260730,
    right: 19880413,
    top: 40213377,
    bottom: 91827364,
    /** The two single rows the page closes on, above and below the wordmark. */
    footerTop: 27182818,
    footerBottom: 16180339,
  },
} as const;
