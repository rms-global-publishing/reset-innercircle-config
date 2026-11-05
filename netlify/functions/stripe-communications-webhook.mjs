import { createHmac, timingSafeEqual } from 'node:crypto';

const RESET_PAYMENT_LINKS = new Map([
  ['plink_1UG7sdLlKcswOpj9H69f92AA', { lane: 'reset_society_support', paymentType: 'optional_support', subject: 'Reset Society support payment received' }],
  ['plink_1UG8HHLlKcswOpj9aJJoRmGd', { lane: 'reset_media_studios', paymentType: 'project_deposit', subject: 'RMS Global Publishing Cloud Studio XR project deposit received' }],
  ['plink_1UG8HNLlKcswOpj9oTj7dBbn', { lane: 'reset_live_events', paymentType: 'booking_deposit', subject: 'Reset Live booking deposit received' }]
]);

function parseStripeSignatureHeader(header = '') {
  const parsed = {};
  for (const part of header.split(',')) {
    const [key, value] = part.split('=');
    if (!key || !value) continue;
    (parsed[key] ||= []).push(value);
  }
  return { timestamp: parsed.t?.[0] || '', signatures: parsed.v1 || [] };
}

function safeCompareHex(a, b) {
  try {
    const x = Buffer.from(a, 'hex');
    const y = Buffer.from(b, 'hex');
    return x.length === y.length && timingSafeEqual(x, y);
  } catch {
    return false;
  }
}

export function verifyStripeSignature(rawBody, header, secret, nowSeconds = Math.floor(Date.now() / 1000)) {
  const { timestamp, signatures } = parseStripeSignatureHeader(header);
  if (!/^\d+$/.test(timestamp) || !signatures.length || !secret) return false;
  const signedAt = Number(timestamp);
  if (!Number.isSafeInteger(signedAt) || Math.abs(nowSeconds - signedAt) > 300) return false;
  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`, 'utf8').digest('hex');
  return signatures.some((signature) => safeCompareHex(expected, signature));
}

function stringId(value) {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id || null;
}

export default async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: { allow: 'POST', 'cache-control': 'no-store' } });
  }

  const webhookSecret = process.env.RESET_STRIPE_COMMUNICATIONS_WEBHOOK_SECRET || '';
  const ingressSecret = process.env.RESET_CREATORHUB_COMMUNICATIONS_INGRESS_SECRET || '';
  const supabaseUrl = (process.env.RMS_CREATORHUB_SUPABASE_URL || '').replace(/\/$/, '');
  const supabasePublishableKey = process.env.RMS_CREATORHUB_SUPABASE_PUBLISHABLE_KEY || '';
  if (!webhookSecret || !ingressSecret || !supabaseUrl || !supabasePublishableKey) {
    return Response.json({ error: 'Webhook is not configured.' }, { status: 500, headers: { 'cache-control': 'no-store' } });
  }

  const rawBody = await request.text();
  if (!verifyStripeSignature(rawBody, request.headers.get('stripe-signature') || '', webhookSecret)) {
    return Response.json({ error: 'Invalid Stripe signature.' }, { status: 400, headers: { 'cache-control': 'no-store' } });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: 'Invalid JSON payload.' }, { status: 400, headers: { 'cache-control': 'no-store' } });
  }

  if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event?.type)) {
    return Response.json({ received: true, ignored: true, eventType: event?.type || null }, { headers: { 'cache-control': 'no-store' } });
  }

  const session = event?.data?.object;
  if (!event.id || typeof event.id !== 'string' || !session || session.object !== 'checkout.session' || typeof session.id !== 'string') {
    return Response.json({ error: 'Invalid checkout session event.' }, { status: 400, headers: { 'cache-control': 'no-store' } });
  }

  const paymentLinkId = stringId(session.payment_link);
  const binding = RESET_PAYMENT_LINKS.get(paymentLinkId);
  if (!binding) {
    return Response.json({ received: true, ignored: true, reason: 'not_reset_payment_link', sessionId: session.id }, { headers: { 'cache-control': 'no-store' } });
  }

  if (session.payment_status !== 'paid') {
    return Response.json({ received: true, ignored: true, reason: 'payment_not_paid', sessionId: session.id }, { headers: { 'cache-control': 'no-store' } });
  }

  const customerEmail = session.customer_details?.email || session.customer_email || null;
  const amountTotal = typeof session.amount_total === 'number' ? session.amount_total : null;
  const currency = typeof session.currency === 'string' ? session.currency.toLowerCase() : null;
  const bodyExcerpt = `${binding.subject}. ${amountTotal === null ? 'Amount unavailable' : `${currency || 'usd'} ${amountTotal}`} via verified Stripe Payment Link.`;
  const payload = {
    stripe_event_id: event.id,
    stripe_checkout_session_id: session.id,
    stripe_payment_link_id: paymentLinkId,
    stripe_payment_intent_id: stringId(session.payment_intent),
    lane: binding.lane,
    payment_type: binding.paymentType,
    amount_total_cents: amountTotal,
    currency,
    payment_status: session.payment_status,
    customer_email: customerEmail,
    source: 'stripe',
    scope: 'resetinnercircle'
  };

  const rpcResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/rms_record_reset_stripe_ingress`, {
    method: 'POST',
    headers: {
      apikey: supabasePublishableKey,
      'content-type': 'application/json',
      accept: 'application/json'
    },
    body: JSON.stringify({
      p_secret: ingressSecret,
      p_external_event_id: event.id,
      p_event_type: event.type,
      p_sender_email: customerEmail,
      p_subject: binding.subject,
      p_body_excerpt: bodyExcerpt,
      p_payload: payload
    })
  });

  if (!rpcResponse.ok) {
    console.error('Reset Stripe communications ingress failed:', rpcResponse.status);
    return Response.json({ error: 'Communications ingress failed.' }, { status: 500, headers: { 'cache-control': 'no-store' } });
  }

  const ingressId = await rpcResponse.json();
  return Response.json({ received: true, communications_ingress: true, ingressId, lane: binding.lane }, { headers: { 'cache-control': 'no-store' } });
};
