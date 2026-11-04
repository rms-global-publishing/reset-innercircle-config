import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';

export const MEMBERSHIP_PLANS = {
  tier_1: {
    name: 'Member',
    roleName: 'RMS Member',
    monthly: { price: 2900, paymentLinkId: 'plink_1ULCHTLlKcswOpj9HXpoweKX', url: 'https://donate.rmsglobalpublishing.com/b/00wbJ22I054ubTO9YpgrS03' },
    annual: { price: 29000, paymentLinkId: 'plink_1ULCHWLlKcswOpj9xw4pbAIL', url: 'https://donate.rmsglobalpublishing.com/b/fZu28s0zS8gGaPK6MdgrS04' },
  },
  tier_2: {
    name: 'Pro',
    roleName: 'RMS Pro',
    monthly: { price: 5900, paymentLinkId: 'plink_1ULCHYLlKcswOpj9qCecP6gY', url: 'https://donate.rmsglobalpublishing.com/b/5kQdRa2I054ue1W6MdgrS05' },
    annual: { price: 59000, paymentLinkId: 'plink_1ULCHZLlKcswOpj9WW03enn5', url: 'https://donate.rmsglobalpublishing.com/b/7sYfZieqIaoOf60eeFgrS06' },
  },
  tier_3: {
    name: 'Executive',
    roleName: 'RMS Executive',
    monthly: { price: 9900, paymentLinkId: 'plink_1ULCHbLlKcswOpj9ExCEllKK', url: 'https://donate.rmsglobalpublishing.com/b/3cI4gA0zS1Si7Dy2vXgrS07' },
    annual: { price: 99000, paymentLinkId: 'plink_1ULCHdLlKcswOpj9GrXjAk9u', url: 'https://donate.rmsglobalpublishing.com/b/00wfZi3M4aoOga46MdgrS08' },
  },
};

const LINK_INDEX = new Map();
for (const [tier, plan] of Object.entries(MEMBERSHIP_PLANS)) {
  for (const interval of ['monthly', 'annual']) {
    LINK_INDEX.set(plan[interval].paymentLinkId, { tier, interval });
  }
}

const roleEnv = {
  tier_1: 'RMS_MEMBER_ROLE_ID',
  tier_2: 'RMS_PRO_ROLE_ID',
  tier_3: 'RMS_EXECUTIVE_ROLE_ID',
};

function safeEqual(a, b) {
  try {
    const x = Buffer.from(a);
    const y = Buffer.from(b);
    return x.length === y.length && timingSafeEqual(x, y);
  } catch {
    return false;
  }
}

export function createMembershipReference(discordUserId) {
  const secret = process.env.RMS_MEMBERSHIP_SIGNING_SECRET || '';
  if (!secret || !/^\d{15,22}$/.test(discordUserId || '')) throw new Error('Membership signing is not configured.');
  const issued = Math.floor(Date.now() / 1000);
  const nonce = randomBytes(6).toString('hex');
  const payload = `${discordUserId}.${issued}.${nonce}`;
  const sig = createHmac('sha256', secret).update(payload).digest('base64url').slice(0, 24);
  return `rmsd_${discordUserId}_${issued}_${nonce}_${sig}`;
}

export function verifyMembershipReference(reference) {
  const secret = process.env.RMS_MEMBERSHIP_SIGNING_SECRET || '';
  const match = /^rmsd_(\d{15,22})_(\d{10})_([a-f0-9]{12})_([A-Za-z0-9_-]{24})$/.exec(reference || '');
  if (!secret || !match) return null;
  const [, discordUserId, issuedRaw, nonce, supplied] = match;
  const issued = Number(issuedRaw);
  if (!Number.isSafeInteger(issued) || Math.abs(Math.floor(Date.now() / 1000) - issued) > 86400) return null;
  const payload = `${discordUserId}.${issued}.${nonce}`;
  const expected = createHmac('sha256', secret).update(payload).digest('base64url').slice(0, 24);
  return safeEqual(expected, supplied) ? discordUserId : null;
}

export function membershipButtons(discordUserId) {
  const ref = encodeURIComponent(createMembershipReference(discordUserId));
  const make = (tier, interval, label, style = 5) => ({
    type: 2,
    style,
    label,
    url: `${MEMBERSHIP_PLANS[tier][interval].url}?client_reference_id=${ref}`,
  });
  return [
    { type: 1, components: [make('tier_1','monthly','Member · $29/mo'), make('tier_1','annual','Member · $290/yr')] },
    { type: 1, components: [make('tier_2','monthly','Pro · $59/mo'), make('tier_2','annual','Pro · $590/yr')] },
    { type: 1, components: [make('tier_3','monthly','Executive · $99/mo'), make('tier_3','annual','Executive · $990/yr')] },
  ];
}

export function paidTierFromRoles(memberRoleIds = []) {
  const roles = new Set(Array.isArray(memberRoleIds) ? memberRoleIds : []);
  const ids = configuredRoleIds();
  // Ambiguous or unconfigured role mappings never establish paid authority.
  if (Object.values(ids).some(id => !id) || new Set(Object.values(ids)).size !== 3) return null;
  const matches = Object.entries(ids).filter(([, id]) => roles.has(id));
  return matches.length === 1 ? matches[0][0] : null;
}

export function buildMembershipCommandResponse(discordUserId, memberRoleIds = []) {
  const paidTier = paidTierFromRoles(memberRoleIds);
  if (paidTier) {
    const plan = MEMBERSHIP_PLANS[paidTier];
    const guidance = {
      tier_1: 'Start in the Reset Engagement Lounge, join creator sessions, and explore your Member resources.',
      tier_2: 'Start in the Reset Engagement Lounge, explore expanded Pro resources, and join eligible creator sessions.',
      tier_3: 'Start in the Reset Engagement Lounge, explore Executive resources, and review priority participation opportunities where available.',
    };
    return {
      ephemeral: true,
      embeds: [{
        color: 0xC8A24A,
        title: `RESET Inner Circle - ${plan.name} member guide`,
        description: `Your Discord account currently holds the ${plan.name} membership role.\n\n${guidance[paidTier]}\n\nMembership roles reflect access, not ownership or guaranteed placements. For billing changes, use your Stripe customer portal or contact support. If your role does not match your payment, contact support before purchasing again.`,
        footer: { text: 'RMS Global Publishing - Reset Inner Circle - Ownership First' },
      }],
    };
  }
  if (process.env.RMS_MEMBERSHIP_PUBLIC_ENABLED !== 'true') {
    return {
      ephemeral: true,
      embeds: [{
        color: 0xC8A24A,
        title: 'RESET Inner Circle · Membership',
        description:
          '**Membership checkout is in final activation.**\n\n' +
          'Pricing and plans are live on resetinnercircle.com/membership, but paid checkout remains securely gated until Discord paid-role authority completes its final verification.\n\n' +
          'No payment is required or accepted through this command until that proof passes.',
        footer: { text: 'RMS Global Publishing · RESET Inner Circle · Ownership First' },
      }],
    };
  }
  return {
    ephemeral: true,
    embeds: [{
      color: 0xC8A24A,
      title: 'RESET Inner Circle · Membership',
      description:
        '**Choose your lane. Keep your ownership. Build with intention.**\n\n' +
        '**Member — $29/mo · $290/yr**\nCommunity + member resource tier.\n\n' +
        '**Pro — $59/mo · $590/yr**\nExpanded resource access + deeper creator participation.\n\n' +
        '**Executive — $99/mo · $990/yr**\nTop membership resource tier + priority ecosystem participation where offered.\n\n' +
        'Your checkout buttons are securely bound to your Discord identity for automated access. ' +
        'Membership does not guarantee income, placements, publishing deals, or sync licensing.',
      footer: { text: 'RMS Global Publishing · RESET Inner Circle · Ownership First' },
    }],
    components: membershipButtons(discordUserId),
  };
}

export function parseStripeSignature(header = '') {
  const parts = {};
  for (const segment of header.split(',')) {
    const [k, v] = segment.split('=');
    if (k && v) (parts[k] ||= []).push(v);
  }
  return { timestamp: parts.t?.[0] || '', signatures: parts.v1 || [] };
}

export function verifyStripeSignature(rawBody, header) {
  const secret = process.env.RMS_MEMBERSHIP_STRIPE_WEBHOOK_SECRET || '';
  const { timestamp, signatures } = parseStripeSignature(header);
  if (!secret || !/^\d+$/.test(timestamp) || !signatures.length) return false;
  const signedAt = Number(timestamp);
  if (!Number.isSafeInteger(signedAt) || Math.abs(Math.floor(Date.now()/1000)-signedAt) > 300) return false;
  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  return signatures.some((sig) => {
    try {
      const a = Buffer.from(expected, 'hex');
      const b = Buffer.from(sig, 'hex');
      return a.length === b.length && timingSafeEqual(a,b);
    } catch { return false; }
  });
}

function stringId(value) {
  if (!value) return '';
  return typeof value === 'string' ? value : value.id || '';
}

function subscriptionIdFromInvoice(invoice) {
  return stringId(invoice?.subscription) ||
    stringId(invoice?.parent?.subscription_details?.subscription) ||
    stringId(invoice?.lines?.data?.find?.(line => line.subscription)?.subscription);
}

function tierFromSubscription(subscription) {
  const metadata = subscription?.metadata || {};
  let tier = metadata.tier || '';
  let interval = metadata.billing_cycle || '';
  const price = subscription?.items?.data?.[0]?.price;
  if (!tier) tier = price?.metadata?.tier || '';
  if (!interval) {
    interval = price?.metadata?.billing_cycle || (price?.recurring?.interval === 'year' ? 'annual' : price?.recurring?.interval === 'month' ? 'monthly' : '');
  }
  return { tier, interval };
}

export function normalizeMembershipStripeEvent(event) {
  const type = event?.type || '';
  const object = event?.data?.object || {};
  const base = {
    event_id: event?.id || '',
    event_type: type,
    event_created: event?.created || 0,
    discord_user_id: '',
    principal_email: '',
    customer_id: '',
    subscription_id: '',
    tier: '',
    billing_interval: '',
    subscription_status: '',
    current_period_end: '',
    cancel_at_period_end: false,
  };

  if (type === 'checkout.session.completed' || type === 'checkout.session.async_payment_succeeded') {
    const binding = LINK_INDEX.get(stringId(object.payment_link));
    const discordUserId = verifyMembershipReference(object.client_reference_id);
    if (!binding || !discordUserId || object.mode !== 'subscription') return null;
    return {
      ...base,
      discord_user_id: discordUserId,
      principal_email: object.customer_details?.email || object.customer_email || '',
      customer_id: stringId(object.customer),
      subscription_id: stringId(object.subscription),
      tier: binding.tier,
      billing_interval: binding.interval,
      subscription_status: object.payment_status === 'paid' || object.payment_status === 'no_payment_required' ? 'active' : 'incomplete',
    };
  }

  if (type.startsWith('customer.subscription.')) {
    const { tier, interval } = tierFromSubscription(object);
    return {
      ...base,
      customer_id: stringId(object.customer),
      subscription_id: object.id || '',
      tier,
      billing_interval: interval,
      subscription_status: type === 'customer.subscription.deleted' ? 'canceled' : (object.status || ''),
      current_period_end: object.current_period_end || object.items?.data?.[0]?.current_period_end || '',
      cancel_at_period_end: Boolean(object.cancel_at_period_end),
    };
  }

  if (type === 'invoice.payment_failed' || type === 'invoice.paid' || type === 'invoice.payment_succeeded') {
    return {
      ...base,
      customer_id: stringId(object.customer),
      subscription_id: subscriptionIdFromInvoice(object),
      subscription_status: type === 'invoice.payment_failed' ? 'past_due' : 'active',
    };
  }

  return null;
}

async function membershipGateway(action, payload = {}) {
  const supabaseUrl = (process.env.RMS_CREATORHUB_SUPABASE_URL || '').replace(/\/$/,'');
  const secret = process.env.RMS_MEMBERSHIP_SIGNING_SECRET || '';
  if (!supabaseUrl || !secret) throw new Error('CreatorHub membership gateway is not configured.');
  const response = await fetch(`${supabaseUrl}/functions/v1/rms-membership-gateway`, {
    method:'POST',
    headers:{'x-rms-membership-secret':secret,'content-type':'application/json',accept:'application/json'},
    body:JSON.stringify({action,...payload}),
  });
  if (!response.ok) throw new Error(`CreatorHub membership gateway failed: ${response.status}`);
  return response.json();
}

export async function recordMembershipEvent(normalized) {
  return membershipGateway('ingress', { event: normalized });
}

async function discordRequest(path, method='GET', body) {
  const token = process.env.DISCORD_TOKEN || '';
  if (!token) throw new Error('Discord token is not configured.');
  const response = await fetch(`https://discord.com/api/v10${path}`, {
    method,
    headers:{authorization:`Bot ${token}`, ...(body ? {'content-type':'application/json'} : {})},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const detail = await response.text().catch(()=> '');
    throw new Error(`Discord API ${method} ${path} failed: ${response.status} ${detail.slice(0,180)}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export function configuredRoleIds() {
  return Object.fromEntries(Object.entries(roleEnv).map(([tier,key]) => [tier, process.env[key] || '']));
}

export async function reconcileDiscordMembership(discordUserId, desiredTier) {
  if (!discordUserId) return { ok:true, skipped:'no_discord_binding' };
  const guildId = process.env.DISCORD_GUILD_ID || '';
  const ids = configuredRoleIds();
  if (!guildId || Object.values(ids).some(id => !id)) throw new Error('Membership role IDs are not fully configured.');
  for (const [tier, roleId] of Object.entries(ids)) {
    const path = `/guilds/${guildId}/members/${discordUserId}/roles/${roleId}`;
    if (desiredTier === tier) await discordRequest(path,'PUT');
    else await discordRequest(path,'DELETE');
  }
  return { ok:true, desiredTier:desiredTier || null };
}

export async function bootstrapMembershipRoles() {
  const guildId = process.env.DISCORD_GUILD_ID || '';
  if (!guildId) throw new Error('Discord guild is not configured.');
  const existing = await discordRequest(`/guilds/${guildId}/roles`);
  const definitions = [
    { tier:'tier_1', name:'RMS Member', color:0xA58A54 },
    { tier:'tier_2', name:'RMS Pro', color:0xC8A24A },
    { tier:'tier_3', name:'RMS Executive', color:0xE2C675 },
  ];
  const roles = {};
  for (const def of definitions) {
    let role = existing.find(item => item.name === def.name);
    if (!role) role = await discordRequest(`/guilds/${guildId}/roles`,'POST',{name:def.name,color:def.color,hoist:false,mentionable:false,permissions:'0'});
    roles[def.tier] = role.id;
  }
  return roles;
}

export async function controlledMembershipRoleProof(roles) {
  const guildId = process.env.DISCORD_GUILD_ID || '';
  const target = await membershipGateway('control_target');
  if (!target?.discord_user_id) return {ok:false,reason:'no_controlled_bound_identity'};
  for (const roleId of Object.values(roles)) {
    const path=`/guilds/${guildId}/members/${target.discord_user_id}/roles/${roleId}`;
    await discordRequest(path,'PUT');
    await discordRequest(path,'DELETE');
  }
  return {ok:true,grant_revoke_roles:Object.keys(roles).length};
}
