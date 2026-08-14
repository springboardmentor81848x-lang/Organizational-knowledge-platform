import pool from './db.js';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  const client = await pool.connect();
  try {
    console.log('🌱 Seeding database for Milestone 1...');
    await client.query('BEGIN');

    // 1. Clear existing data in correct FK order
    await client.query(`
      TRUNCATE TABLE 
        employee_skills, 
        role_skill_benchmarks, 
        skill_gaps, 
        course_enrollments, 
        assessments, 
        notifications, 
        users, 
        roles, 
        departments, 
        skills, 
        skill_categories 
      CASCADE;
    `);

    // 2. Insert Departments
    console.log('Inserting departments...');
    const deptRes = await client.query(`
      INSERT INTO departments (name, description) VALUES
      ('Engineering', 'Software Development, System Architecture, & Cloud Infrastructure'),
      ('Product', 'Product Management, Strategy, & UX Design'),
      ('HR & Operations', 'People Management, Workforce Analytics, & Talent Development'),
      ('Sales & Marketing', 'Account Management, Growth, & Customer Engagement'),
      ('Data & Analytics', 'Data Science, Business Intelligence, & Machine Learning')
      RETURNING id, name;
    `);

    const depts = {};
    deptRes.rows.forEach(row => { depts[row.name] = row.id; });

    // 3. Insert Roles
    console.log('Inserting roles...');
    const roleRes = await client.query(`
      INSERT INTO roles (title, department_id, description) VALUES
      ('Senior Product Engineer', '${depts['Engineering']}', 'Full-stack development, cloud architecture, system design'),
      ('Software Engineer', '${depts['Engineering']}', 'Core application development, feature delivery & APIs'),
      ('Junior Developer', '${depts['Engineering']}', 'Frontend components, bug fixes, & learning path progression'),
      ('HR Operations Lead', '${depts['HR & Operations']}', 'Org-wide skills intelligence and workforce analytics'),
      ('Platform Administrator', '${depts['Engineering']}', 'System administration, security, and platform health'),
      ('Account Executive', '${depts['Sales & Marketing']}', 'Enterprise sales and customer relationships'),
      ('Data Analyst', '${depts['Data & Analytics']}', 'Business metrics, SQL analytics, and reporting')
      RETURNING id, title;
    `);

    const rolesMap = {};
    roleRes.rows.forEach(row => { rolesMap[row.title] = row.id; });

    // 4. Insert Users
    console.log('Inserting users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const userRes = await client.query(`
      INSERT INTO users (email, password_hash, full_name, system_role, department_id, role_id, avatar_url, is_active) VALUES
      ('ava.chen@northwind.io', '${hashedPassword}', 'Ava Chen', 'EMPLOYEE', '${depts['Engineering']}', '${rolesMap['Senior Product Engineer']}', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', true),
      ('marcus.lee@northwind.io', '${hashedPassword}', 'Marcus Lee', 'MANAGER', '${depts['Engineering']}', '${rolesMap['Senior Product Engineer']}', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', true),
      ('liam.harper@northwind.io', '${hashedPassword}', 'Liam Harper', 'EMPLOYEE', '${depts['Engineering']}', '${rolesMap['Software Engineer']}', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', true),
      ('chloe.adams@northwind.io', '${hashedPassword}', 'Chloe Adams', 'EMPLOYEE', '${depts['Engineering']}', '${rolesMap['Junior Developer']}', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', true),
      ('priya.nair@northwind.io', '${hashedPassword}', 'Priya Nair', 'HR_SPECIALIST', '${depts['HR & Operations']}', '${rolesMap['HR Operations Lead']}', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', true),
      ('noah.bennett@northwind.io', '${hashedPassword}', 'Noah Bennett', 'SYSTEM_ADMIN', '${depts['Engineering']}', '${rolesMap['Platform Administrator']}', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', true)
      RETURNING id, email, system_role, full_name;
    `);

    const usersMap = {};
    userRes.rows.forEach(row => { usersMap[row.email] = row.id; });

    // Update department manager
    await client.query(`UPDATE departments SET manager_id = '${usersMap['priya.nair@northwind.io']}' WHERE id = '${depts['HR & Operations']}'`);

    // 5. Insert Skill Categories
    console.log('Inserting skill categories...');
    const catRes = await client.query(`
      INSERT INTO skill_categories (name, description) VALUES
      ('Frontend & UI', 'Web user interface, component frameworks, & design systems'),
      ('Architecture & Systems', 'System design, scalability, & distributed systems'),
      ('Cloud & Infrastructure', 'AWS, DevOps, Docker, & Kubernetes'),
      ('Data & Analytics', 'Database management, SQL tuning, & big data'),
      ('Security & Compliance', 'Threat modeling, web security, & identity management'),
      ('Artificial Intelligence', 'Machine learning, prompt engineering, & neural networks')
      RETURNING id, name;
    `);

    const catsMap = {};
    catRes.rows.forEach(row => { catsMap[row.name] = row.id; });

    // 6. Insert Skills
    console.log('Inserting skills...');
    const skillRes = await client.query(`
      INSERT INTO skills (category_id, name, description) VALUES
      ('${catsMap['Frontend & UI']}', 'React', 'Modern React, hooks, state management & performance'),
      ('${catsMap['Architecture & Systems']}', 'System Design', 'Scalable systems, microservices & design patterns'),
      ('${catsMap['Cloud & Infrastructure']}', 'Cloud / AWS', 'AWS services, EC2, S3, IAM, & cloud architecture'),
      ('${catsMap['Data & Analytics']}', 'Data / SQL', 'Complex queries, indexing, PostgreSQL & data modeling'),
      ('${catsMap['Security & Compliance']}', 'Security', 'Web security, JWT, OWASP Top 10 & encryption'),
      ('${catsMap['Artificial Intelligence']}', 'AI / ML', 'Machine learning fundamentals, Python & PyTorch')
      RETURNING id, name;
    `);

    const skillsMap = {};
    skillRes.rows.forEach(row => { skillsMap[row.name] = row.id; });

    // 7. Insert Employee Skills for Ava Chen
    console.log('Inserting employee skills...');
    const avaId = usersMap['ava.chen@northwind.io'];

    await client.query(`
      INSERT INTO employee_skills (user_id, skill_id, current_proficiency) VALUES
      ('${avaId}', '${skillsMap['React']}', 'Expert'),
      ('${avaId}', '${skillsMap['System Design']}', 'Advanced'),
      ('${avaId}', '${skillsMap['Cloud / AWS']}', 'Intermediate'),
      ('${avaId}', '${skillsMap['Data / SQL']}', 'Intermediate'),
      ('${avaId}', '${skillsMap['Security']}', 'Beginner'),
      ('${avaId}', '${skillsMap['AI / ML']}', 'Beginner');
    `);

    // 8. Insert Role Skill Benchmarks (Competency Framework)
    console.log('Inserting role skill benchmarks...');
    const engRoleId = rolesMap['Senior Product Engineer'];

    await client.query(`
      INSERT INTO role_skill_benchmarks (role_id, skill_id, required_proficiency, is_critical) VALUES
      ('${engRoleId}', '${skillsMap['React']}', 'Expert', true),
      ('${engRoleId}', '${skillsMap['System Design']}', 'Advanced', true),
      ('${engRoleId}', '${skillsMap['Cloud / AWS']}', 'Advanced', true),
      ('${engRoleId}', '${skillsMap['Data / SQL']}', 'Intermediate', false),
      ('${engRoleId}', '${skillsMap['Security']}', 'Intermediate', true),
      ('${engRoleId}', '${skillsMap['AI / ML']}', 'Intermediate', false);
    `);

    // 9. Insert Notifications
    console.log('Inserting notifications...');
    await client.query(`
      INSERT INTO notifications (user_id, type, title, message, is_read) VALUES
      ('${avaId}', 'Deadline', 'Assessment Scheduled', 'Cloud Architecture — Level 2 is scheduled for Aug 12', false),
      ('${avaId}', 'Recommendation', 'AI Recommendation', 'New course recommended: Applied Machine Learning', false),
      ('${avaId}', 'Milestone', 'Assessment Passed', 'Passed Assessment: React Performance', true);
    `);

    await client.query('COMMIT');
    console.log('🎉 Milestone 1 database seeding completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

seedDatabase();
