import { Building2, CircleCheck, Rocket, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { Button } from "@/components/ui/Button";
import { sectionTextRevealDynamic } from "@/config/animation";
import type { PlanIcon, PlanTone, pricingContent } from "@/content/home";
import { cn } from "@/lib/cn";

/**
 * Pricing — "Flexible Plans for Every Growth Stage".
 *
 * The first beige section, so it is the section that finally exercises the
 * background transition's third variant.
 *
 * Each card is a coloured header strip — plan name left, its mark right —
 * over a white body wearing the strip's colour as a hairline border. The body
 * splits: price, pitch and the call to action on the left, the "includes"
 * list right of a grey rule. Launch and Scale share a row; Enterprise runs
 * the full width below with its list in two columns.
 *
 * A server component — nothing here moves beyond the heading's reveal.
 */

/** Strip fill and border come from theme.css, keyed by the plan's tone. */
const tones: Record<PlanTone, { strip: string; border: string }> = {
  sky: { strip: "bg-plan-sky", border: "border-plan-sky" },
  lavender: { strip: "bg-plan-lavender", border: "border-plan-lavender" },
  peach: { strip: "bg-plan-peach", border: "border-plan-peach" },
};

const icons: Record<PlanIcon, LucideIcon> = {
  launch: Zap,
  scale: Rocket,
  enterprise: Building2,
};

/** The coloured strip both cards and the enterprise panel open with. */
function PlanHeader({ name, tone, icon }: { name: string; tone: PlanTone; icon: PlanIcon }) {
  const Icon = icons[icon];
  return (
    <header
      className={cn("flex items-center justify-between px-4 py-3", tones[tone].strip)}
    >
      <p className="font-body text-body-md text-fg-on-light">{name}</p>
      <Icon aria-hidden="true" className="size-5 text-fg-on-light" />
    </header>
  );
}

/** One "includes" entry: the circled check and its words. */
function Feature({ children }: { children: string }) {
  return (
    <li className="flex items-center gap-3">
      <CircleCheck aria-hidden="true" className="size-5 shrink-0 text-fg-on-light" />
      <span className="font-body text-body-md text-fg-on-light">{children}</span>
    </li>
  );
}

/** The grey "PLAN INCLUDES:" label above each list. */
function IncludesTitle({ children }: { children: string }) {
  return (
    <p className="font-ui text-body-md font-light tracking-(--tracking-label) uppercase text-fg-on-light-muted">
      {children}
    </p>
  );
}

type PricingProps = {
  content: typeof pricingContent;
};

export function Pricing({ content }: PricingProps) {
  return (
    <section data-bg="beige" className="bg-bg-light py-20 text-fg-on-light">
      <Container className="px-10">
        <TextReveal
          as="h2"
          lines={content.headingLines}
          settings={sectionTextRevealDynamic}
          lineStagger={sectionTextRevealDynamic.lineStagger}
          className="flex flex-col items-center gap-(--space-heading-line) text-center text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal"
        />
        <p className="text-ink-dynamic mx-auto mt-6 max-w-[56ch] text-center font-body text-body-md leading-[1.5]">
          {content.subheading}
        </p>

        <div className="mt-15 grid gap-3 desktop:grid-cols-2">
          {content.plans.map((plan) => (
            <article key={plan.name} className="flex flex-col">
              <PlanHeader name={plan.name} tone={plan.tone} icon={plan.icon} />
              <div
                className={cn(
                  // The reference holds the body at ~21rem, which is where the
                  // air between the pitch and the bottom-anchored button comes
                  // from — the columns alone would collapse it.
                  "grid flex-1 border bg-bg-white p-6 max-tablet:gap-8 tablet:min-h-[21rem] tablet:grid-cols-2",
                  tones[plan.tone].border,
                )}
              >
                <div className="flex flex-col tablet:pr-6">
                  {/* Figure in Geist Light, like every number on the site;
                      the $ rides smaller on the same baseline. */}
                  <p className="flex items-baseline gap-1 font-ui font-light">
                    <span className="text-display-md">$</span>
                    <span className="text-display-xl leading-none">{plan.price.amount}</span>
                    <span className="font-body text-body-md text-fg-on-light-muted">
                      {plan.price.period}
                    </span>
                  </p>
                  <p className="mt-5 font-body text-body-md leading-[1.5]">{plan.body}</p>
                  <Button
                    href={plan.cta.href}
                    variant="secondary"
                    withArrow
                    className="mt-auto w-full max-tablet:mt-8"
                  >
                    {plan.cta.label}
                  </Button>
                </div>

                <div className="flex flex-col gap-6 border-border-on-light tablet:border-l tablet:pl-6">
                  <IncludesTitle>{plan.includesTitle}</IncludesTitle>
                  <ul className="flex flex-col gap-4">
                    {plan.includes.map((item) => (
                      <Feature key={item}>{item}</Feature>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>

        <article className="mt-4 flex flex-col">
          <PlanHeader
            name={content.enterprise.name}
            tone={content.enterprise.tone}
            icon={content.enterprise.icon}
          />
          <div
            className={cn(
              "grid flex-1 border bg-bg-white p-6 max-tablet:gap-8 tablet:grid-cols-2",
              tones[content.enterprise.tone].border,
            )}
          >
            <div className="flex flex-col tablet:pr-6">
              <p className="font-display text-display-xl leading-none">{content.enterprise.title}</p>
              <p className="mt-6 max-w-[52ch] font-body text-body-md leading-[1.5]">
                {content.enterprise.body}
              </p>
              <Button
                href={content.enterprise.cta.href}
                variant="secondary"
                withArrow
                className="mt-auto w-full max-tablet:mt-8"
              >
                {content.enterprise.cta.label}
              </Button>
            </div>

            <div className="flex flex-col gap-6 border-border-on-light tablet:border-l tablet:pl-6">
              <IncludesTitle>{content.enterprise.includesTitle}</IncludesTitle>
              {/* Two columns read down, exactly the owner's order. */}
              <div className="grid gap-4 tablet:grid-cols-2 tablet:gap-x-8">
                {content.enterprise.includes.map((column, i) => (
                  <ul key={i} className="flex flex-col gap-4">
                    {column.map((item) => (
                      <Feature key={item}>{item}</Feature>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          </div>
        </article>
      </Container>
    </section>
  );
}
