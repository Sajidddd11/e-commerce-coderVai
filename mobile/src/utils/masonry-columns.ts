/** Estimated footer height (title + price) for masonry column balancing. */
export const MASONRY_CARD_FOOTER_HEIGHT = 64

/** Pinterest-style varying image ratios — cycles tall, square, portrait. */
export function masonryAspectForIndex(index: number): number {
  const ratios = [4 / 5, 1, 3 / 4, 5 / 6]
  return ratios[index % ratios.length]!
}

export function estimateMasonryCardHeight(
  columnWidth: number,
  index: number,
  gap = 12
): number {
  const imageHeight = columnWidth / masonryAspectForIndex(index)
  return imageHeight + MASONRY_CARD_FOOTER_HEIGHT + gap
}

export function splitIntoMasonryColumns<T>(
  items: T[],
  columnWidth: number,
  gap = 12
): [
  Array<{ item: T; index: number }>,
  Array<{ item: T; index: number }>,
] {
  const left: Array<{ item: T; index: number }> = []
  const right: Array<{ item: T; index: number }> = []
  let leftHeight = 0
  let rightHeight = 0

  items.forEach((item, index) => {
    const estimate = estimateMasonryCardHeight(columnWidth, index, gap)
    if (leftHeight <= rightHeight) {
      left.push({ item, index })
      leftHeight += estimate
    } else {
      right.push({ item, index })
      rightHeight += estimate
    }
  })

  return [left, right]
}
