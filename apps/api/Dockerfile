# syntax=docker/dockerfile:1
FROM node:20-slim AS builder
WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm ci

# Gera Prisma Client
COPY prisma ./prisma
RUN npx prisma generate

# Build TypeScript
COPY tsconfig.json ./tsconfig.json
COPY src ./src
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copia artefatos necessários
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
COPY package*.json ./
COPY docker-start.sh ./docker-start.sh

RUN chmod +x docker-start.sh
EXPOSE 4000

CMD ["./docker-start.sh"]
