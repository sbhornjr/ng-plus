"use client"

import { useState, useEffect } from "react"
import AuthModal from "@/app/components/AuthModal"
import { useUser } from "@/app/components/UserContext"
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from "next/navigation"

export default function RateReviewButton({ game_id, existing_rating_review } : 
    { game_id: string, existing_rating_review: { rating: number, review: string | null, user_id: string, created_at: string, updated_at: string } | null | undefined}) {
    const { user } = useUser()
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [isRateReviewModalOpen, setIsRateReviewModalOpen] = useState(false)
    const [existingRatingReview, setExistingRatingReview] = useState<{ rating: number, review: string | null, user_id: string, created_at: string, updated_at: string } | null | undefined>(existing_rating_review)
    const [rating, setRating] = useState(existingRatingReview ? existingRatingReview.rating : "6")
    const [ratingLabel, setRatingLabel] = useState("")
    const [review, setReview] = useState(existingRatingReview?.review ?? "")
    const router = useRouter()

    function setLabel(value: string) {
        switch (value) {
            case "1":
                setRatingLabel("Might be the worst game I've ever played.")
                break
            case "2":
                setRatingLabel("It was really really bad.")
                break
            case "3":
                setRatingLabel("I didn't really like it.")
                break
            case "4":
                setRatingLabel("I couldn't get into it.")
                break
            case "5":
                setRatingLabel("Meh. It was fine.")
                break
            case "6":
                setRatingLabel("It was alright.")
                break
            case "7":
                setRatingLabel("Pretty solid game.")
                break
            case "8":
                setRatingLabel("This game was really good.")
                break
            case "9":
                setRatingLabel("Incredible game.")
                break
            case "10":
                setRatingLabel("Might be the best game I've ever played.")
                break
            default:
                setRatingLabel("This is definitely a bug.")
                break
        }
    }

    function handleRatingChange(value: string) {
        setRating(value)
        setLabel(value)
    }

    async function handleSubmit() {
        if (!user) return

        const supabase = createClient()

        if (existingRatingReview) {
            const { data } = await supabase
                .from('ratings_reviews')
                .update({ rating: rating, review: review })
                .eq("user_id", user.id)
                .eq("game_id", game_id)
                .select("rating, review, user_id, created_at, updated_at")
                .single()
            setExistingRatingReview(data)
        }
        else {
            const { data } = await supabase
                .from('ratings_reviews')
                .insert({ user_id: user.id, game_id: game_id, rating: rating, review: review })
                .select("rating, review, user_id, created_at, updated_at")
                .single()
            setExistingRatingReview(data)
        }

        setIsRateReviewModalOpen(false)
        router.refresh()
    }

    return (
        <div className="mb-2">
            { user == null ? (
                <button onClick={() => setIsAuthModalOpen(true)} className="px-4 py-1 text-xl bg-[#00d4aa] text-[#0e0e10] font-semibold rounded-lg hover:bg-[#00b894] transition-colors duration-200">
                    Sign in to Rate and Review
                </button>
            ) : existingRatingReview == null ? (
                <button onClick={() => setIsRateReviewModalOpen(true)} className="px-4 py-1 text-xl bg-[#00d4aa] text-[#0e0e10] font-semibold rounded-lg hover:bg-[#00b894] transition-colors duration-200">
                    Rate and Review
                </button>
            ) : <button onClick={() => setIsRateReviewModalOpen(true)} className="px-4 py-1 text-xl bg-[#00d4aa] text-[#0e0e10] font-semibold rounded-lg hover:bg-[#00b894] transition-colors duration-200">
                    Update Rating and Review
                </button>
            }
            {isAuthModalOpen && (
                <AuthModal isOpen={true} defaultTab={"signin"} onClose={() => setIsAuthModalOpen(false)}></AuthModal>
            )}
            {isRateReviewModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm w-full h-full flex flex-col items-center justify-center z-50">
                    <div className="bg-[#1a1a1f] border border-[#2a2a35] rounded-2xl w-full max-w-md p-8 relative flex flex-col">
                        <button onClick={() => setIsRateReviewModalOpen(false)} className="mb-4 self-end text-[#8b8b9a] border border-[#5a5a6e] bg-[#2a2a35] rounded-4xl px-2 py-1">X</button>
                        <h2 className="font-semibold text-3xl mb-6 self-center">
                            {existingRatingReview ? "Update Rating and Review" : "Rate and Review"}
                        </h2>
                        <div className="flex gap-1 justify-center my-1">
                            {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                <button
                                    key={n}
                                    onClick={() => handleRatingChange(String(n))}
                                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-all duration-200
                                        ${Number(rating) === n 
                                        ? 'bg-[#00d4aa] text-[#0e0e10]' 
                                        : 'bg-[#2a2a35] text-[#8b8b9a] hover:bg-[#3a3a45]'}`}
                                    >
                                    {n}
                                </button>
                            ))}
                        </div>
                        <p className="text-md text-[#8b8b9a] text-center my-2">{ratingLabel}</p>
                        <div className="flex flex-col gap-1 items-center mb-4">
                            <p className="self-start text-md text-[#8b8b9a]">Would you like to leave a review? (Optional)</p>
                            <textarea
                                placeholder="Leave a review..."
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                rows={4}
                                className="w-full bg-[#1a1a24] text-[#8b8b9a] placeholder:text-[#5a5a6e] 
                                    border border-[#2a2a35] focus:outline-none focus:border-[#00d4aa]
                                    rounded-lg px-3 py-2 resize-none"
                            />
                        </div>
                        <button onClick={() => handleSubmit()} className="w-32 px-4 py-1 text-xl bg-[#00d4aa] text-[#0e0e10] font-semibold self-center rounded-lg transition-all duration-200 group-hover:bg-[#00b894]">
                            Submit
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}