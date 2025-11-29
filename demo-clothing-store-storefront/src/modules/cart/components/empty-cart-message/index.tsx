import InteractiveLink from "@modules/common/components/interactive-link"

const EmptyCartMessage = () => {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center px-4 py-16" data-testid="empty-cart-message">
      <div className="max-w-md w-full text-center">
        {/* Decorative Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-50 rounded-full blur-lg opacity-60"></div>
            <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-full p-6 border border-slate-200">
              <svg
                className="w-16 h-16 text-slate-700 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl small:text-4xl font-bold text-slate-900 mb-4">
          Your cart is empty
        </h1>

        {/* Description */}
        <p className="text-slate-600 text-base small:text-lg mb-8 leading-relaxed">
          Looks like you haven&apos;t added anything yet. Explore our collection and find something you love!
        </p>

        {/* Buttons */}
        <div className="flex flex-col small:flex-row gap-3 justify-center">
          <InteractiveLink
            href="/store"
            className="inline-block px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm"
          >
            Start Shopping
          </InteractiveLink>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
          >
            Continue Shopping
          </a>
        </div>

        {/* Featured Categories Hint */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-xs small:text-sm text-slate-500 mb-4">Popular Categories</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs border border-slate-200">
              New Arrivals
            </span>
            <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs border border-slate-200">
              Best Sellers
            </span>
            <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs border border-slate-200">
              Sale
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmptyCartMessage
