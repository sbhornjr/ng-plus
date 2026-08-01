import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import ListPreview from "@/app/components/ListPreview";
import CreateListButton from "@/app/components/CreateListButton";

type ListsPageProps = {
    params: Promise<{ username: string }>
}

type ListType = {
    id: number,
    name: string,
    description: string,
    is_public: boolean,
    is_default: boolean,
    is_pinned: boolean,
    created_at: string,
    last_activity: string,
    game_count: number
}

type GameCover = {
  coverImageUrl: string | null
  slug: string | null
}

export default async function ListsPage({ params }: ListsPageProps) {
    const { username } = await params;
    const supabase = await createClient()
    const { data: { user: viewer } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('users')
        .select('id, username, display_name, avatar_url')
        .eq('username', username)
        .single()

    if (!profile) notFound()
    const isOwnProfile = viewer?.id === profile.id

    const { data: listsData } = await supabase.rpc('get_user_lists', { p_user_id: profile.id, p_include_private: isOwnProfile })
    const lists = listsData ? listsData as ListType[] : []
    const listIds = lists?.map(l => l.id) ?? []

    const { data: listGames } = await supabase
        .from('list_games')
        .select('list_id, position, games(cover_image_url, slug)')
        .in('list_id', listIds)
        .order('position', { ascending: true })

    const coversByList = new Map<string, GameCover[]>()

    for (const entry of listGames ?? []) {
        const existing = coversByList.get(entry.list_id) ?? []
        if (existing.length < 5) {
            const game = entry.games as unknown as { cover_image_url: string | null, slug: string } | null
            existing.push({
                coverImageUrl: game?.cover_image_url ?? null,
                slug: game?.slug ?? null
            })
            coversByList.set(entry.list_id, existing)
        }
    }

    return (
        <main>
            <div className="flex flex-col gap-2 mt-6">
                <h2 className="text-4xl font-bold font-(family-name:--font-display) text-center mb-4">{username}'s Lists</h2>
                {viewer && viewer.id && isOwnProfile && <CreateListButton userId={viewer?.id}/>}
                {lists.map(l => <ListPreview key={l.id} listId={l.id} username={username} listName={l.name} isPinned={l.is_pinned} isPinnable={true} 
                    lastUpdated={l.last_activity} description={l.description} gameCovers={coversByList.get(String(l.id))} listCount={l.game_count}/>)}
            </div>
        </main>
    )
}