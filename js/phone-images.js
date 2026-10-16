/* Phones get lighter copies of the photos the main page shows first (2026-10-17, 연서: "make the phone version as
   light as you can"): the card photos of SELECTED and ARCHIVE, sized so the 3:4 card crop is still 600 x 800, the
   blurred section backgrounds at 560px wide, and a few About and NOW photos at 720px. 28 files, 5.1 MB → 2.0 MB.
   They live under images/m/ with the same path (images/projects/a/b.jpg → images/m/projects/a/b.jpg,
   img/x.jpg → images/m/img/x.jpg). Only the paths listed here have a copy; anything else keeps its original. */

export const phoneQuery = window.matchMedia('(max-width: 600px), (hover: none)');

const SMALL = new Set(/* @phone-list */[
  "images/ground/01-intro.jpg",
  "images/ground/02-work.jpg",
  "images/ground/03-name.jpg",
  "images/ground/04-about.jpg",
  "images/ground/05-archive.jpg",
  "images/now/weave-3x3.jpg",
  "images/projects/adaptive-textile/ad01.jpg",
  "images/projects/art2wear/a02.jpg",
  "images/projects/arts-week-2026/01-card.jpg",
  "images/projects/clo3d/ad06-card.jpg",
  "images/projects/denim-2026/01.jpg",
  "images/projects/directing-a-year/01-card.jpg",
  "images/projects/engineered-surfaces/01-v3.jpg",
  "images/projects/fashion-illustration/thumb-card.jpg",
  "images/projects/fashion-show-2024/a01.jpg",
  "images/projects/kaftan/21-v2.jpg",
  "images/projects/korean-costume/hb02.jpg",
  "images/projects/miraen/a02-card.jpg",
  "images/projects/portfolio-site/mm12-card.jpg",
  "images/projects/portfolio-site/thumb-card.jpg",
  "images/projects/promo-video-ai/01-v2.jpg",
  "images/projects/scorpio-poster/poster-card.jpg",
  "images/projects/sub-motion/mv01-card.jpg",
  "images/projects/textile-knit/cardigans-card.jpg",
  "images/projects/textile-woven/ad11.jpg",
  "images/projects/unreal-engine/ad06-ad05-card.jpg",
  "img/profile-5.jpg",
  "img/strength-2-art2wear-making.jpg",
]/* @end */);

export function phoneSrc(src) {
  if (!src || !phoneQuery.matches) return src;
  const lead = src.startsWith('/') ? '/' : '';
  const clean = src.replace(/^\//, '');
  if (!SMALL.has(clean)) return src;
  return `${lead}images/m/${clean.replace(/^images\//, '')}`;
}
