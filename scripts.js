(function(){
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Smooth scroll for nav links
  document.querySelectorAll('.nav-link').forEach(a=>{
    a.addEventListener('click', e=>{
      e.preventDefault();
      const hash = a.getAttribute('href');
      const el = hash && document.querySelector(hash);
      if(el){ el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  // Navbar shadow on scroll
  const navbar = document.getElementById('navbar');
  const onScroll = ()=>{
    if(window.scrollY > 8){ navbar.classList.add('scrolled'); }
    else{ navbar.classList.remove('scrolled'); }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // IntersectionObserver for fade-up
  const io = new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-inview');
        // stagger children
        const parent = entry.target.closest('[data-stagger]');
        if(parent){
          const kids = Array.from(parent.children);
          kids.forEach((node, i)=>{
            node.style.setProperty('--d', `${80 * i}ms`);
            node.classList.add('is-inview');
          });
        }
        // only once
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: "-80px 0px -40px 0px", threshold: 0.06 });

  document.querySelectorAll('.fade-up').forEach(el=> io.observe(el));
  document.querySelectorAll('[data-stagger]').forEach(el=> io.observe(el));

  // Parallax Glow (Hero)
  const glowA = document.getElementById('glowA');
  const glowB = document.getElementById('glowB');
  const hero = document.getElementById('hero');
  let gx = 0, gy = 0, tx = 0, ty = 0;
  const maxA = 120; // px
  const maxB = 90;

  if(!prefersReduced && glowA && glowB && hero){
    hero.addEventListener('mousemove', (e)=>{
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left)/rect.width - 0.5; // -0.5~0.5
      const y = (e.clientY - rect.top)/rect.height - 0.5;
      tx = x; ty = y;
    });

    const raf = ()=>{
      // simple lerp
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

  // Hover tilt for teaser
  const teaserTilt = document.getElementById('teaserTilt');
  const teaserCard = teaserTilt && teaserTilt.querySelector('.teaser-card');
  if(teaserTilt && teaserCard){
    const limit = 10; // deg
    let rX = 0, rY = 0, tX = 0, tY = 0;
    let af;

    const update = ()=>{
      rX += (tX - rX) * 0.18;
      rY += (tY - rY) * 0.18;
      teaserCard.style.transform = `rotateX(${rX}deg) rotateY(${rY}deg) translateZ(0)`;
      af = requestAnimationFrame(update);
    };

    teaserTilt.addEventListener('mousemove', (e)=>{
      if(prefersReduced) return;
      const rect = teaserTilt.getBoundingClientRect();
      const px = (e.clientX - rect.left)/rect.width - 0.5;
      const py = (e.clientY - rect.top)/rect.height - 0.5;
      tX = -(py * limit);
      tY = (px * limit);
      if(!af) af = requestAnimationFrame(update);
    });
    teaserTilt.addEventListener('mouseleave', ()=>{
      tX = 0; tY = 0;
      if(prefersReduced){
        teaserCard.style.transform = 'none';
      }
    });
  }

  // Magnetic button
  const magWrap = document.querySelector('.magnet-wrap');
  const magnet = document.getElementById('magBtn');
  if(magWrap && magnet){
    const strength = 12; // px
    magWrap.addEventListener('mousemove', (e)=>{
      if(prefersReduced) return;
      const rect = magWrap.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width/2)) / (rect.width/2);
      const dy = (e.clientY - (rect.top + rect.height/2)) / (rect.height/2);
      const x = Math.max(-1, Math.min(1, dx)) * strength;
      const y = Math.max(-1, Math.min(1, dy)) * strength;
      magnet.style.transform = `translate(${x}px, ${y}px)`;
    });
    magWrap.addEventListener('mouseleave', ()=>{
      magnet.style.transform = 'translate(0,0)';
    });
  }
})();
