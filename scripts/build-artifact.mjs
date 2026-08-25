/**
 * Bundle the whole built site — every route, not one — into a single
 * self-contained HTML file that can be published as an artifact.
 *
 * Usage:  npm run build && node scripts/build-artifact.mjs [outfile]
 *
 * build-preview.mjs beside this one already solves "one route, no server".
 * This adds the rest of the site by standing up a tiny origin inside the
 * page: the App Router's navigations are ordinary `fetch` calls for RSC
 * payloads, so every payload the build prerendered is inlined and `fetch` is
 * patched to answer from that map. The router then works exactly as it does
 * on a real host, page transition and all.
 *
 * ── Read this before changing the origin script ────────────────────────────
 *
 * Everything from `const origin = ` down to its closing backtick is a
 * template literal that becomes JavaScript in the page. Two things bite every
 * time:
 *
 *  - A backtick anywhere inside it — including in a comment — ends the
 *    literal and the build dies. There are none; keep it that way.
 *  - A regex needs its backslashes doubled: write `\\/` to get `\/` in the
 *    emitted script. A single one is eaten by the literal, and `/\/` quietly
 *    becomes `//`, which comments out the rest of the line.
 *
 * Both have broken this file, silently, more than once. Never pipe the
 * build's output to /dev/null: a failed run leaves the previous file on disk
 * and publishing it looks exactly like the change not working.
 *
 * ── What is here that is not the site ──────────────────────────────────────
 *
 * A published artifact is one file with no server, rendered in an iframe that
 * React re-renders rather than hydrates, created before the panel showing it
 * is opened. So this file also: drives the preloader by hand, holds link
 * clicks until React is awake, freezes the address so a reload cannot land on
 * a route this file cannot serve, and adds a page index. None of that exists
 * on the site, and none of it belongs there.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = ".next";
const APP = path.join(ROOT, "server/app");
const read = (url) => fs.readFileSync(path.join(ROOT, url.replace("/_next/", "")));

const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
};

// ---------------------------------------------------------------- routes ---
// Every prerendered route, minus the ones that are not part of the site:
// the studio is deliberately outside the site's chrome, and the token page
// and global-error shell are development scaffolding.
const SKIP = new Set(["_global-error", "_not-found", "dev/tokens", "studio"]);
const files = walk(APP)
  .filter((f) => f.endsWith(".html"))
  .map((f) => f.slice(APP.length + 1, -".html".length))
  .filter((name) => ![...SKIP].some((s) => name === s || name.startsWith(s + "/")));

const pathnameOf = (name) => (name === "index" ? "/" : "/" + name);
const routes = files.map((name) => ({ name, pathname: pathnameOf(name) }));
routes.sort((a, b) => a.pathname.localeCompare(b.pathname));

// -------------------------------------------------------------- payloads ---
const rsc = {};       // pathname -> flight payload for a full navigation
const segments = {};  // "pathname\nsegmentPath" -> per-segment prefetch payload
const meta = {};      // pathname -> response headers the router reads

for (const { name, pathname } of routes) {
  const full = path.join(APP, name + ".rsc");
  if (fs.existsSync(full)) rsc[pathname] = fs.readFileSync(full, "utf8");

  const metaFile = path.join(APP, name + ".meta");
  if (fs.existsSync(metaFile)) {
    const m = JSON.parse(fs.readFileSync(metaFile, "utf8"));
    meta[pathname] = m.headers ?? {};
  }

  const segDir = path.join(APP, name + ".segments");
  if (fs.existsSync(segDir)) {
    for (const f of walk(segDir)) {
      if (!f.endsWith(".segment.rsc")) continue;
      const seg = "/" + f.slice(segDir.length + 1, -".segment.rsc".length);
      segments[pathname + "\n" + seg] = fs.readFileSync(f, "utf8");
    }
  }
}

// The route the app falls back to. Requested paths with no payload get this,
// so a stale or hand-typed URL lands on the site's own 404 rather than a
// browser-level navigation out of the artifact.
const notFound = {
  rsc: fs.readFileSync(path.join(APP, "_not-found.rsc"), "utf8"),
  meta: JSON.parse(fs.readFileSync(path.join(APP, "_not-found.meta"), "utf8")).headers ?? {},
};

// ---------------------------------------------------------------- assets ---
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

/** Inline a chunk, restoring the identity the Turbopack runtime expects. */
const scriptTag = (url) => {
  const js = read(url)
    .toString("utf8")
    .replace(/<\/script/gi, "<\\/script")
    .replace(/�/g, "\\u" + "FFFD");
  const prelude =
    `(function(){var s=document.currentScript;if(!s)return;` +
    `var a=${JSON.stringify(url)},u=a;` +
    `try{u=new URL(a,document.baseURI||location.href).href}catch(e){}` +
    `try{Object.defineProperty(s,"src",{value:u,configurable:true});}catch(e){}` +
    `var g=s.getAttribute.bind(s);s.getAttribute=function(n){return n==="src"?a:g(n)};})();`;
  return `<script>${prelude}\n${js}\n</script>`;
};

// Which chunks the site actually needs. The build also carries the Studio's,
// which are megabytes and reachable from no page here, so take the union of
// what the site's own markup and payloads name rather than the whole folder.
const needed = new Set();
for (const { name, pathname } of routes) {
  const sources = [
    fs.readFileSync(path.join(APP, name + ".html"), "utf8"),
    rsc[pathname] ?? "",
    ...Object.entries(segments)
      .filter(([k]) => k.startsWith(pathname + "\n"))
      .map(([, v]) => v),
  ];
  for (const t of sources)
    for (const m of t.matchAll(/\/_next\/static\/chunks\/[A-Za-z0-9_.-]+\.js/g))
      needed.add(m[0]);
}
for (const m of notFound.rsc.matchAll(/\/_next\/static\/chunks\/[A-Za-z0-9_.-]+\.js/g))
  needed.add(m[0]);

// Stylesheets, with fonts folded in. One sheet covers the whole site.
const styles = new Map();
for (const { name } of routes) {
  const html = fs.readFileSync(path.join(APP, name + ".html"), "utf8");
  for (const m of html.matchAll(/href="(\/_next\/static\/chunks\/[^"]+\.css)"/g)) {
    if (styles.has(m[1])) continue;
    styles.set(
      m[1],
      read(m[1])
        .toString("utf8")
        .replace(/url\("?([^)"]*media\/[^)"]+)"?\)/g, (_x, f) =>
          `url(${dataUri("/_next/static/media/" + f.split("media/").pop())})`,
        ),
    );
  }
}

const media = path.join(ROOT, "static/media");
const artwork = new Map(
  fs
    .readdirSync(media)
    .filter((f) => /\.(png|jpe?g|svg|gif|webp|avif)$/i.test(f))
    .map((f) => ["/_next/static/media/" + f, dataUri("/_next/static/media/" + f)]),
);

/**
 * The preloader's sheet, lifted out of the page it was rendered into.
 *
 * It goes back in below as a child of <html> rather than of <body>, which is
 * the only place in this file React cannot reach. See the note in the origin
 * script.
 */
function cutSheet(html) {
  const at = html.indexOf('class="mh-preload ');
  if (at < 0) return { html, sheet: "" };
  const open = html.lastIndexOf("<", at);

  // Balanced scan rather than a regex: the sheet is a div of divs of spans,
  // and a regex for the closing tag finds the first one, not the matching one.
  let depth = 0;
  let i = open;
  while (i < html.length) {
    const next = html.indexOf("<", i);
    if (next < 0) break;
    const close = html.indexOf(">", next);
    const tag = html.slice(next, close + 1);
    if (tag.startsWith("</")) {
      depth -= 1;
      if (depth === 0) {
        return {
          html: html.slice(0, open) + html.slice(close + 1),
          sheet: html.slice(open, close + 1),
        };
      }
    } else if (!tag.endsWith("/>") && !/^<(br|img|input|hr|meta|link)\b/.test(tag)) {
      depth += 1;
    }
    i = close + 1;
  }
  return { html, sheet: "" };
}

// The sheet, and how long it runs. Both are read from the built page rather
// than restated here, so this file cannot drift from the component's config.
const shell = fs.readFileSync(path.join(APP, "index.html"), "utf8");
const sheetMarkup = cutSheet(shell).sheet;
const preloaderCeiling = 2400;

// ------------------------------------------------------------ the origin ---
// Runs before any of Next's own code. Three jobs, each of which the router
// would otherwise do over the network.
const origin = `
<script>
(function(){
  var RSC=${JSON.stringify(rsc)};
  var SEG=${JSON.stringify(segments)};
  var META=${JSON.stringify(meta)};
  var NOTFOUND=${JSON.stringify(notFound)};
  var CSS=${JSON.stringify([...styles.keys()])};
  var ART=${JSON.stringify(Object.fromEntries(artwork))};
  var SHEET=${JSON.stringify(sheetMarkup)};
  var PAGES=${JSON.stringify(routes.map((r) => r.pathname))};

  /* 0. The preloader, driven by this file rather than by its component.

     Four things about this harness force that, each measured rather than
     assumed:

     React re-renders the whole app instead of hydrating — the site's document
     renders <html>, and a published artifact's does too — and removes what it
     did not render. A sheet left in the page had its nodes replaced mid-run
     and twenty-two of twenty-seven tiles started while none finished.

     Re-attaching it the moment it goes is not enough on its own, because a
     CSS animation ends when its element leaves the document and starts over
     when it comes back. Holding the sheet up from the first frame that way
     made it replay: the wordmark walked in at 0.8s, out at 1.9s, and in again
     at 2.1s. Waiting for React to finish before starting avoided that and
     bought a worse problem — the hero was on screen first, and the preloader
     arrived afterwards, which is precisely backwards.

     So the run is built with the Web Animations API instead. Those belong to
     the element rather than to its place in the document: detaching it stops
     it being drawn and changes nothing else, and re-attaching carries on from
     where it was. The sheet can then go up on the very first frame and be
     re-attached as often as React likes.

     The frame is also created before the panel showing it is opened, so the
     animations are held paused until there is someone to watch them — Framer
     calls the same setting Off Screen: Pause — and a soft navigation back to
     the home page plays the whole thing again, as it does on the site.

     Every number and curve below is read off the sheet the build produced.
     Nothing is restated here, so this cannot drift from the component. */
  if(SHEET){(function(){
    var sheet=null,anims=[],running=false,keeper=null;

    /* The component's copy, silenced for good. Its verdict is a window flag
       its blocking script sets, and that script runs after this one — and
       again on every soft navigation — so it is simply held down. */
    setInterval(function(){
      try{
        window["mh-preload-verdict"]="skip";
        document.documentElement.dataset.preloader="skip";
      }catch(e){}
    },200);

    /* The stylesheet's own animations would run alongside the ones built
       below, and restart on every re-attach — the very thing this avoids. */
    var off=document.createElement("style");
    off.textContent=".mh-preload-js .mh-preload-word,"+
      ".mh-preload-js .mh-preload-tile{animation:none!important}";
    document.head.appendChild(off);

    function onScreen(){
      try{ return !document.hidden && innerWidth>0 && innerHeight>0 }
      catch(e){ return true }
    }
    function ms(el,name){ return parseFloat(getComputedStyle(el).getPropertyValue(name))||0 }
    function ease(name,fallback){
      var v=getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v||fallback;
    }

    function start(){
      var word=sheet.querySelector(".mh-preload-word");
      var tiles=sheet.querySelectorAll(".mh-preload-tile");
      var begin=ms(sheet,"--mh-preload-start");
      var collapse=ms(sheet,"--mh-preload-collapse");
      var rise=getComputedStyle(sheet).getPropertyValue("--mh-preload-word-rise").trim();
      var spring=ease("--ease-preload-word","ease-out");
      var swipe=ease("--ease-preload","cubic-bezier(0.3,0,0.7,1)");
      var last=null;

      function add(el,frames,opts){
        try{ var a=el.animate(frames,opts); anims.push(a); return a }
        catch(e){ return null }
      }

      /* Arrival, then departure. The later animation wins on opacity, which
         is what lets the two compose without one set of keyframes. */
      add(word,
        [{opacity:0,transform:"translateY("+rise+")"},
         {opacity:1,transform:"translateY(0)"}],
        {duration:ms(sheet,"--mh-preload-word-in"),easing:spring,fill:"both"});
      add(word,[{opacity:1},{opacity:0}],
        {duration:ms(sheet,"--mh-preload-word-fade"),
         delay:ms(sheet,"--mh-preload-word-out"),
         easing:ease("--ease-out","ease-out"),fill:"forwards"});

      for(var i=0;i<tiles.length;i++){
        var tile=tiles[i];
        var axis=tile.classList.contains("mh-preload-tile-x")?"scaleX":"scaleY";
        var a=add(tile,
          [{transform:axis+"(1)"},{transform:axis+"(0)"}],
          {duration:collapse,delay:begin+ms(tile,"--mh-preload-delay"),
           easing:swipe,fill:"forwards"});
        if(a&&tile.dataset.mhLast!==undefined)last=a;
      }

      /* Over when the tile that lands last has landed, as on the site. */
      if(last&&last.finished)last.finished.then(stop,function(){});

      /* The backstop counts watched time, not wall-clock time. A plain
         timeout retires the sheet while it is paused off screen, so the frame
         is opened onto a page the preloader has already been taken off —
         which is the same "it does nothing" by another route. */
      var watched=0;
      var ceiling=setInterval(function(){
        if(!running){clearInterval(ceiling);return}
        if(!onScreen())return;
        watched+=200;
        if(watched>${preloaderCeiling}){clearInterval(ceiling);stop()}
      },200);

      /* The clock starts on the first painted frame, not here.
         This runs while the document is still being parsed, and a bundle this
         size takes another half second to paint — so animations started now
         are already half a second in by the time there is anything on screen,
         and the run reads as much shorter than it is. Two frames is the
         earliest point something has actually been drawn. */
      for(var j=0;j<anims.length;j++){try{anims[j].pause()}catch(e){}}
      requestAnimationFrame(function(){requestAnimationFrame(hold)});
    }

    /* Paused whenever there is nobody to watch, resumed when there is. */
    function hold(){
      var go=onScreen();
      for(var i=0;i<anims.length;i++){
        try{ go?anims[i].play():anims[i].pause() }catch(e){}
      }
    }

    function stop(){
      running=false;
      for(var i=0;i<anims.length;i++){try{anims[i].cancel()}catch(e){}}
      anims=[];
      if(keeper){keeper.disconnect();keeper=null}
      if(sheet&&sheet.parentNode)sheet.parentNode.removeChild(sheet);
      sheet=null;
    }

    function play(){
      if(running)return;
      var parent=document.body||document.documentElement;
      var host=document.createElement("div");
      host.innerHTML=SHEET;
      sheet=host.firstElementChild;
      /* Out of reach of the rule that hides the component's copy: the two
         share every class, and the skip selector cannot tell them apart. */
      sheet.classList.remove("mh-preload");
      sheet.classList.add("mh-preload-js");
      parent.appendChild(sheet);
      running=true;
      start();
      /* Put back the instant React sweeps it. The observer runs as a
         microtask, before the frame paints, so no gap is ever drawn — and
         the animations above do not care that it happened. */
      keeper=new MutationObserver(function(){
        if(!running||!sheet)return;
        if(!sheet.isConnected)(document.body||document.documentElement).appendChild(sheet);
      });
      keeper.observe(document.documentElement,{subtree:true,childList:true});
    }

    play();
    addEventListener("visibilitychange",hold);
    addEventListener("resize",hold);

    /* Every arrival at the home page, as on the site. The router moves by
       pushState, so that is where this listens; the booted flag keeps the
       address correction below from counting as an arrival. */
    var booted=false,at=null;
    window.__mhArrive=function(path){
      if(!booted){booted=true;at=path;return}
      if(path===at)return;
      at=path;
      if(path==="/"){stop();play()}
    };
    addEventListener("popstate",function(){
      setTimeout(function(){
        try{window.__mhArrive(window.__mhRoute)}catch(e){}
      },0);
    });
  })()}

  /* 0b. Links, before the app is awake.

     Until React has hydrated, a next/link is a plain anchor, and clicking one
     is a whole page load rather than a navigation. On a real host that is
     merely slow. Here there is no host: the address 404s, the page is left
     dead, and only a reload brings it back — which is exactly the "the
     pricing page would not open, then it did after a reload" this went
     looking for. Reproduced six times out of six by clicking during the first
     second and never once after it.

     So an internal link clicked too early is held rather than followed, and
     let go the moment the app can answer for it. Hydration is detectable
     without asking the framework: React writes its own bookkeeping onto the
     DOM nodes it has taken over. */
  (function(){
    function awake(){
      var el=document.querySelector("#main")||document.body;
      if(!el)return false;
      for(var k in el)if(k.indexOf("__reactFiber$")===0||k.indexOf("__reactProps$")===0)return true;
      return false;
    }
    document.addEventListener("click",function(e){
      if(awake()||e.defaultPrevented||e.button!==0)return;
      if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
      var a=e.target&&e.target.closest?e.target.closest("a[href]"):null;
      if(!a||(a.target&&a.target!=="_self")||a.hasAttribute("download"))return;
      var u;
      try{u=new URL(a.getAttribute("href"),location.href)}catch(x){return}
      if(u.origin!==location.origin)return;
      e.preventDefault();
      e.stopPropagation();
      /* Held, then handed back once the app can take it — to whichever link
         is live by then, not to the one that was clicked. React replaces the
         anchor when it takes the page over, and clicking the detached
         original navigates for real: it is no longer anything a router is
         listening to. That is the same 404, arriving a second later. */
      var want=u.pathname;
      var tries=0;
      var wait=setInterval(function(){
        if(awake()){
          clearInterval(wait);
          var links=document.querySelectorAll("a[href]");
          for(var i=0;i<links.length;i++){
            var l=links[i],lu;
            try{lu=new URL(l.getAttribute("href"),location.href)}catch(x){continue}
            if(lu.pathname===want&&l.isConnected){l.click();return}
          }
          return;
        }
        if(++tries>200)clearInterval(wait);
      },50);
    },true);
  })();

  /* 0c. A way to reach any page directly.

     Every page here is reachable by clicking — the indexes link their own
     detail pages, the footer links the rest — but only by clicking, and
     getting to the sixth blog post means going through the blog each time.

     This drives the app's own links rather than the router. The router is not
     reachable from outside: a pushState with a synthetic popstate moves the
     address and leaves the page where it was, measured on four routes. A link
     the app rendered is the only thing that navigates, so a detail page is
     reached the way a reader would reach it — open its index, wait for the
     link to exist, click it. Two hops, entirely inside the app. */
  (function(){
    function liveLink(path){
      var as=document.querySelectorAll("a[href]");
      for(var i=0;i<as.length;i++){
        var a=as[i],u;
        try{u=new URL(a.getAttribute("href"),location.href)}catch(e){continue}
        if(u.pathname===path&&a.isConnected)return a;
      }
      return null;
    }
    function indexOf(path){
      var cut=path.lastIndexOf("/");
      return cut>0?path.slice(0,cut):"/";
    }
    function goTo(path,tries){
      tries=tries||0;
      if(window.__mhRoute===path)return;
      if(tries>60)return;
      var a=liveLink(path);
      if(a){a.click();return}
      var idx=indexOf(path);
      var ia=idx!==path?liveLink(idx):null;
      if(ia){ia.click();setTimeout(function(){goTo(path,tries+1)},350);return}
      setTimeout(function(){goTo(path,tries+1)},250);
    }

    /* A detail page is opened the way a reader opens it, through its index,
       which is two navigations and about two and a half seconds.

       It was briefly one: the site's transition steps aside when it finds the
       document already mid-wipe, so the intermediate hop marked the document
       to borrow that. It halved the time and broke the thing this whole panel
       exists for. Stepping aside means the handler returns before it calls
       preventDefault, so the browser followed the link itself — a real
       navigation, to an address this file has no server for, which drops the
       frame back on the home page. Slower and right beats faster and wrong. */

    var CSS=
      "#mh-pages-btn,#mh-pages{position:fixed;left:1rem;z-index:2147483647;"+
      "font:500 13px/1.35 var(--font-ui,system-ui);letter-spacing:.02em}"+
      "#mh-pages-btn{bottom:1rem;display:inline-flex;align-items:center;gap:.5rem;"+
      "padding:.7rem 1.1rem;border:0;border-radius:999px;cursor:pointer;"+
      "background:#8cffa7;color:#0e1e1d;box-shadow:0 2px 12px rgb(0 0 0 / .35)}"+
      "#mh-pages{bottom:3.9rem;display:none;width:19rem;max-height:60vh;overflow:auto;"+
      "padding:.5rem;border-radius:14px;background:#10201f;color:#e8f2f0;"+
      "box-shadow:0 8px 28px rgb(0 0 0 / .5);border:1px solid #263434}"+
      "#mh-pages.open{display:block}"+
      "#mh-pages h4{margin:.6rem .6rem .3rem;font-size:11px;letter-spacing:.12em;"+
      "text-transform:uppercase;color:#8a9a99}"+
      "#mh-pages button{display:block;width:100%;text-align:left;border:0;"+
      "background:none;color:inherit;font:inherit;padding:.45rem .6rem;"+
      "border-radius:8px;cursor:pointer}"+
      "#mh-pages button:hover{background:#1a2928;color:#8cffa7}"+
      "#mh-pages button[data-here]{color:#8cffa7}"+
      "@media print{#mh-pages-btn,#mh-pages{display:none}}";

    var GROUPS=[
      ["Main",function(p){return p.split("/").length===2}],
      ["Case studies",function(p){return p.indexOf("/case-study/")===0}],
      ["Careers",function(p){return p.indexOf("/careers/")===0}],
      ["Blog",function(p){return p.indexOf("/blogs/")===0}],
      ["Legal",function(p){return p.indexOf("/legal-pages/")===0}]
    ];

    function label(path){
      if(path==="/")return "Home";
      var last=path.split("/").pop();
      return last.replace(/-/g," ").replace(/^./,function(c){return c.toUpperCase()});
    }

    function mount(){
      if(!document.body)return;
      if(!document.getElementById("mh-pages-css")){
        var st=document.createElement("style");
        st.id="mh-pages-css";st.textContent=CSS;
        document.head.appendChild(st);
      }
      if(document.getElementById("mh-pages-btn"))return;

      var list=document.createElement("div");
      list.id="mh-pages";
      var used={};
      for(var g=0;g<GROUPS.length;g++){
        var name=GROUPS[g][0],test=GROUPS[g][1],items=[];
        for(var i=0;i<PAGES.length;i++)
          if(!used[PAGES[i]]&&test(PAGES[i])){items.push(PAGES[i]);used[PAGES[i]]=1}
        if(!items.length)continue;
        var h=document.createElement("h4");h.textContent=name;list.appendChild(h);
        for(var j=0;j<items.length;j++)(function(path){
          var btn=document.createElement("button");
          btn.type="button";
          btn.textContent=label(path);
          btn.title=path;
          if(window.__mhRoute===path)btn.setAttribute("data-here","");
          btn.addEventListener("click",function(){
            list.classList.remove("open");
            goTo(path);
          });
          list.appendChild(btn);
        })(items[j]);
      }

      var btn=document.createElement("button");
      btn.id="mh-pages-btn";btn.type="button";
      btn.textContent="\u2630 Pages";
      btn.addEventListener("click",function(){list.classList.toggle("open")});

      document.body.appendChild(list);
      document.body.appendChild(btn);
    }
    /* React sweeps away what it did not render, so this goes back. */
    setInterval(mount,600);
    if(document.readyState==="complete")mount();
    else addEventListener("load",mount);
  })();

  /* 1. The address the app thinks it is at.

     A published artifact is served from a path of the host's choosing, and
     the router takes its current route from the address. Left alone the app
     believes it is on that path, which matches no route it has.

     The obvious fix is to move the address to the root, and that was here
     until it was traced to the bug it causes: the artifact is a single file
     with no server behind it, so the root is not the artifact, and once the
     address has been moved there the next reload of the frame asks the host
     for a page that does not exist. The frame comes back on a dead document
     — and the wipe's leftover "arriving covered" flag paints that over in
     full-screen peach, which is what a stuck page looked like.

     So the address is left exactly where the host put it, and the path it
     carries is subtracted from every route instead. Nothing here ever writes
     to it — see the note on pushState below — which means a reload lands on
     the artifact, every time. */
  var BASE=(function(){
    try{ return location.pathname.replace(/\\/$/,"") }catch(e){ return "" }
  })();

  /* Where the app is, kept here rather than read off the address.

     The address is deliberately frozen (see the note on pushState below), so
     it can no longer answer that question — and anything that asked it got
     the answer "the home page", for ever. That is what made the page index
     give up on a route and fall back to opening its index instead, which for
     a top-level page is the home page. It looked like every page bouncing
     back home. The router is the only thing that knows, and it says so
     through pushState. */
  window.__mhRoute="/";

  function routeOf(u){
    var p=u.pathname;
    if(BASE&&p.indexOf(BASE)===0)p=p.slice(BASE.length)||"/";
    if(p.length>1)p=p.replace(/\\/+$/,"")||"/";
    return p;
  }

  /* 2. The payloads. A navigation is a fetch for the route with an "rsc"
     header; a prefetch adds the segment it wants. Both are answered from
     the map above, with the headers the build recorded, so the router
     cannot tell it is not talking to a server. */
  var realFetch=window.fetch.bind(window);
  window.fetch=function(input,init){
    try{
      var req=(typeof Request!=="undefined"&&input instanceof Request)?input:null;
      var raw=req?req.url:(typeof input==="string"?input:String(input&&input.url||input));
      var url=new URL(raw,location.href);
      if(url.origin!==location.origin)return realFetch(input,init);

      var h=new Headers((init&&init.headers)||(req&&req.headers)||{});
      var wantsRsc=h.get("rsc")==="1"||url.searchParams.has("_rsc");
      if(!wantsRsc)return realFetch(input,init);

      var route=routeOf(url);
      var seg=h.get("next-router-segment-prefetch");
      var body,head;

      if(seg!=null){
        body=SEG[route+"\\n"+seg];
        if(body===undefined)return Promise.resolve(new Response("",{status:404}));
        head=META[route]||{};
      }else{
        body=RSC[route];
        head=META[route]||{};
        if(body===undefined){body=NOTFOUND.rsc;head=NOTFOUND.meta;}
      }

      var headers=new Headers(head);
      headers.set("content-type","text/x-component");
      var res=new Response(body,{status:200,headers:headers});
      try{Object.defineProperty(res,"url",{value:url.href});}catch(e){}
      return Promise.resolve(res);
    }catch(e){
      return realFetch(input,init);
    }
  };

  /* 3. Anything the page still asks the network for.
     Every chunk, sheet and font is already in this file, but React re-issues
     the route's stylesheet link on navigation and preloads chunks it thinks
     are cold. On a real host those are not 404s — the artifact's own HTML
     comes back for each one, so a handful of stray hints would re-download
     the whole bundle several times over. Nothing addressed at /_next is
     allowed out; the sheet is answered from the map instead. */
  var cssUri={};
  function sheetUri(href){
    if(!cssUri[href]){
      var st=document.querySelector('style[data-mh-css="'+href+'"]');
      var text=st?st.textContent:"";
      cssUri[href]="data:text/css;base64,"+btoa(unescape(encodeURIComponent(text)));
    }
    return cssUri[href];
  }
  function resolveArt(v){
    if(typeof v!=="string"||v.indexOf("/_next/")!==0)return v;
    var m=v.match(/\\/_next\\/image\\?url=([^&]+)/);
    var key=m?decodeURIComponent(m[1]):v.split("?")[0];
    return ART[key]||null;
  }
  /* null = drop the request; a string = use that instead. */
  function rewrite(tag,name,value){
    if(typeof value!=="string"||value.indexOf("/_next/")!==0)return value;
    if(tag==="link"){
      var href=value.split("?")[0];
      return CSS.indexOf(href)>-1?sheetUri(href):null;
    }
    if(tag==="script")return null;
    return resolveArt(value);
  }
  var URL_ATTR={link:"href",script:"src",img:"src",source:"src"};
  function gate(el,tag){
    var attr=URL_ATTR[tag];
    var set=el.setAttribute.bind(el);
    el.setAttribute=function(n,v){
      if(n===attr||n==="srcset"){
        if(n==="srcset")return;
        var r=rewrite(tag,n,v);
        if(r===null)return;
        return set(n,r);
      }
      return set(n,v);
    };
    var proto=Object.getPrototypeOf(el);
    var desc=Object.getOwnPropertyDescriptor(proto,attr);
    while(!desc&&proto){proto=Object.getPrototypeOf(proto);
      desc=proto&&Object.getOwnPropertyDescriptor(proto,attr);}
    if(!desc||!desc.set)return;
    Object.defineProperty(el,attr,{
      configurable:true,
      get:function(){return desc.get.call(el)},
      set:function(v){
        var r=rewrite(tag,attr,v);
        if(r===null)return;
        desc.set.call(el,r);
      },
    });
  }
  var create=document.createElement.bind(document);
  document.createElement=function(tag,opts){
    var el=create(tag,opts);
    var t=String(tag).toLowerCase();
    if(URL_ATTR[t])gate(el,t);
    return el;
  };

  /* 4. Artwork. The optimiser endpoint only a running server answers, and the
     image components rewrite their own src after hydration, so resolving
     the server-rendered markup once is not enough — this keeps watching. */
  function fixImg(img){
    /* srcset first, and whatever the src is: React writes the optimiser's
       whole width ladder back over an image the build already resolved, and
       a srcset beats the src it sits beside — the picture disappears on the
       way back to a page that was fine when it first loaded. */
    var ss=img.getAttribute("srcset")||"";
    if(ss.indexOf("/_next/")>-1)img.removeAttribute("srcset");
    var s=img.getAttribute("src")||"";
    if(s.indexOf("data:")===0)return;
    var m=s.match(/\\/_next\\/image\\?url=([^&]+)/);
    var key=m?decodeURIComponent(m[1]):s;
    if(ART[key]){img.removeAttribute("srcset");img.setAttribute("src",ART[key]);}
  }
  function sweepImg(){
    var imgs=document.getElementsByTagName("img");
    for(var i=0;i<imgs.length;i++)fixImg(imgs[i]);
    var all=document.querySelectorAll('[style*="/_next/"]');
    for(var j=0;j<all.length;j++){
      var st=all[j].getAttribute("style")||"";
      var out=st.replace(/\\/_next\\/image\\?url=([^&"')]+)[^"')]*/g,function(w,e){
        try{return ART[decodeURIComponent(e)]||w}catch(x){return w}
      });
      for(var k in ART)if(out.indexOf(k)>-1)out=out.split(k).join(ART[k]);
      if(out!==st)all[j].setAttribute("style",out);
    }
  }
  sweepImg();
  new MutationObserver(sweepImg).observe(document.documentElement,
    {subtree:true,childList:true,attributes:true,
     attributeFilter:["src","srcset","style"]});
  document.addEventListener("DOMContentLoaded",sweepImg);
  window.addEventListener("load",sweepImg);

  /* 5. History. If the host sandboxes the frame, pushState to another path
     throws and the router's navigation dies half-way. Swallowing it leaves
     the app on the route it just rendered, which is the whole point. */
  /* The address never leaves the artifact's own.

     This is a single file with no server behind it, so the address bar is the
     one piece of state that can outlive the page — and it is the one piece
     that cannot be honoured. Let the router write /about into it and the next
     reload asks the host for /about, which does not exist: the frame comes
     back on a dead page, and the wipe's stale "arriving covered" flag paints
     it over in full-screen peach. Measured end to end, and it is exactly the
     "about will not open, it is stuck" that went looking for a cause.

     So the router is given its pushState and the address is held still. It
     does not mind: the router keeps its own idea of where it is and only
     reads the address once, at startup. What it writes is passed on below
     so the preloader still knows when the home page has been arrived at. */
  var HERE=location.href;
  ["pushState","replaceState"].forEach(function(fn){
    var real=history[fn].bind(history);
    history[fn]=function(state,title,url){
      var intended=null;
      try{intended=routeOf(new URL(url==null?location.href:url,location.href))}catch(e){}
      try{real(state,title,HERE)}
      catch(e2){try{real(state,title,location.href)}catch(e3){}}
      /* Where the router has just arrived. Recorded for everything that used
         to ask the address, and passed to the preloader so the home page gets
         its sheet on every visit, not only the first. */
      if(intended)window.__mhRoute=intended;
      try{if(intended&&window.__mhArrive)window.__mhArrive(intended)}catch(e4){}
    };
  });

  /* And the wipe's flag, which only a real page load consumes. Every
     navigation here is a soft one, so it is set and never cleared, and it is
     what tells the next load to come up covered. */
  setInterval(function(){
    try{sessionStorage.removeItem("mh-wipe")}catch(e){}
  },300);
})();
</script>`;

// ------------------------------------------------------------- the shell ---
let html = fs.readFileSync(path.join(APP, "index.html"), "utf8");

// Lifted out before anything else touches the markup, and put back by the
// origin script as a child of <html>. See the note there.
const cut = cutSheet(html);
html = cut.html;

// Preloads would 404 once their targets are inlined; srcset entries collapse
// to the same data URI and are megabytes of duplicate base64.
html = html.replace(/<link[^>]+rel="(preload|prefetch|modulepreload)"[^>]*>/g, "");
html = html.replace(
  /<link[^>]+rel="stylesheet"[^>]*href="(\/_next\/[^"]+)"[^>]*>/g,
  (_m, url) => `<style data-mh-css="${url}">${styles.get(url) ?? read(url).toString("utf8")}</style>`,
);
html = html.replace(/\s(?:srcset|imagesrcset)="[^"]*"/gi, "");
html = html.replace(/<script[^>]*src="(\/_next\/[^"]+)"[^>]*><\/script>/g, (_m, url) =>
  scriptTag(url),
);
html = html.replace(/href="\/favicon\.ico\?([^"]+)"/g, (_m, f) =>
  `href="${dataUri("/_next/static/media/" + f)}"`,
);

const throughOptimiser = /\/_next\/image\?url=([^"&]+)(?:&amp;|&)[^"]*/g;
html = html.replace(throughOptimiser, (whole, enc) => artwork.get(decodeURIComponent(enc)) ?? whole);
for (const [file, uri] of artwork) html = html.split(file).join(uri);

/* The page wipe, which the artifact cannot afford.
 *
 * On the site the three cards cover the screen, the next page arrives, and
 * they sweep off. Here the arrival is the one part that is not guaranteed:
 * the frame is sandboxed, and a navigation that stalls inside it leaves the
 * cards across the whole screen until `pageWipe.rescue` opens them 2.5s later
 * — onto the page the reader started from, because that is the one that is
 * still rendered. A full screen of flat peach, and then their own page back:
 * indistinguishable from the link being broken, and alarming in a way the
 * failure itself is not.
 *
 * So the cards are hidden here and nothing else is touched. The state machine
 * runs exactly as it does on the site, `data-wipe` drives nothing but these
 * three elements (globals.css:522), and the rescue still returns the page. A
 * navigation that works now swaps straight to the new page; one that stalls
 * does nothing visible at all, which is the honest picture of what happened.
 *
 * Only in the artifact. The site keeps its wipe.
 */
const noWipe = "<style>.mh-wipe{display:none!important}</style>";

html = html.replace(/<head([^>]*)>/, (m) => m + origin + noWipe);

const already = new Set([...html.matchAll(/var a="(\/_next\/[^"]+)"/g)].map((m) => m[1]));
const extra = [...needed].filter((u) => !already.has(u));
html = html.replace("</body>", extra.map(scriptTag).join("\n") + "</body>");

// The artifact host owns <html>/<head>/<body>, so hand back the fragment form:
// next/font declares its family variables on hashed classes carried by <html>,
// which a host page's own document would drop, and the host's unlayered
// `body{font:...}` shorthand resets line-height under everything Tailwind
// emits into @layer base.
const cls = (html.match(/<html[^>]*class="([^"]*)"/) || [])[1] ?? "";
const bodyCls = (html.match(/<body[^>]*class="([^"]*)"/) || [])[1] ?? "";
const fontVars = [...html.matchAll(/\.[A-Za-z0-9_-]*__variable\{([^}]*)\}/g)]
  .map((m) => m[1])
  .join(";");

const headInner = html.match(/<head[^>]*>([\s\S]*?)<\/head>/)[1];
const bodyInner = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)[1];

const out = process.argv[2] ?? "site.html";
fs.writeFileSync(
  out,
  `<title>Mahadeva</title>\n` +
    headInner +
    `\n<style>${fontVars ? `:root{${fontVars}}` : ""}\n` +
    `html,body{margin:0;padding:0;background:#0e1e1d;` +
    `font-family:var(--font-body);font-size:var(--text-body-md);` +
    `line-height:var(--leading-body);color:var(--color-fg)}</style>\n` +
    `<div class="${[cls, bodyCls].filter(Boolean).join(" ")}">\n${bodyInner}\n</div>`,
);

console.log(
  `${out}  ${(fs.statSync(out).size / 1048576).toFixed(2)}MB  ` +
    `(${routes.length} routes, ${already.size + extra.length} chunks, ` +
    `${Object.keys(segments).length} segments, ${artwork.size} images)`,
);
console.log(routes.map((r) => r.pathname).join("\n"));
