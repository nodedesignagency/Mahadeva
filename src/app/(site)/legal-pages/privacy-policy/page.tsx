import { LegalDocument } from "@/components/sections/LegalDocument";
import { buildMetadata } from "@/config/seo";
import { privacyPolicy } from "@/content/legal";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: privacyPolicy.intro,
  path: "/legal-pages/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return <LegalDocument content={privacyPolicy} />;
}
