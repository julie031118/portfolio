import { storageGet, storageSet } from './sections/render-shell.js';
const SOUND_KEY = 'yeonseo-sound';
let context = null;
let noiseBuffer = null;
let enabled = storageGet('localStorage', SOUND_KEY) === 'on';

export function getSoundEnabled() {
  return enabled;
}

function createContext() {
  if (context) return true;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return false;
  context = new AudioContextClass();
  noiseBuffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.4), context.sampleRate);
  const channel = noiseBuffer.getChannelData(0);
  for (let i = 0; i < channel.length; i += 1) channel[i] = Math.random() * 2 - 1;
  return true;
}

/* Safari starts or resumes audio only inside a click, key or touch handler; scrolling and pointer movement don't
   count. A visitor whose SOUND was left on from an earlier visit heard nothing, because nothing ever made the
   context (2026-10-05). The first real gesture, and any later one after Safari suspends it, brings sound back. */
function wakeAudio() {
  if (!enabled || !createContext()) return;
  if (context.state !== 'running') context.resume().catch(() => { /* tried again on the next gesture */ });
}
['pointerdown', 'keydown', 'touchend', 'click'].forEach((type) => window.addEventListener(type, wakeAudio, { capture: true, passive: true }));

export async function unlockAudio() {
  if (!createContext()) return false;
  if (context.state !== 'running') await context.resume();
  if (storageGet('localStorage', SOUND_KEY) === null) setSoundEnabled(true);
  return true;
}

/* ambient music: an mp3 named in SITE.sound.ambient, looped quietly while sound is on */
let ambient = null;
function ambientTrack() {
  const source = window.SITE?.sound?.ambient;
  if (!source) return null;
  if (!ambient) {
    ambient = new Audio(source);
    ambient.loop = true;
    ambient.preload = 'none';
    ambient.volume = 0.35;
  }
  return ambient;
}
function syncAmbient() {
  const track = ambientTrack();
  if (!track) return;
  if (enabled && !document.hidden) track.play().catch(() => { /* needs a gesture first — the SOUND button gives one */ });
  else track.pause();
}

export function setSoundEnabled(next) {
  enabled = Boolean(next);
  storageSet('localStorage', SOUND_KEY, enabled ? 'on' : 'off');
  syncAmbient();
  window.dispatchEvent(new CustomEvent('portfolio:soundchange', { detail: enabled }));
}

export async function toggleSound() {
  const next = !enabled;
  if (next) await unlockAudio(); /* also resumes a context Safari suspended */
  setSoundEnabled(next);
  return enabled;
}

/* Interaction sounds (2026-10-03, 연서: the typing was only audible at full volume and too busy).
   All synthesised (no files), all gated by the SOUND toggle, each with its own minimum gap so fast
   scrolling or a quick pointer never turns into a buzz. */
const lastPlayed = {};
function ready(name, gapMs) {
  if (!enabled || !context || context.state !== 'running' || document.hidden || !noiseBuffer) return false;
  const now = performance.now();
  if (now - (lastPlayed[name] || 0) < gapMs) return false;
  lastPlayed[name] = now;
  return true;
}
function burst(now, { freq, q = 1.2, gain, length, type = 'bandpass', rate = 1 }) {
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const amp = context.createGain();
  source.buffer = noiseBuffer;
  source.playbackRate.value = rate;
  filter.type = type; filter.frequency.value = freq; filter.Q.value = q;
  amp.gain.setValueAtTime(gain, now);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + length);
  source.connect(filter).connect(amp).connect(context.destination);
  source.start(now); source.stop(now + length + 0.01);
}
function tone(now, { from, to = from, gain, length, type = 'sine' }) {
  const osc = context.createOscillator();
  const amp = context.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, now);
  if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, now + length);
  amp.gain.setValueAtTime(0.0001, now);
  amp.gain.exponentialRampToValueAtTime(gain, now + 0.004);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + length);
  osc.connect(amp).connect(context.destination);
  osc.start(now); osc.stop(now + length + 0.02);
}

/* typewriter key: a sharp click with a little body under it; at most one every 120 ms */
export function typeClick() {
  if (!ready('type', 120)) return;
  const now = context.currentTime;
  burst(now, { freq: 1500 + Math.random() * 500, q: 1.3, gain: 0.42, length: 0.018, rate: 0.92 + Math.random() * 0.18 });
  tone(now, { from: 150 + Math.random() * 30, gain: 0.16, length: 0.03, type: 'triangle' });
}

/* the ring: a soft wooden tick each time a new card comes to the front */
export function ringTick() {
  if (!ready('ring', 80)) return;
  const now = context.currentTime;
  tone(now, { from: 1150 + Math.random() * 120, to: 900, gain: 0.12, length: 0.05, type: 'triangle' });
  burst(now, { freq: 3200, q: 2, gain: 0.05, length: 0.012 });
}

/* the glass drop appearing over a photo: a small rising plip */
export function dropPlip() {
  if (!ready('drop', 450)) return;
  const now = context.currentTime;
  tone(now, { from: 520, to: 1250, gain: 0.16, length: 0.09 });
  tone(now + 0.012, { from: 1900, to: 2300, gain: 0.035, length: 0.05 });
}

/* the name's water (2026-10-05, 연서: the old one sounded like hitting a wall). A wall thud is a sudden low hit; water is
   a soft swell that rises and falls, with a few small droplets on top. So: filtered noise that fades in (no hard attack)
   while its pitch sweeps upward like a ripple spreading, plus one or two quiet droplet blips. Louder and longer with speed. */
function swell(now, { from, to, gain, attack, length, q = 0.9 }) {
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const amp = context.createGain();
  source.buffer = noiseBuffer; source.loop = true;
  filter.type = 'bandpass'; filter.Q.value = q;
  filter.frequency.setValueAtTime(from, now);
  filter.frequency.exponentialRampToValueAtTime(to, now + length);
  amp.gain.setValueAtTime(0.0001, now);
  amp.gain.linearRampToValueAtTime(gain, now + attack);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + length);
  source.connect(filter).connect(amp).connect(context.destination);
  source.start(now); source.stop(now + length + 0.02);
}
export function waterSwish(speed = 10) {
  if (!ready('water', 320)) return;
  const now = context.currentTime;
  const strength = Math.min(1, speed / 40);
  swell(now, { from: 420, to: 1500 + strength * 900, gain: 0.05 + strength * 0.07, attack: 0.07, length: 0.38 + strength * 0.18 });
  const drops = strength > 0.45 ? 2 : 1;
  for (let i = 0; i < drops; i += 1) {
    const at = now + 0.05 + Math.random() * 0.16;
    const base = 700 + Math.random() * 500;
    tone(at, { from: base, to: base * 1.9, gain: 0.025 + strength * 0.02, length: 0.06 });
  }
}

document.addEventListener('visibilitychange', () => {
  syncAmbient();
  if (!context) return;
  if (document.hidden && context.state === 'running') context.suspend();
  if (!document.hidden && enabled && context.state === 'suspended') context.resume();
});
