(() => {
  const sections = [...document.querySelectorAll('.vendor-section')];
  const links = [...document.querySelectorAll('[data-vendor]')];
  function showVendor() {
    const target = document.getElementById(location.hash.slice(1));
    const selected = target?.closest('.vendor-section') || sections[0];
    sections.forEach(section => { section.hidden = section !== selected; });
    links.forEach(link => link.setAttribute('aria-current', String(link.dataset.vendor === selected.id)));
    if (target?.matches('.request-item')) { target.open = true; target.scrollIntoView({block:'start'}); }
  }
  window.addEventListener('hashchange', showVendor);
  showVendor();
  const status = document.getElementById('copy-status');
  let noticeTimer;
  document.querySelectorAll('[data-copy]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', async () => {
      const field = document.getElementById(button.dataset.copy);
      try {
        await navigator.clipboard.writeText(field.textContent);
        status.textContent = `${document.getElementById(field.id + '-label').textContent} copied`;
      } catch {
        const selection = window.getSelection(), range = document.createRange();
        range.selectNodeContents(field); selection.removeAllRanges(); selection.addRange(range);
        field.focus(); status.textContent = 'Clipboard unavailable. Text selected — press Ctrl+C or ⌘C.';
      }
      clearTimeout(noticeTimer);
      noticeTimer = setTimeout(() => { status.textContent = ''; }, 4500);
    });
  });
})();
