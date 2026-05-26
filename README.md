# ⚡ Flexora — Templo Digital del Olimpo 3000

**Donde el mito y el código forjan experiencias divinas.**

Landing page cyberpunk-mitológica con **Oráculo de Zeus potenciado por IA** (OpenRouter + Gemini 3.5 Flash). Combina HTML semántico, Tailwind CSS v4, animaciones CSS y un backend proxy seguro en Express.

---

## 🛠️ Stack

| Tecnología | Uso |
|-----------|-----|
| **HTML5** | Estructura semántica del templo digital |
| **CSS3** | Animaciones, gradientes, partículas ember, responsive design |
| **JavaScript** | Menú accesible, scroll reveal, streaming del Oráculo, partículas |
| **Tailwind CSS v4** | Utilidades de layout, colores, responsive (generado localmente vía CLI) |
| **Vite** | Bundler y dev server con proxy al backend |
| **Express** | Backend proxy seguro para OpenRouter |
| **OpenRouter API** | Acceso a Gemini 3.5 Flash para el Oráculo de Zeus |
| **Google Fonts** | Inter (texto) + Space Grotesk (títulos) |

---

## ✨ Características

- **Header fijo** con navegación responsive y menú hamburguesa animado
- **Partículas "ember"** que ascienden como cenizas divinas (3 variantes: gold, magenta, ash)
- **Revelación por scroll** con IntersectionObserver
- **Gradientes animados** en títulos con efecto neón
- **Fondo estelar** con grid sutil, viñeta y radios divinos
- **Oráculo de Zeus** con IA (Gemini 3.5 Flash):
  - Streaming en tiempo real con efecto typing
  - Spinner neón durante la carga
  - Contador de caracteres (límite 2000)
  - Botón de limpiar respuesta
  - Validación de campo vacío con shake
- **Arquitectura segura**: API key oculta en backend proxy (`server/.env`)
- **Modo de movimiento reducido** respetado (`prefers-reduced-motion`)
- **Favicon inline** con rayo ⚡
- **Open Graph + Twitter Cards** para compartir en redes
- **100% responsive**: móvil, tablet, escritorio
- **Accesibilidad**: `aria-expanded`, menú por teclado, `aria-live` en el Oráculo

---

## 📁 Estructura del proyecto

```
FLEXORA/
├── index.html             # Página principal
├── style.css              # Estilos personalizados (tema, animaciones, layout)
├── script.js              # Interactividad (menú, partículas, scroll reveal, Oráculo)
├── tailwind.css           # Tailwind v4 generado y minificado
├── vite.config.js         # Configuración de Vite + proxy al backend
├── package.json           # Dependencias y scripts
├── .gitignore
├── server/
│   ├── server.js          # Backend Express (proxy a OpenRouter)
│   └── .env.example       # Plantilla para la API key
└── src/
    └── tailwind.css       # Punto de entrada CSS con @theme
```

---

## 🚀 Instalación y uso

```bash
# 1. Clonar e instalar dependencias
git clone <repo-url>
cd web-responsive-menu-ciberpunk-multicolores
npm install

# 2. Configurar API key del Oráculo
cp server/.env.example server/.env
# Editar server/.env y pegar: OPENROUTER_API_KEY=sk-or-v1-tu_clave_real

# 3. Arrancar backend + frontend a la vez
npm run dev:full

# O por separado (dos terminales):
npm run server   # Backend → http://localhost:3001
npm run dev      # Frontend → http://localhost:3000
```

Abrir `http://localhost:3000` y navegar a **El Oráculo de Zeus**.

---

## 📦 Comandos

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Arranca Vite (frontend) en `http://localhost:3000` |
| `npm run server` | Arranca el backend proxy en `http://localhost:3001` |
| `npm run dev:full` | Arranca ambos simultáneamente (usa concurrently) |
| `npm run build:css` | Regenera `tailwind.css` minificado desde `src/tailwind.css` |

---

## 🔒 Arquitectura de seguridad

```
Navegador → fetch('/api/oracle') → Vite proxy → Express (3001) → OpenRouter API
                                                                         ↓
Navegador ← streaming visual ← Vite proxy ←  Express (3001) ←  SSE chunks
```

- La **API key** vive solo en `server/.env` — nunca llega al navegador
- El frontend llama a `/api/oracle`, Vite lo proxy al backend
- El backend valida, limita longitud (2000 chars), y aplica timeout (30s)
- Los errores se devuelven sin detalles técnicos

---

## 🔮 Próximas mejoras

- [ ] Scroll spy (resaltar sección activa en navbar)
- [ ] Iconos SVG personalizados (reemplazar emojis)
- [ ] Cargar Google Fonts localmente (sin CDN)
- [ ] Despliegue automático con GitHub Actions

---

## 👤 Autor

**Sergio Daniel Martínez Gómez**
1º DAW — Desarrollo de Aplicaciones Web

> *Proyecto realizado como práctica de diseño responsive, maquetación frontend, backend proxy y despliegue. Inspirado en el mito, el código y la estética cyberpunk.*

---

> *"Zeus lanzó su rayo, nosotros lo escribimos en código."*
