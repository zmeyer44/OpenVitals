FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* turbo.json tsconfig.json ./

# Copy all package.json files for dependency resolution
COPY apps/web/package.json apps/web/
COPY packages/common/package.json packages/common/
COPY packages/database/package.json packages/database/
COPY packages/blob-storage/package.json packages/blob-storage/
COPY packages/ai/package.json packages/ai/
COPY packages/ingestion/package.json packages/ingestion/
COPY packages/events/package.json packages/events/
COPY packages/sharing/package.json packages/sharing/

# Install dependencies (shamefully-hoist for Next.js bundler compatibility)
RUN echo "shamefully-hoist=true" > .npmrc && pnpm install --frozen-lockfile

# Copy all source
COPY packages/ packages/
COPY apps/web/ apps/web/

# Copy root .env.example as build-time .env (real values come at runtime)
COPY .env.example .env

# Build the Next.js app via turbo (resolves workspace deps correctly)
RUN pnpm turbo build --filter=@openvitals/web

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Create blob directory with correct ownership
RUN mkdir -p /data/blobs && chown nextjs:nodejs /data/blobs

# Copy standalone output
COPY --from=base /app/apps/web/.next/standalone ./
COPY --from=base /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=base /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
