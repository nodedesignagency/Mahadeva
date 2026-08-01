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

/**
 * Hold entrance animations until the page is actually on screen.
 *
 * The heading reveal is `trigger: "inView"`, so it starts the moment the
 * IntersectionObserver reports the block visible — which here is during load,
 * while a megabyte of inlined bundle is still being parsed and the frame has
 * not been shown yet. The sequence is over ~3s later, so by the time anyone is
 * looking the heading has already settled and the animation reads as missing.
 *
 * Rather than change the app, the preview defers the first IntersectionObserver
 * notification until load, webfonts and a short beat have all passed. The
 * animation is the real one, on the real trigger, just released once there is
 * someone to see it. Injected ahead of every app script so the patched
 * constructor is the one they capture.
 */
const gate = `<script>
(function(){
  var IO=window.IntersectionObserver;
  if(!IO)return;
  var open=false,waiting=[];
  function release(){ if(open)return; open=true;
    for(var i=0;i<waiting.length;i++)waiting[i]();
    waiting.length=0; }
  function arm(){
    var fonts=(document.fonts&&document.fonts.ready)||Promise.resolve();
    fonts.then(function(){setTimeout(release,400)},function(){setTimeout(release,400)});
    // Never strand the page if load or fonts never settle.
    setTimeout(release,6000);
  }
  if(document.readyState==="complete")arm();
  else window.addEventListener("load",arm);
  function Patched(cb,opts){
    return new IO(function(entries,obs){
      if(open)return cb(entries,obs);
      waiting.push(function(){cb(entries,obs)});
    },opts);
  }
  Patched.prototype=IO.prototype;
  window.IntersectionObserver=Patched;
})();
</script>`;
html = html.replace(/<head([^>]*)>/, (m) => m + gate);

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

/**
 * Preview-only replay control.
 *
 * The heading reveal runs once on mount and is over ~2.9s in. A preview that
 * takes a moment to load and hydrate has usually finished animating before
 * anyone is looking at it, which reads as "the animation is broken" when it is
 * in fact correct. Reloading replays every entrance from the top.
 *
 * Deliberately not part of the app — it is injected here so nothing
 * preview-specific reaches the real build.
 */
// Built entirely from script: React's root is <body> (or the host container),
// and it removes children it did not render, so markup placed here statically
// is wiped the moment the app hydrates. Creating the node afterwards and
// re-attaching it if it disappears is what actually survives.
const replay = `
<script>
(function(){
  var CSS="#mh-replay{position:fixed;right:1rem;bottom:1rem;z-index:2147483647;"
   +"font:500 13px/1 var(--font-ui,system-ui);letter-spacing:.02em;"
   +"display:inline-flex;align-items:center;gap:.5rem;padding:.7rem 1.1rem;"
   +"border:0;border-radius:999px;cursor:pointer;"
   +"background:var(--mh-green,#8cffa7);color:var(--mh-ink,#0e1e1d);"
   +"box-shadow:0 2px 12px rgb(0 0 0 / .35)}"
   +"#mh-replay:focus-visible{outline:2px solid #fff;outline-offset:3px}"
   +"@media print{#mh-replay{display:none}}";
  function mount(){
    if(document.getElementById("mh-replay"))return;
    if(!document.getElementById("mh-replay-css")){
      var st=document.createElement("style");
      st.id="mh-replay-css";st.textContent=CSS;
      document.head.appendChild(st);
    }
    var b=document.createElement("button");
    b.id="mh-replay";b.type="button";b.textContent="\\u21bb Replay reveal";
    b.addEventListener("click",function(){location.reload()});
    document.body.appendChild(b);
  }
  function boot(){ mount(); setInterval(mount,500); }
  if(document.readyState==="complete")boot();
  else window.addEventListener("load",boot);
})();
</script>`;

html = html.replace("</body>", replay + "</body>");

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
