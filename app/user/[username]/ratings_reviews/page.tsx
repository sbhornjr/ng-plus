import { createClient } from "@/lib/supabase-server";
import Rating from "@/app/components/game/ReviewPageRating";
import Review from "@/app/components/game/ReviewPageReview";
import Pagination from "@/app/components/util/Pagination";
import RatingsReviewsFilters from "@/app/components/game/RatingsReviewsFilters";
import { redirect } from "next/navigation";
import { getViewer, getProfileSummaryByUsername } from "@/lib/queries/user";
import { getUserRatingsReviewsPage, getUserRatingsReviewsCounts } from "@/lib/queries/review";
import { getDeveloperNameMap } from "@/lib/queries/game";

type RatingsPageProps = {
    params: Promise<{ username: string }>
    searchParams: Promise<{ filter: string, sort: string, order: string, page: number, pageSize: number }>
}

export default async function RatingsPage({ params, searchParams }: RatingsPageProps) {
    const { username } = await params;
    const { filter, sort, order, page, pageSize } = await searchParams
    const currentPage = Number(page ?? 1)
    const currentPageSize = Number(pageSize ?? 10)
    const supabase = await createClient()
    const viewer = await getViewer(supabase)

    if (filter && !(filter === "all" || filter === "ratings" || filter === "reviews")) {
        console.log("Filter " + filter + " is not valid. Redirecting to home.")
        redirect('/')
    }

    if (sort && !(sort === "date" || sort === "rating")) {
        console.log("Sort " + sort + " is not valid. Redirecting to home.")
        redirect('/')
    }

    if (order && !(order === "desc" || order === "asc")) {
        console.log("Order" + order + " is not valid. Redirecting to home.")
        redirect('/')
    }

    // Narrowed + defaulted now that the checks above have ruled out anything else.
    const filterValue: "all" | "ratings" | "reviews" = filter === "ratings" || filter === "reviews" ? filter : "all"
    const sortValue: "date" | "rating" = sort === "rating" ? "rating" : "date"
    const orderValue: "desc" | "asc" = order === "asc" ? "asc" : "desc"

    const profile = await getProfileSummaryByUsername(supabase, username)

    const [ratingsReviews, ratingsReviewsCounts] = await Promise.all([
        getUserRatingsReviewsPage(supabase, {
            userId: profile?.id,
            filter: filterValue,
            sort: sortValue,
            order: orderValue,
            limit: currentPageSize,
            offset: (currentPage - 1) * currentPageSize
        }),
        getUserRatingsReviewsCounts(supabase, profile?.id)
    ])

    const totalCount = ratingsReviews?.[0]?.total_count ?? 0
    const totalPages = Math.ceil(totalCount / currentPageSize)

    const developerMap = await getDeveloperNameMap(supabase, ratingsReviews?.map(rr => rr.game_id) ?? [])

    return (
        <main>
            <div className="flex flex-col gap-2 mt-6 items-center justify-center">
                <h2 className="text-5xl font-bold font-(family-name:--font-display) text-center mb-2">{username}'s Ratings and Reviews</h2>
                <div className="flex items-center justify-center gap-4 text-sm text-(--color-muted) mb-4">
                    <span className="text-md font-semibold font-(family-name:--font-display) text-(--color-muted)">{ratingsReviewsCounts[0].rating_count} ratings</span>
                    <span>·</span>
                    <span className="text-md font-semibold font-(family-name:--font-display) text-(--color-muted)">{ratingsReviewsCounts[0].review_count} reviews</span>
                    <span>·</span>
                    <span className="text-md font-semibold font-(family-name:--font-display) text-(--color-muted)">{ratingsReviewsCounts[0].total_count} total</span>
                </div>
                {ratingsReviews && ratingsReviews.length > 0 ? (
                    <div className="flex flex-col gap-4 w-2/3 mb-4">
                        <RatingsReviewsFilters username={username} filter={filterValue} page={String(currentPage)} pageSize={String(currentPageSize)} sort={sortValue} order={orderValue} />
                        {ratingsReviews.map(rr => (
                            rr.review == "" ? (
                                <Rating key={rr.game_id} slug={rr.game_slug} name={rr.game_name} cover={rr.game_cover_image_url} developer={developerMap.get(rr.game_id)} released={rr.game_released} rating={rr.rating} createdAt={rr.updated_at} />
                            ) : (
                                <Review key={rr.game_id} slug={rr.game_slug} name={rr.game_name} cover={rr.game_cover_image_url} developer={developerMap.get(rr.game_id)} released={rr.game_released} rating={rr.rating} review={rr.review} createdAt={rr.updated_at} />
                            )
                        ))}
                    </div>
                ) : (
                    <div>
                    </div>
                )}
                {!!totalCount && totalCount > 0 && 
                    <Pagination 
                        page={currentPage}
                        maxPages={totalPages}
                        params={{ filter: filterValue, sort: sortValue, order: orderValue, page: String(currentPage), pageSize: String(currentPageSize) }}
                        url={`user/${username}/ratings_reviews`}
                    />
                }
            </div>
        </main>
    )

}