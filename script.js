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
    let down = false, sx, sl, moved = false;
    track.addEventListener('mousedown', e => {
      down = true; moved = false; track.style.cursor = 'grabbing';
      sx = e.pageX - track.offsetLeft; sl = track.scrollLeft;
    });
    track.addEventListener('mouseleave', () => { down = false; track.style.cursor = 'grab'; });
    track.addEventListener('mouseup', () => { down = false; track.style.cursor = 'grab'; });
    track.addEventListener('mousemove', e => {
      if (!down) return; e.preventDefault();
      if (Math.abs((e.pageX - track.offsetLeft) - sx) > 5) moved = true;
      track.scrollLeft = sl - ((e.pageX - track.offsetLeft) - sx) * 1.8;
    });

    /* ---- CLICK TO FLIP ---- */
    document.querySelectorAll('.ingredients__card').forEach(card => {
      card.addEventListener('click', () => {
        if (moved) { moved = false; return; }
        card.classList.toggle('is-flipped');
      });
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

  /* =============================================
     CART DRAWER + SHOPIFY
     ============================================= */
  const cartEl = document.getElementById('cart');
  if (cartEl && window.HRShopify) initCart();

  function initCart() {
    const cartBody = document.getElementById('cartBody');
    const cartFooter = document.getElementById('cartFooter');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartCheckout = document.getElementById('cartCheckout');
    const navCartCount = document.getElementById('navCartCount');

    let ready = false;
    const picker = { plan: 'onetime', qty: 1 };

    const escapeHtml = (s = '') => s.replace(/[&<>"']/g, c =>
      ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])
    );

    async function ensureReady() {
      if (ready) return;
      await Promise.all([
        HRShopify.loadProduct(),
        HRShopify.loadCart(),
      ]);
      ready = true;
    }

    function openCart() {
      cartEl.classList.add('is-open');
      cartEl.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      ensureReady()
        .then(render)
        .catch(err => {
          console.error(err);
          cartBody.innerHTML = `<div class="cart__error">Couldn’t load product. Please try again.</div>`;
          cartFooter.hidden = true;
        });
    }
    function closeCart() {
      cartEl.classList.remove('is-open');
      cartEl.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('[data-cart-open]').forEach(b =>
      b.addEventListener('click', () => {
        if (mob && mob.classList.contains('is-active')) {
          burger.classList.remove('is-active');
          mob.classList.remove('is-active');
        }
        openCart();
      })
    );
    document.querySelectorAll('[data-cart-close]').forEach(b =>
      b.addEventListener('click', closeCart)
    );
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && cartEl.classList.contains('is-open')) closeCart();
    });

    function updateNavCount() {
      const count = HRShopify.cart?.totalQuantity || 0;
      if (!navCartCount) return;
      if (count > 0) { navCartCount.textContent = count; navCartCount.hidden = false; }
      else navCartCount.hidden = true;
    }

    function render() {
      updateNavCount();
      const cart = HRShopify.cart;
      const lines = cart?.lines?.edges || [];
      if (lines.length > 0) renderLines(cart, lines);
      else renderPicker();
    }

    function renderPicker() {
      const p = HRShopify.product;
      const variant = HRShopify.pickVariant();
      const plan = HRShopify.pickSellingPlan();
      if (!p || !variant) {
        cartBody.innerHTML = `<div class="cart__error">Product unavailable.</div>`;
        cartFooter.hidden = true;
        return;
      }
      const price = HRShopify.formatPrice(variant.price.amount, variant.price.currencyCode);
      let subPrice = price;
      let subSaving = '';
      if (plan) {
        const computed = HRShopify.computePlanPrice(variant, plan);
        if (computed) subPrice = HRShopify.formatPrice(computed.amount, computed.currency);
        const pct = HRShopify.planSavingPercent(plan);
        subSaving = pct ? `Save ${pct}%` : 'Subscribe & save';
      }

      cartBody.innerHTML = `
        <div class="cart__picker">
          ${p.featuredImage ? `
            <div class="cart__picker-img">
              <img src="${p.featuredImage.url}" alt="${escapeHtml(p.featuredImage.altText || p.title)}">
            </div>` : ''}
          <div>
            <div class="cart__picker-title">${escapeHtml(p.title)}</div>
            <div class="cart__picker-meta">150g · 30 serves</div>
          </div>
          ${plan ? `
            <div class="cart__plans">
              <button type="button" class="cart__plan ${picker.plan === 'onetime' ? 'is-active' : ''}" data-plan="onetime">
                <span class="cart__plan-label">One-time</span>
                <span class="cart__plan-price">${price}</span>
              </button>
              <button type="button" class="cart__plan ${picker.plan === 'subscribe' ? 'is-active' : ''}" data-plan="subscribe">
                <span class="cart__plan-label">Subscribe</span>
                <span class="cart__plan-price">${subPrice}</span>
                <span class="cart__plan-save">${escapeHtml(subSaving)}</span>
              </button>
            </div>` : ''}
          <div class="cart__picker-actions">
            <div class="cart__qty">
              <button type="button" data-picker-minus aria-label="Decrease">−</button>
              <span id="pickerQty">${picker.qty}</span>
              <button type="button" data-picker-plus aria-label="Increase">+</button>
            </div>
            <button type="button" class="btn" id="cartAddBtn">Add to Ritual</button>
          </div>
        </div>
      `;
      cartFooter.hidden = true;
      bindPicker();
    }

    function bindPicker() {
      cartBody.querySelectorAll('[data-plan]').forEach(b =>
        b.addEventListener('click', () => {
          picker.plan = b.dataset.plan;
          cartBody.querySelectorAll('[data-plan]').forEach(x =>
            x.classList.toggle('is-active', x.dataset.plan === picker.plan)
          );
        })
      );
      const qtyEl = cartBody.querySelector('#pickerQty');
      cartBody.querySelector('[data-picker-minus]')?.addEventListener('click', () => {
        if (picker.qty > 1) { picker.qty--; qtyEl.textContent = picker.qty; }
      });
      cartBody.querySelector('[data-picker-plus]')?.addEventListener('click', () => {
        picker.qty++; qtyEl.textContent = picker.qty;
      });
      cartBody.querySelector('#cartAddBtn')?.addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        btn.disabled = true; btn.textContent = 'Adding…';
        try {
          const variant = HRShopify.pickVariant();
          const planId = picker.plan === 'subscribe'
            ? HRShopify.pickSellingPlan()?.id
            : null;
          await HRShopify.addLine(variant.id, picker.qty, planId);
          picker.qty = 1;
          render();
        } catch (err) {
          console.error(err);
          btn.disabled = false; btn.textContent = 'Try again';
        }
      });
    }

    function renderLines(cart, lines) {
      const linesHtml = lines.map(({ node: line }) => {
        const m = line.merchandise;
        const total = HRShopify.formatPrice(
          line.cost.totalAmount.amount,
          line.cost.totalAmount.currencyCode
        );
        const planName = line.sellingPlanAllocation?.sellingPlan?.name || 'One-time purchase';
        const imgUrl = m.image?.url || '';
        return `
          <div class="cart__line" data-line="${line.id}">
            <div class="cart__line-img">
              ${imgUrl ? `<img src="${imgUrl}" alt="">` : ''}
            </div>
            <div class="cart__line-info">
              <div class="cart__line-top">
                <div>
                  <div class="cart__line-title">${escapeHtml(m.product.title)}</div>
                  <div class="cart__line-plan">${escapeHtml(planName)}</div>
                </div>
                <span class="cart__line-price">${total}</span>
              </div>
              <div class="cart__line-actions">
                <div class="cart__qty">
                  <button type="button" data-line-minus="${line.id}" aria-label="Decrease">−</button>
                  <span>${line.quantity}</span>
                  <button type="button" data-line-plus="${line.id}" aria-label="Increase">+</button>
                </div>
                <button type="button" class="cart__line-remove" data-line-remove="${line.id}">Remove</button>
              </div>
            </div>
          </div>
        `;
      }).join('');
      cartBody.innerHTML = linesHtml;
      cartFooter.hidden = false;
      const sub = cart.cost.subtotalAmount;
      cartSubtotal.textContent = HRShopify.formatPrice(sub.amount, sub.currencyCode);
    }

    cartBody.addEventListener('click', async (e) => {
      const minusBtn = e.target.closest('[data-line-minus]');
      const plusBtn = e.target.closest('[data-line-plus]');
      const removeBtn = e.target.closest('[data-line-remove]');
      const target = minusBtn || plusBtn || removeBtn;
      if (!target) return;
      const lineId = target.dataset.lineMinus || target.dataset.linePlus || target.dataset.lineRemove;
      const line = HRShopify.cart?.lines.edges.find(({ node }) => node.id === lineId)?.node;
      target.disabled = true;
      try {
        if (removeBtn) {
          await HRShopify.removeLine(lineId);
        } else if (line) {
          const newQty = line.quantity + (minusBtn ? -1 : 1);
          await HRShopify.updateLineQty(lineId, newQty);
        }
        render();
      } catch (err) {
        console.error(err);
        target.disabled = false;
      }
    });

    if (cartCheckout) {
      cartCheckout.addEventListener('click', () => {
        const url = HRShopify.cart?.checkoutUrl;
        if (url) window.location.href = url;
      });
    }

    /* Restore cart on load to show count badge */
    HRShopify.loadCart()
      .then(() => updateNavCount())
      .catch(() => {});
  }

});
