import { get_today, fetch_file_cached } from "./utils.js";
import { Item, ItemList } from "./item.js";

import { IsaacDoku } from "./isaac_doku.js";
import { ItemSearch, ItemShow } from "./item_search.js";

const refs = {};

async function start_game() {
    refs.itemList = await ItemList.create();

    const seed = get_today();
    refs.game = await IsaacDoku.create(seed);

    refs.search = new ItemSearch(document.querySelector("#item-search"), refs.itemList.get_all(), (itemId) => { game.make_guess(itemId) });
    refs.itemShow = new ItemShow(document.querySelector("#item-show"));
}

async function end_game() {
    if (!refs.game) {
        return;
    }

    const solution = await refs.game.solution();
    const playerPicks = refs.game.grid.compare(solution);
    refs.game.grid.change_to_solution(solution, refs.itemShow);
}

async function retry() {
    if (!refs.game) {
        return;
    }

    refs.game.reset()
}

const endGameButton = document.querySelector("#end-game");
endGameButton.onclick = end_game;

const retryButton = document.querySelector("#retry");
retryButton.onclick = retry;

await start_game();