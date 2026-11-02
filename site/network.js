(() => {
  const facebookNetworkPrimary = 'https://www.facebook.com/groups/search/groups?q=Engagement&filters=eyJteV9ncm91cHM6MCI6IntcIm5hbWVcIjpcIm15X2dyb3Vwc1wiLFwiYXJnc1wiOlwiXCJ9In0%3D';
  const facebookNetworkSecondary = 'https://www.facebook.com/groups/search/groups?q=engagment&filters=eyJteV9ncm91cHM6MCI6IntcIm5hbWVcIjpcIm15X2dyb3Vwc1wiLFwiYXJnc1wiOlwiXCJ9In0%3D';
  const pinterestSurfaceUrl = 'https://www.pinterest.com/?tabId=1127166681679282275';
  const liveBridgeUrl = '/live.html';
  const partnerUrl = '/partner.html';
  const arenaUrl = '/arena.html';
  const discordInviteUrl = 'https://discord.gg/DWyT4vskVW';
  const studioAnchor = '#studio';
  const supportAnchor = '#support';

  if (!document.querySelector('link[href="/network-luxury.css"]')) {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = '/network-luxury.css';
    document.head.appendChild(style);
  }

  const nav = document.querySelector('.nav nav');
  if (nav && !nav.querySelector('[href="#network"]')) {
    const link = document.createElement('a');
    link.href = '#network';
    link.className = 'soundable';
    link.textContent = 'Network';
    nav.insertBefore(link, nav.firstChild);
  }

  const support = document.querySelector('#support');
  if (!support || document.querySelector('#network')) return;

  const section = document.createElement('section');
  section.id = 'network';
  section.className = 'network network-luxury reveal';
  section.dataset.viewEvent = 'partner_network_view';
  section.setAttribute('aria-labelledby', 'network-title');
  section.innerHTML = `
    <div class="wrap">
      <div class="network-head luxury-network-head">
        <div>
          <p class="kicker">THE RESET INNER CIRCLE NETWORK</p>
          <h2 id="network-title">Where leaders rise.<br><em>Where purpose becomes influence.</em></h2>
        </div>
        <div class="network-hero-copy">
          <p>A private, multi-platform creator ecosystem for leaders who want to elevate culture, empower community and activate meaningful engagement across Facebook, Instagram, TikTok, YouTube, Twitch, Discord and beyond.</p>
          <p class="network-boundary"><strong>Leadership seat, not paid employment.</strong> Participation is voluntary. No wages, guaranteed income, employment relationship or required compensated labor is created by joining.</p>
        </div>
      </div>

      <div class="network-status-strip" aria-label="Network standards">
        <span>PRIVATE CLUB ENERGY</span><span>CREATOR-FIRST</span><span>ORGANIC ENGAGEMENT</span><span>PLATFORM-SAFE</span><span>OWNERSHIP RESPECTED</span>
      </div>

      <div class="leader-promise">
        <span>LEADER STANDARD</span>
        <div><b>YOU KEEP YOUR COMMUNITY</b><small>No ownership transfer. No audience scraping.</small></div>
        <div><b>YOU KEEP YOUR CREDIT</b><small>Approved communities retain visible attribution.</small></div>
        <div><b>WE BUILD THE BRIDGE</b><small>Discovery, voice lounges, Arena, events, creator tools and public-safe analytics.</small></div>
      </div>

      <div class="leadership-pathway" data-view-event="leadership_pathway_view">
        <div class="lux-section-intro"><p class="kicker">THE LEADERSHIP PATHWAY</p><h3>Clarity from day one.</h3><p>Every leadership seat follows the same progression. Advancement is based on healthy contribution, trust and community impact, not vanity metrics.</p></div>
        <div class="pathway-grid">
          <article><span>01</span><strong>ENTRY</strong><small>Join, accept the Code of Honor and complete orientation.</small></article>
          <article><span>02</span><strong>ACTIVATION</strong><small>Learn the rooms, tools, platform-safety standards and engagement flows.</small></article>
          <article><span>03</span><strong>CONTRIBUTION</strong><small>Support conversations, missions, creator activity and healthy collaboration.</small></article>
          <article><span>04</span><strong>VISIBILITY</strong><small>Earn recognition through consistent, useful leadership and community stewardship.</small></article>
          <article><span>05</span><strong>ADVANCEMENT</strong><small>Qualify for expanded leadership access, spotlights and future initiatives.</small></article>
        </div>
      </div>

      <div class="network-benefits">
        <div class="lux-section-intro"><p class="kicker">WHAT LEADERS RECEIVE</p><h3>Infrastructure with intention.</h3></div>
        <div class="benefit-grid">
          <article><span>01</span><h4>Multi-Platform Engagement Engine</h4><p>Platform-specific prompts, posting guidance and healthy engagement flows built to encourage authentic reach without automation abuse.</p></article>
          <article><span>02</span><h4>Live Voice Lounge Access</h4><p>Voice-first spaces for collaboration, creator support, live activation and real-time community building.</p></article>
          <article><span>03</span><h4>Creator Tools & Automation Suite</h4><p>Pre-built prompts, community activations, reminders, creator missions and routing tools that support people instead of impersonating them.</p></article>
          <article><span>04</span><h4>Leadership Visibility</h4><p>Healthy contributions can be recognized through RESET spotlights, programming and approved ecosystem features.</p></article>
          <article><span>05</span><h4>Clear Growth Path</h4><p>A defined pathway for contribution, trust, recognition and expanded responsibility inside the RESET ecosystem.</p></article>
        </div>
      </div>

      <div class="do-dont-grid">
        <article class="do-card">
          <p class="kicker">WHAT YOU WILL DO</p>
          <h3>Lead the energy, not control the people.</h3>
          <ul>
            <li>Show up consistently in lounges, discussions and creator support spaces.</li>
            <li>Guide members toward healthy, platform-approved engagement habits.</li>
            <li>Protect dignity, privacy, ownership and purpose.</li>
            <li>Participate in creator spotlights, collaboration calls and community initiatives.</li>
            <li>Model useful contribution, respectful conversation and clear boundaries.</li>
          </ul>
        </article>
        <article class="dont-card">
          <p class="kicker">WHAT YOU WILL NOT DO</p>
          <h3>No pressure tactics. No artificial growth.</h3>
          <ul>
            <li>No engagement pods, forced reciprocity or scripted comment exchanges.</li>
            <li>No mass tagging, spam, follow/unfollow schemes or artificial watch-time loops.</li>
            <li>No scraping private groups, exporting member lists or collecting protected conversations.</li>
            <li>No promises of followers, placements, monetization, income or algorithm outcomes.</li>
            <li>No representation of this voluntary seat as paid employment or contract labor.</li>
          </ul>
        </article>
      </div>

      <div class="network-map">
        <article class="network-node">
          <div class="node-label"><span>DISCOVERY LAYER</span><b>MULTI-PLATFORM</b></div>
          <h3>Discovery stays native.</h3>
          <p>Facebook, Instagram, TikTok, YouTube, Twitch and Pinterest remain separate platform surfaces. RESET routes people into shared community experiences without importing private audience data.</p>
          <div class="node-stat"><span><strong>ORGANIC</strong><small>ENGAGEMENT</small></span><span><strong>SAFE</strong><small>BOUNDARIES</small></span></div>
          <div class="leader-actions">
            <a class="text-link track soundable" data-event="facebook_network_click" data-placement="partner_network_primary" href="${facebookNetworkPrimary}" target="_blank" rel="noopener">Open Facebook discovery <b>↗</b></a>
            <a class="text-link track soundable" data-event="pinterest_surface_click" data-placement="partner_network_pinterest" href="${pinterestSurfaceUrl}" target="_blank" rel="noopener">Open Pinterest discovery <b>↗</b></a>
          </div>
        </article>

        <article class="network-node center">
          <div class="node-label"><span>CONNECTION LAYER</span><b>RESET MAIN ARENA</b></div>
          <h3>One Arena. Many origins.</h3>
          <p>Members enter one shared community experience where creator connection, live activity, collaboration discovery and event routing can happen without siloing people by their original platform.</p>
          <div class="node-stat"><span><strong>OPEN</strong><small>PUBLIC ROUTING</small></span><span><strong>SHARED</strong><small>MEMBER EXPERIENCE</small></span></div>
          <a class="button gold track soundable" data-event="arena_bridge_click" data-placement="partner_network" href="${arenaUrl}"><span>Enter Reset Main Arena</span><i>→</i></a>
        </article>

        <article class="network-node">
          <div class="node-label"><span>LEADERSHIP ENTRY</span><b>DISCORD</b></div>
          <h3>Enter with clarity.</h3>
          <p>New members enter through the public invite, receive orientation and move into the rooms, roles and programming that fit their purpose.</p>
          <div class="node-stat"><span><strong>FREE</strong><small>COMMUNITY ENTRY</small></span><span><strong>GUIDED</strong><small>ONBOARDING</small></span></div>
          <a class="text-link track soundable" data-event="network_discord_join_click" data-placement="partner_network" href="${discordInviteUrl}" target="_blank" rel="noopener">Enter Reset Inner Circle <b>↗</b></a>
        </article>
      </div>

      <div class="network-spine"><i></i><span>DISCOVER → ENTER → ACTIVATE → CONTRIBUTE → CONNECT → CREATE → ELEVATE</span><i></i></div>

      <div class="platform-safety" data-view-event="platform_safety_view">
        <div class="lux-section-intro"><p class="kicker">SAFETY & COMPLIANCE</p><h3>Protect the account. Protect the person.</h3><p>RESET does not promise “shadowban-proof” behavior. Platform systems change. Our standard is simpler: authentic human participation, native platform tools and no artificial engagement.</p></div>
        <div class="platform-grid">
          <article><strong>FACEBOOK</strong><p>No mass tagging, repetitive comments, forced reciprocal actions or coordinated spam.</p></article>
          <article><strong>INSTAGRAM</strong><p>No rapid-fire automation, duplicate caption flooding or unlicensed music use.</p></article>
          <article><strong>TIKTOK</strong><p>No follow/unfollow cycles, identical repost flooding or artificial engagement.</p></article>
          <article><strong>YOUTUBE</strong><p>No comment scripts, artificial views, watch-time loops or misleading metadata.</p></article>
          <article><strong>TWITCH</strong><p>Safe chat moderation, no automated spam and platform-compliant co-streaming and music use.</p></article>
        </div>
        <div class="universal-rule"><span>UNIVERSAL RULE</span><strong>RESET never requires or rewards actions that violate platform policies.</strong><small>Automation may route, remind, organize and recognize. It does not impersonate a member or manufacture engagement.</small></div>
      </div>

      <div class="automation-panel">
        <div class="lux-section-intro"><p class="kicker">AUTOMATED COMMUNITY RHYTHM</p><h3>Activity with boundaries.</h3></div>
        <div class="automation-grid">
          <article><span>DAILY</span><strong>Activation Prompts</strong><small>Conversation starters, creator highlights, wellness check-ins and industry insights.</small></article>
          <article><span>WEEKLY</span><strong>Creator Missions</strong><small>Platform-native growth actions, collaboration challenges and meaningful creator tasks.</small></article>
          <article><span>MONTHLY</span><strong>Leadership Spotlights</strong><small>Recognize useful contributions and strengthen community trust.</small></article>
          <article><span>EVENTS</span><strong>Multi-Platform Sync</strong><small>Voice lounges, public-safe creator pushes, live programming and recaps.</small></article>
          <article><span>ON ENTRY</span><strong>Welcome & Orientation</strong><small>Code of Honor, platform safety, room guidance and starter actions.</small></article>
        </div>
      </div>

      <div class="tools-impact-grid">
        <article>
          <p class="kicker">TOOLS YOU WILL USE</p>
          <h3>Built for real community work.</h3>
          <ul><li>Reset Main Arena and live voice lounges</li><li>Creator missions and activation prompts</li><li>Event reminders and collaboration calls</li><li>Creator spotlights and participation recognition</li><li>Public-safe referral and campaign attribution</li><li>Virtual Studio and live-event routing</li></ul>
        </article>
        <article>
          <p class="kicker">WHY THIS MATTERS</p>
          <h3>Influence should leave people stronger.</h3>
          <p>RESET leadership is designed to turn attention into connection, connection into collaboration and collaboration into meaningful creator momentum. The goal is not louder feeds. It is stronger people, healthier communities and more creators moving with purpose.</p>
        </article>
      </div>

      <div class="honor-code">
        <div><p class="kicker">LEADERSHIP CODE OF HONOR</p><h3>Lead with dignity. Build with truth.</h3></div>
        <ol>
          <li><span>01</span><p><strong>Protect dignity.</strong> Never embarrass, exploit or pressure people for participation.</p></li>
          <li><span>02</span><p><strong>Respect ownership.</strong> Credit creators, communities and ideas appropriately.</p></li>
          <li><span>03</span><p><strong>Choose truth over hype.</strong> No fabricated results, fake urgency or misleading promises.</p></li>
          <li><span>04</span><p><strong>Keep private things private.</strong> Do not export or reuse protected community information.</p></li>
          <li><span>05</span><p><strong>Elevate the room.</strong> Bring solutions, encouragement, accountability and useful energy.</p></li>
        </ol>
      </div>

      <div class="energy-promise">
        <span>THE COMMUNITY ENERGY PROMISE</span>
        <h3>Warm. Alive. Supportive. Purposeful.</h3>
        <p>RESET should feel like a private members club, creative think tank, leadership accelerator and cultural movement at the same time. We protect space for fun, depth, honesty, ambition and belonging without turning people into metrics.</p>
      </div>

      <div class="leader-panel">
        <div class="leader-copy">
          <p class="kicker">FOR LEADERS & COMMUNITY PARTNERS</p>
          <h3>Bring your people to something worth joining.</h3>
          <p>Approved leaders can co-promote events, retain visible community attribution, participate in cross-community programming and request production support while preserving their independent identity and audience boundaries.</p>
          <div class="leader-actions">
            <a class="button gold track soundable" data-event="group_leader_interest" data-placement="leader_panel" href="${partnerUrl}"><span>Apply for a Leadership Seat</span><i>→</i></a>
            <a class="button ghost track soundable" data-event="live_bridge_click" data-placement="leader_panel" href="${liveBridgeUrl}"><span>Preview Live Events Bridge</span><i>→</i></a>
          </div>
        </div>
        <div class="leader-rules">
          <span>LEADERSHIP EXPECTATIONS</span>
          <ul><li>Consistent community presence</li><li>Healthy engagement stewardship</li><li>RESET culture and privacy protection</li><li>Cross-platform collaboration and activation</li><li>Clear voluntary, non-employment boundaries</li><li>No artificial engagement or guaranteed growth claims</li></ul>
        </div>
      </div>

      <div class="revenue-panel" data-view-event="network_revenue_view">
        <div class="revenue-intro"><p class="kicker">SUSTAIN THE NETWORK</p><h3>Community access stays open. Real value can still earn.</h3><p>Revenue attaches to production, sponsorship, workshops and approved services around the community, not to forced participation or a leadership seat.</p></div>
        <div class="revenue-grid">
          <a class="revenue-card track soundable" data-event="studio_service_inquiry" data-placement="network_revenue" href="${studioAnchor}"><span>01</span><strong>Virtual Studio Services</strong><small>Remote production, interviews, creator sessions and performance capture.</small></a>
          <a class="revenue-card track soundable" data-event="event_sponsor_interest" data-placement="network_revenue" href="${partnerUrl}"><span>02</span><strong>Event Sponsorship</strong><small>Brand-supported or partner-supported programming with clear disclosure.</small></a>
          <a class="revenue-card track soundable" data-event="group_feature_interest" data-placement="network_revenue" href="${partnerUrl}"><span>03</span><strong>Partner Spotlights</strong><small>Approved promotional features for leaders, creators and community initiatives.</small></a>
          <a class="revenue-card track soundable" data-event="workshop_event_interest" data-placement="network_revenue" href="${partnerUrl}"><span>04</span><strong>Workshops & Produced Events</strong><small>Paid production or ticketed experiences sold outside community membership.</small></a>
          <a class="revenue-card track soundable" data-event="support_checkout_started" data-placement="network_revenue" href="${supportAnchor}"><span>05</span><strong>Voluntary Support</strong><small>Support operating costs without purchasing community access.</small></a>
        </div>
      </div>

      <div class="network-note"><strong>Privacy boundary:</strong> RESET measures public-safe routing and campaign attribution only. It does not scrape private platform groups, read private Discord conversations, export member lists or move protected creator data between platforms.</div>

      <div class="network-registry">
        <div><span>DISCOVERY REGISTRY · APPROVAL REQUIRED</span><small>Approved referrals may use non-personal source, partner and campaign tags. Personally identifying audience data is not used for cross-platform attribution.</small></div>
        <a class="button ghost track soundable" data-event="live_bridge_click" data-placement="network_registry" href="${liveBridgeUrl}"><span>Test Public Live Route</span><i>→</i></a>
      </div>
    </div>`;

  support.parentNode.insertBefore(section, support);

  const trackVisible = (element, eventType) => {
    if (!element || !window.resetTrack) return;
    if (!('IntersectionObserver' in window)) { window.resetTrack(eventType, { section: element.id || null }); return; }
    const observer = new IntersectionObserver((entries, obs) => {
      if (!entries[0]?.isIntersecting) return;
      window.resetTrack(eventType, { section: element.id || eventType });
      obs.disconnect();
    }, { threshold: 0.35 });
    observer.observe(element);
  };

  trackVisible(section, 'partner_network_view');
  trackVisible(section.querySelector('.leadership-pathway'), 'leadership_pathway_view');
  trackVisible(section.querySelector('.platform-safety'), 'platform_safety_view');
  trackVisible(section.querySelector('.revenue-panel'), 'network_revenue_view');

  requestAnimationFrame(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) section.classList.add('in');
    else {
      const observer = new IntersectionObserver((entries, obs) => {
        if (entries[0]?.isIntersecting) { section.classList.add('in'); obs.disconnect(); }
      }, { threshold: 0.08 });
      observer.observe(section);
    }
  });
})();