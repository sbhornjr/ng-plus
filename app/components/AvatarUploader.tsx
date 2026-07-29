'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AvatarUploader({ userId, currentAvatarUrl, username }: {
  userId: string
  currentAvatarUrl: string | null
  username: string
}) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB')
      return
    }

    setError('')
    setUploading(true)

    const supabase = createClient()
    const filePath = `${userId}/avatar.${file.name.split('.').pop()}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setError('Upload failed: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    // Update user's avatar_url in the database
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)

    if (updateError) {
      setError('Failed to save avatar')
      setUploading(false)
      return
    }

    setPreview(publicUrl)
    setUploading(false)
    router.refresh()
  }

  return (
    <div className="flex flex-col items-center gap-2">
        <div className="w-20 h-20 rounded-full bg-[#2a2a35] flex items-center justify-center
            text-xs font-bold text-[#00d4aa] relative">
            {preview ? (
                <Image
                    src={preview}
                    alt={username}
                    fill
                    className="object-cover transition-all duration-100 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
            ) : (
                <div className="w-20 h-20 rounded-full bg-[#2a2a35] border border-[#00d4aa]
                    flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#00d4aa] font-(family-name:--font-display)">
                        {username[0].toUpperCase()}
                    </span>
                </div>
            )}
        </div>

        <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-xs text-[#8b8b9a] hover:text-[#00d4aa] transition-colors duration-200"
            >
            {uploading ? 'Uploading...' : 'Change Avatar'}
        </button>

        <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
        />

        {error && <p className="text-xs text-[#e05555]">{error}</p>}
    </div>
  )
}