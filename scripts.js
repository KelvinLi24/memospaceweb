/*!
 * MemoSpace — scripts.js (Full Enhanced Build)
 * ------------------------------------------------------------
 * 功能總覽
 *  - 平滑滾動（同頁錨點）
 *  - 進場淡入 + stagger
 *  - Hero 視差光暈（Parallax Glows）
 *  - Visual Teaser 3D 卡片傾斜互動
 *  - Hero 主按鈕磁吸效果（Magnetic）
 *  - 行動選單（Hamburger / Drawer）
 *  - Navbar 陰影 + Back-to-top（僅回滑顯示）
 *  - Navbar 高度偵測（--nav-h CSS 變數）
 *  - Chips 逐一揭示動畫（IntersectionObserver）
 *  - Beta Modal（公開測試彈窗）
 *  - YouTube 153 防護（一段針對 .yt-iframe；一段針對所有 iframe）
 *  - YouTube 懶載入封面（無橙色標籤；點擊後才載入並自動播放）
 *  - 細節強化、無障礙（prefers-reduced-motion 等）
 * ------------------------------------------------------------
 */

(function(){
  // ============================================================
  // 0) 偏好：使用者是否「減少動效」
  // ============================================================
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ============================================================
  // 1) Smooth scroll for SAME-PAGE anchor links
  // ============================================================
  // 只對 href 以 # 開頭的同頁錨點啟用 smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const hash = a.getAttribute('href');
      const el = hash && document.querySelector(hash);
      if(el){
        e.preventDefault();
        // 平滑滾動至對應區塊
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ============================================================
  // 2) IntersectionObserver for fade-up + stagger
  // ============================================================
  // 觀測 .fade-up 與 [data-stagger]，進入畫面時添加 is-inview
  const io = new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-inview');

        // 如果父層有 data-stagger，讓子元素逐一延遲進場
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

  // ============================================================
  // 3) Parallax Glow (Hero 背景光暈)
  // ============================================================
  const glowA = document.getElementById('glowA');
  const glowB = document.getElementById('glowB');
  const hero  = document.getElementById('hero');
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

  // ============================================================
  // 4) Visual Teaser 卡片傾斜互動（hover tilt）
  // ============================================================
  const teaserTilt = document.getElementById('teaserTilt');
  const teaserCard = teaserTilt && teaserTilt.querySelector('.teaser-card');

  if(teaserTilt && teaserCard){
    const limit = 10; let rX = 0, rY = 0, tX = 0, tY = 0; let af;

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
      tY =  (px * limit);
      if(!af) af = requestAnimationFrame(update);
    });

    teaserTilt.addEventListener('mouseleave', ()=>{
      tX = 0; tY = 0;
      if(prefersReduced){ teaserCard.style.transform = 'none'; }
    });
  }

  // ============================================================
  // 5) Magnetic Button（Hero CTA）
  // ============================================================
  const magWrap = document.querySelector('.magnet-wrap');
  const magnet  = document.getElementById('magBtn');

  if(magWrap && magnet){
    const strength = 12;

    magWrap.addEventListener('mousemove', (e)=>{
      if(prefersReduced) return;
      const rect = magWrap.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width/2)) / (rect.width/2);
      const dy = (e.clientY - (rect.top + rect.height/2)) / (rect.height/2);
      const x  = Math.max(-1, Math.min(1, dx)) * strength;
      const y  = Math.max(-1, Math.min(1, dy)) * strength;
      magnet.style.transform = `translate(${x}px, ${y}px)`;
    });

    magWrap.addEventListener('mouseleave', ()=>{
      magnet.style.transform = 'translate(0,0)';
    });
  }

  // ============================================================
  // 6) Mobile Menu（Hamburger / Drawer）
  // ============================================================
  const burger     = document.getElementById('hamburger');
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

    // 點選選單內連結自動關閉
    mobileMenu.querySelectorAll('a').forEach(a=>{
      a.addEventListener('click', ()=> closeMenu());
    });

    // ESC 關閉
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape'){ closeMenu(); }
    });
  }

  // ============================================================
  // 7) Navbar shadow + Back-to-top（只在「回滑」顯示）
  // ============================================================
  const navbar  = document.getElementById('navbar');
  const toTopBtn= document.getElementById('backToTop');

  let lastY      = window.scrollY;
  let scrollingUp= false;
  let showLock   = false;

  const onScroll = ()=>{
    const y = window.scrollY;

    // Navbar 陰影（輕微滾動時）
    if (y > 8) navbar.classList.add('scrolled');
    else       navbar.classList.remove('scrolled');

    // 捲動方向（2px deadzone）
    scrollingUp = y < lastY - 2;
    lastY = y;

    // 顯示/隱藏回頂鍵（閾值：視窗 80% 或 320px）
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

  // 回頂鍵點擊/鍵盤操作
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

  // ============================================================
  // 8) Navbar 高度偵測（--nav-h）
  // ============================================================
  const root = document.documentElement;
  function updateNavHeight(){
    const el = document.getElementById('navbar');
    if(!el) return;
    root.style.setProperty('--nav-h', el.offsetHeight + 'px');
  }
  window.addEventListener('load', updateNavHeight);
  window.addEventListener('resize', updateNavHeight);

  // ============================================================
  // 9) Chips scroll-in reveal（逐一揭示）
  // ============================================================
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

  // ============================================================
  // 10) Beta Modal（公開測試彈窗）
  // ============================================================
  (function(){
    const modal = document.getElementById('betaModal');
    if(!modal) return;

    const openers = document.querySelectorAll('[data-open="beta"]');
    const closers = modal.querySelectorAll('[data-close="beta"], .modal__backdrop');

    function open(){
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden','false');
      // 鎖住背景捲動
      document.documentElement.style.overflow = 'hidden';

      // 將焦點移至關閉按鈕
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

  // ============================================================
  // 11) YouTube 防護（第一層）— 僅針對 .yt-iframe
  // ============================================================
  // 說明：
  //  - 將 .yt-iframe 統一為 youtube-nocookie.com + enablejsapi + origin
  //  - 若報錯（含 153），切換至 www.youtube.com 重試
  //  - 若仍失敗，顯示「Open on YouTube」保底
  (function () {
    const iframes = Array.from(document.querySelectorAll('iframe.yt-iframe'));
    if (!iframes.length) return;

    function normSrc(videoId, useNoCookie = true) {
      const host = useNoCookie ? 'https://www.youtube-nocookie.com' : 'https://www.youtube.com';
      const q = new URLSearchParams({
        rel: '0',
        modestbranding: '1',
        playsinline: '1',
        enablejsapi: '1',
        origin: location.origin
      });
      return `${host}/embed/${videoId}?${q.toString()}`;
    }

    function extractId(src) {
      try {
        const m = src.match(/\/embed\/([a-zA-Z0-9_-]{6,})/);
        if (m) return m[1];
        const u = new URL(src, location.href);
        const v = u.searchParams.get('v');
        if (v) return v;
      } catch (_) {}
      return null;
    }

    // 規範化
    iframes.forEach((el, i) => {
      const vid = extractId(el.src);
      if (!vid) return;
      el.dataset.ytid = vid;
      el.dataset.mode = 'nocookie';
      el.src = normSrc(vid, true);
      if (!el.id) el.id = `ytp-${i}-${Math.random().toString(36).slice(2, 7)}`;
    });

    // 載入 API
    function loadYT() {
      return new Promise((resolve) => {
        if (window.YT && window.YT.Player) return resolve();
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        window.onYouTubeIframeAPIReady = () => resolve();
        document.head.appendChild(tag);
      });
    }

    // 保底：顯示外跳按鈕
    function fallbackOpen(el) {
      const vid = el.dataset.ytid;
      const container = el.closest('.yt-embed') || el.parentElement;
      if (!container) return;
      container.innerHTML = `
        <div class="text-center" style="padding:24px;">
          <p class="muted small" style="margin-bottom:12px">The video can’t be embedded on this device/network.</p>
          <a class="btn btn--primary" target="_blank" rel="noopener noreferrer"
             href="https://www.youtube.com/watch?v=${vid}">Open on YouTube</a>
        </div>
      `;
    }

    // 綁定 Player
    function attachPlayer(el) {
      const vid = el.dataset.ytid;
      let triedNormal = false; // 是否嘗試過切到 www
      let gaveUp      = false;

      let retrying = false;
      function retrySwitchDomain() {
        if (retrying || gaveUp) return;
        retrying = true;
        const useNoCookie = el.dataset.mode !== 'normal';
        if (useNoCookie) {
          el.dataset.mode = 'normal';
          el.src = normSrc(vid, false);
          triedNormal = true;
        } else {
          gaveUp = true;
          fallbackOpen(el);
          return;
        }
        setTimeout(() => {
          new window.YT.Player(el, { events });
          retrying = false;
        }, 120);
      }

      const events = {
        onError: () => {
          if (!triedNormal) {
            retrySwitchDomain();
          } else {
            fallbackOpen(el);
          }
        }
      };

      return new window.YT.Player(el, { events });
    }

    loadYT().then(() => {
      iframes.forEach((el) => attachPlayer(el));
    });
  })();

  // ============================================================
  // 12) YouTube 防護（第二層）— 針對頁面「所有」 YouTube iframes
  // ============================================================
  // 說明：
  //  - 有些外部內容可能忘了加 .yt-iframe；此段會全面補強
  //  - Watchdog：2.5s 無回應→切網域；5s 無回應→保底
  (function () {
    const iframes = Array.from(document.querySelectorAll('iframe'))
      .filter(el => /youtube\.com|youtube-nocookie\.com/.test(el.src || ''));

    if (!iframes.length) return;

    function log(...args){ try{ console.log('[YT-Fix]', ...args); }catch(_){} }

    function getVideoId(src){
      try{
        let m = src.match(/\/embed\/([a-zA-Z0-9_-]{6,})/);
        if (m) return m[1];
        const u = new URL(src, location.href);
        const v = u.searchParams.get('v');
        if (v) return v;
      }catch(_){}
      return null;
    }

    function normSrc(vid, useNoCookie){
      const host = useNoCookie ? 'https://www.youtube-nocookie.com' : 'https://www.youtube.com';
      const q = new URLSearchParams({
        rel: '0',
        modestbranding: '1',
        playsinline: '1',
        enablejsapi: '1',
        origin: location.origin
      });
      return `${host}/embed/${vid}?${q.toString()}`;
    }

    // 規範化為 nocookie
    iframes.forEach((el, i) => {
      const vid = getVideoId(el.src);
      if (!vid) return;
      el.dataset.ytid = vid;
      el.dataset.mode = 'nocookie';
      el.src = normSrc(vid, true);
      if (!el.id) el.id = `ytp-${i}-${Math.random().toString(36).slice(2,7)}`;
      log('normalized ->', el.id, el.dataset.mode, el.src);
    });

    function loadYT() {
      return new Promise((resolve) => {
        if (window.YT && window.YT.Player) return resolve();
        const s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        window.onYouTubeIframeAPIReady = () => resolve();
        document.head.appendChild(s);
      });
    }

    function fallbackOpen(el) {
      const vid = el.dataset.ytid;
      const container = el.closest('.yt-embed') || el.parentElement;
      if (!container) return;
      container.innerHTML = `
        <div class="text-center" style="padding:24px;">
          <p class="muted small" style="margin-bottom:12px">The video can’t be embedded on this device/network.</p>
          <a class="btn btn--primary" target="_blank" rel="noopener noreferrer"
             href="https://www.youtube.com/watch?v=${vid}">Open on YouTube</a>
        </div>
      `;
      log('fallback link shown ->', vid);
    }

    function attachPlayer(el) {
      const vid = el.dataset.ytid;
      let switched = false;
      let settled  = false;

      const watchdog1 = setTimeout(() => {
        if (settled) return;
        if (!switched) {
          el.dataset.mode = 'normal';
          el.src = normSrc(vid, false);
          switched = true;
          log('watchdog: switch to normal domain ->', el.id);
        }
      }, 2500);

      const watchdog2 = setTimeout(() => {
        if (settled) return;
        settled = true;
        fallbackOpen(el);
        log('watchdog: fallback ->', el.id);
      }, 5000);

      const events = {
        onReady: () => {
          if (settled) return;
          settled = true;
          clearTimeout(watchdog1);
          clearTimeout(watchdog2);
          log('ready ->', el.id, el.dataset.mode);
        },
        onError: (e) => {
          const code = e && e.data;
          log('error ->', el.id, code, 'mode:', el.dataset.mode);
          if (!switched) {
            el.dataset.mode = 'normal';
            el.src = normSrc(vid, false);
            switched = true;
            setTimeout(() => new window.YT.Player(el, { events }), 120);
            log('switched domain after error ->', el.id);
          } else {
            settled = true;
            clearTimeout(watchdog1);
            clearTimeout(watchdog2);
            fallbackOpen(el);
          }
        }
      };

      return new window.YT.Player(el, { events });
    }

    loadYT().then(() => {
      iframes.forEach(el => attachPlayer(el));
    });
  })();

  // ============================================================
  // 13) YouTube 懶載入封面（無橙色標籤）
  // ============================================================
  // 說明：
  //  - 頁面初載只顯示縮圖 + 中央播放按鈕
  //  - 點擊後才載入 iframe（自動播放）
  //  - 與 153 防護相容：載入的連結使用 youtube-nocookie，參數完整
  (function () {
    const ytEmbeds = document.querySelectorAll('.yt-embed');

    ytEmbeds.forEach(embed => {
      const iframe = embed.querySelector('iframe.yt-iframe');
      if (!iframe) return;

      // 抓取影片 ID（支援 /embed/VIDEOID）
      const match = (iframe.src || '').match(/embed\/([a-zA-Z0-9_-]{6,})/);
      const videoId = match ? match[1] : null;
      if (!videoId) return;

      // 建立封面圖片（hqdefault）
      const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

      // 建立預覽容器
      const preview = document.createElement('div');
      preview.className = 'yt-lazy';
      preview.innerHTML = `
        <img src="${thumbnail}" class="yt-thumb" alt="YouTube preview">
        <button class="yt-play" aria-label="Play video">
          <svg width="60" height="60" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
            <circle cx="50" cy="50" r="48" fill="rgba(0,0,0,0.4)"></circle>
            <polygon points="40,30 75,50 40,70" fill="white"></polygon>
          </svg>
        </button>
      `;

      // 用預覽替換 iframe；點擊後再載入真正 iframe
      embed.innerHTML = '';
      embed.appendChild(preview);

      preview.addEventListener('click', () => {
        const newIframe = document.createElement('iframe');
        newIframe.className = 'yt-iframe';
        // 使用 nocookie，並自動附加常見參數；點擊後自動播放
        newIframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
        newIframe.title = iframe.title || 'YouTube video';
        newIframe.allow = iframe.allow || 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        newIframe.referrerPolicy = iframe.referrerPolicy || 'strict-origin-when-cross-origin';
        newIframe.allowFullscreen = true;
        newIframe.loading = 'lazy';

        embed.innerHTML = '';
        embed.appendChild(newIframe);
      });
    });
  })();

})(); // IIFE END