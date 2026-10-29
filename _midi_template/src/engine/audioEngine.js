import * as Tone from 'tone';

/** @type {Tone.Player | null} */
let player = null;

/**
 * Load mastered audio and lock it to Transport (silent MIDI stays signal-only).
 * @param {string} url
 * @returns {Promise<Tone.Player>}
 */
export async function loadAudio(url) {
  if (player) {
    player.dispose();
    player = null;
  }

  player = new Tone.Player({
    url,
  }).toDestination();

  await Tone.loaded();
  player.sync().start(0);
  return player;
}

/**
 * Clip the synced player to the musical loop (drops mastering tail silence).
 * @param {number} loopDuration seconds
 */
export function setAudioLoop(loopDuration) {
  if (!player) return;
  const end = Math.min(loopDuration, player.buffer.duration);
  player.loop = true;
  player.loopStart = 0;
  player.loopEnd = end;
}

export function getAudioPlayer() {
  return player;
}

/** @param {boolean} muted */
export function setMuted(muted) {
  if (!player) return;
  player.mute = muted;
}

export function getAudioDuration() {
  return player?.buffer?.duration ?? 0;
}
