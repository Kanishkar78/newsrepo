/**
 * Automated Database Setup & Initializer for PostgreSQL ('newsdb')
 * Creates the 'newsdb' database if missing, applies schema, and seeds data.
 */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

function getCredentials() {
  let dbUrl = process.env.DATABASE_URL || '';
  let user = process.env.PGUSER || 'postgres';
  let password = process.env.PGPASSWORD || '';
  let host = process.env.PGHOST || 'localhost';
  let port = parseInt(process.env.PGPORT, 10) || 5432;
  let database = process.env.PGDATABASE || 'newsdb';

  if (dbUrl && dbUrl.includes('://')) {
    try {
      const parsed = new URL(dbUrl);
      user = decodeURIComponent(parsed.username) || user;
      password = decodeURIComponent(parsed.password) || password;
      host = parsed.hostname || host;
      port = parseInt(parsed.port, 10) || port;
      if (parsed.pathname && parsed.pathname.length > 1) {
        database = parsed.pathname.substring(1);
      }
    } catch (_) {}
  }

  // Explicit PGPASSWORD always takes precedence as plaintext
  if (process.env.PGPASSWORD) {
    password = process.env.PGPASSWORD;
  }

  return { user, password, host, port, database, dbUrl };
}

async function setup() {
  console.log('====================================================');
  console.log(' PulseNews: PostgreSQL Database Setup');
  console.log(' Target Database: newsdb');
  console.log('====================================================\n');

  const { user, password, host, port, database } = getCredentials();

  if (!password || password === 'your_password_here') {
    console.error('❌ Error: PostgreSQL password is not configured yet in .env');
    console.error('\nPlease open the .env file in this directory and replace "your_password_here"');
    console.error('with your actual PostgreSQL password:\n');
    console.error('  PGPASSWORD=your_actual_password');
    console.error('  DATABASE_URL=postgresql://postgres:your_actual_password@localhost:5432/newsdb\n');
    console.error('Then run this setup again: npm run db:setup\n');
    process.exit(1);
  }

  console.log(`Connecting to PostgreSQL server at ${host}:${port} as user "${user}"...`);

  // Step 1: Connect to maintenance database 'postgres' to check/create 'newsdb'
  const adminClient = new Client({
    user,
    password,
    host,
    port,
    database: 'postgres',
    ssl: false
  });

  try {
    await adminClient.connect();
    console.log('✅ Connected to PostgreSQL server successfully.');

    const checkRes = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [database]
    );

    if (checkRes.rows.length === 0) {
      console.log(`Database "${database}" does not exist. Creating "${database}"...`);
      // CREATE DATABASE cannot run inside a transaction block
      await adminClient.query(`CREATE DATABASE "${database}";`);
      console.log(`✅ Database "${database}" created successfully!`);
    } else {
      console.log(`ℹ️ Database "${database}" already exists.`);
    }
  } catch (err) {
    if (err.code === '28P01') {
      console.error('\n❌ Authentication Failed (28P01): Password for user "' + user + '" is incorrect.');
      console.error('Please verify your password in the .env file and try again.\n');
    } else {
      console.error('\n❌ PostgreSQL Connection Error:', err.message);
    }
    await adminClient.end().catch(() => {});
    process.exit(1);
  } finally {
    await adminClient.end().catch(() => {});
  }

  // Step 2: Connect directly to 'newsdb' to apply schema and seed
  console.log(`\nConnecting to "${database}" to verify tables and schema...`);
  const dbClient = new Client({
    user,
    password,
    host,
    port,
    database,
    ssl: false
  });

  try {
    await dbClient.connect();
    console.log(`✅ Connected to "${database}".`);

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await dbClient.query(schemaSql);
    console.log('✅ Schema and performance indexes verified in "news" table.');

    // Step 3: Run seed logic if table is empty
    const countRes = await dbClient.query('SELECT COUNT(*) FROM news;');
    let count = parseInt(countRes.rows[0].count, 10);
    console.log(`Current article count in "${database}": ${count}`);

    if (count === 0) {
      console.log('Seeding initial curated news articles into "newsdb"...');
      const seedPath = path.join(__dirname, 'seed.sql');
      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        await dbClient.query(seedSql);
        const newCountRes = await dbClient.query('SELECT COUNT(*) FROM news;');
        count = parseInt(newCountRes.rows[0].count, 10);
        console.log(`✅ Seeded ${count} initial articles across all categories!`);
      }
    }

    console.log('\n====================================================');
    console.log(`🎉 SUCCESS: PostgreSQL "newsdb" is completely configured!`);
    console.log(` Total Articles: ${count}`);
    console.log(` Connection URL: postgresql://${user}:***@${host}:${port}/${database}`);
    console.log(' All live news, regional editions, and photos will now');
    console.log(' be automatically persisted in your PostgreSQL database.');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ Error applying schema or seed to database:', err.message);
    process.exit(1);
  } finally {
    await dbClient.end().catch(() => {});
  }
}

if (require.main === module) {
  setup().catch((err) => {
    console.error('Fatal error in setup:', err);
    process.exit(1);
  });
}

module.exports = { setup, getCredentials };
