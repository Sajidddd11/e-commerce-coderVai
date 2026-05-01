import { model } from "@medusajs/framework/utils"

export const PerfumeVolume = model.define("perfume_volume", {
    id: model.id().primaryKey(),
    volume_ml: model.number(),
    bottles: model.hasMany(() => PerfumeBottle, { mappedBy: "volume" }),
})

export const PerfumeBottle = model.define("perfume_bottle", {
    id: model.id().primaryKey(),
    name: model.text(),
    base_price: model.number(),
    image_url: model.text().nullable(),
    volume: model.belongsTo(() => PerfumeVolume, {
        mappedBy: "bottles",
    }),
})
