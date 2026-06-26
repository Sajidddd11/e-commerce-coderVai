const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:00888246@46.202.166.178:5433/postgres",
  });
  
  await client.connect();

  console.log("--- Promotion Application Methods ---");
  const methods = await client.query(`SELECT id, promotion_id, type, value, currency_code, target_type, allocation FROM promotion_application_method`);
  console.log(methods.rows);

  console.log("\n--- Promotions ---");
  const promos = await client.query(`SELECT id, code, type, status FROM promotion`);
  console.log(promos.rows);

  await client.end();
}

run().catch(console.error);
