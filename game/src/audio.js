// audio.js — every sound is a WebAudio oscillator: no audio files, no
// network, nothing to load. Short envelopes keep the clicks musical
// rather than buzzy, and the mute toggle silences everything at once.

let audioContext = null;

function context() {
  if (audioContext) return audioContext;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  audioContext = new AudioCtx();
  return audioContext;
}

export function ensureAudio() {
  const ctx = context();
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

function tone(freq, start, duration, type, volume, slideTo) {
  const ctx = context();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + start + duration);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration + 0.05);
}

export function playSound(name, muted) {
  if (muted) return;
  ensureAudio();
  switch (name) {
    case 'found':
      tone(660, 0, 0.14, 'sine', 0.18);
      tone(880, 0.09, 0.18, 'sine', 0.18);
      tone(1320, 0.18, 0.22, 'sine', 0.12);
      break;
    case 'miss':
      tone(180, 0, 0.22, 'sawtooth', 0.08, 120);
      break;
    case 'hint':
      tone(1046, 0, 0.12, 'sine', 0.14);
      tone(1318, 0.1, 0.16, 'sine', 0.14);
      break;
    case 'click':
      tone(520, 0, 0.06, 'triangle', 0.1);
      break;
    case 'round':
      tone(523, 0, 0.14, 'sine', 0.16);
      tone(659, 0.12, 0.14, 'sine', 0.16);
      tone(784, 0.24, 0.2, 'sine', 0.16);
      tone(1046, 0.36, 0.3, 'sine', 0.14);
      break;
    case 'win':
      [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => tone(f, i * 0.13, 0.2, 'sine', 0.16));
      break;
    case 'fail':
      tone(392, 0, 0.2, 'sine', 0.14);
      tone(330, 0.18, 0.2, 'sine', 0.14);
      tone(262, 0.36, 0.34, 'sine', 0.14);
      break;
    default:
      break;
  }
}
