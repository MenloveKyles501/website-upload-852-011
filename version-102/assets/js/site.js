(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function initMobileMenu() {
        var button = qs('[data-menu-toggle]');
        var menu = qs('[data-mobile-nav]');

        if (!button || !menu) {
            return;
        }

        button.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function initHeroSlider() {
        var slider = qs('[data-hero-slider]');

        if (!slider) {
            return;
        }

        var slides = qsa('[data-hero-slide]', slider);
        var dots = qsa('[data-hero-dot]', slider);
        var index = 0;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('active', current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('active', current === index);
            });
        }

        dots.forEach(function (dot, current) {
            dot.addEventListener('click', function () {
                show(current);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        show(0);
    }

    function initFilters() {
        var input = qs('[data-search-input]');
        var sort = qs('[data-sort-select]');
        var list = qs('[data-list-area]');
        var empty = qs('[data-empty-state]');

        if (!list) {
            return;
        }

        var cards = qsa('.movie-card', list);
        cards.forEach(function (card, order) {
            card.dataset.originalOrder = String(order);
        });

        function applySearch() {
            var query = normalize(input ? input.value : '');
            var visibleCount = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.dataset.search);
                var matched = !query || haystack.indexOf(query) !== -1;
                card.style.display = matched ? '' : 'none';

                if (matched) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.style.display = visibleCount ? 'none' : 'block';
            }
        }

        function applySort() {
            var value = sort ? sort.value : 'default';
            var sorted = cards.slice();

            sorted.sort(function (a, b) {
                if (value === 'title-asc') {
                    var aTitle = normalize(a.dataset.title);
                    var bTitle = normalize(b.dataset.title);
                    return aTitle.localeCompare(bTitle, 'zh-Hans-CN');
                }

                if (value === 'year-desc') {
                    var aYear = parseInt(a.dataset.year || '0', 10);
                    var bYear = parseInt(b.dataset.year || '0', 10);
                    return bYear - aYear;
                }

                if (value === 'views-desc') {
                    var aViews = parseInt(a.dataset.views || '0', 10);
                    var bViews = parseInt(b.dataset.views || '0', 10);
                    return bViews - aViews;
                }

                return parseInt(a.dataset.originalOrder || '0', 10) - parseInt(b.dataset.originalOrder || '0', 10);
            });

            sorted.forEach(function (card) {
                list.appendChild(card);
            });
        }

        if (input) {
            input.addEventListener('input', applySearch);
        }

        if (sort) {
            sort.addEventListener('change', function () {
                applySort();
                applySearch();
            });
        }
    }

    function initBackToTop() {
        var button = qs('[data-back-top]');

        if (!button) {
            return;
        }

        window.addEventListener('scroll', function () {
            button.classList.toggle('visible', window.scrollY > 480);
        }, { passive: true });

        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHeroSlider();
        initFilters();
        initBackToTop();
    });
})();
