FROM node:22-slim

# 1. Install Git and build essentials
# Scramjet and its WASM rewriters often need git to pull dependencies 
# or specific build tools to compile the WASM modules.
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# 2. Copy dependency files
COPY package.json pnpm-lock.yaml* ./

# 3. Install ALL dependencies (including devDeps for building)
RUN pnpm install

# 4. Copy the rest of the source code
COPY . .

# 5. CRITICAL: Run the build script
# This is likely what generates the missing '../../../rewriter/wasm/out/wasm.js'
RUN pnpm run build

# Scramjet usually listens on 8080 or 1337 
# (Your logs showed the app listening on 1337, so I've updated this)
EXPOSE 1337

# 6. Use a production start command if available
CMD ["pnpm", "start"]
