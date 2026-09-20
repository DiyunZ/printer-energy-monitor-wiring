// Keep both design views mounted so switching tabs preserves the camera and traces.
const tabs = [...document.querySelectorAll('[data-panel]')];
export function showDesignPanel(id) {
  for (const tab of tabs) {
    const active = tab.dataset.panel === id;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    document.getElementById(tab.dataset.panel).hidden = !active;
  }
  document.getElementById('model-more').open = false;
  window.dispatchEvent(new Event('design-viewchange'));
}

export function revealMaterial(id) {
  const row = document.getElementById(`material-${id}`);
  const owned = row?.closest('#owned-materials');
  if (owned) owned.open = true;
  return row;
}

function activate(tab) {
  showDesignPanel(tab.dataset.panel);
  const url = new URL(location.href);
  url.hash = tab.dataset.panel;
  if (url.href !== location.href) history.pushState({}, '', url);
}
for (const [index, tab] of tabs.entries()) {
  tab.addEventListener('click', () => activate(tab));
  tab.addEventListener('keydown', event => {
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1
      : event.key === 'ArrowRight' ? (index + 1) % tabs.length
      : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : null;
    if (next === null) return;
    event.preventDefault(); tabs[next].focus(); activate(tabs[next]);
  });
}

function followHash() {
  const hash = location.hash;
  if (hash === '#operation') { location.replace('documents.html#operation'); return; }
  if (['#wiring', '#connectors', '#connections'].includes(hash)) {
    showDesignPanel('wiring');
    if (hash !== '#wiring') {
      const detail = document.getElementById(hash.slice(1));
      detail.open = true; detail.scrollIntoView({ block: 'start' });
    }
  } else if (['#layout', '#design', '#assembly-preview'].includes(hash)) {
    showDesignPanel('layout');
    if (hash === '#assembly-preview') {
      const preview = document.getElementById('assembly-preview');
      preview.hidden = false; preview.open = true;
      document.getElementById('design').scrollIntoView({ block: 'start' });
    }
  } else if (hash.startsWith('#material-')) {
    revealMaterial(hash.slice('#material-'.length))?.scrollIntoView({ block: 'start' });
  }
}
window.addEventListener('hashchange', followHash);
window.addEventListener('popstate', followHash);
followHash();
