import { parse_csv, fetch_file_cached } from "./utils.js";

export async function is_item_in_categories(itemID, ...categories) {
    const [ categoryAssignments, categoryIDs ] = parse_csv(await fetch_file_cached("fetch_category_assignments"));
    
    for (const cat of categories) {
        if (!(categoryIDs.includes(cat))) {
            console.error("Invalid category name was checked!")
            return false;
        }
        if (!categoryAssignments[itemID][cat]) return false;
    }
    return true;
}

export async function pickCategories(rng) {
  /**
   * Picks 3 row and column categories that form the IsaacDoku Grid.
   * Ensures at least one valid item per cell.
   */

  const categories = JSON.parse(await fetch_file_cached("fetch_categories"));
  const categoryIDs = categories.map(cat => cat.id);
  const [ categoryMatches, csvCategoryIDs ] = parse_csv(await fetch_file_cached("fetch_category_match"));

  // filter only configured categories that exist in csv
  const validCategoryIDs = categoryIDs.filter(id => csvCategoryIDs.includes(id));

  function pickRandom(ignore = []) {
    const valid = validCategoryIDs.filter(c => !ignore.includes(c));
    if (valid.length === 0) return "";
    return rng.random_choice(valid);
  }

  function findCategories(maxTries = 10) {
    let rows = ["", "", ""];
    let cols = ["", "", ""];
    let attemptedRows = [];

    for (let attempt = 0; attempt < maxTries; attempt++) {
      // pick first row
      rows[0] = pickRandom(attemptedRows);

      // pick 3 columns valid for that row
      for (let i = 0; i < 3; i++) {
        let col = pickRandom([...rows, ...cols]);
        let tried = [col];

        // repick col if first row has no overlapping items with it
        while (categoryMatches[rows[0]][col] < 1) {
          col = pickRandom([...rows, ...cols, ...tried]);
          if (!col) {
            // at least one element should always be present, so use empty array as failure flag
            tried = [];
            break;
          }
          tried.push(col);
        }

        if (tried.length === 0) break;
        cols[i] = col;
      }

      // for the chosen starting row, no 3 columns with at least one matching item were found
      // => try again but exclude starting row for first pick
      if (cols.includes("")) {
        attemptedRows.push(rows[0]);
        rows = ["", "", ""];
        cols = ["", "", ""];
        continue;
      }

      // pick remaining rows
      for (let i = 1; i < 3; i++) {
        let row = pickRandom([...rows, ...cols]);
        let tried = [row];

        // repick row if a column has no overlapping items with it
        while (
          categoryMatches[row][cols[0]] < 1 ||
          categoryMatches[row][cols[1]] < 1 ||
          categoryMatches[row][cols[2]] < 1
        ) {
          row = pickRandom([...rows, ...cols, ...tried]);
          if (!row) {
            tried = [];
            break;
          }
          tried.push(row);
        }

        if (tried.length === 0) break;
        rows[i] = row;
      }

      if (!rows.includes("")) {
        return { rows, cols };
      }

      rows = ["", "", ""];
      cols = ["", "", ""];
    }

    return { rows, cols };
  }

  return findCategories();
}