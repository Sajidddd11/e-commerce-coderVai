const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:00888246@46.202.166.178:5433/postgres",
  });
  
  await client.connect();

  console.log("--- Settings ---");
  const settings = await client.query(`SELECT * FROM loyalty_setting`);
  console.log(settings.rows);

  console.log("\n--- Accounts ---");
  const accounts = await client.query(`SELECT * FROM loyalty_account`);
  console.log(accounts.rows);

  console.log("\n--- History ---");
  const history = await client.query(`SELECT * FROM loyalty_history`);
  console.log(history.rows);

  await client.end();
}

run().catch(console.error);
