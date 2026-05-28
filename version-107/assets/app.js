(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-nav]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("open");
            document.body.classList.toggle("menu-open", menu.classList.contains("open"));
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initRows() {
        document.querySelectorAll("[data-scroll-row]").forEach(function (wrap) {
            var row = wrap.querySelector(".movie-row");
            var left = wrap.querySelector("[data-scroll-left]");
            var right = wrap.querySelector("[data-scroll-right]");
            if (!row) {
                return;
            }
            if (left) {
                left.addEventListener("click", function () {
                    row.scrollBy({ left: -420, behavior: "smooth" });
                });
            }
            if (right) {
                right.addEventListener("click", function () {
                    row.scrollBy({ left: 420, behavior: "smooth" });
                });
            }
        });
    }

    function initFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var typeSelect = scope.querySelector("[data-filter-type]");
            var yearSelect = scope.querySelector("[data-filter-year]");
            var categorySelect = scope.querySelector("[data-filter-category]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var empty = scope.querySelector("[data-empty-state]");

            function value(node) {
                return node ? String(node.value || "").trim().toLowerCase() : "";
            }

            function apply() {
                var keyword = value(input);
                var type = value(typeSelect);
                var year = value(yearSelect);
                var category = value(categorySelect);
                var visible = 0;

                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-tags") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-genre") || ""
                    ].join(" ").toLowerCase();
                    var ok = true;
                    if (keyword && text.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (type && String(card.getAttribute("data-type") || "").toLowerCase() !== type) {
                        ok = false;
                    }
                    if (year && String(card.getAttribute("data-year") || "").toLowerCase() !== year) {
                        ok = false;
                    }
                    if (category && String(card.getAttribute("data-category") || "").toLowerCase() !== category) {
                        ok = false;
                    }
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }

            [input, typeSelect, yearSelect, categorySelect].forEach(function (node) {
                if (node) {
                    node.addEventListener("input", apply);
                    node.addEventListener("change", apply);
                }
            });
        });
    }

    window.initMoviePlayer = function (videoId, buttonId, streamUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        if (!video || !button || !streamUrl) {
            return;
        }

        function hideButton() {
            button.classList.add("is-hidden");
        }

        function playNative() {
            if (!video.src) {
                video.src = streamUrl;
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        function attachHls() {
            if (video._hlsAttached) {
                playNative();
                return;
            }
            var hls = new Hls({ enableWorker: true });
            video._hlsAttached = true;
            video._hlsInstance = hls;
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                playNative();
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    }
                }
            });
        }

        function begin() {
            hideButton();
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                playNative();
                return;
            }
            if (window.Hls && Hls.isSupported()) {
                attachHls();
                return;
            }
            playNative();
        }

        button.addEventListener("click", begin);
        video.addEventListener("click", function () {
            if (video.paused) {
                begin();
            }
        });
        video.addEventListener("play", hideButton);
    };

    ready(function () {
        initMenu();
        initHero();
        initRows();
        initFilters();
    });
})();
