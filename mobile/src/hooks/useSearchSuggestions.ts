import { useEffect, useRef, useState } from "react"
import {
  getSearchSuggestions,
  SearchSuggestionsResult,
} from "@api/enhancements"

const EMPTY: SearchSuggestionsResult = {
  products: [],
  categories: [],
  collections: [],
  popular: [],
}

export function useSearchSuggestions(query: string, debounceMs = 300) {
  const [suggestions, setSuggestions] = useState<SearchSuggestionsResult>(EMPTY)
  const [loading, setLoading] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    const term = query.trim()

    if (term.length < 2) {
      setSuggestions(EMPTY)
      setLoading(false)
      return
    }

    setLoading(true)
    timer.current = setTimeout(() => {
      getSearchSuggestions(term)
        .then(setSuggestions)
        .finally(() => setLoading(false))
    }, debounceMs)

    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [query, debounceMs])

  const hasResults =
    suggestions.products.length > 0 ||
    suggestions.categories.length > 0 ||
    suggestions.collections.length > 0 ||
    suggestions.popular.length > 0

  return { suggestions, loading, hasResults }
}
