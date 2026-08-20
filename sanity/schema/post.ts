import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * The blog's content model — the `blog` dataset's whole schema.
 *
 * It lives in its own dataset rather than beside the case studies because the
 * two are written on completely different rhythms: a post lands weekly, a case
 * study a handful of times a year. Separate datasets mean the blog can be
 * restored, exported or handed to a writer on its own, and a mistake in one is
 * not a mistake in the other.
 *
 * Field names match `Post` in src/content/blog.ts one for one, so the query in
 * src/lib/blog.ts is a projection rather than a translation layer.
 */

export const post = defineType({
  name: "post",
  title: "Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "The headline on the card and at the top of the post.",
      validation: (rule) => rule.required().max(90),
    }),
    defineField({
      name: "slug",
      title: "URL",
      type: "slug",
      description: "Generated from the title. This becomes /blogs/your-slug.",
      options: { source: "title", maxLength: 64 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
      description:
        "Two lines on the card. Keep it under ~140 characters or it will push the card's foot down.",
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      description:
        "Picks which filter chip the post answers to. The row itself is set in src/content/blog.ts — a category that is not on this list would filter to nothing.",
      options: {
        list: [
          { title: "Growth Strategy", value: "Growth Strategy" },
          { title: "AI Automation", value: "AI Automation" },
          { title: "Marketing AI", value: "Marketing AI" },
          { title: "Sales Automation", value: "Sales Automation" },
          { title: "Operations", value: "Operations" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tone",
      title: "Card colour",
      type: "string",
      description: "The tint behind the card.",
      options: {
        list: [
          { title: "Sky", value: "sky" },
          { title: "Lavender", value: "lavender" },
          { title: "Rose", value: "rose" },
          { title: "Mint", value: "mint" },
          { title: "Peach", value: "peach" },
          { title: "Magenta", value: "magenta" },
        ],
        layout: "radio",
      },
      initialValue: "sky",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "published",
      title: "Published",
      type: "date",
      description: "Sets the order of the index — newest first.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "date",
      title: "Date, as it is written",
      type: "string",
      description:
        "Optional. Leave it empty and the date above is written out as “Jan 2, 2026”. Fill it in only to say it some other way.",
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "object",
      fields: [
        defineField({
          name: "name",
          title: "Name",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "avatar",
          title: "Portrait",
          type: "image",
          description:
            "Drawn small and round. Without one the post sets the name on its own.",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alternative text",
              type: "string",
              description: "Usually just the author's name.",
              validation: (rule) => rule.required(),
            }),
          ],
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Cover",
      type: "image",
      description:
        "The picture in the card's frame and at the head of the post. Drag the hotspot to choose what stays visible when it crops.",
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
      name: "body",
      title: "Body",
      type: "array",
      description:
        "The post itself, as a run of titled blocks. Each one is a heading and the paragraphs under it.",
      of: [
        defineArrayMember({
          name: "section",
          title: "Section",
          type: "object",
          fields: [
            defineField({
              name: "heading",
              title: "Heading",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "paragraphs",
              title: "Paragraphs",
              type: "array",
              description: "One entry per paragraph.",
              of: [defineArrayMember({ type: "text", rows: 4 })],
              validation: (rule) => rule.required().min(1),
            }),
          ],
          preview: {
            select: { title: "heading", paragraphs: "paragraphs" },
            prepare: ({ title, paragraphs }) => ({
              title,
              subtitle: paragraphs?.[0],
            }),
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "newestFirst",
      by: [{ field: "published", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "image" },
  },
});
