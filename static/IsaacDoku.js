async function get_daily() {
  const res = await fetch("/data/daily");
  const data = await res.json();
  return data
}

function get_today() {
  return new Date().toJSON().split("T")[0];
}

function get_storage_guesses() {
  const storedDate = localStorage.getItem("date");
  if (storedDate == get_today()) {
    const guesses = JSON.parse(localStorage.getItem("guesses"));
    return guesses;
  }
}

function add_guess_to_storage(guess) {
  localStorage.setItem("date", get_today());
  const stored = localStorage.getItem("guesses");
  const guesses = stored ? JSON.parse(stored) : [];
  guesses.push(guess);
  localStorage.setItem("guesses", JSON.stringify(guesses));
}

function set_cell_state(selectedCell, desiredState) {
  const cells = selectedCell.parentNode.querySelectorAll("button.cell");
  switch (desiredState) {
    case "active":
      make_cell_active(selectedCell, selectedCell);
      break;
    case "inactive":
      selectedCell.setAttribute("state", "inactive");
      break
    case "solved":
      selectedCell.setAttribute("state", "solved");
      break
  }
}

function make_cell_active(selectedCell) {
  const cells = selectedCell.parentNode.querySelectorAll("button.cell");
  for (let cell of cells) {
    const activate = cell == selectedCell;
    const state = cell.getAttribute("state");
    if (activate) {
      if (state == "active") {
        // continue
        cell.setAttribute("state", "solved");
      } else if (state == "solved") {
        // do nothing when solved cell was clicked
        break
      } else if (state == "inactive") {
        cell.setAttribute("state", "active");
      }
    } else {
      if (state == "active") {
        // reset
        cell.setAttribute("state", "inactive");
      } else if (state == "solved") {
        // do nothing with unclicked solved cell
        continue
      } else if (state == "inactive") {
        // do nothing with unclicked inactive cell
        continue
      }
    }
  }
}

function get_cell_from_categories(grid, row, col) {
  const cells = grid.querySelectorAll("button.cell");
  for (let cell of cells) {
    if (cell.getAttribute("row") == row && cell.getAttribute("col") == col) {
      return cell;
    }
  }
}

function get_active_cell(grid) {
  const cells = grid.querySelectorAll("button.cell");
  for (let cell of cells) {
    const active = cell.getAttribute("state") == "active";
    if (active) {
      return cell;
    }
  }
  return null;
}

async function setup_grid(categories) {
  const grid = document.getElementById("game-grid");

  const rows = categories["rows"];
  const cols = categories["cols"];

  for (let i = 0; i < 3; i++) {
    const row = grid.querySelector("#row"+i+"-label");
    row.textContent = rows[i];
    const col = grid.querySelector("#col"+i+"-label");
    col.textContent = cols[i];

    for (let j = 0; j < 3; j++) {
      const cell = grid.querySelector("#cell"+i+""+j);
      cell.setAttribute("row", rows[i]);
      cell.setAttribute("col", cols[j]);
      cell.textContent = i+j;

      cell.addEventListener("click", (e) => {
        set_cell_state(cell, "active");
      })
    }
  }
  
  const previousGuesses = get_storage_guesses();
  if (previousGuesses) {
    let remainingTries = 1;
    for (const guess of previousGuesses) {
      const response = await submit_item_for_categories(guess["id"], [guess["row"], guess["col"]])
      remainingTries = response["remainingTries"];
      const correct = response["correct"];
      console.log(guess, response);
      if (correct) {
        // TODO instead of setting state in callback, ask server for cell states afterwards
        // for all cells and only set to inactive here
        const cell = get_cell_from_categories(grid, guess["row"], guess["col"]);
        set_cell_state(cell, "solved");
      }
    }
  }
}

async function get_items() {
  const res = await fetch("/data/items");
  const data = await res.json();
  return data
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

async function init_item_search() {
  // setup datalist for allowed values and autocomplete:
  
  const div = document.querySelector("#item-search");
  const datalist = document.createElement("datalist");
  datalist.setAttribute("id", "item-search-datalist");
  const items = await get_items();
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
    const selectedValue = e.target.value.trim();

    const selectedOption = Array.from(datalist.options).find(
      option => option.value === selectedValue
    );
  
    if (selectedOption) {
      e.target.value = "";

      // submit item
      const activeCell = get_active_cell(document); // only one grid atm, so just global
      const guess = {
        "id": selectedOption.getAttribute("item-id"),
        "row": activeCell.getAttribute("row"),
        "col": activeCell.getAttribute("col"),
      }
      if (activeCell != null) {
        const response = await submit_item_for_categories(guess["id"], [guess["row"], guess["col"]]);
        
        const correct = response["correct"];
        const remainingTries = response["remainingTries"];
        console.log(correct, activeCell, guess);
        add_guess_to_storage(guess);
        if (correct) {
          // TODO instead of setting state in callback, ask server for cell states afterwards
          // for all cells and only set to inactive here
          set_cell_state(activeCell, "solved");
        }
      }
    }
  });
}

await init_item_search();

const daily = await get_daily();
await setup_grid(daily);


