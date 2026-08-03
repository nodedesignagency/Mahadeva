"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schema";
import { dataset, projectId } from "./src/lib/sanity/env";

/**
 * Studio configuration.
 *
 * The Studio is served from this app at /studio rather than deployed
 * separately, so there is one thing to deploy and the schema can never drift
 * from the code that reads it.
 *
 * `projectId` is asserted here — unlike the read path, which falls back to demo
 * content, there is nothing sensible for an editor to do without a project, and
 * a clear error beats a Studio that loads and then fails every request.
 */
export default defineConfig({
  name: "mahadeva",
  title: "Mahadeva",
  basePath: "/studio",
  projectId: projectId!,
  dataset,
  schema: { types: schemaTypes },
  plugins: [structureTool()],
});
