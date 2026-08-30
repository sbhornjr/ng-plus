import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import AvatarUploader from "../components/user/AvatarUploader";
import ChangeUsernameButton from "../components/settings/ChangeUsernameButton";
import ChangeEmailButton from "../components/settings/ChangeEmailButton";
import ChangePasswordButton from "../components/settings/ChangePasswordButton";
import DeleteAccountButton from "../components/settings/DeleteUserButton";
import ChangePrivacyButton from "../components/settings/ChangePrivacyButton";
import { getViewer, getAccountSettings } from "@/lib/queries/user";
import { getSteamAccount } from "@/lib/queries/steam";
import UnlinkSteamAccountButton from "../components/settings/UnlinkSteamAccountButton";
import Link from "next/link";

type SettingsPageProps = {
    searchParams: Promise<{ steam_error?: string }>
}

export default async function Settings({ searchParams } : SettingsPageProps) {
    const { steam_error } = await searchParams
    const supabase = await createClient()
    const viewer = await getViewer(supabase)

    if (!viewer) redirect("/")

    const user = await getAccountSettings(supabase, viewer.id)

    if (!user) {
        console.log("User not found")
        redirect("/")
    }

    const steamUser = await getSteamAccount(supabase, viewer.id)

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
                        <p className="font-semibold text-lg text-(--color-muted)">Default List Privacy: <span className="text-[#ffffff]">{ user.default_list_public ? "Public" : "Private" }</span></p>
                        <ChangePrivacyButton currentPrivacy={user.default_list_public} type="Default List" userId={user.id} />
                    </div>
                    <div className="flex gap-2">
                        <p className="font-semibold text-lg text-(--color-muted)">Library Privacy: <span className="text-[#ffffff]">{ user.library_public ? "Public" : "Private" }</span></p>
                        <ChangePrivacyButton currentPrivacy={user.library_public} type="Library" userId={user.id} />
                    </div>
                    <div className="flex gap-2">
                        <p className="font-semibold text-lg text-(--color-muted)">Loadout Privacy: <span className="text-[#ffffff]">{ user.loadout_public ? "Public" : "Private" }</span></p>
                        <ChangePrivacyButton currentPrivacy={user.loadout_public} type="Loadout" userId={user.id} />
                    </div>
                </div>
                <div className="flex flex-col gap-4 mt-6">
                    <h2 className="text-3xl">Connections</h2>
                    <p className="font-semibold text-lg text-(--color-muted)">Steam: <span className="text-[#ffffff]">{ steamUser ? "Linked" : "Not Linked" }</span></p>
                    { steam_error === "1" && (
                        <p className="font-semibold text-sm text-(--color-bad)">Error linking Steam account</p>
                    )}
                    { steam_error === "2" && (
                        <p className="font-semibold text-sm text-(--color-bad)">Your Steam games library is private. To import Steam games, go to Steam Profile -{'>'} Edit Profile -{'>'} Privacy Settings -{'>'} Set &apos;Game Details&apos; to Public</p>
                    )}
                    { steamUser ? (
                        <div className="flex gap-2">
                            <Link href="/steamlink">
                                <button className="px-4 py-1 text-md bg-(--color-accent) text-(--color-bg) font-semibold rounded-[3px] hover:bg-(--color-accent-hover) transition-colors duration-200">
                                    Re-Sync Steam Account
                                </button>
                            </Link>
                            <UnlinkSteamAccountButton userId={user.id} />
                        </div>
                    ) : (
                        <Link href="/api/steam/link">
                            <button className="px-4 py-1 text-md bg-(--color-accent) text-(--color-bg) font-semibold rounded-[3px] hover:bg-(--color-accent-hover) transition-colors duration-200">
                                Link Steam Account
                            </button>
                        </Link>
                    )}
                </div>
            </div>
        </main>
    )
}