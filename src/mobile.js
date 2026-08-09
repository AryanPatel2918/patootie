/**
 * Mobile touch controls:
 * - Left side of screen: virtual joystick for movement
 * - Right side of screen: touch drag to look around
 */

const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  || (navigator.maxTouchPoints > 0 && window.innerWidth < 1024);

export function isMobileDevice() {
  return isMobile;
}

// Touch look state
let lookTouchId = null;
let lookStartX = 0;
let lookStartY = 0;
let lookYaw = 0;
let lookPitch = 0;

// Joystick state
let joystickTouchId = null;
let joystickStartX = 0;
let joystickStartY = 0;
let joystickDeltaX = 0;
let joystickDeltaY = 0;
const joystickMaxRadius = 50;

// DOM elements
let joystickBase, joystickThumb;

export function setupMobileControls(camera) {
  if (!isMobile) return;

  // Create joystick UI
  const container = document.createElement('div');
  container.id = 'joystick-container';
  container.innerHTML = `
    <div id="joystick-base">
      <div id="joystick-thumb"></div>
    </div>
  `;
  document.body.appendChild(container);

  joystickBase = document.getElementById('joystick-base');
  joystickThumb = document.getElementById('joystick-thumb');

  // Initialize look from camera
  lookYaw = camera.rotation.y;
  lookPitch = camera.rotation.x;

  // Touch events
  document.addEventListener('touchstart', onTouchStart, { passive: false });
  document.addEventListener('touchmove', onTouchMove, { passive: false });
  document.addEventListener('touchend', onTouchEnd, { passive: false });
  document.addEventListener('touchcancel', onTouchEnd, { passive: false });
}

function onTouchStart(e) {
  e.preventDefault();
  for (const touch of e.changedTouches) {
    const x = touch.clientX;
    const screenMid = window.innerWidth / 2;

    if (x < screenMid && joystickTouchId === null) {
      // Left side — joystick
      joystickTouchId = touch.identifier;
      joystickStartX = touch.clientX;
      joystickStartY = touch.clientY;
      joystickDeltaX = 0;
      joystickDeltaY = 0;

      joystickBase.style.left = (touch.clientX - 40) + 'px';
      joystickBase.style.top = (touch.clientY - 40) + 'px';
      joystickBase.style.display = 'block';
      joystickThumb.style.transform = 'translate(0px, 0px)';
    } else if (x >= screenMid && lookTouchId === null) {
      // Right side — look
      lookTouchId = touch.identifier;
      lookStartX = touch.clientX;
      lookStartY = touch.clientY;
    }
  }
}

function onTouchMove(e) {
  e.preventDefault();
  for (const touch of e.changedTouches) {
    if (touch.identifier === joystickTouchId) {
      let dx = touch.clientX - joystickStartX;
      let dy = touch.clientY - joystickStartY;

      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > joystickMaxRadius) {
        dx = (dx / dist) * joystickMaxRadius;
        dy = (dy / dist) * joystickMaxRadius;
      }

      joystickDeltaX = dx / joystickMaxRadius;
      joystickDeltaY = dy / joystickMaxRadius;

      joystickThumb.style.transform = `translate(${dx}px, ${dy}px)`;
    }

    if (touch.identifier === lookTouchId) {
      const dx = touch.clientX - lookStartX;
      const dy = touch.clientY - lookStartY;

      lookYaw -= dx * 0.004;
      lookPitch -= dy * 0.003;
      lookPitch = Math.max(-1.2, Math.min(1.2, lookPitch));

      lookStartX = touch.clientX;
      lookStartY = touch.clientY;
    }
  }
}

function onTouchEnd(e) {
  for (const touch of e.changedTouches) {
    if (touch.identifier === joystickTouchId) {
      joystickTouchId = null;
      joystickDeltaX = 0;
      joystickDeltaY = 0;
      joystickBase.style.display = 'none';
    }
    if (touch.identifier === lookTouchId) {
      lookTouchId = null;
    }
  }
}

/**
 * Get mobile movement input (-1 to 1)
 */
export function getMobileMovement() {
  return {
    x: joystickDeltaX,
    z: -joystickDeltaY,
  };
}

/**
 * Apply mobile look rotation to camera
 */
export function applyMobileLook(camera) {
  camera.rotation.order = 'YXZ';
  camera.rotation.y = lookYaw;
  camera.rotation.x = lookPitch;
}
