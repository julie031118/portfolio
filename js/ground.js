/* Vellum ground — the moodboard look: a photograph seen through translucent paper.
   One blurred photo per section sits under a frosted, grainy paper layer and crossfades as you scroll.
   Sections themselves are transparent so the colour bleeds through everywhere. */

export const GROUND = {
  intro: 'images/ground/01-intro.jpg',     /* lavender flowers on sheet music */
  work: 'images/ground/02-work.jpg',       /* white wool, denim, red leaves */
  name: 'images/ground/03-name.jpg',       /* porcelain flower on the form */
  about: 'images/ground/04-about.jpg',     /* CHIC record, warm brown */
  archive: 'images/ground/05-archive.jpg', /* silhouette triptych, black / white / green */
  contact: 'images/ground/06-contact.jpg', /* fashion show, brick and white */
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
