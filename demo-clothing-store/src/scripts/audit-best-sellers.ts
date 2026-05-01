import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function ({ container }: { container: any }) {
  console.log("🔍 Auditing Best Selling Products (Including Deleted/Drafts)...");

  const pgConnection = container.resolve(ContainerRegistrationKeys.PG_CONNECTION);

  try {
    const res = await pgConnection.raw(`
      SELECT 
        p.title as "Product",
        p.status as "Status",
        p.deleted_at as "Deleted At",
        SUM(oi.quantity) as "Total Sold",
        oli.product_id
      FROM order_line_item oli
      INNER JOIN order_item oi ON oli.id = oi.item_id
      INNER JOIN "order" o ON oi.order_id = o.id
      INNER JOIN product p ON oli.product_id = p.id
      WHERE o.status NOT IN ('canceled')
        AND oli.product_id IS NOT NULL
      GROUP BY oli.product_id, p.title, p.status, p.deleted_at
      ORDER BY "Total Sold" DESC
      LIMIT 20;
    `);

    if (res.rows.length === 0) {
      console.log("⚠️ No sales found at all.");
    } else {
      console.table(res.rows);
      console.log("\n💡 NOTE: If 'Deleted At' is not null, or 'Status' is not 'published', the product will NOT appear in the Best Selling list.");
    }
  } catch (err) {
    console.error("❌ Error:", err);
  }
}
