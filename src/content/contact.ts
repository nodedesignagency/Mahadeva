/**
 * Contact page content.
 *
 * The form's labels, placeholders and options are content, not markup — they
 * are the words on the page, and an owner changing "Monthly Budget" to
 * "Project Budget" should not be opening a component to do it.
 */

export const contactContent = {
  headingLines: ["Start Your AI Journey"],

  /**
   * The panel beside the form. One quote rather than the carousel the home
   * page runs: this is a reassurance next to a form, and a control the reader
   * has to operate would be competing with the thing they came to do.
   */
  quote: {
    body: "Working with the team was a smooth and highly professional experience from start to finish. They quickly understood our requirements and translated complex ideas into a clear and well-structured solution. The final product not only improved our workflow but also elevated the way we present our technology to customers. It felt like working with a true partner who cares about delivering real results.",
    name: "Shelly Reynolds",
    role: "Director of Operations, Stratify Labs",
  },

  /** Under the quote. Names until the marks land, as the trust strip does. */
  logos: [
    { name: "Logoipsum" },
    { name: "Brand Standard" },
    { name: "Ipsum" },
    { name: "Loqo" },
    { name: "Logoipsum" },
  ],

  form: {
    /** Named for assistive tech, which announces the form by it. */
    label: "Contact",
    fields: {
      name: { label: "Full Name", placeholder: "Naruto Uzumaki" },
      email: { label: "Work Email", placeholder: "naruto@hokage.com" },
      company: { label: "Company", placeholder: "Hidden Leaf Ltd." },
      budget: { label: "Monthly Budget", placeholder: "Select…" },
      message: {
        label: "What do you want to automate?",
        placeholder: "I want to automate mostly everything",
      },
    },

    /**
     * Bands rather than a free number: a range is what a first enquiry can
     * honestly answer, and it sorts the enquiries without asking anyone to
     * commit to a figure before a conversation.
     */
    budgets: [
      "Under $5,000",
      "$5,000 – $15,000",
      "$15,000 – $50,000",
      "$50,000+",
      "Not sure yet",
    ],

    submit: "Submit form",
    sending: "Sending…",

    /** What the form says back. Written out, not assembled from fragments. */
    sent: {
      title: "Thank you — that's with us.",
      body: "We read every enquiry ourselves and reply within two working days.",
    },
    failed:
      "That did not send. Try again, or email us directly and we will pick it up from there.",
  },
} as const;
