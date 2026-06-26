import { ExecArgs } from "@medusajs/framework/types"
import * as coreFlows from "@medusajs/medusa/core-flows"

export default async function testCoreFlows({ container }: ExecArgs) {
    const logger = container.resolve("logger")
    const cartKeys = Object.keys(coreFlows).filter(k => k.toLowerCase().includes("cart"))
    logger.info(`Cart keys in core-flows: ${cartKeys.join(", ")}`)
}
