import { model } from "@medusajs/framework/utils"

const DeleteLog = model.define("delete_log", {
    id: model.id().primaryKey(),
    // What was deleted
    entity_type: model.text(),          // e.g. "product", "blog_post", "hero_slide", "review", "customer"
    entity_id: model.text(),            // the deleted record's ID
    entity_label: model.text().nullable(), // human-readable name/title at time of deletion
    // Who deleted it
    actor_id: model.text(),
    actor_email: model.text().nullable(),
    actor_name: model.text().nullable(),
    // Context
    url: model.text(),                  // full request URL
    metadata: model.json().nullable(),  // any extra info
})

export default DeleteLog
