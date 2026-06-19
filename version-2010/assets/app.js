(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = qs('[data-nav-toggle]');
    if (!toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  function initHero() {
    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function activate(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        activate(dotIndex);
        start();
      });
    });

    activate(0);
    start();
  }

  function initSearchPage() {
    var form = qs('[data-search-form]');
    var results = qs('[data-search-results]');
    var info = qs('[data-results-info]');
    if (!form || !results || !window.SITE_VIDEOS) {
      return;
    }

    var queryInput = qs('[name="q"]', form);
    var categorySelect = qs('[name="category"]', form);
    var yearSelect = qs('[name="year"]', form);
    var params = new URLSearchParams(window.location.search);

    queryInput.value = params.get('q') || '';
    categorySelect.value = params.get('category') || '';
    yearSelect.value = params.get('year') || '';

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function cardTemplate(item) {
      var cover = item.cover + '.jpg';
      return '' +
        '<article class="movie-card">' +
          '<a class="poster-shell" href="video/' + item.id + '.html">' +
            '<img src="' + cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy" onerror="this.closest(\'.poster-shell\').classList.add(\'poster-fallback\'); this.remove();">' +
            '<span class="poster-text">' + escapeHtml(item.title) + '</span>' +
            '<span class="badge-row"><span class="badge">' + escapeHtml(item.year) + '</span><span class="badge hot">热度 ' + escapeHtml(item.heat) + '</span></span>' +
          '</a>' +
          '<div class="card-body">' +
            '<a class="movie-title" href="video/' + item.id + '.html">' + escapeHtml(item.title) + '</a>' +
            '<p class="movie-desc">' + escapeHtml(item.one_line) + '</p>' +
            '<div class="movie-meta"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.genre) + '</span><span>' + escapeHtml(item.region) + '</span></div>' +
          '</div>' +
        '</article>';
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function render() {
      var query = normalize(queryInput.value);
      var category = categorySelect.value;
      var year = yearSelect.value;
      var matches = window.SITE_VIDEOS.filter(function (item) {
        var text = normalize([
          item.title,
          item.region,
          item.type,
          item.genre,
          item.category,
          item.tags,
          item.one_line
        ].join(' '));
        var okQuery = !query || text.indexOf(query) !== -1;
        var okCategory = !category || item.category === category;
        var okYear = !year || String(item.year) === year;
        return okQuery && okCategory && okYear;
      }).slice(0, 120);

      results.innerHTML = matches.map(cardTemplate).join('');
      info.textContent = '共找到 ' + matches.length + ' 条匹配内容；最多展示前 120 条，可继续细化关键词或筛选条件。';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
      var nextParams = new URLSearchParams();
      if (queryInput.value.trim()) {
        nextParams.set('q', queryInput.value.trim());
      }
      if (categorySelect.value) {
        nextParams.set('category', categorySelect.value);
      }
      if (yearSelect.value) {
        nextParams.set('year', yearSelect.value);
      }
      var nextUrl = window.location.pathname + (nextParams.toString() ? '?' + nextParams.toString() : '');
      window.history.replaceState(null, '', nextUrl);
    });

    [queryInput, categorySelect, yearSelect].forEach(function (field) {
      field.addEventListener('input', render);
      field.addEventListener('change', render);
    });

    render();
  }

  function markCurrentNav() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    qsa('[data-nav-link]').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      if (href.endsWith(path)) {
        link.classList.add('is-active');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initSearchPage();
    markCurrentNav();
  });
})();
