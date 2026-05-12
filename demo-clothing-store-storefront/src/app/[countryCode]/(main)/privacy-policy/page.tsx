import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Privacy Policy | Zahan Fashion and Lifestyle",
    description: "Learn how Zahan Fashion and Lifestyle collects, uses, and protects your personal information.",
}

export default function PrivacyPolicyPage() {
    return (
        <div className="content-container py-16">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

                <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
                    <p className="text-sm text-gray-500">
                        Last updated: {new Date().toLocaleDateString('en-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Introduction</h2>
                        <p>
                            Welcome to Zahan Fashion and Lifestyle (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and make purchases from our online store.
                        </p>
                        <p>
                            This policy complies with the Digital Security Act, 2018 and other applicable laws of Bangladesh.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Information We Collect</h2>
                        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">Personal Information</h3>
                        <p>When you place an order or create an account, we collect:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Full name</li>
                            <li>Email address</li>
                            <li>Phone number</li>
                            <li>Billing and shipping addresses in Bangladesh</li>
                            <li>Payment information (processed securely through SSLCommerz)</li>
                        </ul>

                        <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900">Automatically Collected Information</h3>
                        <p>When you visit our website, we may automatically collect:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>IP address</li>
                            <li>Browser type and version</li>
                            <li>Device information</li>
                            <li>Pages visited and time spent</li>
                            <li>Referring website addresses</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">How We Use Your Information</h2>
                        <p>We use your information to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Process and fulfill your orders</li>
                            <li>Send order confirmations and shipping updates via SMS and email</li>
                            <li>Communicate with you about your account or transactions</li>
                            <li>Respond to your comments, questions, and customer service requests</li>
                            <li>Send promotional emails about new products, special offers, or other information (you can opt-out anytime)</li>
                            <li>Improve our website and customer service</li>
                            <li>Prevent fraudulent transactions and protect against criminal activity</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Information Sharing</h2>
                        <p>We do not sell, trade, or rent your personal information to third parties. We may share your information with:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Payment Processors:</strong> SSLCommerz for secure payment processing</li>
                            <li><strong>SMS Service Providers:</strong> Bulk SMS BD for order notifications and OTP verification</li>
                            <li><strong>Delivery Partners:</strong> Couriers within Bangladesh to deliver your orders</li>
                            <li><strong>Legal Authorities:</strong> When required by Bangladesh law or to protect our rights</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Cookies and Tracking Technologies</h2>
                        <p>
                            We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and understand user preferences. Cookies are small data files stored on your device. You can control cookies through your browser settings, but disabling them may affect website functionality.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Data Security</h2>
                        <p>
                            We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All payment transactions are encrypted using SSL technology through SSLCommerz, a certified payment gateway in Bangladesh.
                        </p>
                        <p>
                            However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Access, update, or delete your personal information</li>
                            <li>Opt-out of marketing communications</li>
                            <li>Request a copy of your data</li>
                            <li>Withdraw consent for data processing</li>
                            <li>Lodge a complaint with relevant authorities in Bangladesh</li>
                        </ul>
                        <p className="mt-4">
                            To exercise these rights, please contact us at <a href="mailto:support@zahan.com.bd" className="text-blue-600 hover:underline">support@zahan.com.bd</a> or call/WhatsApp us at +8801304117711.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Data Retention</h2>
                        <p>
                            We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements. Order information is typically retained for a minimum of 5 years as required by Bangladesh tax and business laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Children&apos;s Privacy</h2>
                        <p>
                            Our website is not intended for children under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes by posting the new policy on this page with an updated date. We encourage you to review this policy periodically.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900">Contact Us</h2>
                        <p>If you have questions or concerns about this Privacy Policy, please contact us:</p>
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
