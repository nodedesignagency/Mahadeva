/**
 * The one piece of network code both forms use.
 *
 * `lib/contact` and `lib/careers` each say where their own form goes and why;
 * this is how it gets there, which is the same for both and was written twice.
 *
 * ── What an endpoint has to be ─────────────────────────────────────────────
 *
 * Any URL that accepts a JSON POST from a browser. That is deliberately the
 * whole requirement: it means the free form services all work with no code
 * change, and so does a webhook, a CRM's inbound URL, or a route of your own.
 * Nothing here names a provider.
 *
 * ── The access key ─────────────────────────────────────────────────────────
 *
 * Some services identify the form by a key in the body rather than by the URL.
 * `NEXT_PUBLIC_FORM_ACCESS_KEY` is merged in as `access_key` when it is set,
 * and left out entirely when it is not — a service that identifies by URL
 * simply never sees it.
 *
 * It is `NEXT_PUBLIC_` and therefore visible in the browser, which is correct
 * rather than a compromise: this posts from the reader's browser, so whatever
 * it sends is public by construction. Keys of this kind are issued to be
 * public. A secret that must stay secret cannot live in a form that submits
 * from the page — that needs a route on the server, which is a different
 * shape of thing.
 */

type Payload = Record<string, string>;

export async function submitForm(
  endpoint: string,
  payload: Payload,
): Promise<void> {
  const accessKey = process.env.NEXT_PUBLIC_FORM_ACCESS_KEY;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(accessKey ? { access_key: accessKey, ...payload } : payload),
  });

  // Thrown rather than returned: a form has one failure state and no use for
  // the difference between a 500 and a 422, but the console should carry it.
  if (!response.ok) {
    throw new Error(`Form endpoint returned ${response.status}`);
  }
}
