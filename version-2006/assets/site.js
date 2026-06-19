(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.hidden = !menu.hidden;
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 6200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });
        show(0);
        restart();
    }

    function setupFilters() {
        var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
        roots.forEach(function (root) {
            var input = root.querySelector("[data-local-search]");
            var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));
            var activeYear = "";
            var activeType = "";

            function setActive(buttons, current) {
                buttons.forEach(function (button) {
                    button.classList.toggle("is-active", button === current);
                });
            }

            function apply() {
                var q = input ? input.value.trim().toLowerCase() : "";
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var year = card.getAttribute("data-year") || "";
                    var type = card.getAttribute("data-type") || "";
                    var matched = true;
                    if (q && text.indexOf(q) === -1) {
                        matched = false;
                    }
                    if (activeYear && year !== activeYear) {
                        matched = false;
                    }
                    if (activeType && type !== activeType) {
                        matched = false;
                    }
                    card.classList.toggle("is-hidden", !matched);
                });
            }

            if (input) {
                input.addEventListener("input", apply);
                if (root.hasAttribute("data-query-page")) {
                    var params = new URLSearchParams(window.location.search);
                    var q = params.get("q");
                    if (q) {
                        input.value = q;
                    }
                }
            }

            var yearButtons = Array.prototype.slice.call(root.querySelectorAll("[data-filter-year]"));
            var typeButtons = Array.prototype.slice.call(root.querySelectorAll("[data-filter-type]"));
            yearButtons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeYear = button.getAttribute("data-filter-year") || "";
                    setActive(yearButtons, button);
                    apply();
                });
            });
            typeButtons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeType = button.getAttribute("data-filter-type") || "";
                    setActive(typeButtons, button);
                    apply();
                });
            });
            apply();
        });
    }

    window.initPlayer = function (source) {
        var video = document.querySelector("[data-video]");
        var stage = document.querySelector("[data-player-stage]");
        var overlay = document.querySelector("[data-play-overlay]");
        if (!video || !stage || !overlay || !source) {
            return;
        }
        var loaded = false;
        var requested = false;
        var hlsInstance = null;

        function attemptPlay() {
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    overlay.hidden = false;
                });
            }
        }

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            video.controls = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    if (requested) {
                        attemptPlay();
                    }
                });
            } else {
                video.src = source;
            }
        }

        function play() {
            requested = true;
            overlay.hidden = true;
            load();
            if (video.src || video.readyState > 0) {
                attemptPlay();
            }
        }

        overlay.addEventListener("click", play);
        stage.addEventListener("click", function (event) {
            if (event.target === video && video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            overlay.hidden = true;
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
