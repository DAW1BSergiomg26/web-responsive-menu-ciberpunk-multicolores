document.addEventListener('DOMContentLoaded', () => {
    
    // Animación de tarjetas al hacer scroll
    const cards = document.querySelectorAll('.card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 150);
            }
        });
    }, { threshold: 0.15 });

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(60px)';
        card.style.transition = 'all 0.9s cubic-bezier(0.23, 1, 0.32, 1)';
        observer.observe(card);
    });

    // Efecto relámpago más fuerte al hacer hover en el logo
    const lightning = document.getElementById('lightning');
    if (lightning) {
        lightning.addEventListener('mouseenter', () => {
            lightning.style.animationDuration = '0.6s';
        });
        lightning.addEventListener('mouseleave', () => {
            lightning.style.animationDuration = '4s';
        });
    }

    console.log('%c⚡ Templo de Zeus cargado con poder divino', 'color:#ffd700; font-size:18px; font-family:monospace');
});