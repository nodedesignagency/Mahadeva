import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { PageSurface } from "@/components/layout/PageSurface";
import { PatternField } from "@/components/motion/PatternField";
import { TextReveal } from "@/components/motion/TextReveal";
import { Button } from "@/components/ui/Button";
import { ListingCard } from "@/components/ui/ListingCard";
import { sectionTextRevealDynamic } from "@/config/animation";
import { buildMetadata } from "@/config/seo";
import { articles, blogDetailContent as t } from "@/content/blogs";

/**
 * One article.
 *
 * Prose on the dark surface, set in a column narrow enough to read: the body
 * is capped at 74 characters, which is the same measure the case study's
 * challenge and solution blocks take.
 *
 * Not in the nav or the footer by design — an article is reached from the
 * listing, or from the piece before it.
 */

/** Prerender every article; the set is small and changes rarely. */
export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = articles.find((entry) => entry.slug === slug);
  if (!article) return {};

  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/blogs/${article.slug}`,
    type: "article",
  });
}

const BLOCK_LABEL = "font-body text-body-sm uppercase text-accent";

function Meta({
  label,
  value,
  numeric,
}: {
  label: string;
  value: string;
  numeric?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className={BLOCK_LABEL}>{label}</p>
      <p className={`text-body-md text-fg ${numeric ? "font-ui font-light" : "font-body"}`}>
        {value}
      </p>
    </div>
  );
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = articles.find((entry) => entry.slug === slug);
  if (!article) notFound();

  const more = articles.filter((entry) => entry.slug !== article.slug).slice(0, t.more.count);

  return (
    <>
      <PageSurface value="dark" />

      <section
        data-bg="green"
        className="relative overflow-hidden bg-bg pt-[calc(var(--header-height)+9rem)] pb-20 text-fg tablet:pb-30"
      >
        <PatternField
          side="top"
          orientation="horizontal"
          thickness={26}
          className="top-header"
        />

        <Container className="relative">
          <p className={BLOCK_LABEL}>{article.category}</p>

          <div className="mt-8 grid items-end gap-8 desktop:grid-cols-[8fr_5fr] desktop:gap-20">
            <TextReveal
              as="h1"
              wraps
              lines={article.titleLines ?? [article.title]}
              mobileLines={article.titleLinesMobile}
              settings={sectionTextRevealDynamic}
              lineStagger={sectionTextRevealDynamic.lineStagger}
              className="flex flex-col items-start gap-(--space-heading-line) text-display-xl leading-[calc(1em+var(--space-heading-line))] tracking-(--tracking-display) font-normal"
            />
            <p className="text-ink-dynamic max-w-[46ch] font-body text-body-md">
              {article.excerpt}
            </p>
          </div>

          <div className="mt-20 grid gap-10 tablet:grid-cols-3 tablet:gap-6">
            <Meta label={t.meta.author} value={article.author} />
            <Meta label={t.meta.date} value={article.date} />
            <Meta label={t.meta.readTime} value={article.readTime} numeric />
          </div>

          {/* The article itself. Each block is a heading and its paragraphs;
              the opening one runs straight in without a heading. */}
          <div className="mt-20 flex flex-col gap-14">
            {article.body.map((block, i) => (
              <div key={block.heading ?? i} className="flex flex-col gap-6">
                {block.heading && (
                  <h2 className="font-display text-heading-lg leading-(--leading-heading) tracking-(--tracking-heading) font-normal text-fg">
                    {block.heading}
                  </h2>
                )}
                {block.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="max-w-[74ch] font-body text-body-md text-fg">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-20 flex flex-col items-start gap-6 border-t border-fg/15 pt-14">
            <h2 className="font-display text-heading-lg leading-(--leading-heading) tracking-(--tracking-heading) font-normal text-fg">
              {t.cta.heading}
            </h2>
            <p className="max-w-[62ch] font-body text-body-md text-fg">{t.cta.body}</p>
            <Button href={t.cta.href} withArrow className="w-full tablet:w-[267px]">
              {t.cta.label}
            </Button>
          </div>
        </Container>
      </section>

      {more.length > 0 && (
        <section data-bg="green" className="bg-bg pb-20 tablet:pb-30">
          <Container className="flex flex-col gap-8">
            <h2 className={BLOCK_LABEL}>{t.more.heading}</h2>
            <div className="flex flex-col gap-2.5 tablet:gap-5">
              {more.map((other) => (
                <ListingCard
                  key={other.slug}
                  href={`/blogs/${other.slug}`}
                  eyebrow={other.category}
                  title={other.title}
                  summary={other.excerpt}
                  tone={other.tone}
                  meta={[
                    { label: "Published", value: other.date },
                    { label: "Read", value: other.readTime, numeric: true },
                  ]}
                />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
