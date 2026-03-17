FROM node:22-slim

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy only the package files first to save time on builds
COPY package.json pnpm-lock.yaml* ./

# Install dependencies inside the container
RUN pnpm install

# Copy the rest of your files
COPY . .

# Scramjet usually listens on 8080
EXPOSE 8080

CMD ["pnpm", "start"]
