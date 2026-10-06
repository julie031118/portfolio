import { storageGet, storageSet } from './sections/render-shell.js';
const SOUND_KEY = 'yeonseo-sound';
let context = null;
let noiseBuffer = null;
/* on by default (연서, 2026-10-05): only a visitor who switched it off keeps it off. Browsers still hold every sound until
   the first click, tap or key press (see wakeAudio), so nothing plays before the visitor touches the page. */
let enabled = storageGet('localStorage', SOUND_KEY) !== 'off';

export function getSoundEnabled() {
  return enabled;
}

export function isAudioRunning() {
  return Boolean(context && context.state === 'running');
}

function createContext() {
  if (context) return true;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return false;
  context = new AudioContextClass();
  /* tells the page when sound actually starts, so the "click for sound" hint can go away */
  const announce = () => { if (context.state === 'running') window.dispatchEvent(new Event('portfolio:audioready')); };
  context.addEventListener?.('statechange', announce);
  window.setTimeout(announce, 0);
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
/* and try once right away: where the browser allows sound for this site (Safari set to "Allow All Auto-Play",
   Chrome after repeat visits) it plays from the first line; everywhere else it waits for the first gesture */
if (enabled) { try { if (createContext() && context.state !== 'running') context.resume().catch(() => {}); } catch (error) { /* the first gesture does it */ } }

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

/* the name's water (2026-10-05, 연서: the swell didn't read as water either, just make it a water drop). A drop is a
   short sine that jumps up in pitch with a soft tail; each one gets its own pitch so a moving pointer sounds like
   drops falling, not one note repeating. A fast pointer adds a smaller second drop. */
export function waterSwish(speed = 10) {
  if (!ready('water', 240)) return;
  const now = context.currentTime;
  const strength = Math.min(1, speed / 40);
  const base = 380 + Math.random() * 260;
  tone(now, { from: base, to: base * 2.6, gain: 0.1 + strength * 0.06, length: 0.11 });
  tone(now + 0.006, { from: base * 3.1, to: base * 4.2, gain: 0.018, length: 0.05 });
  if (strength > 0.5) {
    const second = 520 + Math.random() * 300;
    tone(now + 0.07 + Math.random() * 0.05, { from: second, to: second * 2.3, gain: 0.05, length: 0.08 });
  }
}

/* the contact page (2026-10-06, 연서: an ASMR-like sound that follows the cursor). The reveal there is a soft circle
   opening a photo through a grid of dots, so the sound is a brush over fine paper: very quiet, airy high noise grains
   that fade in and out, one every ~70 ms while the cursor moves, louder and brighter with speed, silent when still. */
export function contactBrush(speed = 10) {
  if (!ready('brush', 70)) return;
  const now = context.currentTime;
  const strength = Math.min(1, speed / 45);
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const amp = context.createGain();
  source.buffer = noiseBuffer;
  source.playbackRate.value = 0.85 + Math.random() * 0.3;
  filter.type = 'bandpass'; filter.Q.value = 0.6;
  filter.frequency.value = 3600 + strength * 2800 + Math.random() * 600;
  const length = 0.12 + strength * 0.06;
  amp.gain.setValueAtTime(0.0001, now);
  amp.gain.linearRampToValueAtTime(0.026 + strength * 0.07, now + 0.03); /* 0.018 + 0.05 until 2026-10-06: a little too quiet */
  amp.gain.exponentialRampToValueAtTime(0.0001, now + length);
  source.connect(filter).connect(amp).connect(context.destination);
  source.start(now, Math.random() * 0.2); source.stop(now + length + 0.02);
}

document.addEventListener('visibilitychange', () => {
  syncAmbient();
  if (!context) return;
  if (document.hidden && context.state === 'running') context.suspend();
  if (!document.hidden && enabled && context.state === 'suspended') context.resume();
});
