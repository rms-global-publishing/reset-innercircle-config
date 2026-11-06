const ALLOWED_STRIPE_CHECKOUT_HOSTS = new Set([
  'buy.stripe.com',
  'checkout.stripe.com',
  'donate.rmsglobalpublishing.com'
]);

function isAllowedStripeCheckoutUrl(value = '') {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ALLOWED_STRIPE_CHECKOUT_HOSTS.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

const buckets = {
  studio: 'RESET_STRIPE_STUDIO_SERVICES_URL',
  events: 'RESET_STRIPE_EVENT_SERVICES_URL'
};

export default async (request) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    return new Response('Method Not Allowed', { status: 405, headers: { allow: 'GET, HEAD', 'cache-control': 'no-store' } });
  }
  const url = new URL(request.url);
  // Netlify rewrites retain the original public pathname in the Request URL.
  // The public route also takes precedence over caller-supplied query values.
  const routeBucket = {
    '/checkout/studio': 'studio',
    '/checkout/events': 'events'
  }[url.pathname];
  const bucket = routeBucket || String(url.searchParams.get('bucket') || '').toLowerCase();
  const envName = buckets[bucket];
  const checkoutUrl = envName ? (process.env[envName] || '') : '';

  if (!envName || !checkoutUrl || !isAllowedStripeCheckoutUrl(checkoutUrl)) {
    const body = request.method === 'HEAD' ? null : `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Reset Services Checkout</title><style>body{background:#08090b;color:#f4efe4;font-family:Arial;display:grid;place-items:center;min-height:100vh;margin:0}main{max-width:680px;padding:40px;text-align:center}h1{font-family:Georgia,serif;font-size:48px;font-weight:400;color:#e4c875}a{color:#c8a24a}</style></head><body><main><h1>Secure checkout is being connected.</h1><p>This Reset service payment lane is not active yet. No payment has been initiated.</p><p><a href="/">Return to Reset Inner Circle</a></p></main></body></html>`;
    return new Response(body, { status: 503, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
  }

  // Operational attribution only: no IP, cookie, payment details, or user identity.
  // Correlate checkout starts by route and UTC time without adding paid infrastructure.
  const source = request.headers.get('referer') || '';
  let origin = 'direct';
  try {
    const referer = new URL(source);
    if (referer.protocol === 'https:' && referer.hostname === url.hostname) origin = 'same-site';
    else if (referer.protocol === 'https:') origin = 'external';
  } catch { /* missing or invalid Referer */ }
  console.info('reset_checkout_redirect', JSON.stringify({ lane: bucket, origin, at: new Date().toISOString() }));
  return new Response(null, { status: 302, headers: { location: checkoutUrl, 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' } });
};
