document.addEventListener('DOMContentLoaded', () => {

    // Partículas de Luz Divina
    const particlesContainer = document.getElementById('particles');

    function createParticle() {
        const p = document.createElement('div');
        p.classList.add('particle');
        const size = Math.random() * 7 + 4;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}vw`;
        p.style.animationDuration = `${Math.random() * 20 + 15}s`;
        p.style.opacity = Math.random() * 0.7 + 0.4;
        particlesContainer.appendChild(p);
        setTimeout(() => p.remove(), 40000);
    }

    setInterval(createParticle, 90);

    // Animación al scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.section, .hero').forEach(el => {
        el.style.transition = 'all 1.3s cubic-bezier(0.23, 1, 0.32, 1)';
        el.style.opacity = '0';
        el.style.transform = 'translateY(80px)';
        observer.observe(el);
    });

    // Rayo más intenso al hover
    const lightning = document.getElementById('lightning');
    lightning.addEventListener('mouseenter', () => lightning.style.animationDuration = '0.5s');
    lightning.addEventListener('mouseleave', () => lightning.style.animationDuration = '3.5s');

    console.log('%c⚡ Bienvenido al Año 3000 • Templo activado', 'color:#ffd700; font-size:18px');
});