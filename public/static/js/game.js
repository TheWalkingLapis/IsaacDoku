import { get_today, fetch_file_cached } from "./utils.js";
import { Item, ItemList } from "./item.js";

import { IsaacDoku } from "./isaac_doku.js";
import { ItemSearch, ItemShow } from "./item_search.js";
import { UI } from "./ui.js";

const refs = {};

async function start_game() {
    refs.itemList = await ItemList.create();

    const seed = get_today();
    refs.search = new ItemSearch(document.querySelector("#item-search"), refs.itemList.get_all(), (itemId) => { refs.game.make_guess(itemId) });
    refs.itemShow = new ItemShow(document.querySelector("#item-show"));
    refs.ui = new UI(document.querySelector("#ui"), 3);

    const callbackDict = {
        "win": end_game,
        "dead": end_game,
        "setHP": set_hp,
    }
    refs.game = await IsaacDoku.create({seed: seed, callbacks: callbackDict});
}

async function end_game() {
    if (!refs.game) {
        return;
    }
    // TODO split in win and loose

    refs.ui.skill_issue_visibility(true);
    setTimeout(() => {
        document.addEventListener("click", async () => {
            refs.ui.skill_issue_visibility(false);

            const solution = await refs.game.solution();
            const playerPicks = refs.game.grid.compare(solution);
            refs.game.grid.change_to_solution(solution, refs.itemShow);
        }, { once: true });
    }, 0);
}

async function retry() {
    if (!refs.game) {
        return;
    }

    refs.itemShow.clear();
    refs.game.reset();
    refs.ui.reset();
}

function set_hp(hp) {
    refs.ui.set_hp(hp);
}

const endGameButton = document.querySelector("#end-game");
endGameButton.onclick = end_game;

const retryButton = document.querySelector("#retry");
retryButton.onclick = retry;

await start_game();