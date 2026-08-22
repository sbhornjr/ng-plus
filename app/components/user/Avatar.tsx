import Image from "next/image"

type AvatarSize = "sm" | "md" | "lg"

const SIZE_CLASSES: Record<AvatarSize, string> = {
    sm: "w-8 h-8",
    md: "w-14 h-14",
    lg: "w-20 h-20",
}

const FALLBACK_TEXT_CLASSES: Record<AvatarSize, string> = {
    sm: "text-2xl",
    md: "text-xl",
    lg: "text-2xl",
}

const IMAGE_SIZES: Record<AvatarSize, string> = {
    sm: "32px",
    md: "56px",
    lg: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw",
}

type AvatarProps = {
    src: string | null | undefined
    alt: string
    size?: AvatarSize
    // When true, the border ring shows around the photo too. When false (default),
    // the ring only appears on the fallback-initial state — matching most of the app.
    bordered?: boolean
    className?: string
}

export default function Avatar({ src, alt, size = "sm", bordered = false, className = "" }: AvatarProps) {
    const sizeClasses = SIZE_CLASSES[size]

    const fallback = (
        <span className={`${FALLBACK_TEXT_CLASSES[size]} font-bold text-(--color-accent) font-(family-name:--font-display)`}>
            {alt?.[0]?.toUpperCase()}
        </span>
    )

    return (
        <div className={`${sizeClasses} rounded-full bg-(--color-surface-light) flex items-center justify-center
            relative overflow-hidden shrink-0 ${bordered ? "border border-(--color-accent)" : ""} ${className}`}>
            {src ? (
                <Image src={src} alt={alt} fill className="object-cover" sizes={IMAGE_SIZES[size]} />
            ) : bordered ? (
                fallback
            ) : (
                <div className={`${sizeClasses} rounded-full bg-(--color-surface-light) border border-(--color-accent) flex items-center justify-center`}>
                    {fallback}
                </div>
            )}
        </div>
    )
}
