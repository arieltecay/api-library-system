# API Dockerfile
# Multi-stage build para producción optimizada
# Uso: docker build -t librarysystem-api . && docker run -p 3000:3000 --env-file .env librarysystem-api

# ============================================
# Stage 1: Builder
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias de build
RUN apk add --no-cache python3 make g++

# Copiar package files
COPY package*.json ./

# Instalar todas las dependencias (incluye devDependencies para build)
RUN npm ci

# Copiar código fuente
COPY . .

# Build TypeScript
RUN npm run build

# ============================================
# Stage 2: Production dependencies only
# ============================================
FROM node:20-alpine AS prod-deps

WORKDIR /app

COPY package*.json ./

# Solo dependencias de producción
RUN npm ci --omit=dev

# ============================================
# Stage 3: Runtime
# ============================================
FROM node:20-alpine AS runtime

WORKDIR /app

# Usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copiar dependencias de producción
COPY --from=prod-deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiar build output
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Copiar package.json para metadatos
COPY --chown=nodejs:nodejs package.json ./

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Iniciar servidor
CMD ["node", "dist/server.js"]