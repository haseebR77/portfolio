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
const modal = document.getElementById('projModal');
const modalBody = document.getElementById('projModalBody');
let projIdx = 0;

// Below the coverflow: the active project's title, summary and a "View Project" button
function updateProjectDetail() {
    if (!detail || !projPanels[projIdx]) return;
    const panel = projPanels[projIdx];
    const title = panel.querySelector('.proj-title');
    const lead = panel.querySelector('.proj-lead');
    detail.innerHTML = '';
    if (title) {
        const h = document.createElement('h3');
        h.className = 'proj-title';
        h.textContent = title.textContent.trim();
        detail.appendChild(h);
    }
    if (lead) {
        const p = document.createElement('p');
        p.className = 'proj-lead';
        p.textContent = lead.textContent.trim();
        detail.appendChild(p);
    }
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-primary btn-sm';
    btn.textContent = 'View Project';
    btn.addEventListener('click', () => openProject(projIdx));
    detail.appendChild(btn);
}

// Open the full project detail "page" (overlay)
function openProject(i) {
    const panel = projPanels[i];
    if (!panel || !modal) return;
    stopAuto();
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
    startAuto();
}

if (modal) {
    modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeProject));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeProject(); });
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
    const spacing = slideW * 1.03;               // horizontal step between slides (3 cards show)

    projPanels.forEach((p, i) => {
        let off = i - projIdx;
        if (off > n / 2) off -= n;                // wrap to the shortest direction
        if (off < -n / 2) off += n;
        const abs = Math.abs(off);
        const scale = off === 0 ? 1 : (abs === 1 ? 0.94 : 0.8);   // side cards nearly full size
        const opacity = abs === 0 ? 1 : (abs === 1 ? 0.82 : 0);   // only lightly faded
        const blur = abs === 0 ? 0 : (abs === 1 ? 0 : 6);         // no blur on the visible sides

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

// Auto-play: keep advancing to the next project on a continuous loop
let autoId = null;
const AUTO_MS = 4000;
function startAuto() {
    if (!track || projPanels.length < 2) return;
    clearTimeout(autoId);
    (function run() {
        autoId = setTimeout(() => { goToProject(projIdx + 1); run(); }, AUTO_MS);
    })();
}
function stopAuto() { clearTimeout(autoId); autoId = null; }

if (track) {
    const viewport = track.parentElement;
    viewport.style.touchAction = 'pan-y';   // let vertical scroll through, horizontal is our drag
    viewport.style.cursor = 'grab';

    prevBtn.addEventListener('click', () => { goToProject(projIdx - 1); startAuto(); });
    nextBtn.addEventListener('click', () => { goToProject(projIdx + 1); startAuto(); });
    dots.forEach(d => d.addEventListener('click', () => { goToProject(Number(d.dataset.i)); startAuto(); }));

    // coverflow videos have no inline controls (they autoplay muted); a click opens the detail page
    projPanels.forEach(p => { const v = p.querySelector('video'); if (v) v.controls = false; });

    // --- drag to move (mouse + touch), pauses auto-play while dragging ---
    let downX = 0, dragDelta = 0, isDown = false, dragMoved = false;

    viewport.addEventListener('pointerdown', (e) => {
        if (e.button !== undefined && e.button !== 0) return; // left button / touch only
        isDown = true; dragMoved = false; downX = e.clientX; dragDelta = 0;
        track.style.transition = 'none';
        viewport.style.cursor = 'grabbing';
        stopAuto();
    });
    window.addEventListener('pointermove', (e) => {
        if (!isDown) return;
        dragDelta = e.clientX - downX;
        if (Math.abs(dragDelta) > 6) dragMoved = true;
        track.style.transform = `translateX(${dragDelta}px)`; // whole set follows the drag
    });
    const endDrag = () => {
        if (!isDown) return;
        isDown = false;
        viewport.style.cursor = 'grab';
        track.style.transition = 'transform .45s cubic-bezier(0.4, 0, 0.2, 1)';
        track.style.transform = 'translateX(0px)';           // snap the track back
        if (Math.abs(dragDelta) > 45) goToProject(projIdx + (dragDelta < 0 ? 1 : -1));
        startAuto();
    };
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    // click a side slide to centre it; click the centred one to open its detail page
    // (skipped when the pointer was actually dragged)
    projPanels.forEach((p, i) => {
        p.addEventListener('click', () => {
            if (dragMoved) return;
            if (i !== projIdx) { goToProject(i); startAuto(); }
            else openProject(i); // opens detail; auto-play stays paused until it closes
        });
    });

    // pause auto-play on hover so you can read, resume on leave; pause when tab is hidden
    viewport.addEventListener('mouseenter', stopAuto);
    viewport.addEventListener('mouseleave', startAuto);
    document.addEventListener('visibilitychange', () => { document.hidden ? stopAuto() : startAuto(); });

    // re-centre on resize, and once fonts/images settle
    let rz;
    window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => layoutProjects(false), 120); });
    window.addEventListener('load', () => layoutProjects(false));

    layoutProjects(false);
    startAuto(); // begin the automatic loop
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
