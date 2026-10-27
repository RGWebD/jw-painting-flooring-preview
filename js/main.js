(function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', links.classList.contains('open'));
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
    });
  }

  // Scroll reveal
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

  // Home project slideshow
  document.querySelectorAll('[data-slideshow]').forEach(function (root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll('.slideshow-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.slideshow-dot'));
    if (!slides.length) return;
    var i = Math.max(0, slides.findIndex(function (s) { return s.classList.contains('is-active'); }));
    var interval = parseInt(root.getAttribute('data-interval') || '5000', 10);
    var timer = null;
    var paused = false;
    var touchX = null;

    function show(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, idx) { s.classList.toggle('is-active', idx === i); });
      dots.forEach(function (d, idx) { d.classList.toggle('is-active', idx === i); });
    }
    function next() { show(i + 1); }
    function prev() { show(i - 1); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() {
      stop();
      if (paused || slides.length < 2) return;
      timer = setInterval(next, interval);
    }

    var prevBtn = root.querySelector('.slideshow-prev');
    var nextBtn = root.querySelector('.slideshow-next');
    if (prevBtn) prevBtn.addEventListener('click', function (e) { e.preventDefault(); prev(); start(); });
    if (nextBtn) nextBtn.addEventListener('click', function (e) { e.preventDefault(); next(); start(); });
    dots.forEach(function (d) {
      d.addEventListener('click', function () {
        var idx = parseInt(d.getAttribute('data-index'), 10);
        if (!isNaN(idx)) { show(idx); start(); }
      });
    });

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
      if (Math.abs(dx) < 40) return;
      if (dx < 0) next(); else prev();
      start();
    }, { passive: true });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    show(i);
    start();
  });

})();
