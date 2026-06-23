const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:00888246@46.202.166.178:5433/postgres",
  });
  
  await client.connect();

  const customerId = "cus_01KAWMYV6SX5E3E7E069WH9762";
  
  const recentEvents = await client.query(`
    SELECT category_id, event_type, product_id 
    FROM behaviour_event 
    WHERE customer_id = $1 AND deleted_at IS NULL
    ORDER BY created_at DESC 
    LIMIT 60
  `, [customerId]);

  const categoryScores = new Map();
  const purchasedProductIds = new Set();

  for (const ev of recentEvents.rows) {
      const score = 1; // Assuming detail_view is 1
      if (ev.category_id) {
          categoryScores.set(ev.category_id, (categoryScores.get(ev.category_id) || 0) + score);
      }
      if (ev.event_type === "purchase") purchasedProductIds.add(ev.product_id);
  }

  const topCategoryIds = Array.from(categoryScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

  console.log("Top categories:", topCategoryIds);
  
  if (topCategoryIds.length > 0) {
      const placeholders = topCategoryIds.map((_, i) => `$${i+1}`).join(',');
      const categoryEvents = await client.query(`
          SELECT product_id 
          FROM behaviour_event 
          WHERE category_id IN (${placeholders}) AND deleted_at IS NULL
          ORDER BY created_at DESC 
          LIMIT 200
      `, topCategoryIds);

      const seen = new Set();
      const result = [];
      for (const ev of categoryEvents.rows) {
          if (!purchasedProductIds.has(ev.product_id) && !seen.has(ev.product_id)) {
              seen.add(ev.product_id);
              result.push(ev.product_id);
          }
      }
      console.log("Personalised product IDs count:", result.length);
      console.log("Is it < 20?", result.length < 20);
  } else {
      console.log("No categories found");
  }

  await client.end();
}

run().catch(console.error);
