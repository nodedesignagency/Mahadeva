import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The project's custom font-size scale, from the `--text-*` tokens in
 * theme.css.
 *
 * tailwind-merge ships knowing Tailwind's stock scale (`text-sm`, `text-lg`,
 * …). It cannot know ours, and `text-` is an ambiguous prefix — it is both the
 * font-size and the text-colour namespace. Faced with `text-body-md` it guesses
 * "colour", which lands it in the same conflict group as `text-fg-inverse` and
 * silently drops whichever came first.
 *
 * That was live: `Button` composes `cn(base, variants[variant], sizes[size])`,
 * so each variant's label colour was eaten by the size class that followed it
 * and the primary button rendered white-on-white.
 *
 * Naming the sizes here restores the split — these are font sizes, anything
 * else under `text-` is a colour.
 */
const fontSizes = [
  "display-xl",
  "display-lg",
  "display-md",
  "stat",
  "heading-lg",
  "heading-md",
  "heading-sm",
  "nav-mobile",
  "body-lg",
  "body-md",
  "body-sm",
  "label",
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: fontSizes }],
    },
  },
});

/**
 * Conditional class names with Tailwind conflict resolution, so a component's
 * default utilities can always be overridden by a caller's `className`.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
