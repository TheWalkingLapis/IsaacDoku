import { parse_csv, fetch_file_cached } from "./utils.js";
import { ALL_CATEGORIES, NULL_CATEGORY } from "./category.js";

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

// returns all items that are in all specified categories
export async function items_in_categories(...categories) {
  const [ categoryAssignments, categoryIDs ] = parse_csv(await fetch_file_cached("fetch_category_assignments"));
  const items = [];
  for (const id in categoryAssignments) {
    const assignments = categoryAssignments[id];
    let valid = true;
    for (const cat of categories) {
      if (!assignments[cat.id]) {
        valid = false;
        break;
      }
    }
    if (valid) {
      items.push(id);
    }
  }
  return items;
}

export async function pick_categories(rng) {
  /**
   * Picks 3 row and column categories that form the IsaacDoku Grid.
   * Ensures at least one valid item per cell.
   */

  const categories = ALL_CATEGORIES;
  const [ categoryMatches, csvCategoryIDs ] = parse_csv(await fetch_file_cached("fetch_category_match"));

  // filter only configured categories that exist in csv
  const validCategories = categories.filter(cat => csvCategoryIDs.includes(cat.id));

  function pickRandom(ignore = []) {
    const valid = validCategories.filter(c => !ignore.includes(c));
    if (valid.length === 0) return NULL_CATEGORY;
    return rng.random_choice(valid);
  }

  function findCategories(maxTries = 10) {
    let rows = [NULL_CATEGORY, NULL_CATEGORY, NULL_CATEGORY];
    let cols = [NULL_CATEGORY, NULL_CATEGORY, NULL_CATEGORY];
    let attemptedRows = [];

    for (let attempt = 0; attempt < maxTries; attempt++) {
      // pick first row
      rows[0] = pickRandom(attemptedRows);

      // pick 3 columns valid for that row
      for (let i = 0; i < 3; i++) {
        let col = pickRandom([...rows, ...cols]);
        let tried = [col];

        // repick col if first row has no overlapping items with it
        while (categoryMatches[rows[0].id][col.id] < 1) {
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
      if (cols.includes(NULL_CATEGORY)) {
        attemptedRows.push(rows[0]);
        rows = [NULL_CATEGORY, NULL_CATEGORY, NULL_CATEGORY];
        cols = [NULL_CATEGORY, NULL_CATEGORY, NULL_CATEGORY];
        continue;
      }

      // pick remaining rows
      for (let i = 1; i < 3; i++) {
        let row = pickRandom([...rows, ...cols]);
        let tried = [row];

        // repick row if a column has no overlapping items with it
        while (
          categoryMatches[row.id][cols[0].id] < 1 ||
          categoryMatches[row.id][cols[1].id] < 1 ||
          categoryMatches[row.id][cols[2].id] < 1
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

      if (!rows.includes(NULL_CATEGORY)) {
        return { rows, cols };
      }

      rows = [NULL_CATEGORY, NULL_CATEGORY, NULL_CATEGORY];
      cols = [NULL_CATEGORY, NULL_CATEGORY, NULL_CATEGORY];
    }

    return { rows, cols };
  }

  return findCategories();
}