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

---

## 💻 Configuration & Setup

The configuration is managed via `src/main/resources/application.yml`.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server HTTP Port | `8080` |
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

A full list with defaults is in [`.env.example`](.env.example).

---

## 🏃 Running Locally

### Prerequisites
- **JDK 17** or higher
- **Maven 3.9+** (or use local Maven installation)
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

### 2. Build the Project
```powershell
mvn clean compile
```

### 3. Run Automated Tests
```powershell
mvn test
```
The suite runs against H2 in memory and an in-process cache (see
`src/test/resources/application.yml`), so **no PostgreSQL or Redis container is needed to run
the tests**.

### 4. Start the Backend Application
```powershell
# Default run (Mock mode enabled, Port 8080)
mvn spring-boot:run

# Or run with a custom port
mvn spring-boot:run "-Dspring-boot.run.arguments=--server.port=8081"
```

### 5. Running with Live AI (Google Gemini / OpenAI)
To enable live AI generation, pass your API key as an environment variable:
```powershell
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

## 🧪 Testing Coverage

The application includes unit tests for core services and controllers:
- `GapAnalysisServiceTest`: Verifies gap calculation logic, missing skills detection, risk severity classification, and summary aggregation.
- `RecommendationServiceTest`: Verifies mock mode, LLM draft parsing, rule-based fallback handling, delete-before-save behavior, and priority sorting.
- `GapAnalysisControllerTest`: Verifies API security and response contracts.

Run all tests:
```powershell
mvn test
```
