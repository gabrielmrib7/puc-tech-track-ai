# ==========================================
# Estágio 1: Base com dependências de sistema
# ==========================================
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# ==========================================
# Estágio 2: Instalação de dependências
# ==========================================
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci

# ==========================================
# Estágio 3: Compilação e Build da aplicação
# ==========================================
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Geração dos clientes Prisma para runtime Alpine
RUN npx prisma generate

# Build otimizado standalone
RUN npm run build

# ==========================================
# Estágio 4: Imagem de execução final (Runner)
# ==========================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Criação de usuário sem privilégios (non-root) para segurança OCI
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Cópia dos assets estáticos públicos
COPY --from=builder /app/public ./public

# Configuração de permissões para cache do Next.js
RUN mkdir .next && chown nextjs:nodejs .next

# Cópia do bundle standalone compilado
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Alternância para o usuário sem privilégios
USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
