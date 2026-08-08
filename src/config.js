// D&D Art Studio - D-Shaped Floor Plan
// All 7 rooms connected forming the letter "D"
//
// The "D" shape:
//  - Left vertical bar: Grand Lobby (top-left), Impressionist (mid-left), Royal (bottom-left)
//  - Top horizontal: Van Gogh (top-center), Modern Abstract (top-right)
//  - Right vertical: Japanese Zen (mid-right)
//  - Bottom horizontal: Dark Gallery (bottom-right) connects to Royal
//
// Layout (bird's eye, z increases downward):
//
//  [Grand Lobby] ——— [Van Gogh] ——— [Modern Abstract]
//       |                                    |
//  [Impressionist]                    [Japanese Zen]
//       |                                    |
//  [Royal Collection] ————— [Dark Gallery] ——┘
//

export const WALL_HEIGHT = 4.0;
export const DOOR_WIDTH = 2.0;
export const DOOR_HEIGHT = 3.0;

export const ROOMS = [
  {
    name: 'Grand Lobby',
    center: [-15, -14],
    width: 14,
    depth: 12,
    doors: [
      { wall: 'east', offset: 0 },    // → Van Gogh Wing
      { wall: 'south', offset: 0 },   // → Impressionist Garden
    ],
    theme: {
      wallColor: 0xf5ede3,
      floorStyle: 'marble',
      floorColor: 0xede5d8,
      ceilingColor: 0xfaf7f2,
      accentColor: 0x8b6914,
      ambientIntensity: 1.2,
      lightColor: 0xfff8e8,
    }
  },
  {
    name: 'Van Gogh Wing',
    center: [0, -14],
    width: 12,
    depth: 12,
    doors: [
      { wall: 'west', offset: 0 },    // → Grand Lobby
      { wall: 'east', offset: 0 },    // → Modern Abstract
    ],
    theme: {
      wallColor: 0x1a2a4a,
      floorStyle: 'wood-dark',
      floorColor: 0x3d2b1a,
      ceilingColor: 0x0f1a30,
      accentColor: 0xe8c840,
      ambientIntensity: 0.8,
      lightColor: 0xffe066,
    }
  },
  {
    name: 'Modern Abstract',
    center: [15, -14],
    width: 12,
    depth: 12,
    doors: [
      { wall: 'west', offset: 0 },    // → Van Gogh Wing
      { wall: 'south', offset: 0 },   // → Japanese Zen
    ],
    theme: {
      wallColor: 0xfafafa,
      floorStyle: 'concrete',
      floorColor: 0xd0d0d0,
      ceilingColor: 0xffffff,
      accentColor: 0xff3333,
      ambientIntensity: 1.4,
      lightColor: 0xffffff,
    }
  },
  {
    name: 'Japanese Zen',
    center: [15, 0],
    width: 12,
    depth: 10,
    doors: [
      { wall: 'north', offset: 0 },   // → Modern Abstract
      { wall: 'south', offset: 0 },   // → Dark Gallery
    ],
    theme: {
      wallColor: 0xf5f0e6,
      floorStyle: 'tatami',
      floorColor: 0xc4b07a,
      ceilingColor: 0xf0ebe0,
      accentColor: 0x4a3728,
      ambientIntensity: 1.0,
      lightColor: 0xfff5d6,
    }
  },
  {
    name: 'Dark Gallery',
    center: [15, 14],
    width: 12,
    depth: 12,
    doors: [
      { wall: 'north', offset: 0 },   // → Japanese Zen
      { wall: 'west', offset: 0 },    // → Royal Collection
    ],
    theme: {
      wallColor: 0x1a1215,
      floorStyle: 'wood-dark',
      floorColor: 0x1f1410,
      ceilingColor: 0x0d0a0c,
      accentColor: 0x8b0000,
      ambientIntensity: 0.5,
      lightColor: 0xff9966,
    }
  },
  {
    name: 'Royal Collection',
    center: [-15, 14],
    width: 14,
    depth: 12,
    doors: [
      { wall: 'east', offset: 0 },    // → Dark Gallery (long bottom corridor)
      { wall: 'north', offset: 0 },   // → Impressionist Garden
    ],
    theme: {
      wallColor: 0x2d1520,
      floorStyle: 'marble-dark',
      floorColor: 0x1a1a2e,
      ceilingColor: 0x1f1020,
      accentColor: 0xd4a843,
      ambientIntensity: 0.9,
      lightColor: 0xffe4b5,
    }
  },
  {
    name: 'Impressionist Garden',
    center: [-15, 0],
    width: 14,
    depth: 10,
    doors: [
      { wall: 'north', offset: 0 },   // → Grand Lobby
      { wall: 'south', offset: 0 },   // → Royal Collection
    ],
    theme: {
      wallColor: 0xe8f0e4,
      floorStyle: 'wood-light',
      floorColor: 0xc9b896,
      ceilingColor: 0xf0f5ed,
      accentColor: 0x6b8e5e,
      ambientIntensity: 1.3,
      lightColor: 0xfff9e0,
    }
  },
];

// Connections between rooms for corridor building
export const CONNECTIONS = [
  // Top row (horizontal): Lobby → Van Gogh → Abstract
  { from: 'Grand Lobby', to: 'Van Gogh Wing', axis: 'x' },
  { from: 'Van Gogh Wing', to: 'Modern Abstract', axis: 'x' },
  // Right column (vertical): Abstract → Zen → Dark
  { from: 'Modern Abstract', to: 'Japanese Zen', axis: 'z' },
  { from: 'Japanese Zen', to: 'Dark Gallery', axis: 'z' },
  // Bottom row (horizontal): Royal → Dark
  { from: 'Royal Collection', to: 'Dark Gallery', axis: 'x' },
  // Left column (vertical): Lobby → Impressionist
  { from: 'Grand Lobby', to: 'Impressionist Garden', axis: 'z' },
  // Impressionist to Royal (vertical)
  { from: 'Impressionist Garden', to: 'Royal Collection', axis: 'z' },
];

// Artwork data per room — featuring D&D Art Studio originals
export const ARTWORKS = {
  'Grand Lobby': [
    { title: 'D&D Art Studio', artist: 'DevDrashti Art Studio', desc: 'Welcome — explore 7 uniquely themed rooms.', wall: 'west', offset: 0, w: 2.0, h: 2.0, img: '/paintings/logo.jpg' },
    { title: 'Artwork I', artist: 'D&D Art Studio', desc: 'Original artwork by DevDrashti.', wall: 'north', offset: -3, w: 2.0, h: 2.0, img: '/paintings/dd-01.jpg' },
    { title: 'Artwork II', artist: 'D&D Art Studio', desc: 'Original artwork by DevDrashti.', wall: 'north', offset: 3, w: 2.0, h: 2.0, img: '/paintings/dd-02.jpg' },
    { title: 'Artwork III', artist: 'D&D Art Studio', desc: 'Original artwork by DevDrashti.', wall: 'south', offset: -3, w: 2.0, h: 2.0, img: '/paintings/dd-03.jpg' },
    { title: 'Artwork IV', artist: 'D&D Art Studio', desc: 'Original artwork by DevDrashti.', wall: 'south', offset: 3, w: 2.0, h: 2.0, img: '/paintings/dd-04.jpg' },
  ],
  'Van Gogh Wing': [
    { title: 'Artwork V', artist: 'D&D Art Studio', desc: 'Original artwork by DevDrashti.', wall: 'north', offset: -3, w: 2.0, h: 2.0, img: '/paintings/dd-05.jpg' },
    { title: 'Artwork VI', artist: 'D&D Art Studio', desc: 'Original artwork by DevDrashti.', wall: 'north', offset: 3, w: 2.0, h: 2.0, img: '/paintings/dd-06.jpg' },
    { title: 'Artwork VII', artist: 'D&D Art Studio', desc: 'Original artwork by DevDrashti.', wall: 'south', offset: -3, w: 2.0, h: 2.0, img: '/paintings/dd-07.jpg' },
    { title: 'Artwork VIII', artist: 'D&D Art Studio', desc: 'Original artwork by DevDrashti.', wall: 'south', offset: 3, w: 2.0, h: 2.0, img: '/paintings/dd-08.jpg' },
  ],
  'Modern Abstract': [
    { title: 'Artwork IX', artist: 'D&D Art Studio', desc: 'Original artwork by DevDrashti.', wall: 'north', offset: -3, w: 2.0, h: 2.0, img: '/paintings/dd-09.jpg' },
    { title: 'Artwork X', artist: 'D&D Art Studio', desc: 'Original artwork by DevDrashti.', wall: 'north', offset: 3, w: 2.0, h: 2.0, img: '/paintings/dd-10.jpg' },
    { title: 'Artwork XI', artist: 'D&D Art Studio', desc: 'Original artwork by DevDrashti.', wall: 'east', offset: -3, w: 2.0, h: 2.0, img: '/paintings/dd-11.jpg' },
    { title: 'Artwork XII', artist: 'D&D Art Studio', desc: 'Original artwork by DevDrashti.', wall: 'east', offset: 3, w: 2.0, h: 2.0, img: '/paintings/dd-12.jpg' },
  ],
  'Japanese Zen': [
    { title: 'Artwork XIII', artist: 'D&D Art Studio', desc: 'Original artwork by DevDrashti.', wall: 'east', offset: -2, w: 2.0, h: 2.0, img: '/paintings/dd-13.jpg' },
    { title: 'Artwork XIV', artist: 'D&D Art Studio', desc: 'Original artwork by DevDrashti.', wall: 'east', offset: 2, w: 2.0, h: 2.0, img: '/paintings/dd-14.jpg' },
    { title: 'Artwork XV', artist: 'D&D Art Studio', desc: 'Original artwork by DevDrashti.', wall: 'west', offset: -2, w: 2.0, h: 2.0, img: '/paintings/dd-15.jpg' },
    { title: 'Artwork XVI', artist: 'D&D Art Studio', desc: 'Original artwork by DevDrashti.', wall: 'west', offset: 2, w: 2.0, h: 2.0, img: '/paintings/dd-16.jpg' },
  ],
  'Dark Gallery': [
    { title: 'Artwork XVII', artist: 'D&D Art Studio', desc: 'Original artwork by DevDrashti.', wall: 'south', offset: -3, w: 2.0, h: 2.0, img: '/paintings/dd-17.jpg' },
    { title: 'Artwork XVIII', artist: 'D&D Art Studio', desc: 'Original artwork by DevDrashti.', wall: 'south', offset: 3, w: 2.0, h: 2.0, img: '/paintings/dd-18.jpg' },
    { title: 'Artwork XIX', artist: 'D&D Art Studio', desc: 'Original artwork by DevDrashti.', wall: 'east', offset: -3, w: 2.0, h: 2.0, img: '/paintings/dd-19.jpg' },
    { title: 'Artwork XX', artist: 'D&D Art Studio', desc: 'Original artwork by DevDrashti.', wall: 'east', offset: 3, w: 2.0, h: 2.0, img: '/paintings/dd-20.jpg' },
  ],
  'Royal Collection': [
    { title: 'Artwork XXI', artist: 'D&D Art Studio', desc: 'Original artwork by DevDrashti.', wall: 'south', offset: -3, w: 2.0, h: 2.0, img: '/paintings/dd-21.jpg' },
    { title: 'Artwork XXII', artist: 'D&D Art Studio', desc: 'Original artwork by DevDrashti.', wall: 'south', offset: 3, w: 2.0, h: 2.0, img: '/paintings/dd-22.jpg' },
    { title: 'Artwork XXIII', artist: 'D&D Art Studio', desc: 'Original artwork by DevDrashti.', wall: 'north', offset: -3, w: 2.0, h: 2.0, img: '/paintings/dd-23.jpg' },
    { title: 'Artwork XXIV', artist: 'D&D Art Studio', desc: 'Original artwork by DevDrashti.', wall: 'north', offset: 3, w: 2.0, h: 2.0, img: '/paintings/dd-24.jpg' },
  ],
  'Impressionist Garden': [
    { title: 'Artwork XXV', artist: 'D&D Art Studio', desc: 'Original artwork by DevDrashti.', wall: 'west', offset: -2, w: 2.0, h: 2.0, img: '/paintings/dd-25.jpg' },
    { title: 'Artwork XXVI', artist: 'D&D Art Studio', desc: 'Original artwork by DevDrashti.', wall: 'west', offset: 2, w: 2.0, h: 2.0, img: '/paintings/dd-26.jpg' },
    { title: 'Artwork XXVII', artist: 'D&D Art Studio', desc: 'Original artwork by DevDrashti.', wall: 'east', offset: -2, w: 2.0, h: 2.0, img: '/paintings/dd-27.jpg' },
    { title: 'Artwork XXVIII', artist: 'D&D Art Studio', desc: 'Original artwork by DevDrashti.', wall: 'east', offset: 2, w: 2.0, h: 2.0, img: '/paintings/dd-28.jpg' },
  ],
};
