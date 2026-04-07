FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* turbo.json tsconfig.json ./

# Copy package sources
COPY packages/common/package.json packages/common/
COPY packages/database/package.json packages/database/
COPY packages/blob-storage/package.json packages/blob-storage/
COPY packages/ai/package.json packages/ai/
COPY packages/ingestion/package.json packages/ingestion/
COPY packages/events/package.json packages/events/
COPY services/ingestion-worker/package.json services/ingestion-worker/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy all source
COPY packages/ packages/
COPY services/ingestion-worker/ services/ingestion-worker/

# Build worker
WORKDIR /app/services/ingestion-worker
RUN pnpm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

COPY --from=base /app/services/ingestion-worker/dist ./dist
COPY --from=base /app/services/ingestion-worker/package.json ./package.json
COPY --from=base /app/node_modules/.pnpm/pdfjs-dist@*/node_modules/pdfjs-dist ./node_modules/pdfjs-dist


EXPOSE 4000

CMD ["node", "dist/server.js"]
