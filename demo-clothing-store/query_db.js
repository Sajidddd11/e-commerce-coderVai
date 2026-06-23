const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:00888246@46.202.166.178:5433/postgres",
  });
  
  await client.connect();

  const customerId = "cus_01KAWMYV6SX5E3E7E069WH9762";
  
  console.log("Checking events for customer:", customerId);
  
  const customerEvents = await client.query(`SELECT id, session_id, fingerprint_id, event_type FROM behaviour_event WHERE customer_id = $1`, [customerId]);
  console.log("Customer events count:", customerEvents.rows.length);
  if (customerEvents.rows.length > 0) {
      console.log("Sample customer events:", customerEvents.rows.slice(0, 3));
  }

  // Also let's find all events for this specific session or fingerprint to see if there are any that were NOT merged
  const sessionEvents = await client.query(`SELECT id, session_id, customer_id, event_type FROM behaviour_event WHERE session_id = 'sess_ae01810d9ab54e088b49'`);
  console.log("\nSession sess_ae01810d9ab54e088b49 events count:", sessionEvents.rows.length);
  if (sessionEvents.rows.length > 0) {
      console.log("Sample session events:", sessionEvents.rows.slice(0, 3));
  }

  const fpEvents = await client.query(`SELECT id, fingerprint_id, customer_id, event_type FROM behaviour_event WHERE fingerprint_id = 'a0754784f3ad89703f588612d69a6b2e'`);
  console.log("\nFingerprint a0754784f3ad89703f588612d69a6b2e events count:", fpEvents.rows.length);
  if (fpEvents.rows.length > 0) {
      console.log("Sample fingerprint events:", fpEvents.rows.slice(0, 3));
  }
  
  // Total events in the whole table to check if tracking works at all
  const total = await client.query('SELECT count(*) FROM behaviour_event');
  console.log("\nTotal behaviour_event rows:", total.rows[0].count);

  await client.end();
}

run().catch(console.error);
