(function () {
    'use strict';

    var HLS_LIBRARY_URL = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
    var hlsLoaderPromise = null;

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMobileMenu() {
        var button = document.querySelector('.mobile-menu-button');
        var menu = document.querySelector('#site-menu');

        if (!button || !menu) {
            return;
        }

        button.addEventListener('click', function () {
            var isOpen = menu.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', isOpen);
            button.setAttribute('aria-expanded', String(isOpen));
        });

        menu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                menu.classList.remove('is-open');
                document.body.classList.remove('menu-open');
                button.setAttribute('aria-expanded', 'false');
            });
        });
    }

    function initHeroCarousel() {
        var hero = document.querySelector('[data-hero]');

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function startAutoPlay() {
            stopAutoPlay();
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        function stopAutoPlay() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startAutoPlay();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startAutoPlay();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startAutoPlay();
            });
        }

        hero.addEventListener('mouseenter', stopAutoPlay);
        hero.addEventListener('mouseleave', startAutoPlay);
        startAutoPlay();
    }

    function initSearchFilter() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));

        panels.forEach(function (panel) {
            var scope = panel.parentElement || document;
            var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
            var keyword = panel.querySelector('[data-filter-keyword]');
            var region = panel.querySelector('[data-filter-region]');
            var year = panel.querySelector('[data-filter-year]');
            var category = panel.querySelector('[data-filter-category]');
            var count = panel.querySelector('[data-search-count]');
            var empty = panel.querySelector('[data-filter-empty]');

            function update() {
                var keywordValue = normalize(keyword && keyword.value);
                var regionValue = normalize(region && region.value);
                var yearValue = normalize(year && year.value);
                var categoryValue = normalize(category && category.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search-text'));
                    var cardRegion = normalize(card.getAttribute('data-region'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var cardCategory = normalize(card.getAttribute('data-category'));
                    var matched = true;

                    if (keywordValue && text.indexOf(keywordValue) === -1) {
                        matched = false;
                    }

                    if (regionValue && cardRegion.indexOf(regionValue) === -1) {
                        matched = false;
                    }

                    if (yearValue && cardYear.indexOf(yearValue) === -1) {
                        matched = false;
                    }

                    if (categoryValue && cardCategory !== categoryValue) {
                        matched = false;
                    }

                    card.classList.toggle('is-hidden', !matched);

                    if (matched) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = String(visible);
                }

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [keyword, region, year, category].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', update);
                    control.addEventListener('change', update);
                }
            });

            update();
        });
    }

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (hlsLoaderPromise) {
            return hlsLoaderPromise;
        }

        hlsLoaderPromise = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = HLS_LIBRARY_URL;
            script.async = true;
            script.onload = function () {
                if (window.Hls) {
                    resolve(window.Hls);
                } else {
                    reject(new Error('HLS library loaded but Hls is unavailable.'));
                }
            };
            script.onerror = function () {
                reject(new Error('Unable to load HLS library.'));
            };
            document.head.appendChild(script);
        });

        return hlsLoaderPromise;
    }

    function setPlayerStatus(player, message) {
        var status = player.querySelector('[data-player-status]');

        if (status) {
            status.textContent = message;
        }
    }

    function initVideoPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

        players.forEach(function (player) {
            var button = player.querySelector('[data-play-button]');
            var video = player.querySelector('video');
            var source = player.getAttribute('data-video-url');

            if (!button || !video || !source) {
                return;
            }

            button.addEventListener('click', function () {
                setPlayerStatus(player, '正在初始化播放源...');

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    button.classList.add('is-hidden');
                    video.play().catch(function () {
                        setPlayerStatus(player, '播放已准备，请再次点击视频控件开始。');
                    });
                    return;
                }

                loadHlsLibrary().then(function (Hls) {
                    if (!Hls.isSupported()) {
                        setPlayerStatus(player, '当前浏览器不支持 HLS 播放，请更换 Safari、Chrome、Edge 或 Firefox 最新版本。');
                        return;
                    }

                    if (player.hlsInstance) {
                        player.hlsInstance.destroy();
                    }

                    var hls = new Hls({
                        enableWorker: true,
                        maxBufferLength: 30,
                        backBufferLength: 30
                    });

                    player.hlsInstance = hls;
                    hls.loadSource(source);
                    hls.attachMedia(video);

                    hls.on(Hls.Events.MANIFEST_PARSED, function () {
                        button.classList.add('is-hidden');
                        setPlayerStatus(player, '播放源已就绪。');
                        video.play().catch(function () {
                            setPlayerStatus(player, '播放已准备，请再次点击视频控件开始。');
                        });
                    });

                    hls.on(Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setPlayerStatus(player, '播放源加载失败，请刷新页面或稍后重试。');
                        }
                    });
                }).catch(function () {
                    setPlayerStatus(player, 'HLS 播放库加载失败，请检查网络后重试。');
                });
            });
        });
    }

    function initImageFallback() {
        document.querySelectorAll('img').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('image-missing');
                image.alt = image.alt || '图片待补充';
            }, { once: true });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHeroCarousel();
        initSearchFilter();
        initVideoPlayers();
        initImageFallback();
    });
}());
