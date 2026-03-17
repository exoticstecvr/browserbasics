FROM node:22-slim

# 1. Install the "Missing" build tools
# Scramjet needs these to compile its internal rewriters
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 2. Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# 3. Copy files (Scramjet needs the lockfile for a stable install)
COPY package.json pnpm-lock.yaml* ./

# 4. Install dependencies
# If it still fails, we use --no-frozen-lockfile to force it
RUN pnpm install

# 5. Copy the rest of your code
COPY . .

# 6. Generate the WASM files (This is what Splash does)
RUN pnpm run build

EXPOSE 1337

CMD ["pnpm", "start"]
