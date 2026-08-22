'use client'

import { ReactNode } from "react"

type ModalProps = {
    onClose: () => void
    title?: ReactNode
    titleClassName?: string
    panelClassName?: string
    children: ReactNode
}

export default function Modal({
    onClose,
    title,
    titleClassName = "font-semibold text-3xl mb-6 self-center",
    panelClassName = "w-full max-w-md p-8",
    children,
}: ModalProps) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm w-full h-full flex items-center justify-center z-50 p-5">
            <div className={`bg-(--color-surface) border border-(--color-border) rounded-[3px] relative flex flex-col ${panelClassName}`}>
                <button onClick={onClose} className="mb-4 self-end text-(--color-muted) border border-(--color-muted) bg-(--color-surface-light) rounded-4xl px-2 py-1">X</button>
                {title && <h2 className={titleClassName}>{title}</h2>}
                {children}
            </div>
        </div>
    )
}
