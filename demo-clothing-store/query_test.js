const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:00888246@46.202.166.178:5433/postgres",
  });
  
  await client.connect();

  const customerId = "cus_01KAWMYV6SX5E3E7E069WH9762";
  
  // What does getPersonalised do?
  // It fetches events, filters them, finds categories, and then fetches products in those categories.
  const recentEvents = await client.query(`
    SELECT category_id, event_type, product_id 
    FROM behaviour_event 
    WHERE customer_id = $1 AND deleted_at IS NULL
    ORDER BY created_at DESC 
    LIMIT 60
  `, [customerId]);

  console.log("Recent valid events for customer:", recentEvents.rows.length);
  
  let validCategories = 0;
  for (const ev of recentEvents.rows) {
      if (ev.category_id) {
          validCategories++;
      }
  }
  
  console.log("Events with category_id:", validCategories);

  await client.end();
}

run().catch(console.error);
