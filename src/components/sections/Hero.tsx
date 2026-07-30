"use client";

import { motion, useReducedMotion } from "motion/react";
import { WordReveal } from "@/components/motion/WordReveal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { durations, easings } from "@/lib/motion";
import type { heroContent } from "@/content/home";

/**
 * Hero section.
 *
 * The heading uses the template's signature per-word colour reveal, played on
 * mount rather than on scroll since it is above the fold. The subheading and
 * CTAs follow on a short delay tuned to land just after the last word.
 *
 * Content comes in as props so this component holds no copy of its own.
 */

type HeroProps = {
  content: typeof heroContent;
};

export function Hero({ content }: HeroProps) {
  const reduced = useReducedMotion() ?? false;

  const wordCount = content.heading.split(" ").length;
  const wordStagger = 0.06;
  // Start the supporting content as the final word lands.
  const followDelay = reduced ? 0 : wordCount * wordStagger;

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: reduced
      ? { duration: 0 }
      : { duration: durations.base, ease: easings.reveal, delay },
  });

  return (
    <section className="relative pt-[calc(var(--header-height)+var(--space-section-md))] pb-section-md">
      <Container>
        <div className="max-w-[20ch]">
          <WordReveal
            as="h1"
            trigger="mount"
            text={content.heading}
            stagger={wordStagger}
            className="text-display-xl leading-[--leading-display] tracking-[--tracking-display] font-normal"
          />
        </div>

        <motion.p
          {...rise(followDelay)}
          className="mt-6 max-w-[52ch] font-body text-body-lg text-fg-muted"
        >
          {content.subheading}
        </motion.p>

        <motion.div {...rise(followDelay + 0.1)} className="mt-10 flex flex-wrap items-center gap-4">
          <Button href={content.primaryCta.href} size="lg">
            {content.primaryCta.label}
          </Button>
          <Button href={content.secondaryCta.href} size="lg" variant="outline" withArrow>
            {content.secondaryCta.label}
          </Button>
        </motion.div>
      </Container>
    </section>
  );
}
