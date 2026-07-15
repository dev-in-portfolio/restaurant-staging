/* ========================================
   Gotcha Matcha & Espresso — Scripts
   ======================================== */

(function () {
    'use strict';

    // --- Mobile Nav Toggle ---
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('open');
        });

        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navToggle.classList.remove('active');
                navLinks.classList.remove('open');
            });
        });

        document.addEventListener('click', function (e) {
            if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navToggle.classList.remove('active');
                navLinks.classList.remove('open');
            }
        });
    }

    // --- Navbar Scroll Effect ---
    var navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', function () {
            navbar.classList.toggle('scrolled', window.scrollY > 20);
        }, { passive: true });
    }

    // --- Smooth Scroll for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // --- Menu Category Filter ---
    var filterBtns = document.querySelectorAll('.filter-btn');
    var menuCategories = document.querySelectorAll('.menu-category');

    if (filterBtns.length && menuCategories.length) {
        filterBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var filter = this.getAttribute('data-filter');

                filterBtns.forEach(function (b) { b.classList.remove('active'); });
                this.classList.add('active');

                menuCategories.forEach(function (cat) {
                    if (filter === 'all' || cat.getAttribute('data-category') === filter) {
                        cat.style.display = '';
                    } else {
                        cat.style.display = 'none';
                    }
                });

                // Clear search when changing filter
                var searchInput = document.getElementById('menuSearch');
                if (searchInput) {
                    searchInput.value = '';
                    document.querySelectorAll('.menu-item').forEach(function (item) {
                        item.classList.remove('hidden');
                    });
                }
            });
        });
    }

    // --- Menu Search ---
    var menuSearch = document.getElementById('menuSearch');
    if (menuSearch) {
        menuSearch.addEventListener('input', function () {
            var query = this.value.toLowerCase().trim();
            var items = document.querySelectorAll('.menu-item');

            // Reset filter to All when searching
            if (query) {
                filterBtns.forEach(function (b) { b.classList.remove('active'); });
                var allBtn = document.querySelector('.filter-btn[data-filter="all"]');
                if (allBtn) allBtn.classList.add('active');
                menuCategories.forEach(function (cat) { cat.style.display = ''; });
            }

            items.forEach(function (item) {
                var name = (item.getAttribute('data-name') || '').toLowerCase();
                var text = item.textContent.toLowerCase();
                var match = !query || name.indexOf(query) !== -1 || text.indexOf(query) !== -1;
                item.classList.toggle('hidden', !match);
            });

            // Hide empty categories
            menuCategories.forEach(function (cat) {
                var visibleItems = cat.querySelectorAll('.menu-item:not(.hidden)');
                cat.style.display = visibleItems.length === 0 ? 'none' : '';
            });
        });
    }

})();
