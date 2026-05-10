class Guess {
  constructor(id, row, col) {
    this.id = id;
    this.row = row;
    this.col = col;
  }

  async submit() {
    const response = await submit_item_for_categories(this.id, [this.row, this.col]);
    const correct = response["correct"];

    return correct;
  }
}

class GuessHistory {
  constructor(fromLocalStorage, ...guesses) {
    if (fromLocalStorage) {
      try {
        const storedGuesses = JSON.parse(localStorage["guesses"]);
        this.guesses = [];
        for (const storedGuess of storedGuesses) {
          const guess = new Guess(storedGuess["id"], storedGuess["row"], storedGuess["col"]);
          this.guesses.push(guess);
        }
      } catch (e) {
        this.guesses = [];
      }
    } else {
      this.guesses = guesses;
      this.update_localStorage();
    }
    // TODO read /store date as well, allow storage of multiple guess histories using an id (?)
    this.date = get_today();
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
    localStorage["guesses"] = json_str;
  }

  async replay(grid) {
    for (const guess of this.guesses) {
      const correct = await guess.submit();
      if (correct) {
        const targetCell = grid.get_cell_from_categories(guess.row, guess.col);
        if (targetCell) {
          grid.set_cell_state(targetCell, "solved");
          const img = targetCell.querySelector("img");
          img.src = "/data/items/" + guess.id;
        }
      }
    }
  }
}

// TODO class cell
// to handle seting image/text/state

class Grid {
  constructor(rows, cols, gridNodeID = "game-grid") {
    this.rows = rows;
    this.cols = cols;

    this.searchInput = document.querySelector("#item-search");

    this.guesses = new GuessHistory(true);
    this.gridNode = document.querySelector("#" + gridNodeID);
    // TODO handle nonexistet ID
    this.cornerNode = this.gridNode.querySelectorAll(".empty");
    this.cellNodes = this.gridNode.querySelectorAll(".cell");
    this.rowLabels = this.gridNode.querySelectorAll(".row-label");
    this.colLabels = this.gridNode.querySelectorAll(".col-label");

    this.setupCells();
  }

  setupCells() {
    for (const row of this.rowLabels) {
      row.textContent = this.rows[parseInt(row.id[3])];
    }
    for (const col of this.colLabels) {
      col.textContent = this.cols[parseInt(col.id[3])];
    }
    for (const cell of this.cellNodes) {
      const i = parseInt(cell.id[4]), j = parseInt(cell.id[5]);
      cell.setAttribute("row", this.rows[i]);
      cell.setAttribute("col", this.cols[j]);
      cell.textContent = "";

      const img = document.createElement("img");
      img.src = "/static/questionmark.png";
      img.alt = "-?-"

      const span = document.createElement("span");
      span.textContent = ""

      cell.appendChild(img);
      cell.appendChild(span);

      cell.addEventListener("click", (e) => {
        this.set_cell_state(cell, "active");
      });
    }
  }

  get_active_cell() {
    for (const cell of this.cellNodes) {
      const active = cell.getAttribute("state") == "active";
      if (active) {
        return cell;
      }
    }
  }
  
  set_cell_state(selectedCell, desiredState) {
    if (selectedCell.getAttribute("state") == "solved") {
      return;
    }
    if (desiredState == "active") {
        const activeCell = this.get_active_cell();
        if (activeCell) {
          activeCell.setAttribute("state", "inactive");
        }
        selectedCell.setAttribute("state", "active");
    } else if (desiredState == "inactive") {
      selectedCell.setAttribute("state", "inactive");
    } else if (desiredState == "solved") {
      selectedCell.setAttribute("state", "solved");
    }
  }

  get_cell_from_categories(row, col) {
    for (const cell of this.cellNodes) {
      if (cell.getAttribute("row") == row && cell.getAttribute("col") == col) {
        return cell;
      }
    }
  }

  async make_guess(itemID) {
    const activeCell = this.get_active_cell();
    if (!activeCell) {
      return;
    }
    const guess = new Guess(itemID, activeCell.getAttribute("row"), activeCell.getAttribute("col"));
    
    console.log(guess)
    this.guesses.add_guess(guess);
    const correct = await guess.submit();
    if (correct) {
      this.set_cell_state(activeCell, "solved");
      const img = activeCell.querySelector("img");
      img.src = "/data/items/" + itemID;
    }
  }
}

async function submit_item_for_categories(itemID, categories) {
  let form = {
    "id": itemID,
    "categories": categories,
  }
  const res = await fetch("/submit", {
      "method": "POST",
      "headers": {"Content-Type": "application/json"},
      "body": JSON.stringify(form),
  })
  const data = await res.json();
  return data;
}

function get_active_grid() {
  return grid;
}

async function init_item_search() {
  // setup datalist for allowed values and autocomplete:
  const div = document.querySelector("#item-search");
  const datalist = document.createElement("datalist");
  datalist.setAttribute("id", "item-search-datalist");
  const items = await fetch("/data/items").then((e) => e.json());
  for (let item of items) {
    const option = document.createElement("option");
    option.setAttribute("value", item["Name"]);
    option.setAttribute("item-id", item["ID"]);
    datalist.appendChild(option);
  }
  div.appendChild(datalist);

  // configure input event
  const itemSearch = document.querySelector("#item-search");
  itemSearch.addEventListener("input", async (e) => {
    const grid = get_active_grid();

    const selectedValue = e.target.value.trim();

    const selectedOption = Array.from(datalist.options).find(
      option => option.value === selectedValue
    );
  
    if (selectedOption) {
      e.target.value = "";

      // submit item
      grid.make_guess(selectedOption.getAttribute("item-id"));
    }
  });
}

async function get_daily() {
  const res = await fetch("/data/daily");
  const data = await res.json();
  return data
}

function get_today() {
  return new Date().toJSON().split("T")[0];
}

await init_item_search();

const daily = await get_daily();
const grid = new Grid(daily["rows"], daily["cols"]);
await grid.guesses.replay(grid);