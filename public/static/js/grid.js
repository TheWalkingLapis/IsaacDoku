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
    this.row = grid.rows[this.get_row_idx()];
    this.col = grid.cols[this.get_col_idx()];

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
    this.itemText.textContent = item.name();
    this.itemImg.src = item.img();
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
  constructor(rows, cols, gridNodeID = "game-grid") {
    this.rows = rows;
    this.cols = cols;

    this.gridNode = document.querySelector("#" + gridNodeID);
    this.cornerNode = this.gridNode.querySelectorAll(".empty");
    this.cellNodes = this.gridNode.querySelectorAll(".cell");
    this.cells = [];
    this.rowLabels = this.gridNode.querySelectorAll(".row-label");
    this.colLabels = this.gridNode.querySelectorAll(".col-label");

    for (const row of this.rowLabels) {
      row.textContent = this.rows[parseInt(row.id[3])];
    }
    for (const col of this.colLabels) {
      col.textContent = this.cols[parseInt(col.id[3])];
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

  get_cell_from_categories(row, col) {
    for (const cell of this.cells) {
      if (cell.row == row && cell.col == col) {
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