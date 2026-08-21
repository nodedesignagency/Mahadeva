import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * The case studies' content model — the `production` dataset's whole schema.
 *
 * It is code, and the Studio builds its editing UI from this file at runtime. A
 * buyer pointing the app at their own empty Sanity project gets these exact
 * fields with no copying, no importing and nothing to keep in sync. Only the
 * documents themselves travel separately, via the seed.
 *
 * Field names match `CaseStudy` in src/content/case-studies.ts one for one, so
 * the query in src/lib/case-studies.ts is a projection rather than a
 * translation layer.
 */

export const caseStudy = defineType({
  name: "caseStudy",
  title: "Case Study",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description:
        "The headline on the card, e.g. “AI Agent Website Built for Automation Startups”.",
      validation: (rule) => rule.required().max(90),
    }),
    defineField({
      name: "titleLines",
      title: "Title, line by line",
      type: "array",
      description:
        "How the title is set on its own page — one entry per line. The reveal draws a bar per line, sized to that line, so this is where the breaks are decided. Leave empty and the page sets the whole title and lets it wrap.",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "titleLinesMobile",
      title: "Title, line by line (phone)",
      type: "array",
      description:
        "The same break for a narrow screen, where the lines above run past the column. Leave empty to use the same ones.",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "slug",
      title: "URL",
      type: "slug",
      description:
        "Generated from the title. This becomes /case-study/your-slug.",
      options: { source: "title", maxLength: 64 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "client",
      title: "Client name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Client logo",
      type: "image",
      description:
        "Drawn at 138×32 and fitted inside that box, so any shape stays whole. A transparent PNG or an SVG works best. Without one the card sets the client name as text.",
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          description: "Usually just the company name.",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "string",
      description: "Shown in the chip at the top right of the card.",
      validation: (rule) =>
        rule.required().regex(/^\d{4}$/, { name: "four digits" }),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
      description:
        "Two lines on the card. Keep it under ~140 characters or it will push the stats down.",
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: "stats",
      title: "Stats",
      type: "array",
      description:
        "Exactly four. They are laid out in a 2x2 grid — fewer leaves a gap, more will not fit.",
      of: [
        defineArrayMember({
          name: "stat",
          type: "object",
          fields: [
            defineField({
              name: "label",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "value",
              type: "string",
              description: "Short, e.g. “13.2x”, “42%”, “$80K+”.",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "value", subtitle: "label" },
          },
        }),
      ],
      validation: (rule) => rule.required().length(4),
    }),
    defineField({
      name: "tone",
      title: "Panel colour",
      type: "string",
      description: "The tint behind the text half of the card.",
      options: {
        list: [
          { title: "Sky", value: "sky" },
          { title: "Lavender", value: "lavender" },
          { title: "Peach", value: "peach" },
          { title: "Mint", value: "mint" },
          { title: "Periwinkle", value: "periwinkle" },
        ],
        layout: "radio",
      },
      initialValue: "sky",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Screenshot",
      type: "image",
      description:
        "The product shot filling the right half. Drag the hotspot to choose what stays visible when it crops.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          description:
            "Describes the image for screen readers and when it fails to load.",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "timeline",
      title: "Timeline",
      type: "string",
      description:
        "How long the work ran, as the page states it, e.g. “3 Months”.",
    }),
    defineField({
      name: "services",
      title: "Services",
      type: "array",
      description:
        "Read as one dot-separated run under a single heading. Three or four keeps it to two lines.",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "liveUrl",
      title: "Live site",
      type: "url",
      description:
        "The finished site. Leave empty and the “Live Preview” link is simply not drawn.",
    }),
    defineField({
      name: "challenge",
      title: "The challenge",
      type: "array",
      description: "The brief, one entry per paragraph.",
      of: [defineArrayMember({ type: "text", rows: 4 })],
    }),
    defineField({
      name: "solution",
      title: "The solution",
      type: "array",
      description: "What was built, one entry per paragraph.",
      of: [defineArrayMember({ type: "text", rows: 4 })],
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      description:
        "The grid under the prose, two across. Four looks right; any even number works.",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alternative text",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description:
        "Lowest first. Only the first three appear on the home page.",
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "displayOrder",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "client", media: "image" },
  },
});
