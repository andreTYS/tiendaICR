#!/bin/sh
set -e

# Run pending migrations then start the app
npx prisma migrate deploy

exec node server.js
