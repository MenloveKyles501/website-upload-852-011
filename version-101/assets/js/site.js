
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function debounce(fn, wait) {
    var timer = null;
    return function () {
      var ctx = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(ctx, args);
      }, wait);
    };
  }

  function initNav() {
    var btn = qs("[data-menu-btn]");
    var nav = qs("[data-nav]");
    if (!btn || !nav) return;
    btn.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initCarousel() {
    var carousel = qs("[data-hero-carousel]");
    var dotsWrap = qs("[data-hero-dots]");
    if (!carousel || !dotsWrap) return;
    var slides = qsa("[data-hero-slide]", carousel);
    if (!slides.length) return;

    var dots = slides.map(function (_, index) {
      var dot = document.createElement("button");
      dot.className = "hero-dot" + (index === 0 ? " active" : "");
      dot.type = "button";
      dot.setAttribute("aria-label", "切换到第 " + (index + 1) + " 张");
      dot.addEventListener("click", function () {
        goTo(index);
      });
      dotsWrap.appendChild(dot);
      return dot;
    });

    var current = 0;
    var timer = null;

    function updateDots() {
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      carousel.scrollTo({
        left: carousel.clientWidth * current,
        behavior: "smooth",
      });
      updateDots();
      resetTimer();
    }

    function next() {
      goTo(current + 1);
    }

    function resetTimer() {
      if (timer) clearInterval(timer);
      timer = setInterval(next, 6000);
    }

    carousel.addEventListener(
      "scroll",
      debounce(function () {
        var index = Math.round(carousel.scrollLeft / carousel.clientWidth);
        if (index !== current) {
          current = index;
          updateDots();
        }
      }, 120)
    );

    var prevBtn = qs("[data-hero-prev]");
    var nextBtn = qs("[data-hero-next]");
    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(current - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(current + 1); });

    resetTimer();
  }

  function initSearch() {
    var input = qs("[data-search-input]");
    if (!input) return;
    var items = qsa("[data-search-item]");
    var counter = qs("[data-search-count]");
    var emptyState = qs("[data-search-empty]");

    function apply() {
      var term = input.value.trim().toLowerCase();
      var shown = 0;
      items.forEach(function (item) {
        var hay = (item.getAttribute("data-search") || "").toLowerCase();
        var ok = !term || hay.indexOf(term) !== -1;
        item.classList.toggle("hidden", !ok);
        if (ok) shown += 1;
      });
      if (counter) counter.textContent = String(shown);
      if (emptyState) emptyState.classList.toggle("hidden", shown !== 0);
    }

    input.addEventListener("input", debounce(apply, 80));
    apply();
  }

  function initPlayer() {
    var blocks = qsa("[data-player-block]");
    blocks.forEach(function (block) {
      var video = qs("video", block);
      var overlay = qs("[data-player-overlay]", block);
      var playBtn = qs("[data-play-btn]", block);
      if (!video || !overlay || !playBtn) return;

      var mp4 = video.getAttribute("data-mp4");
      var m3u8 = video.getAttribute("data-m3u8");

      function showOverlay(show) {
        overlay.classList.toggle("hidden", !show);
      }

      function safePlay() {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            showOverlay(true);
          });
        }
      }

      function loadSource() {
        if (m3u8 && window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
          try {
            var hls = new Hls();
            hls.loadSource(m3u8);
            hls.attachMedia(video);
            video._hls = hls;
            return;
          } catch (err) {}
        }

        if (m3u8 && video.canPlayType && video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = m3u8;
          return;
        }

        if (mp4) {
          video.src = mp4;
        }
      }

      loadSource();

      playBtn.addEventListener("click", function () {
        showOverlay(false);
        safePlay();
      });

      overlay.addEventListener("click", function () {
        showOverlay(false);
        safePlay();
      });

      video.addEventListener("play", function () {
        showOverlay(false);
      });

      video.addEventListener("pause", function () {
        showOverlay(true);
      });

      video.addEventListener("ended", function () {
        showOverlay(true);
      });

      showOverlay(true);
    });
  }

  function setCurrentNav() {
    var path = location.pathname.replace(/\/+$/, "");
    qsa("[data-nav-link]").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      if (!href) return;
      var clean = new URL(href, location.href).pathname.replace(/\/+$/, "");
      if (clean === path || (path === "" && clean.endsWith("index.html"))) {
        a.classList.add("active");
      }
    });
  }

  function initBackToTop() {
    var btn = qs("[data-top-btn]");
    if (!btn) return;
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  ready(function () {
    initNav();
    initCarousel();
    initSearch();
    initPlayer();
    setCurrentNav();
    initBackToTop();

    var year = qs("[data-current-year]");
    if (year) year.textContent = new Date().getFullYear();

    var count = qs("[data-total-count]");
    if (count) count.textContent = count.getAttribute("data-total-count") || count.textContent;
  });
})();
