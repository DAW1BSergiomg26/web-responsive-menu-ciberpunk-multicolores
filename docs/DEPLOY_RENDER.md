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
  ├── manifest.webmanifest
  ├── sw.js
  ├── assets/fonts/...
  ├── assets/icons/...
  └── ...

flexora-api/  (Web Service — backend Express, Render ejecuta Node)
  └── server/
      ├── server.js
      ├── package.json
      └── .env.example
```

El frontend llama al backend mediante `API_BASE` (inyectada en build via `scripts/inject-api-base.js`).

---

## Paso 1 — Crear el Web Service (backend Express)

El backend es el que se comunica con OpenRouter. Debe crearse primero para conocer su URL.

1. En el Dashboard de Render, haz clic en **"New +"** → **"Web Service"**.
2. Conecta tu cuenta de GitHub y selecciona el repositorio.
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

   | Variable | Valor | ¿Por qué? |
   |----------|-------|-----------|
   | `OPENROUTER_API_KEY` | `sk-or-v1-tu_clave_real_aqui` | Obligatoria. Sin ella el Oráculo no funciona. |
   | `NODE_ENV` | `production` | Activa CORS estricto y modo producción. |
   | `SITE_URL` | `https://flexora.onrender.com` | Se envía a OpenRouter como HTTP-Referer. |

5. Haz clic en **"Create Web Service"**.
6. Espera a que termine el build (2–3 minutos). Aparecerá un log en vivo.
7. Cuando termine, Render mostrará la URL del servicio:

   ```
   https://flexora-api.onrender.com
   ```

   > **Guarda esta URL.** La necesitarás para el frontend.

### Verificación del backend

```bash
curl https://flexora-api.onrender.com/api/health
# → {"status":"ok","keyConfigured":true}

curl -X POST https://flexora-api.onrender.com/api/oracle \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hola Zeus"}'
# → Respuesta en streaming del Oráculo
```

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
   | **Build Command** | `npm run build` |
   | **Publish Directory** | `./` (la raíz) |
   | **Plan** | `Free` |

4. En **"Environment Variables"**, añade:

   | Variable | Valor | ¿Por qué? |
   |----------|-------|-----------|
   | `API_BASE` | `https://flexora-api.onrender.com` | El build inyecta esta URL en `index.html` para que el frontend sepa dónde está el backend. |

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
   - La petición POST va a `https://flexora-api.onrender.com/api/oracle`
   - La respuesta llega con streaming (texto aparece poco a poco)
   - No hay errores CORS ni 404
5. Abre DevTools → Application → Manifest: debe mostrar la info PWA correctamente.
6. Abre DevTools → Application → Service Workers: debe mostrar `sw.js` activado.

---

## Variables de entorno — resumen

| Variable | Servicio | Dónde se usa | Ejemplo |
|----------|----------|-------------|---------|
| `OPENROUTER_API_KEY` | Web Service | `server/server.js` (llamada a OpenRouter) | `sk-or-v1-...` |
| `NODE_ENV` | Web Service | CORS restrictivo en producción | `production` |
| `SITE_URL` | Web Service | `server/server.js` (HTTP-Referer para OpenRouter) | `https://flexora.onrender.com` |
| `API_BASE` | Static Site (build-time) | `scripts/inject-api-base.js` → `index.html` → `script.js` | `https://flexora-api.onrender.com` |

---

## Errores comunes

### ❌ El Oráculo dice "no está configurado"

**Causa**: `OPENROUTER_API_KEY` no está definida en el Web Service.

**Solución**: Ve al Dashboard → flexora-api → Environment → añade la variable → Deploy manual (botón **Manual Deploy** → **Clear build cache & deploy**).

### ❌ Error CORS en la consola del navegador

**Causa**: El frontend está en un dominio no listado en `ALLOWED_ORIGINS` del backend.

**Solución**: Ve a flexora-api → Environment → añade `FRONTEND_URL` con la URL exacta del frontend (ej: `https://flexora.onrender.com`). Luego redeploya el backend.

### ❌ El build del Static Site falla

**Causa**: Posiblemente falta `npm install` antes del build.

**Solución**: Asegúrate de que el Root Directory está vacío y que `package.json` está en la raíz. Render ejecuta `npm install` automáticamente antes del build command en Static Sites.

### ❌ PWA no se instala (no aparece el icono +)

**Causa**: El manifest no se carga, o falta HTTPS, o el service worker no se registra.

**Solución**: Render Static Site sirve HTTPS automáticamente. Verifica:
- `manifest.webmanifest` se sirve en `https://flexora.onrender.com/manifest.webmanifest`
- `sw.js` se sirve en `https://flexora.onrender.com/sw.js`
- No hay errores en DevTools → Application → Manifest

### ❌ El frontend funciona pero el Oráculo responde 404

**Causa**: `window.API_BASE` no se inyectó correctamente (apunta a `''` en vez de la URL de la API).

**Solución**: Abre DevTools → Console y escribe `window.API_BASE`. Si es `''`, el build no inyectó la variable. Ve a flexora → Environment → verifica que `API_BASE` está configurada y redeploya.

### ❌ Primer request tarda ~30 segundos

**Causa**: El plan Free de Render "duerme" el Web Service tras 15 minutos de inactividad. El primer request lo reactiva (cold start).

**Solución**: Es normal en free tier. Usa [UptimeRobot](https://uptimerobot.com) (gratis) para hacer ping a `https://flexora-api.onrender.com/api/health` cada 10 min.

---

## Cómo probar local

```bash
# 1. Instalar dependencias
npm install

# 2. Construir CSS de Tailwind (opcional, Vite también lo sirve)
npm run build:css

# 3. Iniciar backend + frontend (todo a la vez)
npm run dev:full

# Frontend: http://localhost:3000
# Backend:  http://localhost:3001
```

En local, `window.API_BASE` se queda como `''` y Vite proxy redirige `/api` → `:3001`.

---

## Notas importantes

- El Web Service en free tier se duerme a los 15 minutos de inactividad.
- El Static Site no se duerme nunca (está siempre disponible).
- Render re-despliega automáticamente cuando haces push a la rama `main`.
- No subas el archivo `server/.env` al repositorio (está en `.gitignore`).
- Si cambias la URL del Web Service, actualiza `API_BASE` en el Static Site y redeploya.
- El cache del Service Worker se invalida automáticamente al redeployar (cambia el contenido de `sw.js` → nuevo hash).

---

## Siguientes pasos (opcional)

- [ ] Conectar dominio personalizado (Settings → Custom Domain)
- [ ] Configurar UptimeRobot para evitar cold starts
- [ ] Cambiar a plan Starter ($7/mes) para eliminar sleep
- [ ] Añadir autenticación básica al backend con API key
- [ ] Migrar a Docker + Fly.io para escalado profesional
