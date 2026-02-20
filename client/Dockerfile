FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS builder
WORKDIR /app
RUN bun install -g turbo
COPY . .
RUN turbo prune --scope=client --docker

FROM base AS installer
WORKDIR /app

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/bun.lock ./bun.lock
COPY --from=builder /app/tsconfig.json ./tsconfig.json

RUN bun install --frozen-lockfile

COPY --from=builder /app/out/full/ .

ARG VITE_SERVER_URL=http://localhost:3000
ENV VITE_SERVER_URL=$VITE_SERVER_URL

# Generate Prisma Client (Required for server workspace build)
WORKDIR /app/server
RUN bunx prisma generate
WORKDIR /app

RUN bun run build

EXPOSE 5173
CMD ["bunx", "serve", "-s", "client/dist", "-p", "5173"]