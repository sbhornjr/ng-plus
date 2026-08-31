'use client'

import Link from "next/link"
import { useState } from "react"
import AuthModal from "@/app/components/user/AuthModal"
import { useUser } from "@/app/components/user/UserContext"

export default function NavBar() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [defaultTab, setDefaultTab] = useState<"signup" | "signin">("signup")
    const { user, signOut } = useUser()

    function handleClick(tab: "signup" | "signin") {
        setIsModalOpen(true)
        setDefaultTab(tab)
    }

    return (
        <div className="flex flex-row px-4 py-2 items-center gap-6 w-full">
            <Link href="/" className="text-4xl font-bold font-(family-name:--font-display) tracking-tight mx-2">
                NG<span className="text-(--color-accent)">+</span>
            </Link>
            <Link href="/games" className="text-2xl font-bold font-(family-name:--font-display) tracking-tight hover:text-(--color-accent) transition-colors duration-200">
                Games
            </Link>
            <Link href="/explore" className="text-2xl font-bold font-(family-name:--font-display) tracking-tight hover:text-(--color-accent) transition-colors duration-200">
                Explore
            </Link>
            {user == null ? (
                <div className="flex items-center gap-6 ml-auto">
                    <button onClick={() => handleClick("signin")} className="text-sm font-semibold text-(--color-muted) hover:text-(--color-accent) transition-colors duration-200 font-(family-name:--font-display)">
                        Sign In
                    </button>
                    <button onClick={() => handleClick("signup")} className="px-4 py-1.5 rounded-[3px] text-sm font-semibold bg-(--color-accent) text-(--color-bg) hover:bg-(--color-accent-hover) transition-colors duration-200 font-(family-name:--font-display)">
                        Sign Up
                    </button>
                </div>
            ) : (
                <div className="ml-auto relative group">
                    <div className="flex items-center gap-6 mx-4 cursor-pointer">
                        <Link href={`/user/${user.username}`}  className="text-2xl font-bold font-(family-name:--font-display) tracking-tight hover:text-(--color-accent) transition-colors duration-200">
                            {user.username} <span className="text-lg pointer-events-none">▾</span>
                        </Link>
                    </div>
                    <div className="absolute right-0 top-full w-48 bg-(--color-surface) border border-(--color-border) rounded-[3px]
                        hidden group-hover:flex flex-col z-50 py-2 shadow-xl">
                        <Link href={`/user/${user.username}`} className="px-4 py-2 text-sm text-(--color-muted)
                            hover:text-(--color-accent) hover:bg-(--color-surface-light) transition-colors duration-200">
                            Profile
                        </Link>
                        <Link href={`/user/${user.username}/library`} className="px-4 py-2 text-sm text-(--color-muted)
                            hover:text-(--color-accent) hover:bg-(--color-surface-light) transition-colors duration-200">
                            Library
                        </Link>
                        <Link href={`/user/${user.username}/loadout`} className="px-4 py-2 text-sm text-(--color-muted)
                            hover:text-(--color-accent) hover:bg-(--color-surface-light) transition-colors duration-200">
                            Loadout
                        </Link>
                        <Link href={`/user/${user.username}/lists`} className="px-4 py-2 text-sm text-(--color-muted)
                            hover:text-(--color-accent) hover:bg-(--color-surface-light) transition-colors duration-200">
                            Lists
                        </Link>
                        <Link href="/settings" className="px-4 py-2 text-sm text-(--color-muted)
                            hover:text-(--color-accent) hover:bg-(--color-surface-light) transition-colors duration-200">
                            Settings
                        </Link>
                        <div className="border-t border-(--color-border) mt-1 pt-1">
                            <button
                                onClick={signOut}
                                className="w-full text-left px-4 py-2 text-sm text-(--color-bad)
                                hover:bg-(--color-surface-light) transition-colors duration-200">
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isModalOpen && (
                <AuthModal isOpen={true} defaultTab={defaultTab} onClose={() => setIsModalOpen(false)}></AuthModal>
            )}
        </div>
    )
}