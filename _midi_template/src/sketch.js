import { playbackState } from './state.js';
import { tickPosition } from './engine/transport.js';

/**
 * Template p5 sketch — compact MIDI metadata HUD.
 * @param {import('p5')} p
 */
export function sketch(p) {
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.textFont('ui-monospace, SFMono-Regular, Menlo, monospace');
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = () => {
    tickPosition();
    p.background(12, 14, 18);
    p.noStroke();

    const x = 20;
    let y = 28;

    p.fill(160);
    p.textSize(12);
    const bpm =
      playbackState.bpm != null ? `${Math.round(playbackState.bpm)}bpm` : '';
    p.text(
      `${formatTime(playbackState.position)} / ${formatTime(playbackState.duration)}  ${bpm}`,
      x,
      y,
    );
    y += 32;

    for (const track of Object.values(playbackState.tracks)) {
      const active = track.activeNotes.length > 0;

      p.fill(active ? 220 : 110);
      p.textSize(14);
      p.text(track.label, x, y);

      if (active) {
        const noteStr = track.activeNotes
          .map((n) => `${n.name} v${Math.round(n.velocity * 127)}`)
          .join('  ');
        p.fill(180);
        p.textSize(13);
        p.text(noteStr, x + 90, y);
      } else {
        p.fill(60);
        p.textSize(13);
        p.text('—', x + 90, y);
      }

      y += 18;
      p.fill(80);
      p.textSize(11);
      if (track.lastEvent) {
        const e = track.lastEvent;
        p.text(
          `${e.type}  ${e.name ?? ''}  @ ${formatTime(e.time)}`,
          x + 90,
          y,
        );
      } else {
        p.text(`${track.noteCount} notes`, x + 90, y);
      }
      y += 26;
    }
  };
}

/** @param {number} seconds */
function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00.0';
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  return `${m}:${s.toFixed(1).padStart(4, '0')}`;
}
