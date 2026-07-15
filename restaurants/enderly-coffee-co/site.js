/* Enderly Coffee Co. — site.js */
(function () {
  'use strict';

  /* Mobile nav toggle */
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      const open = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* Menu filter + search (menu.html) */
  const menuBtns = document.querySelectorAll('.menu-controls button');
  const menuSections = document.querySelectorAll('.menu-section');
  const menuSearch = document.getElementById('menu-search-input');
  const menuEmpty = document.getElementById('menu-empty');
  if (menuBtns.length && menuSections.length) {
    var activeFilter = 'all';
    menuBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        menuBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter');
        applyMenuFilter();
      });
    });
    if (menuSearch) {
      menuSearch.addEventListener('input', applyMenuFilter);
    }
    function applyMenuFilter() {
      var q = (menuSearch ? menuSearch.value : '').toLowerCase().trim();
      var anyVisible = false;
      menuSections.forEach(function (sec) {
        var cat = sec.getAttribute('data-category');
        var catMatch = activeFilter === 'all' || cat === activeFilter;
        var items = sec.querySelectorAll('.menu-row');
        var secVisible = false;
        items.forEach(function (row) {
          var text = row.textContent.toLowerCase();
          var show = catMatch && (!q || text.indexOf(q) !== -1);
          row.style.display = show ? '' : 'none';
          if (show) secVisible = true;
        });
        sec.style.display = secVisible ? '' : 'none';
        if (secVisible) anyVisible = true;
      });
      if (menuEmpty) menuEmpty.hidden = anyVisible;
    }
  }
})();
