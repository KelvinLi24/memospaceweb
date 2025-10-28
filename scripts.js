(function(){
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --------------------------------------------------------------------
  // Smooth scroll for SAME-PAGE anchor links only (href starting with '#')
  // --------------------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const hash = a.getAttribute('href');
      const el = hash && document.querySelector(hash);
      if(el){
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // -------------------------------------------------------------
  // IntersectionObserver for fade-up + stagger (cards, sections)
  // -------------------------------------------------------------
  const io = new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-inview');
        const parent = entry.target.closest('[data-stagger]');
        if(parent){
          const kids = Array.from(parent.children);
          kids.forEach((node, i)=>{
            node.style.setProperty('--d', `${80 * i}ms`);
            node.classList.add('is-inview');
          });
        }
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: "-80px 0px -40px 0px", threshold: 0.06 });

  document.querySelectorAll('.fade-up').forEach(el=> io.observe(el));
  document.querySelectorAll('[data-stagger]').forEach(el=> io.observe(el));

  // -------------------------
  // Parallax Glow (Hero BG)
  // -------------------------
  const glowA = document.getElementById('glowA');
  const glowB = document.getElementById('glowB');
  const hero = document.getElementById('hero');
  let gx = 0, gy = 0, tx = 0, ty = 0;
  const maxA = 120, maxB = 90;

  if(!prefersReduced && glowA && glowB && hero){
    hero.addEventListener('mousemove', (e)=>{
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left)/rect.width - 0.5;
      const y = (e.clientY - rect.top)/rect.height - 0.5;
      tx = x; ty = y;
    });
    const raf = ()=>{
      gx += (tx - gx) * 0.06;
      gy += (ty - gy) * 0.06;
      glowA.style.left = `calc(55% + ${gx*maxA}px)`;
      glowA.style.top  = `calc(35% + ${gy*maxB}px)`;
      glowB.style.left = `calc(30% + ${-gx*maxA}px)`;
      glowB.style.top  = `calc(70% + ${-gy*maxB}px)`;
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  // -------------------------
  // Hover tilt for teaser
  // -------------------------
  const teaserTilt = document.getElementById('teaserTilt');
  const teaserCard = teaserTilt && teaserTilt.querySelector('.teaser-card');
  if(teaserTilt && teaserCard){
    const limit = 10; let rX = 0, rY = 0, tX = 0, tY = 0; let af;
    const update = ()=>{
      rX += (tX - rX) * 0.18; rY += (tY - rY) * 0.18;
      teaserCard.style.transform = `rotateX(${rX}deg) rotateY(${rY}deg) translateZ(0)`;
      af = requestAnimationFrame(update);
    };
    teaserTilt.addEventListener('mousemove', (e)=>{
      if(prefersReduced) return;
      const rect = teaserTilt.getBoundingClientRect();
      const px = (e.clientX - rect.left)/rect.width - 0.5;
      const py = (e.clientY - rect.top)/rect.height - 0.5;
      tX = -(py * limit); tY = (px * limit);
      if(!af) af = requestAnimationFrame(update);
    });
    teaserTilt.addEventListener('mouseleave', ()=>{
      tX = 0; tY = 0;
      if(prefersReduced){ teaserCard.style.transform = 'none'; }
    });
  }

  // -------------------------
  // Magnetic button (Hero CTA)
  // -------------------------
  const magWrap = document.querySelector('.magnet-wrap');
  const magnet = document.getElementById('magBtn');
  if(magWrap && magnet){
    const strength = 12;
    magWrap.addEventListener('mousemove', (e)=>{
      if(prefersReduced) return;
      const rect = magWrap.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width/2)) / (rect.width/2);
      const dy = (e.clientY - (rect.top + rect.height/2)) / (rect.height/2);
      const x = Math.max(-1, Math.min(1, dx)) * strength;
      const y = Math.max(-1, Math.min(1, dy)) * strength;
      magnet.style.transform = `translate(${x}px, ${y}px)`;
    });
    magWrap.addEventListener('mouseleave', ()=>{ magnet.style.transform = 'translate(0,0)'; });
  }

  // ---------------------------------
  // Mobile menu toggle (a11y ready)
  // ---------------------------------
  const burger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if(burger && mobileMenu){
    const closeMenu = () => {
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded','false');
      mobileMenu.classList.remove('is-open');
      updateNavHeight();
    };
    const openMenu = () => {
      burger.classList.add('is-open');
      burger.setAttribute('aria-expanded','true');
      mobileMenu.classList.add('is-open');
      updateNavHeight();
    };
    burger.addEventListener('click', ()=>{
      const isOpen = burger.classList.contains('is-open');
      isOpen ? closeMenu() : openMenu();
    });
    mobileMenu.querySelectorAll('a').forEach(a=>{ a.addEventListener('click', ()=> closeMenu()); });
    document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape'){ closeMenu(); } });
  }

  // -------------------------------------------------------
  // Navbar shadow + Back-to-top (only when scrolling up)
  // -------------------------------------------------------
  const navbar = document.getElementById('navbar');
  const toTopBtn = document.getElementById('backToTop');

  let lastY = window.scrollY;
  let scrollingUp = false;
  let showLock = false;

  const onScroll = ()=>{
    const y = window.scrollY;

    // Navbar shadow
    if (y > 8) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');

    // direction (2px deadzone)
    scrollingUp = y < lastY - 2;
    lastY = y;

    // threshold (min of 80% viewport or 320px)
    const threshold = Math.min(window.innerHeight * 0.8, 320);

    if (!toTopBtn) return;

    if (y > threshold && scrollingUp) {
      toTopBtn.classList.add('show');
      showLock = true;
    } else if (y <= threshold) {
      toTopBtn.classList.remove('show');
      showLock = false;
    } else if (!scrollingUp && showLock) {
      showLock = false;
      setTimeout(() => {
        if (!scrollingUp) toTopBtn.classList.remove('show');
      }, 400);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // click back-to-top
  if(toTopBtn){
    toTopBtn.addEventListener('click', ()=>{
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    toTopBtn.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // -------------------------------------------------------
  // Measure navbar height -> CSS var for offset layouts
  // -------------------------------------------------------
  const root = document.documentElement;
  function updateNavHeight(){
    const el = document.getElementById('navbar');
    if(!el) return;
    root.style.setProperty('--nav-h', el.offsetHeight + 'px');
  }
  window.addEventListener('load', updateNavHeight);
  window.addEventListener('resize', updateNavHeight);

  // -------------------------------------------------------
  // Chips scroll-in reveal (staggered, non-intrusive)
  // -------------------------------------------------------
  (function(){
    const chipRows = document.querySelectorAll('.chip-row');
    if(!chipRows.length) return;

    const chipObserver = new IntersectionObserver((entries, obs)=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        const chips = entry.target.querySelectorAll('.chip');
        chips.forEach((chip, i)=>{
          chip.style.setProperty('--i', i);
          chip.classList.add('chip-reveal');
        });
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.25, rootMargin: "0px 0px -10%" });

    chipRows.forEach(row=> chipObserver.observe(row));
  })();

  // ----------------
  // Beta Modal
  // ----------------
  (function(){
    const modal = document.getElementById('betaModal');
    if(!modal) return;

    const openers = document.querySelectorAll('[data-open="beta"]');
    const closers = modal.querySelectorAll('[data-close="beta"], .modal__backdrop');

    function open(){
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden','false');
      // prevent background scroll
      document.documentElement.style.overflow = 'hidden';

      // move focus to close button for a11y
      const closeBtn = modal.querySelector('.modal__close');
      closeBtn && closeBtn.focus({ preventScroll: true });
    }

    function close(){
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden','true');
      document.documentElement.style.overflow = '';
    }

    openers.forEach(btn=> btn.addEventListener('click', (e)=>{ e.preventDefault(); open(); }));
    closers.forEach(btn=> btn.addEventListener('click', close));
    document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') close(); });
  })();
})();