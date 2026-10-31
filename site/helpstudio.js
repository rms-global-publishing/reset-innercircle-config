// Angelea McCullough, Founder of RMS Global Publishing.
// Progressive enhancement only. No account reads, telemetry, cookies or service requests.
(() => {
  const button = document.getElementById('copy-command');
  const status = document.getElementById('copy-status');
  if (!button || !status) return;
  button.hidden = false;
  button.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText('/helpstudio');
      status.textContent = 'Copied. In Discord, paste /helpstudio, select the RMS GP CreatorHub command, and press Enter.';
    } catch {
      status.textContent = 'Copy manually: /helpstudio. Paste it in the Discord message box, not the browser address bar.';
    }
  });
})();
