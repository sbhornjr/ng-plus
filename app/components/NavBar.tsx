'use client'

import Link from "next/link"
import { useState } from "react"
import AuthModal from "@/app/components/AuthModal"
import { useUser } from "@/app/components/UserContext"

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
                NG<span className="text-[#00d4aa]">+</span>
            </Link>
            <Link href="/games" className="text-2xl font-bold font-(family-name:--font-display) tracking-tight">
                Games
            </Link>
            <Link href="/explore" className="text-2xl font-bold font-(family-name:--font-display) tracking-tight">
                Explore
            </Link>
            {user == null ? (
                <div className="flex items-center gap-6 ml-auto">
                    <button onClick={() => handleClick("signin")} className="text-sm font-semibold text-[#8b8b9a] hover:text-[#f0f0f0] transition-colors duration-200 font-(family-name:--font-display)">
                        Sign In
                    </button>
                    <button onClick={() => handleClick("signup")} className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-[#00d4aa] text-[#0e0e10] hover:bg-[#00b894] transition-colors duration-200 font-(family-name:--font-display)">
                        Sign Up
                    </button>
                </div>
            ) : (
                <div className="ml-auto relative group">
                    <div className="flex items-center gap-6 mx-4 cursor-pointer">
                        <Link href={`/user/${user.username}`}  className="text-2xl font-bold font-(family-name:--font-display) tracking-tight">
                            {user.username} <span className="text-lg pointer-events-none">▾</span>
                        </Link>
                    </div>
                    <div className="absolute right-0 top-full w-48 bg-[#1a1a1f] border border-[#2a2a35] rounded-xl
                        hidden group-hover:flex flex-col z-50 py-2 shadow-xl">
                        <Link href={`/user/${user.username}`} className="px-4 py-2 text-sm text-[#8b8b9a]
                            hover:text-[#f0f0f0] hover:bg-[#2a2a35] transition-colors duration-200">
                            Profile
                        </Link>
                        <Link href="/library" className="px-4 py-2 text-sm text-[#8b8b9a]
                            hover:text-[#f0f0f0] hover:bg-[#2a2a35] transition-colors duration-200">
                            Library
                        </Link>
                        <Link href="/loadout" className="px-4 py-2 text-sm text-[#8b8b9a]
                            hover:text-[#f0f0f0] hover:bg-[#2a2a35] transition-colors duration-200">
                            Loadout
                        </Link>
                        <Link href={`/user/${user.username}/lists`} className="px-4 py-2 text-sm text-[#8b8b9a]
                            hover:text-[#f0f0f0] hover:bg-[#2a2a35] transition-colors duration-200">
                            Lists
                        </Link>
                        <Link href="/settings" className="px-4 py-2 text-sm text-[#8b8b9a]
                            hover:text-[#f0f0f0] hover:bg-[#2a2a35] transition-colors duration-200">
                            Settings
                        </Link>
                        <div className="border-t border-[#2a2a35] mt-1 pt-1">
                            <button
                                onClick={signOut}
                                className="w-full text-left px-4 py-2 text-sm text-[#e05555]
                                hover:bg-[#2a2a35] transition-colors duration-200">
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