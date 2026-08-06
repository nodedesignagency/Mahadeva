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

export const missionContent = {
  headingLines: ["Our Mission"],

  /**
   * Three paragraphs, not one block with breaks: they are separate thoughts —
   * what changed, why the company exists, where it went — and each is its own
   * <p> so the spacing between them is the prose rhythm rather than a gap
   * anyone has to maintain.
   */
  bodyParagraphs: [
    "Businesses once operated with clear workflows and shared context across teams. Over time, simple processes were replaced by fragmented tools, manual coordination, and growing operational complexity that slowed execution and reduced clarity.",
    "Mahadeva was created to rethink how modern teams work with automation. Instead of adding more software, we focus on building smarter systems that support decisions, reduce friction, and help teams operate with greater speed and confidence.",
    "What began as focused automation work has evolved into an AI-first approach that helps companies design scalable systems, streamline operations, and create a stronger foundation for long-term growth.",
  ],
} as const;
