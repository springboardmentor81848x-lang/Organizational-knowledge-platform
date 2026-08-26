-- ============================================================================
-- fix_duplicate_roles.sql — corrects a real bug found in your live database
--
-- ROOT CAUSE: an earlier migration (in seed_master.sql) added a new 'Mentor'
-- role (role_id 7) and assigned it to 5 users, but never removed their
-- existing 'L&D Admin / Mentor' role (role_id 5) first. Result: users
-- 37, 38, 39, 40, 41 each hold BOTH roles simultaneously in user_roles.
-- Your canonical role list has no separate "Mentor" role — Learning &
-- Development is meant to be the single role handling that functionality —
-- so role_id 7 should never have been introduced.
--
-- This script removes the erroneous role_id=7 assignments (keeping the
-- correct role_id=5 'L&D Admin / Mentor' for each user) and then removes
-- the now-unused 'Mentor' role definition itself. Safe to run once; will
-- simply affect 0 rows if already cleaned up.
-- ============================================================================

-- Show the problem before fixing (for your own confirmation)
SELECT ur.user_id, u.email, GROUP_CONCAT(r.name ORDER BY ur.id) AS all_roles
FROM user_roles ur
JOIN users u ON u.id = ur.user_id
JOIN roles r ON r.id = ur.role_id
WHERE ur.user_id IN (
  SELECT user_id FROM user_roles GROUP BY user_id HAVING COUNT(*) > 1
)
GROUP BY ur.user_id, u.email;

-- SET SQL_SAFE_UPDATES = 0 avoids Error Code 1175 in MySQL Workbench's
-- default safe-update mode, which blocks UPDATE/DELETE statements whose
-- WHERE/JOIN doesn't directly reference a key column the way these do.
SET SQL_SAFE_UPDATES = 0;

-- Remove the erroneous 'Mentor' (role_id 7) assignment for every user who
-- also holds 'L&D Admin / Mentor' (role_id 5) — keeps role_id 5 only.
DELETE ur7 FROM user_roles ur7
JOIN user_roles ur5 ON ur5.user_id = ur7.user_id AND ur5.role_id = 5
WHERE ur7.role_id = 7;

-- With no users left assigned to it, remove the 'Mentor' role definition —
-- it was never part of your actual 7-role model.
DELETE FROM roles WHERE name = 'Mentor' AND id NOT IN (SELECT DISTINCT role_id FROM user_roles);

SET SQL_SAFE_UPDATES = 1;

-- Verify: every user should now have exactly one role.
SELECT user_id, COUNT(*) AS role_count FROM user_roles GROUP BY user_id HAVING COUNT(*) > 1;
-- ^ should return zero rows if the fix worked.
