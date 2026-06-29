const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:00888246@46.202.166.178:5433/postgres",
  });
  
  await client.connect();

    console.log("--- Customer Email ---");
    const customerRes = await client.query(`SELECT email FROM "customer" WHERE id = 'cus_01KAWMYV6SX5E3E7E069WH9762'`);
    console.log(customerRes.rows);

    await client.end();
}

run().catch(console.error);
