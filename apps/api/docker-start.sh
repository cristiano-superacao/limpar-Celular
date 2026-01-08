#!/usr/bin/env sh
set -e

# Executa migrações se DATABASE_URL estiver definida
if [ -n "$DATABASE_URL" ]; then
  npx prisma migrate deploy
fi

node dist/index.js
