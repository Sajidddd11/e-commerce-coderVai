import { model } from "@medusajs/framework/utils"
import Expense from "./expense"

const ExpenseCategory = model.define("expense_category", {
    id: model.id().primaryKey(),
    name: model.text().unique(),
    description: model.text().nullable(),
    expenses: model.hasMany(() => Expense, { mappedBy: "category" }),
})

export default ExpenseCategory
