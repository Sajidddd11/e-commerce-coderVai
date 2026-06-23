import { MikroORM } from "@mikro-orm/postgresql";

async function main() {
  const orm = await MikroORM.init({
    dbName: "demo_clothing_store",
    user: "postgres",
    password: "",
    host: "localhost",
    port: 5432,
    discovery: { warnWhenNoEntities: false },
    entities: []
  });

  const em = orm.em.fork();
  const conn = em.getConnection();

  const customerId = "cus_01KAWMYV6SX5E3E7E069WH9762";
  
  const customerEvents = await conn.execute(`SELECT id, customer_id, session_id, fingerprint_id, event_type FROM behaviour_event WHERE customer_id = '${customerId}'`);
  console.log(`Events for customer ${customerId}:`, customerEvents.length);

  const sessionEvents = await conn.execute(`SELECT id, customer_id, session_id, fingerprint_id, event_type FROM behaviour_event WHERE session_id = 'sess_0977a586d97b4f27b95d'`);
  console.log(`Events for session sess_0977a586d97b4f27b95d:`, sessionEvents.length);

  const fpEvents = await conn.execute(`SELECT id, customer_id, session_id, fingerprint_id, event_type FROM behaviour_event WHERE fingerprint_id = 'a0754784f3ad89703f588612d69a6b2e'`);
  console.log(`Events for fingerprint a0754784f3ad89703f588612d69a6b2e:`, fpEvents.length);

  await orm.close();
}

main().catch(console.error);
