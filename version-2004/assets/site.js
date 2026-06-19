(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var current = 0;
  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });
  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
  panels.forEach(function (panel) {
    var root = panel.closest('main') || document;
    var input = panel.querySelector('[data-search-input]');
    var year = panel.querySelector('[data-year-filter]');
    var region = panel.querySelector('[data-region-filter]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card, .rank-row'));
    var noResults = root.querySelector('.no-results');

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function filterCards() {
      var q = normalize(input && input.value);
      var y = normalize(year && year.value);
      var r = normalize(region && region.value);
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category')
        ].join(' '));
        var match = true;
        if (q && haystack.indexOf(q) === -1) {
          match = false;
        }
        if (y && normalize(card.getAttribute('data-year')) !== y) {
          match = false;
        }
        if (r && normalize(card.getAttribute('data-region')) !== r) {
          match = false;
        }
        card.style.display = match ? '' : 'none';
        if (match) {
          shown += 1;
        }
      });

      if (noResults) {
        noResults.style.display = shown ? 'none' : 'block';
      }
    }

    [input, year, region].forEach(function (el) {
      if (el) {
        el.addEventListener('input', filterCards);
        el.addEventListener('change', filterCards);
      }
    });
  });
})();
