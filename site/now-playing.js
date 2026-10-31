(() => {
  const DISCORD_INVITE = 'https://discord.gg/PAHFE5mGV';
  const STATE_LABELS = {
    live: 'LIVE NOW',
    soon: 'STARTING SOON',
    replay: 'ON DEMAND / REPLAY',
    offline: 'OFFLINE / NEXT UP'
  };

  const track = (event, metadata = {}) => {
    if (typeof window.resetTrack === 'function') window.resetTrack(event, metadata);
  };

  const safeDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const deriveProgramState = (program, now = new Date()) => {
    const explicit = String(program?.state || '').toLowerCase();
    const start = safeDate(program?.scheduled_start);
    const end = safeDate(program?.scheduled_end);
    const fifteenMinutes = 15 * 60 * 1000;

    if (explicit === 'live') return 'live';
    if (explicit === 'replay' && program?.replay_url) return 'replay';
    if (start && end && now >= start && now <= end) return 'live';
    if (start && now < start && start.getTime() - now.getTime() <= fifteenMinutes) return 'soon';
    if (explicit === 'soon') return 'soon';
    return 'offline';
  };

  const chooseActiveProgram = (programs = []) => {
    const ranked = programs.map((program) => ({ program, state: deriveProgramState(program) }));
    return ranked.find((item) => item.state === 'live')
      || ranked.find((item) => item.state === 'soon')
      || ranked.find((item) => item.state === 'replay')
      || ranked.find((item) => safeDate(item.program?.scheduled_start) && safeDate(item.program.scheduled_start) > new Date())
      || ranked[0]
      || null;
  };

  const formatTime = (value) => {
    const d = safeDate(value);
    if (!d) return null;
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    }).format(d);
  };

  const normalizeDiscordLinks = () => {
    document.querySelectorAll('a[href*="discord.gg/"]').forEach((link) => {
      link.href = DISCORD_INVITE;
      link.target = '_blank';
      link.rel = 'noopener';
      if (!link.dataset.event) link.dataset.event = 'discord_join_click';
      link.classList.add('track');
    });
  };

  const ensureEcosystemBridge = () => {
    const navShell = document.querySelector('.nav-shell');
    if (!navShell || navShell.querySelector('.ecosystem-bridge')) return;
    const bridge = document.createElement('div');
    bridge.className = 'ecosystem-bridge';
    bridge.setAttribute('aria-label', 'RMS GP ecosystem destinations');
    bridge.innerHTML = `
      <span>RMS GP Ecosystem</span>
      <a class="track soundable" data-event="ecosystem_creatorhub_click" data-placement="reset_bridge" href="https://creators.rmsglobalpublishing.com/">CreatorHub</a>
      <a class="track soundable" data-event="ecosystem_global_publishing_click" data-placement="reset_bridge" href="https://rmsglobalpublishing.com/">Global Publishing</a>
      <a class="track soundable" data-event="ecosystem_academy_click" data-placement="reset_bridge" href="https://academy.rmsglobalpublishing.com/">Academy</a>
      <a class="track soundable" data-event="ecosystem_reset_click" data-placement="reset_bridge" href="https://resetinnercircle.com/" aria-current="page">RESET Inner Circle</a>`;
    navShell.appendChild(bridge);
  };

  const renderSignal = async () => {
    const hero = document.querySelector('.hero');
    if (!hero || document.querySelector('.now-playing-shell')) return;

    let config = null;
    try {
      const response = await fetch('/now-playing.json', { cache: 'no-store' });
      if (response.ok) config = await response.json();
    } catch {}

    const fallback = config?.fallback || {
      title: 'RESET Inner Circle',
      subtitle: 'Community is open. Live programming appears here when confirmed.',
      state: 'offline',
      primary_url: DISCORD_INVITE,
      primary_label: 'Join RESET Inner Circle on Discord'
    };
    const selected = chooseActiveProgram(config?.programs || []);
    const program = selected?.program || fallback;
    const state = selected?.state || String(fallback.state || 'offline').toLowerCase();
    const title = program.title || fallback.title;
    const type = program.type || 'RESET COMMUNITY';
    const startLabel = formatTime(program.scheduled_start);
    const description = state === 'live'
      ? `${title} is confirmed live. Enter the active RESET community destination.`
      : state === 'soon'
        ? `${title} is starting soon. Join the community now so you are in the room when the signal opens.`
        : state === 'replay'
          ? `${title} is available on demand.`
          : fallback.subtitle;

    const primaryUrl = state === 'replay' && program.replay_url
      ? program.replay_url
      : program.live_url || fallback.primary_url || DISCORD_INVITE;
    const primaryLabel = state === 'live'
      ? 'Enter Live Room'
      : state === 'soon'
        ? 'Join Before It Starts'
        : state === 'replay'
          ? 'Watch Replay'
          : fallback.primary_label || 'Join RESET Inner Circle on Discord';

    const programLinks = (config?.programs || []).map((item) => {
      const itemState = deriveProgramState(item);
      return `<a class="track soundable" data-event="now_playing_program_click" data-program="${item.id || ''}" href="${item.live_url || DISCORD_INVITE}" target="_blank" rel="noopener">${item.title} · ${STATE_LABELS[itemState] || STATE_LABELS.offline}</a>`;
    }).join('');

    const shell = document.createElement('section');
    shell.className = 'now-playing-shell reveal';
    shell.dataset.state = state;
    shell.dataset.viewEvent = 'now_playing_signal_view';
    shell.setAttribute('aria-labelledby', 'now-playing-title');
    shell.innerHTML = `
      <div class="now-playing-inner">
        <div class="now-playing-copy">
          <div class="now-playing-kicker"><span class="now-playing-dot" aria-hidden="true"></span><span>NOW PLAYING SIGNAL · ${STATE_LABELS[state] || STATE_LABELS.offline}</span></div>
          <h2 id="now-playing-title" class="now-playing-title">${title}</h2>
          <div class="now-playing-meta"><span>${type}</span>${startLabel ? `<span class="now-playing-time">${startLabel}</span>` : ''}</div>
          <p class="now-playing-description">${description}</p>
          ${programLinks ? `<div class="now-playing-programs">${programLinks}</div>` : ''}
        </div>
        <div class="now-playing-actions">
          <a class="button gold track soundable" data-event="now_playing_primary_click" data-state="${state}" href="${primaryUrl}" target="_blank" rel="noopener"><span>${primaryLabel}</span><i>↗</i></a>
          <a class="now-playing-secondary track soundable" data-event="now_playing_discord_join_click" href="${DISCORD_INVITE}" target="_blank" rel="noopener">Join RESET Discord</a>
        </div>
      </div>`;

    hero.insertAdjacentElement('afterend', shell);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) shell.classList.add('in');
    track('now_playing_signal_loaded', { state, program: program.id || title });
  };

  normalizeDiscordLinks();
  ensureEcosystemBridge();
  renderSignal();
})();
