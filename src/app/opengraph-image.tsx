import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ogCard } from "@/config/seo";
import { siteConfig } from "@/config/site.config";

/**
 * The picture every share of this site shows.
 *
 * The metadata pointed at `/opengraph-image` and nothing answered there, so a
 * link to any page of this site posted to WhatsApp, LinkedIn or X came up with
 * no image at all. This is the route that was missing. Being the file Next
 * looks for, it is now found by name rather than named in config, and every
 * page that has no picture of its own gets it with its type and dimensions
 * declared alongside.
 *
 * Drawn rather than exported, so it cannot fall out of date with the site: the
 * ground, the accent and the words all come from the same places the pages
 * take them from.
 *
 * The mark is read off disk as bytes and inlined. `ImageResponse` renders on
 * the server with no browser and no network, so it cannot follow an `<img
 * src>` to a path — it needs the file itself. Generated once at build and
 * cached from then on.
 */

/* All three come from `ogCard`, which is what the pages promise. */
export const alt = ogCard.alt;
export const size = { width: ogCard.width, height: ogCard.height };
export const contentType = ogCard.type;

export default async function Image() {
  const mark = await readFile(
    join(process.cwd(), "public/uploads/logos/mahadeva-white.png"),
  );
  const markSrc = `data:image/png;base64,${mark.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          // The site's own ground, and its own ink on it.
          backgroundColor: "#0e1e1d",
          color: "#ffffff",
          padding: 72,
        }}
      >
        {/* The pattern field the site opens on, reduced to the one row that
            survives being 1200px wide and seen as a thumbnail. */}
        <div style={{ display: "flex", gap: 12 }}>
          {["#8cffa7", "#c3b5fd", "#a5dcff", "#ffd9a0", "#8cffa7"].map(
            (fill, i) => (
              <div
                key={fill + i}
                style={{
                  width: 26,
                  height: i % 2 === 0 ? 78 : 46,
                  backgroundColor: fill,
                }}
              />
            ),
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- next/image
              has no meaning here: this renders on a server with no browser. */}
          <img src={markSrc} alt="" width={385} height={60} />
          <div
            style={{
              display: "flex",
              fontSize: 44,
              lineHeight: 1.25,
              letterSpacing: -0.5,
              maxWidth: 900,
            }}
          >
            {siteConfig.tagline}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
