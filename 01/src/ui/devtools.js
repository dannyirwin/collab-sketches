import { playbackState } from '../state.js';
import { pause, start } from '../engine/transport.js';

/**
 * Minimal transport control.
 * @returns {{ destroy: () => void }}
 */
export function mountDevtools() {
  const root = document.createElement('div');
  root.id = 'devtools';
  root.innerHTML = `<button type="button" data-action="toggle">Play</button>`;
  document.body.appendChild(root);

  const toggleBtn = root.querySelector('[data-action="toggle"]');

  toggleBtn?.addEventListener('click', async () => {
    if (playbackState.playing) {
      pause();
    } else {
      await start();
    }
    syncChrome();
  });

  function syncChrome() {
    if (toggleBtn) {
      toggleBtn.textContent = playbackState.playing ? 'Pause' : 'Play';
    }
  }

  const timer = window.setInterval(syncChrome, 200);
  syncChrome();

  return {
    destroy() {
      window.clearInterval(timer);
      root.remove();
    },
  };
}
