import { ItemList } from "./item.js" ;
import { Grid, Cell, CELL_STATE } from "./grid.js";
import { Guess, GuessHistory } from "./guess.js";
import { RNG } from "./rng.js";
import { Category } from "./category.js";

import { pick_categories, is_item_in_categories } from "./isaac_utils.js";
import * as util from "./utils.js"

export class IsaacDoku {
  static async create(seed = "DEFAULT", custom = false, customCategories = [{}]) {
    const isaacDoku = new IsaacDoku();

    isaacDoku.seed = seed;
    isaacDoku.custom = custom;
    isaacDoku.rng = new RNG(isaacDoku.seed);
    isaacDoku.categories = custom ? customCategories : await pick_categories(isaacDoku.rng);
    isaacDoku.grid = new Grid(isaacDoku.categories["rows"], isaacDoku.categories["cols"]);
    isaacDoku.guessHistoy = new GuessHistory(isaacDoku.seed);
    isaacDoku.itemList = await ItemList.create();

    await isaacDoku.init_item_search();

    await isaacDoku.guessHistoy.replay(isaacDoku.make_guess.bind(isaacDoku));

    return isaacDoku;
  }

  async init_item_search() {
    // setup datalist for allowed values and autocomplete:
    const div = document.querySelector("#item-search");
    const datalist = document.createElement("datalist");
    datalist.setAttribute("id", "item-search-datalist");
    const items = this.itemList.get_all();
    for (const item of items) {
      const option = document.createElement("option");
      option.setAttribute("value", item.name());
      option.setAttribute("item-id", item.id());
      datalist.appendChild(option);
    }
    div.appendChild(datalist);

    // configure input event
    const itemSearch = document.querySelector("#item-search");
    itemSearch.addEventListener("input", async (e) => {
      const grid = this.get_active_grid();

      const selectedValue = e.target.value.trim();

      const selectedOption = Array.from(datalist.options).find(
        option => option.value === selectedValue
      );
    
      if (selectedOption) {
        e.target.value = "";

        // submit item
        this.make_guess(selectedOption.getAttribute("item-id"));
      }
    });
  }

  async make_guess(itemID, fromGuess=null) {
    let activeCell = this.grid.get_active_cell();
    if (fromGuess) {
      itemID = fromGuess.id;
      activeCell = this.grid.get_cell_from_category_ids(fromGuess.rowCatID, fromGuess.colCatID);
    }
    if (!activeCell) {
      return;
    }
    
    let guess = fromGuess;
    if (!guess) {
      guess = new Guess(itemID, activeCell.rowCat.id, activeCell.colCat.id);
      this.guessHistoy.add_guess(guess);
    }

    const correct = await guess.submit();
    if (correct) {
      activeCell.set_item(this.itemList.get(itemID));
      activeCell.set_state(CELL_STATE.SOLVED);
    }
  }

  get_active_grid() {
    return this.grid;
  }
}