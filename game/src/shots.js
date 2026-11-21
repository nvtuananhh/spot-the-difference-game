// shots.js — deterministic screenshot states, honoured from the query
// string: ?shot=start|play|end&seed=1[&level=1..3]. The same seed always
// renders the same frame: found differences are fixed subsets, the
// timer is frozen at a fixed value, and no animation phase is sampled,
// so two runs with the same seed produce identical screenshots.

import { LEVELS } from './levels.js';
import { freshState, mulberry32 } from './state.js';

export function parseShotQuery(search) {
  const params = new URLSearchParams(search);
  return {
    shot: params.get('shot'),
    seed: Number(params.get('seed') ?? '1') || 1,
    level: Math.min(Math.max(Number(params.get('level') ?? '2') || 2, 1), LEVELS.length),
  };
}

export function applyShotState(state, query) {
  const { shot, seed, level } = query;
  if (!shot) return false;
  state.frozen = true;
  state.rng = mulberry32(seed);
  if (shot === 'start') {
    const fresh = freshState();
    Object.assign(state, fresh, { frozen: true, rng: mulberry32(seed) });
    state.screen = 'start';
    state.roundIndex = 0;
    state.timeLeft = LEVELS[0].time;
    state.hintsLeft = LEVELS[0].hints;
    return true;
  }
  if (shot === 'play') {
    const roundIndex = level - 1;
    const lvl = LEVELS[roundIndex];
    state.screen = 'playing';
    state.roundIndex = roundIndex;
    // A genuine mid-game state: some found (ringed), several still
    // unfound, and the counter showing exactly how many remain.
    const foundCount = Math.max(2, Math.floor(lvl.differences.length / 2) - 1);
    state.found = new Set(lvl.differences.slice(0, foundCount).map((d) => d.id));
    state.totalFound = state.found.size;
    state.mistakes = 1;
    state.score = foundCount * 100 - 25 + 240;
    state.hintsLeft = Math.max(1, lvl.hints - 1);
    state.timeLeft = Math.round(lvl.time * 0.62);
    state.message = `${lvl.differences.length - foundCount} differences still hiding — keep looking!`;
    return true;
  }
  if (shot === 'end') {
    const last = LEVELS[LEVELS.length - 1];
    state.screen = 'gameComplete';
    state.roundIndex = LEVELS.length - 1;
    state.found = new Set(last.differences.map((d) => d.id));
    state.totalFound = LEVELS.reduce((sum, l) => sum + l.differences.length, 0);
    state.score = 2480;
    state.mistakes = 2;
    state.hintsLeft = 1;
    state.timeLeft = 41;
    state.message = 'You found them all!';
    return true;
  }
  return false;
}
