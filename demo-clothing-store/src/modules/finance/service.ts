import { MedusaService } from "@medusajs/framework/utils"
import VariantBuyingPrice from "./models/variant-buying-price"
import ExpenseCategory from "./models/expense-category"
import Expense from "./models/expense"

class FinanceModuleService extends MedusaService({
    VariantBuyingPrice,
    ExpenseCategory,
    Expense,
}) {}

export default FinanceModuleService
