(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !mobileNav) {
      return;
    }
    toggle.addEventListener('click', function () {
      toggle.classList.toggle('is-open');
      mobileNav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function initLocalFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var root = panel.parentElement || document;
      var search = panel.querySelector('[data-live-search]');
      var region = panel.querySelector('[data-filter-region]');
      var year = panel.querySelector('[data-filter-year]');
      var category = panel.querySelector('[data-filter-category]');
      var count = panel.querySelector('[data-result-count]');
      var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card-list] [data-movie-card]'));
      if (!cards.length) {
        cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-list] [data-movie-card]'));
      }

      function apply() {
        var query = normalize(search && search.value);
        var regionValue = normalize(region && region.value);
        var yearValue = normalize(year && year.value);
        var categoryValue = normalize(category && category.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-category'),
            card.getAttribute('data-tags')
          ].join(' '));
          var ok = true;
          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }
          if (regionValue && normalize(card.getAttribute('data-region')).indexOf(regionValue) === -1) {
            ok = false;
          }
          if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) {
            ok = false;
          }
          if (categoryValue && normalize(card.getAttribute('data-category')) !== categoryValue) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = String(visible);
        }
      }

      [search, region, year, category].forEach(function (input) {
        if (input) {
          input.addEventListener('input', apply);
          input.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function createResultCard(movie) {
    var article = document.createElement('article');
    article.className = 'movie-card';
    article.setAttribute('data-movie-card', '');
    article.innerHTML = [
      '<a class="movie-poster" href="' + movie.url + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '  <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '  <span class="poster-shade"></span>',
      '  <span class="play-badge">播放</span>',
      '  <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
      '</a>',
      '<div class="movie-card-body">',
      '  <div class="card-meta-line"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '  <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '  <p>' + escapeHtml(movie.oneLine || movie.genre) + '</p>',
      '  <div class="tag-row"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
      '</div>'
    ].join('');
    return article;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initGlobalSearch() {
    var panel = document.querySelector('[data-search-page]');
    var results = document.querySelector('[data-global-results]');
    if (!panel || !results || !window.SITE_MOVIES) {
      return;
    }
    var queryInput = panel.querySelector('[data-global-search]');
    var regionInput = panel.querySelector('[data-global-region]');
    var yearInput = panel.querySelector('[data-global-year]');
    var categoryInput = panel.querySelector('[data-global-category]');
    var count = panel.querySelector('[data-global-count]');
    var params = new URLSearchParams(window.location.search);
    if (queryInput && params.get('q')) {
      queryInput.value = params.get('q');
    }

    function render() {
      var query = normalize(queryInput && queryInput.value);
      var region = normalize(regionInput && regionInput.value);
      var year = normalize(yearInput && yearInput.value);
      var category = normalize(categoryInput && categoryInput.value);
      var matches = window.SITE_MOVIES.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.oneLine,
          movie.category
        ].join(' '));
        if (query && haystack.indexOf(query) === -1) {
          return false;
        }
        if (region && normalize(movie.region).indexOf(region) === -1) {
          return false;
        }
        if (year && normalize(movie.year) !== year) {
          return false;
        }
        if (category && normalize(movie.category) !== category) {
          return false;
        }
        return true;
      });

      results.innerHTML = '';
      matches.slice(0, 160).forEach(function (movie) {
        results.appendChild(createResultCard(movie));
      });
      if (count) {
        count.textContent = String(matches.length);
      }
    }

    [queryInput, regionInput, yearInput, categoryInput].forEach(function (input) {
      if (input) {
        input.addEventListener('input', render);
        input.addEventListener('change', render);
      }
    });
    render();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (wrapper) {
      var video = wrapper.querySelector('video');
      var button = wrapper.querySelector('[data-play-button]');
      if (!video || !button) {
        return;
      }
      var hlsSource = video.getAttribute('data-hls');
      var fallbackSource = video.getAttribute('data-fallback');
      var initialized = false;

      function setupSource() {
        if (initialized) {
          return;
        }
        initialized = true;
        if (hlsSource && video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = hlsSource;
        } else if (hlsSource && window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(hlsSource);
          hls.attachMedia(video);
          wrapper._hls = hls;
        } else if (fallbackSource) {
          video.src = fallbackSource;
        }
      }

      function play() {
        setupSource();
        wrapper.classList.add('is-playing');
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {
            video.controls = true;
          });
        }
      }

      button.addEventListener('click', play);
      video.addEventListener('play', function () {
        wrapper.classList.add('is-playing');
      });
    });
  }

  ready(function () {
    initNavigation();
    initHero();
    initLocalFilters();
    initGlobalSearch();
    initPlayers();
  });
})();
