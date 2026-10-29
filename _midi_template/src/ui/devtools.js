import { playbackState } from '../state.js';
import { pause, start } from '../engine/transport.js';

/**
 * Minimal transport control.
 * Mobile browsers only allow sound after a user tap — Play unlocks audio.
 * @returns {{ destroy: () => void }}
 */
export function mountDevtools() {
  const root = document.createElement('div');
  root.id = 'devtools';
  root.innerHTML = `
    <button type="button" data-action="toggle">Tap to play</button>
    <span data-hint class="devtools__hint">Sound needs a tap on phones</span>
  `;
  document.body.appendChild(root);

  const toggleBtn = /** @type {HTMLButtonElement | null} */ (
    root.querySelector('[data-action="toggle"]')
  );
  const hint = root.querySelector('[data-hint]');

  async function togglePlayback() {
    if (playbackState.playing) {
      pause();
    } else {
      await start();
    }
    syncChrome();
  }

  // pointerup keeps the user-gesture chain on iOS better than click alone
  toggleBtn?.addEventListener('pointerup', (event) => {
    event.preventDefault();
    void togglePlayback();
  });

  function syncChrome() {
    if (toggleBtn) {
      if (playbackState.playing) {
        toggleBtn.textContent = 'Pause';
      } else if (!playbackState.audioUnlocked) {
        toggleBtn.textContent = 'Tap to play';
      } else {
        toggleBtn.textContent = 'Play';
      }
    }
    if (hint) {
      hint.hidden = playbackState.audioUnlocked;
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
