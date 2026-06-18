document.addEventListener('DOMContentLoaded', () => {

  // ===== MOBILE MENU =====
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  const navOverlay = document.getElementById('navOverlay');
  const navItems = navLinks ? navLinks.querySelectorAll('a') : [];

  function openMenu() {
    navLinks.classList.add('active');
    navOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    const icon = mobileToggle.querySelector('i');
    icon.classList.remove('bi-list');
    icon.classList.add('bi-x-lg');
  }

  function closeMenu() {
    navLinks.classList.remove('active');
    navOverlay.classList.remove('active');
    document.body.style.overflow = '';
    const icon = mobileToggle.querySelector('i');
    icon.classList.remove('bi-x-lg');
    icon.classList.add('bi-list');
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      if (navLinks.classList.contains('active')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (navOverlay) {
    navOverlay.addEventListener('click', closeMenu);
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      if (navLinks.classList.contains('active')) {
        closeMenu();
      }
    });
  });

  // ===== NAVBAR SCROLL EFFECT =====
  const navbar = document.getElementById('navbar');

  function handleNavbarScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll);
  handleNavbarScroll();

  // ===== ACTIVE NAV LINK HIGHLIGHTING =====
  // Simple, predictable scroll-position logic that works reliably at any
  // viewport size (including 4K). We pick the section whose top is closest
  // to a fixed "trigger line" just below the navbar. This avoids the
  // observer's ratio-based edge cases at section boundaries.
  const sections = Array.from(document.querySelectorAll('section'));
  const navLinkMap = new Map();
  navItems.forEach(a => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('#')) {
      navLinkMap.set(href.slice(1), a);
    }
  });

  let currentActiveId = null;
  function setActive(id) {
    if (id === currentActiveId) return;
    currentActiveId = id;
    navItems.forEach(a => a.classList.remove('active'));
    const link = navLinkMap.get(id);
    if (link) link.classList.add('active');
  }

  // Trigger line = navbar bottom (~80px) + a small buffer so the highlight
  // flips once the next section's top has visibly entered the viewport.
  const TRIGGER_OFFSET = 120;

  function updateActiveLink() {
    if (sections.length === 0) return;

    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const triggerY = scrollY + TRIGGER_OFFSET;
    const lastSection = sections[sections.length - 1];

    // Edge case 1: scrolled above the first section → highlight Home
    if (triggerY < sections[0].offsetTop) {
      setActive(sections[0].id);
      return;
    }

    // Edge case 2: scrolled to the very bottom (past the last section,
    // including the footer) → highlight the last section (Contact)
    const lastBottom = lastSection.offsetTop + lastSection.offsetHeight;
    if (scrollY + viewportHeight >= lastBottom - 20) {
      setActive(lastSection.id);
      return;
    }

    // Normal case: pick the last section whose top is at or above triggerY
    let activeId = sections[0].id;
    for (const section of sections) {
      if (section.offsetTop <= triggerY) {
        activeId = section.id;
      }
    }
    setActive(activeId);
  }

  // Throttle scroll updates with requestAnimationFrame for smooth perf
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateActiveLink();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateActiveLink);

  // Run on load so the initial state matches the current scroll position
  // (e.g., after a hard refresh while already scrolled).
  updateActiveLink();
  // Also run after a short delay in case layout shifts after script execution
  // (web fonts loading, images resizing, etc.)
  setTimeout(updateActiveLink, 150);

  // ===== SCROLL REVEAL ANIMATION =====
  const revealElements = document.querySelectorAll('.reveal');

  function revealOnScroll() {
    const windowHeight = window.innerHeight;
    const revealPoint = 80;

    revealElements.forEach(el => {
      const elTop = el.getBoundingClientRect().top;
      if (elTop < windowHeight - revealPoint) {
        el.classList.add('revealed');
      }
    });
  }

  window.addEventListener('scroll', revealOnScroll);
  // Trigger once on load with a small delay for initial elements
  setTimeout(revealOnScroll, 150);

  // ===== TESTIMONIAL DOTS =====
  const dots = document.querySelectorAll('.testimonial-dot');
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      dots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    });
  });

  // ===== CONTACT FORM — Prevent Default Submit =====
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // Simple feedback
      const btn = contactForm.querySelector('.submit-btn');
      const originalIcon = btn.innerHTML;
      btn.innerHTML = '<i class="bi bi-check-lg"></i>';
      btn.style.background = '#22c55e';
      btn.style.borderColor = '#22c55e';

      setTimeout(() => {
        btn.innerHTML = originalIcon;
        btn.style.background = '';
        btn.style.borderColor = '';
        contactForm.reset();
      }, 2000);
    });
  }

  // ===== SMOOTH SCROLL for nav links =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offsetTop = target.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // ===== PARALLAX effect on hero photo =====
  // Desktop uses absolute positioning with left:50% + translateX(-50%) to center.
  // Mobile/tablet uses position:relative + margin:0 auto, so we must NOT apply
  // translateX(-50%) there or the photo will shift to the left on scroll.
  const heroPhoto = document.querySelector('.hero-photo-wrapper');
  if (heroPhoto) {
    const MOBILE_BREAKPOINT = 992;

    function getTranslateX() {
      return window.innerWidth > MOBILE_BREAKPOINT ? '-50%' : '0';
    }

    function applyParallax() {
      const scrolled = window.scrollY;
      const maxScroll = window.innerHeight;
      if (scrolled < maxScroll) {
        const translateY = scrolled * 0.15;
        heroPhoto.style.transform = `translateX(${getTranslateX()}) translateY(${translateY}px)`;
      } else {
        // Reset transform once past the hero so CSS positioning takes over again
        heroPhoto.style.transform = '';
      }
    }

    window.addEventListener('scroll', applyParallax);

    // Recalculate on resize so the transform stays correct when crossing
    // the desktop/mobile breakpoint while the user is still in the hero area.
    let resizeRaf = null;
    window.addEventListener('resize', () => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(applyParallax);
    });

    // Run once on load in case the page was reloaded mid-scroll
    applyParallax();
  }

  // ===== COUNTER ANIMATION for stats =====
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsAnimated = false;

  function animateStats() {
    if (statsAnimated) return;

    const statsSection = document.querySelector('.stats-row');
    if (!statsSection) return;

    const rect = statsSection.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      statsAnimated = true;

      statNumbers.forEach(stat => {
        const target = parseInt(stat.textContent);
        let current = 0;
        const increment = target / 40;
        const duration = 1500;
        const stepTime = duration / 40;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          stat.textContent = Math.floor(current);
        }, stepTime);
      });
    }
  }

  window.addEventListener('scroll', animateStats);
  setTimeout(animateStats, 500);

});