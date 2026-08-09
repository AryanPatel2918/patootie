import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { createGallery } from './gallery.js';
import { setupArtworks, checkArtworkProximity } from './artworks.js';
import { updateMinimap } from './minimap.js';
import { ROOMS } from './config.js';
import { isMobileDevice, setupMobileControls, getMobileMovement, applyMobileLook } from './mobile.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
// Start inside 'Grand Lobby' room (center [-15, -14])
camera.position.set(-15, 1.65, -14);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = false;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Detect mobile
const mobile = isMobileDevice();

// Controls - desktop uses PointerLock, mobile uses touch
let controls = null;
let isActive = false;

if (!mobile) {
  controls = new PointerLockControls(camera, renderer.domElement);
}

// Movement state
const movement = { forward: false, backward: false, left: false, right: false };
const clock = new THREE.Clock();

// Wall collision meshes
let wallColliders = [];

// Blocker UI
const blocker = document.getElementById('blocker');
const crosshair = document.getElementById('crosshair');

if (mobile) {
  // Update instructions for mobile
  const controlsInfo = blocker.querySelector('.controls-info');
  if (controlsInfo) {
    controlsInfo.innerHTML = 'Left side: Drag to move<br/>Right side: Drag to look';
  }
  const enterText = blocker.querySelector('#instructions p');
  if (enterText) enterText.textContent = 'Tap to enter';

  blocker.addEventListener('click', () => {
    blocker.classList.add('hidden');
    crosshair.style.display = 'block';
    isActive = true;
    setupMobileControls(camera);
  });
} else {
  blocker.addEventListener('click', () => {
    controls.lock();
  });

  controls.addEventListener('lock', () => {
    blocker.classList.add('hidden');
    crosshair.style.display = 'block';
    isActive = true;
  });

  controls.addEventListener('unlock', () => {
    blocker.classList.remove('hidden');
    crosshair.style.display = 'none';
    isActive = false;
  });
}

// Keyboard events (desktop)
document.addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'KeyW': case 'ArrowUp': movement.forward = true; break;
    case 'KeyS': case 'ArrowDown': movement.backward = true; break;
    case 'KeyA': case 'ArrowLeft': movement.left = true; break;
    case 'KeyD': case 'ArrowRight': movement.right = true; break;
  }
});

document.addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'KeyW': case 'ArrowUp': movement.forward = false; break;
    case 'KeyS': case 'ArrowDown': movement.backward = false; break;
    case 'KeyA': case 'ArrowLeft': movement.left = false; break;
    case 'KeyD': case 'ArrowRight': movement.right = false; break;
  }
});

// Build the gallery
wallColliders = createGallery(scene);

// Place artworks
setupArtworks(scene);

// Room label tracking
let currentRoomName = '';
const roomLabel = document.getElementById('room-label');
let labelTimeout = null;

function checkRoom() {
  const px = camera.position.x;
  const pz = camera.position.z;

  for (const room of ROOMS) {
    const dx = px - room.center[0];
    const dz = pz - room.center[1];
    if (Math.abs(dx) < room.width / 2 && Math.abs(dz) < room.depth / 2) {
      if (room.name !== currentRoomName) {
        currentRoomName = room.name;
        roomLabel.textContent = room.name;
        roomLabel.classList.remove('hidden');
        clearTimeout(labelTimeout);
        labelTimeout = setTimeout(() => roomLabel.classList.add('hidden'), 2500);
      }
      return;
    }
  }
}

// Collision detection
const raycaster = new THREE.Raycaster();
const collisionDistance = 0.5;

function checkCollision(moveDir) {
  raycaster.set(camera.position, moveDir);
  raycaster.far = collisionDistance;
  const hits = raycaster.intersectObjects(wallColliders);
  return hits.length > 0;
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.1);
  const shouldUpdate = mobile ? isActive : (controls && controls.isLocked);

  if (shouldUpdate) {
    const speed = 4.0;
    let dirX = 0;
    let dirZ = 0;

    if (mobile) {
      // Apply touch look
      applyMobileLook(camera);

      // Get joystick input
      const mobileInput = getMobileMovement();
      dirX = mobileInput.x;
      dirZ = mobileInput.z;
    } else {
      // Keyboard input
      dirZ = Number(movement.forward) - Number(movement.backward);
      dirX = Number(movement.right) - Number(movement.left);
    }

    // Normalize if both axes active
    const len = Math.sqrt(dirX * dirX + dirZ * dirZ);
    if (len > 1) {
      dirX /= len;
      dirZ /= len;
    }

    // Get camera direction vectors
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    // Calculate move vector
    const moveVec = new THREE.Vector3();
    moveVec.addScaledVector(forward, dirZ * speed * delta);
    moveVec.addScaledVector(right, dirX * speed * delta);

    // Apply movement with collision
    if (moveVec.length() > 0.001) {
      const moveDir = moveVec.clone().normalize();
      if (!checkCollision(moveDir)) {
        camera.position.add(moveVec);
      } else {
        // Try sliding along walls
        const slideX = new THREE.Vector3(moveVec.x, 0, 0);
        if (slideX.length() > 0.001 && !checkCollision(slideX.clone().normalize())) {
          camera.position.add(slideX);
        }
        const slideZ = new THREE.Vector3(0, 0, moveVec.z);
        if (slideZ.length() > 0.001 && !checkCollision(slideZ.clone().normalize())) {
          camera.position.add(slideZ);
        }
      }
    }

    // Keep camera at eye height
    camera.position.y = 1.65;

    checkRoom();
    checkArtworkProximity(camera);
    updateMinimap(camera);
  }

  renderer.render(scene, camera);
}

animate();

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
