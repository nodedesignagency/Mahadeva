/**
 * Opens every route in the built artifact and fails if one will not open.
 *
 * This exists because a route can be perfect on the site and dead in the
 * bundle, and nothing else notices. `/pricing` was: it rendered, navigated and
 * screenshotted correctly under `next start`, and in the artifact the router
 * fetched its payload, refused it, and stopped — no console error, no failed
 * request, no thrown promise. What the reader saw was the wipe closing over
 * the screen and staying there for the full 2.5s of `pageWipe.rescue`, then a
 * page that never changed. It shipped that way for days because every check
 * this project had was looking at the site.
 *
 * So the check is the only one that can catch it: drive the actual bundle the
 * way a reader does — behind a host-style path prefix, inside a sandboxed
 * frame — click each route's own link, and assert the router arrived.
 *
 * Run by `npm run artifact`, after the bundle is written, so a bundle that
 * cannot open one of its own pages is never published.
 */

import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const root = path.join(import.meta.dirname, "..");
const FILE = path.join(root, "site.html");
const ID = "artifact-route-check";
const PREFIX = `/_f/${ID}/`;

if (!fs.existsSync(FILE)) {
  console.error("\n  Artifact route check: site.html not found. Run `npm run artifact`.\n");
  process.exit(1);
}

/* The browser. Chromium is not a dependency of this project, so it is looked
   for where the environments that run this keep it. If it is genuinely absent
   the check cannot answer, and a check that cannot answer must not pass:
   silence is exactly how the bug it guards got out. */
let chromium;
try {
  ({ chromium } = await import("playwright-core"));
} catch {
  console.error(
    "\n  Artifact route check: playwright-core is not installed.\n" +
      "  It is a devDependency of this project — run `npm install`.\n",
  );
  process.exit(1);
}

const CANDIDATES = [
  process.env.CHROME_PATH,
  process.env.PLAYWRIGHT_BROWSERS_PATH &&
    path.join(process.env.PLAYWRIGHT_BROWSERS_PATH, "chromium", "chrome"),
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);

let executablePath = CANDIDATES.find((p) => {
  try { return fs.existsSync(p); } catch { return false; }
});

const site = fs.readFileSync(FILE, "utf8");

/* The routes the bundle says it has, read off its own page index rather than
   from the app folder: what is being checked is the bundle, not the source. */
const listed = site.match(/var PAGES=(\[[^\]]*\])/);
const routes = listed ? JSON.parse(listed[1]) : [];
if (!routes.length) {
  console.error("\n  Artifact route check: could not read the bundle's route list.\n");
  process.exit(1);
}

/* Served the way a published artifact is: from a path of the host's choosing,
   with a <base href>, inside a sandboxed frame. Each of those is load-bearing
   — the address being the host's and not the route is what broke the wipe's
   same-page guard, and it is the condition this whole file exists to hold. */
const WRAP =
  `<!doctype html><html><head><base href="${PREFIX}">` +
  `<meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1">` +
  `</head><body>\n${site}\n</body></html>`;
const PARENT =
  `<!doctype html><html><head><meta charset=utf8>` +
  `<style>html,body{margin:0;height:100%}iframe{display:block;width:100vw;height:100vh;border:0}</style>` +
  `</head><body><iframe src="${PREFIX}" sandbox="allow-scripts allow-same-origin"></iframe></body></html>`;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  const body =
    url.pathname === "/" ? PARENT
    : url.pathname === PREFIX || url.pathname === PREFIX.slice(0, -1) ? WRAP
    : null;
  if (body === null) { res.writeHead(404).end("not found"); return; }
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(body);
});
await new Promise((r) => server.listen(0, r));
const origin = `http://localhost:${server.address().port}`;

if (!executablePath) {
  server.close();
  console.error(
    "\n  Artifact route check: no Chromium found.\n" +
      "  Set CHROME_PATH to a Chrome or Chromium binary, or install one.\n" +
      "  This check is not skipped when it cannot run: a bundle whose routes\n" +
      "  have not been opened is exactly what shipped broken before.\n",
  );
  process.exit(1);
}

const browser = await chromium.launch({ executablePath, headless: true });
const failures = [];
const verified = [];

/* A detail page is not linked from the home page — the blog index links its
   posts, the careers index its openings — so reaching one is two hops, the
   same two a reader makes. A route this cannot reach is reported, never
   skipped: a check that goes quiet about what it did not look at is how the
   thing it guards got out in the first place. */
const indexOf = (route) => {
  const cut = route.lastIndexOf("/");
  return cut > 0 ? route.slice(0, cut) : "/";
};

const clickTo = (frame, want) =>
  frame.evaluate((route) => {
    const hit = [...document.querySelectorAll("a[href]")].find((a) => {
      try { return new URL(a.getAttribute("href"), location.href).pathname === route && a.isConnected; }
      catch { return false; }
    });
    if (!hit) return false;
    hit.click();
    return true;
  }, want);

async function check(route) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    // A reader's conditions, wipe and all. Turning the wipe off makes a
    // failure show a couple of seconds sooner and costs the check the one
    // class of bug that only appears when the wipe is the thing driving the
    // navigation — which is most of them, since the wipe is what calls the
    // router on every internal link.
    reducedMotion: "no-preference",
  });
  try {
    const page = await context.newPage();
    await page.goto(origin + "/", { waitUntil: "load" });
    const frame = page.frames().find((f) => f.url().includes("/_f/"));
    if (!frame) return [route, "the artifact frame never loaded"];
    await frame.waitForLoadState("load");
    await page.waitForTimeout(3500); // boot, hydrate, and let the preloader finish

    if (!(await clickTo(frame, route))) {
      // Not on the home page. Go through its index, the way a reader would.
      const index = indexOf(route);
      if (index === route || !(await clickTo(frame, index))) {
        return [route, "nothing on the site links to it, and neither does its index"];
      }
      await page.waitForTimeout(5200);
      if ((await frame.evaluate(() => window.__mhRoute)) !== index) {
        return [route, `its index ${index} does not open either`];
      }
      if (!(await clickTo(frame, route))) {
        return [route, `${index} opened but carries no link to it`];
      }
    }

    await page.waitForTimeout(5200); // cover, hold, sweep, and the rescue past it
    const arrived = await frame.evaluate(() => window.__mhRoute).catch(() => null);
    if (arrived !== route) {
      return [route, `clicking its link left the router at ${JSON.stringify(arrived)}`];
    }
    return null;
  } finally {
    await context.close();
  }
}

/* A few at a time. One at a time is nine seconds a route and nobody waits for
   that on every build; all at once starves them and they time out on a laptop. */
const queue = routes.filter((r) => r !== "/");
const LANES = 4;
try {
  await Promise.all(
    Array.from({ length: LANES }, async () => {
      for (;;) {
        const route = queue.shift();
        if (route === undefined) return;
        const bad = await check(route);
        if (bad) failures.push(bad);
        else verified.push(route);
      }
    }),
  );
} finally {
  await browser.close();
  server.close();
}

failures.sort((a, b) => a[0].localeCompare(b[0]));

if (failures.length) {
  console.error("\n  Artifact route check failed — the bundle cannot open its own pages:\n");
  for (const [route, why] of failures) {
    console.error(`  - ${route}\n      ${why}`);
  }
  console.error(
    "\n  This is what a reader sees as a page that will not open: the wipe covers\n" +
      "  the screen and sits there until the rescue lets it go. The site itself may\n" +
      "  be perfectly fine — check it with `npm run build && npx next start` — the\n" +
      "  fault is in the bundle or in something the bundle does differently.\n" +
      "  See AGENTS.md, \"A route can be alive on the site and dead in the bundle\".\n",
  );
  process.exit(1);
}

console.log(`  Artifact route check: ${verified.length} of ${routes.length - 1} routes open.`);
