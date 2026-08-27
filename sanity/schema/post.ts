import { defineArrayMember, defineField, defineType } from "sanity";
import { blogCategories, postTones } from "../../src/content/blogTerms";

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
 *
 * The category and tone dropdowns are built from `src/content/blogTerms.ts`
 * rather than listed again here. They were listed twice, and two lists that
 * have to agree eventually do not: a category the Studio offered but the
 * filter row did not would leave a post that no chip ever shows.
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
        "Picks which filter chip the post answers to. This list is the filter row itself, so there is no category here that the site would filter to nothing.",
      options: {
        list: blogCategories.map((value) => ({ title: value, value })),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tone",
      title: "Card colour",
      type: "string",
      description: "The tint behind the card.",
      options: {
        list: postTones.map((value) => ({
          title: value[0].toUpperCase() + value.slice(1),
          value,
        })),
        layout: "radio",
      },
      initialValue: postTones[0],
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
      description:
        "A name. The post's one picture is the cover below; the byline beside it is text.",
      fields: [
        defineField({
          name: "name",
          title: "Name",
          type: "string",
          validation: (rule) => rule.required(),
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
