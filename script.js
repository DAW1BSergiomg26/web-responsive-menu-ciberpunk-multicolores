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

  // --- LÓGICA DEL ORÁCULO DE ZEUS (OPENROUTER) ---
  import { OpenRouter } from "@openrouter/sdk";

  const responseArea = document.getElementById('oracle-response');
  const questionInput = document.getElementById('user-question');
  
  // NOTA: En un entorno real, la API Key vendría de un proxy o .env seguro.
  // Para este prototipo, se debe configurar aquí o vía variable de entorno.
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || "TU_API_KEY_AQUÍ";

  const openrouter = new OpenRouter({
    apiKey: apiKey
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const question = questionInput.question || questionInput.value;
    if (!question) return;

    const submitButton = document.getElementById('oracle-submit');
    
    // UI Loading state
    submitButton.disabled = true;
    submitButton.innerHTML = "Consultando... 🌩️";
    responseArea.innerHTML = '<p class="streaming-text">Conectando con el Olimpo...</p>';

    try {
      const stream = await openrouter.chat.send({
        model: "google/gemini-3.5-flash",
        messages: [
          {
            role: "system",
            content: "Eres Zeus en el año 3000. Respondes de forma épica, cyberpunk, mitológica y breve. Mezclas sabiduría divina con términos tecnológicos. Hablas como un Dios digital."
          },
          {
            role: "user",
            content: question
          }
        ],
        stream: true
      });

      responseArea.innerHTML = ""; // Limpiar loading
      let fullResponse = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          fullResponse += content;
          // Actualizar el DOM palabra a palabra (Efecto divino)
          responseArea.innerText = fullResponse;
          // Auto-scroll al final
          responseArea.scrollTop = responseArea.scrollHeight;
        }
      }

    } catch (error) {
      console.error("Error del Oráculo:", error);
      responseArea.innerHTML = '<p style="color: #ff4d4d">El rayo ha fallado. Revisa tu conexión (o tu API Key).</p>';
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = "Invocar ⚡";
      questionInput.value = "";
    }
  });

});