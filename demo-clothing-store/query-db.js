const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:00888246@46.202.166.178:5433/postgres'
});

async function run() {
  await client.connect();
  const res = await client.query('SELECT * FROM shipping_option_rule');
  console.log(res.rows);
  await client.end();
}

run().catch(console.error);
