"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ElementType } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { textScramble } from "@/config/animation";
import { viewport } from "@/lib/motion";

/**
 * Scramble-appear — the owner's Framer University effect.
 *
 * A cursor walks the string from the left. Behind it every character has
 * settled; for a short run ahead of it they churn through the pool in the
 * accent green; beyond that they have not arrived yet.
 *
 * Nothing moves: characters that have not arrived are the real ones at zero
 * opacity, so the line holds its final width from the first frame and the
 * churn cannot reflow the text around it. Rendering blanks instead would have
 * the label growing as it played.
 *
 * Without JS, with reduced motion, or on the server, this is the finished
 * text — a label that never arrives is a label nobody can read.
 */

/** See StatCounter: the layout effect is the client's, and only the client's. */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type Frame = {
  /** How many characters have settled. */
  cursor: number;
  /** This tick's churn, one character per position. */
  noise: string[];
};

type ScrambleProps = {
  text: string;
  /**
   * The element to render. A label that heads a block of prose is a heading
   * and should be one; the footer's are not, which is why the default stays a
   * paragraph.
   */
  as?: "p" | "h2" | "h3" | "span";
  className?: string;
};

export function Scramble({ text, as = "p", className }: ScrambleProps) {
  // Widened deliberately: the ref is only ever read for `useInView`, and a
  // union of intrinsic elements narrows its type to the first of them.
  const Tag = as as ElementType;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, viewport);
  const reduced = useReducedMotion() ?? false;
  const [armed, setArmed] = useState(false);
  const [frame, setFrame] = useState<Frame | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!reduced) setArmed(true);
  }, [reduced]);

  // Parked at the start until the label is on screen, then played once.
  useIsomorphicLayoutEffect(() => {
    if (armed && !inView) setFrame({ cursor: 0, noise: [] });
  }, [armed, inView]);

  useEffect(() => {
    if (!armed || !inView) return;

    const pool = textScramble.characters;
    const draw = () =>
      // Called from a timer rather than during render, so the randomness
      // cannot make the server and client disagree.
      [...text].map(() => pool[Math.floor(Math.random() * pool.length)]);

    let interval = 0;
    const start = window.setTimeout(() => {
      let cursor = 0;
      setFrame({ cursor, noise: draw() });

      interval = window.setInterval(() => {
        cursor += 1;
        // Once the churn itself has run off the end, the line is settled and
        // the plain text takes over again.
        if (cursor > text.length + textScramble.letters) {
          window.clearInterval(interval);
          setFrame(null);
          return;
        }
        setFrame({ cursor, noise: draw() });
      }, textScramble.tick);
    }, textScramble.delay);

    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [armed, inView, text]);

  if (!frame) {
    return (
      <Tag ref={ref} className={className}>
        {text}
      </Tag>
    );
  }

  return (
    <Tag ref={ref} className={className}>
      {[...text].map((character, i) => {
        const settled = i < frame.cursor;
        const churning = !settled && i < frame.cursor + textScramble.letters;

        return (
          <span
            key={i}
            className={churning ? "text-accent" : undefined}
            style={settled || churning ? undefined : { opacity: 0 }}
          >
            {churning ? (frame.noise[i] ?? character) : character}
          </span>
        );
      })}
    </Tag>
  );
}
