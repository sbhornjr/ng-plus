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
                    <div className="flex flex-col items-start justify-center gap-2">
                        <label className="text-xl font-bold font-(family-name:--font-display) tracking-tight">
                            Email:
                        </label>
                        <input
                            type="text"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-(--color-surface) text-(--color-muted) placeholder:text-(--color-muted) border border-(--color-border) focus:outline-none rounded-[3px] px-2 py-1"
                        />
                        <label className="text-xl font-bold font-(family-name:--font-display) tracking-tight">
                            Password:
                        </label>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-(--color-surface) text-(--color-muted) placeholder:text-(--color-muted) border border-(--color-border) focus:outline-none rounded-[3px] px-2 py-1"
                        />
                        {error && (
                            <p className="self-center font-semibold mt-4">{error}</p>
                        )}
                        <button onClick={() => signIn()} className="font-semibold py-1 px-2 self-center my-4 rounded-[3px] border bg-(--color-accent) text-(--color-bg) border-(--color-border)">
                            {loading ? "..." : "Sign In"}</button>
                        <button onClick={() => setTab("signup")} className="underline self-center">Don&apos;t have an account? Sign Up.</button>
                    </div>
                )
                : (
                    <div className="flex flex-col items-start justify-center gap-2">
                        <label className="text-xl font-bold font-(family-name:--font-display) tracking-tight">
                            Email:
                        </label>
                        <input
                            type="text"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-(--color-surface) text-(--color-muted) placeholder:text-(--color-muted) border border-(--color-border) focus:outline-none rounded-[3px] px-2 py-1"
                        />
                        <label className="text-xl font-bold font-(family-name:--font-display) tracking-tight">
                            Username:
                        </label>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-(--color-surface) text-(--color-muted) placeholder:text-(--color-muted) border border-(--color-border) focus:outline-none rounded-[3px] px-2 py-1"
                        />
                        <label className="text-xl font-bold font-(family-name:--font-display) tracking-tight">
                            Password:
                        </label>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-(--color-surface) text-(--color-muted) placeholder:text-(--color-muted) border border-(--color-border) focus:outline-none rounded-[3px] px-2 py-1"
                        />
                        <label className="text-xl font-bold font-(family-name:--font-display) tracking-tight">
                            Re-Type Password:
                        </label>
                        <input
                            type="password"
                            placeholder="Password"
                            value={passwordAgain}
                            onChange={(e) => setPasswordAgain(e.target.value)}
                            className="w-full bg-(--color-surface) text-(--color-muted) placeholder:text-(--color-muted) border border-(--color-border) focus:outline-none rounded-[3px] px-2 py-1"
                        />
                        {error && (
                            <p className="self-center font-semibold mt-4">{error}</p>
                        )}
                        <button onClick={() => signUp()} className="font-semibold py-1 px-2 self-center my-4 rounded-[3px] border bg-(--color-accent) text-(--color-bg) border-(--color-border)">
                            {loading ? "..." : "Sign Up"}</button>
                        <button onClick={() => setTab("signin")} className="underline self-center">Already have an account? Sign In.</button>
                    </div>
                )}
        </Modal>
    )

}