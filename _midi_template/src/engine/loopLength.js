/**
 * Pick a seamless musical loop length (seconds).
 * Prefer MIDI phrase length quantized to the nearest beat so audio tails
 * (mastering silence) are cut off instead of becoming dead air before wrap.
 *
 * @param {{
 *   midiMaxDuration: number,
 *   bpm: number|null,
 *   beatsPerBar?: number,
 *   loopDuration?: number,
 *   loopBars?: number,
 * }} opts
 */
export function resolveLoopDuration({
  midiMaxDuration,
  bpm,
  beatsPerBar = 4,
  loopDuration,
  loopBars,
}) {
  if (loopDuration != null && loopDuration > 0) {
    return loopDuration;
  }

  const tempo = bpm != null && bpm > 0 ? bpm : 120;
  const beatSec = 60 / tempo;
  const barSec = beatSec * beatsPerBar;

  if (loopBars != null && loopBars > 0) {
    return loopBars * barSec;
  }

  if (!(midiMaxDuration > 0)) {
    return barSec;
  }

  const beats = Math.max(1, Math.round(midiMaxDuration / beatSec));
  return beats * beatSec;
}
