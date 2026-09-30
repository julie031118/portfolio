import { storageGet, storageSet } from './sections/render-shell.js';
const SOUND_KEY = 'yeonseo-sound';
let context = null;
let noiseBuffer = null;
let enabled = storageGet('localStorage', SOUND_KEY) === 'on';

export function getSoundEnabled() {
  return enabled;
}

export async function unlockAudio() {
  if (!context) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return false;
    context = new AudioContextClass();
    noiseBuffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.02), context.sampleRate);
    const channel = noiseBuffer.getChannelData(0);
    for (let i = 0; i < channel.length; i += 1) channel[i] = Math.random() * 2 - 1;
  }
  if (context.state === 'suspended') await context.resume();
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
  if (!context && next) await unlockAudio();
  setSoundEnabled(next);
  return enabled;
}

export function typeClick() {
  if (!enabled || !context || context.state !== 'running' || document.hidden || !noiseBuffer) return;
  const now = context.currentTime;
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = noiseBuffer;
  source.playbackRate.value = 0.92 + Math.random() * 0.18;
  filter.type = 'bandpass';
  filter.frequency.value = 1450 + Math.random() * 500;
  filter.Q.value = 1.4;
  gain.gain.setValueAtTime(0.063, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.01);
  source.connect(filter).connect(gain).connect(context.destination);
  source.start(now);
  source.stop(now + 0.012);
}

document.addEventListener('visibilitychange', () => {
  syncAmbient();
  if (!context) return;
  if (document.hidden && context.state === 'running') context.suspend();
  if (!document.hidden && enabled && context.state === 'suspended') context.resume();
});
