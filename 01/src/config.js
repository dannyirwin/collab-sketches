const base = import.meta.env.BASE_URL;

export const sketchConfig = {
  audioUrl: `${base}01/assets/8-bit-sketch-1.m4a`,
  tracks: [
    { id: 'melody', label: 'Melody', url: `${base}01/assets/8-bit-sketch-1-melody.mid` },
    { id: 'bass', label: 'Bass', url: `${base}01/assets/8-bit-sketch-1-bass.mid` },
  ],
};
