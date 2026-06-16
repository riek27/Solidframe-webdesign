/**
 * Solidframe Web - Global JavaScript
 * Includes robust Netlify form handling + fixed FAQ accordion
 */
(function () {
  'use strict';

  /* ---- DOM Elements ---- */
  const nav = document.getElementById('nav');
  const backToTop = document.getElementById('backToTop');
  const menuToggle = document.getElementById('menuToggle');
  const menuClose = document.getElementById('menuClose');
  const mobileMenu = document.getElementById('mobileMenu');
  const body = document.body;

  /* ---- Scroll & Nav ---- */
  function handleScroll() {
    if (nav) nav.classList.toggle('navbar-scrolled', window.scrollY > 50);
    if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 400);
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ---- Mobile Menu ---- */
  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.style.transform = 'translateX(0)';
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
    body.style.overflow = 'hidden';
    body.classList.add('menu-open');
  }
  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.style.transform = 'translateX(100%)';
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    body.style.overflow = '';
    body.classList.remove('menu-open');
  }
  if (menuToggle) menuToggle.addEventListener('click', openMobileMenu);
  if (menuClose) menuClose.addEventListener('click', closeMobileMenu);
  document.querySelectorAll('#mobileMenu a, .mob-link').forEach(link => link.addEventListener('click', closeMobileMenu));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.style.transform === 'translateX(0px)') closeMobileMenu();
  });

  /* ---- Mobile Dropdown Accordion ---- */
  document.querySelectorAll('.mobile-dropdown').forEach(dropdown => {
    const toggle = dropdown.querySelector('.mobile-dropdown-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      dropdown.classList.toggle('active');
    });
  });

  /* ---- FAQ Accordion (UNIFIED - uses .open class) ---- */
  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', function() {
      const faqItem = this.closest('.faq-item');
      const toggle = this.querySelector('.faq-toggle');
      const isOpen = faqItem.classList.contains('open');
      // Optional: close other FAQ items (remove if you want multiple open)
      // document.querySelectorAll('.faq-item.open').forEach(item => {
      //   if (item !== faqItem) {
      //     item.classList.remove('open');
      //     item.querySelector('.faq-toggle').textContent = '+';
      //   }
      // });
      faqItem.classList.toggle('open');
      if (toggle) {
        toggle.textContent = isOpen ? '+' : '−';
      }
    });
  });

  /* ---- Blog Read More / Less ---- */
  function initBlogCards() {
    document.querySelectorAll('.blog-card').forEach(card => {
      const btn = card.querySelector('.read-more-btn');
      const content = card.querySelector('.blog-full-content');
      if (!btn || !content) return;
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const expanded = card.classList.contains('expanded');
        card.classList.toggle('expanded');
        content.style.maxHeight = expanded ? '0' : content.scrollHeight + 'px';
        const span = newBtn.querySelector('span');
        const svg = newBtn.querySelector('svg');
        if (span) span.textContent = expanded ? 'Read More' : 'Read Less';
        if (svg) svg.style.transform = expanded ? 'rotate(0deg)' : 'rotate(180deg)';
      });
      content.style.maxHeight = '0';
    });
  }
  window.toggleBlogPost = function (btn) {
    const card = btn.closest('.blog-card');
    if (!card) return;
    const content = card.querySelector('.blog-full-content');
    const span = btn.querySelector('span');
    const svg = btn.querySelector('svg');
    const expanded = card.classList.contains('expanded');
    card.classList.toggle('expanded');
    content.style.maxHeight = expanded ? '0' : content.scrollHeight + 'px';
    if (span) span.textContent = expanded ? 'Read More' : 'Read Less';
    if (svg) svg.style.transform = expanded ? 'rotate(0deg)' : 'rotate(180deg)';
  };
  initBlogCards();

  /* ---- Scroll Reveal ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    revealEls.forEach(el => observer.observe(el));
  }

  /* ---- Netlify Forms (AJAX with fallback) ---- */
  function setupNetlifyForm(formId, successId) {
    const form = document.getElementById(formId);
    const successDiv = document.getElementById(successId);
    if (!form || !successDiv) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const params = new URLSearchParams(formData).toString();

      try {
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params
        });

        if (res.ok) {
          form.style.display = 'none';
          successDiv.classList.remove('hidden');
          successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

          setTimeout(() => {
            successDiv.classList.add('hidden');
            form.style.display = '';
            form.reset();
          }, 5000);
          return;
        }
        throw new Error(`Status ${res.status}`);
      } catch (err) {
        console.warn('AJAX failed, using fallback:', err);

        form.style.display = 'none';
        successDiv.classList.remove('hidden');
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setTimeout(() => {
          form.submit();
        }, 1500);
      }
    });
  }

  setupNetlifyForm('quoteForm', 'formDone');
  setupNetlifyForm('contactForm', 'formSuccess');

  /* ---- Smooth Scroll ---- */
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      closeMobileMenu();
    });
  });

  if (backToTop) {
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
})();
