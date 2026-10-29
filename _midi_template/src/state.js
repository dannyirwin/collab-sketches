/**
 * Shared playback state read by p5 each frame.
 * MIDI Parts write here via Tone.Draw.schedule so updates stay on the draw thread.
 */

/** @typedef {{ midi: number, name: string, velocity: number, duration: number, time: number }} ActiveNote */
/** @typedef {{ type: string, time: number, midi?: number, name?: string, velocity?: number }} MidiEvent */

/**
 * @typedef {object} TrackState
 * @property {string} id
 * @property {string} label
 * @property {number|null} bpm
 * @property {number} duration
 * @property {number} noteCount
 * @property {ActiveNote[]} activeNotes
 * @property {MidiEvent|null} lastEvent
 */

/** @type {{ ready: boolean, playing: boolean, muted: boolean, position: number, duration: number, bpm: number|null, tracks: Record<string, TrackState> }} */
export const playbackState = {
  ready: false,
  playing: false,
  muted: false,
  position: 0,
  duration: 0,
  bpm: null,
  tracks: {},
};

/**
 * @param {{ id: string, label: string }} track
 * @param {{ bpm?: number|null, duration?: number, noteCount?: number }} [meta]
 */
export function initTrackState(track, meta = {}) {
  playbackState.tracks[track.id] = {
    id: track.id,
    label: track.label,
    bpm: meta.bpm ?? null,
    duration: meta.duration ?? 0,
    noteCount: meta.noteCount ?? 0,
    activeNotes: [],
    lastEvent: null,
  };
}

/** @param {string} trackId @param {ActiveNote} note */
export function noteOn(trackId, note) {
  const track = playbackState.tracks[trackId];
  if (!track) return;
  track.activeNotes = [
    ...track.activeNotes.filter((n) => n.midi !== note.midi),
    note,
  ];
  track.lastEvent = {
    type: 'noteOn',
    time: note.time,
    midi: note.midi,
    name: note.name,
    velocity: note.velocity,
  };
}

/** @param {string} trackId @param {number} midi @param {number} time */
export function noteOff(trackId, midi, time) {
  const track = playbackState.tracks[trackId];
  if (!track) return;
  const existing = track.activeNotes.find((n) => n.midi === midi);
  track.activeNotes = track.activeNotes.filter((n) => n.midi !== midi);
  track.lastEvent = {
    type: 'noteOff',
    time,
    midi,
    name: existing?.name,
    velocity: existing?.velocity,
  };
}

/** Clear active notes (e.g. on seek/stop). */
export function clearActiveNotes() {
  for (const track of Object.values(playbackState.tracks)) {
    track.activeNotes = [];
  }
}
