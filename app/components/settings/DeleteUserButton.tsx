"use client"

import { createClient } from "@/lib/supabase-browser";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/app/components/util/Modal";
import { signOut } from "@/lib/queries/user";

export default function DeleteAccountButton() {
    const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false)
    const router = useRouter()

    async function deleteAccount() {
        const supabase = createClient()
        const res = await fetch('/api/delete-account', { method: 'DELETE' })
        if (res.ok) {
            await signOut(supabase)
            router.push('/')
        }
    }

    return (
        <div>
            <button onClick={() => setIsDeleteUserModalOpen(true)} className="px-4 py-1 text-md bg-(--color-bad) text-(--color-bg) font-semibold rounded-[3px] hover:bg-(--color-bad-hover) transition-colors duration-200">
                Delete Account
            </button>
            {isDeleteUserModalOpen &&
                <Modal
                    onClose={() => setIsDeleteUserModalOpen(false)}
                    title="Delete Account"
                    panelClassName="w-full max-w-md max-h-8/10 p-8 overflow-y-auto"
                >
                    <p className="font-semibold text-lg text-(--color-muted)">Are you sure? This permanently deletes your account and all your data. This cannot be undone.</p>
                    <button onClick={() => deleteAccount()} className="px-4 py-1 mt-4 text-md bg-(--color-bad-hover) text-(--color-bg) font-semibold rounded-[3px] hover:bg-(--color-accent-hover) transition-colors duration-200">
                        Delete Account
                    </button>
                </Modal>
            }
        </div>
    )
}
