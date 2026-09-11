# Organizational Knowledge Gap Intelligence Platform

Full-stack Organizational Knowledge Gap Intelligence Platform based on the Team 5 project. Milestone 3 is implemented as a persistent PostgreSQL-backed module in the existing React + Express application while preserving the existing Spring Boot project scaffold.

## Milestone 3
- Mentorship & Knowledge Sharing: expert directory, mentor matching/search, session creation, capacity-aware RSVP and notifications.
- Learning Progress: enrollment persistence, progress updates, module completion, completion status and personalized learning path generation.
- Assessment & Survey: self/peer/manager assessment records, submission scoring, assessment history and automatic user-skill score update.
- Notifications: gap, training, assessment, mentorship and milestone alerts; read-one and read-all actions.
- Analytics & Reports: role readiness, gap severity, assessment average, learning progress, enrollment/completion KPIs and CSV/print-to-PDF exports.

## Run
### Frontend + API
```bash
cd frontend
npm install
npm run server
```
In another terminal:
```bash
cd frontend
npm run dev
```
Open the Vite URL shown in the terminal.

### PostgreSQL
The Node API reads these environment variables (or uses local defaults):
`PGUSER`, `PGHOST`, `PGDATABASE`, `PGPASSWORD`, `PGPORT`.
Schema and seed data are automatically initialized on API startup.

## Main API groups
`/api/status`, `/api/gap-analysis`, `/api/courses`, `/api/ai/recommendations`, `/api/learning-paths`, `/api/learning`, `/api/mentors`, `/api/sessions`, `/api/assessments`, `/api/notifications`, `/api/analytics`, `/api/reports`.

## Export
Reports can be exported as Excel-compatible CSV files. Use browser Print → Save as PDF for PDF output without requiring a server-side office/PDF dependency.
