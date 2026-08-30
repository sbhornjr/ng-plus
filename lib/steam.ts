import { SteamOwnedGames } from "@/types/steam"
import { logger } from "./logger";

const STEAM_API_BASE = 'https://api.steampowered.com'

export async function getOwnedGames(steamId: string): Promise<SteamOwnedGames> {
    const url = `${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v1/?key=${process.env.STEAM_API_KEY!}&steamid=${steamId}&format=json&include_played_free_games=true&include_appinfo=true`

    const res = await fetch(url)

    if (!res.ok) {
        logger.error("lib:steam", `GetOwnedGames failed with status ${res.status}`, { steamId })
        throw new Error(`Steam GetOwnedGames failed with status ${res.status}`)
    }

    const { response } = await res.json()

    // response is `{}` (no game_count/games) when the profile's game
    // details aren't public — callers should check for that explicitly
    // rather than treating it as "owns zero games"
    return {
        game_count: response.game_count,
        games: response.games,
    }
}
