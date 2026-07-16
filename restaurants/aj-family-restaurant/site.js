(function () {
  'use strict';

  /* ─── Header scroll effect ─── */
  var header = document.getElementById('header');
  if (header) {
    var lastScroll = 0;
    function onScroll() {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      header.classList.toggle('scrolled', y > 60);
      lastScroll = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ─── Mobile nav toggle ─── */
  var toggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ─── Scroll reveal (staggered) ─── */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ─── Comfort Plate Builder (index page) ─── */
  var mealOpts = document.getElementById('meal-opts');
  if (mealOpts) {
    var mealBtns = mealOpts.querySelectorAll('.builder-opt');
    var styleBtns = document.getElementById('style-opts').querySelectorAll('.builder-opt');
    var vibeBtns = document.getElementById('vibe-opts').querySelectorAll('.builder-opt');
    var pMeal = document.getElementById('plate-meal');
    var pStyle = document.getElementById('plate-style');
    var pVibe = document.getElementById('plate-vibe');
    var bName = document.getElementById('builder-name');
    var bDesc = document.getElementById('builder-desc');
    var bPrice = document.getElementById('builder-price');

    var state = { meal: 'Breakfast', style: 'Classic', vibe: 'Quick Stop' };

    var data = {
      Breakfast: {
        Classic: { d: 'Eggs your way, bacon or sausage, hashbrowns, and a tall stack of buttermilk pancakes.', p: '$9.99' },
        Lighter: { d: 'Egg white omelet with seasonal veggies, fresh fruit cup, whole wheat toast, and turkey sausage.', p: '$8.99' },
        Hearty: { d: 'Three-egg omelet loaded with ham, cheese, and peppers. Served with biscuits, gravy, hashbrowns, and pancakes.', p: '$13.49' }
      },
      Lunch: {
        Classic: { d: 'Half-pound Monroe Burger with hand-cut fries, coleslaw, and a fountain drink.', p: '$11.99' },
        Lighter: { d: 'Grilled chicken salad with mixed greens, tomato, cucumber, cheese, and vinaigrette.', p: '$9.49' },
        Hearty: { d: 'Open-faced roast beef piled on Texas toast, smothered in gravy, with mashed potatoes and green beans.', p: '$12.99' }
      },
      Dinner: {
        Classic: { d: 'Country fried steak, hand-breaded and fried golden, with cream gravy, mashed potatoes, and green beans.', p: '$13.49' },
        Lighter: { d: 'Grilled salmon fillet with lemon butter, steamed broccoli, wild rice pilaf, and a side salad.', p: '$14.99' },
        Hearty: { d: 'Our famous meatloaf dinner with mac and cheese, collard greens, and a slice of cornbread.', p: '$12.99' }
      }
    };

    function update() {
      var m = state.meal, s = state.style, v = state.vibe;
      if (pMeal) { pMeal.textContent = m; setTimeout(function () { pMeal.classList.add('show'); }, 50); }
      if (pStyle) { pStyle.textContent = s; setTimeout(function () { pStyle.classList.add('show'); }, 150); }
      if (pVibe) { pVibe.textContent = v; setTimeout(function () { pVibe.classList.add('show'); }, 250); }
      if (bName) bName.textContent = s + ' ' + m;
      var d = data[m] && data[m][s];
      if (d) {
        if (bDesc) bDesc.textContent = d.d + ' Perfect for a ' + v.toLowerCase() + '.';
        if (bPrice) bPrice.textContent = d.p;
      }
    }

    function setup(btns, key) {
      btns.forEach(function (b) {
        b.addEventListener('click', function () {
          btns.forEach(function (x) { x.classList.remove('active'); });
          b.classList.add('active');
          state[key] = b.getAttribute('data-value');
          update();
        });
      });
    }

    setup(mealBtns, 'meal');
    setup(styleBtns, 'style');
    setup(vibeBtns, 'vibe');
    update();
  }

  /* ─── Menu filter + search ─── */
  var menuBtns = document.querySelectorAll('.menu-filters button');
  var menuSections = document.querySelectorAll('.menu-category');
  var menuSearch = document.getElementById('menu-search-input');
  var menuEmpty = document.getElementById('menu-empty');
  if (menuBtns.length && menuSections.length) {
    var activeFilter = 'all';
    menuBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        menuBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter');
        apply();
      });
    });
    if (menuSearch) menuSearch.addEventListener('input', apply);
    function apply() {
      var q = (menuSearch ? menuSearch.value : '').toLowerCase().trim();
      var anyVis = false;
      menuSections.forEach(function (sec) {
        var cat = sec.getAttribute('data-category');
        var catMatch = activeFilter === 'all' || cat === activeFilter;
        var items = sec.querySelectorAll('.menu-row');
        var secVis = false;
        items.forEach(function (row) {
          var t = row.textContent.toLowerCase();
          var show = catMatch && (!q || t.indexOf(q) !== -1);
          row.style.display = show ? '' : 'none';
          if (show) secVis = true;
        });
        sec.style.display = secVis ? '' : 'none';
        if (secVis) anyVis = true;
      });
      if (menuEmpty) menuEmpty.hidden = anyVis;
    }
  }

  /* ─── Range slider ─── */
  var range = document.getElementById('range');
  var count = document.getElementById('count');
  var planTitle = document.getElementById('plan-title');
  var planDesc = document.getElementById('plan-desc');
  if (range && count) {
    function updateRange() {
      var v = parseInt(range.value, 10);
      count.textContent = v + ' guests';
      if (planTitle) {
        if (v < 12) planTitle.textContent = 'Intimate Gathering';
        else if (v < 40) planTitle.textContent = 'Private Event';
        else if (v < 90) planTitle.textContent = 'Large Celebration';
        else planTitle.textContent = 'Custom Event';
      }
      if (planDesc) {
        planDesc.textContent = 'We\'d love to host ' + v + ' guests. Tell us your date, preferences, and any requirements — we\'ll take care of everything.';
      }
    }
    range.addEventListener('input', updateRange);
    updateRange();
  }

  /* ─── Form toast ─── */
  var forms = document.querySelectorAll('[data-demo]');
  var toast = document.querySelector('.toast');
  forms.forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!toast) return;
      toast.textContent = 'Thanks for reaching out! We\'ll be in touch soon.';
      toast.classList.add('show');
      setTimeout(function () { toast.classList.remove('show'); }, 4000);
    });
  });

})();
