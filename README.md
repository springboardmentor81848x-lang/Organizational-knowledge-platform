# Organizational Knowledge Gap Intelligence Platform

> An enterprise Spring Boot + PostgreSQL platform designed to detect workforce skill gaps, deliver AI-driven personalized learning paths, and provide real-time competency analytics across an organization.

---

## 🚀 Overview

The **Organizational Knowledge Gap Intelligence Platform** bridges the gap between workforce capabilities and organizational goals. By continuously analyzing employee skill assessments against required role competency benchmarks, the platform identifies missing skills and proficiency deficiencies, automatically triggering tailored AI recommendations and mentorship matches.

---

## ✨ Key Features & Modules

### 1. 🔍 Gap Detection & Competency Analytics Module
- **Automated Gap Calculation**: Evaluates employee skills against required job role competencies ($TargetScore - CurrentScore = GapScore$).
- **Risk & Severity Classification**: Classifies each skill gap into actionable risk tiers (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
- **Target Role Career Planning**: Allows employees to evaluate skill readiness against target future roles or internal promotions without overwriting current baseline metrics.
- **Departmental & Org Metrics**: Aggregates organization-wide readiness percentages, top missing skills, and risk distributions for HR & L&D managers.
- **Automated Alerts**: Automatically triggers alert notifications when critical skill gaps ($\ge 3.0$ gap score) are detected.

### 2. 🤖 AI-Powered Training Recommendation Module
- **Personalized Learning Paths**: Reads stored employee skill gaps and generates tailored, per-skill training recommendations referencing their exact job role, current proficiency, and targeted growth areas.
- **Dual LLM Engine Support**: Seamlessly supports both **Google Gemini** (`gemini-3.6-flash`) and **OpenAI** (`gpt-4o-mini`) APIs.
- **Resilient 3-Tier Architecture**:
  1. **Mock Mode (`llm.mock.enabled=true`)**: Generates realistic, structured mock recommendations locally for fast development without burning API credits.
  2. **Live LLM Integration**: Sends structured prompts to Gemini / OpenAI APIs requesting JSON output with resource type recommendations (`Course`, `Article`, `Practice Project`) and priority rankings.
  3. **Rule-Based Fallback Engine**: If the LLM API is unreachable or rate-limited, the system gracefully falls back to rule-based explanations—ensuring 100% uptime for end-users.
- **Auto-Regeneration**: Automatically purges outdated recommendations and generates fresh ones whenever new gap analyses are computed.

### 3. 🔐 Security & User Management
- **JWT Stateless Authentication**: Secure token-based authentication with BCrypt password hashing.
- **Role-Based Access Control (RBAC)**: Enforces role permissions across `EMPLOYEE`, `MANAGER`, `HR_ADMIN`, and `LND_ADMIN`.

### 4. 🤝 Mentorship & Notifications
- **Mentorship Matching**: Matches employees with high-proficiency internal mentors to close critical skill gaps.
- **Real-Time Notification System**: Notifies users of gap alerts and mentorship request updates.

---

## 🛠️ Technology Stack

| Domain | Technology |
|--------|------------|
| **Backend Framework** | Java 17, Spring Boot 3.3.2 |
| **Security** | Spring Security, JJWT (`0.12.6`), BCrypt |
| **Data & Persistence** | Spring Data JPA, Hibernate ORM |
| **Databases** | PostgreSQL 16 (all runtime profiles), H2 In-Memory (tests only) |
| **Caching** | Redis 7 via Spring Cache (`@Cacheable` / `@CacheEvict`), Lettuce pooled client |
| **AI / LLM Integration** | Google Gemini API (`v1beta`), OpenAI Chat Completions API |
| **Utilities** | Jackson JSON, Lombok, Maven 3.9+ |

---

## 📡 API Reference

### 🔑 Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/api/auth/register` | Register a new user account | Public |
| `POST` | `/api/auth/login` | Authenticate user and return JWT token | Public |
| `GET` | `/api/auth/me` | Fetch profile of currently authenticated user | Authenticated |
| `PUT` | `/api/auth/profile` | Update user profile information | Authenticated |

### 📊 Gap Analysis (`/api/gaps`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/gaps/user/{userId}` | Calculate & return real-time skill gaps for user | Authenticated |
| `GET` | `/api/gaps/user/{userId}/stored` | Fetch previously stored gap analysis records | Authenticated |
| `GET` | `/api/gaps/user/{userId}/summary` | Retrieve overall readiness score & risk distribution | Authenticated |
| `GET` | `/api/gaps/user/{userId}/missing` | Get list of completely missing required skills | Authenticated |
| `GET` | `/api/gaps/user/{userId}/proficiency-gaps` | Get skills where proficiency is below requirement | Authenticated |
| `POST` | `/api/gaps/user/{userId}/compare-target` | Compare user capabilities against a target career role | Authenticated |
| `GET` | `/api/gaps/department/{department}` | Get aggregated department-wide gap metrics | Manager / Admin |
| `GET` | `/api/gaps/org-summary` | Get organization-wide gap intelligence metrics | HR / L&D Admin |

### 💡 AI Recommendations (`/api/recommendations`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/api/recommendations/{employeeId}` | Generate fresh AI recommendations (deletes old set) | Authenticated |
| `GET` | `/api/recommendations/{employeeId}` | Get latest saved recommendations ordered by priority | Authenticated |

### 📄 Reports (`/api/reports`)

Every report is built from live queries at the moment it is requested and streamed back as a
file. Nothing is pre-generated or cached, so a report and the dashboard beside it are two
renderings of the same query and cannot disagree.

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/reports/employee/{id}` | One person's skills, gaps, assessments and training history | Self, their manager, their department head, HR / L&D / Admin |
| `GET` | `/api/reports/department/{department}` | Training reach, completion and skill movement for one department | That department's head, HR / L&D / Admin |
| `GET` | `/api/reports/training-effectiveness` | Organization-wide skill gap and training effectiveness | HR / L&D / Admin |

Each of the three takes a `format` query parameter: `pdf` (the default) or `excel`, with `xlsx`
and `xls` accepted as spellings of `excel`. Anything else is rejected with a `400` rather than
quietly falling back, so a typo cannot hand back a PDF to a caller expecting a spreadsheet.

The scope column is not advisory. Each report is built on the same analytics service as the
matching dashboard, so a caller can never download more than the screen would already show
them, and a request outside that scope answers `403`. The Reports page offers a role only the
reports that role can actually run, for the same reason — a button that can only produce a `403`
reads as a broken download rather than as a report that was never yours to run.

**Filenames.** The server chooses the name and sends it in `Content-Disposition`, in RFC 6266
form: quoted, with the UTF-8 `filename*` parameter alongside so a department name outside ASCII
survives the trip. That header is *not* CORS-safelisted — see `CORS_ALLOWED_ORIGINS` below.

### 📑 HR Report Downloads (`/api/hr/reports`)

The HR-scoped downloads, in the same two formats via the same `format` parameter.

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/hr/reports/skill-gap-summary` | Gap counts by skill and risk band; optional `?department=` filter | HR / Admin |
| `GET` | `/api/hr/reports/training-effectiveness` | Per-course enrolment, completion and measured skill movement | HR / Admin |
| `GET` | `/api/hr/reports/workforce-planning` | Skill inventory: headcount and average proficiency per skill | HR / Admin |

Figures the platform has not measured yet — a course nobody has completed and been reassessed
on, a skill with no gap analysis run against it — render as a dash in the PDF and as an empty
cell in the spreadsheet. Neither is written as a zero, which would read as "no improvement"
rather than "not measured".

---

## 💻 Configuration & Setup

The configuration is managed via `src/main/resources/application.yml`.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server HTTP Port. The Vite dev proxy targets this | `8081` |
| `JWT_SECRET` | 32+ character JWT secret key | `change-me-to-a-secure-secret` |
| `OPENAI_API_KEY` | API Key for Google Gemini or OpenAI | *(Empty)* |
| `OPENAI_MODEL` | AI Model Name | `gemini-3.6-flash` |
| `OPENAI_BASE_URL` | LLM API Endpoint URL | `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions` |
| `LLM_MOCK_ENABLED` | Toggle mock mode vs live LLM calls | `true` |
| `DB_URL` | PostgreSQL connection URL | `jdbc:postgresql://localhost:5432/org_skills` |
| `DB_USERNAME` / `DB_PASSWORD` | PostgreSQL credentials | `postgres` / `postgres` |
| `DDL_AUTO` | Hibernate schema handling. Use `validate` once migrations own the schema | `update` |
| `REDIS_HOST` / `REDIS_PORT` | Redis connection | `localhost` / `6379` |
| `CACHE_TYPE` | `redis`, `simple` (in-process, no Redis needed) or `none` | `redis` |
| `CACHE_TTL_CATALOG_MINUTES` | TTL for the skill and competency catalogues | `60` |
| `CACHE_TTL_ANALYTICS_MINUTES` | TTL for the heatmap and coverage matrices | `10` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated exact origins the browser may call the API from | `http://localhost:3000,http://localhost:5173,http://localhost:5174` |

A full list with defaults is in [`Backend/.env.example`](Backend/.env.example).

> **Deploying the frontend on a different origin from the API?** `CORS_ALLOWED_ORIGINS` must name
> that origin exactly — a wildcard will not do, because the API allows credentials and browsers
> refuse to combine the two. Development does not exercise this: the Vite dev server proxies
> `/api` to the backend, which keeps the browser same-origin, so CORS problems only appear once
> `VITE_API_BASE_URL` points the frontend straight at the API.
>
> The API also has to expose `Content-Disposition`, which it now does. A cross-origin response
> hands JavaScript only the CORS-safelisted headers unless the server names the others, and that
> one is not on the list — so the report downloads could not read the filename the server had
> chosen and saved every report under the bare name `download`, with no `.pdf` or `.xlsx`
> extension for the operating system to open it by.

---

## 📁 Project Structure

```text
org-skills-intelligence-platform/
├── Backend/                 # Spring Boot Backend (Java 17, Maven)
│   ├── src/                 # Java source code and resources
│   ├── pom.xml              # Maven dependencies and build configuration
│   ├── Dockerfile           # Multi-stage build: Maven -> JRE 17 runtime
│   ├── .dockerignore        # Keeps secrets and target/ out of the build context
│   ├── schema.sql           # Database schema definition
│   ├── postman_collection.json # API Postman collection
│   ├── run-backend.ps1      # PowerShell helper script to run backend
│   └── .env.example         # Backend environment template
├── Frontend/                # Vite + React Frontend
│   ├── src/                 # React components, pages, hooks, services
│   ├── package.json         # NPM package dependencies and scripts
│   ├── Dockerfile           # Multi-stage build: Node -> nginx
│   ├── nginx.conf           # SPA history fallback, /api proxy, health proxy
│   ├── .dockerignore        # Keeps node_modules and .env out of the context
│   └── .env.example         # Frontend environment template
├── docker-compose.yml       # Local PostgreSQL & Redis services (development)
├── docker-compose.prod.yml  # Full stack: postgres + redis + api + web
├── .env.prod.example        # Production environment template
├── run-backend.ps1          # Root launcher for the backend
└── README.md
```

---

## 🏃 Running Locally

### Prerequisites
- **JDK 17** or higher
- **Maven 3.9+** (or use local Maven installation)
- **Node.js 18+** & **npm** (for Frontend)
- **PostgreSQL 16** and **Redis 7** - the `docker compose` step below provides both

### 1. Start PostgreSQL and Redis
```powershell
docker compose up -d
```
This brings up both services on their default ports with the credentials the application
already expects, so no environment variables are needed. Hibernate creates the schema on first
start and `DataSeeder` populates the reference data.

To check they are up:
```powershell
docker compose ps
docker compose logs -f postgres redis
```

**If port 5432 is already in use** - a locally installed PostgreSQL service, or another
project's container, is the usual cause - start the container on another port and point the
application at it:
```powershell
$env:DB_PORT="5433"
docker compose up -d
$env:DB_URL="jdbc:postgresql://localhost:5433/org_skills"
```

> **`.env` is read by Docker Compose, not by the application.** Compose picks it up
> automatically; Spring Boot does not, and there is no dotenv library on the classpath. So a
> `DB_PORT=5433` in `.env` moves the *container* to 5433 while the application still connects to
> `localhost:5432` - and if something else is listening there, it connects to that instead and
> starts perfectly against the wrong database. Nothing fails; the data is just not where you
> expect. Export the variables into the shell before running:
>
> ```powershell
> # PowerShell
> Get-Content .env | Where-Object { $_ -match '^\s*[^#].*=' } | ForEach-Object {
>   $name, $value = $_ -split '=', 2
>   [Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim())
> }
> ```
> ```bash
> # bash
> set -a && . ./.env && set +a
> ```
>
> Check which database you actually reached before trusting a run:
> `docker compose exec postgres psql -U postgres -d org_skills -c "\dt"`

Running without Docker is also fine - point `DB_URL`, `DB_USERNAME` and `DB_PASSWORD` at any
PostgreSQL instance. If you have no Redis to hand, set `CACHE_TYPE=simple` and the application
uses an in-process cache instead; every cached endpoint behaves the same, the cache is just not
shared between instances.

### 2. Build the Backend
```powershell
cd Backend
mvn clean compile
```

### 3. Run Automated Tests
```powershell
cd Backend
mvn test
```
The suite runs against H2 in memory and an in-process cache (see
`Backend/src/test/resources/application.yml`), so **no PostgreSQL or Redis container is needed to run
the tests**.

### 4. Start the Backend Application
You can run directly from root using the launcher script:
```powershell
.\run-backend.ps1
```
Or run from inside the `Backend/` directory:
```powershell
cd Backend

# Default run (Mock mode enabled, Port 8081)
mvn spring-boot:run

# Or run with a custom port
mvn spring-boot:run "-Dspring-boot.run.arguments=--server.port=8081"
```

### 5. Running with Live AI (Google Gemini / OpenAI)
To enable live AI generation, pass your API key as an environment variable:
```powershell
cd Backend
$env:OPENAI_API_KEY="your-gemini-or-openai-api-key"
$env:LLM_MOCK_ENABLED="false"
mvn spring-boot:run
```

### 6. Inspecting the Database and Cache
```powershell
# PostgreSQL
docker compose exec postgres psql -U postgres -d org_skills -c "\dt"

# Redis - list the cached entries
docker compose exec redis redis-cli KEYS "*"
docker compose exec redis redis-cli TTL "catalogs:skills::all"
```
There is no H2 console any more; H2 exists only on the test classpath.

---

## ⚡ Caching

Redis backs the read-heavy endpoints through Spring's cache abstraction. Two families of cache
are defined in `CacheNames`:

| Cache | Holds | TTL | Invalidated by |
|-------|-------|-----|----------------|
| `catalogs:skills` | The skill catalogue | 60 min | Any skill create / update / delete |
| `catalogs:competencies` | The role competency matrix | 60 min | Any competency create / update / delete |
| `analytics:team_gap_heatmap` | The user x skill gap matrix | 10 min | Any gap recalculation, skill or competency write |
| `analytics:department_coverage` | The department x skill matrix | 10 min | as above |
| `analytics:organization_gap` | Organisation-wide summary metrics | 10 min | as above |

Three design points are worth knowing before changing this:

- **Invalidation is tied to commit, not to the write method.** A plain `@CacheEvict` fires when
  the annotated method returns, which is *before* its transaction commits; a concurrent read in
  that window refills the cache with the very rows the eviction was meant to drop.
  `AnalyticsCacheInvalidator` defers the clear until after commit instead. It hangs off
  `GapAnalysisService.calculateAndFetchUserGaps`, the single point where gap rows are rewritten,
  so the skill, assessment and learning-path flows are all covered by one hook.
- **A Redis outage is not an outage.** `CachingConfig` installs a `CacheErrorHandler` that logs
  and swallows cache failures, so an unreachable Redis degrades the application to uncached
  reads rather than turning healthy requests into 500s.
- **Cached values are serialised as JSON with full type information.** `RedisCacheConfig` uses
  Jackson default typing set to `EVERYTHING`, not the more common `NON_FINAL`, because the
  services return `List.of(...)` and `Stream.toList()` whose classes are final - under
  `NON_FINAL` those are written with no type id and fail on the way back out, which the error
  handler would then hide as a cache that simply never hits.

---

## 🚢 Deployment

The whole platform runs on one machine as four containers: PostgreSQL holds the data, Redis
caches reads, the Spring Boot API serves `/api`, and nginx serves the built frontend and proxies
`/api` to the API.

Serving both tiers from one origin is deliberate. The browser never makes a cross-origin
request, so CORS does not enter into it — which matters because a cross-origin setup silently
hides the `Content-Disposition` header, and with it the filename every report download depends
on.

```text
                        ┌──────────────────────────────┐
   browser ──:80/443──▶ │  web   nginx                 │
                        │    /        → SPA (history   │
                        │                  fallback)   │
                        │    /api/    → api:8081       │
                        │    /actuator/health → api    │
                        └──────────┬───────────────────┘
                                   │  (private network — no published ports)
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
              api  :8081     postgres :5432   redis :6379
                                   │
                                pgdata volume
```

Only the web tier publishes a port. Postgres, Redis and the API are reachable from inside the
Compose network and from nowhere else.

### Prerequisites

Docker Engine 24+ with the Compose plugin. Nothing else — no JDK, no Maven, no Node on the
server; both images build from source inside Docker.

### 1. Put the secrets on the host

The Firebase service-account JSON is mounted read-only at runtime and is never copied into an
image. `.dockerignore` also blocks it from the build context, so it cannot be baked in by
accident — which matters, because a credential in an image layer is in every registry and cache
that image ever reaches.

```bash
sudo mkdir -p /etc/orgskills
sudo cp your-project-firebase-adminsdk-xxxxx.json /etc/orgskills/firebase-service-account.json
sudo chmod 600 /etc/orgskills/firebase-service-account.json
```

### 2. Write the environment file

```bash
cp .env.prod.example .env.prod
```

Then fill in every value marked REQUIRED. `.env.prod` is gitignored and holds every credential
the platform has. At minimum:

| Variable | Notes |
|----------|-------|
| `PUBLIC_ORIGIN` | The origin people will type, scheme included, no trailing slash. Becomes `CORS_ALLOWED_ORIGINS`. |
| `DB_USERNAME` / `DB_PASSWORD` | Postgres is not published outside the network, but this is still the only thing between a container on it and every row. |
| `JWT_SECRET` | 32+ characters, and not the default — every session token is signed with it. `openssl rand -base64 48`. |
| `FIREBASE_KEY_FILE` | Host path from step 1. |
| `VITE_FIREBASE_*` | The three public web values. **Build-time**, see the warning below. |
| `OPENAI_API_KEY` | With `LLM_MOCK_ENABLED=false`. Leave empty and recommendations fall back to rule-based. |
| `MAIL_HOST` etc. | Leave `MAIL_HOST` empty and verification codes are written to the log instead of sent. |

> ⚠️ **`VITE_*` values are build-time, not runtime.** Vite inlines `import.meta.env` into the
> bundle when the image is built. Changing one and restarting the container does nothing at all —
> it looks exactly like the setting being ignored. Rebuild the web image instead:
> `docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build web`.

### 3. Bring it up

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Compose starts them in order: Postgres and Redis first, the API once both report healthy, and
nginx once the API reports healthy. A cold start takes roughly 40–60 seconds, most of it
Hibernate creating the schema, which is why the API healthcheck allows a 90-second grace period
before it starts counting failures.

### 4. Check it

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod ps    # all four healthy
curl -s http://localhost/actuator/health                             # {"status":"UP"}
curl -s -o /dev/null -w '%{http_code}\n' http://localhost/reports    # 200 — SPA deep link
```

That third check matters more than it looks. `/reports` is a client-side route with no file
behind it, so without nginx's history fallback it 404s on a refresh or a pasted link while
working perfectly when reached by clicking — which reads as a routing bug rather than a serving
one.

`/actuator/health` is proxied explicitly for the same class of reason: left to the SPA fallback
it would return `index.html` with a `200`, and an uptime monitor pointed at it would report the
platform healthy forever, including while the API was completely dead.

### 5. TLS

The compose file serves plain HTTP on port 80. Terminate TLS in front of it — Caddy or nginx on
the host with Let's Encrypt, or a cloud load balancer. Set `WEB_PORT` to something like `8080`
so the terminator can own port 80/443, and make `PUBLIC_ORIGIN` the `https://` address.

### Operating it

```bash
# Logs
docker compose -f docker-compose.prod.yml --env-file .env.prod logs -f api

# Deploy a new version
git pull
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# Back up the database (pgdata is a named volume; it survives `down`, not `down -v`)
docker exec org-skills-postgres-prod pg_dump -U "$DB_USERNAME" org_skills | gzip > backup.sql.gz
```

### Known gaps before this is production-grade

Worth being explicit about, since none of these stop it running but all of them will matter:

- **Hibernate owns the schema.** `DDL_AUTO=update` lets a changed entity reshape a live table.
  There is no migration tool in the project yet; adding Flyway or Liquibase and moving to
  `DDL_AUTO=validate` is the single most valuable hardening step.
- **A broken Firebase key does not stop startup.** `FirebaseConfig` logs an error and carries on
  with social sign-in dormant, so a bad key shows up as sign-in quietly not working rather than
  as a failed deploy. Check the logs after the first boot.
- **No CI/CD.** Images are built on the server by `up --build`. A pipeline that builds, runs the
  338 backend and 51 frontend tests, and pushes tagged images to a registry would be the next
  step.
- **Single machine, no replicas.** Fine for a demo or an internal pilot; a restart is downtime.

---

## 🧪 Testing Coverage

**Backend** — 338 tests across services, controllers and full-stack integration:
- `GapAnalysisServiceTest`: Verifies gap calculation logic, missing skills detection, risk severity classification, and summary aggregation.
- `RecommendationServiceTest`: Verifies mock mode, LLM draft parsing, rule-based fallback handling, delete-before-save behavior, and priority sorting.
- `GapAnalysisControllerTest`: Verifies API security and response contracts.
- `ReportRendererTest`: Verifies that a report renders to a document a PDF reader accepts, that each section becomes its own worksheet, and that numbers reach Excel as numbers rather than text.
- `ReportGenerationServiceTest`: Verifies the HR downloads against rows where the optional fields are absent — a skill with no category, a course with no provider, counts not yet measured. Both formats used to fail on that shape, the spreadsheet by throwing and the PDF by printing the word `null` into the document.
- `ReportsIntegrationTest`: Verifies the whole path end to end, parsing the returned bytes with a PDF reader and a workbook reader and checking the figures against the analytics endpoints.

**Frontend** — 51 tests, run with Vitest:
- `api/reports.test.ts`: Verifies the name a downloaded report is saved under — both `Content-Disposition` parameter forms, and the fallback that keeps the file extension when the header does not reach the browser at all.
- `api/team.test.ts`: Verifies that the mentor assignment travels in the request body rather than the query string.
- `app/roleRoutes.test.ts`: Verifies that the sidebar and the URL guard admit the same roles for every route, and that no role is sent home to a page it cannot open. The two lists are maintained by hand and answer the same question, so nothing else makes them drift loudly.

Run all backend tests:
```powershell
cd Backend
mvn test
```

Run the frontend checks:
```powershell
cd Frontend
npm test          # Vitest
npm run lint      # oxlint
npm run build     # type-check and production build
```
