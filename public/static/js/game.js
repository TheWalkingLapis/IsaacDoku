import { IsaacDoku } from "./isaac_doku.js";
import { get_today, fetch_file_cached } from "./utils.js";

let currentGame = null;

async function start_game() {
    const seed = get_today();
    const game = await IsaacDoku.create(seed);
    currentGame = game;
}

await start_game();