/* Anatolia Cafe & Cuisine — Site Scripts */

(function () {
  'use strict';

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      mainNav.classList.toggle('open');
      const isOpen = mainNav.classList.contains('open');
      navToggle.setAttribute('aria-expanded', isOpen);
      navToggle.classList.toggle('active', isOpen);
    });

    document.addEventListener('click', function (e) {
      if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
        mainNav.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', false);
      }
    });

    mainNav.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('open');
        navToggle.classList.remove('active');
      });
    });
  }

  // Menu category filter
  const filterBtns = document.querySelectorAll('.filter-btn');
  const menuCategories = document.querySelectorAll('.menu-category');

  if (filterBtns.length && menuCategories.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.getAttribute('data-filter');

        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        menuCategories.forEach(function (cat) {
          if (filter === 'all' || cat.getAttribute('data-category') === filter) {
            cat.classList.remove('hidden');
          } else {
            cat.classList.add('hidden');
          }
        });

        // Reset search when switching categories
        var searchInput = document.getElementById('menuSearch');
        if (searchInput) {
          searchInput.value = '';
          searchInput.dispatchEvent(new Event('input'));
        }
      });
    });
  }

  // Menu search
  var menuSearch = document.getElementById('menuSearch');
  if (menuSearch) {
    menuSearch.addEventListener('input', function () {
      var query = this.value.toLowerCase().trim();
      var activeFilter = document.querySelector('.filter-btn.active');
      var currentFilter = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';

      menuCategories.forEach(function (cat) {
        var category = cat.getAttribute('data-category');
        var matchesFilter = currentFilter === 'all' || category === currentFilter;

        if (!matchesFilter) {
          cat.classList.add('hidden');
          return;
        }

        var items = cat.querySelectorAll('.menu-item');
        var visibleCount = 0;

        items.forEach(function (item) {
          var name = item.querySelector('h3').textContent.toLowerCase();
          var desc = item.querySelector('.menu-item-desc');
          var descText = desc ? desc.textContent.toLowerCase() : '';
          var price = item.querySelector('.menu-item-price').textContent.toLowerCase();

          if (!query || name.includes(query) || descText.includes(query) || price.includes(query)) {
            item.classList.remove('hidden');
            visibleCount++;
          } else {
            item.classList.add('hidden');
          }
        });

        if (visibleCount === 0 && query) {
          cat.classList.add('hidden');
        } else {
          cat.classList.remove('hidden');
        }
      });
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
