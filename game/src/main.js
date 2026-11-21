// main.js — boot and the game loop. Wires the state, renderer, HUD,
// input and sound together, runs the countdown inside
// requestAnimationFrame, and exposes a small probe (window.__game) that
// scripted playtests use to read the state without touching the DOM.

import { LEVELS } from './levels.js';
import {
  freshState,
  currentLevel,
  startGame,
  startRound,
  applyClick,
  useHint,
  tickTimer,
} from './state.js';
import { renderPanels } from './renderer.js';
import { updateHud, showOverlay } from './hud.js';
import { attachPointer, attachKeyboard } from './input.js';
import { playSound, ensureAudio } from './audio.js';
import { parseShotQuery, applyShotState } from './shots.js';

const canvasLeft = document.getElementById('panel-left');
const canvasRight = document.getElementById('panel-right');
const ctxLeft = canvasLeft.getContext('2d');
const ctxRight = canvasRight.getContext('2d');

const state = freshState();

const els = {
  roundName: document.getElementById('round-name'),
  roundPill: document.getElementById('round-pill'),
  score: document.getElementById('score'),
  mistakes: document.getElementById('mistakes'),
  hintsLeft: document.getElementById('hints-left'),
  remaining: document.getElementById('remaining'),
  remainingWord: document.getElementById('remaining-word'),
  timerText: document.getElementById('timer-text'),
  timerFill: document.getElementById('timer-fill'),
  hintButton: document.getElementById('hint-btn'),
  muteButton: document.getElementById('mute-btn'),
  pauseButton: document.getElementById('pause-btn'),
  restartButton: document.getElementById('restart-btn'),
  message: document.getElementById('message'),
  statusLine: document.getElementById('status'),
  overlay: document.getElementById('overlay'),
  overlayBody: document.getElementById('overlay-body'),
  onOverlayAction: handleOverlayAction,
};

function refresh(now) {
  renderPanels(ctxLeft, ctxRight, state, now);
  updateHud(state, els);
  showOverlay(state, els);
}

function selectAt(x, y) {
  ensureAudio();
  const before = state.screen;
  const result = applyClick(state, x, y, performance.now());
  if (!result) return;
  if (result.kind === 'found') playSound('found', state.muted);
  else if (result.kind === 'miss') playSound('miss', state.muted);
  if (state.screen === 'roundComplete') playSound('round', state.muted);
  if (state.screen === 'gameComplete' && before !== 'gameComplete') playSound('win', state.muted);
  refresh(performance.now());
}

function handleOverlayAction(action) {
  ensureAudio();
  playSound('click', state.muted);
  if (action === 'start') {
    startGame(state);
  } else if (action === 'resume') {
    state.screen = 'playing';
  } else if (action === 'next-round') {
    startRound(state, state.roundIndex + 1);
    playSound('round', state.muted);
  } else if (action === 'retry-round') {
    startRound(state, state.roundIndex);
  } else if (action === 'restart-round') {
    startRound(state, state.roundIndex);
  } else if (action === 'restart-game') {
    startGame(state);
  } else if (action === 'play-again') {
    startGame(state);
  }
  refresh(performance.now());
}

const actions = {
  select: selectAt,
  start: () => handleOverlayAction('start'),
  hint: () => {
    const pick = useHint(state, performance.now());
    if (pick) playSound('hint', state.muted);
    refresh(performance.now());
  },
  restartRound: () => {
    if (state.screen === 'playing' || state.screen === 'paused' || state.screen === 'roundFailed') {
      startRound(state, state.roundIndex);
      refresh(performance.now());
    }
  },
  pause: () => {
    if (state.screen === 'playing') state.screen = 'paused';
    else if (state.screen === 'paused') state.screen = 'playing';
    refresh(performance.now());
  },
  mute: () => {
    state.muted = !state.muted;
    refresh(performance.now());
  },
};

attachPointer(canvasLeft, canvasRight, state, selectAt);
attachKeyboard(state, actions);

document.getElementById('hint-btn').addEventListener('click', actions.hint);
document.getElementById('mute-btn').addEventListener('click', actions.mute);
document.getElementById('pause-btn').addEventListener('click', actions.pause);
document.getElementById('restart-btn').addEventListener('click', actions.restartRound);
document.getElementById('start-btn').addEventListener('click', () => handleOverlayAction('start'));

const shotQuery = parseShotQuery(window.location.search);
const inShotMode = applyShotState(state, shotQuery);

let lastFrame = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - lastFrame) / 1000);
  lastFrame = now;
  const previousScreen = state.screen;
  tickTimer(state, dt);
  if (state.screen === 'roundFailed' && previousScreen === 'playing') playSound('fail', state.muted);
  if (state.hintTarget && now > state.hintUntil) state.hintTarget = null;
  renderPanels(ctxLeft, ctxRight, state, now);
  updateHud(state, els);
  if (state.screen !== previousScreen) showOverlay(state, els);
  requestAnimationFrame(frame);
}

refresh(performance.now());
showOverlay(state, els);
if (!inShotMode) {
  requestAnimationFrame(frame);
} else {
  // Screenshot states render one frozen, deterministic frame.
  renderPanels(ctxLeft, ctxRight, state, 1000);
  updateHud(state, els);
  showOverlay(state, els);
}

window.__game = {
  state,
  levels: LEVELS,
  currentLevel: () => currentLevel(state),
  selectAt,
  startGame: () => handleOverlayAction('start'),
  nextRound: () => handleOverlayAction('next-round'),
  hint: actions.hint,
  pause: actions.pause,
};
