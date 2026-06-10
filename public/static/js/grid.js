export const CELL_STATE = {
  INACTIVE: "inactive",
  ACTIVE: "active",
  SOLVED: "solved",
}

export class Cell {
  constructor(cellID, grid) {
    this.grid = grid;
    this.cellID = cellID;
    this.cellNode = grid.gridNode.querySelector("#" + cellID);
    this.rowCat = grid.rowCats[this.get_row_idx()];
    this.colCat = grid.colCats[this.get_col_idx()];

    this.item = null;
    
    this.set_attributes();
  }

  set_attributes() {
    this.cellNode.setAttribute("cell", this);
    this.cellNode.textContent = "";

    this.set_state(CELL_STATE.INACTIVE);

    this.itemImg = document.createElement("img");
    this.itemImg.className = "item-img";
    this.itemImg.src = "/static/images/questionmark.png";
    this.itemImg.alt = "-?-"

    this.pedestalImg = document.createElement("img");
    this.pedestalImg.className = "pedestal-img";
    this.pedestalImg.src = "/static/images/pedestal.png";
    this.pedestalImg.alt = "_____"

    this.itemText = document.createElement("span");
    this.itemText.textContent = ""

    this.cellNode.appendChild(this.pedestalImg);
    this.cellNode.appendChild(this.itemImg);
    this.cellNode.appendChild(this.itemText);

    this.cellNode.addEventListener("click", (e) => {
      this.grid.make_cell_active(this);
    });
  }

  get_row_idx() {
    return parseInt(this.cellID[4]);
  }

  get_col_idx() {
    return parseInt(this.cellID[5]);
  }

  set_item(item) {
    this.itemImg.src = item.img();
    this.itemText.textContent = item.name();
    if (item.name().length < 7) {
      this.itemText.style.top = "42.5%" // TODO scuffed, dont hard code here
    }
  }

  set_state(state) {
    switch (state) {
      case CELL_STATE.ACTIVE:
        break;
      case CELL_STATE.INACTIVE:
        break;
      case CELL_STATE.SOLVED:
        break;
      default:
        return;
    }
    this.cellState = state;
    this.cellNode.setAttribute("state", state);
  }

  is_active() {
    return this.cellState == CELL_STATE.ACTIVE;
  }

  is_solved() {
    return this.cellState == CELL_STATE.SOLVED;
  }
}

export class Grid {
  constructor(rowCategories, colCategories, gridNodeID = "game-grid") {
    this.rowCats = rowCategories;
    this.colCats = colCategories;

    this.gridNode = document.querySelector("#" + gridNodeID);
    this.cornerNode = this.gridNode.querySelectorAll(".empty");
    this.cellNodes = this.gridNode.querySelectorAll(".cell");
    this.cells = [];
    this.rowLabels = this.gridNode.querySelectorAll(".row-label");
    this.colLabels = this.gridNode.querySelectorAll(".col-label");

    for (const row of this.rowLabels) {
      const rowCat = this.rowCats[parseInt(row.id[3])];
      row.textContent = rowCat.name;
      const img = document.createElement("img");
      img.className = "label-img";
      img.src = rowCat.img;
      img.alt = rowCat.id;
      img.title = rowCat.description;
      row.appendChild(img);
    }
    for (const col of this.colLabels) {
      const colCat = this.colCats[parseInt(col.id[3])];
      col.textContent = colCat.name;
      const img = document.createElement("img");
      img.className = "label-img";
      img.src = colCat.img;
      img.alt = colCat.id;
      img.title = colCat.description;
      col.appendChild(img);
    }
    for (const cellNode of this.cellNodes) {
      const i = parseInt(cellNode.id[4]), j = parseInt(cellNode.id[5]);
      const cell = new Cell("cell" + i + j, this);
      this.cells.push(cell);
    }
  }

  get_active_cell() {
    for (const cell of this.cells) {
      const active = cell.is_active();
      if (active) {
        return cell;
      }
    }
  }

  get_cell_from_category_ids(rowCatID, colCatID) {
    for (const cell of this.cells) {
      if (cell.rowCat.id == rowCatID && cell.colCat.id == colCatID) {
        return cell;
      }
    }
  }
  
  make_cell_active(cell) {
    if (cell.is_active() || cell.is_solved()) {
      return;
    }
    const activeCell = this.get_active_cell();
    if (activeCell) {
      activeCell.set_state(CELL_STATE.INACTIVE);
    }
    cell.set_state(CELL_STATE.ACTIVE);
  }
}