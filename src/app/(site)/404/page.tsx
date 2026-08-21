import { NotFoundView } from "@/components/sections/NotFoundView";
import { buildMetadata } from "@/config/seo";

/**
 * The 404, as a page you can link to.
 *
 * The footer carries a "404" link, as the original template does — it is how
 * the page gets looked at without having to mistype a URL. Nothing was behind
 * it, so the link fell through to Next's own not-found, which lives at the app
 * root, outside this group and therefore under a different root layout. Next
 * leaves the client router and reloads the document for a root layout change,
 * so the one link meant to show the page off was also the one link that threw
 * the wipe away.
 *
 * A real route inside the group fixes both: same view, same layout, and the
 * navigation stays client-side like every other.
 *
 * Not indexed — a duplicate of the 404 is the last thing that should rank.
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
