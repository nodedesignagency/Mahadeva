/**
 * Careers page content.
 *
 * Not a CMS page — the roles live here, in the repo, and a new opening is a
 * commit. That is deliberate: the list is short, it changes a handful of times
 * a year, and every filter the section offers is *derived* from these entries
 * rather than configured, so adding a city or a department is nothing but a
 * new role object.
 *
 * As everywhere else, sections take this as typed props and hold no literal
 * strings of their own.
 */

export const careersHeroContent = {
  /** Above the heading. Sentence case, not the site's uppercase eyebrow. */
  eyebrow: "Hiring Now",

  /**
   * The page's single <h1>, one reveal block per line — the breaks are the
   * design's, not the container's, as on every other hero.
   */
  headingLines: ["Build The Future Of", "AI With Mahadeva"],

  /** Re-broken for a phone, where the first line no longer fits its column. */
  headingLinesMobile: ["Build The", "Future Of AI", "With Mahadeva"],

  /** Straight to the list rather than to another page. */
  cta: { label: "See Openings", href: "#openings" },
} as const;

export const growWithUsContent = {
  headingLines: ["Grow With Mahadeva"],

  subheading:
    "We give ambitious people the space, trust, and tools needed to build impactful work that scales globally.",

  /**
   * Seven frames, fanned. They carry no files yet, so each is a named slot —
   * `alt` is what the photograph will be, and stands as its description the
   * moment one lands.
   */
  imagePending: "Photo to come",
  photos: [
    { alt: "A strategist presenting at the window" },
    { alt: "Hands over a workflow sketched in a notebook" },
    { alt: "Two of the team at the pool table" },
    { alt: "The lounge, mid-conversation" },
    { alt: "An automation walkthrough at the whiteboard" },
    { alt: "A pairing session in the meeting room" },
    { alt: "The team together" },
  ],
} as const;

/**
 * The tint behind a benefit's mark, and the mark itself.
 *
 * The tints are the About page's `--color-principle-*` set rather than six new
 * tokens: this is visibly the same treatment — a 64px square carrying a
 * drawing — and a second set of identical colours under a second set of names
 * is how a palette starts to drift.
 */
export type BenefitTone =
  | "blue"
  | "peach"
  | "lavender"
  | "rose"
  | "green"
  | "magenta";

export type BenefitMark =
  | "laptop"
  | "crown"
  | "wellness"
  | "layers"
  | "learning"
  | "team";

export const whyJoinContent = {
  headingLines: ["Why Join Mahadeva?"],

  /**
   * Six benefits, read across then down. `mark` names the drawing rather than
   * importing it, for the same reason the About principles do: the icon set is
   * a rendering choice, and content that held components could not be moved.
   */
  benefits: [
    {
      title: "Remote-Friendly",
      body: "Work from anywhere with flexible hours.",
      tone: "blue",
      mark: "laptop",
    },
    {
      title: "High Ownership",
      body: "Take projects end-to-end with real impact.",
      tone: "peach",
      mark: "crown",
    },
    {
      title: "Wellness Support",
      body: "Health support built for long-term balance.",
      tone: "lavender",
      mark: "wellness",
    },
    {
      title: "Modern Stack",
      body: "Tools that keep teams fast and productive",
      tone: "rose",
      mark: "layers",
    },
    {
      title: "Learning Budget",
      body: "Learning support for continuous growth.",
      tone: "green",
      mark: "learning",
    },
    {
      title: "Team Work",
      body: "Collaborative culture with high standards.",
      tone: "magenta",
      mark: "team",
    },
  ] satisfies readonly {
    title: string;
    body: string;
    tone: BenefitTone;
    mark: BenefitMark;
  }[],
} as const;

export const openingsContent = {
  /** The anchor the hero's button points at. */
  id: "openings",

  headingLines: ["Current Openings"],
  subheading:
    "Join our team and work on meaningful projects that create real impact through AI and automation.",

  /**
   * The filter row. Each select's label is also its resting option, which is
   * why there is no separate "All locations" entry — an unset filter shows
   * everything, and the control reads as the category it narrows.
   */
  filters: {
    search: { label: "Search job titles", placeholder: "Search Job Title…" },
    location: "Location",
    type: "Job Type",
    department: "Department",
  },

  /** Live count above the list. The figure is the filtered length, not a constant. */
  count: {
    label: "Currently Hiring:",
    /** `{n}` is replaced with the count. One string, so the plural stays here. */
    one: "{n} Role",
    many: "{n} Roles",
  },

  empty: "No roles match those filters.",
  /** Announced with each role's arrow, which carries no words of its own. */
  applyLabel: "View role",

  /**
   * The open roles.
   *
   * `href` is per-role rather than one shared link because that is the shape
   * that survives: today every one of them goes to the contact form, and the
   * day a role gets its own page it becomes `/careers/backend-engineer` here
   * and nowhere else.
   */
  roles: [
    {
      title: "Backend Engineer",
      location: "Remote",
      type: "Full-time",
      department: "IT Department",
      experience: "3 Years",
      salary: "$130k–$180k",
      href: "/contact",
    },
    {
      title: "Frontend Engineer",
      location: "New York City",
      type: "Contract",
      department: "IT Department",
      experience: "0–1 Years",
      salary: "$20k–$35k",
      href: "/contact",
    },
    {
      title: "HR manager",
      location: "Seattle",
      type: "Full-time",
      department: "HR Department",
      experience: "5 Years",
      salary: "$130k–$180k",
      href: "/contact",
    },
    {
      title: "Performance Marketer",
      location: "Austin",
      type: "Full-time",
      department: "Marketing Department",
      experience: "3 Years",
      salary: "$200k–$250k",
      href: "/contact",
    },
    {
      title: "Product Designer",
      location: "Remote",
      type: "Full-time",
      department: "Design Department",
      experience: "2 Years",
      salary: "$90k–$130k",
      href: "/contact",
    },
    {
      title: "AI Solutions Engineer",
      location: "London",
      type: "Full-time",
      department: "IT Department",
      experience: "4 Years",
      salary: "$150k–$200k",
      href: "/contact",
    },
  ],
} as const;

/** The tinted square carrying a step's number. */
export type StepTone = "blue" | "green" | "magenta" | "peach";

export const hiringProcessContent = {
  headingLines: ["Know what to expect", "before you apply"],

  /**
   * Four steps. The numbers are not written down — the component derives
   * `01`..`04` from the order, so reordering or inserting a step cannot leave
   * a stale figure behind.
   */
  steps: [
    {
      title: "Application Review",
      body: "We carefully review every application to understand your skills, experience within the team.",
      tone: "blue",
    },
    {
      title: "Intro Conversation",
      body: "A short call to learn about you, your goals, and how you think about solving problems.",
      tone: "green",
    },
    {
      title: "Practical Assessment",
      body: "A simple task designed to understand your approach, creativity, and how you work in real scenarios.",
      tone: "magenta",
    },
    {
      title: "Final Team Chat",
      body: "Meet the team, discuss expectations, and explore how you'll contribute to building impactful work.",
      tone: "peach",
    },
  ] satisfies readonly { title: string; body: string; tone: StepTone }[],
} as const;
