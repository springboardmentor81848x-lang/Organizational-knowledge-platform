# OKGIP: Removing mock data and wiring to live MySQL

## What's done in this pass

- `backend/config/mysqlDb.ts` — replaced the single fragile `mysql.createConnection`
  (which silently returned `null` on any error, letting every controller quietly
  fall back to mock data) with a proper `mysql2/promise` **pool** (`query`, `execute`,
  `verifyConnection`). Errors now throw instead of resolving to `null`.
- `server.ts` — the server now calls `verifyConnection()` on boot and **exits if the
  database isn't reachable**, instead of starting up in a broken "mock mode" with no
  indication anything is wrong.
- `backend/controllers/authController.ts` — fully rewritten against your real schema
  (see below). No import of `backend/config/db.ts` (the mock store) anywhere.
- `backend/routes/authRoutes.ts` — same, and the **`/switch-user` route was removed**.
  It let anyone log in as any user by POSTing an email, with no auth check at all —
  a live account-takeover hole, not a "mock" you can just leave in.
- `.env.example` — no longer ships a real-looking Aiven hostname/user as a silent
  code default. Fill in your own values in `.env` (already gitignored).

## Why the rest of the app needs the same treatment, not a find/replace

Every one of the other 23 controllers (`backend/controllers/*.ts`, ~7,900 lines) imports
`backend/config/db.ts` — a 1,469-line in-memory mock store — as **primary** storage, and
only opportunistically touches MySQL as a side effect. On top of that, the mock objects'
shape doesn't match your actual tables (e.g. controllers expect `employees.first_name` /
`.email` / `.join_date` / `.photo_url` / `.status`, but your real `employees` table has
none of those — names/email live on `users`, and it's `joining_date`, `avatar_url`,
`employment_status`). So this isn't a mechanical "swap the import" — each controller's
queries need to be rebuilt against the real columns and joins.

That's a large, mechanical-but-not-trivial rewrite across 23 files. Doing it blind in one
pass — without a way to actually run it against your Aiven database and see what breaks —
risks shipping something that "looks" wired but silently returns wrong data. I'd strongly
recommend running the rest of this through **Claude Code**, where each controller can be
converted and then actually executed against your dev DB in a loop, one module at a time.

The reference below gives you (or Claude Code) everything needed to do that quickly.

## Real schema reference (from your `database.sql` dump)

| Table | Key columns |
|---|---|
| `users` | id, user_code, email, password_hash, first_name, last_name, phone_number, profile_photo, status |
| `roles` | id, role_code, name, description |
| `user_roles` | id, user_id, role_id *(join table — a user's role is NOT a column on `users`)* |
| `employees` | id, employee_code, user_id, department_id, designation, manager_id, joining_date, employment_status, phone, avatar_url, casual_leave_balance, medical_leave_balance, performance_score, location |
| `departments` | id, department_code, name, code, description, department_head_id, status |
| `department_required_skills` | id, dept_req_code, department_id, skill_id, required_proficiency |
| `skills` | id, skill_code, name, category, description, status |
| `employee_skills` | id, employee_skill_code, employee_id, skill_id, current_proficiency, assessed_date, verified_by |
| `knowledge_gaps` | id, gap_code, employee_id, skill_id, required_proficiency, current_proficiency, gap_score, priority, status |
| `skill_assessments` | id, assessment_code, skill_id, title, description, pass_score |
| `assessment_questions` | id, question_code, assessment_id, question, option_a..d, correct_index |
| `assessment_results` | id, result_code, employee_id, assessment_id, skill_id, score, passed, new_proficiency_level, previous_proficiency_level, gap_before, gap_after, taken_at |
| `training_programs` | id, training_code, title, description, category, target_skill_id, min_proficiency_gain, duration_hours, provider, status |
| `training_assignments` | id, assignment_code, training_program_id, employee_id, assigned_by, assigned_date, due_date, status, progress_percentage, certificate_url |
| `learning_paths` | id, path_code, employee_id, skill_id, title, target_level, progress_percentage, priority, status |
| `learning_resources` | id, resource_code, learning_path_id, platform, title, url, skill_id, difficulty, resource_type, duration_minutes, description, is_free, sequence_order |
| `learning_path_items` | id, learning_path_id, resource_id, sequence_order, status, completed_at |
| `learning_resource_completions` | id, employee_id, resource_id, completed_at |
| `certificates` | id, certificate_code, employee_id, certificate_number, title, provider, issue_date, certificate_url |
| `badges` / `employee_badges` | badges: id, title, icon, description, category — employee_badges: id, employee_id, badge_title, description, icon, awarded_at |
| `mentor_profiles` | employee_id, bio, max_active_mentees, is_available |
| `mentor_requests` | id, requester_employee_id, mentor_employee_id, skill_id, goal, message, status(enum), response_note, responded_at |
| `knowledge_sessions` | id, title, description, skill_id, host_employee_id, scheduled_at, duration_minutes, capacity, meeting_link, status(enum) |
| `session_registrations` | id, session_id, employee_id, status(enum), registered_at, cancelled_at |
| `messages` | id, message_code, sender_id, recipient_id, is_announcement, content, attachment_url, is_read |
| `notifications` | id, notification_code, recipient_user_id, notification_type, title, message, related_entity_type, related_entity_id, is_read |
| `leave_types` | id, type_code, name, description, default_days |
| `leave_requests` | id, leave_code, employee_id, leave_type, start_date, end_date, duration_days, reason, current_approver_id, status |
| `tasks` | id, task_code, title, description, assigned_to, assigned_by, priority, status, deadline, completed_at |
| `audit_logs` | id, audit_code, actor_user_id, action, entity_type, entity_id, old_values(json), new_values(json), description, ip_address, user_agent |
| `ai_chat_logs` | id, user_id, employee_id, message, reply, source |
| `system_settings` | id, platform_name, jwt_expiration, default_role, gap_alert_threshold, auto_training_reminder, strict_rbac_mode |
| `password_reset_tokens` | id, user_id, token, expires_at, used |

Note: `employees` has **no** name/email/photo columns — join to `users` for those.
`users` has **no** role column — join through `user_roles` → `roles`.

## The conversion pattern (apply per controller)

1. Replace the imports:
   ```ts
   // remove:
   import { db } from '../config/db';
   import { queryAsync } from '../config/mysqlDb';
   // add:
   import { query, execute } from '../config/mysqlDb';
   ```
2. Every handler becomes `async` (if not already) and every read becomes a
   parameterized `SELECT ... JOIN ...` built from the table above, instead of
   `db.employees.find(...)` / `.filter(...)` / `.map(...)`.
3. Anywhere the old code did in-JS joins/aggregation over mock arrays (e.g. computing
   `targetRoleReadiness`, gap scores, dashboard KPIs), either push it into SQL
   (`JOIN` + `GROUP BY` + `SUM`/`AVG`) or fetch the raw rows and compute in JS — either
   is fine, just don't reintroduce a cached in-memory copy.
4. Every write becomes `INSERT`/`UPDATE`/`DELETE` via `execute(...)`, generating
   `*_code` values the same way `authController.ts` does (`nextCode()` helper — copy it
   into a shared `backend/utils/codes.ts` so you're not duplicating it 23 times).
5. Delete `backend/config/db.ts` and `backend/config/schemaInitializer.ts` **only
   after** every controller in `backend/controllers/` no longer imports them —
   `grep -rl "from '../config/db'" backend/controllers` should return nothing.

## Running it

1. `cp .env.example .env` and fill in your real `DB_HOST`, `DB_PORT`, `DB_USER`,
   `DB_PASSWORD` (from Aiven), `DB_NAME=defaultdb`, `DB_SSL=true`, and a real
   `JWT_SECRET` (`openssl rand -hex 32`).
2. `npm install`
3. `npm run dev` — this now calls `verifyConnection()` first and will refuse to start
   if it can't reach Aiven, so a bad `.env` fails immediately and loudly instead of
   quietly serving mock data.
4. Test auth end-to-end against real rows already in your dump, e.g.
   `POST /api/auth/login` with `admin@okgip.org` and that account's real password.
5. For each remaining controller, apply the pattern above, then exercise its routes
   with curl/Postman against your dev DB before moving to the next one.
