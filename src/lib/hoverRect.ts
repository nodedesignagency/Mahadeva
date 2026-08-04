import type { CSSProperties } from "react";

/**
 * The hover-block geometry shared by the case study cards and the trust
 * statistics.
 *
 * A rectangle is written at its *hovered* position — the edges it is anchored
 * to and the offsets from them — plus `dx`/`dy`, how far from there it waits at
 * rest. That is what the browser animates: the element is laid out where it
 * ends up and `translate` carries it to and from the outside. Animating
 * `left`/`top` would relayout every frame.
 *
 * Offsets are numbers (pixels) or any CSS length — a centred block is anchored
 * with a `calc()` rather than a transform, since `translate` is spoken for.
 */
export type HoverRect = {
  w: number;
  h: number;
  left?: number | string;
  right?: number | string;
  top?: number | string;
  bottom?: number | string;
  /** Resting offset from the hovered position, in px. */
  dx: number;
  dy: number;
};

/** A rectangle's laid-out box. Only the edges it names are anchored. */
export function hoverRectBox(rect: HoverRect): CSSProperties {
  const box: CSSProperties = { width: rect.w, height: rect.h };
  if (rect.left !== undefined) box.left = rect.left;
  if (rect.right !== undefined) box.right = rect.right;
  if (rect.top !== undefined) box.top = rect.top;
  if (rect.bottom !== undefined) box.bottom = rect.bottom;
  return box;
}
