import { model } from "@medusajs/framework/utils"
import ExpenseCategory from "./expense-category"

const Expense = model.define("expense", {
    id: model.id().primaryKey(),
    amount: model.number(),
    description: model.text().nullable(),
    date: model.dateTime(),
    category: model.belongsTo(() => ExpenseCategory, { mappedBy: "expenses" }),
})

export default Expense
