# Organizational Knowledge Gap Intelligence Platform

## Local PostgreSQL setup for the existing `knowledge_gap_platform` database

This version is adapted to the existing PostgreSQL database structure supplied for the project. It does **not** delete or recreate the existing application tables. On API startup, `frontend/server/schema.sql` applies only additive compatibility changes and creates the missing Milestone-3 tables.

### Database configuration

Create `frontend/.env` using:

```env
PORT=5000
PGUSER=postgres
PGHOST=localhost
PGDATABASE=knowledge_gap_platform
PGPASSWORD=YOUR_POSTGRES_PASSWORD
PGPORT=5432
```

Do not commit `.env` to Git.

### Existing database tables supported

The backend uses the existing tables:

- `users`
- `roles`
- `skills`
- `employee_profile` / `employee_profiles`
- `employee_skills`
- `required_skills`
- `gap_analysis`
- `recommendations`
- `learning_paths`
- `training_courses`
- `training_enrollment`
- `assessments`
- `notifications`

Milestone-3 compatibility tables are added only if absent:

- `assessment_responses`
- `mentors`
- `knowledge_sessions`
- `session_attendees`
- `session_feedback`
- `knowledge_resources`
- `communities`
- `community_members`

### Run backend

```bash
cd frontend
npm install
npm run server
```

Expected terminal message:

```text
Connected to PostgreSQL: knowledge_gap_platform @ localhost:5432
Knowledge Gap API running on port 5000
```

Check:

```text
http://localhost:5000/api/status
```

The response should contain:

```json
{
  "status": "Online",
  "database": "PostgreSQL Active"
}
```

### Run React frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

Open the Vite URL shown in the terminal.

### Important

The project is configured for the user's local PostgreSQL database. No database password is stored in the project archive; put your own password in `frontend/.env`.
