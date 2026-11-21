// input.js — mouse clicks on either panel, and full keyboard play: the
// arrow keys move one reticle that is mirrored on both pictures, Enter
// or Space selects at the reticle, and H / R / P / M are the shortcuts.
// Coordinates are converted from the displayed canvas box to the
// 600×440 scene coordinates, so clicks stay exact at any window size.

import { PANEL_W, PANEL_H } from './painter.js';

export function canvasPoint(canvas, clientX, clientY) {
  const box = canvas.getBoundingClientRect();
  return {
    x: ((clientX - box.left) / box.width) * PANEL_W,
    y: ((clientY - box.top) / box.height) * PANEL_H,
  };
}

export function attachPointer(canvasLeft, canvasRight, state, onSelect) {
  for (const canvas of [canvasLeft, canvasRight]) {
    canvas.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      state.reticleVisible = false;
      const point = canvasPoint(canvas, event.clientX, event.clientY);
      onSelect(point.x, point.y);
    });
    canvas.addEventListener('pointermove', (event) => {
      const point = canvasPoint(canvas, event.clientX, event.clientY);
      canvas.style.cursor = 'crosshair';
      void point;
    });
  }
}

const STEP = 18;
const FINE_STEP = 5;

export function attachKeyboard(state, actions) {
  window.addEventListener('keydown', (event) => {
    if (event.repeat && !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.code)) return;
    const step = event.shiftKey ? FINE_STEP : STEP;
    switch (event.code) {
      case 'ArrowLeft':
        state.reticle.x = Math.max(0, state.reticle.x - step);
        state.reticleVisible = true;
        event.preventDefault();
        break;
      case 'ArrowRight':
        state.reticle.x = Math.min(PANEL_W, state.reticle.x + step);
        state.reticleVisible = true;
        event.preventDefault();
        break;
      case 'ArrowUp':
        state.reticle.y = Math.max(0, state.reticle.y - step);
        state.reticleVisible = true;
        event.preventDefault();
        break;
      case 'ArrowDown':
        state.reticle.y = Math.min(PANEL_H, state.reticle.y + step);
        state.reticleVisible = true;
        event.preventDefault();
        break;
      case 'Enter':
      case 'Space':
        if (state.screen === 'playing') {
          state.reticleVisible = true;
          actions.select(state.reticle.x, state.reticle.y);
          event.preventDefault();
        } else if (state.screen === 'start') {
          actions.start();
          event.preventDefault();
        }
        break;
      case 'KeyH':
        actions.hint();
        break;
      case 'KeyR':
        actions.restartRound();
        break;
      case 'KeyP':
      case 'Escape':
        actions.pause();
        break;
      case 'KeyM':
        actions.mute();
        break;
      case 'Tab':
        // Tab moves the reticle between the panels' shared scene space in
        // coarse jumps, so keyboard-only players can sweep the picture.
        state.reticle.x = (state.reticle.x + 150) % (PANEL_W + 1);
        state.reticleVisible = true;
        event.preventDefault();
        break;
      default:
        break;
    }
  });
}
