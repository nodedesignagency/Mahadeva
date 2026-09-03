"use client";

import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect` on the client, `useEffect` on the server.
 *
 * React warns when `useLayoutEffect` is rendered on the server, and rightly:
 * there is no layout there to read or write before a paint. The components
 * that reach for it here all want the same thing — to arm an animation after
 * the server's markup has been matched but before the browser has painted, so
 * that arming it costs no flash of the un-animated state. On the server that
 * work is simply not the layout kind, and the plain effect says so without the
 * warning.
 *
 * Four components had their own copy of this line, each with a comment
 * pointing at one of the others. One line, one home.
 */
export const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;
