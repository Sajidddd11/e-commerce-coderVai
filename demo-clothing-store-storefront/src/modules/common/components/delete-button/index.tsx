import { deleteLineItem } from "@lib/data/cart"
import { Trash } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import DotSpinner from "@modules/common/components/dot-spinner"
import { useState } from "react"

const DeleteButton = ({
  id,
  children,
  className,
  "data-testid": dataTestid,
}: {
  id: string
  children?: React.ReactNode
  className?: string
  "data-testid"?: string
}) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    await deleteLineItem(id).catch((err) => {
      setIsDeleting(false)
    })
  }

  return (
    <div
      className={clx(
        "flex items-center justify-between text-small-regular",
        className
      )}
      data-testid={dataTestid}
    >
      <button
        className="flex gap-x-1 text-ui-fg-subtle hover:text-ui-fg-base cursor-pointer"
        onClick={() => handleDelete(id)}
      >
        {isDeleting ? <DotSpinner size="sm" color="currentColor" /> : <Trash />}
        <span>{children}</span>
      </button>
    </div>
  )
}

export default DeleteButton
