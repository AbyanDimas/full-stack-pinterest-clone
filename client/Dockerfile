# Stage 1: Build the React Application
FROM node:22-slim AS builder

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Accept build arguments for environment variables
ARG VITE_API_ENDPOINT
ARG VITE_IMGPROXY_URL
ARG VITE_MINIO_BUCKET

# Set them as environment variables so Vite can bake them in during build
ENV VITE_API_ENDPOINT=$VITE_API_ENDPOINT
ENV VITE_IMGPROXY_URL=$VITE_IMGPROXY_URL
ENV VITE_MINIO_BUCKET=$VITE_MINIO_BUCKET

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
