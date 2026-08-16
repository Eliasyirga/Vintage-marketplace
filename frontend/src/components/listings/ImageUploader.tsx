import { useState, useRef, type ChangeEvent, type DragEvent } from 'react'
import { Upload, X, ArrowLeft, ArrowRight, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import type { SafeListingImage } from '../../types/listing'

export interface ImageItem {
  id: string
  file?: File
  existingImage?: SafeListingImage
  previewUrl: string
}

interface ImageUploaderProps {
  images: ImageItem[]
  onChange: (images: ImageItem[]) => void
  maxImages?: number
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function ImageUploader({ images, onChange, maxImages = 8 }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFiles = (fileList: FileList | File[]) => {
    const newFiles = Array.from(fileList)
    const validItems: ImageItem[] = []

    if (images.length + newFiles.length > maxImages) {
      toast.error(`You can only upload up to ${maxImages} photos per listing.`)
      return
    }

    for (const file of newFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`"${file.name}" is not a valid format. Only JPEG, PNG, and WEBP are supported.`)
        continue
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" is too large. Maximum file size is 5MB.`)
        continue
      }

      const previewUrl = URL.createObjectURL(file)
      validItems.push({
        id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        previewUrl,
      })
    }

    if (validItems.length > 0) {
      onChange([...images, ...validItems])
    }
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
      e.target.value = ''
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }

  const removeImage = (index: number) => {
    const updated = [...images]
    const removed = updated.splice(index, 1)[0]
    if (removed.file && removed.previewUrl) {
      URL.revokeObjectURL(removed.previewUrl)
    }
    onChange(updated)
  }

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= images.length) return

    const updated = [...images]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-600" />
            Item Photos
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Add up to {maxImages} photos. The first image will be the cover photo.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
          {images.length} / {maxImages} photos
        </span>
      </div>

      {/* Drop Zone */}
      {images.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-amber-500 bg-amber-50 scale-[1.01]'
              : 'border-stone-300 bg-stone-50/70 hover:border-amber-500 hover:bg-amber-50/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-full bg-amber-100 text-amber-600">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-800">
                Drag and drop images here, or <span className="text-amber-600 underline">browse</span>
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Supports JPG, PNG, WEBP up to 5MB each
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
          {images.map((item, index) => (
            <div
              key={item.id}
              className="relative group aspect-square rounded-2xl overflow-hidden bg-white border border-stone-200 shadow-sm hover:shadow-md transition-all"
            >
              <img
                src={item.previewUrl}
                alt={`Product view ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Cover badge on first image */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-amber-500 text-white font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow">
                  COVER PHOTO
                </div>
              )}

              {/* Overlay controls */}
              <div className="absolute inset-0 bg-stone-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(index)
                    }}
                    className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors shadow"
                    title="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={(e) => {
                      e.stopPropagation()
                      moveImage(index, 'left')
                    }}
                    className={`p-1.5 rounded-lg bg-white/90 text-stone-800 transition-colors shadow ${
                      index === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white'
                    }`}
                    title="Move left"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-[10px] font-bold text-white bg-stone-900/80 px-2 py-0.5 rounded">
                    #{index + 1}
                  </span>

                  <button
                    type="button"
                    disabled={index === images.length - 1}
                    onClick={(e) => {
                      e.stopPropagation()
                      moveImage(index, 'right')
                    }}
                    className={`p-1.5 rounded-lg bg-white/90 text-stone-800 transition-colors shadow ${
                      index === images.length - 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white'
                    }`}
                    title="Move right"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
