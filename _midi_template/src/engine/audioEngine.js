import * as Tone from 'tone';

/** @type {Tone.Player | null} */
let player = null;
let loopEnd = 0;
let armed = false;

/**
 * Load buffer only — do not sync/start until after Tone.start() (user tap).
 * Scheduling a synced Player while the AudioContext is suspended is a common
 * cause of permanent silence on iOS.
 * @param {string} url
 */
export async function loadAudio(url) {
  if (player) {
    player.dispose();
    player = null;
  }
  armed = false;

  player = new Tone.Player({
    url,
  }).toDestination();

  await Tone.loaded();
  return player;
}

/** @param {number} seconds */
export function setAudioLoop(seconds) {
  loopEnd = Math.max(seconds, 0);
  if (!player) return;
  player.loop = true;
  player.loopStart = 0;
  player.loopEnd = Math.min(loopEnd, player.buffer.duration);
}

/**
 * Attach the player to Transport. Call only after unlock from a user gesture.
 * @param {number} [seconds]
 */
export function armSyncedPlayer(seconds = loopEnd) {
  if (!player) return;

  if (armed) {
    player.unsync();
    armed = false;
  }

  const end = Math.min(seconds || loopEnd || player.buffer.duration, player.buffer.duration);
  player.loop = true;
  player.loopStart = 0;
  player.loopEnd = end;
  player.mute = false;
  player.volume.value = 0;
  player.sync().start(0);
  armed = true;
}

export function getAudioPlayer() {
  return player;
}

export function getAudioDuration() {
  return player?.buffer?.duration ?? 0;
}

/** @param {boolean} muted */
export function setMuted(muted) {
  if (!player) return;
  player.mute = muted;
}
