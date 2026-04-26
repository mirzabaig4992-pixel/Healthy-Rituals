/* =============================================
   HEALTHY RITUALS — ORCHESTRATED ANIMATIONS
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  /* ---- LOADER ---- */
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('is-done');
    animateHero();
  }, 1400);

  /* ---- NAV ---- */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const mob = document.getElementById('mob');

  window.addEventListener('scroll', () =>
    nav.classList.toggle('is-scrolled', window.scrollY > 60)
  );

  burger.addEventListener('click', () => {
    burger.classList.toggle('is-active');
    mob.classList.toggle('is-active');
    document.body.style.overflow = mob.classList.contains('is-active') ? 'hidden' : '';
  });
  document.querySelectorAll('.mob__link').forEach(l =>
    l.addEventListener('click', () => {
      burger.classList.remove('is-active');
      mob.classList.remove('is-active');
      document.body.style.overflow = '';
    })
  );

  /* ---- SMOOTH SCROLL ---- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const h = a.getAttribute('href');
      if (h === '#') return;
      e.preventDefault();
      const t = document.querySelector(h);
      if (t) window.scrollTo({ top: t.offsetTop - 80, behavior: 'smooth' });
    });
  });

  /* ---- HERO ENTRANCE ---- */
  function animateHero() {
    const tl = gsap.timeline();
    tl
      .to('.hero__tag', { opacity: 1, duration: 0.7, ease: 'power2.out' })
      .to('.hero__word', { opacity: 1, duration: 1, ease: 'power3.out' }, '-=0.3')
      .to('.hero__sub', { opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.5')
      .to('.hero__scroll-hint', { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.2');
  }

  /* ---- VIDEO LOOP ---- */
  const vid = document.querySelector('.hero__video');
  if (vid) vid.addEventListener('ended', () => { vid.currentTime = 0; vid.play(); });

  /* ---- SCROLL-EXPANDING HERO ---- */
  const hero = document.getElementById('hero');
  const heroMedia = document.getElementById('heroMedia');

  // Pages without the scroll-expand hero (e.g. About) skip the lock entirely
  if (!hero || !heroMedia) {
    initScrollAnimations();
    return;
  }

  const heroWordLeft = document.querySelector('.hero__word--left');
  const heroWordRight = document.querySelector('.hero__word--right');
  const heroBgImage = document.querySelector('.hero__bg-image');
  const heroMediaDim = document.querySelector('.hero__media-dim');
  const heroSub = document.querySelector('.hero__sub');
  const heroTag = document.querySelector('.hero__tag');
  const heroScrollHint = document.querySelector('.hero__scroll-hint');

  let scrollProgress = 0;
  let heroExpanded = false;
  const SCROLL_SPEED = 0.0035; // how fast the expansion happens per wheel tick

  function getHeroDimensions(progress) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Desktop: starts at 320×420, expands to full viewport
    const startW = vw < 768 ? 240 : 320;
    const startH = vw < 768 ? 340 : 420;
    const w = startW + progress * (vw - startW);
    const h = startH + progress * (vh - startH);
    const radius = 20 * (1 - progress);
    return { w, h, radius };
  }

  function updateHero(progress) {
    const { w, h, radius } = getHeroDimensions(progress);
    const textSpread = progress * 150; // px that words slide apart

    // Video container size & shape
    heroMedia.style.width = w + 'px';
    heroMedia.style.height = h + 'px';
    heroMedia.style.borderRadius = radius + 'px';

    // Video overlay dims as it expands
    const dimOpacity = Math.max(0, 0.5 - progress * 0.5);
    heroMediaDim.style.opacity = dimOpacity;

    // Title words slide apart
    if (heroWordLeft) heroWordLeft.style.transform = 'translateX(' + (-textSpread) + 'px)';
    if (heroWordRight) heroWordRight.style.transform = 'translateX(' + textSpread + 'px)';

    // Fade out text elements as video expands
    const textFade = Math.max(0, 1 - progress * 2.5);
    if (heroTag) heroTag.style.opacity = textFade;
    if (heroSub) heroSub.style.opacity = textFade * 0.55; // sub starts at 0.55 max
    if (heroScrollHint) heroScrollHint.style.opacity = textFade;

    // Background image fades out
    if (heroBgImage) heroBgImage.style.opacity = 1 - progress;

    // When fully expanded
    if (progress >= 1 && !heroExpanded) {
      heroExpanded = true;
      hero.classList.add('is-expanded');
      document.body.style.overflow = '';
      // Initialize scroll animations now that page is scrollable
      initScrollAnimations();
    } else if (progress < 1 && heroExpanded) {
      heroExpanded = false;
      hero.classList.remove('is-expanded');
      document.body.style.overflow = 'hidden';
    }
  }

  // Lock scroll until hero is fully expanded
  document.body.style.overflow = 'hidden';

  window.addEventListener('wheel', (e) => {
    if (heroExpanded && window.scrollY > 0) return; // normal scrolling below hero

    // Scrolling up at very top — collapse hero back
    if (heroExpanded && e.deltaY < 0 && window.scrollY <= 0) {
      heroExpanded = false;
      hero.classList.remove('is-expanded');
      document.body.style.overflow = 'hidden';
      scrollProgress = 0.99;
    }

    if (!heroExpanded) {
      e.preventDefault();
      scrollProgress = Math.min(1, Math.max(0, scrollProgress + e.deltaY * SCROLL_SPEED));
      updateHero(scrollProgress);

      if (scrollProgress >= 1) {
        document.body.style.overflow = '';
        heroExpanded = true;
        hero.classList.add('is-expanded');
      }
    }
  }, { passive: false });

  // Touch support for mobile
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (heroExpanded && window.scrollY > 0) return;

    const deltaY = touchStartY - e.touches[0].clientY;
    touchStartY = e.touches[0].clientY;

    if (heroExpanded && deltaY < 0 && window.scrollY <= 0) {
      heroExpanded = false;
      hero.classList.remove('is-expanded');
      document.body.style.overflow = 'hidden';
      scrollProgress = 0.99;
    }

    if (!heroExpanded) {
      e.preventDefault();
      scrollProgress = Math.min(1, Math.max(0, scrollProgress + deltaY * 0.008));
      updateHero(scrollProgress);

      if (scrollProgress >= 1) {
        document.body.style.overflow = '';
        heroExpanded = true;
        hero.classList.add('is-expanded');
      }
    }
  }, { passive: false });

  // Initialize hero at scrollProgress 0
  updateHero(0);

  /* ---- INIT SCROLL ANIMATIONS (deferred until hero expands) ---- */
  let scrollAnimsInit = false;

  function initScrollAnimations() {
    if (scrollAnimsInit) return;
    scrollAnimsInit = true;

    // Wait a frame for layout to settle after overflow change
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();

      /* ---- SCROLL REVEALS ---- */
      document.querySelectorAll('[data-reveal]').forEach(el => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none'
          },
          opacity: 0,
          y: 28,
          duration: 0.9,
          ease: 'power2.out'
        });
      });

      /* ---- STAGGERED BENEFITS ---- */
      gsap.from('.benefits__card', {
        scrollTrigger: {
          trigger: '.benefits__grid',
          start: 'top 82%',
          toggleActions: 'play none none none'
        },
        opacity: 0, y: 40,
        stagger: 0.15, duration: 0.8, ease: 'power3.out'
      });

      /* ---- STAGGERED INGREDIENTS ---- */
      gsap.from('.ingredients__card', {
        scrollTrigger: {
          trigger: '.ingredients__scroll',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0, x: 30,
        stagger: 0.1, duration: 0.7, ease: 'power2.out'
      });

      /* ---- REVIEWS SECTION REVEAL ---- */
      gsap.from('.reviews__track-wrap', {
        scrollTrigger: {
          trigger: '.reviews',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0, y: 30,
        duration: 1, ease: 'power2.out'
      });

      /* ---- PRODUCT LIST STAGGER ---- */
      gsap.from('.product__row', {
        scrollTrigger: {
          trigger: '.product__list',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0, x: -16,
        stagger: 0.06, duration: 0.5, ease: 'power2.out'
      });

      /* ---- GALLERY STAGGER ---- */
      gsap.from('.gallery__item', {
        scrollTrigger: {
          trigger: '.gallery',
          start: 'top 82%',
          toggleActions: 'play none none none'
        },
        opacity: 0, y: 30,
        stagger: 0.12, duration: 0.8, ease: 'power2.out'
      });

      /* ---- BLEED PARALLAX ---- */
      const bleedImg = document.querySelector('.bleed img');
      if (bleedImg) {
        gsap.to(bleedImg, {
          scrollTrigger: {
            trigger: '.bleed',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5
          },
          y: -40, scale: 1.04, ease: 'none'
        });
      }

      /* ---- STORY IMAGE PARALLAX ---- */
      const storyImg = document.querySelector('.story__img--main img');
      if (storyImg) {
        gsap.to(storyImg, {
          scrollTrigger: {
            trigger: '.story',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5
          },
          y: -30, ease: 'none'
        });
      }
    });
  }

  /* ---- DRAG TO SCROLL ---- */
  const track = document.querySelector('.ingredients__scroll');
  if (track) {
    let down = false, sx, sl;
    track.addEventListener('mousedown', e => {
      down = true; track.style.cursor = 'grabbing';
      sx = e.pageX - track.offsetLeft; sl = track.scrollLeft;
    });
    track.addEventListener('mouseleave', () => { down = false; track.style.cursor = 'grab'; });
    track.addEventListener('mouseup', () => { down = false; track.style.cursor = 'grab'; });
    track.addEventListener('mousemove', e => {
      if (!down) return; e.preventDefault();
      track.scrollLeft = sl - ((e.pageX - track.offsetLeft) - sx) * 1.8;
    });

    /* ---- ARROW NAVIGATION ---- */
    const prevBtn = document.querySelector('.ingredients__nav--prev');
    const nextBtn = document.querySelector('.ingredients__nav--next');
    const stepBy = () => {
      const card = track.querySelector('.ingredients__card');
      return card ? card.offsetWidth + 32 : 320;
    };
    if (prevBtn) prevBtn.addEventListener('click', () => track.scrollBy({ left: -stepBy(), behavior: 'smooth' }));
    if (nextBtn) nextBtn.addEventListener('click', () => track.scrollBy({ left: stepBy(), behavior: 'smooth' }));
  }

  /* ---- MARQUEE DUPLICATE for seamless loop ---- */
  const marqueeTrack = document.querySelector('.marquee__track');
  if (marqueeTrack) {
    marqueeTrack.innerHTML += marqueeTrack.innerHTML;
  }

  /* ---- REVIEWS CAROUSEL DUPLICATE for seamless loop ---- */
  const reviewsTrack = document.getElementById('reviewsTrack');
  if (reviewsTrack) {
    reviewsTrack.innerHTML += reviewsTrack.innerHTML;
  }

});
