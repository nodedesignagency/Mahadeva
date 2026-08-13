/**
 * Bundle the built site into one self-contained HTML file, so a section can be
 * published as a shareable preview and checked in a real browser.
 *
 * Usage:  npm run build && node scripts/build-preview.mjs [outfile] [route]
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

// Which prerendered route to bundle: `pricing` for /pricing, and the home
// page's own file is `index`. Only statically rendered routes have one.
const route = process.argv[3] ?? "index";
const page = path.join(ROOT, `server/app/${route}.html`);

if (!fs.existsSync(page)) {
  console.error(
    fs.existsSync(path.join(ROOT, "server/app/index.html"))
      ? `No prerendered page for "${route}". Built routes: ` +
          fs
            .readdirSync(path.join(ROOT, "server/app"))
            .filter((f) => f.endsWith(".html"))
            .map((f) => f.replace(/\.html$/, ""))
            .join(", ")
      : "No build found. Run `npm run build` first.",
  );
  process.exit(1);
}

let html = fs.readFileSync(page, "utf8");

const mime = (f) =>
  f.endsWith(".woff2") ? "font/woff2"
  : f.endsWith(".ico") ? "image/x-icon"
  : f.endsWith(".svg") ? "image/svg+xml"
  : f.endsWith(".png") ? "image/png"
  : /\.jpe?g$/.test(f) ? "image/jpeg"
  : f.endsWith(".webp") ? "image/webp"
  : f.endsWith(".avif") ? "image/avif"
  : f.endsWith(".gif") ? "image/gif"
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

/**
 * Artwork.
 *
 * Two shapes reach the page and both break in a file with no server behind it:
 * SVGs are referenced straight as `/_next/static/media/…`, while everything the
 * Image component optimises becomes `/_next/image?url=…&w=…&q=…`, an endpoint
 * only `next start` answers. Neither is inlined by the passes above, so every
 * asset 404s in the bundle while working perfectly on the real site.
 *
 * `srcset` goes first. Its entries differ only by width, so once each resolves
 * to the same data URI they are megabytes of duplicate base64 — the hero mark
 * alone is 437KB before encoding.
 */
const media = path.join(ROOT, "static/media");
const artwork = new Map(
  fs
    .readdirSync(media)
    .filter((f) => /\.(png|jpe?g|svg|gif|webp|avif)$/i.test(f))
    .map((f) => ["/_next/static/media/" + f, dataUri("/_next/static/media/" + f)]),
);

html = html.replace(/\s(?:srcset|imagesrcset)="[^"]*"/gi, "");

// The optimiser URL carries the real file percent-encoded in its `url` param.
const throughOptimiser = /\/_next\/image\?url=([^"&]+)(?:&amp;|&)[^"]*/g;
const resolve = (raw) => artwork.get(decodeURIComponent(raw));
html = html.replace(throughOptimiser, (whole, enc) => resolve(enc) ?? whole);
for (const [file, uri] of artwork) html = html.split(file).join(uri);

/**
 * The server-rendered `src` is only half of it: these are client components, so
 * React re-renders and writes the optimiser URL back over the inlined one.
 * This resolves any that appear afterwards, and keeps watching, since the strip
 * mounts its images after hydration.
 */
const artworkShim = `
<script>
(function(){
  var MAP=${JSON.stringify(Object.fromEntries(artwork))};
  function fix(img){
    var s=img.getAttribute("src")||"";
    if(s.indexOf("data:")===0)return;
    var m=s.match(/\\/_next\\/image\\?url=([^&]+)/);
    var key=m?decodeURIComponent(m[1]):s;
    if(MAP[key]){img.removeAttribute("srcset");img.setAttribute("src",MAP[key]);}
  }
  function sweep(){
    var imgs=document.getElementsByTagName("img");
    for(var i=0;i<imgs.length;i++)fix(imgs[i]);
  }
  sweep();
  new MutationObserver(sweep).observe(document.documentElement,
    {subtree:true,childList:true,attributes:true,attributeFilter:["src","srcset"]});
  document.addEventListener("DOMContentLoaded",sweep);
  window.addEventListener("load",sweep);
})();
</script>`;
html = html.replace(/<head([^>]*)>/, (m) => m + artworkShim);

// See note 3.
const already = new Set([...html.matchAll(/var a="(\/_next\/[^"]+)"/g)].map((m) => m[1]));
const extra = fs
  .readdirSync(path.join(ROOT, "static/chunks"))
  .filter((f) => f.endsWith(".js"))
  .map((f) => "/_next/static/chunks/" + f)
  .filter((u) => !already.has(u));
html = html.replace("</body>", extra.map(scriptTag).join("\n") + "</body>");

// Preview-only. Injected here so nothing preview-specific reaches the build.
// Built entirely from script: React's root is <body> (or the host container),
// and it removes children it did not render, so markup placed here statically
// is wiped the moment the app hydrates. Creating the node afterwards and
// re-attaching it if it disappears is what actually survives.
//
// The replay re-runs the heading reveal on the DOM the app already rendered
// rather than reloading, so watching it again costs nothing and does not
// restart the pattern field. On-demand only — the app plays its own entrance
// on load, and triggering a second pass automatically just ran the sequence
// twice.
//
// The sequence below mirrors TextRevealVariable, same as the component:
// bar one sweeps across, bar two follows behind it, the words flip to their
// after-colour while covered, both origins flip to the far edge, then bar two
// retreats and bar one after it. Timings mirror `heroTextReveal` in
// src/config/animation.ts.
const replay = `
<script>
(function(){
  var D=620,PAUSE=25,DELAY=40,EASE="cubic-bezier(0.3,0,0.7,1)";

  function lines(){
    var out=[],seen=[];
    var words=document.querySelectorAll("[data-reveal-word]");
    for(var i=0;i<words.length;i++){
      var parent=words[i].parentElement;
      if(!parent||seen.indexOf(parent)>-1)continue;
      seen.push(parent);
      // Both the desktop and mobile line sets are in the DOM; CSS shows one.
      if(parent.offsetParent===null)continue;
      out.push(parent);
    }
    return out;
  }

  function barsOf(line){
    var out=[];
    for(var i=0;i<line.children.length;i++){
      var el=line.children[i];
      if(getComputedStyle(el).position==="absolute")out.push(el);
    }
    return out;
  }

  function sweep(el,from,to){
    return el.animate(
      [{transform:"scaleX("+from+")"},{transform:"scaleX("+to+")"}],
      {duration:D,fill:"forwards",easing:EASE}
    );
  }

  function playLine(line){
    var words=line.querySelectorAll("[data-reveal-word]");
    var bars=barsOf(line);
    if(bars.length<2||!words.length)return;
    var b1=bars[0],b2=bars[1];

    // The component writes the after-colour onto each word inline once the
    // bars cover it, so after a completed run that inline value is the colour
    // to return to. Before one, fall back to the inherited colour.
    var after=words[0].style.color;
    if(!after||after==="transparent")after=getComputedStyle(line).color;

    for(var i=0;i<bars.length;i++){
      var running=bars[i].getAnimations?bars[i].getAnimations():[];
      for(var j=0;j<running.length;j++)running[j].cancel();
      bars[i].style.transformOrigin="left center";
      bars[i].style.transform="scaleX(0)";
    }
    // Back to hidden without riding the 250ms colour transition.
    for(var k=0;k<words.length;k++){
      var w=words[k],t=w.style.transition;
      w.style.transition="none";
      w.style.color="transparent";
      void w.offsetWidth;
      w.style.transition=t||"";
    }
    void b1.getBoundingClientRect();

    setTimeout(function(){
      sweep(b1,0,1).onfinish=function(){
        sweep(b2,0,1).onfinish=function(){
          for(var n=0;n<words.length;n++)words[n].style.color=after;
          b1.style.transformOrigin="right center";
          b2.style.transformOrigin="right center";
          setTimeout(function(){
            sweep(b2,1,0).onfinish=function(){sweep(b1,1,0)};
          },PAUSE);
        };
      };
    },DELAY);
  }

  // True while any bar is mid-sweep. A fill:forwards animation that has landed
  // reports "finished", so this only catches a sequence actually in flight.
  function busy(){
    var all=lines();
    for(var i=0;i<all.length;i++){
      var bars=barsOf(all[i]);
      for(var j=0;j<bars.length;j++){
        var running=bars[j].getAnimations?bars[j].getAnimations():[];
        for(var k=0;k<running.length;k++)
          if(running[k].playState==="running")return true;
      }
    }
    return false;
  }

  var last=0;
  // Waits for the app's own run rather than cutting across it — restarting
  // mid-sweep snaps the bar back to the left edge and reads as a glitch.
  // The button forces, since a deliberate press should never be ignored.
  function play(force,tries){
    tries=tries||0;
    if(!force&&busy()&&tries<15){
      setTimeout(function(){play(force,tries+1)},400);
      return;
    }
    var now=Date.now();
    if(!force&&now-last<2500)return;
    var all=lines();
    if(!all.length)return;
    last=now;
    for(var i=0;i<all.length;i++)playLine(all[i]);
  }

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
    b.addEventListener("click",function(){play(true)});
    document.body.appendChild(b);
  }

  // No auto-trigger: the app plays its own entrance on load, and replaying it
  // afterwards just ran the whole sequence twice. The button is for watching
  // it again on demand.
  function boot(){
    mount();
    setInterval(mount,500);
  }
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

/**
 * The host's own body rule, and why this style has to restate the document's
 * typography.
 *
 * A published artifact is wrapped in a page whose head carries
 * `body{...font:14px -apple-system...}`. `font` is a shorthand, so it resets
 * `line-height` to `normal` — and it is unlayered, while everything Tailwind
 * emits sits in `@layer base`, which loses to an unlayered rule whatever the
 * order. Every paragraph that takes its leading by inheritance from `body`
 * therefore renders at `normal` in the artifact and at its real value
 * everywhere else, which is invisible when the file is opened directly.
 *
 * This rule is unlayered too, and comes after the host's, so it wins.
 */
const embedded =
  `${html.match(/<head[^>]*>([\s\S]*?)<\/head>/)[1]}\n` +
  `<style>:root{${fontVars}}\n` +
  `html,body{margin:0;padding:0;background:#0e1e1d;` +
  `font-family:var(--font-body);font-size:var(--text-body-md);` +
  `line-height:var(--leading-body);color:var(--color-fg)}</style>\n` +
  `<div class="${[cls, bodyCls].filter(Boolean).join(" ")}">\n` +
  `${html.match(/<body[^>]*>([\s\S]*?)<\/body>/)[1]}\n</div>`;

const embedOut = out.replace(/\.html$/, "") + ".embed.html";
fs.writeFileSync(embedOut, embedded);
console.log(`${embedOut}  ${(fs.statSync(embedOut).size / 1024 / 1024).toFixed(2)}MB`);
