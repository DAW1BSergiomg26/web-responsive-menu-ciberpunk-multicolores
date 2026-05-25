# ⚡ Flexora — Templo Digital del Olimpo 3000

**Donde el mito y el código forjan experiencias divinas.**

Flexora es una landing page cyberpunk-mitológica que fusiona la estética del Olimpo con diseño web moderno: HTML semántico, CSS con animaciones, y JavaScript ligero. Construida como templo digital para presentar proyectos, tecnologías y un formulario de contacto inspirado en ofrendas a los dioses.

---

## 📜 Concepto

> *"El rayo de Zeus encuentra su reflejo en el código. El diseño responsive es el nuevo Oráculo."*

La web mezcla dos mundos aparentemente opuestos:

- **La mitología griega** — dioses, rayos, reliquias, ofrendas, el monte Olimpo
- **El desarrollo frontend** — HTML5, CSS3, JavaScript, Tailwind, diseño responsive, accesibilidad

El resultado es una experiencia visual inmersiva con partículas divinas, gradientes celestiales y una paleta de colores que evoca el fuego, el oro y la energía del Olimpo.

---

## 🛠️ Tecnologías

| Tecnología | Uso |
|-----------|-----|
| **HTML5** | Estructura semántica del templo digital |
| **CSS3** | Animaciones, gradientes, partículas, diseño responsive |
| **JavaScript** | Menú accesible, partículas ember, scroll reveal, formulario |
| **Tailwind CSS v4** | Utilidades de layout, colores, responsive (generado localmente) |
| **Google Fonts** | Inter (texto) + Space Grotesk (títulos) |
| **Intersection Observer** | Animaciones de entrada eficientes |

---

## ✨ Características

- **Header fijo** con navegación responsive y menú hamburguesa animado
- **Partículas "ember"** que ascienden como cenizas divinas
- **Revelación por scroll** suave con IntersectionObserver
- **Gradientes animados** en títulos con efecto neón
- **Fondo estelar** con grid sutil y viñeta
- **Formulario de contacto** accesible con label, autocomplete y teclado
- **Modo de movimiento reducido** respetado (`prefers-reduced-motion`)
- **Favicon inline** con rayo ⚡
- **Open Graph + Twitter Cards** para compartir en redes
- **100% responsive**: móvil, tablet, escritorio

---

## 🔧 Optimización aplicada

| Aspecto | Mejora |
|---------|--------|
| **Rendimiento** | Tailwind CDN (~400 KB) reemplazado por CSS local (14 KB minificado) |
| **Accesibilidad** | Formulario con `<label>`, `autocomplete`, `aria-expanded`, soporte teclado |
| **SEO** | Meta description, Open Graph, Twitter Cards, HTML semántico |
| **CSS** | Eliminadas reglas duplicadas con Tailwind Preflight y scroll-smooth |
| **Limpieza** | Console.log eliminado, `.history/` ignorado por git |
| **Responsive** | Menú hamburguesa en móvil, grid adaptable, media queries |

---

## 📁 Estructura del proyecto

```
FLEXORA/
├── index.html           # Página principal
├── style.css            # Estilos personalizados (tema, animaciones, layout)
├── script.js            # Interactividad (menú, partículas, scroll reveal)
├── tailwind.css         # Tailwind generado y minificado (14 KB)
├── tailwind.config.js   # Configuración de Tailwind
├── src/
│   └── tailwind.css     # Punto de entrada CSS con @theme
├── package.json         # Dependencias y script build:css
└── README.md            # Este archivo
```

---

## 🚀 Instalación y uso

```bash
# 1. Clonar el repositorio
git clone https://github.com/DAW1BSergiomg26/web-responsive-menu-ciberpunk-multicolores.git
cd web-responsive-menu-ciberpunk-multicolores

# 2. Abrir index.html directamente en el navegador
#    (No necesita servidor — es estático puro)
```

### Si quieres regenerar Tailwind localmente:

```bash
npm install
npm run build:css
```

Esto escanea `index.html`, genera solo las clases usadas y produce `tailwind.css` minificado.

---

## 📦 Comandos útiles

| Comando | Qué hace |
|---------|----------|
| `npm run build:css` | Regenera `tailwind.css` minificado desde `src/tailwind.css` |
| `npm install` | Instala Tailwind CLI (solo para desarrollo) |

---

## 🔮 Futuras mejoras

- [ ] Navegación con scroll spy (resaltar sección activa)
- [ ] Formulario con envío real (servicio de correo o backend ligero)
- [ ] Lightbox / galería de proyectos
- [ ] Modo oscuro / claro toggle
- [ ] Efecto parallax en secciones principales
- [ ] Despliegue automático con GitHub Actions

---

## 👤 Autor

**Sergio Daniel Martínez Gómez**  
1º DAW — Desarrollo de Aplicaciones Web

> *Proyecto realizado como práctica de diseño responsive, maquetación frontend y despliegue. Inspirado en el mito, el código y la estética cyberpunk.*

---

## 🏛️ Frase final

> *"Zeus lanzó su rayo, nosotros lo escribimos en CSS."*
