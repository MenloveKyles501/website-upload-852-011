
(function() {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function() {
        mobileNav.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var current = 0;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function(dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }

      dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
          showSlide(parseInt(dot.getAttribute('data-hero-dot'), 10));
        });
      });

      window.setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]')).forEach(function(input) {
      var targetSelector = input.getAttribute('data-target');
      var target = targetSelector ? document.querySelector(targetSelector) : document;
      var cards = target ? Array.prototype.slice.call(target.querySelectorAll('[data-search]')) : [];
      input.addEventListener('input', function() {
        var value = input.value.trim().toLowerCase();
        cards.forEach(function(card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          card.classList.toggle('is-filtered-out', value && text.indexOf(value) === -1);
        });
      });
    });
  });
})();
