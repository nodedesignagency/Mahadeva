import type { Metadata } from "next";
import { PageSurface } from "@/components/layout/PageSurface";
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
 *
 * ⚠️ Every class here has to name a token that exists. A swatch is the one
 * thing on the site where a dead `--color-*` does not look like a bug — an
 * empty tile on a page of tiles reads as a colour that happens to be pale —
 * so this page hid three renamed tokens (`bg-subtle`, `accent-2`, `accent-3`)
 * and a dropped type size (`display-2xl`) for as long as it took someone to
 * measure one. If you add a row, read the fill back off the element rather
 * than trusting the class: `getComputedStyle(el).backgroundColor`.
 *
 * `check-pages.mjs` skips `/dev/`, so the surface below is not enforced here
 * the way it is everywhere else. It still has to be right: without it this
 * page wore the light header over its own dark ground, which is the first
 * mistake AGENTS.md warns about, demonstrated by the file meant to document
 * the system.
 */

export const metadata: Metadata = {
  title: "Design tokens",
  robots: { index: false, follow: false },
};

type Swatch = readonly [name: string, className: string];

const swatchGroups: readonly {
  title: string;
  note: string;
  swatches: readonly Swatch[];
}[] = [
  {
    title: "Surfaces",
    note: "The three grounds the site sits on, and the panels raised off the dark one.",
    swatches: [
      ["bg", "bg-bg"],
      ["bg-raised", "bg-bg-raised"],
      ["surface", "bg-surface"],
      ["surface-hover", "bg-surface-hover"],
      ["bg-white", "bg-bg-white"],
      ["bg-light", "bg-bg-light"],
    ],
  },
  {
    title: "Brand and motion",
    note: "The accent, the focus ring it doubles as, and the four fills that cover the screen between pages.",
    swatches: [
      ["accent", "bg-accent"],
      ["focus", "bg-focus"],
      ["wipe-1", "bg-wipe-1"],
      ["wipe-2", "bg-wipe-2"],
      ["wipe-3", "bg-wipe-3"],
      ["preloader", "bg-preloader"],
    ],
  },
  {
    title: "Card tints",
    note: "One family of many. A card's fill is chosen in content through its `tone`, not in the component.",
    swatches: [
      ["card-blue", "bg-card-blue"],
      ["card-green", "bg-card-green"],
      ["card-lavender", "bg-card-lavender"],
      ["card-peach", "bg-card-peach"],
      ["card-magenta", "bg-card-magenta"],
      ["card-rose", "bg-card-rose"],
    ],
  },
];

const typeScale = [
  ["display-xl", "display-xl"],
  ["display-lg", "display-lg"],
  ["display-md", "display-md"],
  ["heading-lg", "heading-lg"],
  ["heading-md", "heading-md"],
  ["heading-sm", "heading-sm"],
] as const;

export default function TokensPage() {
  return (
    <>
      {/* Dark the whole way down, so the header's strip never flips. Not
          enforced here — check-pages skips /dev/ — and so all the more worth
          stating. */}
      <PageSurface value="dark" />

      <Section spacing="md" labelledBy="tokens-title">
        <Eyebrow>Internal</Eyebrow>
        <Heading as="h1" size="display-lg" id="tokens-title" className="mt-4">
          Design tokens
        </Heading>
        <Text size="lg" className="mt-6 max-w-prose">
          A sheet of what the theme currently resolves to. Every value on it
          comes from
          <code className="px-1 font-ui">src/styles/theme.css</code> — change
          one there and it changes here, and everywhere else, without a
          component being touched.
        </Text>
        <Text size="sm" className="mt-4 max-w-prose">
          This is a scratch route, not part of the site. It is noindex, excluded
          from the sitemap, and safe to delete:{" "}
          <code className="px-1 font-ui">rm -rf src/app/(site)/dev</code>.
        </Text>
      </Section>

      <Section spacing="sm" labelledBy="colour-title">
        <Heading as="h2" size="heading-md" id="colour-title">
          Colour
        </Heading>

        <div className="mt-8 flex flex-col gap-10">
          {swatchGroups.map((group) => (
            <div key={group.title}>
              <Heading as="h3" size="heading-sm">
                {group.title}
              </Heading>
              <Text size="sm" className="mt-1 max-w-prose">
                {group.note}
              </Text>

              {/* The project's own breakpoints. There is no `sm:` or `lg:` in
                  this design system — see DESIGN.md. */}
              <div className="mt-5 grid grid-cols-2 gap-4 tablet:grid-cols-3 desktop:grid-cols-6">
                {group.swatches.map(([name, cls]) => (
                  <div key={name}>
                    {/* The border is load-bearing on this page: a swatch whose
                        fill matches the ground behind it would otherwise read
                        as an empty tile, which is exactly how three dead
                        tokens went unnoticed here. */}
                    <div
                      className={`${cls} h-20 rounded-card border border-border`}
                    />
                    <Text size="sm" className="mt-2 font-ui">
                      {name}
                    </Text>
                  </div>
                ))}
              </div>
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
              <Text size="sm" className="font-ui">
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
          <Button href="/" withArrow>
            Default (44px)
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
          <Text size="lg">
            Reveal — fade and rise once on scroll into view.
          </Text>
        </Reveal>

        <StaggerGroup className="mt-10 grid gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
          {["Strategy", "Agents", "Automation", "Support"].map((label) => (
            <StaggerItem
              key={label}
              className="rounded-card border border-border bg-surface p-6 transition-colors duration-(--duration-hover) hover:bg-surface-hover"
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
