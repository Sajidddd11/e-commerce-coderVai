import { listCategories } from "@lib/data/categories"
import { Text, clx } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function LandingCategories() {
  const productCategories = await listCategories()

  return (
    <div className="text-small-regular mt-10 gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-3">
      {productCategories && productCategories?.length > 0 && (
        <div className="flex flex-col gap-y-2">
          <span className="txt-small-plus txt-ui-fg-base">
            Categories
          </span>
          <ul
            className="grid grid-cols-1 gap-2"
            data-testid="footer-categories"
          >
            {productCategories?.length}
            {productCategories?.slice(0, 6).map((c) => {
              if (c.parent_category) {
                return
              }

              const children =
                c.category_children?.map((child) => ({
                  name: child.name,
                  handle: child.handle,
                  id: child.id,
                })) || null

              return (
                <li
                  className="flex flex-col gap-2 text-ui-fg-subtle txt-small"
                  key={c.id}
                >
                  <LocalizedClientLink
                    className={clx(
                      "hover:text-ui-fg-base",
                      children && "txt-small-plus"
                    )}
                    href={`/categories/${c.handle}`}
                    data-testid="category-link"
                  >
                    {c.name}
                  </LocalizedClientLink>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
