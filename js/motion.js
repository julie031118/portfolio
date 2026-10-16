/* The phone's "Reduce Motion" setting (iOS: Settings > Accessibility > Motion).
   2026-10-17 (연서): the site moves the same for everyone, that setting included: the ring, the water, the notes, the
   last page, the timeline strip, the videos and the typed intro all run. Every check that used to read
   matchMedia('(prefers-reduced-motion: reduce)') reads this instead; set FOLLOW_SETTING to true to honour it again
   (the CSS blocks for it were taken out at the same time, see styles.css history before 2026-10-17). */
const FOLLOW_SETTING = false;

export const reducedMotion = FOLLOW_SETTING
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : { matches: false, media: 'not all', addEventListener() {}, removeEventListener() {} };
