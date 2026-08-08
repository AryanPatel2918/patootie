import * as THREE from 'three';
import { ROOMS, CONNECTIONS } from './config.js';

const canvas = document.getElementById('minimap');
const ctx = canvas.getContext('2d');

// Calculate bounds of all rooms to determine scale/offset
const allX = ROOMS.flatMap(r => [r.center[0] - r.width / 2, r.center[0] + r.width / 2]);
const allZ = ROOMS.flatMap(r => [r.center[1] - r.depth / 2, r.center[1] + r.depth / 2]);
const minX = Math.min(...allX) - 2;
const maxX = Math.max(...allX) + 2;
const minZ = Math.min(...allZ) - 2;
const maxZ = Math.max(...allZ) + 2;

const worldW = maxX - minX;
const worldH = maxZ - minZ;
const padding = 12;
const mapW = canvas.width - padding * 2;
const mapH = canvas.height - padding * 2;
const scale = Math.min(mapW / worldW, mapH / worldH);

// Convert world coords to canvas coords
function toCanvas(wx, wz) {
  const cx = padding + (wx - minX) * scale;
  const cy = padding + (wz - minZ) * scale;
  return [cx, cy];
}

// Room theme colors for minimap display (lighter versions)
const roomColors = {
  'Grand Lobby': '#f5ede3',
  'Impressionist Garden': '#d4e8cc',
  'Van Gogh Wing': '#2a3a5a',
  'Modern Abstract': '#f0f0f0',
  'Dark Gallery': '#2a1a20',
  'Japanese Zen': '#f0ead6',
  'Royal Collection': '#4a2030',
};

/**
 * Update the minimap with current player position and facing direction
 */
export function updateMinimap(camera) {
  const px = camera.position.x;
  const pz = camera.position.z;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw corridors first (behind rooms)
  ctx.strokeStyle = 'rgba(160, 140, 110, 0.6)';
  ctx.lineWidth = Math.max(2, scale * 1.8);
  CONNECTIONS.forEach(({ from, to }) => {
    const r1 = ROOMS.find(r => r.name === from);
    const r2 = ROOMS.find(r => r.name === to);
    if (!r1 || !r2) return;
    const [x1, y1] = toCanvas(r1.center[0], r1.center[1]);
    const [x2, y2] = toCanvas(r2.center[0], r2.center[1]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });

  // Draw rooms
  ROOMS.forEach((room) => {
    const [rx, ry] = toCanvas(room.center[0] - room.width / 2, room.center[1] - room.depth / 2);
    const rw = room.width * scale;
    const rh = room.depth * scale;

    // Fill
    ctx.fillStyle = roomColors[room.name] || '#333';
    ctx.globalAlpha = 0.7;
    ctx.fillRect(rx, ry, rw, rh);
    ctx.globalAlpha = 1.0;

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(rx, ry, rw, rh);

    // Room label (small)
    const [cx, cy] = toCanvas(room.center[0], room.center[1]);
    ctx.fillStyle = isLightColor(roomColors[room.name]) ? '#333' : '#ddd';
    ctx.font = '7px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Abbreviate long names
    const label = room.name.length > 10 ? room.name.slice(0, 9) + '…' : room.name;
    ctx.fillText(label, cx, cy);
  });

  // Draw player position
  const [playerX, playerY] = toCanvas(px, pz);

  // Direction arrow
  const dirVec = new THREE.Vector3();
  camera.getWorldDirection(dirVec);
  const angle = Math.atan2(dirVec.x, dirVec.z);

  // Player dot
  ctx.beginPath();
  ctx.arc(playerX, playerY, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#ff4444';
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Direction indicator (triangle)
  const arrowLen = 8;
  const tipX = playerX + Math.sin(angle) * arrowLen;
  const tipY = playerY + Math.cos(angle) * arrowLen;
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(
    playerX + Math.sin(angle + 2.5) * 5,
    playerY + Math.cos(angle + 2.5) * 5
  );
  ctx.lineTo(
    playerX + Math.sin(angle - 2.5) * 5,
    playerY + Math.cos(angle - 2.5) * 5
  );
  ctx.closePath();
  ctx.fillStyle = '#ff4444';
  ctx.fill();
}

function isLightColor(hex) {
  if (!hex) return false;
  const c = hex.replace('#', '');
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 140;
}
