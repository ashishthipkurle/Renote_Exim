const { Client } = require('pg');

const configs = [
  {
    name: 'Standard Nhost Format (postgres db)',
    connectionString: 'postgresql://postgres:GAGpUasKeUQ5S8GC@ischyvihgnfuncrkopph.db.ap-south-1.nhost.run:5432/postgres?sslmode=require'
  },
  {
    name: 'Subdomain as DB name',
    connectionString: 'postgresql://postgres:GAGpUasKeUQ5S8GC@ischyvihgnfuncrkopph.db.ap-south-1.nhost.run:5432/ischyvihgnfuncrkopph?sslmode=require'
  },
  {
    name: 'Nhost Format (postgres db) - verify-full',
    connectionString: 'postgresql://postgres:GAGpUasKeUQ5S8GC@ischyvihgnfuncrkopph.db.ap-south-1.nhost.run:5432/postgres?sslmode=verify-full'
  },
   {
    name: 'Old Nhost Format (Ashish password)',
    connectionString: 'postgresql://postgres:Ashish%4012345Nhost@ischyvihgnfuncrkopph.db.ap-south-1.nhost.run:5432/postgres?sslmode=require'
  }
];

async function testConfig(config) {
  console.log(`\n--- Testing: ${config.name} ---`);
  const client = new Client({
    connectionString: config.connectionString,
  });

  try {
    await client.connect();
    console.log('SUCCESS!');
    const res = await client.query('SELECT current_database(), current_user');
    console.log('Results:', res.rows[0]);
    await client.end();
    return true;
  } catch (err) {
    console.error('FAILED:', err.message);
    return false;
  }
}

async function runAll() {
  for (const config of configs) {
    const success = await testConfig(config);
    if (success) {
        console.log('\n!!! FOUND WORKING CONNECTION !!!');
        console.log('Use this string:', config.connectionString);
        break;
    }
  }
}

runAll();
