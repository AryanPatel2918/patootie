import * as THREE from 'three';
import { ROOMS, CONNECTIONS, WALL_HEIGHT, DOOR_WIDTH, DOOR_HEIGHT } from './config.js';

/**
 * Creates the full gallery geometry with per-room theming.
 * Returns array of wall meshes for collision detection.
 */
export function createGallery(scene) {
  const colliders = [];

  // Build each room with its unique theme
  ROOMS.forEach((room) => {
    const theme = room.theme;
    const cx = room.center[0];
    const cz = room.center[1];

    // Create themed materials
    const wallMat = createGalleryWallMaterial(theme.wallColor);
    const floorMat = createFloorMaterial(theme.floorStyle, theme.floorColor);
    const ceilingMat = createCeilingMaterial(theme.ceilingColor);
    const baseboardMat = new THREE.MeshStandardMaterial({
      color: theme.accentColor,
      roughness: 0.3,
      metalness: 0.1,
    });
    const trimMat = new THREE.MeshStandardMaterial({
      color: theme.accentColor,
      roughness: 0.4,
      metalness: 0.2,
    });

    // Floor
    const floorGeo = new THREE.PlaneGeometry(room.width, room.depth);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(cx, 0, cz);
    floor.receiveShadow = true;
    scene.add(floor);

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(room.width, room.depth);
    const ceil = new THREE.Mesh(ceilGeo, ceilingMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(cx, WALL_HEIGHT, cz);
    scene.add(ceil);

    // Walls with door cutouts
    const walls = buildWalls(room, wallMat, trimMat, baseboardMat);
    walls.forEach((w) => {
      scene.add(w);
      if (w.userData.isCollider) colliders.push(w);
    });

    // Room-specific lighting
    setupRoomLighting(scene, room);

    // --- Gallery decorative elements ---

    // Crown molding (top edge where walls meet ceiling)
    const crownMat = new THREE.MeshStandardMaterial({
      color: theme.accentColor,
      roughness: 0.2,
      metalness: 0.3,
    });
    addCrownMolding(scene, room, crownMat);

    // Dado rail (horizontal strip at 1.0m height)
    const dadoMat = new THREE.MeshStandardMaterial({
      color: theme.accentColor,
      roughness: 0.3,
      metalness: 0.15,
    });
    addDadoRail(scene, room, dadoMat);

    // Ceiling track lights (gallery spots aimed down)
    addTrackLights(scene, room, theme);

    // Gallery bench in center of room
    addGalleryBench(scene, cx, cz, theme);
  });

  // Build corridors between rooms
  buildCorridors(scene, colliders);

  return colliders;
}

/**
 * Create gallery ceiling with subtle recessed panels
 */
function createCeilingMaterial(baseColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const c = new THREE.Color(baseColor);
  const r = Math.floor(c.r * 255), g = Math.floor(c.g * 255), b = Math.floor(c.b * 255);

  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, 512, 512);

  // Recessed panel grid
  const panelSize = 128;
  ctx.strokeStyle = `rgba(0,0,0,0.06)`;
  ctx.lineWidth = 2;
  for (let x = 0; x < 512; x += panelSize) {
    for (let y = 0; y < 512; y += panelSize) {
      ctx.strokeRect(x + 4, y + 4, panelSize - 8, panelSize - 8);
    }
  }

  // Inner highlight
  ctx.strokeStyle = `rgba(255,255,255,0.04)`;
  ctx.lineWidth = 1;
  for (let x = 0; x < 512; x += panelSize) {
    for (let y = 0; y < 512; y += panelSize) {
      ctx.strokeRect(x + 6, y + 6, panelSize - 12, panelSize - 12);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);

  return new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
}

/**
 * Create gallery-style wall material with subtle linen texture
 */
function createGalleryWallMaterial(baseColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const c = new THREE.Color(baseColor);
  const r = Math.floor(c.r * 255), g = Math.floor(c.g * 255), b = Math.floor(c.b * 255);

  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, 256, 256);

  // Subtle linen/canvas weave texture
  ctx.globalAlpha = 0.04;
  for (let y = 0; y < 256; y += 2) {
    ctx.strokeStyle = y % 4 === 0 ? 'rgba(0,0,0,1)' : 'rgba(255,255,255,1)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }
  for (let x = 0; x < 256; x += 2) {
    ctx.strokeStyle = x % 4 === 0 ? 'rgba(0,0,0,1)' : 'rgba(255,255,255,1)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }
  ctx.globalAlpha = 1.0;

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);

  return new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.85,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
}

/**
 * Create floor material based on style type
 */
function createFloorMaterial(style, color) {
  switch (style) {
    case 'marble': return createMarbleFloor(color);
    case 'marble-dark': return createMarbleFloor(color);
    case 'wood-light': return createWoodFloor(color, false);
    case 'wood-dark': return createWoodFloor(color, true);
    case 'concrete': return createConcreteFloor(color);
    case 'tatami': return createTatamiFloor(color);
    default: return createWoodFloor(color, false);
  }
}

function createMarbleFloor(baseColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const c = new THREE.Color(baseColor);
  const r = Math.floor(c.r * 255), g = Math.floor(c.g * 255), b = Math.floor(c.b * 255);

  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, 512, 512);

  // Marble veins
  ctx.strokeStyle = `rgba(${r - 30},${g - 30},${b - 20}, 0.3)`;
  ctx.lineWidth = 1;
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    let x = Math.random() * 512;
    let y = Math.random() * 512;
    ctx.moveTo(x, y);
    for (let j = 0; j < 6; j++) {
      x += (Math.random() - 0.5) * 100;
      y += (Math.random() - 0.5) * 100;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Tile grid
  ctx.strokeStyle = `rgba(0,0,0,0.1)`;
  ctx.lineWidth = 2;
  for (let x = 0; x < 512; x += 128) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
  }
  for (let y = 0; y < 512; y += 128) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);

  return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.15, metalness: 0.05, envMapIntensity: 0.5 });
}

function createWoodFloor(baseColor, isDark) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const c = new THREE.Color(baseColor);
  const r = Math.floor(c.r * 255), g = Math.floor(c.g * 255), b = Math.floor(c.b * 255);

  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, 512, 512);

  const plankWidth = 64;
  for (let x = 0; x < 512; x += plankWidth) {
    const shade = -10 + Math.floor(Math.random() * 20);
    ctx.fillStyle = `rgb(${r + shade},${g + shade},${b + shade})`;
    ctx.fillRect(x, 0, plankWidth - 1, 512);

    // Wood grain
    ctx.strokeStyle = isDark ? 'rgba(0,0,0,0.15)' : 'rgba(60,35,10,0.12)';
    ctx.lineWidth = 0.5;
    for (let gi = 0; gi < 6; gi++) {
      const gy = Math.random() * 512;
      ctx.beginPath();
      ctx.moveTo(x, gy);
      for (let gx = x; gx < x + plankWidth; gx += 5) {
        ctx.lineTo(gx, gy + Math.sin((gx - x) * 0.1) * 2);
      }
      ctx.stroke();
    }

    // Edge line
    ctx.strokeStyle = isDark ? 'rgba(0,0,0,0.4)' : 'rgba(30,15,5,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);

  return new THREE.MeshStandardMaterial({ map: tex, roughness: isDark ? 0.4 : 0.3, metalness: 0.05 });
}

function createConcreteFloor(baseColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const c = new THREE.Color(baseColor);
  const r = Math.floor(c.r * 255), g = Math.floor(c.g * 255), b = Math.floor(c.b * 255);

  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, 512, 512);

  // Noise speckle
  for (let i = 0; i < 3000; i++) {
    const px = Math.random() * 512;
    const py = Math.random() * 512;
    const shade = Math.floor(Math.random() * 30) - 15;
    ctx.fillStyle = `rgba(${r + shade},${g + shade},${b + shade},0.4)`;
    ctx.fillRect(px, py, 2, 2);
  }

  // Subtle grid lines (concrete joints)
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 2;
  for (let x = 0; x < 512; x += 256) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
  }
  for (let y = 0; y < 512; y += 256) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);

  return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35, metalness: 0.05, envMapIntensity: 0.3 });
}

function createTatamiFloor(baseColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const c = new THREE.Color(baseColor);
  const r = Math.floor(c.r * 255), g = Math.floor(c.g * 255), b = Math.floor(c.b * 255);

  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, 512, 512);

  // Woven texture lines
  ctx.strokeStyle = `rgba(${r - 20},${g - 20},${b - 20},0.3)`;
  ctx.lineWidth = 1;
  for (let y = 0; y < 512; y += 4) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
  }

  // Mat borders (traditional tatami layout)
  ctx.strokeStyle = `rgba(60,40,20,0.5)`;
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, 248, 504);
  ctx.strokeRect(260, 4, 248, 504);

  // Inner binding strips
  ctx.fillStyle = `rgba(40,30,15,0.6)`;
  ctx.fillRect(252, 0, 8, 512);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);

  return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, metalness: 0.0 });
}

/**
 * Build walls for a room, with door cutouts
 */
function buildWalls(room, wallMat, trimMat, baseboardMat) {
  const meshes = [];
  const cx = room.center[0];
  const cz = room.center[1];
  const hw = room.width / 2;
  const hd = room.depth / 2;
  const sides = ['north', 'south', 'east', 'west'];

  sides.forEach((side) => {
    const door = room.doors.find(d => d.wall === side);
    const hasDoor = !!door;
    const doorOffset = hasDoor ? door.offset : 0;

    let wallLength, wallX, wallZ;
    switch (side) {
      case 'north': wallLength = room.width; wallX = cx; wallZ = cz - hd; break;
      case 'south': wallLength = room.width; wallX = cx; wallZ = cz + hd; break;
      case 'east': wallLength = room.depth; wallX = cx + hw; wallZ = cz; break;
      case 'west': wallLength = room.depth; wallX = cx - hw; wallZ = cz; break;
    }

    if (!hasDoor) {
      // Solid wall
      const geo = new THREE.BoxGeometry(wallLength, WALL_HEIGHT, 0.2);
      const wall = new THREE.Mesh(geo, wallMat);
      wall.position.set(wallX, WALL_HEIGHT / 2, wallZ);
      if (side === 'east' || side === 'west') wall.rotation.y = Math.PI / 2;
      wall.receiveShadow = true;
      wall.userData.isCollider = true;
      meshes.push(wall);

      // Baseboard
      const bbGeo = new THREE.BoxGeometry(wallLength, 0.12, 0.22);
      const bb = new THREE.Mesh(bbGeo, baseboardMat);
      bb.position.set(wallX, 0.06, wallZ);
      if (side === 'east' || side === 'west') bb.rotation.y = Math.PI / 2;
      meshes.push(bb);
    } else {
      // Wall with door opening
      const halfDoor = DOOR_WIDTH / 2;
      const leftLen = wallLength / 2 - halfDoor + doorOffset;
      const rightLen = wallLength / 2 - halfDoor - doorOffset;

      // Left segment
      if (leftLen > 0.1) {
        const geo = new THREE.BoxGeometry(leftLen, WALL_HEIGHT, 0.2);
        const wall = new THREE.Mesh(geo, wallMat);
        const segCenter = -wallLength / 2 + leftLen / 2;
        if (side === 'north' || side === 'south') {
          wall.position.set(cx + segCenter, WALL_HEIGHT / 2, wallZ);
        } else {
          wall.position.set(wallX, WALL_HEIGHT / 2, cz + segCenter);
          wall.rotation.y = Math.PI / 2;
        }
        wall.receiveShadow = true;
        wall.userData.isCollider = true;
        meshes.push(wall);
      }

      // Right segment
      if (rightLen > 0.1) {
        const geo = new THREE.BoxGeometry(rightLen, WALL_HEIGHT, 0.2);
        const wall = new THREE.Mesh(geo, wallMat);
        const segCenter = wallLength / 2 - rightLen / 2;
        if (side === 'north' || side === 'south') {
          wall.position.set(cx + segCenter, WALL_HEIGHT / 2, wallZ);
        } else {
          wall.position.set(wallX, WALL_HEIGHT / 2, cz + segCenter);
          wall.rotation.y = Math.PI / 2;
        }
        wall.receiveShadow = true;
        wall.userData.isCollider = true;
        meshes.push(wall);
      }

      // Lintel above door
      const lintelH = WALL_HEIGHT - DOOR_HEIGHT;
      if (lintelH > 0.05) {
        const geo = new THREE.BoxGeometry(DOOR_WIDTH, lintelH, 0.2);
        const lintel = new THREE.Mesh(geo, wallMat);
        const lintelY = DOOR_HEIGHT + lintelH / 2;
        if (side === 'north' || side === 'south') {
          lintel.position.set(cx + doorOffset, lintelY, wallZ);
        } else {
          lintel.position.set(wallX, lintelY, cz + doorOffset);
          lintel.rotation.y = Math.PI / 2;
        }
        lintel.userData.isCollider = true;
        meshes.push(lintel);
      }

      // Door frame trim
      const frameParts = createDoorFrame(side, cx, cz, wallX, wallZ, doorOffset, trimMat);
      meshes.push(...frameParts);

      // Baseboards left and right of door
      if (leftLen > 0.1) {
        const bbGeo = new THREE.BoxGeometry(leftLen, 0.12, 0.22);
        const bb = new THREE.Mesh(bbGeo, baseboardMat);
        const segCenter = -wallLength / 2 + leftLen / 2;
        if (side === 'north' || side === 'south') {
          bb.position.set(cx + segCenter, 0.06, wallZ);
        } else {
          bb.position.set(wallX, 0.06, cz + segCenter);
          bb.rotation.y = Math.PI / 2;
        }
        meshes.push(bb);
      }
      if (rightLen > 0.1) {
        const bbGeo = new THREE.BoxGeometry(rightLen, 0.12, 0.22);
        const bb = new THREE.Mesh(bbGeo, baseboardMat);
        const segCenter = wallLength / 2 - rightLen / 2;
        if (side === 'north' || side === 'south') {
          bb.position.set(cx + segCenter, 0.06, wallZ);
        } else {
          bb.position.set(wallX, 0.06, cz + segCenter);
          bb.rotation.y = Math.PI / 2;
        }
        meshes.push(bb);
      }
    }
  });

  return meshes;
}

function createDoorFrame(side, cx, cz, wallX, wallZ, doorOffset, mat) {
  const parts = [];
  const frameW = 0.08;
  const halfDoor = DOOR_WIDTH / 2;

  const postGeo = new THREE.BoxGeometry(frameW, DOOR_HEIGHT, frameW);
  const topGeo = new THREE.BoxGeometry(DOOR_WIDTH + frameW * 2, frameW, frameW);

  for (let s = -1; s <= 1; s += 2) {
    const post = new THREE.Mesh(postGeo, mat);
    if (side === 'north' || side === 'south') {
      post.position.set(cx + doorOffset + s * halfDoor, DOOR_HEIGHT / 2, wallZ);
    } else {
      post.position.set(wallX, DOOR_HEIGHT / 2, cz + doorOffset + s * halfDoor);
    }
    parts.push(post);
  }

  const top = new THREE.Mesh(topGeo, mat);
  if (side === 'north' || side === 'south') {
    top.position.set(cx + doorOffset, DOOR_HEIGHT, wallZ);
  } else {
    top.position.set(wallX, DOOR_HEIGHT, cz + doorOffset);
    top.rotation.y = Math.PI / 2;
  }
  parts.push(top);

  return parts;
}

/**
 * Build corridors between connected rooms
 */
function buildCorridors(scene, colliders) {
  const corridorWallMat = new THREE.MeshStandardMaterial({
    color: 0xe8e0d4,
    roughness: 0.9,
    side: THREE.DoubleSide,
  });
  const corridorFloorMat = createWoodFloor(0xa08060, false);
  const corridorCeilMat = new THREE.MeshStandardMaterial({
    color: 0xf5f0ea,
    roughness: 0.95,
    side: THREE.DoubleSide,
  });

  CONNECTIONS.forEach(({ from, to, axis }) => {
    const room1 = ROOMS.find(r => r.name === from);
    const room2 = ROOMS.find(r => r.name === to);
    if (!room1 || !room2) return;

    if (axis === 'x') {
      const leftRoom = room1.center[0] < room2.center[0] ? room1 : room2;
      const rightRoom = room1.center[0] < room2.center[0] ? room2 : room1;

      const edge1 = leftRoom.center[0] + leftRoom.width / 2;
      const edge2 = rightRoom.center[0] - rightRoom.width / 2;
      const corridorLen = edge2 - edge1;
      if (corridorLen < 0.1) return;

      const corridorCx = (edge1 + edge2) / 2;
      // Find the z position using door offsets
      const door1 = leftRoom.doors.find(d => d.wall === 'east');
      const door2 = rightRoom.doors.find(d => d.wall === 'west');
      const corridorCz = leftRoom.center[1] + (door1 ? door1.offset : 0);

      // Floor
      const fg = new THREE.PlaneGeometry(corridorLen, DOOR_WIDTH);
      const f = new THREE.Mesh(fg, corridorFloorMat);
      f.rotation.x = -Math.PI / 2;
      f.position.set(corridorCx, 0.001, corridorCz);
      f.receiveShadow = true;
      scene.add(f);

      // Ceiling
      const cg = new THREE.PlaneGeometry(corridorLen, DOOR_WIDTH);
      const c = new THREE.Mesh(cg, corridorCeilMat);
      c.rotation.x = Math.PI / 2;
      c.position.set(corridorCx, WALL_HEIGHT, corridorCz);
      scene.add(c);

      // Side walls
      for (let s = -1; s <= 1; s += 2) {
        const wg = new THREE.BoxGeometry(corridorLen, WALL_HEIGHT, 0.15);
        const w = new THREE.Mesh(wg, corridorWallMat);
        w.position.set(corridorCx, WALL_HEIGHT / 2, corridorCz + s * DOOR_WIDTH / 2);
        w.receiveShadow = true;
        w.userData.isCollider = true;
        scene.add(w);
        colliders.push(w);
      }

      // Corridor light
      const light = new THREE.PointLight(0xffffff, 0.5, 8);
      light.position.set(corridorCx, WALL_HEIGHT - 0.3, corridorCz);
      scene.add(light);

    } else {
      // z-axis connection
      const topRoom = room1.center[1] < room2.center[1] ? room1 : room2;
      const botRoom = room1.center[1] < room2.center[1] ? room2 : room1;

      const edge1 = topRoom.center[1] + topRoom.depth / 2;
      const edge2 = botRoom.center[1] - botRoom.depth / 2;
      const corridorLen = edge2 - edge1;
      if (corridorLen < 0.1) return;

      const corridorCz = (edge1 + edge2) / 2;
      const door1 = topRoom.doors.find(d => d.wall === 'south');
      const corridorCx = topRoom.center[0] + (door1 ? door1.offset : 0);

      // Floor
      const fg = new THREE.PlaneGeometry(DOOR_WIDTH, corridorLen);
      const f = new THREE.Mesh(fg, corridorFloorMat);
      f.rotation.x = -Math.PI / 2;
      f.position.set(corridorCx, 0.001, corridorCz);
      f.receiveShadow = true;
      scene.add(f);

      // Ceiling
      const cg = new THREE.PlaneGeometry(DOOR_WIDTH, corridorLen);
      const c = new THREE.Mesh(cg, corridorCeilMat);
      c.rotation.x = Math.PI / 2;
      c.position.set(corridorCx, WALL_HEIGHT, corridorCz);
      scene.add(c);

      // Side walls
      for (let s = -1; s <= 1; s += 2) {
        const wg = new THREE.BoxGeometry(0.15, WALL_HEIGHT, corridorLen);
        const w = new THREE.Mesh(wg, corridorWallMat);
        w.position.set(corridorCx + s * DOOR_WIDTH / 2, WALL_HEIGHT / 2, corridorCz);
        w.receiveShadow = true;
        w.userData.isCollider = true;
        scene.add(w);
        colliders.push(w);
      }

      // Corridor light
      const light = new THREE.PointLight(0xffffff, 0.5, 8);
      light.position.set(corridorCx, WALL_HEIGHT - 0.3, corridorCz);
      scene.add(light);
    }
  });
}

/**
 * Set up per-room lighting based on theme
 */
function setupRoomLighting(scene, room) {
  const theme = room.theme;
  const cx = room.center[0];
  const cz = room.center[1];

  // Global ambient (only once)
  if (room === ROOMS[0]) {
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
    hemi.position.set(0, WALL_HEIGHT, 0);
    scene.add(hemi);
  }

  // One point light per room (themed)
  const point = new THREE.PointLight(
    theme.lightColor,
    theme.ambientIntensity,
    Math.max(room.width, room.depth) * 1.5
  );
  point.position.set(cx, WALL_HEIGHT - 0.5, cz);
  scene.add(point);
}

/**
 * Add crown molding along the top of all walls
 */
function addCrownMolding(scene, room, mat) {
  const cx = room.center[0];
  const cz = room.center[1];
  const hw = room.width / 2;
  const hd = room.depth / 2;
  const moldH = 0.12;
  const moldD = 0.14;
  const y = WALL_HEIGHT - moldH / 2;

  // North
  const nGeo = new THREE.BoxGeometry(room.width, moldH, moldD);
  const n = new THREE.Mesh(nGeo, mat);
  n.position.set(cx, y, cz - hd);
  scene.add(n);

  // South
  const s = new THREE.Mesh(nGeo, mat);
  s.position.set(cx, y, cz + hd);
  scene.add(s);

  // East
  const eGeo = new THREE.BoxGeometry(moldD, moldH, room.depth);
  const e = new THREE.Mesh(eGeo, mat);
  e.position.set(cx + hw, y, cz);
  scene.add(e);

  // West
  const w = new THREE.Mesh(eGeo, mat);
  w.position.set(cx - hw, y, cz);
  scene.add(w);
}

/**
 * Add dado rail (wainscoting line) at ~1m height
 */
function addDadoRail(scene, room, mat) {
  const cx = room.center[0];
  const cz = room.center[1];
  const hw = room.width / 2;
  const hd = room.depth / 2;
  const railH = 0.06;
  const railD = 0.08;
  const y = 1.0;

  // North
  const nGeo = new THREE.BoxGeometry(room.width, railH, railD);
  const n = new THREE.Mesh(nGeo, mat);
  n.position.set(cx, y, cz - hd + 0.05);
  scene.add(n);

  // South
  const s = new THREE.Mesh(nGeo, mat);
  s.position.set(cx, y, cz + hd - 0.05);
  scene.add(s);

  // East
  const eGeo = new THREE.BoxGeometry(railD, railH, room.depth);
  const e = new THREE.Mesh(eGeo, mat);
  e.position.set(cx + hw - 0.05, y, cz);
  scene.add(e);

  // West
  const w = new THREE.Mesh(eGeo, mat);
  w.position.set(cx - hw + 0.05, y, cz);
  scene.add(w);
}

/**
 * Add ceiling track lights (visual fixtures only - no real spot lights for performance)
 */
function addTrackLights(scene, room, theme) {
  const cx = room.center[0];
  const cz = room.center[1];

  const trackMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.3,
    metalness: 0.8,
  });
  const bulbMat = new THREE.MeshBasicMaterial({
    color: theme.lightColor,
  });

  const numLights = Math.max(2, Math.floor(room.width / 4));

  // Two rows of track lights
  const offsets = [-room.depth * 0.25, room.depth * 0.25];

  offsets.forEach((zOff) => {
    // Track rail
    const trackGeo = new THREE.BoxGeometry(room.width * 0.7, 0.04, 0.04);
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.position.set(cx, WALL_HEIGHT - 0.06, cz + zOff);
    scene.add(track);

    // Light fixture visuals along the track (no real lights)
    const startX = cx - room.width * 0.3;
    const stepX = (room.width * 0.6) / (numLights - 1);

    for (let i = 0; i < numLights; i++) {
      const lx = startX + i * stepX;

      // Fixture housing
      const housingGeo = new THREE.CylinderGeometry(0.05, 0.07, 0.1, 6);
      const housing = new THREE.Mesh(housingGeo, trackMat);
      housing.position.set(lx, WALL_HEIGHT - 0.11, cz + zOff);
      scene.add(housing);

      // Glowing bulb (emissive, no actual light cost)
      const bulbGeo = new THREE.SphereGeometry(0.035, 6, 6);
      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.set(lx, WALL_HEIGHT - 0.18, cz + zOff);
      scene.add(bulb);
    }
  });
}

/**
 * Add a gallery bench in the center of the room
 */
function addGalleryBench(scene, cx, cz, theme) {
  const benchMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.4,
    metalness: 0.1,
  });
  const cushionMat = new THREE.MeshStandardMaterial({
    color: theme.accentColor,
    roughness: 0.8,
    metalness: 0.0,
  });

  // Bench seat
  const seatGeo = new THREE.BoxGeometry(1.8, 0.08, 0.5);
  const seat = new THREE.Mesh(seatGeo, cushionMat);
  seat.position.set(cx, 0.45, cz);
  scene.add(seat);

  // Bench frame/legs
  const legGeo = new THREE.BoxGeometry(0.06, 0.42, 0.5);
  const leg1 = new THREE.Mesh(legGeo, benchMat);
  leg1.position.set(cx - 0.8, 0.21, cz);
  scene.add(leg1);

  const leg2 = new THREE.Mesh(legGeo, benchMat);
  leg2.position.set(cx + 0.8, 0.21, cz);
  scene.add(leg2);

  // Cross support
  const crossGeo = new THREE.BoxGeometry(1.6, 0.04, 0.04);
  const cross = new THREE.Mesh(crossGeo, benchMat);
  cross.position.set(cx, 0.15, cz);
  scene.add(cross);
}
