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
 * settled; ahead of it they churn through the pool in the accent green.
 *
 * The whole line churns, not a short run of it. It used to be six characters
 * ahead of the cursor with everything beyond them at zero opacity, and on a
 * heading that reads as half a word: "Our Mission" spent the first half of its
 * run as "Our Mi" with nothing after it, which looks like a bug rather than an
 * effect. Every character is on screen from the first frame now, and what
 * moves through the line is which of them have settled.
 *
 * Nothing shifts while it plays: the characters are the real ones throughout,
 * so the line holds its final width and the churn cannot reflow the text
 * around it. Rendering blanks instead would have the label growing as it
 * played.
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
  /**
   * Milliseconds per character, where the site's default pace is not wanted.
   *
   * The pace is a property of what the effect is being asked to do, not of the
   * effect: a label playing once as a page is read can take its time, while
   * one that has to land inside a swap cannot. Its own prop rather than a
   * second config export, so the caller's reason for the number stays next to
   * the caller.
   */
  tick?: number;
  className?: string;
};

export function Scramble({
  text,
  as = "p",
  tick = textScramble.tick,
  className,
}: ScrambleProps) {
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
        // Once the cursor has passed the last character the line is settled
        // and the plain text takes over again.
        if (cursor > text.length) {
          window.clearInterval(interval);
          setFrame(null);
          return;
        }
        setFrame({ cursor, noise: draw() });
      }, tick);
    }, textScramble.delay);

    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [armed, inView, text, tick]);

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

        return (
          <span key={i} className={settled ? undefined : "text-accent"}>
            {settled ? character : (frame.noise[i] ?? character)}
          </span>
        );
      })}
    </Tag>
  );
}
