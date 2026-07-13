'use client'

import { useState } from "react"
import { createClient } from "@/lib/supabase-browser"
import { useRouter } from "next/navigation"

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
        const { error } = await supabase.auth.signInWithPassword({ email, password })
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
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { username } }
        })
        setLoading(false)
        if (error) {
            setError(error.message)
        } else {
            onClose()
            router.refresh()
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm w-full h-full flex flex-col items-center justify-center z-50">
            <div className="bg-[#1a1a1f] border border-[#2a2a35] rounded-2xl w-full max-w-md p-8 relative flex flex-col">
                <button onClick={onClose} className="mb-4 self-end text-[#8b8b9a] border border-[#5a5a6e] bg-[#2a2a35] rounded-4xl px-2 py-1">X</button>
                <h2 className="text-4xl font-bold font-(family-name:--font-display) tracking-tight self-center mb-4">
                    {tab == "signin" ? 'Sign In' : 'Sign Up'}
                </h2>
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
                            className="w-full bg-[#1a1a24] text-[#8b8b9a] placeholder:text-[#5a5a6e] border border-[#2a2a35] focus:outline-none rounded-lg px-2 py-1"
                        />
                        <label className="text-xl font-bold font-(family-name:--font-display) tracking-tight">
                            Password:
                        </label>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#1a1a24] text-[#8b8b9a] placeholder:text-[#5a5a6e] border border-[#2a2a35] focus:outline-none rounded-lg px-2 py-1"
                        />
                        {error && (
                            <p className="self-center font-semibold mt-4">{error}</p>
                        )}
                        <button onClick={() => signIn()} className="font-semibold py-1 px-2 self-center my-4 rounded-xl border bg-[#00d4aa] text-[#1a1a24] border-[#2a2a35]">
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
                            className="w-full bg-[#1a1a24] text-[#8b8b9a] placeholder:text-[#5a5a6e] border border-[#2a2a35] focus:outline-none rounded-lg px-2 py-1"
                        />
                        <label className="text-xl font-bold font-(family-name:--font-display) tracking-tight">
                            Username:
                        </label>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-[#1a1a24] text-[#8b8b9a] placeholder:text-[#5a5a6e] border border-[#2a2a35] focus:outline-none rounded-lg px-2 py-1"
                        />
                        <label className="text-xl font-bold font-(family-name:--font-display) tracking-tight">
                            Password:
                        </label>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#1a1a24] text-[#8b8b9a] placeholder:text-[#5a5a6e] border border-[#2a2a35] focus:outline-none rounded-lg px-2 py-1"
                        />
                        <label className="text-xl font-bold font-(family-name:--font-display) tracking-tight">
                            Re-Type Password:
                        </label>
                        <input
                            type="password"
                            placeholder="Password"
                            value={passwordAgain}
                            onChange={(e) => setPasswordAgain(e.target.value)}
                            className="w-full bg-[#1a1a24] text-[#8b8b9a] placeholder:text-[#5a5a6e] border border-[#2a2a35] focus:outline-none rounded-lg px-2 py-1"
                        />
                        {error && (
                            <p className="self-center font-semibold mt-4">{error}</p>
                        )}
                        <button onClick={() => signUp()} className="font-semibold py-1 px-2 self-center my-4 rounded-xl border bg-[#00d4aa] text-[#1a1a24] border-[#2a2a35]">
                            {loading ? "..." : "Sign Up"}</button>
                        <button onClick={() => setTab("signin")} className="underline self-center">Already have an account? Sign In.</button>
                    </div>
                )}   
            </div>
        </div>
    )

}