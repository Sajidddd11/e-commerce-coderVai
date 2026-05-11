import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function ({ container }: { container: any }) {
    console.log("📦 Auditing Recent Orders...");

    const pgConnection = container.resolve(ContainerRegistrationKeys.PG_CONNECTION);

    try {
        const res = await pgConnection.raw(`
      SELECT 
        id, 
        status, 
        created_at
      FROM "order"
      ORDER BY created_at DESC
      LIMIT 10;
    `);

        if (res.rows.length === 0) {
            console.log("⚠️ No orders found.");
        } else {
            console.table(res.rows);
            console.log("\n💡 Reminder: 'pending' orders are EXCLUDED.");
        }
    } catch (err) {
        console.error("❌ Error:", err);
    }
}
