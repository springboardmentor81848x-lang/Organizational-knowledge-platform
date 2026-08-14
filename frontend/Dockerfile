# ============================================
# Stage 1: Build React app with Vite
# ============================================
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency manifests first for layer caching
COPY package*.json ./
RUN npm ci --prefer-offline

# Copy source code and build
COPY . .
RUN npm run build

# ============================================
# Stage 2: Serve with Nginx
# ============================================
FROM nginx:alpine

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config with API proxy rules
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
