/**
 * Bundle the built site into one self-contained HTML file, so a section can be
 * published as a shareable preview and checked in a real browser.
 *
 * Usage:  npm run build && node scripts/build-preview.mjs [outfile]
 *
 * Everything the page needs is folded in: stylesheets, every JS chunk, fonts
 * and the favicon as data URIs. The result opens from disk or from any host
 * with no server and no network.
 *
 * Four things make this work, each of which fails silently or confusingly if
 * you skip it — they are the reason this is a script and not a one-liner:
 *
 *  1. A chunk containing the literal `</script>` closes the tag early and
 *     spills the rest of the bundle into the page as text.
 *  2. Turbopack identifies each chunk by its own script `src`. Inline scripts
 *     have none, so `getAttribute("src")` returns null and the runtime throws
 *     before React ever hydrates. Each chunk is given back the URL it was
 *     served from — and specifically the *relative* form from `getAttribute`,
 *     since the runtime keys chunks off a `startsWith("/_next/")` check while
 *     the `.src` property stays absolute, exactly as a real script tag behaves.
 *  3. Client-component chunks that the initial HTML never references are still
 *     awaited during hydration. Nothing can fetch them here, so every
 *     remaining chunk is appended.
 *  4. `next/font` declares its family variables on hashed classes carried by
 *     <html>. A host page that supplies its own <html> loses them and every
 *     face silently falls back to system-ui, so they are hoisted to :root.
 *
 * Known tradeoff: the App Router renders <html> and <body> itself, so when the
 * page is embedded in a host that owns those elements React logs #418 and
 * re-renders on the client instead of hydrating. The end state is correct.
 * Handing the app its own document instead (an iframe via `srcdoc` or `blob:`)
 * trades that for a worse failure — `location.href` is then `about:srcdoc` or
 * an opaque blob origin, the runtime's URL resolution breaks, and the page
 * renders but never animates.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = ".next";
const read = (url) => fs.readFileSync(path.join(ROOT, url.replace("/_next/", "")));

if (!fs.existsSync(path.join(ROOT, "server/app/index.html"))) {
  console.error("No build found. Run `npm run build` first.");
  process.exit(1);
}

let html = fs.readFileSync(path.join(ROOT, "server/app/index.html"), "utf8");

const mime = (f) =>
  f.endsWith(".woff2") ? "font/woff2"
  : f.endsWith(".ico") ? "image/x-icon"
  : f.endsWith(".svg") ? "image/svg+xml"
  : "application/octet-stream";
const dataUri = (u) => `data:${mime(u)};base64,${read(u).toString("base64")}`;

/** Inline a chunk, restoring the identity the runtime expects. See note 2. */
const scriptTag = (url) => {
  const js = read(url)
    .toString("utf8")
    .replace(/<\/script/gi, "<\\/script")
    // A decoder polyfill carries literal U+FFFD characters. They are real
    // source, but a raw U+FFFD reads as mojibake to anything validating the
    // payload, so emit escapes — identical inside the string literals they
    // appear in.
    .replace(/�/g, "\\u" + "FFFD");
  const prelude =
    `(function(){var s=document.currentScript;if(!s)return;` +
    `var a=${JSON.stringify(url)},u=a;` +
    `try{u=new URL(a,document.baseURI||location.href).href}catch(e){}` +
    `try{Object.defineProperty(s,"src",{value:u,configurable:true});}catch(e){}` +
    `var g=s.getAttribute.bind(s);s.getAttribute=function(n){return n==="src"?a:g(n)};})();`;
  return `<script>${prelude}\n${js}\n</script>`;
};

// Stylesheets, with fonts folded in.
html = html.replace(
  /<link[^>]+rel="stylesheet"[^>]*href="(\/_next\/[^"]+)"[^>]*>/g,
  (_m, url) => {
    const css = read(url)
      .toString("utf8")
      .replace(/url\("?([^)"]*media\/[^)"]+)"?\)/g, (_x, f) =>
        `url(${dataUri("/_next/static/media/" + f.split("media/").pop())})`,
      );
    return `<style>${css}</style>`;
  },
);

// Preloads would 404 once their targets are inlined.
html = html.replace(/<link[^>]+rel="(preload|prefetch|modulepreload)"[^>]*>/g, "");
html = html.replace(/<script[^>]*src="(\/_next\/[^"]+)"[^>]*><\/script>/g, (_m, url) =>
  scriptTag(url),
);
html = html.replace(/href="\/favicon\.ico\?([^"]+)"/g, (_m, f) =>
  `href="${dataUri("/_next/static/media/" + f)}"`,
);

// See note 3.
const already = new Set([...html.matchAll(/var a="(\/_next\/[^"]+)"/g)].map((m) => m[1]));
const extra = fs
  .readdirSync(path.join(ROOT, "static/chunks"))
  .filter((f) => f.endsWith(".js"))
  .map((f) => "/_next/static/chunks/" + f)
  .filter((u) => !already.has(u));
html = html.replace("</body>", extra.map(scriptTag).join("\n") + "</body>");

const out = process.argv[2] ?? "preview.html";
fs.writeFileSync(out, html);
console.log(
  `${out}  ${(fs.statSync(out).size / 1024 / 1024).toFixed(2)}MB  ` +
    `(${already.size} chunks inlined, ${extra.length} appended)`,
);

// A host-embeddable variant: no <html>/<head>/<body> of its own. See note 4.
const cls = (html.match(/<html[^>]*class="([^"]*)"/) || [])[1] ?? "";
const bodyCls = (html.match(/<body[^>]*class="([^"]*)"/) || [])[1] ?? "";
const fontVars = [
  ...html.matchAll(/\.[A-Za-z0-9_-]*__variable\{([^}]*)\}/g),
].map((m) => m[1]).join(";");
if (!fontVars) throw new Error("no next/font variable classes found — check the build");

const embedded =
  `${html.match(/<head[^>]*>([\s\S]*?)<\/head>/)[1]}\n` +
  `<style>:root{${fontVars}}\nhtml,body{margin:0;padding:0;background:#0e1e1d}</style>\n` +
  `<div class="${[cls, bodyCls].filter(Boolean).join(" ")}">\n` +
  `${html.match(/<body[^>]*>([\s\S]*?)<\/body>/)[1]}\n</div>`;

const embedOut = out.replace(/\.html$/, "") + ".embed.html";
fs.writeFileSync(embedOut, embedded);
console.log(`${embedOut}  ${(fs.statSync(embedOut).size / 1024 / 1024).toFixed(2)}MB`);
