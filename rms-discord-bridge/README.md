# RMS CreatorHub Discord Bridge

Isolated Discord runtime for the Reset Inner Circle community layer of the RMS Global Publishing ecosystem.

## Why this service is isolated

The RMS Creator Portal production app is not modified by this bridge. The Discord runtime is intentionally separated so Discord SDK upgrades, bot restarts, event outages, or community automation failures cannot break CreatorHub production.

## Dependency

- Node.js 20+
- `discord.js` 14.27.0

The bot uses only the `Guilds` gateway intent. Message Content, Presence, and Server Members privileged intents are not required for the baseline command system.

## Command surface

- `/portal`
- `/submit`
- `/marketplace`
- `/sync`
- `/rights`
- `/events`
- `/missions`
- `/support`

Guild command registration is intentionally scoped to Reset Inner Circle for immediate, controlled updates.

## Security boundary

CreatorHub remains the system of record for private rights, metadata, submissions, contracts, payments, and professional status. Discord receives public-safe routing and community information only.

Never commit or post the Discord token. Configure runtime secrets only through the deployment environment.

## Setup

1. Copy `.env.example` into the hosting provider's environment variable configuration.
2. Set `DISCORD_TOKEN` from the RMS CreatorHub bot application.
3. Confirm `DISCORD_CLIENT_ID=1540169303213609023`.
4. Confirm `DISCORD_GUILD_ID=1429398855681573038`.
5. Fill the support, events, missions, and private automation-alert channel IDs.
6. Install dependencies with `npm install`.
7. Run `npm run check`.
8. Run `npm run register:commands` once after command changes.
9. Run `npm start` under a supervised long-running Node process.
10. Verify `GET /health` returns HTTP 200 before announcing availability.

## Discord permissions

Grant only what this runtime needs:

- View Channels
- Send Messages
- Embed Links
- Read Message History
- Use Application Commands

Do not grant Administrator, Manage Server, Manage Channels, Manage Webhooks, Kick Members, Ban Members, or Manage Messages for the baseline runtime.

Carl-bot remains responsible for admission, self roles, reaction roles, moderation, and event entry controls.

## Production media interoperability

OBS Studio, Elgato Wave Link, and Camera Hub are local production applications. This bot does not attempt to control those applications remotely. Discord live rooms should remain usable whether or not the custom RMS bot is online.

Use the companion `config/rms-live-production-profile.json` as the baseline routing standard for production workstations.

## Health and fallback

If this bridge fails, Discord native Events, Carl-bot, and manual RMS operations must remain available. Operational failures should route privately to `automation-alerts` when configured.


## RMS GP Sound Engineer / Cloud Studio XR commands (candidate 2026-11-14)

The existing RMS CreatorHub Discord application owns these commands, not Carl-bot:

- /engineer - private help menu for the RMS GP Cloud Studio XR audience.
- /engineer issue:soundcheck - stateful audio troubleshooting using the existing authenticated assistance gateway.
- /engineer issue:music - privately record that the member hears voices but no music.
- /engineer issue:silent - privately record that the member hears no audio.
- /engineer issue:echo - feedback-loop troubleshooting guidance; no hardware change.
- /engineer issue:video - missing capture / Go Live guidance; no OBS changes.
- /engineer issue:recording - session notice, permissions and export guidance.
- /engineer issue:mpc - original MPC production and stem workflow.
- /engineer issue:request - direct the member to existing authenticated private support.
- /engineer issue:readiness - authorized Studio staff only; reuse the versioned host / listener checklist stored in the existing gateway.
- /soundcheck - quick entry to the existing stateful audio assistance.

The studio voice destination is channel 1468103128279941272 in guild 1429398855681573038.
When a member cannot access slash commands from the voice-room chat, use the existing Main Arena text channel 1429398859020370096.
User-facing responses are ephemeral and block all mentions. Direct access to the private ChatGPT agent or to local OBS, Wave Link, Stream Deck, MPC and PS5 capture is NOT supplied by the Discord commands.

### Exact release gates

1. Validate Node syntax, existing membership/assistance tests, and the new signed Discord interaction tests.
2. Deploy the approved candidate to the existing isolated Vercel Discord bridge; verify its endpoint, active commit and errors.
3. Run npm run register:commands using the existing securely stored bot credentials, then read back guild application commands from Discord. Do not run it during development or without release authorization; PUT registration changes the guild command set.
4. From a non-staff Discord account run /engineer, /soundcheck, music/silence, and deny the staff readiness route. From an authorized Studio host test the checklist and listener confirmation.
5. Check Carl's existing guidance and /helpstudio without duplicate tags, pings, slash commands, messages or role changes. Keep the Receptionist private case path available and prove any real agent handoff separately.

This update creates no new token, privileged intent, subscription, user impersonation, payment, recording, public stream, customer-access grant, or company record outside existing source of truth.
Candidate code being merged does NOT mean command registration or runtime Sound Engineer dispatch is certified.
