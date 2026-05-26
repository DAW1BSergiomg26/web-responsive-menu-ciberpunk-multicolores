# Deploy de Flexora en Render

Guía paso a paso para desplegar Flexora (frontend + backend) en Render.

---

## Requisitos

- Cuenta en [render.com](https://render.com) (registro gratuito con GitHub)
- API key de OpenRouter: https://openrouter.ai/keys
- Repositorio subido a GitHub

---

## Estructura del proyecto (después del deploy)

```
flexora/  (Static Site — frontend, Render lo sirve como web estática)
  ├── index.html
  ├── style.css
  ├── tailwind.css
  ├── script.js
  ├── assets/fonts/...
  └── ...

flexora-api/  (Web Service — backend Express, Render ejecuta Node)
  └── server/
      ├── server.js
      ├── package.json
      └── .env.example
```

El frontend llama al backend mediante `VITE_API_URL` (variable de entorno).

---

## Paso 1 — Crear el Web Service (backend Express)

El backend es el que se comunica con OpenRouter. Debe crearse primero para conocer su URL.

1. En el Dashboard de Render, haz clic en **"New +"** → **"Web Service"**.
2. Conecta tu cuenta de GitHub y selecciona el repositorio `web-responsive-menu-ciberpunk-multicolores`.
3. Configura el servicio:

   | Campo | Valor |
   |-------|-------|
   | **Name** | `flexora-api` |
   | **Region** | `Ohio` (us-east) |
   | **Branch** | `main` |
   | **Root Directory** | `server` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `node server.js` |
   | **Plan** | `Free` |

4. En la sección **"Environment Variables"**, añade:

   ```
   OPENROUTER_API_KEY = sk-or-v1-tu_clave_real_aqui
   SITE_URL          = https://flexora.onrender.com
   ```

   > `OPENROUTER_API_KEY` es obligatoria. Sin ella el Oráculo no funciona.
   > `SITE_URL` se usa para que OpenRouter sepa desde qué web se consulta.

5. Haz clic en **"Create Web Service"**.
6. Espera a que termine el build (2–3 minutos). Aparecerá un log en vivo.
7. Cuando termine, Render mostrará la URL del servicio:

   ```
   https://flexora-api.onrender.com
   ```

   > **Guarda esta URL.** La necesitarás para el frontend.

### Verificación del backend

Abre en el navegador o con `curl`:

```bash
# Debería devolver 404 (ruta raíz no definida, pero el servidor responde)
curl https://flexora-api.onrender.com/api/oracle -X POST \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hola Zeus"}'
```

Si el servidor responde con un JSON (error o respuesta), el backend funciona.

---

## Paso 2 — Crear el Static Site (frontend)

1. En el Dashboard, haz clic en **"New +"** → **"Static Site"**.
2. Selecciona el mismo repositorio.
3. Configura el servicio:

   | Campo | Valor |
   |-------|-------|
   | **Name** | `flexora` |
   | **Branch** | `main` |
   | **Root Directory** | (vacío — la raíz del repo) |
   | **Build Command** | `npm run build:css` |
   | **Publish Directory** | `./` (la raíz) |
   | **Plan** | `Free` |

4. En **"Environment Variables"**, añade:

   ```
   VITE_API_URL = https://flexora-api.onrender.com
   ```

   > Sin esta variable, el frontend intentará llamar a `/api/oracle` en su propio dominio (el Static Site) y fallará.

5. Haz clic en **"Create Static Site"**.
6. Espera el build. Render te dará la URL:

   ```
   https://flexora.onrender.com
   ```

### Verificación del frontend

1. Abre `https://flexora.onrender.com` en el navegador.
2. Abre DevTools → Network.
3. Escribe una pregunta al Oráculo y pulsa Enter.
4. Verifica:
   - La petición GET/POST va a `https://flexora-api.onrender.com/api/oracle`
   - La respuesta llega con streaming (texto aparece poco a poco)
   - No hay errores CORS ni 404

---

## Paso 3 — Probar la URL final

1. Abre `https://flexora.onrender.com` en el navegador.
2. Comprueba que el menú, las animaciones, el scroll spy y el Oráculo funcionan.
3. Envía una pregunta al Oráculo y confirma que el streaming funciona.

---

## Variables de entorno — resumen

| Variable | Servicio | Dónde se usa | Ejemplo |
|----------|----------|-------------|---------|
| `OPENROUTER_API_KEY` | Web Service (backend) | `server/server.js` línea 32 | `sk-or-v1-...` |
| `SITE_URL` | Web Service (backend) | `server/server.js` línea 44 (HTTP-Referer) | `https://flexora.onrender.com` |
| `VITE_API_URL` | Static Site (frontend) | `script.js` línea 8 (`import.meta.env`) | `https://flexora-api.onrender.com` |

---

## Errores comunes

### ❌ El Oráculo dice "no configurado"

**Causa**: `OPENROUTER_API_KEY` no está definida en el Web Service.

**Solución**: Ve al Dashboard → flexora-api → Environment → añade la variable → Deploy manual.

### ❌ El frontend carga pero el Oráculo no responde (error CORS o 404)

**Causa**: `VITE_API_URL` no está configurada o apunta al sitio incorrecto.

**Solución**: Verifica que apunte a `https://flexora-api.onrender.com` (sin barra final).

### ❌ La web se ve sin fuentes

**Causa**: Las fuentes locales no se copiaron al build.

**Solución**: Verifica que `assets/fonts/` existe en el repo y que los archivos `.woff2` están commiteados.

### ❌ El menú hamburguesa no abre

**Causa**: Puede ser error de JS. Abre DevTools → Console y busca errores.

### ❌ Error 502 "El Oráculo no responde"

**Causa**: OpenRouter está caído, la API key es inválida, o el backend no puede conectar.

**Solución**: Verifica la API key en https://openrouter.ai/keys. Mira los logs del Web Service en Render.

### ❌ Primer request tarda ~30 segundos

**Causa**: El plan Free de Render "duerme" el Web Service tras 15 minutos de inactividad. El primer request lo reactiva (cold start).

**Solución**: Es normal en free tier. Usa [UptimeRobot](https://uptimerobot.com) (gratis) para hacer ping cada 10 min.

---

## Comandos para probar local

```bash
# 1. Instalar dependencias (desde la raíz del proyecto)
npm install

# 2. Construir CSS de Tailwind
npm run build:css

# 3. Iniciar backend (en una terminal)
npm run server

# 4. Iniciar frontend (en otra terminal)
npm run dev

# O todo a la vez:
npm run dev:full
```

---

## Notas importantes

- El Web Service en free tier se duerme a los 15 minutos de inactividad.
- El Static Site no se duerme nunca (está siempre disponible).
- Render re-despliega automáticamente cuando haces push a la rama `main`.
- No subas el archivo `server/.env` al repositorio (está en `.gitignore`).
- Si cambias la URL del Web Service, actualiza `VITE_API_URL` y redeploya.

---

## Siguientes pasos (opcional)

- [ ] Conectar dominio personalizado (Settings → Custom Domain)
- [ ] Configurar UptimeRobot para evitar cold starts
- [ ] Cambiar a plan Starter ($7/mes) para eliminar sleep
- [ ] Añadir autenticación básica al backend con API key
- [ ] Migrar a Docker + Fly.io para escalado profesional
