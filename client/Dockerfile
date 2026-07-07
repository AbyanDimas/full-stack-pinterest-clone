# Stage 1: Build the React Application
FROM node:22-slim AS builder

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# NOTE: Environment variables for Vite (VITE_*) must be available DURING the build step.
# You can pass them as build args or rely on the .env file being copied.
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config for React Router
COPY nginx.conf /etc/nginx/conf.d

# Copy built files from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
