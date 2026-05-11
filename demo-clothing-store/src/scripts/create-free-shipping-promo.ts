import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createPromotionsWorkflow, createCampaignsWorkflow } from "@medusajs/medusa/core-flows";

export default async function createFreeShippingPromo({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

    const PROMO_CODE = "FREE_SHIPPING_TIER_1";
    const CAMPAIGN_NAME = "Automatic Free Shipping Campaign";
    const THRESHOLD_AMOUNT = "3000";

    logger.info(`Creating Free Shipping Promotion for orders over ${THRESHOLD_AMOUNT}...`);

    try {
        // 1. Create Campaign
        const { result: campaignResult } = await createCampaignsWorkflow(container).run({
            input: {
                campaignsData: [
                    {
                        name: CAMPAIGN_NAME,
                        campaign_identifier: "CAMP_FREE_SHIP_AUTO_" + Date.now(), // Ensure uniqueness
                    }
                ]
            }
        });

        const campaign = campaignResult[0];
        logger.info(`✅ Created Campaign: ${campaign.name} (${campaign.id})`);

        // 2. Create Promotion linked to Campaign
        const { result: promoResult } = await createPromotionsWorkflow(container).run({
            input: {
                promotionsData: [
                    {
                        code: PROMO_CODE,
                        type: "standard",
                        status: "active",
                        is_automatic: true,
                        campaign_id: campaign.id,
                        application_method: {
                            type: "percentage",
                            value: 100,
                            target_type: "shipping_methods",
                            allocation: "across",
                        },
                        rules: [
                            {
                                attribute: "item_total",
                                operator: "gte",
                                values: [THRESHOLD_AMOUNT],
                            },
                        ],
                    },
                ],
            },
        });

        logger.info(`✅ Successfully created promotion: ${promoResult[0].code}`);
        logger.info(`👉 This promotion is ACTIVE and applies automatically to carts with item_total >= ${THRESHOLD_AMOUNT}`);

    } catch (error) {
        logger.error(`❌ Error creating promotion: ${error.message}`);
        // Log detailed error if available
        if (error.cause) logger.error(JSON.stringify(error.cause, null, 2));
    }
}
