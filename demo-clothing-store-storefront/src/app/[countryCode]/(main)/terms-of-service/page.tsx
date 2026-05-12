import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Terms of Service | Zahan Fashion and Lifestyle",
    description: "Read the terms and conditions for using Zahan Fashion and Lifestyle online store.",
}

export default function TermsOfServicePage() {
    return (
        <div className="content-container py-16">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

                <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
                    <p className="text-sm text-gray-500">
                        Last updated: {new Date().toLocaleDateString('en-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Agreement to Terms</h2>
                        <p>
                            Welcome to Zahan Fashion and Lifestyle. By accessing or using our website and services, you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you disagree with any part of these terms, you may not access our services.
                        </p>
                        <p>
                            These Terms are governed by the laws of Bangladesh, including the Digital Commerce Operation Guidelines, 2021.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Use of Our Service</h2>
                        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">Eligibility</h3>
                        <p>
                            You must be at least 18 years old to use our services. By using this website, you represent that you are of legal age to form a binding contract in Bangladesh.
                        </p>

                        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">Account Registration</h3>
                        <p>When you create an account, you agree to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Provide accurate, current, and complete information</li>
                            <li>Maintain and update your information to keep it accurate</li>
                            <li>Maintain the security of your password and account</li>
                            <li>Accept responsibility for all activities under your account</li>
                            <li>Notify us immediately of any unauthorized use</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Products and Pricing</h2>
                        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">Product Information</h3>
                        <p>
                            We strive to display accurate product descriptions, images, and prices. However, we cannot guarantee that all information is error-free. We reserve the right to correct any errors and update information without prior notice.
                        </p>

                        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">Pricing</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>All prices are listed in Bangladeshi Taka (BDT)</li>
                            <li>Prices are subject to change without notice</li>
                            <li>The price charged will be the price displayed at the time of order placement</li>
                            <li>We reserve the right to cancel orders if pricing errors occur</li>
                        </ul>

                        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">Product Availability</h3>
                        <p>
                            All products are subject to availability. We reserve the right to discontinue products or limit quantities at any time. If a product becomes unavailable after you place an order, we will notify you and offer a refund or alternative.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Orders and Payment</h2>
                        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">Order Acceptance</h3>
                        <p>
                            Your order is an offer to purchase products. We reserve the right to accept or reject any order for any reason. We may require additional verification or information before accepting orders.
                        </p>

                        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">Payment Methods</h3>
                        <p>We accept the following payment methods within Bangladesh:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Credit/Debit Cards (Visa, Mastercard, American Express) via SSLCommerz</li>
                            <li>Mobile Banking (bKash, Nagad, Rocket) via SSLCommerz</li>
                            <li>Internet Banking via SSLCommerz</li>
                            <li>Cash on Delivery (COD) for eligible orders</li>
                        </ul>

                        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">Payment Processing</h3>
                        <p>
                            All online payments are processed securely through SSLCommerz, a certified payment gateway in Bangladesh. We do not store your complete payment card information on our servers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Shipping and Delivery</h2>
                        <p>
                            We currently ship within Bangladesh only. Delivery times and costs vary by location. Please see our <a href="/shipping-info" className="text-blue-600 hover:underline">Shipping Info</a> page for detailed information.
                        </p>
                        <p>
                            Risk of loss and title for products pass to you upon delivery to the shipping carrier.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Returns and Refunds</h2>
                        <p>
                            Please review our <a href="/returns" className="text-blue-600 hover:underline">Returns Policy</a> for detailed information about returns, exchanges, and refunds. By making a purchase, you agree to our return policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Intellectual Property</h2>
                        <p>
                            All content on this website, including text, graphics, logos, images, and software, is the property of Zahan Fashion and Lifestyle or its content suppliers and is protected by Bangladesh and international copyright laws.
                        </p>
                        <p>You may not:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Reproduce, distribute, or modify any content without written permission</li>
                            <li>Use our trademarks or branding without authorization</li>
                            <li>Create derivative works from our content</li>
                            <li>Use automated systems to access our website</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">User Conduct</h2>
                        <p>You agree not to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Use the website for any unlawful purpose</li>
                            <li>Violate any laws or regulations of Bangladesh</li>
                            <li>Transmit harmful code, viruses, or malware</li>
                            <li>Interfere with the proper functioning of the website</li>
                            <li>Impersonate others or provide false information</li>
                            <li>Harvest or collect user information</li>
                            <li>Engage in fraudulent activities</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Limitation of Liability</h2>
                        <p>
                            To the fullest extent permitted by Bangladesh law, Zahan Fashion and Lifestyle shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services or products.
                        </p>
                        <p>
                            Our total liability shall not exceed the amount you paid for the specific product or service in question.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Indemnification</h2>
                        <p>
                            You agree to indemnify and hold harmless Zahan Fashion and Lifestyle from any claims, damages, losses, liabilities, and expenses arising from your violation of these Terms or your use of our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Governing Law and Dispute Resolution</h2>
                        <p>
                            These Terms are governed by the laws of Bangladesh. Any disputes arising from these Terms or your use of our services shall be subject to the exclusive jurisdiction of the courts of Dhaka, Bangladesh.
                        </p>
                        <p>
                            We encourage you to contact us first to resolve any disputes amicably before pursuing legal action.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on this page. Your continued use of the website after changes constitutes acceptance of the modified Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Severability</h2>
                        <p>
                            If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Contact Information</h2>
                        <p>For questions about these Terms, please contact us:</p>
                        <div className="mt-4 space-y-2">
                            <p><strong>Zahan Fashion and Lifestyle</strong></p>
                            <p>Email: <a href="mailto:support@zahan.com.bd" className="text-blue-600 hover:underline">support@zahan.com.bd</a></p>
                            <p>Phone / WhatsApp: +8801304117711</p>
                            <p>Address: ৫০/এ, পুরানা পল্টন, হাবিব সেন্টার, (৬ষ্ঠ তলা), ঢাকা-১০০০</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
