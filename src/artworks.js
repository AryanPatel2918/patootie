import * as THREE from 'three';
import { ROOMS, ARTWORKS, WALL_HEIGHT, DOOR_WIDTH } from './config.js';

const textureLoader = new THREE.TextureLoader();
const artworkMeshes = [];
let currentHighlight = null;

const panel = document.getElementById('artwork-panel');
const panelTitle = document.getElementById('panel-title');
const panelArtist = document.getElementById('panel-artist');
const panelDesc = document.getElementById('panel-desc');

// Frame material - dark wood
const frameMat = new THREE.MeshStandardMaterial({
  color: 0x1a1008,
  roughness: 0.4,
  metalness: 0.1,
});

// Gold inner edge
const goldMat = new THREE.MeshStandardMaterial({
  color: 0xc9a84c,
  roughness: 0.3,
  metalness: 0.6,
});

export function setupArtworks(scene) {
  ROOMS.forEach((room) => {
    const works = ARTWORKS[room.name];
    if (!works) return;

    const cx = room.center[0];
    const cz = room.center[1];
    const hw = room.width / 2;
    const hd = room.depth / 2;

    works.forEach((art) => {
      // Skip paintings that would overlap a door on the same wall
      const doorOnWall = room.doors.find(d => d.wall === art.wall);
      if (doorOnWall) {
        const doorCenter = doorOnWall.offset;
        const doorHalf = DOOR_WIDTH / 2 + 0.3; // extra margin
        const artLeft = art.offset - art.w / 2;
        const artRight = art.offset + art.w / 2;
        const doorLeft = doorCenter - doorHalf;
        const doorRight = doorCenter + doorHalf;
        // Check overlap
        if (artRight > doorLeft && artLeft < doorRight) {
          return; // skip this painting — it overlaps the door
        }
      }

      const group = new THREE.Group();
      group.userData = { ...art, roomName: room.name };

      // Artwork position on wall
      let px, pz, ry;
      const hangHeight = 1.5; // Center of artwork at eye level
      const wallGap = 0.2; // Offset from wall surface

      switch (art.wall) {
        case 'north':
          px = cx + art.offset;
          pz = cz - hd + wallGap;
          ry = 0;
          break;
        case 'south':
          px = cx + art.offset;
          pz = cz + hd - wallGap;
          ry = Math.PI;
          break;
        case 'east':
          px = cx + hw - wallGap;
          pz = cz + art.offset;
          ry = -Math.PI / 2;
          break;
        case 'west':
          px = cx - hw + wallGap;
          pz = cz + art.offset;
          ry = Math.PI / 2;
          break;
      }

      group.position.set(px, hangHeight, pz);
      group.rotation.y = ry;

      // Canvas (the image plane) - use BasicMaterial so image is always visible
      const canvasGeo = new THREE.PlaneGeometry(art.w, art.h);
      const canvasMat = new THREE.MeshBasicMaterial({
        color: 0x444444, // placeholder until texture loads
        side: THREE.DoubleSide,
      });

      // Load texture from local file
      const imgUrl = import.meta.env.BASE_URL + art.img.replace(/^\//, '');
      textureLoader.load(imgUrl, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        canvasMat.map = tex;
        canvasMat.color.set(0xffffff);
        canvasMat.needsUpdate = true;
      }, undefined, () => {
        // On error - show a colored placeholder
        canvasMat.color.set(0xcc8844);
        canvasMat.needsUpdate = true;
      });

      const canvas = new THREE.Mesh(canvasGeo, canvasMat);
      canvas.position.z = 0.07; // In front of frame
      group.add(canvas);

      // Frame - outer border
      const frameDepth = 0.06;
      const frameWidth = 0.08;
      createFrame(group, art.w, art.h, frameWidth, frameDepth);

      // Spotlight for this artwork
      const spot = new THREE.SpotLight(0xfff5e0, 0, 5, Math.PI / 7, 0.8, 1.5);
      spot.position.set(0, 2.0, 1.5);
      spot.target = canvas;
      group.add(spot);
      group.userData.spotlight = spot;

      scene.add(group);
      artworkMeshes.push(group);
    });
  });
}

function createFrame(group, w, h, frameW, depth) {
  // Back panel
  const backGeo = new THREE.BoxGeometry(w + frameW * 2, h + frameW * 2, 0.02);
  const back = new THREE.Mesh(backGeo, frameMat);
  group.add(back);

  // Frame sides (4 box pieces)
  // Top
  const topGeo = new THREE.BoxGeometry(w + frameW * 2, frameW, depth);
  const top = new THREE.Mesh(topGeo, frameMat);
  top.position.set(0, h / 2 + frameW / 2, depth / 2);
  group.add(top);

  // Bottom
  const bot = new THREE.Mesh(topGeo, frameMat);
  bot.position.set(0, -h / 2 - frameW / 2, depth / 2);
  group.add(bot);

  // Left
  const sideGeo = new THREE.BoxGeometry(frameW, h, depth);
  const left = new THREE.Mesh(sideGeo, frameMat);
  left.position.set(-w / 2 - frameW / 2, 0, depth / 2);
  group.add(left);

  // Right
  const right = new THREE.Mesh(sideGeo, frameMat);
  right.position.set(w / 2 + frameW / 2, 0, depth / 2);
  group.add(right);

  // Gold inner bevel
  const innerW = 0.03;
  const ig1 = new THREE.BoxGeometry(w, innerW, depth + 0.01);
  const ig2 = new THREE.BoxGeometry(innerW, h, depth + 0.01);

  const gt = new THREE.Mesh(ig1, goldMat);
  gt.position.set(0, h / 2 + innerW / 2, depth / 2);
  group.add(gt);

  const gb = new THREE.Mesh(ig1, goldMat);
  gb.position.set(0, -h / 2 - innerW / 2, depth / 2);
  group.add(gb);

  const gl = new THREE.Mesh(ig2, goldMat);
  gl.position.set(-w / 2 - innerW / 2, 0, depth / 2);
  group.add(gl);

  const gr = new THREE.Mesh(ig2, goldMat);
  gr.position.set(w / 2 + innerW / 2, 0, depth / 2);
  group.add(gr);
}

export function checkArtworkProximity(camera) {
  let closest = null;
  let closestDist = 3.0; // Max interaction distance

  artworkMeshes.forEach((group) => {
    const dist = camera.position.distanceTo(group.position);
    if (dist < closestDist) {
      closestDist = dist;
      closest = group;
    }
  });

  if (closest !== currentHighlight) {
    // Remove old highlight
    if (currentHighlight) {
      currentHighlight.userData.spotlight.intensity = 0;
    }

    currentHighlight = closest;

    if (closest) {
      closest.userData.spotlight.intensity = 2.5;
      panelTitle.textContent = closest.userData.title;
      panelArtist.textContent = closest.userData.artist;
      panelDesc.textContent = closest.userData.desc;
      panel.classList.remove('hidden');
    } else {
      panel.classList.add('hidden');
    }
  }
}
