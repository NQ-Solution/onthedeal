const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  connectionString: 'postgresql://postgres:Gv1Rtq5DOf9YLCfR@db.fimerhqikavzjhtulapj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function setupDatabase() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected!');

    const schemaPath = path.join(__dirname, '../supabase/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema...');
    await client.query(schema);
    console.log('Schema created successfully!');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

setupDatabase();
