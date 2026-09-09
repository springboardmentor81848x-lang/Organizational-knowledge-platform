# ============================================
# Stage 1: Build React App with Node.js
# ============================================
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency specifications
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# ============================================
# Stage 2: Serve with Nginx Alpine
# ============================================
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built frontend assets
COPY --from=build /app/dist .

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
