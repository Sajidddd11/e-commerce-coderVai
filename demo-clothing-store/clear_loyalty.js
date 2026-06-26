const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:00888246@46.202.166.178:5433/postgres",
  });
  
  await client.connect();

  console.log("Clearing loyalty history...");
  await client.query(`TRUNCATE TABLE loyalty_history CASCADE`);

  console.log("Clearing loyalty accounts...");
  await client.query(`TRUNCATE TABLE loyalty_account CASCADE`);

  console.log("Clearing dynamic loyalty promotions...");
  // Delete from promotion_application_method first to satisfy FKs if not cascading
  await client.query(`DELETE FROM promotion_application_method WHERE promotion_id IN (SELECT id FROM promotion WHERE code LIKE 'LOYALTY-%')`);
  const deletePromos = await client.query(`DELETE FROM promotion WHERE code LIKE 'LOYALTY-%'`);
  console.log(`Deleted ${deletePromos.rowCount} dynamic loyalty promotions.`);

  console.log("All loyalty rewards data has been cleared successfully!");

  await client.end();
}

run().catch(console.error);
