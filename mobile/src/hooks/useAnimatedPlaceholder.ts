import { useState, useEffect } from "react"

const DEFAULT_PHRASES = [
  "argentina jersey",
  "cat food",
  "stylish sneakers",
  "home appliances",
  "leather bags",
]

export function useAnimatedPlaceholder(phrases: string[] = DEFAULT_PHRASES) {
  const [text, setText] = useState("")
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let timeout: NodeJS.Timeout
    const currentPhrase = phrases[phraseIndex]

    if (isDeleting) {
      if (text === "") {
        setIsDeleting(false)
        setPhraseIndex((prev) => (prev + 1) % phrases.length)
        timeout = setTimeout(() => {}, 500)
      } else {
        timeout = setTimeout(() => {
          setText(currentPhrase.substring(0, text.length - 1))
        }, 50)
      }
    } else {
      if (text === currentPhrase) {
        timeout = setTimeout(() => {
          setIsDeleting(true)
        }, 2000)
      } else {
        timeout = setTimeout(() => {
          setText(currentPhrase.substring(0, text.length + 1))
        }, 100)
      }
    }

    return () => clearTimeout(timeout)
  }, [text, isDeleting, phraseIndex, phrases])

  return `Search '${text}'...`
}
