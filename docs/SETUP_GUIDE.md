# KnowledgeIQ Setup & Execution Guide

This guide walks you through setting up and running the full-stack KnowledgeIQ platform locally.

---

## 1. Prerequisites
- **Java**: JDK 17 or higher (`java -version`)
- **Node.js**: Node.js v18 or higher & npm (`node -v`, `npm -v`)
- **Database**: PostgreSQL (or use the pre-configured cloud database in `backend/src/main/resources/application.properties`)

---

## 2. Running the Backend (Spring Boot)

1. Open PowerShell or Terminal in the `backend/` directory:
   ```bash
   cd backend
   ```
2. Set Java 17 environment variable (Windows):
   ```powershell
   $env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
   ```
3. Run the application via Maven Wrapper:
   ```powershell
   ./mvnw.cmd spring-boot:run
   ```
4. The Spring Boot backend starts at: **`http://localhost:8080`**

---

## 3. Running the Frontend (React + Vite)

1. Open PowerShell or Terminal in the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. The frontend web application is available at: **`http://localhost:5173`**

---

## 4. Default Demo Accounts

You can test each of the 6 roles using the one-click demo access buttons on the login screen or using these credentials (password: `password123`):

| Persona | Email | Role Description |
| :--- | :--- | :--- |
| **Employee** | `employee@northwind.io` | Individual contributor tracking skill growth & AI paths |
| **Manager / Team Lead** | `manager@northwind.io` | Department manager with domain team clustering & heatmap |
| **HR Specialist** | `hr@northwind.io` | Workforce directory, org skill matrix & strategic forecast |
| **Department Head** | `depthead@northwind.io` | Department governance, benchmark rules & budget allocation |
| **L&D Administrator** | `ldadmin@northwind.io` | Course catalog, learning paths & cert verification queue |
| **System Administrator** | `admin@northwind.io` | User directory, RBAC governance & competency master catalog |

---

## 5. Automated Verification

To run the automated 6-role end-to-end integration test:
```bash
node scripts/verify_live_system.js
```
