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

// Artwork data per room — featuring D&D Art Studio originals, themed by room
export const ARTWORKS = {
  // Renaissance/Classical welcome hall - portraits, still life, classical compositions
  'Grand Lobby': [
    { title: 'D&D Art Studio', artist: 'DevDrashti Art Studio', desc: 'Welcome — explore 7 uniquely themed rooms.', wall: 'west', offset: 0, w: 2.0, h: 2.0, img: '/paintings/logo.jpg' },
    { title: 'Shiva & Parvati', artist: 'Drashti, 2024', desc: 'Modern flowing depiction of the divine couple in blue and white.', wall: 'north', offset: -3, w: 2.2, h: 1.7, img: '/paintings/dd-03.jpg' },
    { title: 'Portrait Study', artist: 'Drashti', desc: 'An expressive oil portrait capturing warmth and personality.', wall: 'north', offset: 3, w: 1.8, h: 2.2, img: '/paintings/dd-07.jpg' },
    { title: 'Orchids & Red Silk', artist: 'Drashti', desc: 'Classical still life — porcelain vase draped in crimson with white orchids.', wall: 'south', offset: -3, w: 1.8, h: 2.2, img: '/paintings/dd-21.jpg' },
    { title: 'Two-Point Perspective', artist: 'Drashti', desc: 'Architectural pencil study with masterful perspective technique.', wall: 'south', offset: 3, w: 2.2, h: 1.6, img: '/paintings/dd-22.jpg' },
  ],
  // Deep midnight blue walls - expressive, dark, intense works
  'Van Gogh Wing': [
    { title: 'City in Rain', artist: 'Devanshi', desc: 'Abstract expressionist cityscape with bold brushstrokes.', wall: 'north', offset: -3, w: 1.8, h: 2.2, img: '/paintings/dd-12.jpg' },
    { title: 'The Gaze', artist: 'Drashti', desc: 'Hyper-realistic graphite eye study with a single tear.', wall: 'north', offset: 3, w: 2.4, h: 1.6, img: '/paintings/dd-14.jpg' },
    { title: 'Midnight Trees', artist: 'D&D Art Studio, 2023', desc: 'White scratch-art revealing ghostly trees against the void.', wall: 'south', offset: -3, w: 1.8, h: 2.2, img: '/paintings/dd-15.jpg' },
    { title: 'Golden Mandala', artist: 'D&D Art Studio', desc: 'Concentric gold seeds on black — meditative geometry.', wall: 'south', offset: 3, w: 1.8, h: 1.8, img: '/paintings/dd-08.jpg' },
  ],
  // Clean white walls - bold colors, geometric, modern pieces
  'Modern Abstract': [
    { title: 'Textured Horizon', artist: 'D&D Art Studio', desc: 'Circular textured relief — layered greens evoking rolling fields.', wall: 'north', offset: -3, w: 2.0, h: 2.0, img: '/paintings/dd-05.jpg' },
    { title: 'Ganesha in Motion', artist: 'Devanshi', desc: 'Abstract Ganesha bursting with vibrant color and energy.', wall: 'north', offset: 3, w: 1.8, h: 2.2, img: '/paintings/dd-17.jpg' },
    { title: 'Rajasthani Mirror Frame', artist: 'D&D Art Studio', desc: 'Traditional red clay frame with mirror-work and arch motif.', wall: 'east', offset: -3, w: 1.8, h: 2.0, img: '/paintings/dd-06.jpg' },
    { title: 'Painted Pottery', artist: 'D&D Art Studio', desc: 'Hand-painted ceramic vase with bird nest and desert landscape.', wall: 'east', offset: 3, w: 1.8, h: 2.0, img: '/paintings/dd-01.jpg' },
  ],
  // Tatami floors, rice-paper walls - zen, peaceful, spiritual calm
  'Japanese Zen': [
    { title: 'Blue Buddha', artist: 'Drashti, 2022', desc: 'Serene Buddha adorned with bodhi leaves in golden light.', wall: 'east', offset: -2, w: 2.0, h: 2.0, img: '/paintings/dd-19.jpg' },
    { title: 'Narcissus Bloom', artist: 'Drashti, 2025', desc: 'Delicate white flower rendered with quiet grace.', wall: 'east', offset: 2, w: 1.6, h: 2.0, img: '/paintings/dd-10.jpg' },
    { title: 'Koi in Watercolor', artist: 'D&D Art Studio', desc: 'Flowing betta fish in translucent watercolor washes.', wall: 'west', offset: -2, w: 1.8, h: 2.2, img: '/paintings/dd-04.jpg' },
    { title: 'Golden Leaves Triptych', artist: 'D&D Art Studio', desc: 'Three panels of golden botanicals on deep teal.', wall: 'west', offset: 2, w: 2.4, h: 1.4, img: '/paintings/dd-18.jpg' },
  ],
  // Near-black walls, amber spots - dark dramatic pieces
  'Dark Gallery': [
    { title: 'Radha & Krishna', artist: 'D&D Art Studio', desc: 'Intimate divine love rendered in bold reds and greys.', wall: 'south', offset: -3, w: 1.8, h: 2.2, img: '/paintings/dd-11.jpg' },
    { title: 'Vishnu Virat Swaroop', artist: 'Drashti', desc: 'The cosmic form of Krishna on the battlefield of Kurukshetra.', wall: 'south', offset: 3, w: 1.8, h: 2.2, img: '/paintings/dd-20.jpg' },
    { title: 'Shiva — Fire & Bells', artist: 'D&D Art Studio', desc: 'Vibrant temple bells and sacred flames with Shiva in profile.', wall: 'east', offset: -3, w: 1.8, h: 1.8, img: '/paintings/dd-09.jpg' },
    { title: 'Ganesha with Sitar', artist: 'Drashti, 2025', desc: 'Musical Ganesha in rich greens and golds.', wall: 'east', offset: 3, w: 1.6, h: 2.2, img: '/paintings/dd-16.jpg' },
  ],
  // Deep burgundy walls, gold trim - regal, luxurious
  'Royal Collection': [
    { title: 'Tropical Macaw', artist: 'Drashti, 2023', desc: 'Majestic parrot in sunlit rainforest — vivid realism.', wall: 'south', offset: -3, w: 1.8, h: 2.2, img: '/paintings/dd-02.jpg' },
    { title: 'Cardinal Pair', artist: 'Devanshi', desc: 'Two cardinals perched on a birch branch in autumn light.', wall: 'south', offset: 3, w: 1.8, h: 1.8, img: '/paintings/dd-13.jpg' },
    { title: 'Jungle Canopy', artist: 'D&D Art Studio', desc: 'Lush wildlife scene celebrating tropical biodiversity.', wall: 'north', offset: -3, w: 2.0, h: 2.0, img: '/paintings/dd-23.jpg' },
    { title: 'Feathered Dreams', artist: 'D&D Art Studio', desc: 'Exotic plumage study in rich jewel tones.', wall: 'north', offset: 3, w: 2.0, h: 2.0, img: '/paintings/dd-24.jpg' },
  ],
  // Sage green walls, warm light - nature, botanicals, soft palette
  'Impressionist Garden': [
    { title: 'Abstract Flora', artist: 'D&D Art Studio', desc: 'Organic botanical forms in soft earth tones.', wall: 'west', offset: -2, w: 2.0, h: 2.0, img: '/paintings/dd-25.jpg' },
    { title: 'Nature Study', artist: 'D&D Art Studio', desc: 'Delicate natural forms captured in gentle hues.', wall: 'west', offset: 2, w: 2.0, h: 2.0, img: '/paintings/dd-26.jpg' },
    { title: 'Wild Growth', artist: 'D&D Art Studio', desc: 'Botanical textures and earthy organic patterns.', wall: 'east', offset: -2, w: 2.0, h: 2.0, img: '/paintings/dd-27.jpg' },
    { title: 'Seed Mandala', artist: 'D&D Art Studio', desc: 'Natural seed arrangement in meditative circular pattern.', wall: 'east', offset: 2, w: 2.0, h: 2.0, img: '/paintings/dd-28.jpg' },
  ],
};
