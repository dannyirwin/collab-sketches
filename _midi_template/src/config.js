const base = import.meta.env.BASE_URL;

export const sketchConfig = {
  audioUrl: `${base}_midi_template/assets/8-bit-sketch-1.m4a`,
  tracks: [
    {
      id: 'melody',
      label: 'Melody',
      url: `${base}_midi_template/assets/8-bit-sketch-1-melody.mid`,
    },
    {
      id: 'bass',
      label: 'Bass',
      url: `${base}_midi_template/assets/8-bit-sketch-1-bass.mid`,
    },
  ],
};
