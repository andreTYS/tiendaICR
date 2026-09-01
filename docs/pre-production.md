# Pre-Production Runbook — Inversiones ICR

Pasos exactos a ejecutar ANTES y DURANTE el primer deploy al VPS. Se ejecuta UNA vez. Las secciones están en orden — no saltes pasos.

---

## 0. Requisitos previos

- [ ] VPS comprado, con SSH accesible
- [ ] Dominio apuntando al VPS (A record → IP del VPS)
- [ ] Docker + Docker Compose instalados en el VPS
  ```bash
  # En el VPS
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER
  ```
- [ ] `docs/qa-checklist.md` ejecutado completo en dev local con ✅

---

## 1. Preparar el código local

```bash
cd "/Users/soulkin/Downloads/InversionesICR (1)/web"

# Estado limpio
git status          # debe estar clean
git log --oneline | head -3   # mira el commit SHA a desplegar

# Tests verdes
npm test -- --run
```

- [ ] Working tree limpio
- [ ] Tests 154+ verdes
- [ ] Anota el SHA: ______________

---

## 2. Rotar secretos de producción

**NUNCA reuses los secretos de dev en producción.**

Genera localmente los que faltan y NO los commitees:

```bash
# AUTH_SECRET (JWT signing key)
openssl rand -base64 32
# → copia el output

# SEED_ADMIN_PASSWORD (tu password real de admin)
# → elige uno fuerte, mínimo 16 chars. Guárdalo en un password manager.
```

Crea un archivo LOCAL `prod.env` (NO commit, NO subir a git) con:

```dotenv
# prod.env — NO SUBIR A GIT
DATABASE_URL=postgresql://icr:__PASSWORD_FUERTE_POSTGRES__@postgres:5432/icr
POSTGRES_DB=icr
POSTGRES_USER=icr
POSTGRES_PASSWORD=__PASSWORD_FUERTE_POSTGRES__

AUTH_SECRET=__AUTH_SECRET_GENERADO_ARRIBA__
AUTH_URL=https://__TU_DOMINIO__
NEXT_PUBLIC_SITE_URL=https://__TU_DOMINIO__
PUBLIC_HOST=__TU_DOMINIO__

SEED_ADMIN_EMAIL=__TU_EMAIL_REAL__
SEED_ADMIN_PASSWORD=__TU_PASSWORD_FUERTE__

# Contact form — opcional, si tienes SMTP:
CONTACT_EMAIL_ENABLED=false
# Cuando tengas SMTP real:
# CONTACT_EMAIL_ENABLED=true
# SMTP_HOST=smtp.tuservicio.com
# SMTP_PORT=587
# SMTP_USER=user
# SMTP_PASS=pass
# SMTP_FROM=no-reply@tu-dominio.com

STORAGE_ROOT=/app/storage/uploads
NODE_ENV=production
```

- [ ] `prod.env` creado con secretos ÚNICOS de producción
- [ ] `prod.env` NO está en el repo (`.gitignore` lo excluye por `*.env` o similar)
- [ ] Los secretos guardados en un password manager (Bitwarden, 1Password, etc.)

---

## 3. Nginx + TLS (Let's Encrypt)

El `nginx/nginx.conf` por defecto sirve HTTP en puerto 80. Para producción necesitas HTTPS.

Opción recomendada: **Caddy** como reverse proxy (autogestiona TLS):

1. Instala Caddy en el VPS en lugar de usar el nginx de docker-compose
2. O ajusta `docker-compose.yml` para añadir un `caddy` service:
   ```yaml
   caddy:
     image: caddy:2-alpine
     ports:
       - "80:80"
       - "443:443"
     volumes:
       - ./Caddyfile:/etc/caddy/Caddyfile
       - caddy_data:/data
       - caddy_config:/config
     depends_on:
       - app
   ```
   Y un `Caddyfile`:
   ```caddyfile
   tu-dominio.com {
     encode gzip
     reverse_proxy app:3000
   }
   ```

Alternativamente, si quieres seguir con nginx: genera TLS con `certbot` en el host y monta los certs en el container de nginx.

- [ ] TLS configurado (HTTPS responde)
- [ ] HTTP redirige a HTTPS
- [ ] Dominio resuelve correctamente

---

## 4. Subir código al VPS

Opciones:
- **A) Git pull en el VPS**: `git clone` + `git pull` cuando haya updates
- **B) Docker registry**: build local → push → pull en VPS
- **C) rsync** del código directamente

Recomendación para una sola app: **opción A** (más simple).

```bash
# En el VPS
cd ~
git clone <tu-repo> inversiones-icr
cd inversiones-icr/web   # ajusta al path correcto

# Copia prod.env del local al VPS como .env
# scp prod.env vps:/home/user/inversiones-icr/web/.env

# Build y arranque
docker compose build app
docker compose up -d
```

- [ ] Contenedores arriba: `docker compose ps` → app, postgres, (nginx o caddy) running
- [ ] `docker compose logs app` → sin errores, "Ready in XXms"

---

## 5. Migraciones y seed

```bash
# Primera migración (se aplica automáticamente si configuraste entrypoint, si no:)
docker compose exec app npx prisma migrate deploy

# Seed inicial (crea el admin de producción)
docker compose exec app npx tsx scripts/seed.ts
# → "✅ Admin created with id: ..."
```

⚠️ **CRÍTICO**: el seed también crea banners y proyectos sample si `NODE_ENV !== production`. En prod no los creará (el seed los salta), pero verifica después:

```bash
docker compose exec app npx tsx -e "
import { prisma } from './src/shared/lib/prisma';
const banners = await prisma.banner.count();
const projects = await prisma.project.count();
console.log({ banners, projects });
await prisma.\$disconnect();
"
```

Esperado: `{ banners: 0, projects: 0 }` — empiezas con un admin y nada más. Tú llenas el contenido desde la intranet.

- [ ] Migraciones aplicadas
- [ ] Admin creado
- [ ] 0 banners, 0 proyectos (vacío para que llenes con contenido real)

---

## 6. Smoke test inicial en prod

Desde tu máquina o desde el VPS:

```bash
curl -k https://tu-dominio.com/api/health
# → {"status":"ok","db":"up","storage":"up",...}

curl -kI https://tu-dominio.com/
# → HTTP/2 200

curl -k https://tu-dominio.com/robots.txt
# → debe incluir "Disallow: /admin"
```

- [ ] Health OK
- [ ] Home responde 200
- [ ] Robots.txt correcto

---

## 7. Contenido inicial

Con la intranet ya funcionando, sube el contenido real desde `/admin`:

- [ ] Login como admin (password nuevo de prod)
- [ ] Crea las 6-7 **categorías** reales (las que tienes en mente)
- [ ] Sube al menos **3 proyectos reales** con foto real + descripción
- [ ] Configura **hero display mode** según tu preferencia (recomiendo `animation-only` si no tienes banners)
- [ ] Opcional: crea 1–3 banners destacados

- [ ] Contenido inicial listo

---

## 8. Backups — configurar ANTES de abrir al público

En el VPS, como cron:

```bash
# crontab -e
0 3 * * * docker compose -f ~/inversiones-icr/web/docker-compose.yml exec -T postgres pg_dump -U icr icr > ~/backups/db-$(date +\%F).sql
0 3 * * * tar czf ~/backups/storage-$(date +\%F).tar.gz ~/inversiones-icr/web/storage

# Rotar — borrar backups > 30 días
0 4 * * * find ~/backups -name "*.sql" -mtime +30 -delete
0 4 * * * find ~/backups -name "*.tar.gz" -mtime +30 -delete

# Copiar a storage remoto (ajusta a tu proveedor)
# 0 5 * * * rsync -a ~/backups/ usuario@backup-server:/backups/inversiones-icr/
```

- [ ] Cron de backup DB configurado
- [ ] Cron de backup storage (uploads) configurado
- [ ] Rotación configurada
- [ ] Test manual: `docker compose exec -T postgres pg_dump -U icr icr | head`

---

## 9. Observabilidad mínima

Mientras el sitio es pequeño puedes vivir con:

- [ ] `docker compose logs -f app` (manual)
- [ ] Health endpoint monitoreado externamente (UptimeRobot gratis, ping cada 5 min)
- [ ] Email de alerta si el health falla (UptimeRobot soporta esto)

Más adelante: Sentry / Plausible / Umami. No es bloqueante.

- [ ] Monitoreo externo del health configurado

---

## 10. DNS y SEO post-launch

- [ ] En Google Search Console, añadir propiedad del dominio
- [ ] Subir sitemap.xml: `https://tu-dominio.com/sitemap.xml`
- [ ] Pedir indexación de las páginas principales
- [ ] Crear cuenta de Google Analytics / Plausible (si aplica) e integrar
- [ ] Imagen OG probada con [OpenGraph Debugger](https://www.opengraph.xyz/)

---

## 11. Rollback plan

Si algo explota en producción:

```bash
# En el VPS
cd ~/inversiones-icr/web
git log --oneline | head -5
git checkout <SHA-del-commit-anterior-que-funcionaba>
docker compose build app
docker compose up -d
```

Restaurar DB:

```bash
# Dropar la db actual (cuidado!)
docker compose exec postgres psql -U icr -c "DROP DATABASE icr WITH (FORCE);"
docker compose exec postgres psql -U icr -c "CREATE DATABASE icr;"
docker compose exec -T postgres psql -U icr icr < ~/backups/db-YYYY-MM-DD.sql
```

Restaurar storage:

```bash
tar xzf ~/backups/storage-YYYY-MM-DD.tar.gz -C /
```

- [ ] El equipo (tú + tu empleado) conocen cómo hacer rollback
- [ ] Último backup fue hace < 24h

---

## 12. Final check-list de go-live

Antes de anunciar que el sitio está en vivo:

- [ ] HTTPS funciona, certificado válido
- [ ] Todos los pages cargan en prod
- [ ] Admin funciona end-to-end (crear banner con imagen real, ver en home)
- [ ] Formulario de contacto guarda mensajes en DB
- [ ] Health endpoint verde
- [ ] Backups corriendo
- [ ] Uptime monitor activo
- [ ] Email de recuperación admin está en la bandeja que revisas
- [ ] SEO básico (meta, og, sitemap, robots) verificado en producción
- [ ] Te aseguraste de eliminar el admin `admin@example.com` si existe:
  ```bash
  docker compose exec postgres psql -U icr icr -c "DELETE FROM \"User\" WHERE email = 'admin@example.com';"
  ```

**LISTO PARA PUBLICAR** ✅

---

## Post-launch (primeras 24h)

- [ ] Revisar `docker compose logs app` cada 6h
- [ ] Revisar mensajes de contacto diariamente
- [ ] Confirmar que el backup nocturno corrió
- [ ] Medir tiempo de respuesta desde varias ubicaciones
- [ ] Si hay errores 5xx → rollback inmediato + reportar
