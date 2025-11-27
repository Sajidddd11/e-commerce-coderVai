const features = [
  {
    emoji: "🚀",
    title: "Fast Shipping",
    description: "Get your orders delivered within 2-3 business days",
  },
  {
    emoji: "🛡️",
    title: "Secure Payment",
    description: "100% secure and encrypted transactions",
  },
  {
    emoji: "♻️",
    title: "Easy Returns",
    description: "30-day hassle-free return policy",
  },
]

export default function TrustSection() {
  return (
    <div className="w-full bg-gradient-to-b from-slate-50 to-white py-16 small:py-24">
      <div className="content-container">
        <div className="flex flex-col gap-12">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl small:text-3xl font-bold text-slate-900 mb-3">
              Why Shop With Us
            </h2>
            <p className="text-slate-600 text-sm small:text-base max-w-2xl mx-auto">
              We're committed to delivering exceptional quality, unbeatable prices, and outstanding customer service
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 small:grid-cols-3 gap-8 small:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center small:items-start gap-4 p-6 small:p-0 bg-white small:bg-transparent rounded-lg small:rounded-none border border-slate-100 small:border-0 hover:shadow-md small:hover:shadow-none small:hover:bg-slate-50/50 transition-all duration-300"
              >
                <div className="p-3 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg text-white text-2xl">
                  {feature.emoji}
                </div>
                <div className="text-center small:text-left flex-1">
                  <h3 className="font-semibold text-slate-900 text-base small:text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
