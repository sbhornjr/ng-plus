import { createClient } from "@/lib/supabase-server";
import FeedItem from "@/app/components/feed/FeedItem";
import { redirect } from "next/navigation";

type FeedItem = {
	activity_type: string
	created_at: string
	actor_id: string
	actor_username: string
	actor_avatar_url: string | null
	game_id: string | null
	game_name: string | null
	game_slug: string | null
	game_cover_image_url: string | null
	game_released: string | null
	game_metacritic_score: number | null
	game_developer: string | null
	game_avg_rating: number | null
	viewer_game_rating: number | null
	list_id: string | null
	list_name: string | null
	list_description: string | null
	list_owner_username: string | null
	list_game_count: number | null
	list_last_activity: string | null
	list_like_count: number | null
	viewer_liked_list: boolean | null
	rating: number | null
	review: string | null
	review_created_at: string | null
	review_updated_at: string | null
	library_status: string | null
}

export default async function Home() {
	const supabase = await createClient()

	const { data: { user: viewer } } = await supabase.auth.getUser()

	if (!viewer) {
		redirect("/games")
	}

	const { data: feedData } = await supabase.rpc("get_feed", { p_user_id: viewer?.id })

	const feed = feedData ? feedData as FeedItem[] : []

	console.log(feedData)
	console.log(feed)

	return (
		<main>
			<section className="flex flex-col items-center justify-center px-6 pt-10 pb-8 text-center">
				<p className="text-[#00d4aa] text-xs font-semibold tracking-widest uppercase mb-1 font-(family-name:--font-display)">
					Your gaming identity
				</p>
				<h1 className="text-7xl font-bold mb-4 font-(family-name:--font-display) tracking-tight">
					NG<span className="text-[#00d4aa]">+</span>
				</h1>
			</section>

			<section className="w-full max-w-3xl mx-auto px-6 pb-16 flex flex-col gap-3">
				{feed && feed.map(item => ( <FeedItem key={item.created_at} item={item} userId={viewer?.id} /> ))}
			</section>
		</main>
	)
}