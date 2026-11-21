// state.js — the whole game state in one plain object plus the small,
// testable rules that move it: scoring, hints, the countdown and the
// seeded random choice a hint uses. No DOM and no canvas in here.

import { LEVELS } from './levels.js';

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function freshState() {
  return {
    screen: 'start', // start | playing | paused | roundComplete | gameComplete | roundFailed
    roundIndex: 0,
    found: new Set(),
    mistakes: 0,
    score: 0,
    hintsLeft: LEVELS[0].hints,
    timeLeft: LEVELS[0].time,
    totalFound: 0,
    roundsCleared: 0,
    reticle: { x: 300, y: 220 },
    reticleVisible: false,
    muted: false,
    hintTarget: null,
    hintUntil: 0,
    flashes: [], // {x, y, kind: 'found'|'miss', born}
    message: 'Click a difference in either picture — it counts on both.',
    rng: mulberry32(1),
    frozen: false, // screenshot states never tick
    startedAt: 0,
  };
}

export function currentLevel(state) {
  return LEVELS[state.roundIndex];
}

export function remainingCount(state) {
  return currentLevel(state).differences.length - state.found.size;
}

export function startRound(state, roundIndex) {
  state.roundIndex = roundIndex;
  state.screen = 'playing';
  state.found = new Set();
  state.mistakes = 0;
  state.hintsLeft = currentLevel(state).hints;
  state.timeLeft = currentLevel(state).time;
  state.hintTarget = null;
  state.flashes = [];
  state.reticle = { x: 300, y: 220 };
  state.message = currentLevel(state).blurb;
}

export function startGame(state) {
  state.score = 0;
  state.totalFound = 0;
  state.roundsCleared = 0;
  startRound(state, 0);
}

export function differenceAt(state, x, y) {
  const within = (d) => {
    const dx = d.x - x;
    const dy = d.y - y;
    return dx * dx + dy * dy <= d.r * d.r;
  };
  // Unfound differences win over already-found ones, so a small
  // difference nested inside a bigger one's hit zone stays clickable.
  return (
    currentLevel(state).differences.find((d) => !state.found.has(d.id) && within(d)) ??
    currentLevel(state).differences.find((d) => within(d))
  );
}

export function applyClick(state, x, y, now) {
  if (state.screen !== 'playing') return null;
  const diff = differenceAt(state, x, y);
  if (diff && !state.found.has(diff.id)) {
    state.found.add(diff.id);
    state.totalFound += 1;
    state.score += 100;
    state.flashes.push({ x: diff.x, y: diff.y, kind: 'found', born: now });
    state.message = `Found it! ${diff.label} — ${remainingCount(state)} to go.`;
    if (remainingCount(state) === 0) {
      const bonus = Math.round(state.timeLeft) * 2;
      state.score += bonus;
      state.roundsCleared += 1;
      state.screen = state.roundIndex === LEVELS.length - 1 ? 'gameComplete' : 'roundComplete';
      state.message = bonus > 0 ? `Round clear! Time bonus +${bonus}.` : 'Round clear!';
    }
    return { kind: 'found', diff };
  }
  if (diff && state.found.has(diff.id)) {
    state.message = 'Already found — that one is ringed.';
    return { kind: 'already', diff };
  }
  state.mistakes += 1;
  state.score = Math.max(0, state.score - 25);
  state.flashes.push({ x, y, kind: 'miss', born: now });
  state.message = 'Not a difference. −25 points — look again.';
  return { kind: 'miss' };
}

export function useHint(state, now) {
  if (state.screen !== 'playing' || state.hintsLeft <= 0) return null;
  const unfound = currentLevel(state).differences.filter((d) => !state.found.has(d.id));
  if (unfound.length === 0) return null;
  const pick = unfound[Math.floor(state.rng() * unfound.length)];
  state.hintsLeft -= 1;
  state.score = Math.max(0, state.score - 50);
  state.hintTarget = pick;
  state.hintUntil = now + 2500;
  state.message = `Hint: look near the ${pick.label.toLowerCase()}… (−50)`;
  return pick;
}

export function tickTimer(state, dtSeconds) {
  if (state.screen !== 'playing' || state.frozen) return;
  state.timeLeft -= dtSeconds;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.screen = 'roundFailed';
    state.message = 'Time ran out. Try the round again — the pictures have not changed.';
  }
}

export function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function starsFor(state) {
  if (state.mistakes === 0 && state.hintsLeft === currentLevel(state).hints) return 3;
  if (state.mistakes <= 2) return 2;
  return 1;
}
