const { Client } = require('pg');

const projectSubdomain = 'ischyvihgnfuncrkopph';
const password = 'GAGpUasKeUQ5S8GC';
const host = `${projectSubdomain}.db.ap-south-1.nhost.run`;

const permutations = [
  { user: 'postgres', db: 'postgres', ssl: true },
  { user: 'postgres', db: projectSubdomain, ssl: true },
  { user: projectSubdomain, db: 'postgres', ssl: true },
  { user: projectSubdomain, db: projectSubdomain, ssl: true },
  { user: 'postgres', db: 'postgres', ssl: { rejectUnauthorized: false } },
  { user: 'postgres', db: projectSubdomain, ssl: { rejectUnauthorized: false } },
];

async function test(p) {
  const name = `user:${p.user} db:${p.db} ssl:${JSON.stringify(p.ssl)}`;
  console.log(`Testing ${name}...`);
  
  const client = new Client({
    user: p.user,
    host: host,
    database: p.db,
    password: password,
    port: 5432,
    ssl: p.ssl
  });

  try {
    await client.connect();
    console.log(` SUCCESS: Connected as ${p.user} to ${p.db}`);
    await client.end();
    return true;
  } catch (err) {
    console.log(` FAILED: ${err.message}`);
    return false;
  }
}

async function run() {
  for (const p of permutations) {
    if (await test(p)) {
      console.log('\n!!! FOUND IT !!!');
      process.exit(0);
    }
  }
  console.log('\nAll common permutations failed.');
}

run();
