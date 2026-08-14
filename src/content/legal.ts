/**
 * The legal pages.
 *
 * Two documents of the same shape, so they are two entries here and one
 * component rather than two pages that have to be kept looking alike.
 *
 * The copy is a template's placeholder and nothing more. It describes a
 * plausible SaaS and reads correctly, which is what a buyer needs to see the
 * page working — but it has not been written for anybody's jurisdiction or
 * business, and it is not legal advice. Replace both documents before launch.
 */

export type LegalDocument = {
  /** One entry per visual line, as everywhere else the reveal is used. */
  titleLines: readonly string[];
  intro: string;
  sections: readonly { heading: string; body: string }[];
};

export const privacyPolicy: LegalDocument = {
  titleLines: ["Privacy Policy"],
  intro:
    "At Mahadeva AI, we take your privacy seriously and design our platform with security in mind. By using our website or services, you agree to the practices described below. If you have questions, you can contact us anytime.",
  sections: [
    {
      heading: "Information We Collect",
      body: "We collect information you provide directly, such as your name, email address, and account details. We may also collect usage data including device information, browser type, and interaction patterns to improve performance. Some data is collected automatically through cookies and analytics to help us understand how the platform is used.",
    },
    {
      heading: "How We Use Your Information",
      body: "We use your information to provide, maintain, and improve Mahadeva AI services. This includes onboarding, customer support, feature improvements, and security monitoring. We may also use your contact information to send product updates, service notifications, and important account-related messages.",
    },
    {
      heading: "Cookies and Tracking Technologies",
      body: "Mahadeva AI uses cookies to keep the website functional and improve your experience. Cookies help us remember preferences, measure performance, and understand which pages are most useful. You can manage or disable cookies through your browser settings, but some features may not work correctly without them.",
    },
    {
      heading: "Data Sharing and Third Parties",
      body: "We do not sell your personal information to third parties. We may share limited data with trusted service providers that help us operate the platform, such as hosting, analytics, and customer support tools. These providers are required to protect your information and only use it to deliver services on our behalf.",
    },
    {
      heading: "Data Security",
      body: "We use industry-standard security practices to protect your data from unauthorized access, loss, or misuse. This includes encryption, access controls, and secure infrastructure practices. While no system can guarantee 100% security, we continuously improve our safeguards to keep your information protected.",
    },
    {
      heading: "Your Rights and Choices",
      body: "You can request access, updates, or deletion of your personal information at any time. You may also opt out of marketing emails by using the unsubscribe link in our messages. If you have questions about your data or privacy rights, our team will help you resolve them quickly.",
    },
  ],
};

export const termsOfServices: LegalDocument = {
  titleLines: ["Terms of Services"],
  intro:
    "These terms set out how Mahadeva AI may be used and what you can expect from us. By using our website or services, you agree to them. If you have questions, you can contact us anytime.",
  sections: [
    {
      heading: "Acceptance of These Terms",
      body: "By accessing our website, creating an account, or engaging us for work, you agree to these terms on behalf of yourself and any organisation you represent. If you do not agree with them, please do not use the services. Continued use after a change to these terms means you accept the revised version.",
    },
    {
      heading: "Use of Our Services",
      body: "You may use Mahadeva AI for lawful business purposes only. You agree not to interfere with the platform, attempt to access it by means other than the interfaces we provide, or use it to build a competing service. We may suspend access where use puts the platform, our other clients, or their data at risk.",
    },
    {
      heading: "Accounts and Access",
      body: "You are responsible for the accuracy of your account details and for everything done under your credentials. Keep them confidential and tell us promptly if you believe they have been compromised. Access granted to your team members remains your responsibility to manage and revoke.",
    },
    {
      heading: "Fees and Payment",
      body: "Fees, billing periods, and scope are set out in the plan or statement of work you agree with us. Invoices are payable within the terms stated on them, and work may be paused where an account falls significantly overdue. Unless stated otherwise, fees exclude taxes, which are charged where applicable.",
    },
    {
      heading: "Intellectual Property",
      body: "We retain ownership of the platform, our tooling, and anything we developed before or outside your engagement. You retain ownership of the content and data you provide. Rights in work produced specifically for you transfer on full payment, as set out in the agreement covering that work.",
    },
    {
      heading: "Limitation of Liability",
      body: "The services are provided without warranties beyond those the law requires us to give. To the extent permitted by law, we are not liable for indirect or consequential loss, including lost profits or lost data, and our total liability is limited to the fees paid in the twelve months before the claim arose.",
    },
    {
      heading: "Changes and Termination",
      body: "We may update these terms as the services change, and will make the current version available here. Either party may end an engagement in line with the notice period in the agreement covering it. Provisions that are meant to survive termination — ownership, confidentiality, and liability — continue to apply.",
    },
  ],
};
