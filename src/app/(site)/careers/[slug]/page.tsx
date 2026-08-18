import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { PageSurface } from "@/components/layout/PageSurface";
import { PatternField } from "@/components/motion/PatternField";
import { TextReveal } from "@/components/motion/TextReveal";
import { Button } from "@/components/ui/Button";
import { ListingCard } from "@/components/ui/ListingCard";
import { sectionTextRevealDynamic } from "@/config/animation";
import { buildMetadata } from "@/config/seo";
import { careerDetailContent as t, careers } from "@/content/careers";

/**
 * One role.
 *
 * The page the card only summarises, in the order somebody reads it: what the
 * job is, what they would do, what they would bring, and how to apply. Dark
 * from the header down, like the index that leads here.
 *
 * Not in the nav or the footer by design — a role is reached from the listing,
 * which is the only place that knows which roles are open.
 */

/** Prerender every role; the set is small and changes rarely. */
export function generateStaticParams() {
  return careers.map((role) => ({ slug: role.slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const role = careers.find((entry) => entry.slug === slug);
  if (!role) return {};

  return buildMetadata({
    title: role.role,
    description: role.summary,
    path: `/careers/${role.slug}`,
    type: "article",
  });
}

/** The label that heads a block: the accent green, as on the case study. */
const BLOCK_LABEL = "font-body text-body-sm uppercase text-accent";

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-3">
      <p className={BLOCK_LABEL}>{label}</p>
      <p className="font-body text-body-md text-fg">{value}</p>
    </div>
  );
}

function Block({ heading, items }: { heading: string; items: string[] }) {
  return (
    <div className="grid gap-6 desktop:grid-cols-[4fr_8fr] desktop:gap-20">
      <h2 className={BLOCK_LABEL}>{heading}</h2>
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item} className="flex gap-4 font-body text-body-md text-fg">
            {/* A square rather than a bullet glyph: the site's mark everywhere
                else is a rectangle, and a disc would be the one round thing on
                the page. */}
            <span aria-hidden className="mt-2.5 size-1.5 shrink-0 bg-accent" />
            <span className="max-w-[74ch]">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function CareerPage({ params }: PageProps) {
  const { slug } = await params;
  const role = careers.find((entry) => entry.slug === slug);
  if (!role) notFound();

  const more = careers.filter((entry) => entry.slug !== role.slug).slice(0, t.more.count);

  return (
    <>
      <PageSurface value="dark" />

      {/* One dark section from the header down: the blocks inside are spaced
          against each other rather than each carrying its own padding, so the
          page reads as one column and not as bands that share a colour. */}
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
          <div className="grid items-end gap-8 desktop:grid-cols-[8fr_5fr] desktop:gap-20">
            <TextReveal
              as="h1"
              wraps
              lines={role.roleLines ?? [role.role]}
              settings={sectionTextRevealDynamic}
              lineStagger={sectionTextRevealDynamic.lineStagger}
              className="flex flex-col items-start gap-(--space-heading-line) text-display-xl leading-[calc(1em+var(--space-heading-line))] tracking-(--tracking-display) font-normal"
            />
            <p className="text-ink-dynamic max-w-[46ch] font-body text-body-md">
              {role.summary}
            </p>
          </div>

          <div className="mt-20 grid gap-10 tablet:grid-cols-4 tablet:gap-6">
            <Meta label={t.meta.department} value={role.department} />
            <Meta label={t.meta.location} value={role.location} />
            <Meta label={t.meta.type} value={role.type} />
            <Meta label={t.meta.posted} value={role.posted} />
          </div>

          <div className="mt-20 flex flex-col gap-16">
            <div className="grid gap-6 desktop:grid-cols-[4fr_8fr] desktop:gap-20">
              <h2 className={BLOCK_LABEL}>{t.about}</h2>
              <div className="flex flex-col gap-6">
                {role.about.map((paragraph) => (
                  <p key={paragraph} className="max-w-[74ch] font-body text-body-md text-fg">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <Block heading={t.responsibilities} items={role.responsibilities} />
            <Block heading={t.requirements} items={role.requirements} />
          </div>

          <div className="mt-20 flex flex-col items-start gap-6 border-t border-fg/15 pt-14">
            <h2 className="font-display text-heading-lg leading-(--leading-heading) tracking-(--tracking-heading) font-normal text-fg">
              {t.cta.heading}
            </h2>
            <p className="max-w-[62ch] font-body text-body-md text-fg">{t.cta.body}</p>
            {/* The site's call-to-action width: 267 from tablet up, full width
                on a phone. */}
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
                  href={`/careers/${other.slug}`}
                  eyebrow={other.department}
                  title={other.role}
                  summary={other.summary}
                  tone={other.tone}
                  meta={[
                    { label: "Location", value: other.location },
                    { label: "Type", value: other.type },
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
