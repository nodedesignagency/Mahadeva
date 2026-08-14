import { LegalDocument } from "@/components/sections/LegalDocument";
import { buildMetadata } from "@/config/seo";
import { termsOfServices } from "@/content/legal";

export const metadata = buildMetadata({
  title: "Terms of Services",
  description: termsOfServices.intro,
  path: "/legal-pages/terms-of-services",
});

export default function TermsOfServicesPage() {
  return <LegalDocument content={termsOfServices} />;
}
