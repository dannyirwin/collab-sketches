import * as Tone from 'tone';
import { clearActiveNotes, playbackState } from '../state.js';
import {
  armSyncedPlayer,
  getAudioDuration,
  loadAudio,
  setAudioLoop,
  setMuted,
} from './audioEngine.js';
import { resolveLoopDuration } from './loopLength.js';
import { parseMidiTracks, scheduleMidiTracks } from './midiEngine.js';

/** @type {(() => void) | null} */
let detachLoopListener = null;

/**
 * @param {{
 *   audioUrl: string,
 *   tracks: { id: string, label: string, url: string }[],
 *   loopDuration?: number,
 *   loopBars?: number,
 * }} config
 */
export async function initTransport(config) {
  playbackState.ready = false;
  detachLoopListener?.();
  detachLoopListener = null;

  const [{ parsed, maxDuration: midiMaxDuration, bpm }] = await Promise.all([
    parseMidiTracks(config.tracks),
    loadAudio(config.audioUrl),
  ]);

  // BPM must be set BEFORE Parts convert note.time (seconds) → ticks,
  // otherwise MIDI drifts against the audio timeline.
  if (bpm != null) {
    Tone.Transport.bpm.value = bpm;
    playbackState.bpm = bpm;
  }

  const loopDuration = resolveLoopDuration({
    midiMaxDuration,
    bpm,
    loopDuration: config.loopDuration,
    loopBars: config.loopBars,
  });

  const audioDuration = getAudioDuration();
  const clippedLoop = Math.min(loopDuration, audioDuration || loopDuration);

  playbackState.duration = clippedLoop;
  setAudioLoop(clippedLoop);
  scheduleMidiTracks(parsed);

  Tone.Transport.loop = true;
  Tone.Transport.loopStart = 0;
  Tone.Transport.loopEnd = clippedLoop;
  Tone.Transport.seconds = 0;

  const onLoop = () => {
    clearActiveNotes();
  };
  Tone.Transport.on('loop', onLoop);
  detachLoopListener = () => {
    Tone.Transport.off('loop', onLoop);
  };

  playbackState.position = 0;
  playbackState.ready = true;
}

/** Unlock Web Audio — required on mobile after a user tap. */
export async function unlockAudio() {
  await Tone.start();
  const ctx = Tone.getContext();
  if (ctx.state !== 'running') {
    await ctx.resume();
  }
  // Tiny graph tick so iOS fully wakes audio after resume.
  const tick = new Tone.Oscillator({ volume: -100 }).toDestination();
  tick.start();
  tick.stop('+0.01');
  playbackState.audioUnlocked = true;
}

export async function start() {
  await unlockAudio();
  // Arm AFTER unlock — synced start during page load stays silent on iOS.
  armSyncedPlayer(playbackState.duration);
  if (Tone.Transport.state !== 'started') {
    Tone.Transport.start();
  }
  playbackState.playing = true;
}

export function pause() {
  Tone.Transport.pause();
  playbackState.playing = false;
}

export function stop() {
  Tone.Transport.stop();
  Tone.Transport.seconds = 0;
  clearActiveNotes();
  playbackState.playing = false;
  playbackState.position = 0;
}

/** @param {number} seconds */
export function seek(seconds) {
  const clamped = Math.max(0, Math.min(seconds, playbackState.duration));
  const wasPlaying = playbackState.playing;
  Tone.Transport.pause();
  clearActiveNotes();
  Tone.Transport.seconds = clamped;
  playbackState.position = clamped;
  if (wasPlaying) {
    Tone.Transport.start();
    playbackState.playing = true;
  }
}

/** @param {boolean} muted */
export function mute(muted) {
  setMuted(muted);
  playbackState.muted = muted;
}

export function tickPosition() {
  playbackState.position = Tone.Transport.seconds;
}
