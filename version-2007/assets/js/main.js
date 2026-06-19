(function () {
  const toggle = document.querySelector('.menu-toggle');
  const panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      const isOpen = panel.hasAttribute('hidden') === false;
      if (isOpen) {
        panel.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
      } else {
        panel.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
    const prev = carousel.querySelector('.hero-prev');
    const next = carousel.querySelector('.hero-next');
    let current = 0;
    let timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const index = Number(dot.getAttribute('data-slide')) || 0;
        showSlide(index);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    showSlide(0);
    start();
  }

  const filterInput = document.querySelector('[data-filter-input]');
  const filterList = document.querySelector('[data-filter-list]');

  if (filterInput && filterList) {
    const items = Array.from(filterList.querySelectorAll('.filter-item'));
    const empty = document.createElement('div');
    empty.className = 'filter-empty';
    empty.textContent = '没有找到匹配的影片';

    function applyFilter(value) {
      const keyword = String(value || '').trim().toLowerCase();
      let visibleCount = 0;

      items.forEach(function (item) {
        const haystack = String(item.getAttribute('data-search') || '').toLowerCase();
        const visible = keyword === '' || haystack.indexOf(keyword) !== -1;
        item.style.display = visible ? '' : 'none';
        if (visible) {
          visibleCount += 1;
        }
      });

      if (visibleCount === 0 && !filterList.contains(empty)) {
        filterList.appendChild(empty);
      }

      if (visibleCount > 0 && filterList.contains(empty)) {
        empty.remove();
      }
    }

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';

    if (query) {
      filterInput.value = query;
    }

    filterInput.addEventListener('input', function () {
      applyFilter(filterInput.value);
    });

    applyFilter(filterInput.value);
  }
})();
