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

// Projects: numbered tabs switch the visible panel
const tabs = document.querySelectorAll('.proj-tab');
const panels = document.querySelectorAll('.proj-panel');

// Play the active panel's video, pause the rest
function syncProjectVideos() {
    panels.forEach(p => {
        const v = p.querySelector('video');
        if (!v) return;
        if (p.classList.contains('active')) {
            v.play().catch(() => {}); // ignored if the browser blocks autoplay
        } else {
            v.pause();
        }
    });
}

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const i = Number(tab.dataset.i);
        tabs.forEach(t => t.classList.toggle('active', t === tab));
        panels.forEach((p, idx) => p.classList.toggle('active', idx === i));
        syncProjectVideos();
    });
});

syncProjectVideos();

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
