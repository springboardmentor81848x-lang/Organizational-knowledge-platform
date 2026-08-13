-- Incremental patch: add per-department heads, mentor dept update, new L&D admin
-- Password for all accounts: password123
-- BCrypt hash: $2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6

DELETE FROM employee WHERE email IN ('dept_head@kgap.com', 'lnd_admin@kgap.com');
DELETE FROM app_users WHERE email IN ('dept_head@kgap.com', 'lnd_admin@kgap.com');

UPDATE employee
SET department = 'Backend Engineering',
    bio = 'Senior Mentor providing backend engineering guidance.'
WHERE email = 'mentor@kgap.com';

INSERT INTO app_users (full_name, email, password, role) VALUES
('Michael Chen', 'mentor@kgap.com', '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'MENTOR')
ON CONFLICT (email) DO NOTHING;

INSERT INTO employee (first_name, last_name, email, phone_number, department, role, job_role_id, experience, education, bio) VALUES
('Michael', 'Chen', 'mentor@kgap.com', '+1-555-0151', 'Backend Engineering', 'MENTOR', 1, '12+ Years Mentoring', 'M.S. CS', 'Senior Mentor providing backend engineering guidance.')
ON CONFLICT (email) DO UPDATE SET
    department = EXCLUDED.department,
    bio = EXCLUDED.bio;

INSERT INTO app_users (full_name, email, password, role) VALUES
('Backend Dept Head',  'depthead.backend@kgap.com',  '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'DEPARTMENT_HEAD'),
('Frontend Dept Head', 'depthead.frontend@kgap.com', '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'DEPARTMENT_HEAD'),
('Data Dept Head',     'depthead.data@kgap.com',     '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'DEPARTMENT_HEAD'),
('DevOps Dept Head',   'depthead.devops@kgap.com',   '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'DEPARTMENT_HEAD'),
('Security Dept Head', 'depthead.security@kgap.com', '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'DEPARTMENT_HEAD'),
('Product Dept Head',  'depthead.product@kgap.com',  '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'DEPARTMENT_HEAD'),
('L&D Admin',          'lnd.admin@kgap.com',         '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'LEARNING_DEVELOPMENT_ADMIN')
ON CONFLICT (email) DO NOTHING;

INSERT INTO employee (first_name, last_name, email, phone_number, department, role, job_role_id, experience, education, bio) VALUES
('Backend',  'Dept Head', 'depthead.backend@kgap.com',  '+91-9876543301', 'Backend Engineering',  'DEPARTMENT_HEAD', 1, '9+ Years Backend Leadership',  'M.Tech CS',           'Department Head for Backend Engineering.'),
('Frontend', 'Dept Head', 'depthead.frontend@kgap.com', '+91-9876543302', 'Frontend Engineering', 'DEPARTMENT_HEAD', 2, '8+ Years Frontend Leadership', 'B.Tech CS',           'Department Head for Frontend Engineering.'),
('Data',     'Dept Head', 'depthead.data@kgap.com',     '+91-9876543303', 'Data Science',         'DEPARTMENT_HEAD', 3, '10+ Years Data Leadership',    'Ph.D. Statistics',    'Department Head for Data Science.'),
('DevOps',   'Dept Head', 'depthead.devops@kgap.com',   '+91-9876543304', 'Cloud/DevOps',         'DEPARTMENT_HEAD', 7, '8+ Years DevOps Leadership',   'B.S. Comp Eng',       'Department Head for Cloud/DevOps.'),
('Security', 'Dept Head', 'depthead.security@kgap.com', '+91-9876543305', 'Cybersecurity',        'DEPARTMENT_HEAD', 8, '9+ Years Security Leadership',  'M.S. Cybersecurity',  'Department Head for Cybersecurity.'),
('Product',  'Dept Head', 'depthead.product@kgap.com',  '+91-9876543306', 'Product',              'DEPARTMENT_HEAD', 5, '8+ Years Product Leadership',  'MBA',                 'Department Head for Product.'),
('L&D',      'Admin',     'lnd.admin@kgap.com',         '+1-555-0152',    NULL,                   'LEARNING_DEVELOPMENT_ADMIN', 6, '7 Years L&D', 'MBA Learning Design', 'Org-wide Learning & Development administrator.')
ON CONFLICT (email) DO NOTHING;

SELECT id, full_name, email, role FROM app_users
WHERE role IN ('DEPARTMENT_HEAD', 'LEARNING_DEVELOPMENT_ADMIN', 'MENTOR')
ORDER BY role, email;
