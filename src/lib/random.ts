/**
 * Deterministic randomness.
 *
 * Every "random" arrangement on this site is generated from a seed and never
 * from `Math.random()`. The server and the client both render it, and an
 * unseeded source would produce two different pages and a hydration error —
 * and on a statically built page it would produce whatever the build machine
 * happened to roll and then never change again.
 *
 * Seeding from something about the content instead means the arrangement is a
 * property of the thing: the same study picks the same neighbours every time,
 * two different studies almost certainly pick different ones, and nothing has
 * to be stored to keep it that way.
 */

/** Mulberry32 — small, fast, deterministic for a given seed. */
export function createRandom(seed: number) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a, so a string can be a seed. */
export function hashString(value: string) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * `count` items from `items`, in an order decided by `seed`.
 *
 * A partial Fisher-Yates: it stops once it has what it was asked for rather
 * than shuffling the whole list, and it copies rather than sorting in place,
 * since the caller's array is usually the cached content.
 */
export function pickSeeded<T>(items: readonly T[], count: number, seed: number): T[] {
  const pool = [...items];
  const random = createRandom(seed);
  const taken: T[] = [];

  while (taken.length < count && pool.length > 0) {
    const index = Math.floor(random() * pool.length);
    taken.push(pool.splice(index, 1)[0]);
  }

  return taken;
}
