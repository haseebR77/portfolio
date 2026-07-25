// Small bits of interaction for the site.

// Mobile menu
const nav = document.getElementById('nav');
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');

toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
});

links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
    });
});

// Shadow under nav after a little scroll
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Active section highlight in the nav
const sections = document.querySelectorAll('main section[id]');
const navAnchors = links.querySelectorAll('a');
const spy = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
    });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => spy.observe(s));

// Projects: continuous marquee (scrolls on its own, like the logo strip).
// The coverflow panels stay hidden in the DOM as the source for the detail overlay.
const projPanels = [...document.querySelectorAll('#projTrack .proj-panel')];
const modal = document.getElementById('projModal');
const modalBody = document.getElementById('projModalBody');
const marqueeTrack = document.getElementById('projMarqueeTrack');

function pauseMarquee() { if (marqueeTrack) marqueeTrack.style.animationPlayState = 'paused'; }
function resumeMarquee() { if (marqueeTrack) marqueeTrack.style.animationPlayState = 'running'; }

// Open the full project detail "page" (overlay)
function openProject(i) {
    const panel = projPanels[i];
    if (!panel || !modal) return;
    pauseMarquee();
    const media = panel.querySelector('.proj-media').cloneNode(true);
    const info = panel.querySelector('.proj-info').cloneNode(true);
    const mv = media.querySelector('video');
    if (mv) { mv.setAttribute('controls', ''); mv.muted = true; mv.loop = true; }
    modalBody.innerHTML = '';
    modalBody.appendChild(media);
    modalBody.appendChild(info);
    if (mv) mv.play().catch(() => {});
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeProject() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    const v = modalBody.querySelector('video');
    if (v) v.pause();
    document.body.style.overflow = '';
    setTimeout(() => { modalBody.innerHTML = ''; }, 300);
    resumeMarquee();
}

if (modal) {
    modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeProject));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeProject(); });
}

// Build the marquee cards (poster + title) from the panels, duplicated for a seamless loop
if (marqueeTrack && projPanels.length) {
    const thumbOf = (panel) => {
        const v = panel.querySelector('video');
        if (v && v.getAttribute('poster')) return v.getAttribute('poster');
        const img = panel.querySelector('.proj-media img');
        return img ? img.getAttribute('src') : '';
    };
    const makeCard = (panel, i, dup) => {
        const title = panel.querySelector('.proj-title').textContent.trim();
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'proj-card';
        btn.dataset.i = String(i);
        btn.setAttribute('aria-label', 'Open ' + title);
        if (dup) { btn.setAttribute('aria-hidden', 'true'); btn.tabIndex = -1; }
        const mediaWrap = document.createElement('span');
        mediaWrap.className = 'proj-card-media';
        const img = document.createElement('img');
        img.src = thumbOf(panel);
        img.alt = '';
        mediaWrap.appendChild(img);
        const cap = document.createElement('span');
        cap.className = 'proj-card-title';
        cap.textContent = title;
        btn.appendChild(mediaWrap);
        btn.appendChild(cap);
        btn.addEventListener('click', () => openProject(i));
        return btn;
    };
    projPanels.forEach((p, i) => marqueeTrack.appendChild(makeCard(p, i, false)));
    projPanels.forEach((p, i) => marqueeTrack.appendChild(makeCard(p, i, true)));
}

// Gentle fade-in as sections scroll into view
const revealItems = document.querySelectorAll('.section, .hero-text, .hero-photo');
revealItems.forEach(el => el.classList.add('reveal'));
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });
revealItems.forEach(el => revealObserver.observe(el));
