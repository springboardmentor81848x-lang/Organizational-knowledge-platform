const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || process.env.DB_URL || 'postgresql://postgres:password@localhost:5432/knowledgeiq';

async function migrate() {
  const client = new Client({ connectionString });
  console.log('Connecting to Supabase PostgreSQL...');
  await client.connect();
  console.log('Connected successfully!');

  try {
    await client.query('BEGIN');

    // 1. Create organizations table
    console.log('Creating organizations table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(150) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Check and add organization_id to departments table
    console.log('Adding organization_id to departments table...');
    const deptCols = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'departments' AND column_name = 'organization_id'
    `);
    if (deptCols.rows.length === 0) {
      await client.query(`
        ALTER TABLE departments ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE
      `);
    }

    // 3. Check and add organization_id to users table
    console.log('Adding organization_id to users table...');
    const userCols = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'organization_id'
    `);
    if (userCols.rows.length === 0) {
      await client.query(`
        ALTER TABLE users ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL
      `);
    }

    // Add manager_id to users table if missing
    console.log('Adding manager_id to users table...');
    const managerCols = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'manager_id'
    `);
    if (managerCols.rows.length === 0) {
      await client.query(`
        ALTER TABLE users ADD COLUMN manager_id UUID REFERENCES users(id) ON DELETE SET NULL
      `);
    }

    // 4. Migrate/Seed companies/organizations
    console.log('Migrating existing companies to organizations...');
    
    // Seed default organization "KnowledgeIQ Enterprise" if not exists
    await client.query(`
      INSERT INTO organizations (name, description)
      VALUES ('KnowledgeIQ Enterprise', 'Default system organization')
      ON CONFLICT (name) DO NOTHING
    `);

    // Get the ID of the default organization
    const defaultOrgRes = await client.query(`
      SELECT id FROM organizations WHERE name = 'KnowledgeIQ Enterprise'
    `);
    const defaultOrgId = defaultOrgRes.rows[0].id;

    // Set any departments with null organization_id to default
    await client.query(`
      UPDATE departments SET organization_id = $1 WHERE organization_id IS NULL
    `, [defaultOrgId]);

    // Find other unique company names in users and create organizations for them
    const companiesRes = await client.query(`
      SELECT DISTINCT company FROM users WHERE company IS NOT NULL AND company <> '' AND company <> 'KnowledgeIQ Enterprise'
    `);
    for (const row of companiesRes.rows) {
      await client.query(`
        INSERT INTO organizations (name, description)
        VALUES ($1, 'Migrated organization')
        ON CONFLICT (name) DO NOTHING
      `, [row.company]);
    }

    // Map all users' organization_id based on their company text
    console.log('Mapping users to their new organization IDs...');
    await client.query(`
      UPDATE users u
      SET organization_id = o.id
      FROM organizations o
      WHERE LOWER(u.company) = LOWER(o.name) AND u.organization_id IS NULL
    `);

    // Set fallback default for any user still missing organization_id
    await client.query(`
      UPDATE users SET organization_id = $1 WHERE organization_id IS NULL
    `, [defaultOrgId]);

    // 5. Drop global UNIQUE constraint on department name and make it unique per organization
    console.log('Updating unique constraints on departments...');
    await client.query(`
      ALTER TABLE departments DROP CONSTRAINT IF EXISTS departments_name_key
    `);
    await client.query(`
      ALTER TABLE departments DROP CONSTRAINT IF EXISTS unique_dept_per_org
    `);
    await client.query(`
      ALTER TABLE departments ADD CONSTRAINT unique_dept_per_org UNIQUE (name, organization_id)
    `);

    await client.query('COMMIT');
    console.log('Migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed, rolled back changes:', error);
    throw error;
  } finally {
    await client.end();
  }
}

migrate();
