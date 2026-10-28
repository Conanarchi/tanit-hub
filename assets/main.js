(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    const close = () => { toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Open navigation menu'); nav.classList.remove('is-open'); document.body.classList.remove('menu-open'); };
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
    document.addEventListener('keydown', e => { if(e.key === 'Escape') { close(); toggle.focus(); } });
    document.addEventListener('click', e => { if(!nav.contains(e.target) && !toggle.contains(e.target)) close(); });
    window.addEventListener('resize', () => { if(window.innerWidth > 820) close(); });
  }
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = String(new Date().getFullYear()));
  const copy = document.getElementById('copy-email');
  if (copy) copy.addEventListener('click', async () => {
    const address = copy.dataset.email;
    const feedback = document.getElementById('copy-feedback');
    try {
      await navigator.clipboard.writeText(address);
      if(feedback) feedback.textContent = 'Email address copied.';
    } catch (_) {
      // Clipboard permissions differ for file:// and HTTP without TLS.
      const a = document.createElement('textarea'); a.value = address; a.style.position = 'fixed'; a.style.opacity = '0'; document.body.appendChild(a); a.select();
      let success = false; try { success = document.execCommand('copy'); } catch(_) {}
      a.remove();
      if(feedback) feedback.textContent = success ? 'Email address copied.' : 'Copy this address: ' + address;
    }
  });
})();
