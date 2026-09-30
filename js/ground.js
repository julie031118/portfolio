/* Vellum ground — the moodboard look: a photograph seen through translucent paper.
   One blurred photo per section sits under a frosted, grainy paper layer and crossfades as you scroll.
   Sections themselves are transparent so the colour bleeds through everywhere. */

export const GROUND = {
  intro: 'images/projects/kaftan/18.jpg',          /* lavender + cream — the silk moodboard */
  work: 'images/projects/denim-2026/03.jpg',       /* indigo, concrete */
  name: 'images/projects/arts-week-2026/06.jpg',   /* lace over green */
  about: 'images/projects/art2wear/02.jpg',        /* brick, warm */
  archive: 'images/projects/kaftan/16.jpg',        /* purple silk outdoors */
  contact: 'images/projects/ai-short-film/05.jpg', /* blue + pink */
};

export function initGround() {
  if (document.querySelector('.ground')) return;
  const root = document.createElement('div');
  root.className = 'ground';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = '<img class="ground-photo" alt="" decoding="async"><img class="ground-photo" alt="" decoding="async"><div class="ground-vellum"></div>';
  document.body.prepend(root);
  const photos = [...root.querySelectorAll('.ground-photo')];
  let active = 0;
  let current = '';

  function show(source) {
    if (source === current) return;
    current = source;
    const next = photos[1 - active];
    const previous = photos[active];
    const swap = () => {
      if (next.src.endsWith(source) === false) return; /* a newer request won */
      next.classList.add('is-on');
      previous.classList.remove('is-on');
      active = 1 - active;
    };
    next.onload = swap;
    next.src = source;
    if (next.complete && next.naturalWidth) swap();
  }

  /* the section whose box crosses the viewport centre decides the photo */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const key = entry.target.dataset.section;
      if (GROUND[key]) show(GROUND[key]);
    });
  }, { rootMargin: '-48% 0px -48% 0px', threshold: 0 });
  document.querySelectorAll('.site-section').forEach((section) => observer.observe(section));
  show(GROUND.intro);
  return { show, GROUND };
}
