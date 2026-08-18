import { NotFoundView } from "@/components/sections/NotFoundView";
import { buildMetadata } from "@/config/seo";

/**
 * The 404, as a page you can link to.
 *
 * The footer carries a "404" link, as the original template does — it is how a
 * buyer looks at the page without having to mistype a URL. Without a route
 * behind it that link only reaches Next's own not-found, which lives at the
 * app root, outside this group and therefore under a different root layout.
 * Next leaves the client router and reloads the document for a root layout
 * change, so the one link meant to show off the page was also the one link
 * that threw away the page transition.
 *
 * A real route inside the group fixes both: same view, same layout, and the
 * navigation stays client-side like every other.
 *
 * Not indexed — there is nothing here for a search engine, and a duplicate of
 * the 404 is the last thing that should rank.
 */

export const metadata = {
  ...buildMetadata({
    title: "Page not found",
    description: "The page you are looking for could not be found.",
    path: "/404",
  }),
  robots: { index: false, follow: false },
};

export default function NotFoundPage() {
  return <NotFoundView />;
}
