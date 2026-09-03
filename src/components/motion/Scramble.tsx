"use client";

import { useEffect, useRef, useState } from "react";
import type { ElementType } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { textScramble } from "@/config/animation";
import { cn } from "@/lib/cn";
import { viewportOnEntry } from "@/lib/motion";
import { useIsomorphicLayoutEffect } from "@/lib/useIsomorphicLayoutEffect";

/**
 * Scramble-appear — the owner's Framer University effect.
 *
 * A cursor walks the string from the left. Behind it every character has
 * settled; ahead of it they churn through the pool in the accent green.
 *
 * The whole line churns, not a short run of it, and there are only three
 * states it can be in: nothing yet, churning, or finished. There is no resting
 * state in which part of the line is showing — both times this component has
 * been reported broken, that is what was on screen. First six characters ahead
 * of the cursor with the rest at zero opacity, so a waiting heading read as
 * "Our Mi"; then, once every character churned, a waiting heading read as the
 * finished words in the accent green. Both were the *waiting* state painting
 * something, and neither was the animation.
 *
 * Nothing shifts while it plays: the characters are the real ones throughout,
 * so the line holds its final width and the churn cannot reflow the text
 * around it. Rendering blanks instead would have the label growing as it
 * played.
 *
 * Without JS, with reduced motion, or on the server, this is the finished
 * text — a label that never arrives is a label nobody can read.
 */

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
  const inView = useInView(ref, viewportOnEntry);
  const reduced = useReducedMotion() ?? false;
  const [armed, setArmed] = useState(false);
  const [frame, setFrame] = useState<Frame | null>(null);
  /** Set once the run has finished, which is what tells the two `frame`-less
   * states apart: nothing yet, and settled. */
  const [played, setPlayed] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (!reduced) setArmed(true);
  }, [reduced]);

  /**
   * Waiting to play: armed, and the first churned frame has not landed.
   *
   * Derived rather than held as a frame of its own, which is what it used to
   * be — `{ cursor: 0, noise: [] }`. That frame painted every character in the
   * accent green, and with no noise to draw each one fell back to its real
   * self, so a heading that had not started yet sat on screen as the finished
   * words in green. Nothing about it moved and nothing said it was waiting; it
   * simply read as a heading in the wrong colour.
   *
   * It is `!frame` and not `!inView` because the run does not begin the
   * instant the label is reached — `textScramble.delay` holds it 200ms. Keyed
   * to the viewport, those 200ms are spent showing the finished words in
   * ordinary ink, so the reader is given the answer and then watches it
   * scramble towards what they have already read.
   */
  const waiting = armed && !played && !frame;

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
          setPlayed(true);
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

  // Nothing is painted before the effect starts, and the whole of it is
  // painted after: this is an appearance, so there is no state in which a
  // half-finished version of the line is the resting one. `invisible` rather
  // than an unrendered line, so the text still holds its space and the page
  // does not reflow around it when it arrives.
  if (!frame) {
    return (
      <Tag ref={ref} className={cn(className, waiting && "invisible")}>
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
