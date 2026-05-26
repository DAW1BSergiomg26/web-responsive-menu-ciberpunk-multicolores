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
    document.body.classList.remove('menu-open');
  }

  hamburger?.addEventListener('click', () => {
    if (!navMobile) return;

    const isOpen = navMobile.classList.toggle('active');

    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
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

  // --- ORÁCULO DE ZEUS (proxy seguro vía backend) ---
  const responseArea = document.getElementById('oracle-response');
  const questionInput = document.getElementById('user-question');
  const charCount = document.getElementById('char-count');
  const oracleActions = document.getElementById('oracle-actions');
  const clearButton = document.getElementById('clear-oracle');

  // Character counter
  function updateCharCount() {
    const len = questionInput.value.length;
    charCount.textContent = `${len}/2000`;
    if (len > 1900) {
      charCount.style.color = '#ff6b6b';
    } else if (len > 1500) {
      charCount.style.color = '#ffd700';
    } else {
      charCount.style.color = 'rgba(223, 250, 255, 0.35)';
    }
  }

  questionInput?.addEventListener('input', updateCharCount);

  // Clear response
  function resetOracle() {
    responseArea.innerHTML = '<p class="placeholder-text">El Oráculo aguarda tu pregunta mortal...</p>';
    if (oracleActions) oracleActions.hidden = true;
  }

  clearButton?.addEventListener('click', resetOracle);

  // Empty-field feedback
  function shakeField() {
    questionInput.classList.add('oracle-field-error');
    setTimeout(() => questionInput.classList.remove('oracle-field-error'), 800);
  }

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const question = questionInput.value.trim();

    if (!question) {
      shakeField();
      return;
    }

    const submitButton = document.getElementById('oracle-submit');

    submitButton.disabled = true;
    submitButton.innerHTML = "Consultando... 🌩️";
    if (oracleActions) oracleActions.hidden = true;
    responseArea.innerHTML = '<div class="oracle-loading"><span class="neon-loader"></span><span>Zeus está pensando...</span></div>';

    try {
      const res = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: question }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(err.error || `Error ${res.status}`);
      }

      responseArea.innerHTML = '';
      let fullResponse = '';

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        fullResponse += text;
        responseArea.innerText = fullResponse;
        responseArea.scrollTop = responseArea.scrollHeight;
      }

      if (oracleActions) oracleActions.hidden = false;

    } catch (error) {
      console.error('Error del Oráculo:', error);
      responseArea.innerHTML = `<p style="color: #ff4d4d">${error.message || 'El rayo ha fallado. Intenta de nuevo.'}</p>`;
      if (oracleActions) oracleActions.hidden = false;
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = "Invocar ⚡";
      questionInput.value = "";
      if (charCount) charCount.textContent = '0/2000';
      if (charCount) charCount.style.color = 'rgba(223, 250, 255, 0.35)';
    }
  });

});