(function () {
  'use strict';

  // Mobile menu
  var toggle = document.querySelector('[data-sgb-menu-toggle]');
  var menu = document.getElementById('sgb-mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      menu.hidden = !open;
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Pages dropdown — keep open while moving into menu (hover gap / click)
  var pagesNav = document.querySelector('.sgb-nav-pages');
  if (pagesNav) {
    var pagesTrigger = pagesNav.querySelector('.sgb-nav-pages__trigger');
    var closePages = function () {
      pagesNav.classList.remove('is-open');
      if (pagesTrigger) pagesTrigger.setAttribute('aria-expanded', 'false');
    };
    var openPages = function () {
      pagesNav.classList.add('is-open');
      if (pagesTrigger) pagesTrigger.setAttribute('aria-expanded', 'true');
    };
    pagesNav.addEventListener('mouseenter', openPages);
    pagesNav.addEventListener('mouseleave', closePages);
    if (pagesTrigger) {
      pagesTrigger.setAttribute('aria-haspopup', 'true');
      pagesTrigger.setAttribute('aria-expanded', 'false');
      pagesTrigger.addEventListener('click', function (e) {
        // Allow navigation on second click / keep toggle for sticky open
        if (!pagesNav.classList.contains('is-open')) {
          e.preventDefault();
          openPages();
        }
      });
    }
    document.addEventListener('click', function (e) {
      if (!pagesNav.contains(e.target)) closePages();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closePages();
    });
  }

  // Floating chat
  var chatToggle = document.querySelector('[data-sgb-chat-toggle]');
  var chatPanel = document.getElementById('sgb-chat-panel');
  if (chatToggle && chatPanel) {
    var iconOpen = chatToggle.querySelector('.sgb-chat__icon-open');
    var iconClose = chatToggle.querySelector('.sgb-chat__icon-close');
    chatToggle.addEventListener('click', function () {
      var open = chatPanel.hasAttribute('hidden');
      if (open) chatPanel.removeAttribute('hidden');
      else chatPanel.setAttribute('hidden', '');
      chatToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (iconOpen) iconOpen.hidden = open;
      if (iconClose) iconClose.hidden = !open;
    });
  }

  // FAQ tabs
  var faqButtons = document.querySelectorAll('[data-sgb-faq]');
  faqButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var idx = btn.getAttribute('data-sgb-faq');
      faqButtons.forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      document.querySelectorAll('.sgb-faq__panel').forEach(function (panel) {
        var on = panel.id === 'faq-a-' + idx;
        panel.classList.toggle('is-active', on);
        panel.hidden = !on;
      });
    });
  });

  // Pricing flip cards
  document.querySelectorAll('[data-sgb-flip]').forEach(function (card) {
    var openBtn = card.querySelector('[data-sgb-flip-open]');
    var closeBtn = card.querySelector('[data-sgb-flip-close]');
    if (openBtn) {
      openBtn.addEventListener('click', function () {
        card.classList.add('is-flipped');
      });
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        card.classList.remove('is-flipped');
      });
    }
    card.addEventListener('mouseleave', function () {
      card.classList.remove('is-flipped');
    });
  });

  function isCardHidden(card) {
    return card.hasAttribute('hidden') || card.classList.contains('sgb-is-hidden');
  }
  function setCardHidden(card, hide) {
    if (hide) {
      card.setAttribute('hidden', '');
      card.classList.add('sgb-is-hidden');
    } else {
      card.removeAttribute('hidden');
      card.classList.remove('sgb-is-hidden');
    }
  }

  // Homepage tools load more — exact Next: start 20, each click +20
  var moreBtn = document.querySelector('[data-sgb-tools-more]');
  if (moreBtn) {
    // Normalize initial state (first 20 visible)
    var allCards = Array.prototype.slice.call(document.querySelectorAll('[data-sgb-tool-card]'));
    var initial = parseInt(moreBtn.getAttribute('data-step') || '20', 10);
    allCards.forEach(function (card, i) {
      setCardHidden(card, i >= initial);
    });

    moreBtn.addEventListener('click', function () {
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-sgb-tool-card]'));
      var step = parseInt(moreBtn.getAttribute('data-step') || '20', 10);
      var shown = 0;
      cards.forEach(function (card) {
        if (!isCardHidden(card)) shown++;
      });
      var next = Math.min(shown + step, cards.length);
      cards.forEach(function (card, i) {
        setCardHidden(card, i >= next);
      });
      var remaining = cards.length - next;
      if (remaining <= 0) {
        moreBtn.setAttribute('hidden', '');
        moreBtn.classList.add('sgb-is-hidden');
      } else {
        var label = moreBtn.querySelector('[data-sgb-more-label]');
        var text = 'View More Tools (' + remaining + ' more)';
        if (label) label.textContent = text;
        else moreBtn.childNodes[0].textContent = text;
      }
    });
  }

  // Shop search + numbered pagination (20/page) — parity with ProductsClient.tsx
  var search = document.getElementById('sgb-shop-search');
  var shopCards = Array.prototype.slice.call(document.querySelectorAll('[data-sgb-product]'));
  var meta = document.getElementById('sgb-shop-meta');
  var pager = document.getElementById('sgb-shop-pager');
  var PER = 20;
  var shopPage = 1;

  function shopPageButtons(totalPages, current) {
    var pages = [];
    var maxShow = Math.min(totalPages, 7);
    var i;
    for (i = 0; i < maxShow; i++) {
      var pageNum;
      if (totalPages <= 7) pageNum = i + 1;
      else if (current <= 4) pageNum = i + 1;
      else if (current >= totalPages - 3) pageNum = totalPages - 6 + i;
      else pageNum = current - 3 + i;
      pages.push(pageNum);
    }
    return pages;
  }

  function renderShop(filter, page) {
    var q = (filter || '').trim().toLowerCase();
    var matched = shopCards.filter(function (card) {
      var name = (card.getAttribute('data-name') || '').toLowerCase();
      return !q || name.indexOf(q) !== -1;
    });
    var totalPages = Math.max(1, Math.ceil(matched.length / PER));
    shopPage = Math.min(Math.max(1, page || 1), totalPages);
    var start = (shopPage - 1) * PER;
    var end = start + PER;
    var visible = matched.slice(start, end);

    shopCards.forEach(function (card) {
      setCardHidden(card, true);
    });
    visible.forEach(function (card) {
      setCardHidden(card, false);
    });

    if (meta) {
      meta.textContent =
        matched.length === 0
          ? 'No products found matching your search.'
          : 'Showing ' +
            (visible.length ? start + 1 : 0) +
            ' - ' +
            Math.min(end, matched.length) +
            ' of ' +
            matched.length +
            ' products';
    }

    if (!pager) return;
    if (totalPages <= 1 || matched.length === 0) {
      pager.innerHTML = '';
      pager.setAttribute('hidden', '');
      pager.classList.add('sgb-is-hidden');
      return;
    }
    pager.removeAttribute('hidden');
    pager.classList.remove('sgb-is-hidden');

    var html = '';
    html +=
      '<button type="button" class="sgb-shop-pager__nav" data-shop-page="' +
      (shopPage - 1) +
      '"' +
      (shopPage === 1 ? ' disabled' : '') +
      ' aria-label="Previous page">‹</button>';
    shopPageButtons(totalPages, shopPage).forEach(function (n) {
      html +=
        '<button type="button" class="sgb-shop-pager__btn' +
        (n === shopPage ? ' is-active' : '') +
        '" data-shop-page="' +
        n +
        '">' +
        n +
        '</button>';
    });
    html +=
      '<button type="button" class="sgb-shop-pager__nav" data-shop-page="' +
      (shopPage + 1) +
      '"' +
      (shopPage === totalPages ? ' disabled' : '') +
      ' aria-label="Next page">›</button>';
    pager.innerHTML = html;
  }

  if (shopCards.length) {
    renderShop(search ? search.value : '', 1);
    if (search) {
      search.addEventListener('input', function () {
        renderShop(search.value, 1);
      });
    }
    if (pager) {
      pager.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-shop-page]');
        if (!btn || btn.disabled) return;
        var next = parseInt(btn.getAttribute('data-shop-page'), 10);
        if (!next) return;
        renderShop(search ? search.value : '', next);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }
})();
