FROM oven/bun:1 AS base
WORKDIR /app

# Stage 1: Prune the monorepo to just the server dependencies
FROM base AS builder
# Check https://turbo.build/repo/docs/handbook/deploying-with-docker
ARG TURBO_TEAM
ARG TURBO_TOKEN

COPY . .
RUN bun install -g turbo
# Prune to just the 'server' workspace
RUN turbo prune --scope=server --scope=client --docker

# Stage 2: Install dependencies
FROM base AS installer
WORKDIR /app

# Copy pruned lockfiles/packages configuration
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/out/bun.lock ./bun.lock

# Install dependencies with cache mount to speed up subsequent builds
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# Copy full source from the pruned output
COPY --from=builder /app/out/full/ .

# Generate Prisma Client
WORKDIR /app/server
RUN bunx prisma generate
WORKDIR /app

# Build the project (invokes tsc via turbo)
RUN bun run build

# Stage 3: Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy installed node_modules (including workspace symlinks)
COPY --from=installer /app/node_modules ./node_modules

# Copy workspace packages (needed because of symlinks in node_modules)
COPY --from=installer /app/server ./server
COPY --from=installer /app/shared ./shared
COPY --from=installer /app/package.json ./package.json
COPY --from=installer /app/tsconfig.json ./tsconfig.json

USER bun
EXPOSE 3000

# Start the server using the built Javascript
CMD ["bun", "run", "server/src/index.ts"]
