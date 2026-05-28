(() => {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("is-open");
    });
  }

  const slider = document.querySelector("[data-hero-slider]");
  if (slider) {
    const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    const prev = slider.querySelector("[data-hero-prev]");
    const next = slider.querySelector("[data-hero-next]");
    let active = 0;
    const show = (index) => {
      if (!slides.length) return;
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, current) => slide.classList.toggle("is-active", current === active));
      dots.forEach((dot, current) => dot.classList.toggle("is-active", current === active));
    };
    const forward = () => show(active + 1);
    const backward = () => show(active - 1);
    if (prev) prev.addEventListener("click", backward);
    if (next) next.addEventListener("click", forward);
    dots.forEach((dot, index) => dot.addEventListener("click", () => show(index)));
    window.setInterval(forward, 5000);
  }

  document.querySelectorAll(".js-filter-panel").forEach((panel) => {
    const grid = panel.parentElement.querySelector("[data-filter-grid]");
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll(".movie-card"));
    const search = panel.querySelector(".js-card-search");
    const year = panel.querySelector(".js-year-filter");
    const type = panel.querySelector(".js-type-filter");
    const region = panel.querySelector(".js-region-filter");
    const run = () => {
      const query = (search && search.value || "").trim().toLowerCase();
      const selectedYear = year && year.value || "";
      const selectedType = type && type.value || "";
      const selectedRegion = region && region.value || "";
      cards.forEach((card) => {
        const text = `${card.dataset.title || ""} ${card.dataset.tags || ""}`.toLowerCase();
        const passQuery = !query || text.includes(query);
        const passYear = !selectedYear || card.dataset.year === selectedYear;
        const passType = !selectedType || card.dataset.type === selectedType;
        const passRegion = !selectedRegion || card.dataset.region === selectedRegion;
        card.classList.toggle("hidden-by-filter", !(passQuery && passYear && passType && passRegion));
      });
    };
    [search, year, type, region].forEach((item) => {
      if (item) item.addEventListener("input", run);
      if (item) item.addEventListener("change", run);
    });
  });

  const results = document.getElementById("search-results");
  const status = document.getElementById("search-status");
  const input = document.getElementById("search-page-input");
  if (results && status && window.MOVIES) {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get("q") || "").trim();
    if (input) input.value = query;
    const escapeHtml = (value) => String(value || "").replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));
    const makeCard = (movie) => `
      <article class="movie-card" data-title="${escapeHtml(movie.title)}" data-year="${escapeHtml(movie.year)}" data-region="${escapeHtml(movie.region)}" data-type="${escapeHtml(movie.type)}" data-tags="${escapeHtml((movie.tags || []).join(','))}">
        <a href="${escapeHtml(movie.url)}" class="movie-link" aria-label="${escapeHtml(movie.title)}">
          <span class="movie-thumb">
            <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
            <span class="thumb-gradient"></span>
            <span class="play-circle">▶</span>
            <span class="region-pill">${escapeHtml(movie.region)}</span>
            <span class="year-pill">${escapeHtml(movie.year)}</span>
          </span>
          <span class="movie-info">
            <strong class="movie-title">${escapeHtml(movie.title)}</strong>
            <span class="movie-desc">${escapeHtml(movie.oneLine)}</span>
            <span class="movie-meta"><span>${escapeHtml(movie.genre)}</span><span>${escapeHtml(movie.type)}</span></span>
          </span>
        </a>
      </article>`;
    const source = window.MOVIES;
    const matched = query
      ? source.filter((movie) => {
          const text = `${movie.title} ${movie.oneLine} ${movie.region} ${movie.type} ${movie.genre} ${(movie.tags || []).join(' ')}`.toLowerCase();
          return text.includes(query.toLowerCase());
        })
      : source.slice(0, 48);
    status.textContent = query ? `搜索：${query}` : "精选内容";
    results.innerHTML = matched.map(makeCard).join("");
  }
})();
