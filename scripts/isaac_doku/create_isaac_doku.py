#!/usr/bin/python3

"""
Provides a function that chooses 6 categories to form a 3x3 grid with each
cell having at least one possible item.

prints the 6 categories when executed standalone.
"""

from pathlib import Path
import pandas as pd
import os
import json
import random

from scripts import (
    configPathCategoriesFile,
    dataCsvPathCategoryMatchFile
)
from scripts.utils import (
    is_item_in_categories,
    get_all_item_ids
)

def pick_categories(returnItems = False) -> tuple[list[str], list[str], list[list[int]]]:
    """
    Picks 3 row and column categories that form the IsaacDoku Grid.
    Makes sure the IsaacDoku is solvable (= at least one item per cell)
    """

    if not os.path.exists(dataCsvPathCategoryMatchFile):
        print("ERROR: categories have not been matched yet!")
        return [], [], []
    
    with open(configPathCategoriesFile, "r") as file:
        categoryConfig = json.load(file)
    categoryIDs = [c['id'] for c in categoryConfig]
    df = pd.read_csv(dataCsvPathCategoryMatchFile, index_col=0)[categoryIDs]
    
    def _pick_random(ignore=[]) -> str:
        valid = [c for c in df.columns.to_list() if c not in ignore]
        if len(valid) == 0:
            return ""
        return random.choice(valid)
    
    def _find_categories(maxTries = 10) -> tuple[list[str], list[str]]:
        rows = ["", "", ""]
        cols = ["", "", ""]
        attempted_rows = []
        for idx in range(maxTries):
            # start with random row
            rows[0] = _pick_random(ignore=attempted_rows)

            # find three columns that are valid for chosen row
            for i in range(3):
                col = _pick_random(ignore=(rows+cols))
                tried = [col]
                while df[col].get(rows[0], default=0) < 1:
                    col = _pick_random(ignore=(rows+cols+tried))
                    if col == "":
                        # use tried array as flag for failure
                        tried = []
                        break
                    tried += [col]
                if len(tried) == 0:
                    break
                cols[i] = col
            
            # next try if not enough columns were found
            if "" in cols:
                attempted_rows += [rows[0]]
                rows = ["", "", ""]
                cols = ["", "", ""]
                continue

            # find two more rows to match the chosen three columns
            for i in range(1, 3):
                row = _pick_random(ignore=(rows+cols))
                tried = [row]
                while df[cols[0]].get(row, default=0) < 1 or df[cols[1]].get(row, default=0) < 1 or df[cols[2]].get(row, default=0) < 1:
                    row = _pick_random(ignore=(rows+cols+tried))
                    if row == "":
                        # use tried array as flag for failure
                        tried = []
                        break
                    tried += [row]
                if len(tried) == 0:
                    break
                rows[i] = row
            
            # next try if no rows could be matched
            if "" in rows:
                rows = ["", "", ""]
                cols = ["", "", ""]
                continue

            # success
            break

        return rows, cols

    rows, cols = _find_categories()
    items = [[] for _ in range(9)]

    if returnItems:
        for i, r, in enumerate(rows):
            for j, c in enumerate(cols):
                # TODO improve performance by collecting this for all ids at once in utils
                for id in get_all_item_ids():
                    if is_item_in_categories(id, [r, c]):
                        items[i * 3 + j].append(id)

    return rows, cols, items
    

def main():
    rows, columns, items = pick_categories(returnItems=False)
    print(rows, columns)
    print(items[0])
    
    

if __name__ == "__main__":
    main()