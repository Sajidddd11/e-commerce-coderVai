const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:00888246@46.202.166.178:5433/postgres",
  });
  
  await client.connect();

  const fp = "a0754784f3ad89703f588612d69a6b2e";
  
  const evs = await client.query(`
    SELECT id, fingerprint_id, customer_id, event_type 
    FROM behaviour_event 
    WHERE fingerprint_id = $1
  `, [fp]);

  console.log(`Events for fingerprint ${fp}:`, evs.rows.length);
  if (evs.rows.length > 0) {
      console.log("Sample:", evs.rows[0]);
  }

  await client.end();
}

run().catch(console.error);
