const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:00888246@46.202.166.178:5433/postgres",
  });
  
  await client.connect();

    console.log("--- Notifications Count ---");
    const countRes = await client.query(`SELECT COUNT(*) FROM "customer_notification"`);
    console.log(countRes.rows);

    console.log("--- Notifications ---");
    const notifications = await client.query(`SELECT id, customer_id, title, status, created_at FROM "customer_notification" ORDER BY created_at DESC LIMIT 10`);
    console.log(notifications.rows);

    await client.end();
}

run().catch(console.error);
