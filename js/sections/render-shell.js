export function T(value, lang = document.documentElement.lang) {
  return (value && typeof value === 'object' && 'ko' in value) ? (value[lang] || value.ko) : value;
}

export function renderSectionShell(section, meta, index, total, lang) {
  section.innerHTML = '';
  const shell = document.createElement('div');
  shell.className = 'section-shell';
  const heading = document.createElement('div');
  heading.className = 'section-heading';
  heading.innerHTML = `<span>${meta.title}</span><span class="section-heading__index">${String(index).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>`;
  const empty = document.createElement('div');
  empty.className = 'section-empty';
  empty.innerHTML = `<div><div class="section-empty__mark">${meta.stage} — ${meta.title}</div><p class="section-empty__note">${T(meta.note, lang)}</p></div>`;
  shell.append(heading, empty);
  section.append(shell);
}

/* Storage can throw (private mode, sandboxed frames): never let it break the page. */
export function storageGet(kind, key) { try { return window[kind].getItem(key); } catch { return null; } }
export function storageSet(kind, key, value) { try { window[kind].setItem(key, value); } catch { /* ignore */ } }

/* Each WebGL section (Work ring, NAME glass, photo lens) owns its own context and is created/disposed by its
   own visibility. releaseWebGL only announces a disposal so a section that is still on screen can rebuild. */
export function releaseWebGL(controller) {
  if (window.__activeWebGLController === controller) window.__activeWebGLController = null;
  window.dispatchEvent(new CustomEvent('portfolio:webgl-free'));
}
