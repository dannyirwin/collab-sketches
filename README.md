# Midi Sketches

```bash
npm install
npm run dev
```

## Sketches

- **01** — First sketch. Go for it Kevin
- **template** — Starter midi/audio/p5 engine

## How the template works

1. **MIDI** — Tone.js schedules the MIDI tracks and dispatches note events. Synth sound optional if using audio file.
2. **Audio** — A bounced audio file plays in sync. That file is what you actually hear if you're not using software instruments.
3. **UI** — p5.js reads those live MIDI events and draws the sketch.

You can skip the audio file and play MIDI through Tone instruments in the browser, you'll just have to do synth instruments and effects in code. If you want all the bells and whistles of a midi editor (DAW) you can write MIDI + export audio from a DAW (instruments, effects, mastering included), then use the MIDI only to drive the visuals. Lots of free/trial options for these online. I used GarageBand, it just takes some extra BS to get the midi files out.
