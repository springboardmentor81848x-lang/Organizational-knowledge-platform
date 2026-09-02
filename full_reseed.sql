-- ============================================================================
-- full_reseed.sql — DESTRUCTIVE: deletes ALL existing users and everything
-- that cascades from them (employees, employee_skills, knowledge_gaps,
-- mentorships, training_assignments, leave_requests, tasks, certificates,
-- messages, notifications, etc — anything FK'd to users/employees with
-- ON DELETE CASCADE), then seeds 60 fresh users: 10 each across all 6 real
-- roles (Employee, Manager, HR Specialist, Department Head,
-- L&D Admin / Mentor, Admin).
--
-- THIS PERMANENTLY REMOVES YOUR EXISTING USERS, INCLUDING admin@okgip.org
-- and any other accounts currently in the database. Back up first if you
-- want to keep any of that data. There is no undo once this runs.
--
-- Also fixes: "Error Code: 1175 ... safe update mode" — that error fires
-- because MySQL Workbench's safe-update mode requires UPDATE/DELETE
-- statements to reference a key column in their WHERE clause. This script
-- disables it for just this session (SET SQL_SAFE_UPDATES = 0) and
-- restores it at the end, rather than asking you to change a permanent
-- Workbench preference.
--
-- Run this INSTEAD OF seed_master.sql (it replaces that data entirely) —
-- run schema_updates.sql first if you haven't already, since this uses
-- target_roles, mentorships, etc.
-- ============================================================================

SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- Wipe all users (and everything that cascades from them via ON DELETE
-- CASCADE: employees, employee_skills, knowledge_gaps, mentorships,
-- mentor_profiles, training_assignments, leave_requests, tasks assigned to
-- them, certificates, messages, notifications, community_group_members,
-- community_posts, ai_chat_logs, password_reset_tokens).
-- ----------------------------------------------------------------------------
DELETE FROM users;

-- Optional — purely cosmetic: resets the id counter back to 1 so the new
-- 60 users get low, clean IDs instead of continuing from wherever the
-- counter was before (DELETE never resets AUTO_INCREMENT; only TRUNCATE
-- does, and TRUNCATE needed FK checks off anyway, so this is equivalent
-- and safer to control explicitly). Comment this out if you don't care.
ALTER TABLE users AUTO_INCREMENT = 1;

-- Also clear anything that might reference employees but isn't cascaded
-- automatically (defensive — safe even if these are already empty).
DELETE FROM knowledge_gaps;

SET FOREIGN_KEY_CHECKS = 1;

SET @seed_password_hash = '$2b$10$0RwvBrxxmhmUqdCugp58AOQG8QR0stBQSC4gXbvZYVM83mTasqq4u';

-- ----------------------------------------------------------------------------
-- 60 fresh users
-- ----------------------------------------------------------------------------
INSERT INTO users (user_code, email, password_hash, first_name, last_name, phone_number, status) VALUES
  ('USER-SEED-021', 'rudra.reddy@gmail.com', @seed_password_hash, 'Rudra', 'Reddy', '+91-98125-46048', 'ACTIVE'),
  ('USER-SEED-022', 'ananya.singh@gmail.com', @seed_password_hash, 'Ananya', 'Singh', '+91-98858-81482', 'ACTIVE'),
  ('USER-SEED-023', 'vikram.desai@gmail.com', @seed_password_hash, 'Vikram', 'Desai', '+91-98338-76237', 'ACTIVE'),
  ('USER-SEED-024', 'sara.gupta@gmail.com', @seed_password_hash, 'Sara', 'Gupta', '+91-98818-81426', 'ACTIVE'),
  ('USER-SEED-025', 'suresh.mehta@gmail.com', @seed_password_hash, 'Suresh', 'Mehta', '+91-98990-10851', 'ACTIVE'),
  ('USER-SEED-026', 'siddharth.desai@gmail.com', @seed_password_hash, 'Siddharth', 'Desai', '+91-98881-54118', 'ACTIVE'),
  ('USER-SEED-027', 'vivaan.saxena@gmail.com', @seed_password_hash, 'Vivaan', 'Saxena', '+91-98452-89131', 'ACTIVE'),
  ('USER-SEED-028', 'arnav.reddy@gmail.com', @seed_password_hash, 'Arnav', 'Reddy', '+91-98487-20328', 'ACTIVE'),
  ('USER-SEED-029', 'krish.saxena@gmail.com', @seed_password_hash, 'Krish', 'Saxena', '+91-98470-85674', 'ACTIVE'),
  ('USER-SEED-030', 'ishita.bhat@gmail.com', @seed_password_hash, 'Ishita', 'Bhat', '+91-98396-20458', 'ACTIVE'),
  ('USER-SEED-031', 'zara.gupta@gmail.com', @seed_password_hash, 'Zara', 'Gupta', '+91-98954-57819', 'ACTIVE'),
  ('USER-SEED-032', 'yash.menon@gmail.com', @seed_password_hash, 'Yash', 'Menon', '+91-98818-99593', 'ACTIVE'),
  ('USER-SEED-033', 'harish.nair@gmail.com', @seed_password_hash, 'Harish', 'Nair', '+91-98573-59735', 'ACTIVE'),
  ('USER-SEED-034', 'kiara.bhat@gmail.com', @seed_password_hash, 'Kiara', 'Bhat', '+91-98894-17331', 'ACTIVE'),
  ('USER-SEED-035', 'suresh.iyer@gmail.com', @seed_password_hash, 'Suresh', 'Iyer', '+91-98316-84341', 'ACTIVE'),
  ('USER-SEED-036', 'saanvi.trivedi@gmail.com', @seed_password_hash, 'Saanvi', 'Trivedi', '+91-98758-70142', 'ACTIVE'),
  ('USER-SEED-037', 'navya.pandey@gmail.com', @seed_password_hash, 'Navya', 'Pandey', '+91-98651-44438', 'ACTIVE'),
  ('USER-SEED-038', 'anika.kapoor@gmail.com', @seed_password_hash, 'Anika', 'Kapoor', '+91-98241-76784', 'ACTIVE'),
  ('USER-SEED-039', 'arjun.malhotra@gmail.com', @seed_password_hash, 'Arjun', 'Malhotra', '+91-98742-30969', 'ACTIVE'),
  ('USER-SEED-040', 'kian.chatterjee@gmail.com', @seed_password_hash, 'Kian', 'Chatterjee', '+91-98641-42953', 'ACTIVE'),
  ('USER-SEED-041', 'arjun.singh@gmail.com', @seed_password_hash, 'Arjun', 'Singh', '+91-98649-44973', 'ACTIVE'),
  ('USER-SEED-042', 'meera.chatterjee@gmail.com', @seed_password_hash, 'Meera', 'Chatterjee', '+91-98103-44522', 'ACTIVE'),
  ('USER-SEED-043', 'amaira.gupta@gmail.com', @seed_password_hash, 'Amaira', 'Gupta', '+91-98405-93748', 'ACTIVE'),
  ('USER-SEED-044', 'atharv.nair@gmail.com', @seed_password_hash, 'Atharv', 'Nair', '+91-98652-79514', 'ACTIVE'),
  ('USER-SEED-045', 'arjun.shetty@gmail.com', @seed_password_hash, 'Arjun', 'Shetty', '+91-98471-50306', 'ACTIVE'),
  ('USER-SEED-046', 'vikram.iyer@gmail.com', @seed_password_hash, 'Vikram', 'Iyer', '+91-98849-73699', 'ACTIVE'),
  ('USER-SEED-047', 'ayaan.pandey@gmail.com', @seed_password_hash, 'Ayaan', 'Pandey', '+91-98269-44741', 'ACTIVE'),
  ('USER-SEED-048', 'atharv.chopra@gmail.com', @seed_password_hash, 'Atharv', 'Chopra', '+91-98806-36365', 'ACTIVE'),
  ('USER-SEED-049', 'anika.chatterjee@gmail.com', @seed_password_hash, 'Anika', 'Chatterjee', '+91-98629-69177', 'ACTIVE'),
  ('USER-SEED-050', 'diya.sharma@gmail.com', @seed_password_hash, 'Diya', 'Sharma', '+91-98702-82603', 'ACTIVE'),
  ('USER-SEED-051', 'sneha.kapoor@gmail.com', @seed_password_hash, 'Sneha', 'Kapoor', '+91-98169-14117', 'ACTIVE'),
  ('USER-SEED-052', 'suresh.singh@gmail.com', @seed_password_hash, 'Suresh', 'Singh', '+91-98597-38080', 'ACTIVE'),
  ('USER-SEED-053', 'dhruv.kumar@gmail.com', @seed_password_hash, 'Dhruv', 'Kumar', '+91-98348-71993', 'ACTIVE'),
  ('USER-SEED-054', 'yash.joshi@gmail.com', @seed_password_hash, 'Yash', 'Joshi', '+91-98462-65519', 'ACTIVE'),
  ('USER-SEED-055', 'meher.gupta@gmail.com', @seed_password_hash, 'Meher', 'Gupta', '+91-98761-22899', 'ACTIVE'),
  ('USER-SEED-056', 'ahana.saxena@gmail.com', @seed_password_hash, 'Ahana', 'Saxena', '+91-98211-42591', 'ACTIVE'),
  ('USER-SEED-057', 'divya.joshi@gmail.com', @seed_password_hash, 'Divya', 'Joshi', '+91-98287-46509', 'ACTIVE'),
  ('USER-SEED-058', 'rian.pandey@gmail.com', @seed_password_hash, 'Rian', 'Pandey', '+91-98200-16630', 'ACTIVE'),
  ('USER-SEED-059', 'rian.kapoor@gmail.com', @seed_password_hash, 'Rian', 'Kapoor', '+91-98270-63269', 'ACTIVE'),
  ('USER-SEED-060', 'sneha.nair@gmail.com', @seed_password_hash, 'Sneha', 'Nair', '+91-98488-10282', 'ACTIVE'),
  ('USER-SEED-061', 'myra.patel@gmail.com', @seed_password_hash, 'Myra', 'Patel', '+91-98848-82845', 'ACTIVE'),
  ('USER-SEED-062', 'nikhil.verma@gmail.com', @seed_password_hash, 'Nikhil', 'Verma', '+91-98693-81066', 'ACTIVE'),
  ('USER-SEED-063', 'tara.kumar@gmail.com', @seed_password_hash, 'Tara', 'Kumar', '+91-98614-79615', 'ACTIVE'),
  ('USER-SEED-064', 'rian.nair@gmail.com', @seed_password_hash, 'Rian', 'Nair', '+91-98170-87992', 'ACTIVE'),
  ('USER-SEED-065', 'krish.agarwal@gmail.com', @seed_password_hash, 'Krish', 'Agarwal', '+91-98352-85880', 'ACTIVE'),
  ('USER-SEED-066', 'aryan.singh@gmail.com', @seed_password_hash, 'Aryan', 'Singh', '+91-98697-84085', 'ACTIVE'),
  ('USER-SEED-067', 'yash.patel@gmail.com', @seed_password_hash, 'Yash', 'Patel', '+91-98421-41285', 'ACTIVE'),
  ('USER-SEED-068', 'aadhya.rao@gmail.com', @seed_password_hash, 'Aadhya', 'Rao', '+91-98568-51441', 'ACTIVE'),
  ('USER-SEED-069', 'dhruv.reddy@gmail.com', @seed_password_hash, 'Dhruv', 'Reddy', '+91-98175-80468', 'ACTIVE'),
  ('USER-SEED-070', 'krish.iyer@gmail.com', @seed_password_hash, 'Krish', 'Iyer', '+91-98350-58434', 'ACTIVE'),
  ('USER-SEED-071', 'arnav.patel@gmail.com', @seed_password_hash, 'Arnav', 'Patel', '+91-98409-90173', 'ACTIVE'),
  ('USER-SEED-072', 'riya.rao@gmail.com', @seed_password_hash, 'Riya', 'Rao', '+91-98779-23577', 'ACTIVE'),
  ('USER-SEED-073', 'siddharth.menon@gmail.com', @seed_password_hash, 'Siddharth', 'Menon', '+91-98388-89276', 'ACTIVE'),
  ('USER-SEED-074', 'rudra.saxena@gmail.com', @seed_password_hash, 'Rudra', 'Saxena', '+91-98370-76244', 'ACTIVE'),
  ('USER-SEED-075', 'rudra.joshi@gmail.com', @seed_password_hash, 'Rudra', 'Joshi', '+91-98949-46265', 'ACTIVE'),
  ('USER-SEED-076', 'divya.gupta@gmail.com', @seed_password_hash, 'Divya', 'Gupta', '+91-98368-31178', 'ACTIVE'),
  ('USER-SEED-077', 'arjun.iyer@gmail.com', @seed_password_hash, 'Arjun', 'Iyer', '+91-98807-29536', 'ACTIVE'),
  ('USER-SEED-078', 'riya.malhotra@gmail.com', @seed_password_hash, 'Riya', 'Malhotra', '+91-98540-26704', 'ACTIVE'),
  ('USER-SEED-079', 'amaira.verma@gmail.com', @seed_password_hash, 'Amaira', 'Verma', '+91-98466-37535', 'ACTIVE'),
  ('USER-SEED-080', 'riya.trivedi@gmail.com', @seed_password_hash, 'Riya', 'Trivedi', '+91-98995-63264', 'ACTIVE');

-- ----------------------------------------------------------------------------
-- Role assignments (keyed by role name, resolved dynamically)
-- ----------------------------------------------------------------------------
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE r.name = 'Employee'
  AND u.email IN ('rudra.reddy@gmail.com','ananya.singh@gmail.com','vikram.desai@gmail.com','sara.gupta@gmail.com','suresh.mehta@gmail.com','siddharth.desai@gmail.com','vivaan.saxena@gmail.com','arnav.reddy@gmail.com','krish.saxena@gmail.com','ishita.bhat@gmail.com');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE r.name = 'Manager'
  AND u.email IN ('zara.gupta@gmail.com','yash.menon@gmail.com','harish.nair@gmail.com','kiara.bhat@gmail.com','suresh.iyer@gmail.com','saanvi.trivedi@gmail.com','navya.pandey@gmail.com','anika.kapoor@gmail.com','arjun.malhotra@gmail.com','kian.chatterjee@gmail.com');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE r.name = 'HR Specialist'
  AND u.email IN ('arjun.singh@gmail.com','meera.chatterjee@gmail.com','amaira.gupta@gmail.com','atharv.nair@gmail.com','arjun.shetty@gmail.com','vikram.iyer@gmail.com','ayaan.pandey@gmail.com','atharv.chopra@gmail.com','anika.chatterjee@gmail.com','diya.sharma@gmail.com');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE r.name = 'Department Head'
  AND u.email IN ('sneha.kapoor@gmail.com','suresh.singh@gmail.com','dhruv.kumar@gmail.com','yash.joshi@gmail.com','meher.gupta@gmail.com','ahana.saxena@gmail.com','divya.joshi@gmail.com','rian.pandey@gmail.com','rian.kapoor@gmail.com','sneha.nair@gmail.com');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE r.name = 'L&D Admin / Mentor'
  AND u.email IN ('myra.patel@gmail.com','nikhil.verma@gmail.com','tara.kumar@gmail.com','rian.nair@gmail.com','krish.agarwal@gmail.com','aryan.singh@gmail.com','yash.patel@gmail.com','aadhya.rao@gmail.com','dhruv.reddy@gmail.com','krish.iyer@gmail.com');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE r.name = 'Admin'
  AND u.email IN ('arnav.patel@gmail.com','riya.rao@gmail.com','siddharth.menon@gmail.com','rudra.saxena@gmail.com','rudra.joshi@gmail.com','divya.gupta@gmail.com','arjun.iyer@gmail.com','riya.malhotra@gmail.com','amaira.verma@gmail.com','riya.trivedi@gmail.com');

-- ----------------------------------------------------------------------------
-- Employee records (virtual ID cards)
-- ----------------------------------------------------------------------------
INSERT INTO employees (employee_code, user_id, department_id, designation, joining_date, employment_status, phone, avatar_url, location)
SELECT 'OKGIP-EMP-2026-041', u.id, d.id, 'Software Engineer', '2021-03-24', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Chennai, India' FROM users u, departments d WHERE u.email = 'rudra.reddy@gmail.com' AND d.name = 'Data Science & Analytics'
UNION ALL SELECT 'OKGIP-EMP-2026-042', u.id, d.id, 'Data Analyst', '2024-01-01', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Pune, India' FROM users u, departments d WHERE u.email = 'ananya.singh@gmail.com' AND d.name = 'Cybersecurity & Compliance'
UNION ALL SELECT 'OKGIP-EMP-2026-043', u.id, d.id, 'QA Engineer', '2018-09-07', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Ahmedabad, India' FROM users u, departments d WHERE u.email = 'vikram.desai@gmail.com' AND d.name = 'Product Management'
UNION ALL SELECT 'OKGIP-EMP-2026-044', u.id, d.id, 'Product Analyst', '2021-08-19', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Gurugram, India' FROM users u, departments d WHERE u.email = 'sara.gupta@gmail.com' AND d.name = 'Human Resources & Talent'
UNION ALL SELECT 'OKGIP-EMP-2026-045', u.id, d.id, 'Systems Engineer', '2024-06-09', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Hyderabad, India' FROM users u, departments d WHERE u.email = 'suresh.mehta@gmail.com' AND d.name = 'Frontend Engineering'
UNION ALL SELECT 'OKGIP-EMP-2026-046', u.id, d.id, 'Support Engineer', '2019-07-04', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Pune, India' FROM users u, departments d WHERE u.email = 'siddharth.desai@gmail.com' AND d.name = 'Backend Engineering'
UNION ALL SELECT 'OKGIP-EMP-2026-047', u.id, d.id, 'Business Analyst', '2018-12-15', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Mumbai, India' FROM users u, departments d WHERE u.email = 'vivaan.saxena@gmail.com' AND d.name = 'Cloud & DevOps'
UNION ALL SELECT 'OKGIP-EMP-2026-048', u.id, d.id, 'UI/UX Designer', '2022-11-20', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Kolkata, India' FROM users u, departments d WHERE u.email = 'arnav.reddy@gmail.com' AND d.name = 'VLSI & Embedded Systems'
UNION ALL SELECT 'OKGIP-EMP-2026-049', u.id, d.id, 'Technical Writer', '2019-01-22', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Chennai, India' FROM users u, departments d WHERE u.email = 'krish.saxena@gmail.com' AND d.name = 'Data Engineering'
UNION ALL SELECT 'OKGIP-EMP-2026-050', u.id, d.id, 'Junior Developer', '2019-07-09', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Chennai, India' FROM users u, departments d WHERE u.email = 'ishita.bhat@gmail.com' AND d.name = 'Software Engineering'
UNION ALL SELECT 'OKGIP-EMP-2026-051', u.id, d.id, 'Engineering Manager', '2023-06-07', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Hyderabad, India' FROM users u, departments d WHERE u.email = 'zara.gupta@gmail.com' AND d.name = 'Data Science & Analytics'
UNION ALL SELECT 'OKGIP-EMP-2026-052', u.id, d.id, 'Team Lead', '2020-09-24', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Pune, India' FROM users u, departments d WHERE u.email = 'yash.menon@gmail.com' AND d.name = 'Cybersecurity & Compliance'
UNION ALL SELECT 'OKGIP-EMP-2026-053', u.id, d.id, 'Delivery Manager', '2021-11-11', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Mumbai, India' FROM users u, departments d WHERE u.email = 'harish.nair@gmail.com' AND d.name = 'Product Management'
UNION ALL SELECT 'OKGIP-EMP-2026-054', u.id, d.id, 'Product Manager', '2018-06-13', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Chennai, India' FROM users u, departments d WHERE u.email = 'kiara.bhat@gmail.com' AND d.name = 'Human Resources & Talent'
UNION ALL SELECT 'OKGIP-EMP-2026-055', u.id, d.id, 'Program Manager', '2021-11-16', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Delhi, India' FROM users u, departments d WHERE u.email = 'suresh.iyer@gmail.com' AND d.name = 'Frontend Engineering'
UNION ALL SELECT 'OKGIP-EMP-2026-056', u.id, d.id, 'Engineering Manager', '2022-03-08', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Hyderabad, India' FROM users u, departments d WHERE u.email = 'saanvi.trivedi@gmail.com' AND d.name = 'Backend Engineering'
UNION ALL SELECT 'OKGIP-EMP-2026-057', u.id, d.id, 'Team Lead', '2024-10-13', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Ahmedabad, India' FROM users u, departments d WHERE u.email = 'navya.pandey@gmail.com' AND d.name = 'Cloud & DevOps'
UNION ALL SELECT 'OKGIP-EMP-2026-058', u.id, d.id, 'Delivery Manager', '2019-01-28', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Noida, India' FROM users u, departments d WHERE u.email = 'anika.kapoor@gmail.com' AND d.name = 'VLSI & Embedded Systems'
UNION ALL SELECT 'OKGIP-EMP-2026-059', u.id, d.id, 'Product Manager', '2019-07-13', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Gurugram, India' FROM users u, departments d WHERE u.email = 'arjun.malhotra@gmail.com' AND d.name = 'Data Engineering'
UNION ALL SELECT 'OKGIP-EMP-2026-060', u.id, d.id, 'Program Manager', '2018-11-24', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Kolkata, India' FROM users u, departments d WHERE u.email = 'kian.chatterjee@gmail.com' AND d.name = 'Software Engineering'
UNION ALL SELECT 'OKGIP-EMP-2026-061', u.id, d.id, 'HR Specialist', '2019-05-14', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Delhi, India' FROM users u, departments d WHERE u.email = 'arjun.singh@gmail.com' AND d.name = 'Data Science & Analytics'
UNION ALL SELECT 'OKGIP-EMP-2026-062', u.id, d.id, 'Talent Acquisition Lead', '2020-09-04', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Kolkata, India' FROM users u, departments d WHERE u.email = 'meera.chatterjee@gmail.com' AND d.name = 'Cybersecurity & Compliance'
UNION ALL SELECT 'OKGIP-EMP-2026-063', u.id, d.id, 'HR Business Partner', '2021-03-12', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Kolkata, India' FROM users u, departments d WHERE u.email = 'amaira.gupta@gmail.com' AND d.name = 'Product Management'
UNION ALL SELECT 'OKGIP-EMP-2026-064', u.id, d.id, 'People Operations Manager', '2023-08-01', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Bengaluru, India' FROM users u, departments d WHERE u.email = 'atharv.nair@gmail.com' AND d.name = 'Human Resources & Talent'
UNION ALL SELECT 'OKGIP-EMP-2026-065', u.id, d.id, 'Compensation Analyst', '2018-04-19', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Chennai, India' FROM users u, departments d WHERE u.email = 'arjun.shetty@gmail.com' AND d.name = 'Frontend Engineering'
UNION ALL SELECT 'OKGIP-EMP-2026-066', u.id, d.id, 'HR Specialist', '2020-03-22', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Pune, India' FROM users u, departments d WHERE u.email = 'vikram.iyer@gmail.com' AND d.name = 'Backend Engineering'
UNION ALL SELECT 'OKGIP-EMP-2026-067', u.id, d.id, 'Talent Acquisition Lead', '2024-04-18', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Kolkata, India' FROM users u, departments d WHERE u.email = 'ayaan.pandey@gmail.com' AND d.name = 'Cloud & DevOps'
UNION ALL SELECT 'OKGIP-EMP-2026-068', u.id, d.id, 'HR Business Partner', '2024-11-21', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Mumbai, India' FROM users u, departments d WHERE u.email = 'atharv.chopra@gmail.com' AND d.name = 'VLSI & Embedded Systems'
UNION ALL SELECT 'OKGIP-EMP-2026-069', u.id, d.id, 'People Operations Manager', '2021-04-03', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Pune, India' FROM users u, departments d WHERE u.email = 'anika.chatterjee@gmail.com' AND d.name = 'Data Engineering'
UNION ALL SELECT 'OKGIP-EMP-2026-070', u.id, d.id, 'Compensation Analyst', '2021-01-03', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Chennai, India' FROM users u, departments d WHERE u.email = 'diya.sharma@gmail.com' AND d.name = 'Software Engineering'
UNION ALL SELECT 'OKGIP-EMP-2026-071', u.id, d.id, 'Department Head', '2019-09-08', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Delhi, India' FROM users u, departments d WHERE u.email = 'sneha.kapoor@gmail.com' AND d.name = 'Data Science & Analytics'
UNION ALL SELECT 'OKGIP-EMP-2026-072', u.id, d.id, 'Division Head', '2020-12-19', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Kolkata, India' FROM users u, departments d WHERE u.email = 'suresh.singh@gmail.com' AND d.name = 'Cybersecurity & Compliance'
UNION ALL SELECT 'OKGIP-EMP-2026-073', u.id, d.id, 'VP Engineering', '2021-02-04', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Gurugram, India' FROM users u, departments d WHERE u.email = 'dhruv.kumar@gmail.com' AND d.name = 'Product Management'
UNION ALL SELECT 'OKGIP-EMP-2026-074', u.id, d.id, 'Head of Product', '2025-12-02', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Gurugram, India' FROM users u, departments d WHERE u.email = 'yash.joshi@gmail.com' AND d.name = 'Human Resources & Talent'
UNION ALL SELECT 'OKGIP-EMP-2026-075', u.id, d.id, 'Director of Operations', '2024-12-11', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Bengaluru, India' FROM users u, departments d WHERE u.email = 'meher.gupta@gmail.com' AND d.name = 'Frontend Engineering'
UNION ALL SELECT 'OKGIP-EMP-2026-076', u.id, d.id, 'Department Head', '2021-09-15', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Chennai, India' FROM users u, departments d WHERE u.email = 'ahana.saxena@gmail.com' AND d.name = 'Backend Engineering'
UNION ALL SELECT 'OKGIP-EMP-2026-077', u.id, d.id, 'Division Head', '2021-02-15', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Noida, India' FROM users u, departments d WHERE u.email = 'divya.joshi@gmail.com' AND d.name = 'Cloud & DevOps'
UNION ALL SELECT 'OKGIP-EMP-2026-078', u.id, d.id, 'VP Engineering', '2018-02-25', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Kolkata, India' FROM users u, departments d WHERE u.email = 'rian.pandey@gmail.com' AND d.name = 'VLSI & Embedded Systems'
UNION ALL SELECT 'OKGIP-EMP-2026-079', u.id, d.id, 'Head of Product', '2025-04-28', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Noida, India' FROM users u, departments d WHERE u.email = 'rian.kapoor@gmail.com' AND d.name = 'Data Engineering'
UNION ALL SELECT 'OKGIP-EMP-2026-080', u.id, d.id, 'Director of Operations', '2022-08-10', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Gurugram, India' FROM users u, departments d WHERE u.email = 'sneha.nair@gmail.com' AND d.name = 'Software Engineering'
UNION ALL SELECT 'OKGIP-EMP-2026-081', u.id, d.id, 'L&D Administrator', '2020-04-10', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Noida, India' FROM users u, departments d WHERE u.email = 'myra.patel@gmail.com' AND d.name = 'Data Science & Analytics'
UNION ALL SELECT 'OKGIP-EMP-2026-082', u.id, d.id, 'Senior Mentor', '2023-01-02', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Bengaluru, India' FROM users u, departments d WHERE u.email = 'nikhil.verma@gmail.com' AND d.name = 'Cybersecurity & Compliance'
UNION ALL SELECT 'OKGIP-EMP-2026-083', u.id, d.id, 'Training Lead', '2018-09-03', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Hyderabad, India' FROM users u, departments d WHERE u.email = 'tara.kumar@gmail.com' AND d.name = 'Product Management'
UNION ALL SELECT 'OKGIP-EMP-2026-084', u.id, d.id, 'Learning Program Manager', '2021-07-04', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Pune, India' FROM users u, departments d WHERE u.email = 'rian.nair@gmail.com' AND d.name = 'Human Resources & Talent'
UNION ALL SELECT 'OKGIP-EMP-2026-085', u.id, d.id, 'Principal Mentor', '2018-10-03', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Ahmedabad, India' FROM users u, departments d WHERE u.email = 'krish.agarwal@gmail.com' AND d.name = 'Frontend Engineering'
UNION ALL SELECT 'OKGIP-EMP-2026-086', u.id, d.id, 'L&D Administrator', '2023-05-07', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Kolkata, India' FROM users u, departments d WHERE u.email = 'aryan.singh@gmail.com' AND d.name = 'Backend Engineering'
UNION ALL SELECT 'OKGIP-EMP-2026-087', u.id, d.id, 'Senior Mentor', '2024-03-22', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Mumbai, India' FROM users u, departments d WHERE u.email = 'yash.patel@gmail.com' AND d.name = 'Cloud & DevOps'
UNION ALL SELECT 'OKGIP-EMP-2026-088', u.id, d.id, 'Training Lead', '2018-08-20', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Pune, India' FROM users u, departments d WHERE u.email = 'aadhya.rao@gmail.com' AND d.name = 'VLSI & Embedded Systems'
UNION ALL SELECT 'OKGIP-EMP-2026-089', u.id, d.id, 'Learning Program Manager', '2022-03-12', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Chennai, India' FROM users u, departments d WHERE u.email = 'dhruv.reddy@gmail.com' AND d.name = 'Data Engineering'
UNION ALL SELECT 'OKGIP-EMP-2026-090', u.id, d.id, 'Principal Mentor', '2020-08-27', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Mumbai, India' FROM users u, departments d WHERE u.email = 'krish.iyer@gmail.com' AND d.name = 'Software Engineering'
UNION ALL SELECT 'OKGIP-EMP-2026-091', u.id, d.id, 'System Administrator', '2018-11-27', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Kolkata, India' FROM users u, departments d WHERE u.email = 'arnav.patel@gmail.com' AND d.name = 'Data Science & Analytics'
UNION ALL SELECT 'OKGIP-EMP-2026-092', u.id, d.id, 'Platform Admin', '2022-02-04', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Hyderabad, India' FROM users u, departments d WHERE u.email = 'riya.rao@gmail.com' AND d.name = 'Cybersecurity & Compliance'
UNION ALL SELECT 'OKGIP-EMP-2026-093', u.id, d.id, 'IT Administrator', '2023-04-22', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Chennai, India' FROM users u, departments d WHERE u.email = 'siddharth.menon@gmail.com' AND d.name = 'Product Management'
UNION ALL SELECT 'OKGIP-EMP-2026-094', u.id, d.id, 'Security Administrator', '2022-01-03', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Noida, India' FROM users u, departments d WHERE u.email = 'rudra.saxena@gmail.com' AND d.name = 'Human Resources & Talent'
UNION ALL SELECT 'OKGIP-EMP-2026-095', u.id, d.id, 'Access Control Admin', '2018-06-25', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Bengaluru, India' FROM users u, departments d WHERE u.email = 'rudra.joshi@gmail.com' AND d.name = 'Frontend Engineering'
UNION ALL SELECT 'OKGIP-EMP-2026-096', u.id, d.id, 'System Administrator', '2024-09-01', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Noida, India' FROM users u, departments d WHERE u.email = 'divya.gupta@gmail.com' AND d.name = 'Backend Engineering'
UNION ALL SELECT 'OKGIP-EMP-2026-097', u.id, d.id, 'Platform Admin', '2018-06-19', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Kolkata, India' FROM users u, departments d WHERE u.email = 'arjun.iyer@gmail.com' AND d.name = 'Cloud & DevOps'
UNION ALL SELECT 'OKGIP-EMP-2026-098', u.id, d.id, 'IT Administrator', '2022-06-26', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Bengaluru, India' FROM users u, departments d WHERE u.email = 'riya.malhotra@gmail.com' AND d.name = 'VLSI & Embedded Systems'
UNION ALL SELECT 'OKGIP-EMP-2026-099', u.id, d.id, 'Security Administrator', '2019-06-25', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Chennai, India' FROM users u, departments d WHERE u.email = 'amaira.verma@gmail.com' AND d.name = 'Data Engineering'
UNION ALL SELECT 'OKGIP-EMP-2026-100', u.id, d.id, 'Access Control Admin', '2020-04-28', 'ACTIVE', u.phone_number, '/default-avatar.jpg', 'Ahmedabad, India' FROM users u, departments d WHERE u.email = 'riya.trivedi@gmail.com' AND d.name = 'Software Engineering';

-- ----------------------------------------------------------------------------
-- Assign each of the 6 Department Heads as the actual head of a department,
-- so "Reporting Manager" / department-head lookups have something real.
-- ----------------------------------------------------------------------------
SET SQL_SAFE_UPDATES = 0;
-- Assign each Department Head to actually head one department (best-effort, one each)
UPDATE departments d
JOIN employees e ON e.employee_code = 'OKGIP-EMP-2026-071'
SET d.department_head_id = e.id
WHERE d.name = 'Data Science & Analytics';
UPDATE departments d
JOIN employees e ON e.employee_code = 'OKGIP-EMP-2026-072'
SET d.department_head_id = e.id
WHERE d.name = 'Cybersecurity & Compliance';
UPDATE departments d
JOIN employees e ON e.employee_code = 'OKGIP-EMP-2026-073'
SET d.department_head_id = e.id
WHERE d.name = 'Product Management';
UPDATE departments d
JOIN employees e ON e.employee_code = 'OKGIP-EMP-2026-074'
SET d.department_head_id = e.id
WHERE d.name = 'Human Resources & Talent';
UPDATE departments d
JOIN employees e ON e.employee_code = 'OKGIP-EMP-2026-075'
SET d.department_head_id = e.id
WHERE d.name = 'Frontend Engineering';
UPDATE departments d
JOIN employees e ON e.employee_code = 'OKGIP-EMP-2026-076'
SET d.department_head_id = e.id
WHERE d.name = 'Backend Engineering';
UPDATE departments d
JOIN employees e ON e.employee_code = 'OKGIP-EMP-2026-077'
SET d.department_head_id = e.id
WHERE d.name = 'Cloud & DevOps';
UPDATE departments d
JOIN employees e ON e.employee_code = 'OKGIP-EMP-2026-078'
SET d.department_head_id = e.id
WHERE d.name = 'VLSI & Embedded Systems';
UPDATE departments d
JOIN employees e ON e.employee_code = 'OKGIP-EMP-2026-079'
SET d.department_head_id = e.id
WHERE d.name = 'Data Engineering';
UPDATE departments d
JOIN employees e ON e.employee_code = 'OKGIP-EMP-2026-080'
SET d.department_head_id = e.id
WHERE d.name = 'Software Engineering';

SET SQL_SAFE_UPDATES = 1;

-- ============================================================================
-- Done. All 60 users share the password: 12345
-- ============================================================================
