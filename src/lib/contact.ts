/**
 * Where a contact enquiry goes.
 *
 * The one function to change when connecting this form to something real, and
 * deliberately the only place that knows there is a network at all — the form
 * component's job is to collect and validate, not to know about a provider.
 *
 * Set `NEXT_PUBLIC_CONTACT_ENDPOINT` to any URL that accepts a JSON POST and
 * it works with no code change: a form service, a webhook, a CRM's inbound
 * URL, or a route of your own. Without one the form validates, shows its sent
 * state and discards the message — so the page is complete and testable out of
 * the box, and a buyer sees the design working before they have chosen a
 * provider.
 *
 * That fallback is a deliberate trade and worth stating plainly: an
 * unconfigured form looks like it worked. `SETUP.md` says so, and the console
 * warns in development, but if this site goes live before the endpoint is set,
 * enquiries are lost silently.
 */

type Enquiry = {
  name: string;
  email: string;
  company: string;
  budget: string;
  message: string;
};

export async function sendEnquiry(enquiry: Enquiry): Promise<void> {
  const endpoint = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT;

  if (!endpoint) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[contact] NEXT_PUBLIC_CONTACT_ENDPOINT is not set — the enquiry was " +
          "not sent anywhere. See SETUP.md.",
      );
    }
    return;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(enquiry),
  });

  // Thrown rather than returned: the form has one failure state and no use for
  // the difference between a 500 and a 422, but the console should carry it.
  if (!response.ok) {
    throw new Error(`Contact endpoint returned ${response.status}`);
  }
}
