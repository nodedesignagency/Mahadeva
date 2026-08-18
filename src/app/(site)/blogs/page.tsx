import { Container } from "@/components/layout/Container";
import { PageSurface } from "@/components/layout/PageSurface";
import { PatternField } from "@/components/motion/PatternField";
import { TextReveal } from "@/components/motion/TextReveal";
import { ListingCard } from "@/components/ui/ListingCard";
import { sectionTextRevealDynamic } from "@/config/animation";
import { buildMetadata } from "@/config/seo";
import { articles, blogIndexContent } from "@/content/blogs";

export const metadata = buildMetadata({
  title: "Blog",
  description: blogIndexContent.subheadingLines.join(" "),
  path: "/blogs",
});

/**
 * The writing.
 *
 * Same shape as the careers index and the case study index — the dark
 * opening with the pattern band, then a column of cards. Three indexes that
 * look like one site is the point.
 */
export default function BlogIndexPage() {
  return (
    <>
      <PageSurface value="dark" />

      <section
        data-bg="green"
        className="relative overflow-hidden bg-bg pt-[calc(var(--header-height)+10rem)] pb-15 text-fg"
      >
        <PatternField
          side="top"
          orientation="horizontal"
          thickness={26}
          className="top-header"
        />

        <Container className="relative flex flex-col items-center gap-6 px-10 text-center">
          <TextReveal
            as="h1"
            lines={blogIndexContent.headingLines}
            mobileLines={blogIndexContent.headingLinesMobile}
            settings={sectionTextRevealDynamic}
            lineStagger={sectionTextRevealDynamic.lineStagger}
            className="flex flex-col items-center gap-(--space-heading-line) text-display-xl leading-(--leading-display) tracking-(--tracking-display) font-normal"
          />
          <p className="text-ink-dynamic max-w-[62ch] font-body text-body-md">
            {blogIndexContent.subheadingLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </Container>
      </section>

      <section data-bg="green" className="bg-bg pb-20 tablet:pb-30">
        <Container>
          <div className="flex flex-col gap-2.5 tablet:gap-5">
            {articles.length === 0 ? (
              <p className="text-ink-dynamic font-body text-body-md">
                {blogIndexContent.empty}
              </p>
            ) : (
              articles.map((article) => (
                <ListingCard
                  key={article.slug}
                  href={`/blogs/${article.slug}`}
                  eyebrow={article.category}
                  title={article.title}
                  summary={article.excerpt}
                  tone={article.tone}
                  meta={[
                    { label: "Published", value: article.date },
                    // A duration is a number, and every number on this site is
                    // set in Geist.
                    { label: "Read", value: article.readTime, numeric: true },
                  ]}
                />
              ))
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
