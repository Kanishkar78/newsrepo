const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function runSeed() {
  const dbUrl = process.env.DATABASE_URL || '';
  const pwd = process.env.PGPASSWORD || '';

  if (!dbUrl || dbUrl.includes('your_password_here') || pwd === 'your_password_here') {
    console.log('⚠️ Please configure your PostgreSQL password in .env before seeding.');
    console.log('Run: npm run db:setup');
    return;
  }

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: process.env.NODE_ENV === 'production' || dbUrl.includes('neon.tech') 
      ? { rejectUnauthorized: false } 
      : false
  });

  try {
    console.log('Connecting to PostgreSQL database "newsdb"...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');

    console.log('Applying schema...');
    await pool.query(schemaSql);

    console.log('Applying seed data...');
    await pool.query(seedSql);

    const countRes = await pool.query('SELECT COUNT(*) FROM news;');
    console.log(`✅ Database "newsdb" seeded successfully! Total rows: ${countRes.rows[0].count}`);
  } catch (err) {
    console.error('❌ Error seeding database:', err.message);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runSeed();
}

module.exports = { runSeed };
