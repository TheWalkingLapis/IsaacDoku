import pandas as pd
from scripts import (
    dataCsvPathItemsFile
)

def get_all_item_ids() -> list[int]:
    """
    assumes the csv is initalized since thats where the ids are read from
    """
    df = pd.read_csv(dataCsvPathItemsFile)
    return list(df["ID"])