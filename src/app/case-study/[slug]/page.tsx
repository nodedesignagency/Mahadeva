import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { PageSurface } from "@/components/layout/PageSurface";
import { PatternField } from "@/components/motion/PatternField";
import { TextReveal } from "@/components/motion/TextReveal";
import { sectionTextRevealDynamic } from "@/config/animation";
import { buildMetadata } from "@/config/seo";
import { caseStudyDetailContent as t } from "@/content/case-studies";
import type { CaseStudy } from "@/content/case-studies";
import { getCaseStudies, getCaseStudy } from "@/lib/case-studies";

/**
 * One case study.
 *
 * The page is the argument the card only summarises, in the order the work
 * happened: what it is, what it looked like, who it was for, what was wrong,
 * what was built, and then the artefacts.
 *
 * Dark from the header down, like the index that leads here.
 *
 * Every field below the card's own is optional in the content model, so each
 * block asks whether it has anything to say and is simply absent otherwise —
 * a study written as a card alone still opens as a page rather than as a
 * scaffold of empty headings.
 */

/** Prerender every published study; the set is small and changes rarely. */
export async function generateStaticParams() {
  const studies = await getCaseStudies();
  return studies.map((study) => ({ slug: study.slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study) return {};

  return buildMetadata({
    title: study.title,
    description: study.summary,
    path: `/case-study/${study.slug}`,
    image: study.image?.url,
    type: "article",
  });
}

/** A picture, or the space one will take. */
function Frame({
  image,
  className,
}: {
  image?: { url: string; alt: string };
  className?: string;
}) {
  return (
    <div className={className}>
      {image ? (
        // Not next/image: the URL is already sized and format-negotiated by
        // Sanity's pipeline, so routing it through the optimiser would be a
        // second transform of an image that has had one.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image.url}
          alt={image.alt}
          className="size-full object-cover"
          loading="lazy"
        />
      ) : (
        <p className="flex size-full items-center justify-center bg-bg-white p-7 font-body text-body-sm text-fg-on-light/40">
          {t.imagePending}
        </p>
      )}
    </div>
  );
}

/** A labelled column of the meta row. */
function Meta({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 border-t border-border pt-6">
      <h2 className="text-ink-dynamic-muted font-body text-body-sm">{label}</h2>
      {children}
    </div>
  );
}

/** A titled block of prose: the label left, the paragraphs right. */
function Section({
  label,
  paragraphs,
}: {
  label: string;
  paragraphs?: string[];
}) {
  if (!paragraphs?.length) return null;

  return (
    <div className="grid gap-6 desktop:grid-cols-[5fr_12fr] desktop:gap-20">
      <h2 className="font-body text-body-sm uppercase tracking-[0.04em]">
        {label}
      </h2>
      <div className="flex flex-col gap-6">
        {paragraphs.map((paragraph) => (
          <p
            key={paragraph}
            className="text-ink-dynamic-muted max-w-[74ch] font-body text-body-md leading-[1.6]"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const study: CaseStudy | undefined = await getCaseStudy(slug);
  if (!study) notFound();

  return (
    <>
      <PageSurface value="dark" />

      {/* One dark section from the header to the gallery: the blocks inside
          are spaced against each other rather than each carrying its own
          padding, so the page reads as one column and not as five stacked
          bands that happen to share a colour. */}
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
          {/* The title takes the width; the summary sits beside it from
              desktop up and under it below, where a column that narrow would
              set four words to a line. */}
          <div className="grid items-end gap-8 desktop:grid-cols-[8fr_5fr] desktop:gap-20">
            <TextReveal
              as="h1"
              lines={[study.title]}
              settings={sectionTextRevealDynamic}
              lineStagger={sectionTextRevealDynamic.lineStagger}
              className="flex flex-col items-start gap-(--space-heading-line) text-display-xl leading-(--leading-display) tracking-(--tracking-display) font-normal"
            />
            <p className="text-ink-dynamic-muted max-w-[46ch] font-body text-body-md leading-[1.6]">
              {study.summary}
            </p>
          </div>

          <Frame
            image={study.image}
            className="mt-15 aspect-[16/10] w-full overflow-hidden bg-bg-white"
          />

          <div className="mt-15 grid gap-10 tablet:grid-cols-3 tablet:gap-6">
            <Meta label={t.meta.client}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                {study.logo ? (
                  // Fitted inside its box rather than filling it: client marks
                  // are every shape, and `contain` keeps each one whole.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={study.logo.url}
                    alt={study.logo.alt}
                    className="h-8 w-auto max-w-[138px] object-contain"
                  />
                ) : (
                  <p className="font-body text-heading-sm">{study.client}</p>
                )}

                {/* Only where there is something to open. */}
                {study.liveUrl ? (
                  <a
                    href={study.liveUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 font-body text-body-md transition-opacity duration-(--duration-hover) ease-(--ease-out) hover:opacity-60"
                  >
                    {t.livePreview}
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </a>
                ) : null}
              </div>
            </Meta>

            {study.timeline ? (
              <Meta label={t.meta.timeline}>
                <p className="font-body text-heading-sm">{study.timeline}</p>
              </Meta>
            ) : null}

            {study.services?.length ? (
              <Meta label={t.meta.services}>
                {/* One run of names separated by dots, not a list of items:
                    the separators belong between them and so are drawn by the
                    layout, hidden from the reading order. */}
                <p className="flex flex-wrap items-center gap-x-3 gap-y-2 font-body text-heading-sm">
                  {study.services.map((service, i) => (
                    <span key={service} className="inline-flex items-center gap-3">
                      {i > 0 ? (
                        <span aria-hidden="true" className="opacity-50">
                          ·
                        </span>
                      ) : null}
                      {service}
                    </span>
                  ))}
                </p>
              </Meta>
            ) : null}
          </div>

          <div className="mt-30 flex flex-col gap-20">
            <Section label={t.challenge} paragraphs={study.challenge} />
            <Section label={t.solution} paragraphs={study.solution} />
          </div>

          {/* Two across, and square: the tiles are artefacts of the work
              rather than screenshots of it, and a fixed ratio is what keeps
              the grid a grid when they arrive at different sizes.

              Four placeholders stand in until they do, which is the count the
              layout is drawn for. */}
          <div className="mt-30 grid gap-2.5 tablet:grid-cols-2 tablet:gap-5">
            {(study.gallery ?? Array.from({ length: 4 })).map((item, i) => (
              <Frame
                key={item ? item.url : i}
                image={item ?? undefined}
                className="aspect-square w-full overflow-hidden bg-bg-white"
              />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
