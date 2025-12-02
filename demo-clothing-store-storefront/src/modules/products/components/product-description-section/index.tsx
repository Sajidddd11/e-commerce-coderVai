"use client"

import ReactMarkdown from "react-markdown"
import { HttpTypes } from "@medusajs/types"

interface ProductDescriptionSectionProps {
  product: HttpTypes.StoreProduct
}

export default function ProductDescriptionSection({
  product,
}: ProductDescriptionSectionProps) {
  // Check for subtitle in multiple possible locations
  const subtitle = (product as any).subtitle || product.metadata?.subtitle

  if (!subtitle) {
    return null
  }

  return (
    <div className="w-full border-t border-slate-200 pt-6 mt-6">
      <h3 className="text-lg small:text-xl font-bold text-slate-900 mb-4">
        About This Product
      </h3>

      <div className="prose prose-sm max-w-none text-slate-700">
        <ReactMarkdown
          components={{
            // Paragraphs
            p: ({ children }) => (
              <p className="mb-3 leading-relaxed text-slate-700">
                {children}
              </p>
            ),
            // Links
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-blue-600 hover:text-blue-700 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            // Lists
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-3 space-y-1 text-slate-700">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-3 space-y-1 text-slate-700">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="ml-2">{children}</li>
            ),
            // Strong/Bold
            strong: ({ children }) => (
              <strong className="font-semibold text-slate-900">{children}</strong>
            ),
            // Emphasis/Italic
            em: ({ children }) => (
              <em className="italic">{children}</em>
            ),
          }}
        >
          {subtitle}
        </ReactMarkdown>
      </div>
    </div>
  )
}
