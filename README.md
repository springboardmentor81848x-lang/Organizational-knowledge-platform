# 🧪 OKGIP API — QA Test Suite

![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)
![JSON](https://img.shields.io/badge/JSON-000000?style=for-the-badge&logo=json&logoColor=white)
![License](https://img.shields.io/badge/status-internal--QA-blue?style=for-the-badge)

A Postman-based QA smoke-test suite for the **OKGIP** employee skills & gap-intelligence platform API. It validates the core read endpoints — employees, departments, assessment results, audit logs, and AI chat logs — for availability, response shape, and data integrity.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Endpoints Covered](#️-endpoints-covered)
- [Repository Structure](#-repository-structure)
- [Prerequisites](#️-prerequisites)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Test Assertions](#-test-assertions)
- [Running via CLI (Newman)](#-running-via-cli-newman)
- [Security Notes](#-security-notes)
- [Tech Stack](#️-tech-stack)
- [Contributors](#-contributors)
- [License](#-license)

---

## 📋 Overview

This repository contains automated API test collections built for **Postman (Collection Schema v2.1)**, covering:

- Authentication via **Bearer Token**, configured once at the collection level
- **Status code**, **response time**, and **content-type** assertions on every request
- **Non-empty array / object** validation for each endpoint
- **Field-level** checks (required properties, score ranges, chronological ordering)

Collections are provided in two forms:

| Format | Files | Use case |
| --- | --- | --- |
| **Combined** | `OKGIP-API-QA.postman_collection.json` | Import once, run the full suite via Collection Runner or CI |
| **Split** | `01_...json` – `06_...json` | Import individually to test/debug a single endpoint in isolation |

---

## 🗂️ Endpoints Covered

| # | Method | Endpoint | Description |
| --- | --- | --- | --- |
| 1 | `GET` | `/api/employees` | List all employees |
| 2 | `GET` | `/api/employees/:id` | Fetch a single employee by ID |
| 3 | `GET` | `/api/departments` | List all departments |
| 4 | `GET` | `/api/assessment-results` | List employee skill assessment results |
| 5 | `GET` | `/api/audit-logs` | List system audit trail entries |
| 6 | `GET` | `/api/chat-logs` | List AI assistant chat logs |

---

## 📁 Repository Structure

```
.
├── OKGIP-API-QA.postman_collection.json     # Combined collection (all 6 endpoints)
├── 01_Get_All_Employees.postman_collection.json
├── 02_Get_Employee_By_ID.postman_collection.json
├── 03_Get_All_Departments.postman_collection.json
├── 04_Get_Assessment_Results.postman_collection.json
├── 05_Get_Audit_Logs.postman_collection.json
├── 06_Get_Chat_Logs.postman_collection.json
└── README.md
```

---

## ⚙️ Prerequisites

- [Postman](https://www.postman.com/downloads/) (desktop app or web)
- A running instance of the OKGIP API (local or hosted)
- A valid Bearer authentication token for the API
- (Optional, for CLI/CI runs) [Node.js](https://nodejs.org/) + [Newman](https://github.com/postmanlabs/newman)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/<your-org>/<your-repo>.git
cd <your-repo>
```

### 2. Import into Postman
**File → Import** → select the combined collection or any of the split `.json` files.

### 3. Configure variables
Set these under the collection's **Variables** tab, or create a Postman **Environment** for dev/staging/prod (see [Environment Variables](#-environment-variables)).

### 4. Run
- **Single request:** open a request → **Send** → check the **Test Results** tab.
- **Full suite:** open the collection → **Run** → Collection Runner executes all requests and reports pass/fail.

---

## 🔧 Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `base_url` | Base URL of the OKGIP API | `http://localhost:3000` |
| `token` | Bearer token for authenticated requests | `REPLACE_WITH_BEARER_TOKEN` |
| `employee_id` | Sample employee ID (used by `/employees/:id` only) | `1` |

> 💡 Tip: create separate Postman Environments (`Local`, `Staging`, `Production`) so you can switch `base_url`/`token` without editing the collection.

---

## ✅ Test Assertions

Every request is validated against:

- **Status code** — expects `200 OK`
- **Content-Type** — expects `application/json`
- **Response time** — under `2000ms`
- **Payload shape** — non-empty array (list endpoints) or non-empty object (`/employees/:id`)
- **Required fields** — endpoint-specific checks (e.g. `id`, `first_name`, `score`, `action`, `message`)
- **Business rules** — e.g. assessment `score` between 0–100, audit logs sorted newest-first

---

## 🖥️ Running via CLI (Newman)

```bash
npm install -g newman

newman run OKGIP-API-QA.postman_collection.json \
  --env-var "base_url=http://localhost:3000" \
  --env-var "token=<your-bearer-token>"
```

This is CI-friendly — plug the command into a GitHub Actions workflow to run the suite on every push or pull request.

---

## 🔒 Security Notes

- Bearer tokens are stored as **collection/environment variables** — never commit real tokens to version control.
- Use a `.gitignore`'d Postman environment file for real credentials; keep only placeholder values (`REPLACE_WITH_BEARER_TOKEN`) in committed collections.
- The `chat-logs` endpoint returns raw AI conversation data; review responses manually for PII before sharing test output externally.

---

## 🛠️ Tech Stack

| Layer | Tooling |
| --- | --- |
| API testing | Postman (Collection v2.1), Newman |
| Scripting | JavaScript (`pm.test`, Chai assertions) |
| Auth | Bearer Token |

---

## 👥 Contributors

| Member          | Contribution                            |
| --------------- | ---------------------------------------- |
| **Harishkumar** | Frontend Development & Project Guidance |
| **Girish**      | Backend Development                     |
| **Lokesh**      | UI/UX Wireframes & Design               |

---

## 📄 License

This project is intended for internal QA and development use. Add a license (e.g. MIT) here if the repository is intended for public distribution.
