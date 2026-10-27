(function () {
  function markIn(el) {
    try { el.classList.add('in'); } catch (e) {}
  }
  function markAllReveals() {
    try {
      document.querySelectorAll('.reveal').forEach(markIn);
    } catch (e) {}
  }

  // Mark above-the-fold reveals BEFORE adding html.js so they never go blank.
  try {
    document.querySelectorAll('.reveal').forEach(function (el) {
      var r = el.getBoundingClientRect();
      var vh = window.innerHeight || 800;
      if (r.top < vh + 120 && r.bottom > -40) markIn(el);
    });
  } catch (e) {
    markAllReveals();
  }

  try {
    document.documentElement.classList.add('js');
  } catch (e) {}

  try {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav-links');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', links.classList.contains('open'));
      });
      links.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          links.classList.remove('open');
        });
      });
    }
  } catch (e) {}

  try {
    var els = document.querySelectorAll('.reveal:not(.in)');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            markIn(e.target);
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '100px 0px 0px 0px' });
      els.forEach(function (el) { io.observe(el); });
    } else {
      markAllReveals();
    }
    setTimeout(markAllReveals, 1200);
  } catch (e) {
    markAllReveals();
  }

  try {
    document.querySelectorAll('[data-work-strip]').forEach(function (root) {
      var viewport = root.querySelector('.work-strip-viewport');
      var track = root.querySelector('.work-strip-track');
      var items = Array.prototype.slice.call(root.querySelectorAll('.work-strip-item'));
      if (!viewport || !track || items.length < 2) return;

      var page = 0;
      var timer = null;
      var paused = false;
      var interval = parseInt(root.getAttribute('data-interval') || '3500', 10);
      var touchX = null;

      function perPage() {
        var w = viewport.clientWidth;
        if (w <= 640) return 2;
        if (w <= 900) return 3;
        return 4;
      }
      function maxPage() {
        return Math.max(0, Math.ceil(items.length / perPage()) - 1);
      }
      function layout() {
        if (page > maxPage()) page = maxPage();
        var item = items[0];
        var gap = parseFloat(getComputedStyle(track).gap) || 8;
        var itemW = item.getBoundingClientRect().width;
        var n = perPage();
        var dx = page * n * (itemW + gap);
        track.style.transform = 'translateX(' + (-dx) + 'px)';
      }
      function next() {
        page = page >= maxPage() ? 0 : page + 1;
        layout();
      }
      function prev() {
        page = page <= 0 ? maxPage() : page - 1;
        layout();
      }
      function stop() { if (timer) { clearInterval(timer); timer = null; } }
      function start() {
        stop();
        if (paused || maxPage() < 1) return;
        timer = setInterval(next, interval);
      }

      var prevBtn = root.querySelector('.work-strip-prev');
      var nextBtn = root.querySelector('.work-strip-next');
      if (prevBtn) prevBtn.addEventListener('click', function () { prev(); start(); });
      if (nextBtn) nextBtn.addEventListener('click', function () { next(); start(); });

      root.addEventListener('mouseenter', function () { paused = true; stop(); });
      root.addEventListener('mouseleave', function () { paused = false; start(); });
      root.addEventListener('focusin', function () { paused = true; stop(); });
      root.addEventListener('focusout', function () { paused = false; start(); });
      root.addEventListener('touchstart', function (e) {
        if (e.changedTouches && e.changedTouches[0]) touchX = e.changedTouches[0].clientX;
      }, { passive: true });
      root.addEventListener('touchend', function (e) {
        if (touchX == null || !e.changedTouches || !e.changedTouches[0]) return;
        var dx = e.changedTouches[0].clientX - touchX;
        touchX = null;
        if (Math.abs(dx) < 35) return;
        if (dx < 0) next(); else prev();
        start();
      }, { passive: true });

      window.addEventListener('resize', function () { layout(); });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) stop(); else start();
      });

      layout();
      start();
    });
  } catch (e) {
    /* strip optional */
  }
})();
