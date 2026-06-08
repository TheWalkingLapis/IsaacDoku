import { is_item_in_categories } from "./isaac_utils.js";
import { get_today } from "./utils.js";

export class Guess {
  constructor(id, rowCatID, colCatID) {
    this.id = id;
    this.rowCatID = rowCatID;
    this.colCatID = colCatID;
  }

  async submit() {
    return await is_item_in_categories(this.id, this.rowCatID, this.colCatID);
  }
}

export class GuessHistory {
  constructor(storageID) {

    this.storageKey = storageID + "_guessHistory";
    this.guesses = [];

    // check if guesses are present in localStorage
    try {
      const storedGuesses = JSON.parse(localStorage[this.storageKey]);
      for (const storedGuess of storedGuesses) {
        const guess = new Guess(storedGuess["id"], storedGuess["rowCatID"], storedGuess["colCatID"]);
        this.guesses.push(guess);
      }
    } catch (e) {
      this.guesses = [];
    }
  }

  add_guess(guess) {
    this.guesses.push(guess);
    this.update_localStorage();
  }

  clear() {
    this.guesses = [];
    this.update_localStorage();
  }

  update_localStorage() {
    const json_str = JSON.stringify(this.guesses);
    localStorage[this.storageKey] = json_str;
  }

  async replay(guessCallback) {
    for (const guess of this.guesses) {
      await guessCallback(-1, guess);
    }
  }
}