import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Returns & Refunds | Zahan Fashion and Lifestyle",
    description: "Learn about our return policy, exchange process, and refund procedures.",
}

export default function ReturnsPage() {
    return (
        <div className="content-container py-16">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Returns & Refunds Policy</h1>

                <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
                    <p className="text-lg">
                        At Zahan Fashion and Lifestyle, we want you to be completely satisfied with your purchase. If you&apos;re not happy with your order, we&apos;re here to help with returns and exchanges.
                    </p>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Return Window</h2>
                        <p>
                            You have <strong>7 days</strong> from the date of delivery to return eligible items. Returns requested after 7 days will not be accepted except in cases of manufacturing defects.
                        </p>

                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-4">
                            <p className="font-semibold text-yellow-900 mb-2">⏰ Important Timeline</p>
                            <p className="text-yellow-800">
                                The 7-day return period starts from the date you receive the product, not the order date. Make sure to inspect your items upon delivery!
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Eligibility for Returns</h2>

                        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">Items That Can Be Returned:</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Items with manufacturing defects or damage</li>
                            <li>Wrong item received (different from what you ordered)</li>
                            <li>Size or color mismatch (if we sent the wrong variant)</li>
                            <li>Items that don&apos;t match the product description</li>
                        </ul>

                        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">Return Conditions:</h3>
                        <p>To be eligible for a return, items must meet the following conditions:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Items must be unused, unworn, and unwashed</li>
                            <li>Original tags and labels must be attached</li>
                            <li>Items must be in original packaging (if applicable)</li>
                            <li>No signs of perfume, makeup, or other external substances</li>
                            <li>Accompanied by the original invoice</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Non-Returnable Items</h2>
                        <p>The following items cannot be returned:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Intimate Apparel:</strong> Underwear, lingerie, swimwear (for hygiene reasons)</li>
                            <li><strong>Customized/Personalized Items:</strong> Items made to order or customized per your request</li>
                            <li><strong>Sale Items:</strong> Products purchased during clearance or final sale events (unless defective)</li>
                            <li><strong>Accessories:</strong> Earrings, cosmetics, and other personal care items (unless defective)</li>
                            <li><strong>Gift Cards:</strong> Non-returnable and non-refundable</li>
                            <li><strong>Items Without Tags:</strong> Products with removed or damaged tags</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">How to Return an Item</h2>

                        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">Step 1: Contact Us</h3>
                        <p>Initiate a return by contacting our customer service within 7 days of delivery:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Email: <a href="mailto:support@zahan.com.bd" className="text-blue-600 hover:underline">support@zahan.com.bd</a></li>
                            <li>Phone / WhatsApp: +8801304117711</li>
                        </ul>
                        <p className="mt-3">Provide your order number, reason for return, and photos of the item (if defective/damaged).</p>

                        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">Step 2: Return Authorization</h3>
                        <p>
                            Our team will review your request and provide a Return Authorization (RA) number if approved. You will also receive instructions on how to return the item.
                        </p>

                        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">Step 3: Pack the Item</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Ensure the item is in its original condition with tags attached</li>
                            <li>Include the original invoice in the package</li>
                            <li>Write the RA number clearly on the package</li>
                            <li>Pack securely to prevent damage during transit</li>
                        </ul>

                        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">Step 4: Ship the Item</h3>
                        <p><strong>For Defective/Wrong Items:</strong></p>
                        <ul className="list-disc pl-6 space-y-2 mb-4">
                            <li>We will arrange for pickup at no cost to you</li>
                            <li>Our courier partner will collect the item from your address</li>
                        </ul>

                        <p><strong>For Size/Preference Changes:</strong></p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Customer is responsible for return shipping costs</li>
                            <li>Ship to our return address (provided via email)</li>
                            <li>Use a trackable shipping service</li>
                        </ul>

                        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">Step 5: Inspection & Processing</h3>
                        <p>
                            Once we receive your return, our team will inspect the item (typically within 2-3 business days). We will notify you of the approval or rejection of your refund/exchange.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Exchanges</h2>
                        <p>
                            We happily offer exchanges for size or color variations of the same product, subject to availability.
                        </p>

                        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">Exchange Process:</h3>
                        <ol className="list-decimal pl-6 space-y-2">
                            <li>Contact us with your exchange request</li>
                            <li>Confirm availability of the desired size/color</li>
                            <li>Return the original item following the return process</li>
                            <li>We will ship the exchanged item once we receive and inspect the original</li>
                        </ol>

                        <p className="mt-4">
                            <strong>Exchange Shipping:</strong> If the exchange is due to our error (wrong item sent), we cover all shipping costs. For preference changes, you cover the return shipping, and we cover the shipping of the exchanged item.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Refunds</h2>

                        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">Refund Processing Time</h3>
                        <p>
                            Once your return is approved, refunds will be processed within <strong>7-10 business days</strong>.
                        </p>

                        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">Refund Methods</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="font-semibold text-gray-900">Online Payment (Card/Mobile Banking):</p>
                                <ul className="list-disc pl-6 space-y-1 mt-2">
                                    <li>Refunded to the original payment method</li>
                                    <li>May take 7-14 business days to reflect in your account</li>
                                    <li>Timeline depends on your bank/payment provider</li>
                                </ul>
                            </div>

                            <div>
                                <p className="font-semibold text-gray-900">Cash on Delivery (COD):</p>
                                <ul className="list-disc pl-6 space-y-1 mt-2">
                                    <li>Refunded via bKash, Nagad, or Rocket (mobile banking)</li>
                                    <li>You can choose your preferred mobile banking service</li>
                                    <li>Provide your mobile banking account number</li>
                                    <li>Refund processed within 5-7 business days</li>
                                </ul>
                            </div>
                        </div>

                        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">Partial Refunds</h3>
                        <p>In some cases, only partial refunds may be granted:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Items with obvious signs of use</li>
                            <li>Items returned more than 7 days after delivery (at our discretion)</li>
                            <li>Items not in original condition or missing tags</li>
                            <li>Any item returned without prior authorization</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Damaged or Defective Items</h2>
                        <p>
                            If you receive a damaged or defective item:
                        </p>
                        <ol className="list-decimal pl-6 space-y-2">
                            <li><strong>Immediately contact us</strong> (within 48 hours of delivery)</li>
                            <li><strong>Provide photos</strong> showing the damage/defect clearly</li>
                            <li><strong>Do not use or wash</strong> the item</li>
                            <li>We will arrange free pickup and offer a replacement or full refund</li>
                        </ol>

                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mt-4">
                            <p className="font-semibold text-red-900 mb-2">⚠️ Important for Damaged Items</p>
                            <p className="text-red-800">
                                Claims for damaged items must be made within 48 hours of delivery. Take photos/videos while unboxing if the package appears damaged.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Lost or Missing Items</h2>
                        <p>
                            If your order shows as delivered but you haven&apos;t received it:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Check with family members or neighbors</li>
                            <li>Verify the delivery address on your order</li>
                            <li>Contact the courier service with your tracking number</li>
                            <li>Contact us within 48 hours if you cannot locate the package</li>
                        </ul>
                        <p className="mt-3">
                            We will investigate with the courier and provide a replacement or refund if the package is confirmed lost.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Cancellations</h2>

                        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">Before Shipment</h3>
                        <p>
                            Orders can be cancelled free of charge before they are shipped. Contact us immediately if you wish to cancel. If the order has already been dispatched, standard return procedures will apply.
                        </p>

                        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">After Shipment</h3>
                        <p>
                            Once shipped, you can refuse delivery and the order will be returned to us. Refunds for refused orders will be processed within 7-10 business days. For COD orders, there is no charge. For prepaid orders, the full amount will be refunded.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Store Credit</h2>
                        <p>
                            Instead of a refund, you may opt for store credit of equal value. Store credit:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Is processed immediately upon return approval</li>
                            <li>Has no expiration date</li>
                            <li>Can be used for future purchases</li>
                            <li>Cannot be redeemed for cash</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Questions?</h2>
                        <p>
                            If you have any questions about our return policy or need assistance with a return:
                        </p>
                        <div className="mt-4 space-y-2">
                            <p><strong>Customer Service</strong></p>
                            <p>Email: <a href="mailto:support@zahan.com.bd" className="text-blue-600 hover:underline">support@zahan.com.bd</a></p>
                            <p>Phone / WhatsApp: +8801304117711</p>
                            <p>Hours: Saturday - Thursday, 10 AM - 8 PM (Bangladesh Time)</p>
                        </div>
                        <p className="mt-4">
                            Our customer service team is here to help make your return or exchange process as smooth as possible.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
