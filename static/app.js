async function get_daily() {
  const res = await fetch("/data/daily");
  const data = await res.json();
  return data
}

function make_cell_active(grid=document, activateCell) {
  const cells = grid.querySelectorAll("button.cell");
  for (let cell of cells) {
    const activate = cell == activateCell;
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

function get_active_cell(grid=document) {
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
      cell.textContent = i+j;

      cell.addEventListener("click", (e) => {
        make_cell_active(grid, e.target);
      })
    }
  }
}

async function get_items() {
  const res = await fetch("/data/items");
  const data = await res.json();
  return data
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
  itemSearch.addEventListener("input", (e) => {
    const selectedValue = e.target.value.trim();

    const selectedOption = Array.from(datalist.options).find(
      option => option.value === selectedValue
    );
  
    if (selectedOption) {
      e.target.value = "";

      // submit item
      const activeCell = get_active_cell();
      if (activeCell != null) {
        console.log(activeCell, selectedOption);
      }
    }
  });
}

await init_item_search();

const daily = await get_daily();
await setup_grid(daily);


