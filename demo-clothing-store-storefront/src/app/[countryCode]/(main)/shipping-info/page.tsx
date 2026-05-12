import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Shipping Information | Zahan Fashion and Lifestyle",
    description: "Learn about our shipping policies, delivery times, and costs across Bangladesh.",
}

export default function ShippingInfoPage() {
    return (
        <div className="content-container py-16">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Shipping Information</h1>

                <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
                    <p className="text-lg">
                        We currently ship to all locations within Bangladesh. Our goal is to deliver your order safely and promptly to your doorstep.
                    </p>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Shipping Areas</h2>
                        <p>
                            We deliver throughout Bangladesh, including:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Dhaka City:</strong> All areas within Dhaka Metropolitan</li>
                            <li><strong>Dhaka Suburbs:</strong> Gazipur, Narayanganj, Savar, and surrounding areas</li>
                            <li><strong>Major Cities:</strong> Chittagong, Sylhet, Rajshahi, Khulna, Barishal, Rangpur, Mymensingh</li>
                            <li><strong>District Towns:</strong> All district headquarters and major towns</li>
                            <li><strong>Sub-districts:</strong> Upazila and rural areas (delivery time may vary)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Delivery Timeframes</h2>

                        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Inside Dhaka</h3>
                                <p className="text-gray-700">
                                    <strong>2-3 Business Days</strong> - Standard delivery for areas within Dhaka Metropolitan
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Dhaka Suburbs</h3>
                                <p className="text-gray-700">
                                    <strong>3-4 Business Days</strong> - Gazipur, Narayanganj, Savar, and nearby areas
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Outside Dhaka (Major Cities)</h3>
                                <p className="text-gray-700">
                                    <strong>4-6 Business Days</strong> - Chittagong, Sylhet, Rajshahi, Khulna, and other major cities
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">District Towns & Rural Areas</h3>
                                <p className="text-gray-700">
                                    <strong>5-7 Business Days</strong> - District headquarters, upazila, and rural locations
                                </p>
                            </div>
                        </div>

                        <p className="mt-4 text-sm text-gray-600">
                            * Business days exclude Fridays and public holidays in Bangladesh. Delivery times may be extended during festivals or adverse weather conditions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Shipping Costs</h2>

                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Location</th>
                                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Shipping Cost</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border border-gray-300 px-4 py-3">Inside Dhaka</td>
                                        <td className="border border-gray-300 px-4 py-3">৳80 - ৳120</td>
                                    </tr>
                                    <tr className="bg-gray-50">
                                        <td className="border border-gray-300 px-4 py-3">Dhaka Suburbs</td>
                                        <td className="border border-gray-300 px-4 py-3">৳120 - ৳150</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 px-4 py-3">Outside Dhaka</td>
                                        <td className="border border-gray-300 px-4 py-3">৳150 - ৳200</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <p className="font-semibold text-blue-900 mb-2">🎉 Free Shipping Offer</p>
                            <p className="text-blue-800">
                                Enjoy <strong>FREE shipping</strong> on orders above <strong>৳2,000</strong> anywhere in Bangladesh!
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Shipping Partners</h2>
                        <p>
                            We work with trusted courier services across Bangladesh to ensure safe and timely delivery:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Pathao Courier</li>
                            <li>Redex</li>
                            <li>Sundorban Courier</li>
                            <li>SA Paribahan</li>
                            <li>eCourier</li>
                        </ul>
                        <p className="mt-4">
                            The courier service used for your order will depend on your location and product availability.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Order Processing</h2>
                        <p>
                            Orders are typically processed within <strong>1-2 business days</strong> after payment confirmation. You will receive an SMS and email notification when your order has been dispatched with tracking information.
                        </p>

                        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">Processing Steps:</h3>
                        <ol className="list-decimal pl-6 space-y-2">
                            <li><strong>Order Placed:</strong> You receive an order confirmation via SMS and email</li>
                            <li><strong>Payment Verified:</strong> Your payment is confirmed (for online payments)</li>
                            <li><strong>Order Packed:</strong> Your items are carefully packed</li>
                            <li><strong>Shipped:</strong> Order is handed to courier with tracking number</li>
                            <li><strong>Out for Delivery:</strong> Courier is on the way to your address</li>
                            <li><strong>Delivered:</strong> Package delivered to your doorstep</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Order Tracking</h2>
                        <p>
                            Once your order is shipped, you will receive:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>SMS notification with tracking number</li>
                            <li>Email with courier details and tracking link</li>
                            <li>Ability to track your order through our website or courier&apos;s website</li>
                        </ul>
                        <p className="mt-4">
                            You can check your order status anytime by logging into your account and viewing your order history.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Cash on Delivery (COD)</h2>
                        <p>
                            We offer Cash on Delivery for most locations in Bangladesh. With COD:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Pay when you receive your order</li>
                            <li>Inspect the package before payment</li>
                            <li>Available for orders up to ৳50,000</li>
                            <li>No additional COD charges</li>
                        </ul>
                        <p className="mt-4 text-sm text-gray-600">
                            Note: COD availability may vary based on your location and order value.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Delivery Instructions</h2>
                        <p>To ensure smooth delivery:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Provide accurate and complete delivery address</li>
                            <li>Include landmark or building name for easy location</li>
                            <li>Ensure contact number is active and reachable</li>
                            <li>Be available at the delivery address during business hours</li>
                            <li>Have exact cash ready for COD orders</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Failed Delivery Attempts</h2>
                        <p>
                            If the courier is unable to deliver your order:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>You will receive a call/SMS notification</li>
                            <li>The courier will attempt delivery up to 3 times</li>
                            <li>You can reschedule delivery by contacting the courier</li>
                            <li>After 3 failed attempts, the order will be returned to us</li>
                            <li>Refunds for returned orders will be processed within 7-10 business days</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Special Circumstances</h2>

                        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">Festival Seasons</h3>
                        <p>
                            During Eid, Pohela Boishakh, and other major festivals, delivery times may be extended by 2-3 days due to high volume and courier service schedules.
                        </p>

                        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">Adverse Weather</h3>
                        <p>
                            During floods, cyclones, or other natural calamities, deliveries to affected areas may be delayed or temporarily suspended for safety reasons.
                        </p>

                        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">Political Unrest/Hartals</h3>
                        <p>
                            During hartals or political instability, courier services may be disrupted. We will keep you informed of any delays.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">International Shipping</h2>
                        <p>
                            Currently, we do not offer international shipping. We only deliver within Bangladesh. We are working to expand our services internationally in the future.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Need Help?</h2>
                        <p>
                            If you have questions about shipping or need to modify your delivery address, please contact our customer service:
                        </p>
                        <div className="mt-4 space-y-2">
                            <p>Email: <a href="mailto:support@zahan.com.bd" className="text-blue-600 hover:underline">support@zahan.com.bd</a></p>
                            <p>Phone / WhatsApp: +8801304117711</p>
                            <p>Hours: Saturday - Thursday, 10 AM - 8 PM (Bangladesh Time)</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
