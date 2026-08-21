import type { SchemaTypeDefinition } from "sanity";
import { caseStudy } from "./caseStudy";
import { post } from "./post";

/**
 * One schema per dataset, and that is the point of the split.
 *
 * The site's content lives in two Sanity datasets — `production` for the case
 * studies, `blog` for the posts — and each Studio workspace is given only the
 * types its own dataset holds. Handing both lists to both workspaces would put
 * a "Post" entry in the case-studies sidebar that could never contain anything,
 * which is a worse lie than a missing menu item.
 *
 * A dataset can hold as many document types as it likes, so this is a choice
 * rather than a limit: keeping the blog apart means it can be exported,
 * restored or handed over on its own. See SETUP.md for what a buyer has to
 * create.
 */

/** The `production` dataset: everything the site shows except the blog. */
export const productionTypes: SchemaTypeDefinition[] = [caseStudy];

/** The `blog` dataset. */
export const blogTypes: SchemaTypeDefinition[] = [post];
