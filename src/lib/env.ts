/**
 * Reading environment variables without being caught out by an empty one.
 *
 * ── Why this exists ────────────────────────────────────────────────────────
 *
 * `process.env.X ?? "fallback"` looks like it handles a variable nobody set.
 * It does not. `??` only steps in for `null` and `undefined`, and a hosting
 * dashboard does not give you those — it gives you `""`. A row added with a
 * name and no value, or a whole `.env` block pasted in where some lines end at
 * the `=`, arrives as an empty string, sails past the `??`, and is used.
 *
 * That is not hypothetical. `NEXT_PUBLIC_SITE_URL=""` reached
 * `new URL("")` in the site's metadata, which throws `ERR_INVALID_URL` while
 * the module is still being evaluated — so the build died at "Failed to
 * collect page data" with no mention of the variable that caused it.
 *
 * `configured` treats blank as absent, which is what anyone setting a variable
 * to nothing meant by it.
 *
 * ── Why the value and not the name ─────────────────────────────────────────
 *
 * These take the value, not the variable's name, so every call site still
 * writes `process.env.NEXT_PUBLIC_THING` out in full. That matters: the
 * bundler finds those by literal text and substitutes the value at build time.
 * A lookup like `process.env[name]` is invisible to it, and every
 * `NEXT_PUBLIC_` variable would quietly read as undefined in the browser.
 */

/** The value, or `undefined` when it is missing, empty, or only spaces. */
export function configured(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * The same, for a value that has to survive `new URL()`.
 *
 * Also forgives the two ways an address gets typed wrong in a dashboard: a
 * trailing slash, and a missing scheme. `mahadeva.vercel.app` is what someone
 * copies out of a browser's address bar, and on its own it is not a URL —
 * `new URL()` throws on it exactly as it throws on `""`. Assuming `https://`
 * is safe here because there is no other scheme a public site is served over.
 *
 * Returns `undefined` rather than throwing if it is still not a URL after
 * that, so a mistyped address falls back to the default instead of taking the
 * build down with it.
 */
export function configuredUrl(value: string | undefined): string | undefined {
  const raw = configured(value);
  if (!raw) return undefined;

  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const trimmed = withScheme.replace(/\/+$/, "");

  try {
    new URL(trimmed);
    return trimmed;
  } catch {
    return undefined;
  }
}
