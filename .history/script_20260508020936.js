document.addEventListener('DOMContentLoaded', () => {
  const embersContainer = document.getElementById('embers');
  const hamburger = document.getElementById('hamburger');
  const navMobile = document.getElementById('nav-mobile');
  const lightning = document.getElementById('lightning');
  const form = document.getElementById('contact-form');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function createEmber() {
    if (!embersContainer || prefersReducedMotion) return;

    const ember = document.createElement('span');

    const size = Math.random() * 7 + 3;
    const drift = `${Math.random() * 240 - 120}px`;
    const duration = Math.random() * 10 + 9;
    const type = Math.random();
    const opacity = Math.random() * 0.7 + 0.35;

    ember.className = 'ember';

    if (type > 0.62) {
      ember.classList.add('magenta');
    } else if (type < 0.25) {
      ember.classList.add('ash');
    }

    ember.style.width = `${size}px`;
    ember.style.height = `${size}px`;
    ember.style.left = `${Math.random() * 100}%`;
    ember.style.setProperty('--drift', drift);
    ember.style.setProperty('--ember-opacity', opacity);
    ember.style.animationDuration = `${duration}s`;

    embersContainer.appendChild(ember);

    ember.addEventListener('animationend', () => {
      ember.remove();
    });
  }

  if (!prefersReducedMotion) {
    for (let i = 0; i < 35; i += 1) {
      setTimeout(createEmber, i * 90);
    }

    setInterval(createEmber, 70);
  }

  function closeMobileMenu() {
    if (!hamburger || !navMobile) return;

    hamburger.classList.remove('active');
    navMobile.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', () => {
    if (!navMobile) return;

    const isOpen = navMobile.classList.toggle('active');

    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  document.querySelectorAll('#nav-mobile a').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMobileMenu();
    }
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: '0px 0px -80px 0px'
    }
  );

  document.querySelectorAll('.reveal').forEach((element) => {
    revealObserver.observe(element);
  });

  lightning?.addEventListener('mouseenter', () => {
    lightning.style.animationDuration = '0.55s';
  });

  lightning?.addEventListener('mouseleave', () => {
    lightning.style.animationDuration = '3.5s';
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');

    if (!submitButton) return;

    const originalText = submitButton.textContent;

    submitButton.textContent = 'Ofrenda enviada ⚡';
    submitButton.disabled = true;

    setTimeout(() => {
      form.reset();
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }, 1800);
  });

  console.log(
    '%c⚡ Flexora Olimpo 3000 activado con cenizas cyberpunk',
    'color:#ffd700; font-size:18px; font-weight:bold;'
  );
});