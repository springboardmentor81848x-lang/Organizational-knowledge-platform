# The web tier: the built SPA, served by nginx, which also proxies /api to the backend.
#
# Serving both from one origin is a deliberate choice rather than a convenience. It means the
# browser never makes a cross-origin request, so CORS does not enter into it at all — and the
# report downloads can read the Content-Disposition filename the API sends, which is exactly
# what a cross-origin setup silently takes away.

# ── Build ───────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /build

# npm ci, not npm install: it installs exactly what package-lock.json pins, so the image is
# built from the same dependency tree the tests ran against.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines import.meta.env at BUILD time, not at run time. These therefore have to be build
# arguments — setting them as container environment variables later does nothing at all, which
# is a failure mode worth knowing about because it looks like the config was simply ignored.
#
# VITE_API_BASE_URL is deliberately empty: nginx proxies /api on this same origin, so the
# frontend calls relative paths. Set it only if the API is genuinely on another host.
ARG VITE_API_BASE_URL=""
ARG VITE_FIREBASE_API_KEY=""
ARG VITE_FIREBASE_AUTH_DOMAIN=""
ARG VITE_FIREBASE_PROJECT_ID=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY \
    VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN \
    VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID

# `npm run build` is `tsc -b && vite build`, so a type error fails the image build rather than
# shipping a broken bundle.
RUN npm run build

# ── Runtime ─────────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

COPY --from=build /build/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# nginx daemonises by default, which would exit PID 1 immediately and stop the container.
CMD ["nginx", "-g", "daemon off;"]
