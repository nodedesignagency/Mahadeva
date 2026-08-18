import { SiteChrome } from "@/components/layout/SiteChrome";
import { NotFoundView } from "@/components/sections/NotFoundView";

/**
 * 404.
 *
 * At the root rather than inside the (site) group, because this is what Next
 * serves for any URL the app does not have — including ones that never reach a
 * group. It still wears the site's chrome: someone who mistyped a URL is a
 * visitor, and should get the header and a way back rather than a bare page.
 *
 * The page itself is NotFoundView, which `(site)/404` renders too — see the
 * note there.
 */

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <SiteChrome>
      <NotFoundView />
    </SiteChrome>
  );
}
