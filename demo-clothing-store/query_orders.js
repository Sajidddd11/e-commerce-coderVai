const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:00888246@46.202.166.178:5433/postgres",
  });
  
  await client.connect();

  console.log("--- Orders ---");
  const orders = await client.query(`SELECT id, customer_id, metadata, created_at FROM "order" ORDER BY created_at DESC LIMIT 5`);
  console.log(orders.rows);

  await client.end();
}

run().catch(console.error);
