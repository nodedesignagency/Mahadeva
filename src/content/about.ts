/**
 * About page content.
 *
 * Copy is verbatim from the owner's Framer page. As everywhere else, sections
 * take this as typed props and hold no literal strings of their own.
 */

export const aboutHeroContent = {
  /**
   * The page's single <h1>, one reveal block per line — the breaks are the
   * design's, not the container's, for the same reason as the home hero.
   */
  headingLines: ["Turning Automation", "Into Real Growth"],

  /** Re-broken for a phone, where the first line no longer fits its column. */
  headingLinesMobile: ["Turning", "Automation Into", "Real Growth"],

  subheading:
    "We help ambitious companies turn automation into practical systems that scale operations, improve execution, and drive measurable growth.",
} as const;

export const insideAgencyContent = {
  headingLines: ["Inside The Agency"],
  subheading:
    "We combine design thinking, automation expertise, and strategic execution to deliver systems that actually work in the real world.",
  /** Stands in the frame until the photograph lands. */
  imagePending: "Photograph to come",
} as const;

/** The tint behind a principle's mark, and the mark itself. */
export type PrincipleTone =
  | "blue"
  | "peach"
  | "lavender"
  | "rose"
  | "green"
  | "magenta";

export type PrincipleMark =
  | "people"
  | "bolt"
  | "trend"
  | "layers"
  | "shield"
  | "loop";

export const howWeWorkContent = {
  headingLines: ["How We Work"],

  /**
   * Six principles, read across then down. `mark` names the drawing rather
   * than importing it: the icon set is a rendering choice, and content that
   * held components could not be moved to a CMS.
   */
  principles: [
    {
      title: "Human First",
      body: "Personalized systems designed to support teams across daily workflows.",
      tone: "blue",
      mark: "people",
    },
    {
      title: "Smart Execution",
      body: "Automation built to deliver clarity, speed, and consistent results without complexity.",
      tone: "peach",
      mark: "bolt",
    },
    {
      title: "Real Impact",
      body: "Solutions focused on measurable outcomes that help businesses grow with confidence.",
      tone: "lavender",
      mark: "trend",
    },
    {
      title: "Scalable Thinking",
      body: "Systems designed to grow alongside teams without creating operational friction later.",
      tone: "rose",
      mark: "layers",
    },
    {
      title: "Reliable Delivery",
      body: "Processes structured to ensure execution stays smooth and aligned with goals.",
      tone: "green",
      mark: "shield",
    },
    {
      title: "Continuous Growth",
      body: "Automation that improves over time and evolves with changing business needs.",
      tone: "magenta",
      mark: "loop",
    },
  ] satisfies readonly {
    title: string;
    body: string;
    tone: PrincipleTone;
    mark: PrincipleMark;
  }[],
} as const;

export const teamContent = {
  headingLines: ["Meet The Team"],
  controls: { previous: "Previous team members", next: "Next team members" },

  members: [
    { name: "Daniel Cruz", role: "CEO & Founder" },
    { name: "Sarah Kim", role: "Automation Engineer" },
    { name: "Emma Watson", role: "Product Lead" },
    { name: "James Cooper", role: "Growth Strategist" },
  ],
} as const;

/** The card's fill. One per variant, in the order they are scrolled through. */
export type MissionTone = "blue" | "green" | "lavender";

/**
 * The mission card's three variants.
 *
 * One card is on screen at a time and the scroll steps between them, so this
 * is a list rather than three sections: the component renders whichever the
 * scroll position names, and adding a fourth is an entry here.
 *
 * Each holds three paragraphs — separate thoughts, not one block with breaks,
 * so the spacing between them is the prose rhythm rather than a gap anyone has
 * to maintain.
 */
export const missionContent = {
  cards: [
    {
      heading: "Our Mission",
      tone: "blue",
      paragraphs: [
        "Businesses once operated with clear workflows and shared context across teams. Over time, simple processes were replaced by fragmented tools, manual coordination, and growing operational complexity that slowed execution and reduced clarity.",
        "Mahadeva was created to rethink how modern teams work with automation. Instead of adding more software, we focus on building smarter systems that support decisions, reduce friction, and help teams operate with greater speed and confidence.",
        "What began as focused automation work has evolved into an AI-first approach that helps companies design scalable systems, streamline operations, and create a stronger foundation for long-term growth.",
      ],
    },
    {
      heading: "Future Vision",
      tone: "green",
      paragraphs: [
        "Teams once worked with clarity because context was shared and decisions felt connected to real outcomes. Over time, growth introduced disconnected tools, layered processes, and operational complexity that made collaboration harder and slowed meaningful progress across organizations",
        "Our vision is to simplify how modern businesses operate through intelligent systems. By connecting workflows and automation, teams gain clarity, reduce operational friction, and stay aligned around shared goals.",
        "What started as focused automation initiatives has grown into a long-term vision of building AI-driven systems that help organizations scale sustainably and operate with greater efficiency.",
      ],
    },
    {
      heading: "Scalable Systems",
      tone: "lavender",
      paragraphs: [
        "Businesses today face growing complexity as workflows spread across tools, teams, and manual processes. What once felt simple now requires constant coordination, making execution slower and creating unnecessary overhead that prevents teams from focusing on meaningful work.",
        "Our approach focuses on building systems instead of adding more layers. Automation should feel natural and supportive, allowing teams to work smarter while removing repetitive tasks from daily operations.",
        "What began as workflow automation projects has evolved into a proven method for designing AI-powered systems that connect operations, improve consistency, and help organizations scale with confidence.",
      ],
    },
  ] satisfies readonly {
    heading: string;
    tone: MissionTone;
    paragraphs: readonly string[];
  }[],
} as const;
