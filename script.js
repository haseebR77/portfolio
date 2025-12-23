// ==================================
// ENHANCED PORTFOLIO - JAVASCRIPT
// ==================================

// Custom Cursor
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;
    
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;
    
    cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
});

// Cursor interaction with links
const links = document.querySelectorAll('a, button, .project-card');
links.forEach(link => {
    link.addEventListener('mouseenter', () => {
        cursorDot.style.transform = 'translate(-50%, -50%) scale(1.5)';
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
    });
    
    link.addEventListener('mouseleave', () => {
        cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
    });
});

// ==================================
// NAVIGATION
// ==================================

const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Mobile menu toggle
navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
});

// Close mobile menu on link click
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Smooth scrolling for navigation links
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const navHeight = navbar.offsetHeight;
            const targetPosition = targetSection.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar scroll effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add scrolled class for background
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Hide/show navbar on scroll
    if (currentScroll > 100) {
        if (currentScroll > lastScroll && !navMenu.classList.contains('active')) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
    }
    
    lastScroll = currentScroll;
});

// Active navigation link
const sections = document.querySelectorAll('section[id]');

function highlightNavigation() {
    const scrollPosition = window.scrollY + 150;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLink) navLink.classList.add('active');
        }
    });
}

window.addEventListener('scroll', highlightNavigation);

// ==================================
// SCROLL ANIMATIONS
// ==================================

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            
            // For staggered animations
            if (entry.target.classList.contains('stagger-item')) {
                const items = entry.target.querySelectorAll('.stagger-child');
                items.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, index * 100);
                });
            }
        }
    });
}, observerOptions);

// Observe elements for animation
const animateElements = document.querySelectorAll('.skill-card, .project-card, .education-card, .contact-card, .about-grid, .highlight-box');
animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(el);
});

// ==================================
// SKILL BARS ANIMATION
// ==================================

const skillBars = document.querySelectorAll('.skill-progress');
let skillsAnimated = false;

const skillsSection = document.querySelector('#skills');
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !skillsAnimated) {
            skillBars.forEach((bar, index) => {
                setTimeout(() => {
                    const progress = bar.getAttribute('data-progress');
                    bar.style.width = `${progress}%`;
                }, index * 150);
            });
            skillsAnimated = true;
        }
    });
}, { threshold: 0.3 });

if (skillsSection) {
    skillObserver.observe(skillsSection);
}

// ==================================
// COUNTER ANIMATION
// ==================================

function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

const statNumbers = document.querySelectorAll('.stat-number');
let statsAnimated = false;

const heroSection = document.querySelector('.hero');
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated) {
            statNumbers.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target'));
                if (!isNaN(target)) {
                    animateCounter(stat, target);
                } else {
                    // Handle non-numeric values (like "10+")
                    const text = stat.getAttribute('data-target');
                    const numbers = text.match(/\d+/);
                    if (numbers) {
                        const num = parseInt(numbers[0]);
                        const suffix = text.replace(num, '');
                        let current = 0;
                        const timer = setInterval(() => {
                            current++;
                            stat.textContent = current + suffix;
                            if (current >= num) {
                                clearInterval(timer);
                            }
                        }, 50);
                    }
                }
            });
            statsAnimated = true;
        }
    });
}, { threshold: 0.5 });

if (heroSection) {
    statsObserver.observe(heroSection);
}

// ==================================
// PARALLAX EFFECT
// ==================================

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.gradient-orb');
    
    parallaxElements.forEach((el, index) => {
        const speed = 0.5 + (index * 0.1);
        el.style.transform = `translate(-50%, -50%) translateY(${scrolled * speed}px)`;
    });
});

// ==================================
// PROJECT CARD 3D TILT EFFECT
// ==================================

const projectCards = document.querySelectorAll('.project-card');

projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 30;
        const rotateY = (centerX - x) / 30;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// ==================================
// TYPING EFFECT (Optional)
// ==================================

function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Uncomment to enable typing effect on hero title
/*
window.addEventListener('load', () => {
    const titleWords = document.querySelectorAll('.title-line-name .word');
    if (titleWords.length >= 3) {
        setTimeout(() => typeWriter(titleWords[0], 'Haseeb', 100), 500);
        setTimeout(() => typeWriter(titleWords[1], 'Ur', 100), 1200);
        setTimeout(() => typeWriter(titleWords[2], 'Rehman', 100), 1500);
    }
});
*/

// ==================================
// SMOOTH REVEAL ON SCROLL
// ==================================

const revealElements = document.querySelectorAll('.section-header, .cta-banner');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.2 });

revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    revealObserver.observe(el);
});

// ==================================
// PAGE LOAD ANIMATION
// ==================================

window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// ==================================
// UTILITY FUNCTIONS
// ==================================

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Apply throttle to scroll events
const throttledHighlight = throttle(highlightNavigation, 100);
window.addEventListener('scroll', throttledHighlight);

// ==================================
// PREVENT RIGHT CLICK ON IMAGES (Optional)
// ==================================

// Uncomment to prevent right-click on images
/*
document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});
*/

// ==================================
// CONSOLE MESSAGE
// ==================================

console.log('%c👋 Welcome to My Portfolio!', 'color: #667eea; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 0px #764ba2;');
console.log('%c✨ Built with passion and modern web technologies', 'color: #a0a0b8; font-size: 14px; font-weight: 500;');
console.log('%c🚀 Check out the code on GitHub!', 'color: #667eea; font-size: 14px;');

// ==================================
// ACCESSIBILITY - Keyboard Navigation
// ==================================

// Trap focus in mobile menu when open
const focusableElements = 'a[href], button, textarea, input, select';

navToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navToggle.click();
    }
});

// Close mobile menu on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        document.body.style.overflow = '';
        navToggle.focus();
    }
});

// ==================================
// PERFORMANCE OPTIMIZATION
// ==================================

// Lazy load images (when you add real images)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    const lazyImages = document.querySelectorAll('img.lazy');
    lazyImages.forEach(img => imageObserver.observe(img));
}

// ==================================
// END OF SCRIPT
// ==================================

// ==================================
// ROTATING SUBTITLE (Hero)
// ==================================
(function() {
    const subtitles = [
        'ML Engineer',
        'Software Developer',
        'Automation Expert',
        'AI Researcher'
    ];

    const el = document.getElementById('rotating-subtitle');
    if (!el) return;

    let idx = 0;
    const interval = 3000;

    function showNext() {
        // trigger slide out
        el.classList.remove('animate-in');
        el.classList.add('animate-out');
        setTimeout(() => {
            idx = (idx + 1) % subtitles.length;
            el.textContent = subtitles[idx];
            // replace with slide in
            el.classList.remove('animate-out');
            el.classList.add('animate-in');
            setTimeout(() => el.classList.remove('animate-in'), 420);
        }, 380);
    }

    el.textContent = subtitles[0];
    // initial animate-in for smooth entry
    el.classList.add('animate-in');
    setTimeout(() => el.classList.remove('animate-in'), 480);
    setInterval(showNext, interval);
})();
