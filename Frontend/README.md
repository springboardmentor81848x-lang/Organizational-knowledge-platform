# OKGIP Frontend

React + TypeScript frontend wired to the existing Spring Boot APIs at `http://localhost:8080`.

## Run
1. Keep PostgreSQL and the Spring Boot backend running.
2. In this folder run `npm install`.
3. Run `npm run dev`.
4. Open the Vite URL shown in the terminal.

Optional API base URL: create `.env` with `VITE_API_BASE_URL=http://localhost:8080`.

## Demo accounts from the current backend initializer
- admin@okip.com
- hr@okip.com
- manager@okip.com
- john.doe@okip.com

Password in the current backend initializer: `Password@123`.

The role shown in navigation is inferred for these seeded demo emails because the current login response contains only a JWT token and message; the JWT itself contains the email subject, not a role claim. Backend authorization remains authoritative.

## Important
The UI consumes backend responses rather than duplicating gap/AI/analytics business logic. Milestone 3 pages are included for the APIs currently present in the backend, but should be live-tested against the running backend before being called fully verified.
