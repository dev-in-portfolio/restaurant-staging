document.addEventListener('DOMContentLoaded', function () {
  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      toggle.classList.toggle('active');
    });

    // Close on link click
    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.classList.remove('active');
      });
    });
  }

  // Menu category filter
  const pills = document.querySelectorAll('.pill');
  const categories = document.querySelectorAll('.menu-category');
  const searchInput = document.getElementById('menu-search');
  const emptyMsg = document.querySelector('.menu-empty');

  function filterMenu() {
    var activePill = document.querySelector('.pill.active');
    var category = activePill ? activePill.getAttribute('data-category') : 'all';
    var search = searchInput ? searchInput.value.toLowerCase().trim() : '';
    var anyVisible = false;

    categories.forEach(function (cat) {
      var catKey = cat.getAttribute('data-category');
      var items = cat.querySelectorAll('.menu-item');
      var catVisible = false;

      if (category !== 'all' && catKey !== category) {
        cat.setAttribute('data-hidden', 'true');
        return;
      }

      items.forEach(function (item) {
        var name = (item.getAttribute('data-name') || '').toLowerCase();
        var text = item.textContent.toLowerCase();
        var match = !search || name.indexOf(search) !== -1 || text.indexOf(search) !== -1;
        item.setAttribute('data-hidden', match ? 'false' : 'true');
        if (match) catVisible = true;
      });

      cat.setAttribute('data-hidden', catVisible ? 'false' : 'true');
      if (catVisible) anyVisible = true;
    });

    if (emptyMsg) {
      emptyMsg.style.display = anyVisible ? 'none' : 'block';
    }
  }

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      pills.forEach(function (p) { p.classList.remove('active'); });
      pill.classList.add('active');
      filterMenu();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', filterMenu);
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
