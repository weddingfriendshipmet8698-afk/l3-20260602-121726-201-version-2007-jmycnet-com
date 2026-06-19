(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  onReady(function () {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-hidden");
      });
    });

    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        panel.hidden = expanded;
        document.body.classList.toggle("menu-open", !expanded);
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
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
          timer = null;
        }
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          start();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    document.querySelectorAll("[data-rail]").forEach(function (railWrap) {
      var rail = railWrap.querySelector(".movie-rail");
      var section = railWrap.closest(".rail-section") || document;
      var left = section.querySelector("[data-scroll-left]");
      var right = section.querySelector("[data-scroll-right]");
      if (!rail) {
        return;
      }
      if (left) {
        left.addEventListener("click", function () {
          rail.scrollBy({ left: -rail.clientWidth * 0.8, behavior: "smooth" });
        });
      }
      if (right) {
        right.addEventListener("click", function () {
          rail.scrollBy({ left: rail.clientWidth * 0.8, behavior: "smooth" });
        });
      }
    });

    document.querySelectorAll("[data-filter-root]").forEach(function (root) {
      var search = root.querySelector("[data-filter-search]");
      var category = root.querySelector("[data-filter-category]");
      var region = root.querySelector("[data-filter-region]");
      var year = root.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));
      var empty = root.querySelector("[data-empty]");
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && search) {
        search.value = q;
      }

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function apply() {
        var text = normalize(search && search.value);
        var categoryValue = normalize(category && category.value);
        var regionValue = normalize(region && region.value);
        var yearValue = normalize(year && year.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize(card.dataset.keywords + " " + card.dataset.title);
          var matchesText = !text || haystack.indexOf(text) !== -1;
          var matchesCategory = !categoryValue || normalize(card.dataset.category) === categoryValue;
          var matchesRegion = !regionValue || normalize(card.dataset.region) === regionValue;
          var matchesYear = !yearValue || normalize(card.dataset.year) === yearValue;
          var ok = matchesText && matchesCategory && matchesRegion && matchesYear;
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [search, category, region, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  });
})();
