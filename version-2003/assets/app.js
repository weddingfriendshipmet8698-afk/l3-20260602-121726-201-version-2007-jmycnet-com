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
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = nav.classList.toggle("open");
      document.body.classList.toggle("menu-open", opened);
      button.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function setSlide(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
        dot.setAttribute("aria-current", i === index ? "true" : "false");
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        setSlide(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        setSlide(i);
        start();
      });
    });

    var hero = document.querySelector(".hero");
    if (hero) {
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
    }

    setSlide(0);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    var searchInput = document.querySelector("[data-search-input]");
    var yearSelect = document.querySelector("[data-year-filter]");
    var typeSelect = document.querySelector("[data-type-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-item"));
    var empty = document.querySelector("[data-empty-result]");
    if (!cards.length || (!searchInput && !yearSelect && !typeSelect)) {
      return;
    }

    function matches(card) {
      var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-tags"));
      var keyword = searchInput ? normalize(searchInput.value) : "";
      var selectedYear = yearSelect ? yearSelect.value : "";
      var selectedType = typeSelect ? typeSelect.value : "";
      var cardYear = card.getAttribute("data-year") || "";
      var cardType = card.getAttribute("data-type") || "";

      if (keyword && text.indexOf(keyword) === -1) {
        return false;
      }
      if (selectedYear && cardYear !== selectedYear) {
        return false;
      }
      if (selectedType && cardType !== selectedType) {
        return false;
      }
      return true;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matches(card);
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    [searchInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  function initPlayer() {
    var video = document.querySelector("video[data-video-url]");
    if (!video) {
      return;
    }
    var cover = document.querySelector("[data-player-cover]");
    var streamUrl = video.getAttribute("data-video-url");
    var started = false;

    function attachAndPlay() {
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      if (cover) {
        cover.classList.add("hidden");
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        video.hls = hls;
        return;
      }
      video.src = streamUrl;
      video.play().catch(function () {});
    }

    if (cover) {
      cover.addEventListener("click", attachAndPlay);
    }
    video.addEventListener("click", function () {
      if (!started) {
        attachAndPlay();
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
