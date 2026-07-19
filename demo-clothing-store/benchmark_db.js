const { Client } = require('pg');

async function benchmark() {
  const connectionString = "postgresql://postgres:00888246@46.202.166.178:5433/postgres";
  console.log("Connecting to database:", "46.202.166.178:5433");

  const startConnect = Date.now();
  const client = new Client({ connectionString });
  await client.connect();
  const connectTime = Date.now() - startConnect;
  console.log(`Connection time: ${connectTime}ms`);

  // Run SELECT 1 ten times and calculate average latency
  let totalSelect1Time = 0;
  const iterations = 10;
  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    await client.query('SELECT 1');
    const elapsed = Date.now() - start;
    totalSelect1Time += elapsed;
    console.log(`  SELECT 1 iteration ${i + 1}: ${elapsed}ms`);
  }
  const avgSelect1 = totalSelect1Time / iterations;
  console.log(`Average SELECT 1 (network RTT): ${avgSelect1.toFixed(2)}ms`);

  // Query products count
  const startProd = Date.now();
  const prodRes = await client.query('SELECT COUNT(*) FROM product');
  const prodTime = Date.now() - startProd;
  console.log(`Query products count: ${prodTime}ms (Count: ${prodRes.rows[0].count})`);

  // Query product variants count
  const startVar = Date.now();
  const varRes = await client.query('SELECT COUNT(*) FROM product_variant');
  const varTime = Date.now() - startVar;
  console.log(`Query variants count: ${varTime}ms (Count: ${varRes.rows[0].count})`);

  // Query indexes check
  const startIndex = Date.now();
  const indexRes = await client.query(`
    SELECT COUNT(*) FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
  `);
  const indexTime = Date.now() - startIndex;
  console.log(`Query custom indexes: ${indexTime}ms (Count: ${indexRes.rows[0].count})`);

  await client.end();
}

benchmark().catch(console.error);
