import { Container } from "@/components/layout/Container";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { Button } from "@/components/ui/Button";

/**
 * 404.
 *
 * At the root rather than inside the (site) group, because this is what Next
 * serves for any URL the app does not have — including ones that never reach a
 * group. It still wears the site's chrome: someone who mistyped a URL is a
 * visitor, and should get the header and the way back rather than a bare page.
 *
 * Written out rather than left to the framework's default, which renders its
 * own unstyled panel in whatever the OS colour scheme is and ignores the site
 * entirely.
 */
export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <SiteChrome>
      <section
        data-bg="dark"
        className="flex min-h-screen items-center bg-bg pt-header text-fg"
      >
        <Container className="flex flex-col items-start gap-6">
          <p className="font-body text-body-md text-accent">404</p>
          <h1 className="max-w-[20ch] text-display-lg leading-(--leading-display) tracking-(--tracking-display) font-normal">
            This page does not exist
          </h1>
          <p className="max-w-[46ch] font-body text-body-md">
            The link may be out of date, or the address mistyped. Everything
            else is where you left it.
          </p>
          <Button href="/" withArrow className="mt-4">
            Back to the home page
          </Button>
        </Container>
      </section>
    </SiteChrome>
  );
}
