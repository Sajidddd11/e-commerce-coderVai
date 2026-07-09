"use client"

import React, { useRef, useState } from "react"
import { Button, Badge } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import { updateCustomer } from "@lib/data/customer"
import Spinner from "@modules/common/icons/spinner"

type ProfilePictureProps = {
  customer: HttpTypes.StoreCustomer
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({ customer }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const avatar = (customer.metadata?.avatar as string) || null
  const firstName = customer.first_name || ""
  const lastName = customer.last_name || ""
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U"

  const handleEditClick = () => {
    setError(null)
    setSuccess(false)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit uncompressed upload to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large. Please select an image under 5MB.")
      return
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const base64 = await compressImage(file)
      
      // Update metadata with the new avatar
      const currentMetadata = customer.metadata || {}
      await updateCustomer({
        metadata: {
          ...currentMetadata,
          avatar: base64,
        },
      })
      setSuccess(true)
    } catch (err: any) {
      console.error(err)
      setError("Failed to update profile picture. Please try again.")
    } finally {
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = "" // Reset file input
      }
    }
  }

  const handleRemove = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const currentMetadata = customer.metadata || {}
      const updatedMetadata = { ...currentMetadata }
      delete updatedMetadata.avatar

      await updateCustomer({
        metadata: updatedMetadata,
      })
      setSuccess(true)
    } catch (err: any) {
      console.error(err)
      setError("Failed to remove profile picture.")
    } finally {
      setLoading(false)
    }
  }

  // Compress image client side using Canvas
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          const MAX_WIDTH = 200
          const MAX_HEIGHT = 200
          let width = img.width
          let height = img.height

          // Crop/resize to square maintaining aspect ratio
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height
              height = MAX_HEIGHT
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext("2d")
          if (!ctx) {
            reject(new Error("Failed to get 2D context"))
            return
          }

          // Draw image inside canvas boundaries
          ctx.drawImage(img, 0, 0, width, height)

          // Export as highly compressed JPEG
          const dataUrl = canvas.toDataURL("image/jpeg", 0.75)
          resolve(dataUrl)
        }
        img.onerror = () => reject(new Error("Failed to load image element"))
        img.src = event.target?.result as string
      }
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="text-small-regular w-full">
      <div className="flex flex-col small:flex-row small:items-center justify-between gap-y-4 w-full">
        <div className="flex items-center gap-x-4">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          
          <div className="relative group cursor-pointer" onClick={handleEditClick}>
            <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center border border-gray-200 shadow-sm bg-gradient-to-br from-neutral-800 to-neutral-950 text-white font-semibold text-2xl relative">
              {loading ? (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <Spinner size="24" color="white" />
                </div>
              ) : avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar}
                  alt={`${firstName} ${lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
              
              {!loading && (
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-white text-xs font-medium">Edit</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-y-1">
            <span className="uppercase text-ui-fg-base font-semibold">Profile Picture</span>
            <span className="text-ui-fg-subtle text-xs">
              Supports JPEG, PNG, WEBP. Max size 5MB.
            </span>
            {success && (
              <Badge className="p-1 mt-1 w-max text-[10px]" color="green">
                Updated successfully
              </Badge>
            )}
            {error && (
              <Badge className="p-1 mt-1 w-max text-[10px]" color="red">
                {error}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-x-2">
          <Button
            variant="secondary"
            className="w-[100px] min-h-[25px] py-1"
            onClick={handleEditClick}
            disabled={loading}
          >
            Upload
          </Button>
          {avatar && (
            <Button
              variant="transparent"
              className="w-[100px] min-h-[25px] py-1 text-red-500 hover:text-red-700"
              onClick={handleRemove}
              disabled={loading}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePicture
