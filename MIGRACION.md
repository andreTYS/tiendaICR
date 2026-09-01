# Migración desde el VPS anterior

Este repositorio parte de un volcado del VPS antiguo
(`inversionesicr_full_20260901_123742.zip`). Aquí queda anotado qué se importó,
qué se dejó fuera y por qué, para que nadie lo tenga que deducir más adelante.

## Qué se importó

| Origen en el zip | Destino en el repo |
|---|---|
| `root/InversionesICR/` | raíz del repositorio |
| `root/InversionesICR/storage/uploads/` | `storage/uploads/` |
| `etc/nginx/sites-available/inversionesicr` | `deploy/nginx/inversionesicr.conf` |
| `root/InversionesICR/docker-compose.override.yml` | `deploy/docker-compose.override.vps.yml` |

Los uploads se versionan a propósito, saltándose la regla `/storage/` del
`.gitignore` original: son la única copia que queda de las imágenes reales de
los proyectos, y el VPS de origen ya no está. Los uploads nuevos que generes en
desarrollo local **no** se versionan.

## Qué se dejó fuera, y por qué

- **`.env` y `.env.local`** — llevaban credenciales reales de producción.
  Considéralas comprometidas: viajaron en un zip subido a un repositorio
  público. Hay que rotarlas todas (ver más abajo).
- **`backups/*.dump` y `backups/*.sql`** — el volcado de la base de datos
  incluye `User.passwordHash`, mensajes de contacto con datos personales y
  `VictronConfig.encryptedToken`. No va en el repositorio. Guárdalo en un
  gestor de secretos o en almacenamiento cifrado.

El `.gitignore` ya bloquea los tres casos, así que no se pueden colar por
descuido más adelante.

## Rotación de credenciales pendiente

El zip con el `.env` de producción estuvo publicado en un repositorio público.
Todo lo que había dentro se da por filtrado:

- [ ] `POSTGRES_PASSWORD` (y el `DATABASE_URL` que la contiene)
- [ ] `AUTH_SECRET`
- [ ] Contraseña del usuario administrador y de los usuarios cliente
- [ ] Token de la API de Victron VRM, desde el panel de VRM

Al rotar `AUTH_SECRET` hay una consecuencia encadenada: `src/shared/lib/crypto.ts`
deriva por HKDF la clave AES del token de Victron a partir de `AUTH_SECRET`. En
cuanto lo cambies, el `encryptedToken` guardado en la base de datos deja de
descifrarse y hay que volver a introducir el token desde el panel de
administración. Es el comportamiento buscado, no un fallo.

## Restaurar el volcado en local

El dump no está en el repositorio. Si lo conservas aparte, con la base de datos
de desarrollo levantada:

```bash
docker compose -f docker-compose.dev.yml up -d

# formato custom (.dump)
docker exec -i inversiones-icr-dev-postgres-1 \
  pg_restore -U icr -d icr --clean --if-exists < db_20260901_123742.dump

# o formato texto (.sql)
docker exec -i inversiones-icr-dev-postgres-1 psql -U icr -d icr < db_20260901_123742.sql
```

Comprueba el nombre real del contenedor con `docker compose -f docker-compose.dev.yml ps`.

Restaurar el volcado trae también los usuarios de producción con sus hashes. Si
lo haces, cambia esas contraseñas en local o quédate con `npm run seed`, que
crea un admin limpio a partir de `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.

## Al volver a desplegar

El nginx del VPS anterior (`deploy/nginx/inversionesicr.conf`) servía cuatro
subdominios: la landing en `:3001`, `app.` en `:8080`, `api.` en `:3000` y
`factura.` en `:8000`. O sea que aquella máquina alojaba varias aplicaciones,
no solo esta.

Eso choca con `docker-compose.yml`, que levanta su **propio Caddy** ocupando los
puertos 80 y 443. Los dos no pueden convivir. Si el destino es un servidor donde
nginx ya escucha en 443, desactiva el servicio `caddy` y deja que nginx haga de
proxy inverso hacia `app`:

```bash
docker compose up -d --build postgres app   # sin caddy
```

`deploy/docker-compose.override.vps.yml` es el override que usaba el VPS: publica
la aplicación en `127.0.0.1:3001` y pone `caddy` tras un perfil para que no
arranque por defecto. Coincide con el `proxy_pass` de la landing en el nginx.
