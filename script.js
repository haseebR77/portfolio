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

// Projects: coverflow carousel — active slide centered & sharp,
// neighbours sit behind it blurred; click a side one to bring it forward.
const track = document.getElementById('projTrack');
const projPanels = track ? [...track.querySelectorAll('.proj-panel')] : [];
const dots = [...document.querySelectorAll('.proj-dot')];
const prevBtn = document.getElementById('projPrev');
const nextBtn = document.getElementById('projNext');
const detail = document.getElementById('projDetail');
let projIdx = 0;

// Show the active project's text below the coverflow
function updateProjectDetail() {
    if (!detail || !projPanels[projIdx]) return;
    const info = projPanels[projIdx].querySelector('.proj-info');
    detail.innerHTML = info ? info.innerHTML : '';
}

// Play only the current slide's video, pause the rest
function syncProjectVideos() {
    projPanels.forEach((p, i) => {
        const v = p.querySelector('video');
        if (!v) return;
        if (i === projIdx) v.play().catch(() => {}); // ignored if autoplay is blocked
        else v.pause();
    });
}

// Position every slide by its circular distance from the active one,
// so the carousel loops (last connects back to first, no empty ends).
function layoutProjects(animate) {
    if (!projPanels.length) return;
    const viewport = track.parentElement;
    const slideW = projPanels[0].offsetWidth;   // 62% of the viewport
    const slideH = slideW * 9 / 16;
    viewport.style.height = Math.round(slideH + 30) + 'px'; // 16:9 media + shadow room

    const n = projPanels.length;
    const spacing = slideW * 0.98;               // horizontal gap between slides (space around each)

    projPanels.forEach((p, i) => {
        let off = i - projIdx;
        if (off > n / 2) off -= n;                // wrap to the shortest direction
        if (off < -n / 2) off += n;
        const abs = Math.abs(off);
        const scale = off === 0 ? 1 : (abs === 1 ? 0.82 : 0.7);
        const opacity = abs === 0 ? 1 : (abs === 1 ? 0.55 : 0);
        const blur = abs === 0 ? 0 : (abs === 1 ? 4 : 9);

        if (!animate) p.style.transition = 'none';
        p.style.transform = `translate(-50%, -50%) translateX(${off * spacing}px) scale(${scale})`;
        p.style.opacity = opacity;
        p.style.filter = blur ? `blur(${blur}px)` : 'none';
        p.style.zIndex = String(10 - abs);
        p.style.pointerEvents = abs <= 1 ? 'auto' : 'none';
        if (!animate) { void p.offsetWidth; p.style.transition = ''; }

        p.classList.toggle('is-active', i === projIdx);
    });

    dots.forEach((d, di) => d.classList.toggle('active', di === projIdx));
    updateProjectDetail();
    syncProjectVideos();
}

function goToProject(i) {
    if (!projPanels.length) return;
    projIdx = (i + projPanels.length) % projPanels.length;
    layoutProjects(true);
}

if (track) {
    prevBtn.addEventListener('click', () => goToProject(projIdx - 1));
    nextBtn.addEventListener('click', () => goToProject(projIdx + 1));
    dots.forEach(d => d.addEventListener('click', () => goToProject(Number(d.dataset.i))));

    // click a side (non-active) slide to bring it to the centre
    projPanels.forEach((p, i) => {
        p.addEventListener('click', (e) => {
            if (i !== projIdx) { e.preventDefault(); goToProject(i); }
        });
    });

    // swipe on touch devices
    const viewport = track.parentElement;
    let startX = 0, swiping = false;
    viewport.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; swiping = true; }, { passive: true });
    viewport.addEventListener('touchend', (e) => {
        if (!swiping) return;
        swiping = false;
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 40) goToProject(projIdx + (dx < 0 ? 1 : -1));
    });

    // re-centre on resize, and once fonts/images settle
    let rz;
    window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => layoutProjects(false), 120); });
    window.addEventListener('load', () => layoutProjects(false));

    layoutProjects(false);
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
