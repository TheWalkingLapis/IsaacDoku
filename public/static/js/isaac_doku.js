import { ItemList } from "./item.js" ;
import { Grid, Cell, CELL_STATE } from "./grid.js";
import { Guess, GuessHistory } from "./guess.js";
import { RNG } from "./rng.js";
import { Category } from "./category.js";

import { pick_categories, items_in_categories, is_item_in_categories } from "./isaac_utils.js";
import * as util from "./utils.js"

export class IsaacDoku {
  // call using a dict!
  static async create({seed = "DEFAULT", callbacks = {}, custom = false, customCategories = [{}]}) {
    const isaacDoku = new IsaacDoku();

    isaacDoku.seed = seed;
    isaacDoku.custom = custom;
    isaacDoku.maxHp = 3;
    isaacDoku.hp = isaacDoku.maxHp;
    isaacDoku.solvedCells = 0;
    isaacDoku.rng = new RNG(isaacDoku.seed);
    isaacDoku.categories = custom ? customCategories : await pick_categories(isaacDoku.rng);
    isaacDoku.grid = new Grid(isaacDoku.categories["rows"], isaacDoku.categories["cols"]);
    isaacDoku.guessHistoy = new GuessHistory(isaacDoku.seed);
    isaacDoku.itemList = await ItemList.create();
    isaacDoku.callbacks = callbacks;

    await isaacDoku.guessHistoy.replay(isaacDoku.make_guess.bind(isaacDoku));

    return isaacDoku;
  }

  async reset() {
    this.grid.reset();
    this.solvedCells = 0;
    this.hp = this.maxHp;
    this.guessHistoy.clear();
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
      this.solvedCells += 1;
      activeCell.set_item(this.itemList.get(itemID));
      activeCell.set_state(CELL_STATE.SOLVED);
      if (this.solvedCells == 9) {
        if ("win" in this.callbacks) {
          this.callbacks["win"]();
        }
      }
    } else {

      this.hp -= 1
      if ("setHP" in this.callbacks) {
        this.callbacks["setHP"](this.hp);
      }
      if (this.hp <= 0) {
        if ("dead" in this.callbacks) {
          this.callbacks["dead"]();
        }
      }
    }
  }

  async solution() {
    const solutions = {}
    for (const row of this.categories.rows) {
      for (const col of this.categories.cols) {
        const ids = await items_in_categories(row, col);
        const items = ids.map(id => this.itemList.get(id));
        solutions[[row.id, col.id]] = items
      }
    }
    return solutions;
  }
}