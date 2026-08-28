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

/** Which photograph a frame of the fan holds. See `GrowWithUs`. */
export type FanPhoto =
  | "strategist"
  | "notebook"
  | "pool"
  | "lounge"
  | "whiteboard"
  | "meeting"
  | "team";

export const growWithUsContent = {
  headingLines: ["Grow With Mahadeva"],

  subheading:
    "We give ambitious people the space, trust, and tools needed to build impactful work that scales globally.",

  /**
   * Seven frames, fanned, left to right.
   *
   * `photo` names the picture and the section imports it, the same division
   * the About team cards and the principles make: a file in content could not
   * be moved, and the content should not have to know where the file lives.
   *
   * `imagePending` is what a frame says before its picture arrives. Every one
   * of the seven has one now, so nothing renders it — it stays because a
   * frame added tomorrow will need it before its photograph is taken.
   */
  imagePending: "Photo to come",
  photos: [
    { photo: "strategist", alt: "A strategist presenting at the window" },
    { photo: "notebook", alt: "Hands over a workflow sketched in a notebook" },
    { photo: "pool", alt: "The team around the pool table" },
    { photo: "lounge", alt: "The lounge, mid-conversation" },
    { photo: "whiteboard", alt: "An automation walkthrough at the whiteboard" },
    { photo: "meeting", alt: "A walkthrough on the meeting room screens" },
    { photo: "team", alt: "The team together" },
  ] satisfies readonly { photo: FanPhoto; alt: string }[],
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
   * `slug` is the role's page, and the list links to it rather than carrying
   * an `href`: two fields that must agree is one field too many, and a slug
   * that does not match a page is a 404 the type system can be made to catch.
   *
   * Everything from `about` down belongs to the role's own page. The list
   * above it reads none of it — but it lives here rather than in a second file
   * because it is the same role, and a role opened in two places is a role
   * that gets closed in one.
   */
  roles: [
    {
      slug: "backend-engineer",
      title: "Backend Engineer",
      location: "Remote",
      type: "Full-time",
      department: "IT Department",
      experience: "3 Years",
      salary: "$130k–$180k",
      about:
        "As a Backend Engineer at Mahadeva AI, you'll build the core systems that power agent execution, memory, and integrations. You'll work on APIs, data pipelines, and reliability layers that keep workflows stable in production. This role is ideal for someone who enjoys shipping scalable backend systems with real-world impact.",
      responsibilities: [
        "Build backend architecture for workflows, execution, and agent memory.",
        "Develop integration services for third-party tools and internal APIs.",
        "Optimize database performance and query patterns for scale.",
        "Create internal tooling for debugging and workflow visibility.",
        "Ensure system reliability through testing, monitoring, and safeguards.",
      ],
      requirements: [
        "Strong experience with backend development (APIs, databases, architecture).",
        "Comfortable working with distributed systems and async workflows.",
        "Solid understanding of performance, security, and reliability best practices.",
      ],
    },
    {
      slug: "frontend-engineer",
      title: "Frontend Engineer",
      location: "New York City",
      type: "Contract",
      department: "IT Department",
      experience: "0–1 Years",
      salary: "$20k–$35k",
      about:
        "As a Frontend Engineer at Mahadeva AI, you'll turn the systems we build into interfaces people can actually operate. You'll work on the dashboards, editors, and review tools that clients use every day, close to the engineers building what sits behind them. This role suits someone early in their career who wants to ship real work quickly and learn in the open.",
      responsibilities: [
        "Build interfaces for workflow editing, review, and monitoring.",
        "Turn design files into accessible, responsive components.",
        "Work with backend engineers to shape the APIs the interface needs.",
        "Keep the component library consistent as new surfaces are added.",
        "Test against real client data rather than happy paths.",
      ],
      requirements: [
        "Working knowledge of modern JavaScript, TypeScript, and a component framework.",
        "An eye for layout, spacing, and the details that make an interface feel finished.",
        "Willing to ask questions early and take review as a normal part of the work.",
      ],
    },
    {
      slug: "hr-manager",
      title: "HR manager",
      location: "Seattle",
      type: "Full-time",
      department: "HR Department",
      experience: "5 Years",
      salary: "$130k–$180k",
      about:
        "As HR Manager at Mahadeva AI, you'll own how people join the company, grow inside it, and are looked after while they are here. You'll work directly with the founders on hiring, onboarding, and the policies that keep a distributed team fair and predictable. This role is for someone who treats process as a way of being kind at scale.",
      responsibilities: [
        "Run hiring end to end, from role definition to offer.",
        "Design onboarding that gets a new starter useful in their first fortnight.",
        "Own compensation bands, review cycles, and progression frameworks.",
        "Keep employment practice compliant across the regions we hire in.",
        "Be the first person anyone can raise a concern with.",
      ],
      requirements: [
        "Several years running HR for a growing, distributed team.",
        "Comfortable with employment law across more than one jurisdiction.",
        "Able to write a policy people actually read and follow.",
      ],
    },
    {
      slug: "performance-marketer",
      title: "Performance Marketer",
      location: "Austin",
      type: "Full-time",
      department: "Marketing Department",
      experience: "3 Years",
      salary: "$200k–$250k",
      about:
        "As a Performance Marketer at Mahadeva AI, you'll own the paid and lifecycle channels that bring the right companies to us. You'll work close to the sales conversation, so you can see which spend turns into engagements rather than only into clicks. This role suits someone who argues from numbers and is happy to be proved wrong by them.",
      responsibilities: [
        "Own paid acquisition across search, social, and partner channels.",
        "Build the reporting that ties spend to pipeline rather than to traffic.",
        "Run structured experiments on creative, landing pages, and offers.",
        "Work with the content team on what each channel actually needs.",
        "Keep acquisition cost honest as the mix changes.",
      ],
      requirements: [
        "Several years running paid acquisition with a real budget behind it.",
        "Fluent with analytics, attribution, and their limits.",
        "Able to write copy that survives contact with a technical audience.",
      ],
    },
    {
      slug: "product-designer",
      title: "Product Designer",
      location: "Remote",
      type: "Full-time",
      department: "Design Department",
      experience: "2 Years",
      salary: "$90k–$130k",
      about:
        "As a Product Designer at Mahadeva AI, you'll shape how complex automation is made legible to the people running it. You'll work across research, interaction, and interface, and you'll see your work in production quickly. This role is for someone who wants to design systems rather than screens.",
      responsibilities: [
        "Design the flows that make automation reviewable and reversible.",
        "Prototype early and test with the people who will use the result.",
        "Extend the design system as new surfaces need it.",
        "Work alongside engineers through build, not only up to handover.",
        "Bring evidence to design decisions and hold them loosely.",
      ],
      requirements: [
        "A portfolio of shipped product work, not only concepts.",
        "Comfortable designing dense, information-heavy interfaces.",
        "Fluent in a modern design tool and in talking to engineers.",
      ],
    },
    {
      slug: "ai-solutions-engineer",
      title: "AI Solutions Engineer",
      location: "London",
      type: "Full-time",
      department: "IT Department",
      experience: "4 Years",
      salary: "$150k–$200k",
      about:
        "As an AI Solutions Engineer at Mahadeva AI, you'll sit between the client's problem and the system that solves it. You'll scope engagements, build the first working version, and hand over something the client's own team can run. This role suits someone who is as comfortable in a workshop as in an editor.",
      responsibilities: [
        "Scope client problems into systems that can actually be built.",
        "Prototype agent and automation designs against real client data.",
        "Lead technical workshops with client teams.",
        "Hand over documented systems the client can operate themselves.",
        "Feed what you learn on engagements back into the core platform.",
      ],
      requirements: [
        "Strong engineering background with client-facing experience.",
        "Practical knowledge of LLM applications, retrieval, and evaluation.",
        "Able to explain a technical trade-off to a non-technical decision maker.",
      ],
    },
  ],
} as const;

/**
 * A role's own page.
 *
 * Everything here is shared by all six — the labels, the agency's own
 * description, the testimonial and the form. What differs per role is on the
 * role itself, above.
 */
export const jobDetailContent = {
  /** Above the title. Uppercase, tracked out — the site's eyebrow. */
  eyebrow: "Job Role",

  /** The card beside the description. Order is the order they are read. */
  facts: {
    salary: "Salary",
    location: "Location",
    type: "Job Type",
    experience: "Experience Required",
    department: "Department",
  },
  applyCta: "Apply Now",
  /** The anchor the card's button points at. */
  applyId: "apply",

  /** The agency, not the role. The same four paragraphs on every posting. */
  aboutUs: {
    heading: "About Us",
    paragraphs: [
      "Mahadeva AI is a forward-thinking AI service agency focused on helping businesses unlock real value through artificial intelligence. We partner with startups, growing companies, and enterprises to design and build intelligent solutions that automate workflows, enhance decision-making, and create meaningful digital experiences.",
      "At Mahadeva AI, we don't just implement AI — we craft solutions that align with your business goals. From strategy and development to deployment and optimization, our approach is rooted in simplicity, scalability, and impact.",
      "We specialize in building modern AI products, including generative AI tools, automation systems, and data-driven applications that help companies move faster and work smarter.",
      "Our mission is to make AI practical, accessible, and results-driven — turning complex technology into real-world business outcomes.",
    ],
  },

  /** The three blocks the role itself fills in. */
  aboutRole: "About This Role",
  responsibilities: "Responsibilities",
  requirements: "Requirements",

  apply: {
    headingLines: ["Apply for this job"],

    /** The reassurance beside the form, as on the contact page. */
    quote: {
      body: "Working here has been an incredible experience for my growth both professionally and personally. The team encourages collaboration, new ideas, and continuous learning, which makes every project exciting to work on. I appreciate the trust and flexibility we have to experiment, solve real problems, and build solutions that actually make an impact. It truly feels like a place where talented people come together to create meaningful work.",
      name: "Daniel Carter",
      role: "Senior AI Engineer",
    },

    form: {
      /** Named for assistive tech, which announces the form by it. */
      label: "Job application",
      fields: {
        name: { label: "Name", placeholder: "Naruto Uzumaki" },
        email: { label: "Email", placeholder: "naruto@hokage.com" },
        phone: { label: "Phone", placeholder: "+1 234 567 8900" },
        resume: {
          label: "Resume Link",
          placeholder: "https://hokage.com/naruto-resume.pdf",
        },
        why: {
          label: "Why do you want to join ?",
          placeholder: "I want to be the next Hokage",
        },
      },
      submit: "Submit form",
      sending: "Sending…",
      failed: "Something went wrong. Please try again, or email us directly.",
      sent: {
        title: "Application received",
        body: "Thank you for applying. We read every application and will be in touch either way.",
      },
    },
  },
} as const;

/** One open role, as the list and the page both see it. */
export type Role = (typeof openingsContent.roles)[number];

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
