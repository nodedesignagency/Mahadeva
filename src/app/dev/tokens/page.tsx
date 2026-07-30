import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Eyebrow, Heading, Text } from "@/components/ui/Typography";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { SplitText } from "@/components/motion/SplitText";

/**
 * Internal design-system preview.
 *
 * Not part of the site: excluded from the sitemap and marked noindex. Its job
 * is to make the token layer and motion primitives reviewable on their own,
 * before any real section is built on top of them. Delete this route before
 * shipping the template if you'd rather not ship it to buyers.
 */

export const metadata: Metadata = {
  title: "Design tokens",
  robots: { index: false, follow: false },
};

const swatches = [
  ["bg", "bg-bg"],
  ["bg-subtle", "bg-bg-subtle"],
  ["surface", "bg-surface"],
  ["surface-hover", "bg-surface-hover"],
  ["accent", "bg-accent"],
  ["accent-2", "bg-accent-2"],
  ["accent-3", "bg-accent-3"],
] as const;

const typeScale = [
  ["display-2xl", "display-2xl"],
  ["display-xl", "display-xl"],
  ["display-lg", "display-lg"],
  ["heading-lg", "heading-lg"],
  ["heading-md", "heading-md"],
  ["heading-sm", "heading-sm"],
] as const;

export default function TokensPage() {
  return (
    <>
      <Section spacing="md" labelledBy="tokens-title">
        <Eyebrow>Internal</Eyebrow>
        <Heading as="h1" size="display-lg" id="tokens-title" className="mt-4">
          Design tokens
        </Heading>
        <Text size="lg" className="mt-6 max-w-prose">
          Placeholder values. Replace the raw palette and font config once the Mahadeva reference is
          available — no component should need editing.
        </Text>
      </Section>

      <Section spacing="sm" labelledBy="colour-title">
        <Heading as="h2" size="heading-md" id="colour-title">
          Colour
        </Heading>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {swatches.map(([name, cls]) => (
            <div key={name}>
              <div className={`${cls} h-20 rounded-card border border-border`} />
              <Text size="sm" className="mt-2 font-mono">
                {name}
              </Text>
            </div>
          ))}
        </div>
      </Section>

      <Section spacing="sm" labelledBy="type-title">
        <Heading as="h2" size="heading-md" id="type-title">
          Type scale
        </Heading>
        <div className="mt-6 space-y-6">
          {typeScale.map(([name, size]) => (
            <div key={name} className="border-b border-border pb-6">
              <Text size="sm" className="font-mono">
                {name}
              </Text>
              <Heading as="p" size={size} className="mt-2">
                Automation that compounds
              </Heading>
            </div>
          ))}
        </div>
      </Section>

      <Section spacing="sm" labelledBy="button-title">
        <Heading as="h2" size="heading-md" id="button-title">
          Buttons
        </Heading>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button href="/" variant="primary" withArrow>
            Primary
          </Button>
          <Button href="/" variant="secondary">
            Secondary
          </Button>
          <Button href="/" variant="outline" withArrow>
            Outline
          </Button>
          <Button variant="ghost">Ghost button</Button>
          <Button href="/" size="lg" withArrow>
            Large
          </Button>
          <Button href="/" size="sm">
            Small
          </Button>
        </div>
      </Section>

      <Section spacing="sm" labelledBy="motion-title">
        <Heading as="h2" size="heading-md" id="motion-title">
          Motion primitives
        </Heading>

        <SplitText
          lines={["Masked line reveal,", "one line at a time."]}
          as="p"
          className="mt-8 text-display-lg text-balance-display font-medium"
        />

        <Reveal className="mt-10">
          <Text size="lg">Reveal — fade and rise once on scroll into view.</Text>
        </Reveal>

        <StaggerGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["Strategy", "Agents", "Automation", "Support"].map((label) => (
            <StaggerItem
              key={label}
              className="rounded-card border border-border bg-surface p-6 transition-colors duration-[--duration-hover] hover:bg-surface-hover"
            >
              <Text tone="default">{label}</Text>
              <Text size="sm" className="mt-2">
                Staggered grid item.
              </Text>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Section>
    </>
  );
}
