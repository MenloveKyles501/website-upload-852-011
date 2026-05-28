
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function debounce(fn, wait) {
    let t = 0;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function slugify(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
  }

  function getMovieById(id) {
    return (window.SITE_MOVIES || []).find((m) => m.id === String(id).padStart(4, "0"));
  }

  function makeCard(movie, compact = false) {
    const a = document.createElement("a");
    a.className = "movie-card";
    a.href = `movie-${movie.id}.html`;
    a.innerHTML = `
      <div class="thumb">
        <img src="${movie.poster}" alt="${movie.title}">
        <div class="badge">${movie.year}</div>
        <div class="corner">${movie.region}</div>
      </div>
      <div class="body">
        <h4>${movie.title}</h4>
        <div class="meta">
          <span>${movie.genres.slice(0, 2).join(" / ")}</span>
          <span>·</span>
          <span>${movie.tags.slice(0, 2).join("、")}</span>
        </div>
        <p class="desc">${movie.one_line}</p>
      </div>
    `;
    return a;
  }

  function makeMini(movie) {
    const a = document.createElement("a");
    a.className = "mini-item";
    a.href = `movie-${movie.id}.html`;
    a.innerHTML = `
      <img src="${movie.poster}" alt="${movie.title}">
      <div>
        <h4>${movie.title}</h4>
        <p>${movie.year} · ${movie.region} · ${movie.genres.slice(0, 2).join(" / ")}</p>
      </div>
    `;
    return a;
  }

  function initHome() {
    const slider = byId("heroSlider");
    if (!slider) return;
    const slides = $$(".hero-slide", slider);
    if (!slides.length) return;
    let idx = 0;
    const setActive = (next) => {
      slides[idx].classList.remove("active");
      idx = (next + slides.length) % slides.length;
      slides[idx].classList.add("active");
    };
    const nextBtn = byId("heroNext");
    const prevBtn = byId("heroPrev");
    if (nextBtn) nextBtn.addEventListener("click", () => setActive(idx + 1));
    if (prevBtn) prevBtn.addEventListener("click", () => setActive(idx - 1));
    window.setInterval(() => setActive(idx + 1), 6500);
  }

  function initPlayer() {
    const video = byId("moviePlayer");
    if (!video) return;
    const src = video.getAttribute("data-hls-src");
    if (!src) return;

    function setNative() {
      video.src = src;
      video.play().catch(() => {});
    }

    if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30,
        backBufferLength: 10
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (_event, data) {
        if (data && data.fatal) {
          try {
            hls.destroy();
          } catch (e) {}
          setNative();
        }
      });
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(() => {});
      });
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      setNative();
      return;
    }

    const fallback = byId("playerFallback");
    if (fallback) {
      fallback.textContent = "当前浏览器对 HLS 支持有限，已保留播放器与片源信息。请在支持 HLS 的浏览器中打开，或继续浏览其他页面。";
    }
  }

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[·•\-/]/g, "")
      .trim();
  }

  function matches(movie, q, genre, region, year) {
    if (genre && !movie.genres.join(",").includes(genre)) return false;
    if (region && movie.region !== region) return false;
    if (year && String(movie.year) !== String(year)) return false;
    if (!q) return true;
    const hay = normalize([
      movie.title,
      movie.one_line,
      movie.summary,
      movie.region,
      movie.type,
      movie.year,
      movie.genres.join(" "),
      movie.tags.join(" ")
    ].join(" "));
    return normalize(q).split(/[\s,，]+/).every((x) => x && hay.includes(x));
  }

  function renderBrowse() {
    const root = byId("browseApp");
    if (!root || !window.SITE_MOVIES) return;

    const params = new URLSearchParams(location.search);
    const q0 = params.get("q") || "";
    const genre0 = params.get("genre") || "";
    const region0 = params.get("region") || "";
    const year0 = params.get("year") || "";
    const sort0 = params.get("sort") || "hot";

    const searchInput = byId("browseQuery");
    const genreSel = byId("browseGenre");
    const regionSel = byId("browseRegion");
    const yearSel = byId("browseYear");
    const sortSel = byId("browseSort");
    const grid = byId("browseGrid");
    const pager = byId("browsePager");
    const count = byId("browseCount");
    const hint = byId("browseHint");

    if (searchInput) searchInput.value = q0;
    if (genreSel) genreSel.value = genre0;
    if (regionSel) regionSel.value = region0;
    if (yearSel) yearSel.value = year0;
    if (sortSel) sortSel.value = sort0;

    const pageSize = 40;
    let state = {
      q: q0,
      genre: genre0,
      region: region0,
      year: year0,
      sort: sort0,
      page: Math.max(1, parseInt(params.get("page") || "1", 10) || 1)
    };

    function updateUrl() {
      const p = new URLSearchParams();
      if (state.q) p.set("q", state.q);
      if (state.genre) p.set("genre", state.genre);
      if (state.region) p.set("region", state.region);
      if (state.year) p.set("year", state.year);
      if (state.sort && state.sort !== "hot") p.set("sort", state.sort);
      if (state.page > 1) p.set("page", String(state.page));
      const qs = p.toString();
      const next = qs ? `${location.pathname}?${qs}` : location.pathname;
      history.replaceState({}, "", next);
    }

    function applySort(items) {
      const arr = items.slice();
      if (state.sort === "year") {
        arr.sort((a, b) => (b.year - a.year) || a.title.localeCompare(b.title, "zh-Hans-CN"));
      } else if (state.sort === "title") {
        arr.sort((a, b) => a.title.localeCompare(b.title, "zh-Hans-CN"));
      } else {
        arr.sort((a, b) => (b.hot_score - a.hot_score) || (b.year - a.year) || a.title.localeCompare(b.title, "zh-Hans-CN"));
      }
      return arr;
    }

    function render() {
      const items = applySort(window.SITE_MOVIES.filter((m) => matches(m, state.q, state.genre, state.region, state.year)));
      const total = items.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      if (state.page > totalPages) state.page = totalPages;
      const start = (state.page - 1) * pageSize;
      const slice = items.slice(start, start + pageSize);

      grid.innerHTML = "";
      slice.forEach((movie) => grid.appendChild(makeCard(movie)));
      count.textContent = `共 ${total} 部，当前第 ${state.page} / ${totalPages} 页`;
      hint.textContent = state.q ? `搜索 “${state.q}” 的结果` : "按类型、地区、年份或热度浏览全部影片";
      pager.innerHTML = "";

      const addPage = (label, target, cls = "") => {
        const a = document.createElement("a");
        a.href = "#";
        a.textContent = label;
        if (cls) a.className = cls;
        a.addEventListener("click", (ev) => {
          ev.preventDefault();
          state.page = target;
          updateUrl();
          render();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
        pager.appendChild(a);
      };

      addPage("首页", 1, state.page === 1 ? "active" : "");
      if (state.page > 1) addPage("上一页", state.page - 1);
      const windowStart = Math.max(1, state.page - 2);
      const windowEnd = Math.min(totalPages, state.page + 2);
      for (let p = windowStart; p <= windowEnd; p++) {
        if (p === 1 || p === totalPages) continue;
        addPage(String(p), p, p === state.page ? "active" : "");
      }
      if (state.page < totalPages) addPage("下一页", state.page + 1);
      addPage("末页", totalPages, state.page === totalPages ? "active" : "");
    }

    const submit = () => {
      state.q = searchInput ? searchInput.value.trim() : "";
      state.genre = genreSel ? genreSel.value : "";
      state.region = regionSel ? regionSel.value : "";
      state.year = yearSel ? yearSel.value : "";
      state.sort = sortSel ? sortSel.value : "hot";
      state.page = 1;
      updateUrl();
      render();
    };

    if (searchInput) searchInput.addEventListener("input", debounce(submit, 220));
    if (genreSel) genreSel.addEventListener("change", submit);
    if (regionSel) regionSel.addEventListener("change", submit);
    if (yearSel) yearSel.addEventListener("change", submit);
    if (sortSel) sortSel.addEventListener("change", submit);

    render();
  }

  function initHeroMiniLists() {
    const topGrid = byId("homeTopGrid");
    if (topGrid && window.SITE_MOVIES) {
      const items = window.SITE_MOVIES.slice().sort((a, b) => (b.hot_score - a.hot_score)).slice(0, 12);
      topGrid.innerHTML = "";
      items.forEach((movie) => topGrid.appendChild(makeCard(movie)));
    }

    const sideList = byId("homeSideList");
    if (sideList && window.SITE_MOVIES) {
      sideList.innerHTML = "";
      const sideItems = window.SITE_MOVIES.slice().sort((a, b) => (b.year - a.year) || (b.hot_score - a.hot_score)).slice(0, 5);
      sideItems.forEach((movie) => sideList.appendChild(makeMini(movie)));
    }
  }

  function initRelated() {
    const rel = byId("relatedList");
    if (!rel || !window.SITE_MOVIES) return;
    const ids = (rel.getAttribute("data-related-ids") || "").split(",").map((s) => s.trim()).filter(Boolean);
    const items = ids.map(getMovieById).filter(Boolean);
    rel.innerHTML = "";
    items.forEach((movie) => rel.appendChild(makeMini(movie)));
  }

  function initSearchForms() {
    const rootPrefix = document.body && document.body.dataset && document.body.dataset.rootPrefix ? document.body.dataset.rootPrefix : "";
    $$("form[data-search-form]").forEach((form) => {
      form.addEventListener("submit", (ev) => {
        ev.preventDefault();
        const input = form.querySelector("input[name=q]");
        const q = encodeURIComponent((input && input.value.trim()) || "");
        location.href = q ? `${rootPrefix}browse.html?q=${q}` : `${rootPrefix}browse.html`;
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHome();
    initPlayer();
    renderBrowse();
    initHeroMiniLists();
    initRelated();
    initSearchForms();
  });
})();
