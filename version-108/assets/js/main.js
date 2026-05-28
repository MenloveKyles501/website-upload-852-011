(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var forms = document.querySelectorAll('.site-search-form');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startHero() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
        startHero();
      });
    });

    if (slides.length > 1) {
      startHero();
    }
  }

  var filterInput = document.querySelector('.card-filter-input');
  var filterSelect = document.querySelector('.card-year-select');
  var filterList = document.querySelector('.filter-list');
  var emptyState = document.querySelector('.empty-state');

  function filterCards() {
    if (!filterList) {
      return;
    }
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = filterSelect ? filterSelect.value : '';
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
    var visible = 0;

    cards.forEach(function (card) {
      var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-tags') || '')).toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var matched = (!keyword || text.indexOf(keyword) !== -1) && (!year || cardYear === year);
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visible ? 'none' : 'block';
    }
  }

  if (filterInput) {
    filterInput.addEventListener('input', filterCards);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', filterCards);
  }

  function createCard(movie) {
    var article = document.createElement('article');
    article.className = 'movie-card';
    article.innerHTML = [
      '<a href="' + movie.link + '" class="card-cover" aria-label="' + escapeHtml(movie.title) + '">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="duration">' + escapeHtml(movie.duration) + '</span>',
      '</a>',
      '<div class="card-body">',
      '<a class="card-title" href="' + movie.link + '">' + escapeHtml(movie.title) + '</a>',
      '<p>' + escapeHtml(movie.desc) + '</p>',
      '<div class="tag-row">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
      '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.category) + '</span></div>',
      '</div>'
    ].join('');
    return article;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  var searchInput = document.getElementById('search-page-input');
  var searchResults = document.getElementById('search-results');
  var searchSummary = document.getElementById('search-summary');

  function renderSearch() {
    if (!searchInput || !searchResults || !window.MovieIndex) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    searchInput.value = query;
    var normalized = query.trim().toLowerCase();
    searchResults.innerHTML = '';

    if (!normalized) {
      searchSummary.textContent = '输入关键词后即可筛选片名、年份、地区、类型与标签。';
      window.MovieIndex.slice(0, 24).forEach(function (movie) {
        searchResults.appendChild(createCard(movie));
      });
      return;
    }

    var results = window.MovieIndex.filter(function (movie) {
      var text = [movie.title, movie.desc, movie.year, movie.region, movie.type, movie.genre, movie.category, movie.tags.join(' ')].join(' ').toLowerCase();
      return text.indexOf(normalized) !== -1;
    });

    searchSummary.textContent = results.length ? '找到 ' + results.length + ' 条相关内容' : '没有找到匹配内容';
    results.slice(0, 120).forEach(function (movie) {
      searchResults.appendChild(createCard(movie));
    });
  }

  if (searchInput && searchResults) {
    renderSearch();
    searchInput.addEventListener('input', function () {
      var query = searchInput.value.trim();
      var url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
      window.history.replaceState(null, '', url);
      renderSearch();
    });
  }

  var players = document.querySelectorAll('.video-stage');
  players.forEach(function (stage) {
    var video = stage.querySelector('.movie-video');
    var overlay = stage.querySelector('.video-overlay');
    var stream = video ? video.getAttribute('data-stream') : '';
    var ready = false;
    var hls = null;

    function loadVideo() {
      if (!video || !stream || ready) {
        return Promise.resolve();
      }
      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        return new Promise(function (resolve) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && overlay) {
              overlay.querySelector('strong').textContent = '视频暂时无法加载';
            }
          });
        });
      }

      video.src = stream;
      return Promise.resolve();
    }

    function playVideo() {
      loadVideo().then(function () {
        if (overlay) {
          overlay.classList.add('hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            if (overlay) {
              overlay.classList.remove('hidden');
            }
          });
        }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 && overlay) {
          overlay.classList.remove('hidden');
        }
      });
    }

    document.querySelectorAll('.play-now').forEach(function (button) {
      button.addEventListener('click', function () {
        stage.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        playVideo();
      });
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
