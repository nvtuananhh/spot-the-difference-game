// levels.js — the three rounds: scene, time limit, hints and every
// planted difference with its hit position, hit radius and fair label.
// Labels are shown only after a difference is found (or hinted), so the
// hunt itself stays honest: nothing here leaks an unfound difference.

export const LEVELS = [
  {
    id: 'garden',
    scene: 'garden',
    name: 'Round 1 · Sunny Garden Cottage',
    shortName: 'Garden Cottage',
    time: 180,
    hints: 3,
    blurb: 'A cottage, a cat and a flower bed. Five changes hide in plain sight.',
    differences: [
      { id: 'sun-rays', x: 500, y: 70, r: 32, label: 'The sun lost its rays' },
      { id: 'smoke', x: 342, y: 128, r: 28, label: 'The chimney smoke vanished' },
      { id: 'cat-grey', x: 110, y: 328, r: 30, label: 'The cat changed colour' },
      { id: 'flower-box', x: 321, y: 282, r: 28, label: 'The window flower box is gone' },
      { id: 'missing-flower', x: 420, y: 398, r: 26, label: 'A flower is missing from the bed' },
    ],
  },
  {
    id: 'harbour',
    scene: 'harbour',
    name: 'Round 2 · Harbour at Dusk',
    shortName: 'Harbour at Dusk',
    time: 150,
    hints: 3,
    blurb: 'Boats, a lighthouse and a long pier. Seven subtler changes this time.',
    differences: [
      { id: 'beam-off', x: 492, y: 116, r: 30, label: 'The lighthouse beam went dark' },
      { id: 'flag-green', x: 203, y: 246, r: 24, label: 'The sailboat flag changed colour' },
      { id: 'gull-gone', x: 300, y: 92, r: 22, label: 'A gull flew away' },
      { id: 'buoy-plain', x: 452, y: 384, r: 26, label: 'The buoy lost its stripe' },
      { id: 'crate-gone', x: 88, y: 332, r: 28, label: 'A crate vanished from the pier' },
      { id: 'rope-gone', x: 158, y: 344, r: 22, label: 'The rope coil is gone' },
      { id: 'oar-gone', x: 404, y: 348, r: 26, label: 'The rowboat lost its oar' },
    ],
  },
  {
    id: 'library',
    scene: 'library',
    name: 'Round 3 · Starlit Library',
    shortName: 'Starlit Library',
    time: 120,
    hints: 2,
    blurb: 'Books, a cat and a cold moon. Nine small changes — look closely.',
    differences: [
      { id: 'clock-six', x: 486, y: 318, r: 28, label: 'The clock hands moved' },
      { id: 'moon-full', x: 300, y: 76, r: 26, label: 'The moon turned full' },
      { id: 'spine-teal', x: 96, y: 170, r: 22, label: 'A book spine changed colour' },
      { id: 'flame-out', x: 452, y: 280, r: 22, label: 'The candle flame went out' },
      { id: 'tail-flat', x: 282, y: 384, r: 26, label: "The cat's tail dropped" },
      { id: 'rug-diamond-gone', x: 300, y: 382, r: 28, label: 'The rug lost its diamond' },
      { id: 'steam-gone', x: 530, y: 258, r: 22, label: 'The teacup steam faded' },
      { id: 'shade-plain', x: 153, y: 222, r: 24, label: 'The lamp shade lost its stripes' },
      { id: 'star-gone', x: 350, y: 62, r: 20, label: 'A star blinked out' },
    ],
  },
];

export function totalDifferences() {
  return LEVELS.reduce((sum, level) => sum + level.differences.length, 0);
}
