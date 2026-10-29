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

// Wok intro (home page). The wok and the handwriting are timed in CSS; this script runs the hand-off:
// the fire washes out, the written logo flies into the hero card and the photo pulls back from the flames.
const intro = document.querySelector('.wok-intro');
if (intro && document.documentElement.classList.contains('intro-on')) {
  try { sessionStorage.setItem('tp-intro', '1'); } catch (e) {}
  const root = document.documentElement;
  const heroLogo = document.querySelector('.hero-logo');
  const running = [];
  const done = () => {
    if (!intro.isConnected) return;
    heroLogo.style.opacity = '';
    root.classList.add('intro-done');
    intro.remove();
  };
  const skip = () => {
    root.classList.add('intro-skipped');
    running.forEach((a) => a.finish());
    done();
  };
  intro.addEventListener('click', skip);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') skip(); });

  // wait until a point on the page's animation clock (the CSS animations run on the same clock)
  const at = (ms) => new Promise((r) => setTimeout(r, Math.max(0, ms - document.timeline.currentTime)));
  at(2450).then(() => {
    if (!intro.isConnected) return;
    const logo = intro.querySelector('.paint-logo');
    const from = logo.getBoundingClientRect();
    const to = heroLogo.getBoundingClientRect();
    const fly = `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width})`;
    const out = { duration: 550, easing: 'ease-in', fill: 'forwards' };
    heroLogo.style.opacity = '0';
    logo.style.transformOrigin = '0 0';
    running.push(
      intro.querySelector('.intro-bg').animate({ opacity: [1, 0] }, out),
      intro.querySelector('.intro-flare').animate({ opacity: [1, 0] }, out),
      // animate the wok drawing, not .wok-wrap: transforming the wrapper would lift the flare above the title
      intro.querySelector('.wok').animate({ opacity: [1, 0], transform: ['none', 'translateY(40px) scale(.85)'] }, { duration: 420, easing: 'ease-in', fill: 'forwards' }),
      intro.querySelector('.stage-tag').animate({ opacity: [1, 0] }, { duration: 250, fill: 'forwards' }),
      intro.querySelector('.intro-skip').animate({ opacity: [1, 0] }, { duration: 200, fill: 'forwards' }),
      document.querySelector('.hero-img').animate(
        { transform: ['scale(1.9)', 'none'], filter: ['brightness(1.35) saturate(1.2)', 'none'] },
        { duration: 1800, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' }),
      document.querySelector('.hero-side').animate({ opacity: [0, 1] }, { duration: 800, delay: 350, fill: 'backwards' }),
      document.querySelector('.hero-card').animate(
        { opacity: [0, 1], transform: ['translateY(16px) scale(.97)', 'none'] },
        { duration: 550, delay: 550, easing: 'ease-out', fill: 'both' }),
    );
    const landing = logo.animate({ transform: ['none', fly] }, { duration: 950, delay: 120, easing: 'cubic-bezier(.65,0,.25,1)', fill: 'forwards' });
    running.push(landing);
    landing.finished.then(done, done);
  });
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
