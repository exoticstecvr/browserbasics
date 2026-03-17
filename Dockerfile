# Stage 1: Build
FROM node:22-slim AS builder
RUN apt-get update && apt-get install -y git python3 make g++ && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install
COPY . .
RUN pnpm run build

# Stage 2: Run
FROM node:22-slim
RUN npm install -g pnpm
WORKDIR /app
COPY --from=builder /app .
EXPOSE 1337
CMD ["pnpm", "start"]
