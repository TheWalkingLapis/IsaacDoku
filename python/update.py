from scripts.data_acquisition import (
    create_joined_item_csv,
    fetch_and_format_savedata,
)
from scripts.isaac_doku import (
    categorize_items,
    match_categories,
)

def main():
    # fetch mod data and join with custom properties
    fetch_and_format_savedata.fetch_and_format()
    create_joined_item_csv.create_item_csv()

    # update categorization and matching
    categorize_items.categorize()
    match_categories.match_categories()

if __name__ == "__main__":
    main()