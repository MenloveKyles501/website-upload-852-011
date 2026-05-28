(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-site-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input) {
                    return;
                }
                event.preventDefault();
                var q = input.value.trim();
                var target = form.getAttribute("action") || "./search.html";
                window.location.href = target + (q ? "?q=" + encodeURIComponent(q) : "");
            });
        });

        var slider = document.querySelector("[data-hero-slider]");
        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
            var prev = slider.querySelector("[data-hero-prev]");
            var next = slider.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === index);
                });
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5500);
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    restart();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    restart();
                });
            }
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                    restart();
                });
            });
            show(0);
            restart();
        }

        var filterInput = document.querySelector("[data-filter-input]");
        var sortSelect = document.querySelector("[data-sort-select]");
        var list = document.querySelector("[data-card-list]");
        var empty = document.querySelector("[data-empty-state]");

        if (filterInput && list) {
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q") || "";
            var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
            if (initial) {
                filterInput.value = initial;
            }

            function applyFilter() {
                var q = filterInput.value.trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var terms = (card.getAttribute("data-terms") || "").toLowerCase();
                    var matched = !q || terms.indexOf(q) !== -1;
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            function applySort() {
                if (!sortSelect) {
                    return;
                }
                var value = sortSelect.value;
                var sorted = cards.slice();
                sorted.sort(function (a, b) {
                    var ay = parseInt(a.getAttribute("data-year") || "0", 10);
                    var by = parseInt(b.getAttribute("data-year") || "0", 10);
                    var at = a.getAttribute("data-title") || "";
                    var bt = b.getAttribute("data-title") || "";
                    if (value === "year-desc") {
                        return by - ay;
                    }
                    if (value === "year-asc") {
                        return ay - by;
                    }
                    if (value === "title-asc") {
                        return at.localeCompare(bt, "zh-Hans-CN");
                    }
                    return cards.indexOf(a) - cards.indexOf(b);
                });
                sorted.forEach(function (card) {
                    list.appendChild(card);
                });
            }

            filterInput.addEventListener("input", applyFilter);
            if (sortSelect) {
                sortSelect.addEventListener("change", function () {
                    applySort();
                    applyFilter();
                });
            }
            applySort();
            applyFilter();
        }
    });
})();
