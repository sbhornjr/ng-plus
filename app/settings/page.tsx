import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import AvatarUploader from "../components/user/AvatarUploader";
import ChangeUsernameButton from "../components/user/ChangeUsernameButton";
import ChangeEmailButton from "../components/user/ChangeEmailButton";
import ChangePasswordButton from "../components/user/ChangePasswordButton";
import DeleteAccountButton from "../components/user/DeleteUserButton";
import { getViewer, getAccountSettings } from "@/lib/queries/user";

export default async function Settings() {
    const supabase = await createClient()
    const viewer = await getViewer(supabase)

    if (!viewer) redirect("/")

    const user = await getAccountSettings(supabase, viewer.id)

    if (!user) {
        console.log("User not found")
        redirect("/")
    }

    return (
        <main>
            <div className="w-full max-w-6xl mx-auto px-8 py-12 font-(family-name:--font-display)">
                <div className="flex gap-8 mb-4">
                    <AvatarUploader userId={user.id} username={user.username} currentAvatarUrl={user.avatar_url} />
                    <div className="flex flex-col">
                        <h2 className="text-3xl font-semibold font-(family-name:--font-display)">{user.username}</h2>
                        <div className="flex">
                            <p className="text-lg font-semibold font-(family-name:--font-display)">{user.selected_title}</p>
                        </div>
                        <p className="text-md font-semibold font-(family-name:--font-display) text-(--color-muted)">Member since {new Date(user.created_at).getMonth() + 1}/{new Date(user.created_at).getDate()}/{new Date(user.created_at).getFullYear()}</p>
                    </div>
                </div>
                <div className="flex flex-col gap-4 mt-6">
                    <h2 className="text-3xl">Account Settings</h2>
                    <div className="flex gap-2">
                        <p className="font-semibold text-lg text-(--color-muted)">Username: <span className="text-[#ffffff]">{user.username}</span></p>
                        <ChangeUsernameButton userId={user.id} currentUsername={user.username} />
                    </div>
                    <div className="flex gap-2">
                        <p className="font-semibold text-lg text-(--color-muted)">Email: <span className="text-[#ffffff]">{viewer.email}</span></p>
                        <ChangeEmailButton currentEmail={viewer.email!} />
                    </div>
                    <div className="flex gap-2">
                        <p className="font-semibold text-lg text-(--color-muted)">Password: <span className="text-[#ffffff]">********</span></p>
                        <ChangePasswordButton />
                    </div>
                    <DeleteAccountButton />
                </div>
                <div className="flex flex-col gap-4 mt-6">
                    <h2 className="text-3xl">Privacy Settings</h2>
                    <div className="flex gap-2">
                        <p className="font-semibold text-lg text-(--color-muted)">Default List Privacy: <span className="text-[#ffffff]">{user.default_list_public }</span></p>
                        <ChangeUsernameButton userId={user.id} currentUsername={user.username} />
                    </div>
                    <div className="flex gap-2">
                        <p className="font-semibold text-lg text-(--color-muted)">Email: <span className="text-[#ffffff]">{viewer.email}</span></p>
                        <ChangeEmailButton currentEmail={viewer.email!} />
                    </div>
                    <div className="flex gap-2">
                        <p className="font-semibold text-lg text-(--color-muted)">Password: <span className="text-[#ffffff]">********</span></p>
                        <ChangePasswordButton />
                    </div>
                    <DeleteAccountButton />
                </div>
            </div>
        </main>
    )
}