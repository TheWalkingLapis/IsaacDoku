import { get_today, fetch_file_cached } from "./utils.js";
import { Item, ItemList } from "./item.js";

import { IsaacDoku } from "./isaac_doku.js";
import { ItemSearch } from "./item_search.js";

let currentGame = null;

async function start_game() {
    const itemList = await ItemList.create();

    const seed = get_today();
    const game = await IsaacDoku.create(seed);

    const search = new ItemSearch(document.querySelector("#item-search"), itemList.get_all(), (itemId) => { game.make_guess(itemId) });
    currentGame = game;
}

async function end_game() {
    if (!currentGame) {
        return;
    }

    const solution = await currentGame.solution();
    const playerPicks = currentGame.grid.compare(solution);

    console.log(solution);
}

async function retry() {
    if (!currentGame) {
        return;
    }

    currentGame.reset()
}

const endGameButton = document.querySelector("#end-game");
endGameButton.onclick = end_game;

const retryButton = document.querySelector("#retry");
retryButton.onclick = retry;

await start_game();