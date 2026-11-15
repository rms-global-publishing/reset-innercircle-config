# RMS Discord Automation Ownership Standard

**Owner:** Angelea McCullough, Founder of RMS Global Publishing  
**Parent system:** RMS Fully Automated Intelligence System  
**Status:** Active

## Purpose

Reset Inner Circle Discord is the live community and activation node of the RMS ecosystem. It is not the authoritative store for creator rights, contracts, payments, unreleased masters, confidential metadata, or professional status. CreatorHub remains the secure system of record for those functions.

## Automation ownership

| System | Primary responsibility |
| --- | --- |
| RMS CreatorHub Discord App | RMS-specific slash commands, CreatorHub routing, public-safe RMS intelligence events, Marketplace/opportunity routing, RMS event status |
| Carl-bot Premium | Code of Law gate; CHOOSE YOUR SIGNALS; self roles; timed reaction roles; Advanced TagScript launchers; Levels/XP ambient progression; sticky messages; voice-role presence; transient auto-purge; verified temporary rooms; automod/Drama Watcher; greetings/farewell; Discord-native YouTube/Twitch alerts; suggestions; starboard; server discovery; private logging |
| Zapier | Cross-platform/calendar/Sheet triggers, approved announcements not owned by Carl, recaps, live-now signals not owned by Carl, cross-platform routing, private failure alerts |
| Tatsu | Verified event/contribution recognition only; not ambient message XP |
| Ticket Tool | Private support and escalation |
| VoiceMaster | Temporary-room fallback during Carl migration; retire if Carl temporary rooms pass verification |
| Statbot | Community analytics and server-health reporting |
| RMS GP Receptionist | Existing authenticated CreatorHub assistance intake, private cases, customer communication, technical escalation and verified closure |
| RMS GP Sound Engineer | Internal, Founder-authorized OBS, Wave Link, Wave:3, Stream Deck, Discord broadcast, camera/capture and MPC diagnostics; no member billing or permission authority |

No two systems should own the same routine notification. Routine `@everyone` pings are prohibited.

## RMS GP Sound Engineer ↔ Carl ↔ Receptionist — 2026-11-14

**Change key:** `RMSGP-INNERCIRCLE-SOUND-ENGINEER-HANDOFF-20261114`

**Implementation state:** The cross-system contract is staged in repository configuration, **not yet applied or live-tested in Carl's authenticated dashboard or the Receptionist runtime**. This section does not grant privileges to either system. Keep the existing production deployment intact until applicable acceptance gates pass and the Founder authorizes release.

1. **Carl: public self-help and discovery only.** In the existing Game Room, Sound Stage and approved help surfaces, reuse current sticky/tag guidance rather than creating a second message or slash command. Prompt members to check the correct Discord Go Live watch tile, output device, stream volume and voice/monitoring status. For unresolved issues, send them to **RMS CreatorHub** `/helpstudio` or `/support` and the existing `https://resetinnercircle.com/helpstudio` page. These commands belong to the CreatorHub Discord App, **not Carl**.
2. **Receptionist: one private case owner.** Preserve the existing authenticated CreatorHub assistance route and case ID. Distinguish urgent active-event sound/video incidents from membership, billing, publishing, licensing and private project concerns. A technical case is escalated internally to the Sound Engineer with only the case reference, public room/route, symptom, UTC time, requested check and explicit testing/recording consent when relevant. Never post confidential creator data or private chat transcripts to public Discord.
3. **Sound Engineer: internal specialist.** Use already-authorized workstation access to verify the *actual* OBS scene, Wave Link routing, microphone, HD60 X signal, Facecam image, Discord audience sound and MPC input as applicable. Report diagnostic evidence, whether an authorized reversible correction was performed, exact tests, blockers and next owner under the same case ID. The engineer must not automatically start/end a broadcast, create paid entitlements, change permissions, promise paid gifts or handle licensing approvals.
4. **Receptionist: complete the member-facing loop.** Receive the technical findings, communicate an accurate status privately, request viewer/host confirmation of restored audio or video, and only then close the support case. Escalate unresolved, high-risk or Founder-approval issues to the proper owner. Never mark resolved based solely on a configured audio route or bot response.

**Emergency route:** A public report of severe feedback, unexpected private audio or no audience sound can produce one private staff alert through the *existing* alert/case mechanism. An alert is not permission for Carl or the Receptionist to manipulate the broadcast. Staff activate the internal Sound Engineer or follow the approved manual safe recovery procedure. Avoid repeat public pings.

**No-overlap rule:** Carl owns existing public guidance, RMS CreatorHub App owns `/helpstudio` and `/support`, Receptionist owns case intake and follow-up, and Sound Engineer owns technical engineering readback. Keep billing, membership, rights, private customer data and public announcements with their existing authoritative owners.

**Required acceptance:** Carl Premium authenticated saved-settings readback; actual CreatorHub command response as an ordinary member; authenticated private Receptionist case receipt; redacted handoff to Sound Engineer; technical evidence return with the *same* case reference; Receptionist readback and viewer confirmation; no duplicate notices, unapproved permissions or new spend. If these cannot be independently demonstrated, label the handoff **PREPARED / NOT LIVE CERTIFIED**.

## Carl-bot Premium operating standard — 2026-10-01

Founder reported the Carl-bot subscription renewed for Reset Inner Circle. The latest dashboard screenshot still displayed **“Carlbot Premium — Not active”**, so the first live gate is to confirm the renewed Premium slot is actually attached to guild `1429398855681573038`. The desired state is version-controlled in `config/carl-premium-automation.json`.

Premium features are approved for use where they add measurable community value without making Carl-bot a single point of failure:

- **Levels & XP:** ambient participation progression only. Level roles are cosmetic/recognition roles and never imply RMS representation, professional clearance, licensing readiness, publishing status, employment, or authority.
- **Sticky Messages:** one concise sticky in high-value channels such as Code of Law, Main Arena, Power Hour, Sound Stage, Help Desk, and community feedback.
- **Voice-Role Links:** temporary presence roles for Sound Stage, Creator Showcase, Game Room, and Cloud Studio XR. Never link authority/private-access roles.
- **Auto Purge:** only transient command/lobby/game chatter. Never purge event participation records, support history, moderation evidence, automation logs, rights/submission records, or decisions.
- **Timed Reaction Roles:** event/session identities expire automatically after the event window. The existing two-minute entry-gate close remains its own workflow.
- **Drama Watcher:** private moderator review channel only; never public-shame a member.
- **Personalize:** use the approved Reset/RS visual system without altering or duplicating the logo.
- **Premium limits:** reaction-role capacity is for clean self-service disciplines and notification roles, not role clutter; YouTube/Twitch capacity is limited to Founder-approved feeds.
- **Separate Farewell:** private operational/member-exit channel rather than public departure messaging.
- **Temporary Channels:** Carl becomes the preferred owner only after lifecycle tests pass; VoiceMaster becomes fallback-only and may then be retired.
- **Immediate Auto-feeds:** Carl owns Discord-native recurring reminders/feeds when designated. Zapier must not duplicate the same routine message.
- **Advanced TagScript:** event-launch and closeout helpers are leadership-only, privacy-safe, concise, and delete invocation where supported.
- **Starboard customization:** use a RESET creator-spotlight surface with a custom reaction threshold; recognition never equals professional approval.
- **Non-Carl ban logs / expanded weblogs:** route to private staff logs and retain cross-bot/human moderation evidence.

Carl standard features should also be fully hardened: welcome DM + gate flow, delayed/normal autoroles where appropriate, sticky self roles, automod, split private logging, suggestions with a decision log, granular command permissions, low-noise triggers, gaming alerts only when relevant, and Server Discovery.

### Prefix retirement

Carl’s dashboard currently warns that prefixes are retiring. Existing prefixes (`!`, `?`, `.flow`, `.reset`, `.rs`) are transitional only. Do not create new leadership workflows that depend on them. Prefer Carl’s slash-command surfaces and slash-accessible tag workflows where supported.

### Fail-safe

If Carl Premium or any Carl module is unavailable, public community access, `https://resetinnercircle.com/`, Discord native Events, the RMS CreatorHub slash-command bridge, and manual moderator operations must remain usable.

## Approved notification roles

- Live Events
- OmniLink Power Hour
- RESET Arena Games
- Platform Missions
- Creator Education
- Collaboration Calls

These roles are notification-only and must grant no elevated server permissions.

## RMS CreatorHub command surface

Target command set:

- `/portal` — CreatorHub and creator onboarding routing
- `/submit` — secure submission routing; never collect unreleased masters or private rights data in Discord
- `/marketplace` — RMS Marketplace routing
- `/sync` — licensing-readiness and Global Sync Catalog guidance; never promise placement
- `/rights` — Rights & Metadata Intelligence education and secure routing
- `/events` — RESET LIVE programming
- `/missions` — current Platform Missions
- `/support` — private support routing

## Public-safe RMS event contract

Approved event types:

- `rms.event.created`
- `rms.event.live`
- `rms.event.completed`
- `rms.mission.published`
- `rms.marketplace.public_listing`
- `rms.creator_showcase.approved`
- `rms.education.published`
- `rms.collaboration_call.published`
- `rms.sync_opportunity.public`
- `rms.system.alert`

Every event must carry a stable `correlation_id`. Consumers must suppress a repeat correlation ID to prevent duplicate posts and pings.

Public-safe fields are limited to event ID/type, title, public description/URL, Discord destination, notification role, schedule/status, approved image URL, correlation ID, and source system.

## Privacy boundary

Never publish or log in public Discord:

- passwords or authentication secrets
- banking/payment information
- government identification
- private contracts
- unreleased masters
- confidential rights splits or metadata
- private CreatorHub records
- OAuth, bot, Supabase, or Zapier credentials

Rights, contracts, submissions, payments, private metadata, and professional approval remain inside approved RMS secure systems.

## Event flow

Approved RMS event source → Zapier/RMS automation → Discord event/announcement → opt-in notification role → event calendar → reminder → live-now → event recap → operational analytics.

Carl-bot must not duplicate Zapier timing notifications. Carl may own a recurring Discord-native reminder/feed only when the automation registry assigns that exact signal to Carl; otherwise Zapier remains the owner. Discord native Events provide RSVP/calendar visibility. Carl Levels may provide ambient participation progression, while Tatsu remains limited to verified event/contribution recognition.

## Recognition standard

Tatsu recognition may reflect verified event completion, helpful creator feedback, completed collaborations, community support, event leadership, and completed Platform Missions.

Raw message volume must not be treated as meaningful achievement. Tatsu status must never imply RMS representation, publishing approval, licensing readiness, sync approval, Marketplace acceptance, or contract eligibility.

## Resilience

- Carl-bot failure: Discord Events and manual RMS operations remain available.
- Zapier failure: send one private alert to `automation-alerts`; use the manual event fallback and do not repeatedly retry public messages.
- Tatsu failure: record recognition manually.
- Failure of one automation provider must never make Reset Inner Circle unusable.

## Brand standard

Public presentation uses near-black, warm ivory, restrained rich gold, concise mobile-safe names, minimal emoji clutter, and premium ownership-first language. Music remains one creator pathway inside a multidisciplinary creator campus.

Permanent public metadata should identify **Angelea McCullough, Founder of RMS Global Publishing** where attribution is appropriate.

## Operating loop

**Signal → Activate → Participate → Verify → Recognize → Measure → Improve**
