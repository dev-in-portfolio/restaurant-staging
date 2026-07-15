// Grey's Diner and Community Kitchen — site.js

(function () {
    'use strict';

    // ---- Mobile Nav Toggle ----
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navLinks.classList.toggle('open');
            this.classList.toggle('active');
        });

        // Close on link click (mobile)
        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navLinks.classList.remove('open');
                navToggle.classList.remove('active');
            });
        });

        // Close on outside click
        document.addEventListener('click', function (e) {
            if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('open');
                navToggle.classList.remove('active');
            }
        });
    }

    // ---- Smooth Scroll ----
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                var offset = 70;
                var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        });
    });

    // ---- Menu Category Filter ----
    var filterBtns = document.querySelectorAll('.filter-btn');
    var menuCategories = document.querySelectorAll('.menu-category');

    if (filterBtns.length && menuCategories.length) {
        filterBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var filter = this.getAttribute('data-filter');

                // Update active button
                filterBtns.forEach(function (b) { b.classList.remove('active'); });
                this.classList.add('active');

                // Show/hide categories
                menuCategories.forEach(function (cat) {
                    var catFilter = cat.getAttribute('data-category');
                    if (filter === 'all' || catFilter === filter || (catFilter && catFilter.indexOf(filter) !== -1)) {
                        cat.classList.remove('hidden');
                    } else {
                        cat.classList.add('hidden');
                    }
                });

                // Clear search when switching filters
                var searchInput = document.getElementById('menu-search');
                if (searchInput) {
                    searchInput.value = '';
                    clearSearchHighlights();
                }
            });
        });
    }

    // ---- Menu Search ----
    var searchInput = document.getElementById('menu-search');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            var query = this.value.toLowerCase().trim();
            var items = document.querySelectorAll('.menu-item');

            if (!query) {
                items.forEach(function (item) {
                    item.classList.remove('hidden');
                });
                clearSearchHighlights();
                // Show all categories
                menuCategories.forEach(function (cat) {
                    cat.classList.remove('hidden');
                });
                // Reset filter buttons
                filterBtns.forEach(function (b) { b.classList.remove('active'); });
                var allBtn = document.querySelector('.filter-btn[data-filter="all"]');
                if (allBtn) allBtn.classList.add('active');
                return;
            }

            // Show all categories when searching
            menuCategories.forEach(function (cat) {
                cat.classList.remove('hidden');
            });

            items.forEach(function (item) {
                var name = item.querySelector('h3');
                var desc = item.querySelector('.menu-item-desc');
                var text = (name ? name.textContent : '') + ' ' + (desc ? desc.textContent : '');
                text = text.toLowerCase();

                if (text.indexOf(query) !== -1) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });

            // Show/hide category titles based on visible items
            menuCategories.forEach(function (cat) {
                var visibleItems = cat.querySelectorAll('.menu-item:not(.hidden)');
                if (visibleItems.length === 0 && !cat.classList.contains('menu-sides')) {
                    cat.classList.add('hidden');
                }
            });
        });
    }

    function clearSearchHighlights() {
        var items = document.querySelectorAll('.menu-item');
        items.forEach(function (item) {
            item.classList.remove('hidden');
        });
    }

    // ---- Sticky menu controls shadow ----
    var menuControls = document.querySelector('.menu-controls');
    if (menuControls) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 100) {
                menuControls.style.boxShadow = '0 2px 12px rgba(26,18,8,0.08)';
            } else {
                menuControls.style.boxShadow = 'none';
            }
        });
    }

    // ---- Navbar background on scroll ----
    var navbar = document.querySelector('.navbar');
    if (navbar && !document.querySelector('.hero')) {
        navbar.style.background = 'var(--p)';
    }

})();
