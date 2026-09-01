# QA Checklist — Inversiones ICR

**Proyecto**: `inversiones-icr`
**Objetivo**: Validar exhaustivamente la app antes de desplegar al VPS de producción.
**Uso**: Esta lista se ejecuta MANUALMENTE sobre un ambiente de dev limpio. Cada sección tiene criterios PASS (✅) / FAIL (❌) / BLOCKER (🛑). Al final de cada fase marca el resultado; si aparece un blocker, se corrige y se re-corre la fase entera.

---

## 0. Pre-requisitos del ambiente

Antes de empezar cualquier prueba, resetea a un estado conocido:

```bash
cd "/Users/soulkin/Downloads/InversionesICR (1)/web"

# DB limpia + seed fresco
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d
sleep 3
npx prisma migrate dev --name qa_reset
npm run db:seed
npx tsx scripts/generate-placeholders.ts

# Tests unitarios verdes
npm test -- --run

# Levantar dev server (otra terminal)
rm -rf .next
npm run dev
```

**Gate inicial**:
- [ ] `npm test` → 154+ tests pasando, 0 fallos
- [ ] `npx tsc --noEmit` → solo warnings aceptables (no errores bloqueantes)
- [ ] Dev server arranca sin errores en consola
- [ ] `http://localhost:3001/api/health` → `{ status: 'ok', db: 'up', storage: 'up' }`

---

## 1. Sitio público — navegación y SEO

### 1.1 Rutas base ES
Visita cada URL. Debe renderizar contenido completo, sin pantalla vacía, sin errores en consola.

- [ ] `/` — Home (hero + marquee + intro + CTA grid)
- [ ] `/servicios`
- [ ] `/proyectos` — 6 proyectos seed visibles con imágenes
- [ ] `/proyectos/proyecto-aureo` — detalle con galería + metadata
- [ ] `/calculadora` — sliders interactivos
- [ ] `/impacto`
- [ ] `/contacto` — formulario visible

### 1.2 Rutas EN (mirror)
Mismos criterios:

- [ ] `/en`
- [ ] `/en/servicios`
- [ ] `/en/proyectos`
- [ ] `/en/proyectos/proyecto-aureo`
- [ ] `/en/calculadora`
- [ ] `/en/impacto`
- [ ] `/en/contacto`

### 1.3 Navegación entre páginas (sin refresh)
Desde `/`, click en cada item del nav → la página destino debe renderizar completa sin F5. Repite para `/en`.

- [ ] Click Servicios → contenido completo
- [ ] Click Proyectos → grid con 6 proyectos + filtros visibles
- [ ] Click Calculadora → sliders
- [ ] Click Impacto → secciones visibles
- [ ] Click Contacto → form
- [ ] Volver a Inicio (logo) → home OK

### 1.4 Toggle de idioma
- [ ] En `/`, click `EN` → navega a `/en`, nav ahora en inglés
- [ ] Mismo en inversa: `/en` → `ES` → `/`
- [ ] Cookie `icr-lang` queda seteada (DevTools → Application → Cookies)

### 1.5 Filtro de categoría en proyectos
- [ ] En `/proyectos`, click categoría "Minería" → URL cambia a `?cat=mineria`, solo proyectos de esa categoría
- [ ] Click "Todos" o similar → vuelve a ver los 6
- [ ] Navegar directo a `/proyectos?cat=energia` → solo proyectos de energía

### 1.6 Slug alias / redirect 301
- [ ] Login admin, edita un proyecto, cambia slug `proyecto-aureo` → `nuevo-slug-test`, guarda
- [ ] Logout
- [ ] Visita `/proyectos/proyecto-aureo` → **301 redirect** a `/proyectos/nuevo-slug-test`
- [ ] Revierte el slug al original

### 1.7 SEO
- [ ] `view-source:http://localhost:3001/` → tag `<title>`, `<meta description>`, `og:*`
- [ ] `/proyectos/proyecto-aureo` → `og:image` apunta a la imagen principal
- [ ] `http://localhost:3001/sitemap.xml` → lista `/`, `/en`, proyectos con slugs
- [ ] `http://localhost:3001/robots.txt` → `Disallow: /admin`

### 1.8 Consola del navegador
Durante TODO el recorrido anterior, la consola debe estar limpia:
- [ ] No hay errores rojos
- [ ] No hay warnings de hydration mismatch
- [ ] No hay 404 de assets (imágenes, CSS, JS)

---

## 2. Admin intranet

### 2.1 Auth

- [ ] `/admin/login` sin sesión → muestra form
- [ ] Login con credenciales incorrectas → mensaje de error visible (NO crashea)
- [ ] Login con credenciales correctas (seed admin) → redirige a `/admin` (dashboard)
- [ ] Intentar acceder a `/admin/banners` sin sesión → redirige a `/admin/login?from=...`
- [ ] Tras logout (botón "Salir") → sesión termina, `/admin` redirige a login

### 2.2 Rate limit de login
- [ ] 5 intentos fallidos rápidos con la misma IP → **el 6to es rechazado** (mensaje o silencio)
- [ ] Esperar 60s → vuelve a permitir login

### 2.3 Role guards (ADMIN vs EDITOR)
**Para ejecutar esto necesitas un usuario EDITOR. Crea uno manualmente:**
```bash
docker compose -f docker-compose.dev.yml exec postgres psql -U icr -d icr -c "INSERT INTO \"User\" (id, email, \"passwordHash\", role, \"createdAt\", \"updatedAt\") VALUES ('test-editor', 'editor@example.com', '\$2a\$12\$...bcrypt-hash-de-password-con-al-menos-12-chars', 'EDITOR', NOW(), NOW());"
```
(Genera el hash con `node -e "require('bcryptjs').hash('editorpass12345', 12, (_,h)=>console.log(h))"`)

- [ ] Login como EDITOR → ve Dashboard, Banners, Proyectos, Categorías, Mensajes
- [ ] Sidebar NO muestra "Configuración" (porque es ADMIN-only)
- [ ] Accede directamente a `/admin/settings` → **redirige a `/admin?error=forbidden`**
- [ ] EDITOR puede crear/editar/eliminar banners y proyectos normalmente
- [ ] Logout y vuelve al ADMIN

### 2.4 Dashboard
- [ ] Stats cards muestran cifras reales (banners activos/total, proyectos, categorías, mensajes)
- [ ] "Banners activos" refleja el valor real de la DB
- [ ] Si hay mensajes sin leer, aparece el atajo "Ver mensajes sin leer (N)"

### 2.5 CRUD Banners

**Crear**:
- [ ] `/admin/banners/new` → form con todos los campos
- [ ] Submit sin título ES → error "Título ES es obligatorio" (o similar)
- [ ] Submit sin imagen → error de imagen
- [ ] Submit imagen > 5MB → error "archivo demasiado grande"
- [ ] Submit válido → redirige a lista, banner aparece

**Listar**:
- [ ] Lista se ve en dark theme con filas legibles
- [ ] Toggle activo/inactivo funciona inmediatamente
- [ ] Drag handle ⠿ permite reordenar (desktop)
- [ ] Orden persiste tras refresh

**Invariante máx activos** (el check crítico):
- [ ] Settings → `maxActiveBanners = 5` (default)
- [ ] Crear 5 banners y activarlos todos
- [ ] Intentar activar un 6to → **error "Máximo 5 banners activos"**, NO se activa
- [ ] Desactiva uno → ahora sí puedes activar el 6to

**Editar**:
- [ ] Click "Editar" → form pre-rellenado
- [ ] Cambia título → guarda → refleja en lista + en home
- [ ] Sube imagen nueva → cambia; sin subir nada → mantiene la anterior
- [ ] Toggle EN opcional: sin EN → home en `/en` muestra fallback a ES

**Eliminar**:
- [ ] Click "Eliminar" → confirmación
- [ ] Tras eliminar → desaparece de lista y de home
- [ ] La imagen se borra del disco (verifica `ls storage/uploads/*/*/<hash>.jpg`)

### 2.6 CRUD Proyectos

Mismo patrón que banners pero agregado:

- [ ] Crear proyecto con imagen principal + 3 galería → detalle muestra galería
- [ ] Cambiar slug → accede al slug viejo → **redirect 301 funciona**
- [ ] Cambiar imagen principal → vieja se borra, nueva aparece
- [ ] Desactivar proyecto → desaparece de `/proyectos` público pero sigue en admin
- [ ] Filtro por categoría en admin funciona

### 2.7 CRUD Categorías
- [ ] Crear categoría nueva → slug se genera auto (kebab-case)
- [ ] Intentar crear categoría con slug duplicado → error
- [ ] Editar → cambios persisten
- [ ] Intentar eliminar categoría CON proyectos asignados → **error "en uso"**, NO se borra
- [ ] Cambiar proyectos a otra categoría → ahora sí se puede eliminar

### 2.8 Settings
- [ ] Cambiar `heroDisplayMode` a `banners-only` → home muestra solo banners
- [ ] Cambiar a `banners-over-animation` → banners con animación SVG detrás
- [ ] Cambiar a `animation-only` → solo animación, aunque haya banners activos
- [ ] Cambiar `animIntensity` → home reacciona (scroll parallax más/menos fuerte)

### 2.9 Mensajes de contacto
- [ ] En `/contacto` (público) → llenar y enviar form
- [ ] Mensaje aparece en `/admin/mensajes`
- [ ] Click en un mensaje → se marca como leído
- [ ] Eliminar mensaje → desaparece
- [ ] Dashboard "Mensajes sin leer" actualiza

---

## 3. i18n — fallback per-campo

- [ ] Crear banner con `titleEs` solamente (sin EN, sin descEn)
- [ ] En `/en` → el banner muestra `titleEs` como fallback
- [ ] Crear proyecto con `descEn` pero SIN `titleEn`
- [ ] En `/en/proyectos/[slug]` → título en ES, descripción en EN

---

## 4. Responsive / dispositivos

Probar en tres breakpoints (DevTools → toggle device toolbar):

### 4.1 Desktop (≥1200px)
- [ ] Home: hero full viewport, nav fijo arriba
- [ ] Proyectos: grid de 3 columnas
- [ ] Admin: sidebar 260px + contenido

### 4.2 Tablet (768–1199px)
- [ ] Proyectos: grid 2 columnas
- [ ] Admin: sidebar intacto, contenido se ajusta

### 4.3 Mobile (< 768px)
- [ ] Nav se compacta o muestra menu (verificar qué está pensado)
- [ ] Admin: sidebar pasa arriba horizontal
- [ ] Forms legibles, inputs tap-target ≥ 44px
- [ ] Hero texto no se sale
- [ ] Dashboard stats apilan verticalmente

---

## 5. Browsers

Matriz mínima:

| Navegador | Home | Proyectos | Admin CRUD | Nota |
|-----------|------|-----------|------------|------|
| Chrome (última) | [ ] | [ ] | [ ] | |
| Safari (última) | [ ] | [ ] | [ ] | Verifica backdrop-filter del nav |
| Firefox (última) | [ ] | [ ] | [ ] | |
| Edge (última) | [ ] | [ ] | [ ] | |
| Safari iOS | [ ] | [ ] | — | Solo lectura |
| Chrome Android | [ ] | [ ] | — | Solo lectura |

---

## 6. Seguridad — manual QA

### 6.1 Session / cookies
- [ ] Cookie de sesión es `httpOnly` + `Secure` en prod (check DevTools)
- [ ] Borrar cookie → `/admin` redirige a login
- [ ] Sesión expira tras periodo definido (Auth.js default)

### 6.2 SSRF / path traversal
- [ ] Visita `/api/media/../../etc/passwd` → **404**, no sirve nada fuera de storage
- [ ] Visita `/api/media/sample/../../package.json` → **404 o 403**

### 6.3 XSS
- [ ] Crear banner con título `<script>alert(1)</script>` → el texto se escapa, NO ejecuta
- [ ] Mismo con descripción, location de proyecto, nombre de categoría, form de contacto

### 6.4 CSRF (server actions)
- [ ] Desde origen externo, POST `/admin/banners/new` con FormData → rechazado por Auth.js
  (Next Server Actions usan el origen + token. No necesitas implementar nada extra, solo verificar.)

### 6.5 Admin secrets
- [ ] Grep `AUTH_SECRET` en el repo → solo aparece en `.env.example` y `src/shared/lib/env.ts`
  ```bash
  grep -r "AUTH_SECRET" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git
  ```
- [ ] `.env.local` y `.env` están en `.gitignore`
- [ ] El `AUTH_SECRET` de prod NO es el mismo que el de dev (regenerar con `openssl rand -base64 32`)

---

## 7. Tests automáticos

- [ ] `npm test -- --run` → todos pasan (esperado: 154+, sin fallos)
- [ ] `npm run test:e2e` (Playwright, con dev server corriendo) → todos los specs verdes
- [ ] Ejecutar tests 2 veces seguidas → no hay tests flaky

---

## 8. Build de producción (Docker)

```bash
docker compose build app
docker compose up -d
sleep 15
```

- [ ] `docker compose ps` → los 3 servicios `running` (app, postgres, nginx)
- [ ] `curl http://localhost/api/health` → `{ status: 'ok' }`
- [ ] `curl http://localhost/` → HTML de home
- [ ] `curl http://localhost/proyectos` → HTML de lista
- [ ] `curl http://localhost/robots.txt` → disallow /admin
- [ ] `curl http://localhost/sitemap.xml` → tiene URLs
- [ ] Login admin en `http://localhost/admin/login` funciona
- [ ] Subir banner con imagen — persiste en el volumen `./storage`
- [ ] `docker compose down` (sin `-v` para no perder datos) → relevantar → datos siguen

---

## 9. Performance (básico)

Usa DevTools → Lighthouse (modo móvil):

| Página | Performance ≥ | Accessibility ≥ | Best Practices ≥ | SEO ≥ |
|--------|---------------|-----------------|------------------|-------|
| `/` | 85 | 90 | 90 | 95 |
| `/proyectos` | 80 | 90 | 90 | 95 |
| `/proyectos/[slug]` | 85 | 90 | 90 | 95 |

- [ ] Todos los pages arriba pasan el mínimo

### Otros checks de perf:
- [ ] Imágenes en `/proyectos` se cargan en formato AVIF o WebP (DevTools → Network)
- [ ] Home carga en < 2s en red 4G simulada
- [ ] Bundle size razonable (vibecheck — no payload gigantes)

---

## 10. Migraciones y datos

- [ ] `npx prisma migrate status` → **Database schema is up to date**
- [ ] Hacer seed 2 veces seguidas → sin errores (idempotente)
- [ ] Crear banner → reiniciar postgres container → datos persisten
- [ ] Crear imagen banner → `docker compose down` + `up` → imagen sigue visible (volumen `./storage`)

---

## 11. Content audit final

Cosas NO TÉCNICAS que solo TÚ sabes:

- [ ] Textos en ES están correctos y en tono profesional
- [ ] Datos de contacto reales: teléfono, WhatsApp, email
- [ ] Ubicación de la empresa (Arequipa · Lima · Cusco?) es la correcta
- [ ] Redes sociales en footer apuntan a tus cuentas reales
- [ ] Logo final es el que quieres publicar
- [ ] Banners seed eliminados y reemplazados por banners reales
- [ ] Proyectos seed eliminados y reemplazados por proyectos reales
- [ ] Admin email y password son los tuyos (no `admin@example.com`)
- [ ] Google Analytics / Facebook Pixel / etc. — decidir si se implementa

---

## Criterios de aceptación

- **Release candidate**: TODAS las casillas de las secciones 0–8 deben estar marcadas
- **Go-live**: además las 9–11 deben estar resueltas
- **Si un ❌ crítico aparece**: se detiene el go-live, se corrige, y se re-corre la sección afectada completa

---

## Formato de reporte

Cuando termines una pasada completa, llena esto:

```
Fecha: ____________
Tester: ____________
Entorno: dev local / prod docker
Commit SHA: __________

Secciones ejecutadas:
- 0 Pre-req: ✅ / ❌
- 1 Público: ✅ / ❌ (N issues)
- 2 Admin: ✅ / ❌
- 3 i18n: ✅ / ❌
- 4 Responsive: ✅ / ❌
- 5 Browsers: ✅ / ❌
- 6 Seguridad: ✅ / ❌
- 7 Tests auto: ✅ / ❌
- 8 Docker prod: ✅ / ❌
- 9 Performance: ✅ / ❌
- 10 Migraciones: ✅ / ❌
- 11 Content: ✅ / ❌

Issues encontrados (con link o descripción):
1. …
2. …

Veredicto: APROBADO / BLOQUEADO
```
