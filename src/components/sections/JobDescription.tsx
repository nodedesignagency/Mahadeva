import type { ReactNode } from "react";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import type { Role, jobDetailContent } from "@/content/careers";

/**
 * The role itself: the facts card on the left, the description on the right.
 *
 * The card is what someone scanning for a salary and a location came for, so
 * it leads on every width — it is first in the source and therefore first on a
 * phone, above the four paragraphs about the agency. From desktop up it sits
 * beside the prose and sticks as that prose scrolls, because the thing it
 * carries is the apply button and a reader who has finished the requirements
 * should not have to travel back up to find it.
 *
 * This is the section that rides up over the pinned opening, so it keeps its
 * own white fill — transparent, the dark band would show through it for the
 * whole climb.
 *
 * A server component: nothing here moves.
 */

type JobDescriptionProps = {
  content: typeof jobDetailContent;
  role: Role;
};

/** One labelled fact. The value is Geist wherever it is a figure. */
function Fact({ label, value, figure }: { label: string; value: string; figure?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="eyebrow font-ui text-fg-on-light-muted">{label}</dt>
      <dd
        className={`text-body-lg text-fg-on-light ${figure ? "font-ui" : "font-body"}`}
      >
        {value}
      </dd>
    </div>
  );
}

/** A titled block of the description. */
function Block({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-heading-lg leading-(--leading-heading) tracking-(--tracking-display) font-normal text-fg-on-light">
        {heading}
      </h2>
      <div className="mt-6 flex flex-col gap-6">{children}</div>
    </section>
  );
}

function Paragraph({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-[76ch] font-body text-body-md text-fg-on-light">{children}</p>
  );
}

/** A run of points. Marked as a list, so it is announced as one. */
function Points({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex max-w-[76ch] gap-3 font-body text-body-md text-fg-on-light"
        >
          {/* The bullet is drawn rather than left to the list style, so it can
              be sized and coloured with the copy and sit on its first line
              however far the point wraps. Hidden from assistive tech: a list
              item is already announced as one, and a second marker read aloud
              is noise. */}
          <span aria-hidden="true" className="select-none text-fg-on-light-muted">
            &bull;
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function JobDescription({ content, role }: JobDescriptionProps) {
  return (
    <section
      data-bg="white"
      data-bg-keep=""
      // `relative z-10` and an opaque fill are what make it ride over the
      // pinned opening rather than under it.
      className="relative z-10 bg-bg-white py-20 text-fg-on-light tablet:py-25"
    >
      <Container>
        <div className="grid gap-12 desktop:grid-cols-[4fr_11fr] desktop:items-start desktop:gap-10">
          {/* `self-start` is what lets it stick: a grid item stretched to its
              row's height has nothing to travel within. */}
          <div className="desktop:sticky desktop:top-[calc(var(--header-height)+2rem)] desktop:self-start">
            <div className="flex flex-col gap-6 bg-facts-panel p-6">
              <dl className="flex flex-col gap-6">
                <Fact label={content.facts.salary} value={role.salary} figure />
                <Fact label={content.facts.location} value={role.location} />
                <Fact label={content.facts.type} value={role.type} />
                <Fact
                  label={content.facts.experience}
                  value={role.experience}
                  figure
                />
                <Fact label={content.facts.department} value={role.department} />
              </dl>

              {/* Straight to the form below rather than to another page. */}
              <Button
                href={`#${content.applyId}`}
                variant="plan"
                withArrow
                className="w-full"
              >
                {content.applyCta}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-15">
            <Block heading={content.aboutUs.heading}>
              {content.aboutUs.paragraphs.map((paragraph) => (
                <Paragraph key={paragraph}>{paragraph}</Paragraph>
              ))}
            </Block>

            <Block heading={content.aboutRole}>
              <Paragraph>{role.about}</Paragraph>
            </Block>

            <Block heading={content.responsibilities}>
              <Points items={role.responsibilities} />
            </Block>

            <Block heading={content.requirements}>
              <Points items={role.requirements} />
            </Block>
          </div>
        </div>
      </Container>
    </section>
  );
}
