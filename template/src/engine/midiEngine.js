import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';
import { initTrackState, noteOff, noteOn } from '../state.js';

/** @type {Tone.Part[]} */
let parts = [];

/**
 * @typedef {{ id: string, label: string, url: string }} TrackConfig
 * @typedef {{ track: TrackConfig, notes: object[], duration: number, bpm: number|null }} ParsedTrack
 */

/**
 * Fetch + parse MIDI only (no Transport scheduling).
 * @param {TrackConfig[]} tracks
 * @returns {Promise<{ parsed: ParsedTrack[], maxDuration: number, bpm: number|null }>}
 */
export async function parseMidiTracks(tracks) {
  /** @type {ParsedTrack[]} */
  const parsed = [];
  let maxDuration = 0;
  /** @type {number|null} */
  let bpm = null;

  for (const track of tracks) {
    const response = await fetch(track.url);
    if (!response.ok) {
      throw new Error(`Failed to load MIDI: ${track.url} (${response.status})`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const midi = new Midi(arrayBuffer);

    const fileBpm = midi.header.tempos[0]?.bpm ?? null;
    if (bpm == null && fileBpm != null) {
      bpm = fileBpm;
    }

    const notes = midi.tracks.flatMap((t) => t.notes);
    maxDuration = Math.max(maxDuration, midi.duration);

    parsed.push({
      track,
      notes,
      duration: midi.duration,
      bpm: fileBpm,
    });
  }

  return { parsed, maxDuration, bpm };
}

/**
 * Schedule silent Parts. Call only after Transport.bpm matches the MIDI files,
 * so note.time (seconds) converts to ticks without skew vs the audio.
 * Looping is owned by Tone.Transport (same length as the audio buffer).
 * @param {ParsedTrack[]} parsed
 */
export function scheduleMidiTracks(parsed) {
  disposeMidi();

  for (const { track, notes, duration, bpm } of parsed) {
    initTrackState(track, {
      bpm,
      duration,
      noteCount: notes.length,
    });

    const events = notes.map((n) => ({
      time: n.time,
      midi: n.midi,
      name: n.name,
      velocity: n.velocity,
      duration: n.duration,
    }));

    const part = new Tone.Part((time, event) => {
      const draw = Tone.getDraw();
      draw.schedule(() => {
        noteOn(track.id, {
          midi: event.midi,
          name: event.name,
          velocity: event.velocity,
          duration: event.duration,
          time: event.time,
        });
      }, time);

      draw.schedule(() => {
        noteOff(track.id, event.midi, event.time + event.duration);
      }, time + event.duration);
    }, events);

    part.start(0);
    parts.push(part);
  }
}

export function disposeMidi() {
  for (const part of parts) {
    part.dispose();
  }
  parts = [];
}
