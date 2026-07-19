const https = require('https');
const http = require('http');
const { performance } = require('perf_hooks');

const PUBLISHABLE_KEY = "pk_288226dc72b3c78d027464853d6d2ce06e4814ef0d32636cfdaed5b0c7b982b4";

function measureUrl(url, headers = {}, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'User-Agent': 'SpeedTest/1.0',
        'Accept-Encoding': 'gzip, deflate, br',
        ...headers
      }
    };

    const start = performance.now();
    let dnsTime = 0, connectTime = 0, ttfb = 0, totalTime = 0;
    let dataSize = 0;
    let statusCode = 0;

    const req = (urlObj.protocol === 'https:' ? https : http).request(options, (res) => {
      ttfb = performance.now() - start;
      statusCode = res.statusCode;

      res.on('data', (chunk) => {
        dataSize += chunk.length;
      });

      res.on('end', () => {
        totalTime = performance.now() - start;
        const encoding = res.headers['content-encoding'] || 'none';
        resolve({
          url,
          statusCode,
          encoding,
          ttfbMs: Math.round(ttfb),
          totalTimeMs: Math.round(totalTime),
          dataSizeBytes: dataSize,
          dataSizeKB: (dataSize / 1024).toFixed(1)
        });
      });
    });

    req.on('socket', (socket) => {
      socket.on('lookup', () => {
        dnsTime = performance.now() - start;
      });
      socket.on('connect', () => {
        connectTime = performance.now() - start;
      });
    });

    req.on('error', (err) => {
      resolve({
        url,
        statusCode: 0,
        error: err.message,
        ttfbMs: -1,
        totalTimeMs: -1,
        dataSizeBytes: 0
      });
    });

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("==========================================");
  console.log("🚀 TESTING PRODUCTION PERFORMANCE");
  console.log("Backend: https://api.zahan.net");
  console.log("Frontend: https://zahan.com.bd");
  console.log("==========================================\n");

  console.log("--- 1. BACKEND API ENDPOINTS ---");
  const backendEndpoints = [
    { name: "Health Check", url: "https://api.zahan.net/health", headers: {} },
    { name: "List Regions", url: "https://api.zahan.net/store/regions", headers: { "x-publishable-api-key": PUBLISHABLE_KEY } },
    { name: "List Collections", url: "https://api.zahan.net/store/collections", headers: { "x-publishable-api-key": PUBLISHABLE_KEY } },
    { name: "List Products (limit=12)", url: "https://api.zahan.net/store/products?limit=12&region_id=reg_01K8E3MYZ1YV2G6P7E84W89123", headers: { "x-publishable-api-key": PUBLISHABLE_KEY } },
    { name: "List Products (Heavy with variants)", url: "https://api.zahan.net/store/products?limit=12&fields=*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,*categories,*collection", headers: { "x-publishable-api-key": PUBLISHABLE_KEY } },
    { name: "List Best Selling", url: "https://api.zahan.net/store/best-selling?limit=12", headers: { "x-publishable-api-key": PUBLISHABLE_KEY } },
  ];

  for (const ep of backendEndpoints) {
    // Run 2 times to check first request vs warm cache request
    const r1 = await measureUrl(ep.url, ep.headers);
    const r2 = await measureUrl(ep.url, ep.headers);
    console.log(`📌 ${ep.name}`);
    console.log(`   URL: ${ep.url}`);
    console.log(`   Req 1 -> Status: ${r1.statusCode} | Encoding: ${r1.encoding} | TTFB: ${r1.ttfbMs}ms | Total: ${r1.totalTimeMs}ms | Size: ${r1.dataSizeKB} KB`);
    console.log(`   Req 2 -> Status: ${r2.statusCode} | Encoding: ${r2.encoding} | TTFB: ${r2.ttfbMs}ms | Total: ${r2.totalTimeMs}ms | Size: ${r2.dataSizeKB} KB`);
    if (r1.error) console.log(`   Error: ${r1.error}`);
    console.log("");
  }

  console.log("--- 2. CREATING CART PERFORMANCE ---");
  const cartRes1 = await measureUrl("https://api.zahan.net/store/carts", { "x-publishable-api-key": PUBLISHABLE_KEY, "Content-Type": "application/json" }, "POST", { region_id: "reg_01K8E3MYZ1YV2G6P7E84W89123" });
  console.log(`📌 Create Cart (POST /store/carts)`);
  console.log(`   Status: ${cartRes1.statusCode} | TTFB: ${cartRes1.ttfbMs}ms | Total: ${cartRes1.totalTimeMs}ms | Size: ${cartRes1.dataSizeKB} KB\n`);

  console.log("--- 3. FRONTEND STOREFRONT PAGES ---");
  const storefrontPages = [
    { name: "Home Page (/) ", url: "https://zahan.com.bd/" },
    { name: "BD Home Page (/bd)", url: "https://zahan.com.bd/bd" },
    { name: "BD Store Catalog (/bd/store)", url: "https://zahan.com.bd/bd/store" },
    { name: "BD Cart Page (/bd/cart)", url: "https://zahan.com.bd/bd/cart" },
  ];

  for (const page of storefrontPages) {
    const r1 = await measureUrl(page.url);
    const r2 = await measureUrl(page.url);
    console.log(`📌 ${page.name}`);
    console.log(`   URL: ${page.url}`);
    console.log(`   Req 1 -> Status: ${r1.statusCode} | TTFB: ${r1.ttfbMs}ms | Total: ${r1.totalTimeMs}ms | Size: ${r1.dataSizeKB} KB`);
    console.log(`   Req 2 -> Status: ${r2.statusCode} | TTFB: ${r2.ttfbMs}ms | Total: ${r2.totalTimeMs}ms | Size: ${r2.dataSizeKB} KB`);
    if (r1.error) console.log(`   Error: ${r1.error}`);
    console.log("");
  }
}

runTests().catch(console.error);
