"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import NumberFlow from "@number-flow/react";
// Named for the plan they belong to rather than what they show, as the feature
// card artwork is: launch is the bolt, scale the rocket, enterprise the
// building.
import enterpriseMark from "@public/uploads/icons/plan-enterprise.png";
import launchMark from "@public/uploads/icons/plan-launch.png";
import scaleMark from "@public/uploads/icons/plan-scale.png";
import tick from "@public/uploads/icons/tick-circled-ink.png";
import { BillingToggle } from "@/components/ui/BillingToggle";
import { Button } from "@/components/ui/Button";
import type { PlanIcon, PlanTone, pricingContent } from "@/content/pricing";
import { cn } from "@/lib/cn";

/**
 * The plan cards and the switch above them.
 *
 * A client island because the billing period is state shared between the
 * toggle and every price; the section around it stays a server component.
 *
 * Card geometry to the owner's spec: a fixed 368px body on desktop and a 3px
 * border in the plan's own colour.
 *
 * The figures roll on `@number-flow/react` — the library behind the component
 * the original uses. Worth taking over hand-rolling it: the digit columns are
 * measured against the real font rather than assumed to be one em, so the
 * numbers sit on the same baseline as the currency mark beside them, which a
 * hand-built `overflow: hidden` column cannot do.
 */

/** Strip fill and border come from theme.css, keyed by the plan's tone. */
const tones: Record<PlanTone, { strip: string; border: string }> = {
  sky: { strip: "bg-plan-sky", border: "border-plan-sky" },
  lavender: { strip: "bg-plan-lavender", border: "border-plan-lavender" },
  peach: { strip: "bg-plan-peach", border: "border-plan-peach" },
};

/**
 * Plan to mark. These are the owner's exports rather than icon-font glyphs, so
 * unlike everything else on the page they carry their own colour — ink, fixed.
 * That holds here because a plan header is a pastel strip and the includes list
 * a white card; both are light, and neither ever inverts. An icon that has to
 * follow the surface has to be inline instead — see `SiteIcons`.
 */
const icons: Record<PlanIcon, StaticImageData> = {
  launch: launchMark,
  scale: scaleMark,
  enterprise: enterpriseMark,
};

/** The coloured strip both cards and the enterprise panel open with. */
function PlanHeader({ name, tone, icon }: { name: string; tone: PlanTone; icon: PlanIcon }) {
  return (
    <header className={cn("flex items-center justify-between px-4 py-3", tones[tone].strip)}>
      <p className="font-body text-body-md text-fg-on-light">{name}</p>
      {/* size-10, where the Lucide glyph it replaced was size-5. The export
          keeps about a quarter of its canvas as clear space on every side, so
          the mark inside a 20px box came out at 9px — half what stood there
          before. Twice the box puts the mark itself back at 20. */}
      <Image src={icons[icon]} alt="" aria-hidden sizes="40px" className="size-10" />
    </header>
  );
}

/** One "includes" entry: the circled check and its words, Almarai 16. */
function Feature({ children }: { children: string }) {
  return (
    <li className="flex items-center gap-3">
      <Image src={tick} alt="" aria-hidden sizes="20px" className="size-5 shrink-0" />
      <span className="font-body text-[1rem] font-normal text-fg-on-light">{children}</span>
    </li>
  );
}

/**
 * The "PLAN INCLUDES:" label: Geist Light 16 in the owner's grey. Tracking is
 * normal, not the widened label tracking used elsewhere — uppercase here is
 * the original's casing, not a spaced-out eyebrow.
 */
function IncludesTitle({ children }: { children: string }) {
  return (
    <p className="font-ui text-[1rem] font-light tracking-normal uppercase text-fg-label">
      {children}
    </p>
  );
}

/** Shared body shell: 3px border in the plan's colour, fixed height on desktop. */
function PlanBody({ tone, children }: { tone: PlanTone; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        // `flex-none` at desktop matters: `flex-1` sets flex-basis 0, which
        // wins over `height` in a column flex, so the fixed 368 would be
        // silently ignored. Below desktop `flex-1` is what equalises a row.
        "grid flex-1 border-[3px] bg-bg-white p-6 max-tablet:gap-8 tablet:grid-cols-2 desktop:h-[368px] desktop:flex-none",
        tones[tone].border,
      )}
    >
      {children}
    </div>
  );
}

type PricingPlansProps = {
  content: typeof pricingContent;
};

export function PricingPlans({ content }: PricingPlansProps) {
  const [yearly, setYearly] = useState(false);

  return (
    <>
      <div className="mt-10">
        <BillingToggle yearly={yearly} onChange={setYearly} labels={content.billing} />
      </div>

      <div className="mt-15 grid gap-3 desktop:grid-cols-2">
        {content.plans.map((plan) => (
          <article key={plan.name} className="flex flex-col">
            <PlanHeader name={plan.name} tone={plan.tone} icon={plan.icon} />
            <PlanBody tone={plan.tone}>
              {/* Price and pitch are one stack 28px apart, per the owner. */}
              <div className="flex flex-col tablet:pr-6">
                <div className="flex flex-col gap-7">
                  {/* $ is Geist regular 24, the figure Geist Light 36, and
                      /month Almarai 16 — three faces on one baseline, which
                      is why every part carries `leading-[1em]`: mixed sizes
                      on default leading each build a different line box, and
                      the baselines drift apart. */}
                  <p className="flex items-baseline font-ui leading-[1em] text-fg-on-light">
                    <span className="text-[1.5rem] font-normal tracking-normal">$</span>
                    <NumberFlow
                      value={yearly ? plan.price.yearly : plan.price.monthly}
                      // The library animates each digit itself; it needs the
                      // plain number, and formats and rolls from there.
                      className="text-[2.25rem] font-light tracking-normal leading-[1em]"
                    />
                    <span className="ml-1 font-body text-[1rem] font-normal leading-[1em] text-fg-on-light-muted">
                      {plan.price.period}
                    </span>
                  </p>
                  <p className="font-body text-[1rem]">{plan.body}</p>
                </div>
                <Button
                  href={plan.cta.href}
                  variant="plan"
                  withArrow
                  className="mt-auto w-full max-tablet:mt-8"
                >
                  {plan.cta.label}
                </Button>
              </div>

              <div className="flex flex-col gap-5 border-border-on-light tablet:border-l tablet:pl-6">
                <IncludesTitle>{plan.includesTitle}</IncludesTitle>
                {/* 20px between entries, per the original's stack. */}
                <ul className="flex flex-col gap-5">
                  {plan.includes.map((item) => (
                    <Feature key={item}>{item}</Feature>
                  ))}
                </ul>
              </div>
            </PlanBody>
          </article>
        ))}
      </div>

      <article className="mt-4 flex flex-col">
        <PlanHeader
          name={content.enterprise.name}
          tone={content.enterprise.tone}
          icon={content.enterprise.icon}
        />
        <PlanBody tone={content.enterprise.tone}>
          <div className="flex flex-col tablet:pr-6">
            <div className="flex flex-col gap-7">
              {/* Geist Light 36, matching the figures it stands in for. */}
              <p className="font-ui text-[2.25rem] font-light tracking-normal leading-[1em] text-fg-on-light">
                {content.enterprise.title}
              </p>
              <p className="max-w-[52ch] font-body text-[1rem]">
                {content.enterprise.body}
              </p>
            </div>
            <Button
              href={content.enterprise.cta.href}
              variant="plan"
              withArrow
              className="mt-auto w-full max-tablet:mt-8"
            >
              {content.enterprise.cta.label}
            </Button>
          </div>

          <div className="flex flex-col gap-5 border-border-on-light tablet:border-l tablet:pl-6">
            <IncludesTitle>{content.enterprise.includesTitle}</IncludesTitle>
            {/* Two columns read down, exactly the owner's order. */}
            <div className="grid gap-5 tablet:grid-cols-2 tablet:gap-x-8">
              {content.enterprise.includes.map((column, i) => (
                <ul key={i} className="flex flex-col gap-5">
                  {column.map((item) => (
                    <Feature key={item}>{item}</Feature>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </PlanBody>
      </article>
    </>
  );
}
