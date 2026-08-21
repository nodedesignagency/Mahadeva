"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { blogTypes, productionTypes } from "./sanity/schema";
import { blogDataset, dataset, projectId } from "./src/lib/sanity/env";

/**
 * Studio configuration.
 *
 * The Studio is served from this app at /studio rather than deployed
 * separately, so there is one thing to deploy and the schema can never drift
 * from the code that reads it.
 *
 * Two workspaces, because the site's content is in two datasets: the case
 * studies in `production` and the posts in `blog`. Each is given only its own
 * dataset's types — see the note in sanity/schema/index.ts.
 *
 * Sanity requires a distinct `basePath` per workspace, so neither of them is
 * plain `/studio`. That address is not a workspace and does not offer a choice
 * either: Sanity redirects an unknown studio path to the first visible
 * workspace in config order, so `/studio` lands on the case studies and the
 * blog is reached from the Workspaces menu or at `/studio/blog`. Which is why
 * `production` is written first here — it is the one an editor opens on.
 *
 * `projectId` is asserted here — unlike the read path, which falls back to demo
 * content, there is nothing sensible for an editor to do without a project, and
 * a clear error beats a Studio that loads and then fails every request.
 */
export default defineConfig([
  {
    name: "production",
    title: "Mahadeva",
    subtitle: "Case studies",
    basePath: "/studio/production",
    projectId: projectId!,
    dataset,
    schema: { types: productionTypes },
    plugins: [structureTool()],
  },
  {
    name: "blog",
    title: "Mahadeva",
    subtitle: "Blog",
    basePath: "/studio/blog",
    projectId: projectId!,
    dataset: blogDataset,
    schema: { types: blogTypes },
    plugins: [structureTool()],
  },
]);
