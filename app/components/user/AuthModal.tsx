'use client'

import { useState } from "react"
import { createClient } from "@/lib/supabase-browser"
import { useRouter } from "next/navigation"
import Modal from "@/app/components/util/Modal"
import { signInWithPassword, signUpWithPassword } from "@/lib/queries/user"

type AuthModalProps = {
    isOpen: boolean
    onClose: () => void
    defaultTab: 'signin' | 'signup'
}

export default function AuthModal({ isOpen, onClose, defaultTab = 'signin' }: AuthModalProps) {
    const [tab, setTab] = useState<"signin" | "signup">(defaultTab)
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [passwordAgain, setPasswordAgain] = useState("")
    const [error, setError] = useState("")
    const router = useRouter()

    if (!isOpen) return null;

    async function signIn() {
        setLoading(true)
        const supabase = createClient()
        const error = await signInWithPassword(supabase, email, password)
        setLoading(false)
        if (error) {
            setError(error.message)
        } else {
            onClose()
            router.refresh()
        }
    }

    async function signUp() {
        if (password !== passwordAgain) {
            setError("Passwords don't match")
            return
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }
        setLoading(true)
        const supabase = createClient()
        const error = await signUpWithPassword(supabase, { email, password, username })
        setLoading(false)
        if (error) {
            setError(error.message)
        } else {
            onClose()
            router.refresh()
        }
    }

    return (
        <Modal
            onClose={onClose}
            title={tab == "signin" ? 'Sign In' : 'Sign Up'}
            titleClassName="text-4xl font-bold font-(family-name:--font-display) tracking-tight self-center mb-4"
        >
                {tab == "signin" ? (
                    <form onSubmit={(e) => { e.preventDefault(); signIn() }} className="flex flex-col items-start justify-center gap-2">
                        <label className="text-sm font-medium text-(--color-text) mt-2 first:mt-0">
                            Email
                        </label>
                        <input
                            type="text"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-(--color-surface) text-(--color-text) placeholder:text-(--color-muted) border border-(--color-border) rounded-[3px] px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:border-(--color-accent)"
                        />
                        <label className="text-sm font-medium text-(--color-text) mt-2 first:mt-0">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-(--color-surface) text-(--color-text) placeholder:text-(--color-muted) border border-(--color-border) rounded-[3px] px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:border-(--color-accent)"
                        />
                        {error && (
                            <p className="self-center font-semibold mt-4">{error}</p>
                        )}
                        <button type="submit" disabled={loading} className="font-semibold py-2 px-5 self-center my-4 rounded-[3px] bg-(--color-accent) text-(--color-bg) hover:bg-(--color-accent-hover) transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-surface) disabled:opacity-60">
                            {loading ? "..." : "Sign In"}</button>
                        <button type="button" onClick={() => setTab("signup")} className="underline self-center hover:text-(--color-accent) transition-colors duration-200">Don&apos;t have an account? Sign Up.</button>
                    </form>
                )
                : (
                    <form onSubmit={(e) => { e.preventDefault(); signUp() }} className="flex flex-col items-start justify-center gap-2">
                        <label className="text-sm font-medium text-(--color-text) mt-2 first:mt-0">
                            Email
                        </label>
                        <input
                            type="text"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-(--color-surface) text-(--color-text) placeholder:text-(--color-muted) border border-(--color-border) rounded-[3px] px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:border-(--color-accent)"
                        />
                        <label className="text-sm font-medium text-(--color-text) mt-2 first:mt-0">
                            Username
                        </label>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-(--color-surface) text-(--color-text) placeholder:text-(--color-muted) border border-(--color-border) rounded-[3px] px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:border-(--color-accent)"
                        />
                        <label className="text-sm font-medium text-(--color-text) mt-2 first:mt-0">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-(--color-surface) text-(--color-text) placeholder:text-(--color-muted) border border-(--color-border) rounded-[3px] px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:border-(--color-accent)"
                        />
                        <label className="text-sm font-medium text-(--color-text) mt-2 first:mt-0">
                            Confirm password
                        </label>
                        <input
                            type="password"
                            placeholder="Password"
                            value={passwordAgain}
                            onChange={(e) => setPasswordAgain(e.target.value)}
                            className="w-full bg-(--color-surface) text-(--color-text) placeholder:text-(--color-muted) border border-(--color-border) rounded-[3px] px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:border-(--color-accent)"
                        />
                        {error && (
                            <p className="self-center font-semibold mt-4">{error}</p>
                        )}
                        <button type="submit" disabled={loading} className="font-semibold py-2 px-5 self-center my-4 rounded-[3px] bg-(--color-accent) text-(--color-bg) hover:bg-(--color-accent-hover) transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-surface) disabled:opacity-60">
                            {loading ? "..." : "Sign Up"}</button>
                        <button type="button" onClick={() => setTab("signin")} className="underline self-center hover:text-(--color-accent) transition-colors duration-200">Already have an account? Sign In.</button>
                    </form>
                )}
        </Modal>
    )

}