const btn = document.querySelector('.menu-btn');
const menu = document.getElementById('menu');

btn.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
  btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});

menu.addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
  }
});

document.getElementById('year').textContent = new Date().getFullYear();

// Wok intro (home page): the timing lives in CSS; here we only allow skipping and tidy up afterwards
const intro = document.querySelector('.wok-intro');
if (intro && document.documentElement.classList.contains('intro-on')) {
  try { sessionStorage.setItem('tp-intro', '1'); } catch (e) {}
  const skip = () => {
    document.documentElement.classList.add('intro-skipped');
    intro.remove();
  };
  intro.querySelector('.intro-skip').addEventListener('click', skip);
  intro.addEventListener('click', (e) => { if (e.target !== intro.querySelector('.intro-skip')) skip(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && intro.isConnected) skip(); });
  setTimeout(() => intro.remove(), 6300);
}

// Lightbox for the gallery and the printed menu pages
const box = document.querySelector('.lightbox');
if (box) {
  const img = box.querySelector('img');
  const cap = box.querySelector('figcaption');
  let items = [];
  let i = 0;

  const show = (n) => {
    i = (n + items.length) % items.length;
    const b = items[i];
    img.src = b.dataset.full;
    img.alt = b.querySelector('img').alt;
    img.style.setProperty('--w', b.dataset.w + 'px');
    cap.textContent = b.dataset.caption;
    // menu pages are tall: let them scroll at full width instead of shrinking to fit
    box.classList.toggle('tall', b.closest('.scans') !== null);
    box.scrollTop = 0;
  };

  document.querySelectorAll('[data-lightbox-group] button').forEach((b) => {
    b.addEventListener('click', () => {
      items = [...b.closest('[data-lightbox-group]').querySelectorAll('button')];
      show(items.indexOf(b));
      box.showModal();
    });
  });

  box.querySelector('.lb-close').addEventListener('click', () => box.close());
  box.querySelector('.lb-prev').addEventListener('click', () => show(i - 1));
  box.querySelector('.lb-next').addEventListener('click', () => show(i + 1));
  box.addEventListener('click', (e) => { if (e.target === box || e.target.tagName === 'FIGURE') box.close(); });
  box.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(i - 1);
    if (e.key === 'ArrowRight') show(i + 1);
  });
}

// Highlight the menu section chip that is on screen
const chips = document.querySelectorAll('.menu-nav a');
if (chips.length && 'IntersectionObserver' in window) {
  const byId = new Map([...chips].map((a) => [a.hash.slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      chips.forEach((a) => a.classList.remove('active'));
      const a = byId.get(en.target.id);
      if (a) {
        a.classList.add('active');
        a.scrollIntoView({ block: 'nearest', inline: 'center' });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  byId.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
}
