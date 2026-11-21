// renderer.js — draws both panels from the painters, then the game
// layer on top of each: found-difference rings, the hint pulse, click
// flashes and the keyboard reticle. Identical on both panels, because a
// difference lives at the same coordinates in the original and the copy.

import { PANEL_W, PANEL_H, paintScene } from './painter.js';
import { currentLevel } from './state.js';

const RING = '#ff5722';
const RING_HALO = '#ffffff';

function drawRing(ctx, x, y, r, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = RING_HALO;
  ctx.lineWidth = 7;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = RING;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fillStyle = RING;
  ctx.fill();
  ctx.restore();
}

function drawMiss(ctx, x, y, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#e11d48';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 12);
  ctx.lineTo(x + 12, y + 12);
  ctx.moveTo(x + 12, y - 12);
  ctx.lineTo(x - 12, y + 12);
  ctx.stroke();
  ctx.restore();
}

function drawReticle(ctx, x, y) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, 18, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 5]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(x, y, 18, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(20,20,30,0.8)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 26, y);
  ctx.lineTo(x - 12, y);
  ctx.moveTo(x + 12, y);
  ctx.lineTo(x + 26, y);
  ctx.moveTo(x, y - 26);
  ctx.lineTo(x, y - 12);
  ctx.moveTo(x, y + 12);
  ctx.lineTo(x, y + 26);
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();
}

export function renderPanels(leftCtx, rightCtx, state, now) {
  const level = currentLevel(state);
  const changedIds = new Set(level.differences.map((d) => d.id));
  paintScene(leftCtx, level.scene, new Set());
  paintScene(rightCtx, level.scene, changedIds);

  const panels = [leftCtx, rightCtx];
  const age = (born) => Math.max(0, now - born);
  for (const ctx of panels) {
    // Found rings: the satisfying mark on every found difference.
    for (const diff of level.differences) {
      if (state.found.has(diff.id)) drawRing(ctx, diff.x, diff.y, diff.r, 1);
    }
    // Hint pulse around the hinted difference, while it lasts.
    if (state.hintTarget && now < state.hintUntil) {
      const pulse = 1 + 0.12 * Math.sin(now / 130);
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(state.hintTarget.x, state.hintTarget.y, state.hintTarget.r * pulse + 6, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffd54a';
      ctx.lineWidth = 5;
      ctx.setLineDash([10, 7]);
      ctx.stroke();
      ctx.restore();
    }
    // Click flashes fade over 650 ms.
    state.flashes = state.flashes.filter((f) => age(f.born) < 650);
    for (const flash of state.flashes) {
      const alpha = 1 - age(flash.born) / 650;
      if (flash.kind === 'found') {
        drawRing(ctx, flash.x, flash.y, flash.r ?? 26, alpha);
        const grow = 26 + age(flash.born) / 14;
        ctx.save();
        ctx.globalAlpha = alpha * 0.7;
        ctx.beginPath();
        ctx.arc(flash.x, flash.y, grow, 0, Math.PI * 2);
        ctx.strokeStyle = RING;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      } else {
        drawMiss(ctx, flash.x, flash.y, alpha);
      }
    }
    // Keyboard reticle, mirrored on both panels.
    if (state.reticleVisible && state.screen === 'playing') {
      drawReticle(ctx, state.reticle.x, state.reticle.y);
    }
  }
  void PANEL_W;
  void PANEL_H;
}
