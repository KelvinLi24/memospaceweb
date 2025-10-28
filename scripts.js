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
  // 10.1) QR Code Modal (NEW)
  // ============================================================
  (function(){
    const modal = document.getElementById('qrModal');
    if(!modal) return;

    const openers = document.querySelectorAll('[data-open="qr"]');
    const closers = modal.querySelectorAll('[data-close="qr"], .modal__backdrop');

    function openQr(){
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden','false');
      document.documentElement.style.overflow = 'hidden';
      const closeBtn = modal.querySelector('.modal__close');
      closeBtn && closeBtn.focus({ preventScroll: true });
    }

    function closeQr(){
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden','true');
      document.documentElement.style.overflow = '';
    }

    openers.forEach(btn=> btn.addEventListener('click', (e)=>{ e.preventDefault(); openQr(); }));
    closers.forEach(btn=> btn.addEventListener('click', closeQr));
    document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && modal.classList.contains('is-open')) closeQr(); }); // 加上 is-open 判斷

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

  // ============================================================
  // 14) Language Switcher (NEW)
  // ============================================================
  (function () {
    const translations = {
      // 頁面標題
      "doc_title_index": {
        "en": "MemoSpace — Live inside your memories.",
        "zh-HK": "MemoSpace — 活在你的記憶之中。",
        "zh-CN": "MemoSpace — 活在你的记忆之中。"
      },
      "doc_title_demo": {
        "en": "MemoSpace — Demo Library",
        "zh-HK": "MemoSpace — 範例庫",
        "zh-CN": "MemoSpace — 示例库"
      },
      // Meta (範例)
      "og_title_index": { "en": "MemoSpace — Live inside your memories.", "zh-HK": "MemoSpace — 活在你的記憶之中。", "zh-CN": "MemoSpace — 活在你的记忆之中。" },
      "og_desc_index": { "en": "MemoSpace turns everyday videos into immersive 3D spaces...", "zh-HK": "MemoSpace 將日常影片變為沉浸式 3D 空間...", "zh-CN": "MemoSpace 将日常视频变为沉浸式 3D 空间..." },
      "og_title_demo": { "en": "MemoSpace — Demo Library", "zh-HK": "MemoSpace — 範例庫", "zh-CN": "MemoSpace — 示例库" },
      "og_desc_demo": { "en": "Watch MemoSpace demos: capture with MemoLens...", "zh-HK": "觀看 MemoSpace 範例：使用 MemoLens 拍攝...", "zh-CN": "观看 MemoSpace 示例：使用 MemoLens 拍摄..." },
      
      // 導覽列 (共用)
      "nav_features": { "en": "Features", "zh-HK": "功能特色", "zh-CN": "功能特色" },
      "nav_how": { "en": "How it works", "zh-HK": "運作方式", "zh-CN": "运作方式" },
      "nav_story": { "en": "Story", "zh-HK": "我們的故事", "zh-CN": "我们的故事" },
      "nav_about": { "en": "About Us", "zh-HK": "關於我們", "zh-CN": "关于我们" },
      "nav_contact": { "en": "Contact", "zh-HK": "聯絡我們", "zh-CN": "联系我们" },
      "nav_faq": { "en": "FAQ", "zh-HK": "常見問題", "zh-CN": "常见问题" },
      "lang_en": { "en": "English (EN)", "zh-HK": "English (EN)", "zh-CN": "English (EN)" },
      "lang_tw": { "en": "繁體中文 (TW)", "zh-HK": "繁體中文 (TW)", "zh-CN": "繁體中文 (TW)" },
      "lang_cn": { "en": "简体中文 (CN)", "zh-HK": "简体中文 (CN)", "zh-CN": "简体中文 (CN)" },
      "mobile_menu_open": { "en": "Open menu", "zh-HK": "開啟選單", "zh-CN": "开启菜单" },
      "mobile_lang_select": { "en": "Select Language", "zh-HK": "選擇語言", "zh-CN": "选择语言" },

      // 導覽列 (Mobile, data-key 相同)
      "nav_features_m": { "en": "Features", "zh-HK": "功能特色", "zh-CN": "功能特色" },
      "nav_how_m": { "en": "How it works", "zh-HK": "運作方式", "zh-CN": "运作方式" },
      "nav_story_m": { "en": "Story", "zh-HK": "我們的故事", "zh-CN": "我们的故事" },
      "nav_about_m": { "en": "About Us", "zh-HK": "關於我們", "zh-CN": "关于我们" },
      "nav_contact_m": { "en": "Contact", "zh-HK": "聯絡我們", "zh-CN": "联系我们" },
      "nav_faq_m": { "en": "FAQ", "zh-HK": "常見問題", "zh-CN": "常见问题" },
      "lang_en_m": { "en": "English (EN)", "zh-HK": "English (EN)", "zh-CN": "English (EN)" },
      "lang_tw_m": { "en": "繁體中文 (TW)", "zh-HK": "繁體中文 (TW)", "zh-CN": "繁體中文 (TW)" },
      "lang_cn_m": { "en": "简体中文 (CN)", "zh-HK": "简体中文 (CN)", "zh-CN": "简体中文 (CN)" },

      // 導覽列 (不同頁面)
      "nav_demo": { "en": "Demo", "zh-HK": "觀看範例", "zh-CN": "观看示例" },
      "nav_demo_m": { "en": "Demo", "zh-HK": "觀看範例", "zh-CN": "观看示例" },
      "nav_back_home": { "en": "Back to Home", "zh-HK": "返回首頁", "zh-CN": "返回首页" },
      "nav_back_home_m": { "en": "Back to Home", "zh-HK": "返回首頁", "zh-CN": "返回首页" },
      
      // Hero (index.html)
      "hero_title": { "en": "Live inside your memories.", "zh-HK": "活在你的記憶之中。", "zh-CN": "活在你的记忆之中。" },
      "hero_subtitle": { "en": "MemoSpace turns everyday videos into immersive 3D spaces—captured with <strong>MemoLens</strong>, rebuilt with 3DGS, and relived in VisionPro.", "zh-HK": "MemoSpace 將日常影片變為沉浸式 3D 空間——透過 <strong>MemoLens</strong> 拍攝，經由 3DGS 重建，並在 VisionPro 中重溫。", "zh-CN": "MemoSpace 将日常视频变为沉浸式 3D 空间——通过 <strong>MemoLens</strong> 拍摄，经由 3DGS 重建，并在 VisionPro 中重温。" },
      "hero_cta_demo": { "en": "Watch Demo", "zh-HK": "觀看範例", "zh-CN": "观看示例" },
      "hero_cta_demo_aria": { "en": "Watch Demo", "zh-HK": "觀看範例", "zh-CN": "观看示例" },
      "hero_cta_visionos": { "en": "Get MemoSpace (VisionOS)", "zh-HK": "取得 MemoSpace (VisionOS)", "zh-CN": "获取 MemoSpace (VisionOS)" },
      "hero_cta_visionos_aria": { "en": "Get MemoSpace (VisionOS)", "zh-HK": "取得 MemoSpace (VisionOS)", "zh-CN": "获取 MemoSpace (VisionOS)" },
      "hero_cta_ios": { "en": "Get MemoLens (iOS)", "zh-HK": "取得 MemoLens (iOS)", "zh-CN": "获取 MemoLens (iOS)" },
      "hero_cta_academy": { "en": "read more on<br><strong>ferryman.academy</strong>", "zh-HK": "前往 <strong>ferryman.academy</strong><br>閱讀更多", "zh-CN": "前往 <strong>ferryman.academy</strong><br>阅读更多" },
      "hero_cta_academy_aria": { "en": "Read more on ferryman.academy", "zh-HK": "前往 ferryman.academy 閱讀更多", "zh-CN": "前往 ferryman.academy 阅读更多" },
      "hero_badge_3dgs": { "en": "3D Gaussian Splatting", "zh-HK": "3D 高斯潑濺", "zh-CN": "3D 高斯泼溅" },
      "hero_badge_visionpro": { "en": "Vision Pro", "zh-HK": "Vision Pro", "zh-CN": "Vision Pro" },
      "hero_cta_ig": { "en": "Follow on Instagram", "zh-HK": "在 Instagram 上追蹤", "zh-CN": "在 Instagram 上关注" },
      "hero_cta_ig_aria": { "en": "Follow on Instagram", "zh-HK": "在 Instagram 上追蹤", "zh-CN": "在 Instagram 上关注" },

      // Teaser (index.html)
      "teaser_title": { "en": "MemoSpace Concept Video", "zh-HK": "MemoSpace 概念影片", "zh-CN": "MemoSpace 概念视频" },
      "teaser_title_video": { "en": "MemoSpace Concept Video", "zh-HK": "MemoSpace 概念影片", "zh-CN": "MemoSpace 概念视频" },

      // Features (index.html)
      "features_title": { "en": "From phone video to living memory", "zh-HK": "從手機影片到鮮活記憶", "zh-CN": "从手机视频到鲜活记忆" },
      "features_subtitle": { "en": "Three steps. Capture, Generate, and Revisit.", "zh-HK": "三步驟：拍攝、生成、重溫。", "zh-CN": "三步骤：拍摄、生成、重温。" },
      "features_card1_title": { "en": "Capture with MemoLens", "zh-HK": "使用 MemoLens 拍攝", "zh-CN": "使用 MemoLens 拍摄" },
      "features_card1_desc": { "en": "AR-guided shooting ensures spatial accuracy. Each loop forms the foundation for future 3D reconstruction.", "zh-HK": "AR 引導拍攝確保空間準確性。每個循環都為未來的 3D 重建奠定基礎。", "zh-CN": "AR 引导拍摄确保空间准确性。每个循环都为未来的 3D 重建奠定基础。" },
      "features_card2_title": { "en": "Generate¹ via 3DGS Engine", "zh-HK": "透過 3DGS 引擎生成¹", "zh-CN": "通过 3DGS 引擎生成¹" },
      "features_card2_desc": { "en": "Convert videos into realistic 3D scenes using open-source 3DGS reconstruction tools platforms.", "zh-HK": "使用開源 3DGS 重建工具平台，將影片轉換為逼真的 3D 場景。", "zh-CN": "使用开源 3DGS 重建工具平台，将视频转换为逼真的 3D 场景。" },
      "features_card3_title": { "en": "Revisit with MemoSpace", "zh-HK": "使用 MemoSpace 重溫", "zh-CN": "使用 MemoSpace 重温" },
      "features_card3_desc": { "en": "Experience the reconstructed scene in VR. Walk back into memories through immersive exploration.", "zh-HK": "在 VR 中體驗重建的場景。透過沉浸式探索走回記憶之中。", "zh-CN": "在 VR 中体验重建的场景。通过沉浸式探索走回记忆之中。" },
      "features_footnote": { "en": "¹ The generation process is not operated by MemoSpace. Users upload MemoLens-guided videos to open-source 3DGS platforms for reconstruction. MemoSpace and MemoLens are responsible only for the capture and revisit parts of the workflow.", "zh-HK": "¹ 生成過程並非由 MemoSpace 操作。用戶將 MemoLens 引導拍攝的影片上傳至開源 3DGS 平台進行重建。MemoSpace 和 MemoLens 僅負責工作流中的拍攝與重溫部分。", "zh-CN": "¹ 生成过程并非由 MemoSpace 操作。用户将 MemoLens 引导拍摄的视频上传至开源 3DGS 平台进行重建。MemoSpace 和 MemoLens 仅负责工作流中的拍摄与重温部分。" },

      // How it works (index.html)
      "how_step1": { "en": "Use <strong>MemoLens</strong> for AR-guided 360° recording to ensure spatial precision.", "zh-HK": "使用 <strong>MemoLens</strong> 進行 AR 引導的 360° 錄製，確保空間精度。", "zh-CN": "使用 <strong>MemoLens</strong> 进行 AR 引导的 360° 录制，确保空间精度。" },
      "how_step2": { "en": "Export your video and process it with an open-source <strong>3DGS</strong> reconstruction engine.", "zh-HK": "匯出您的影片，並使用開源 <strong>3DGS</strong> 重建引擎進行處理。", "zh-CN": "导出您的视频，并使用开源 <strong>3DGS</strong> 重建引擎进行处理。" },
      "how_step3": { "en": "Import the 3D scene into <strong>MemoSpace</strong> to relive and explore in VR.", "zh-HK": "將 3D 場景匯入 <strong>MemoSpace</strong>，在 VR 中重溫與探索。", "zh-CN": "将 3D 场景导入 <strong>MemoSpace</strong>，在 VR 中重温与探索。" },
      "how_title": { "en": "From capture to revisit", "zh-HK": "從拍攝到重溫", "zh-CN": "从拍摄到重温" },
      "how_subtitle": { "en": "Each stage works independently — MemoLens captures, open-source 3DGS rebuilds, and MemoSpace replays. Together they form a seamless bridge between memory and immersion.", "zh-HK": "每個階段獨立運作——MemoLens 負責拍攝，開源 3DGS 負責重建，MemoSpace 負責重播。它們共同構成了記憶與沉浸感之間的無縫橋樑。", "zh-CN": "每个阶段独立运作——MemoLens 负责拍摄，开源 3DGS 负责重建，MemoSpace 负责重播。它们共同构成了记忆与沉浸感之间的无缝桥梁。" },
      "how_btn": { "en": "View sample scene", "zh-HK": "查看範例場景", "zh-CN": "查看示例场景" },
      "how_footnote": { "en": "* Powered by open-source 3DGS engine under MIT License.", "zh-HK": "* 由 MIT 授權的開源 3DGS 引擎驅動。", "zh-CN": "* 由 MIT 授权的开源 3DGS 引擎驱动。" },

      // Story (index.html)
      "story_title": { "en": "Memories that carry people forward", "zh-HK": "承載人們前行的記憶", "zh-CN": "承载人们前行的记忆" },
      "story_subtitle": { "en": "Born from our Yunnan service-learning journey, MemoSpace preserves places and stories—so families and communities can revisit them together.", "zh-HK": "源於我們的雲南服務學習之旅，MemoSpace 致力於保存地方與故事——讓家庭和社區能共同重溫。", "zh-CN": "源于我们的云南服务学习之旅，MemoSpace 致力于保存地方与故事——让家庭和社区能共同重温。" },
      "story_chip1": { "en": "SDG 3 · Well-being", "zh-HK": "SDG 3 · 良好健康與福祉", "zh-CN": "SDG 3 · 良好健康与福祉" },
      "story_chip2": { "en": "SDG 11 · Sustainable Cities", "zh-HK": "SDG 11 · 可持續發展城市及社區", "zh-CN": "SDG 11 · 可持续发展城市及社区" },
      "story_chip3": { "en": "Digital Heritage", "zh-HK": "數位遺產", "zh-CN": "数字遗产" },
      "story_panel_title": { "en": "Your data only stays on your device", "zh-HK": "您的資料僅留在您的裝置上", "zh-CN": "您的数据仅留在您的设备上" },
      "story_panel_desc": { "en": "MemoSpace and MemoLens do not collect or upload any personal data. All captured materials are stored locally on your iPhone and remain fully under your control.", "zh-HK": "MemoSpace 和 MemoLens 不會收集或上傳任何個人資料。所有拍攝的材料都儲存在您 iPhone 的本機，並完全由您掌控。", "zh-CN": "MemoSpace 和 MemoLens 不会收集或上传任何个人数据。所有拍摄的材料都存储在您 iPhone 的本地，并完全由您掌控。" },

      // About (index.html)
      "about_title": { "en": "Meet the Memory Ferrymen", "zh-HK": "認識「記憶擺渡人」", "zh-CN": "认识“记忆摆渡人”" },
      "about_subtitle": { "en": "We are a team of creators, engineers, and storytellers from <strong>The Hong Kong Polytechnic University</strong>, united by a mission to preserve human memories through immersive technology.", "zh-HK": "我們是一群來自<strong>香港理工大學</strong>的創作者、工程師和敘事者，因「透過沉浸式技術保存人類記憶」的使命而團結。", "zh-CN": "我们是一群来自<strong>香港理工大学</strong>的创作者、工程师和叙事者，因“通过沉浸式技术保存人类记忆”的使命而团结。" },
      "about_team1_name": { "en": "Kelvin LI", "zh-HK": "Kelvin LI", "zh-CN": "Kelvin LI" },
      "about_team1_role": { "en": "Team Captain / Computer Science", "zh-HK": "隊長 / 計算機科學", "zh-CN": "队长 / 计算机科学" },
      "about_team2_name": { "en": "Bobby LI", "zh-HK": "Bobby LI", "zh-CN": "Bobby LI" },
      "about_team2_role": { "en": "Team Member / Computer Science", "zh-HK": "隊員 / 計算機科學", "zh-CN": "队员 / 计算机科学" },
      "about_team3_name": { "en": "Allen LIAN", "zh-HK": "Allen LIAN", "zh-CN": "Allen LIAN" },
      "about_team3_role": { "en": "Team Member / Computer Science", "zh-HK": "隊員 / 計算機科學", "zh-CN": "队员 / 计算机科学" },
      "about_advisor_name": { "en": "Prof. <span>Peter H. F. NG</span>", "zh-HK": "<span>吳曉峰</span> 教授", "zh-CN": "<span>吴晓峰</span> 教授" },
      "about_advisor_role": { "en": "Joint Assistant Professor, Department of Computing and Department of Rehabilitation Sciences, PolyU (H.K.)", "zh-HK": "香港理工大學 電子計算學系及康復治療科學系 聯合助理教授", "zh-CN": "香港理工大学 电子计算学系及康复治疗科学系 联合助理教授" },
      "about_advisor_chip1": { "en": "HKPolyU", "zh-HK": "香港理大", "zh-CN": "香港理大" },
      "about_advisor_chip2": { "en": "Department of Computing", "zh-HK": "電子計算學系", "zh-CN": "电子计算学系" },
      "about_advisor_chip3": { "en": "Department of Rehabilitation Sciences", "zh-HK": "康復治療科學系", "zh-CN": "康复治疗科学系" },

      // Contact (index.html)
      "contact_title": { "en": "Contact Us", "zh-HK": "聯絡我們", "zh-CN": "联系我们" },
      "contact_subtitle1": { "en": "Have questions, media inquiries, or collaboration ideas?", "zh-HK": "有任何問題、媒體查詢或合作想法嗎？", "zh-CN": "有任何问题、媒体查询或合作想法吗？" },
      "contact_subtitle2": { "en": "We’d love to hear from you.", "zh-HK": "我們很樂意聽聽您的意見。", "zh-CN": "我们很乐意听听您的意见。" },
      "contact_btn_email": { "en": "Email Us", "zh-HK": "Email 聯絡", "zh-CN": "Email 联系" },
      "contact_btn_email_aria": { "en": "Email Us", "zh-HK": "Email 聯絡", "zh-CN": "Email 联系" },
      "contact_btn_discord": { "en": "Join our Discuss Group", "zh-HK": "加入討論群組", "zh-CN": "加入讨论群组" },
      "contact_btn_discord_aria": { "en": "Join our Discuss Group", "zh-HK": "加入討論群組", "zh-CN": "加入讨论群组" },
      "contact_email_link": { "en": "Or reach us directly at <a href=\"mailto:peter.nhf@polyu.edu.hk\" class=\"link\">peter.nhf@polyu.edu.hk</a>", "zh-HK": "或直接透過 <a href=\"mailto:peter.nhf@polyu.edu.hk\" class=\"link\">peter.nhf@polyu.edu.hk</a> 聯絡我們", "zh-CN": "或直接通过 <a href=\"mailto:peter.nhf@polyu.edu.hk\" class=\"link\">peter.nhf@polyu.edu.hk</a> 联系我们" },

      // FAQ (index.html)
      "faq_title": { "en": "Quick FAQ", "zh-HK": "常見問題", "zh-CN": "常见问题" },
      "faq_q1_q": { "en": "Do I need special gear?", "zh-HK": "我需要特殊設備嗎？", "zh-CN": "我需要特殊设备吗？" },
      "faq_q1_a": { "en": "No. Just your iPhone with MemoLens.", "zh-HK": "不需要。只需您的 iPhone 和 MemoLens。", "zh-CN": "不需要。只需您的 iPhone 和 MemoLens。" },
      "faq_q2_q": { "en": "How can I extract the highlights of my video and post them on Social Media platforms?", "zh-HK": "我可以怎麼提取中間的精彩瞬間發佈到社交平台？", "zh-CN": "我可以怎么提取中间的精彩瞬间发布到社交平台？" },
      "faq_q2_a": { "en": "The videos you shoot with our app will be saved in your photo album, and you can extract your highlights and share them on social media platforms.", "zh-HK": "透過我們的 App 拍攝後的素材影片會儲存在你相簿，你可以從中剪取你的精華片段發至社交平台。", "zh-CN": "透过我们的 App 拍摄后的素材影片会储存在您的相冊，您可以从中剪取您的精华片段发至社交平台。" },
      "faq_q3_q": { "en": "Is my data safe?", "zh-HK": "我的資料安全嗎？", "zh-CN": "我的数据安全吗？" },
      "faq_q3_a": { "en": "We do not collect any data from your device. All data will only save in your local device.", "zh-HK": "我們不會從您的裝置收集任何資料。所有資料只會儲存在您的本機裝置中。", "zh-CN": "我们不会从您的设备收集任何数据。所有数据只会保存在您的本地设备中。" },
      "faq_q4_q": { "en": "When can I try it?", "zh-HK": "我什麼時候可以試用？", "zh-CN": "我什么时候可以试用？" },
      "faq_q4_a": { "en": "Public beta is coming soon. Stay tuned on our latest news.", "zh-HK": "公開測試即將推出。請持續關注我們的最新消息。", "zh-CN": "公开测试即将推出。请持续关注我们的最新消息。" },

      // Footer (index.html)
      "footer_copy": { "en": "© 2025 Memory Ferrymen. All rights reserved.", "zh-HK": "© 2025 Memory Ferrymen. 版權所有。", "zh-CN": "© 2025 Memory Ferrymen. 版权所有。" },
      "footer_link_ig": { "en": "Instagram", "zh-HK": "Instagram", "zh-CN": "Instagram" },

      // Modal (index.html)
      "modal_title": { "en": "Coming Soon", "zh-HK": "即將推出", "zh-CN": "即将推出" },
      "modal_desc": { "en": "Public beta is coming soon. Stay tuned on our latest news.", "zh-HK": "公開測試即將推出。請持續關注我們的最新消息。", "zh-CN": "公开测试即将推出。请持续关注我们的最新消息。" },
      "modal_btn_ok": { "en": "OK", "zh-HK": "確定", "zh-CN": "确定" },
      "modal_close_aria": { "en": "Close", "zh-HK": "關閉", "zh-CN": "关闭" },

      // Back to Top (index.html)
      "btt_label": { "en": "Back to top", "zh-HK": "回到頂部", "zh-CN": "回到顶部" },

      // === NEW: App Overview Cards ===
      "app_memospace_name": { "en": "MemoSpace", "zh-HK": "MemoSpace", "zh-CN": "MemoSpace" },
      // "app_memospace_desc": { "en": "Description...", "zh-HK": "描述...", "zh-CN": "描述..." },
      "app_memolens_name": { "en": "MemoLens", "zh-HK": "MemoLens", "zh-CN": "MemoLens" },
      // "app_memolens_desc": { "en": "Description...", "zh-HK": "描述...", "zh-CN": "描述..." },

      // === NEW: QR Modal ===
      "modal_qr_title": { "en": "Join Discussion Group", "zh-HK": "加入討論群組", "zh-CN": "加入讨论群组" },
      "modal_qr_close_aria": { "en": "Close QR Code Modal", "zh-HK": "關閉二維碼視窗", "zh-CN": "关闭二维码窗口" },

      // Demo Hero (demo.html)
      "demo_hero_title": { "en": "Demo Library", "zh-HK": "範例庫", "zh-CN": "示例库" },
      "demo_hero_subtitle": { "en": "Capture with <strong>MemoLens</strong> → Generate via open-source <strong>3DGS</strong> → Revisit with <strong>MemoSpace</strong>.", "zh-HK": "使用 <strong>MemoLens</strong> 拍攝 → 透過開源 <strong>3DGS</strong> 生成 → 使用 <strong>MemoSpace</strong> 重溫。", "zh-CN": "使用 <strong>MemoLens</strong> 拍摄 → 通过开源 <strong>3DGS</strong> 生成 → 使用 <strong>MemoSpace</strong> 重温。" },
      
      // Demo Grid (demo.html)
      "demo_grid_title": { "en": "Watch the demos", "zh-HK": "觀看範例", "zh-CN": "观看示例" },
      "demo_grid_subtitle": { "en": "Captured with MemoLens and reconstructed via open-source 3DGS tools, then revisited inside MemoSpace.", "zh-HK": "使用 MemoLens 拍攝，透過開源 3DGS 工具重建，然後在 MemoSpace 中重溫。", "zh-CN": "使用 MemoLens 拍摄，通过开源 3DGS 工具重建，然后在 MemoSpace 中重温。" },
      "demo_vid1_title": { "en": "Hong Kong, Sha Tin, Tsang Tai Uk", "zh-HK": "香港，沙田，曾大屋", "zh-CN": "香港，沙田，曾大屋" },
      "demo_vid1_title_video": { "en": "Hong Kong, Sha Tin, Tsang Tai Uk", "zh-HK": "香港，沙田，曾大屋", "zh-CN": "香港，沙田，曾大屋" },
      "demo_vid2_title": { "en": "Yunnan, The Confucian Temple", "zh-HK": "雲南，文廟", "zh-CN": "云南，文庙" },
      "demo_vid2_title_video": { "en": "Yunnan, The Confucian Temple", "zh-HK": "雲南，文廟", "zh-CN": "云南，文庙" },
      "demo_vid3_title": { "en": "Yunnan, Double Dragon Bridge", "zh-HK": "雲南，雙龍橋", "zh-CN": "云南，双龙桥" },
      "demo_vid3_title_video": { "en": "Yunnan, Double Dragon Bridge", "zh-HK": "雲南，雙龍橋", "zh-CN": "云南，双龙桥" },
      "demo_vid4_title": { "en": "Yunnan, Tuanshan Village", "zh-HK": "雲南，團山村", "zh-CN": "云南，团山村" },
      "demo_vid4_title_video": { "en": "Yunnan, Tuanshan Village", "zh-HK": "雲南，團山村", "zh-CN": "云南，团山村" },
      "demo_footnote": { "en": "* Generation is performed via third-party open-source 3DGS tools. MemoSpace and MemoLens handle the capture and revisit parts of the workflow.", "zh-HK": "* 生成是透過第三方開源 3DGS 工具執行。MemoSpace 和 MemoLens 處理工作流中的拍攝和重溫部分。", "zh-CN": "* 生成是通过第三方开源 3DGS 工具执行。MemoSpace 和 MemoLens 处理工作流中的拍摄和重温部分。" }
    };

    let currentLang = 'en';
    const pageKey = document.getElementById('demo-hero') ? 'demo' : 'index';

    function applyLanguage(lang) {
      if (!lang || !translations["nav_features"][lang]) {
        console.warn(`Language ${lang} not found, defaulting to 'en'.`);
        lang = 'en';
      }
      currentLang = lang;
      
      // 更新 HTML 標籤的 lang 屬性
      document.documentElement.lang = lang.startsWith('zh') ? lang.replace('_', '-') : 'en';

      // 更新頁面標題
      const titleKey = pageKey === 'demo' ? 'doc_title_demo' : 'doc_title_index';
      if (translations[titleKey] && translations[titleKey][lang]) {
        document.title = translations[titleKey][lang];
      }

      // 更新所有帶 data-key 的元素
      document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.dataset.key;
        if (translations[key] && translations[key][lang]) {
          el.innerHTML = translations[key][lang];
        }
      });

      // 更新所有帶 data-key-aria 的元素
      document.querySelectorAll('[data-key-aria]').forEach(el => {
        const key = el.dataset.keyAria;
        if (translations[key] && translations[key][lang]) {
          el.setAttribute('aria-label', translations[key][lang]);
        }
      });
      
      // 更新所有帶 data-key-title 的元素
      document.querySelectorAll('[data-key-title]').forEach(el => {
        const key = el.dataset.keyTitle;
        if (translations[key] && translations[key][lang]) {
          el.setAttribute('title', translations[key][lang]);
        }
      });

      // 更新 meta (範例, 可選)
      // const ogTitle = document.querySelector('[data-key="og_title_' + pageKey + '"]');
      // if (ogTitle && translations[ogTitle.dataset.key] && translations[ogTitle.dataset.key][lang]) {
      //   ogTitle.setAttribute('content', translations[ogTitle.dataset.key][lang]);
      // }

      // 更新所有語言選項的 .is-active 狀態
      document.querySelectorAll('.lang-option').forEach(opt => {
        if (opt.dataset.lang === lang) {
          opt.classList.add('is-active');
        } else {
          opt.classList.remove('is-active');
        }
      });
    }

    function getInitialLang() {
      const savedLang = localStorage.getItem('lang');
      if (savedLang && translations["nav_features"][savedLang]) {
        return savedLang;
      }
      
      const browserLang = navigator.language || navigator.userLanguage;
      if (browserLang.startsWith('zh-HK')) {
        return 'zh-HK';
      }
      if (browserLang.startsWith('zh-CN') || browserLang.startsWith('zh')) {
        return 'zh-CN';
      }
      return 'en';
    }

    // --- 綁定事件 ---

    // 1. 桌面版切換器
    const desktopSwitcher = document.getElementById('desktopLangBtn')?.closest('.lang-switcher');
    const desktopDropdown = document.getElementById('desktopLangDropdown');
    
    if (desktopSwitcher && desktopDropdown) {
      desktopSwitcher.addEventListener('click', (e) => {
        e.stopPropagation();
        desktopSwitcher.classList.toggle('is-open');
      });
    }

    // 2. 行動版切換器
    const mobileSwitcher = document.getElementById('mobileLangBtn')?.closest('.lang-switcher-mobile');
    const mobileDropdown = document.getElementById('mobileLangDropdown');

    if (mobileSwitcher && mobileDropdown) {
      mobileSwitcher.querySelector('button').addEventListener('click', (e) => {
        e.preventDefault();
        mobileSwitcher.classList.toggle('is-open');
      });
    }

    // 3. 綁定所有語言選項
    document.querySelectorAll('.lang-option').forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // 阻止觸發父層的 click

        const newLang = option.dataset.lang;
        if (newLang !== currentLang) {
          localStorage.setItem('lang', newLang);
          applyLanguage(newLang);
        }

        // 關閉選單
        desktopSwitcher?.classList.remove('is-open');
        mobileSwitcher?.classList.remove('is-open');
      });
    });

    // 4. 點擊外部關閉 (僅桌面版)
    document.addEventListener('click', (e) => {
      if (desktopSwitcher && !desktopSwitcher.contains(e.target)) {
        desktopSwitcher.classList.remove('is-open');
      }
    });

    // --- 初始化 ---
    applyLanguage(getInitialLang());

  })();

  

})(); // IIFE END