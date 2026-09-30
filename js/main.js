import { renderIntro } from './sections/intro.js';
import { renderWork } from './sections/work.js';
import { renderName } from './sections/name.js';
import { renderAbout } from './sections/about.js';
import { renderArchive } from './sections/archive.js';
import { renderContact } from './sections/contact.js';
import { renderDetailShell, closeDetail } from './sections/detail.js';
import { initLoader } from './loader.js';
import { initGround } from './ground.js';
import { getSoundEnabled, setSoundEnabled, toggleSound } from './audio.js';
import { storageGet, storageSet } from './sections/render-shell.js';

const LANG_KEY = 'yeonseo-lang';
/* the site follows the visitor's browser language until they pick one (the intro paragraph opens in English either way) */
const browserLang = /^ko\b/i.test(navigator.language || '') || (navigator.languages || []).slice(0, 1).some((l) => /^ko\b/i.test(l)) ? 'ko' : 'en';
let LANG = storageGet('localStorage', LANG_KEY) || browserLang;
let introController = null;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const T = (value) => value && typeof value === 'object' && 'ko' in value ? (value[LANG] || value.ko) : value;

function toggleLanguage() {
  LANG = LANG === 'ko' ? 'en' : 'ko';
  storageSet('localStorage', LANG_KEY, LANG);
  document.documentElement.lang = LANG;
  renderNav();
  renderLaterSections(); /* the intro paragraph keeps its own en / ko */
  window.dispatchEvent(new CustomEvent('portfolio:languagechange', { detail: LANG }));
}

async function toggleSiteSound() {
  await toggleSound();
  renderNav();
}

function renderNav() {
  const nav = document.querySelector('#nav');
  nav.innerHTML = '';
  const wordmark = document.createElement('a'); wordmark.className = 'nav-wordmark'; wordmark.href = '#intro'; wordmark.textContent = SITE.nav.wordmark;
  const actions = document.createElement('div'); actions.className = 'nav-actions';
  SITE.nav.links.forEach((item, index) => {
    const link = document.createElement('a'); link.className = 'nav-link'; link.href = item.target; link.textContent = item.label; actions.append(link);
    if (index < SITE.nav.links.length - 1) { const divider = document.createElement('span'); divider.className = 'nav-divider'; divider.textContent = '·'; actions.append(divider); }
  });
  const language = document.createElement('button'); language.className = 'nav-toggle'; language.type = 'button'; language.setAttribute('aria-label', SITE.nav.languageAria); language.textContent = T(SITE.nav.language);
  language.addEventListener('click', toggleLanguage);
  const sound = document.createElement('button'); sound.className = 'nav-toggle'; sound.type = 'button'; sound.setAttribute('aria-label', SITE.nav.soundAria); sound.textContent = getSoundEnabled() ? SITE.nav.soundOn : SITE.nav.soundOff;
  sound.addEventListener('click', toggleSiteSound);
  actions.append(language, sound); nav.append(wordmark, actions);
}

function renderLaterSections() { renderWork(LANG); renderName(LANG); renderAbout(LANG); renderArchive(LANG); renderContact(LANG); }

function initScroll() {
  if (!window.Lenis || !window.gsap || !window.ScrollTrigger || reduced) return;
  const lenis = new Lenis({ smoothWheel: true, lerp: .1 });
  gsap.registerPlugin(ScrollTrigger, Flip);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  window.__lenis = lenis;
}

function initNavState() {
  const sync = () => document.querySelector('#nav')?.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', sync, { passive: true }); sync();
}

document.documentElement.lang = LANG;
window.__webglLog = window.__webglLog || [];
window.__siteActions = { toggleLanguage, toggleSound: toggleSiteSound, getLanguage: () => LANG };
initGround(); renderNav(); renderDetailShell(); renderLaterSections(); introController = renderIntro(LANG); initNavState();
window.addEventListener('portfolio:soundchange', renderNav);
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !document.querySelector('#detail')?.hidden) closeDetail(); });
function startRuntime() {
  initScroll();
  initLoader({ host: introController.host, onComplete: () => { introController.start(); window.__introReady = true; window.dispatchEvent(new Event('portfolio:intro-ready')); window.ScrollTrigger?.refresh(); }, onGesture: () => { setSoundEnabled(true); renderNav(); } });
}

if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', startRuntime, { once: true });
else startRuntime();
