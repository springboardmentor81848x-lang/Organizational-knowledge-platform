# KnowledgeIQ — Spring Boot Backend (Render + Supabase Deployment)

This is the Java Spring Boot backend for the KnowledgeIQ Platform, containerized with Docker and configured for Supabase PostgreSQL.

## Docker Build & Run (Local)

```bash
docker build -t knowledgeiq-backend .
docker run -p 8080:8080 \
  -e DB_URL="jdbc:postgresql://db.utdvsjyzybvwhudovgyn.supabase.co:5432/postgres?sslmode=require" \
  -e DB_USERNAME="postgres" \
  -e DB_PASSWORD="<YOUR_SUPABASE_PASSWORD>" \
  -e JWT_SECRET="404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970" \
  knowledgeiq-backend
```

## Render Deployment Guide (Web Service with Docker)

1. Create a Web Service on [Render](https://dashboard.render.com/):
   - **Environment / Runtime**: `Docker`
   - **Dockerfile Path**: `Dockerfile` (or `./Dockerfile`)
   - **Instance Type**: `Free`
2. Configure **Environment Variables** in Render:
   - `DB_URL`: `jdbc:postgresql://db.utdvsjyzybvwhudovgyn.supabase.co:5432/postgres?sslmode=require&connectTimeout=30&socketTimeout=60&tcpKeepAlive=true`
   - `DB_USERNAME`: `postgres`
   - `DB_PASSWORD`: `<YOUR_SUPABASE_PASSWORD>`
   - `JWT_SECRET`: `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970`
   - `ALLOWED_ORIGINS`: `https://*.onrender.com,http://localhost:5173,http://localhost:3000`
   - `GEMINI_API_KEY`: *(Optional, leave empty for rule-engine fallback)*
3. Health check endpoint:
   - Path: `/api/auth/health`
