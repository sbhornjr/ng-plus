import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import ListPreview from "@/app/components/ListPreview";
import CreateListButton from "@/app/components/CreateListButton";
import Link from "next/link";

type ListsPageProps = {
    params: Promise<{ username: string, tab?: string }>
    searchParams: Promise<{ tab?: string }>
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
    game_count: number,
    owner_username: string,
    owner_avatar_url: string | null,
    owner_id: string
}

type GameCover = {
  coverImageUrl: string | null
  slug: string | null
}

export default async function ListsPage({ params, searchParams }: ListsPageProps) {
    const { username } = await params;
    const { tab } = await searchParams;
    const supabase = await createClient()
    const { data: { user: viewer } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('users')
        .select('id, username, display_name, avatar_url')
        .eq('username', username)
        .single()

    if (!profile) notFound()
    const isOwnProfile = viewer?.id === profile.id

    const { data: listsData } = !tab || tab === 'user' 
        ? await supabase.rpc('get_user_lists', { p_user_id: profile.id, p_include_private: isOwnProfile })
        : await supabase.rpc('get_liked_lists', { p_user_id: profile.id })
    
    const lists = listsData ? listsData as ListType[] : []
    
    const listIds = lists.map(l => l.id) ?? []

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

    const { data: likesData } = await supabase
        .from('list_likes')
        .select('list_id, user_id')
        .in('list_id', listIds)

    const likeCountMap = new Map<string, number>()
    const userLikedSet = new Set<string>()

    for (const like of likesData ?? []) {
        likeCountMap.set(like.list_id, (likeCountMap.get(like.list_id) || 0) + 1)
        if (viewer && like.user_id === viewer.id) {
            userLikedSet.add(like.list_id)
        }
    }

    return (
        <main>
            <div className="flex flex-col gap-2 mt-6">
                <h2 className="text-4xl font-bold font-(family-name:--font-display) text-center mb-4">{username}'s Lists</h2>
                <div className="flex gap-4 border-b border-[#2a2a35] mb-8 justify-center">
                    <Link
                        href={`/user/${username}/lists`}
                        className={`px-4 py-2 text-sm font-semibold transition-colors duration-200
                            border-b-2 -mb-px
                            ${!tab || tab === 'user'
                                ? 'border-[#00d4aa] text-[#00d4aa]'
                                : 'border-transparent text-[#8b8b9a] hover:text-[#f0f0f0]'}`}
                    >
                        {isOwnProfile ? 'My Lists' : `${username}'s Lists`}
                    </Link>
                    <Link
                        href={`/user/${username}/lists?tab=liked`}
                        className={`px-4 py-2 text-sm font-semibold transition-colors duration-200
                        border-b-2 -mb-px
                        ${tab === 'liked'
                            ? 'border-[#00d4aa] text-[#00d4aa]'
                            : 'border-transparent text-[#8b8b9a] hover:text-[#f0f0f0]'}`}
                    >
                        Liked Lists
                    </Link>
                </div>
                {viewer && viewer.id && isOwnProfile && <CreateListButton userId={viewer?.id}/>}
                {lists.map(l => 
                    <ListPreview 
                        key={l.id} 
                        listId={l.id} 
                        username={l.owner_username} 
                        listName={l.name} 
                        isPinned={l.is_pinned} 
                        isPinnable={l.owner_id === viewer?.id} 
                        isLikable={l.owner_id !== viewer?.id}
                        lastUpdated={l.last_activity} 
                        description={l.description} 
                        gameCovers={coversByList.get(String(l.id))} 
                        listCount={l.game_count}
                        likeCount={likeCountMap.get(String(l.id)) ?? 0} 
                        userHasLiked={userLikedSet.has(String(l.id))} 
                        activeUserId={viewer?.id} />)}
            </div>
        </main>
    )
}