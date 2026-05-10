import pandas as pd
import numpy as np
import os
from scripts import (
    dataCsvPathItemsFile,
    dataCsvPathCategoryAssignmentsFile
)

ITEMS_DF_CACHE = None
ASSIGMENT_DF_CACHE = None

def get_all_item_ids() -> list[int]:
    """
    assumes the csv is initalized since thats where the ids are read from
    """
    if not os.path.exists(dataCsvPathItemsFile):
        print("ERROR: Item csv not present!")
        return []
    
    global ITEMS_DF_CACHE
    if ITEMS_DF_CACHE is None:
        ITEMS_DF_CACHE = pd.read_csv(dataCsvPathItemsFile)
    
    return list(ITEMS_DF_CACHE["ID"])

def get_all_items(returnCatgeories=[]) -> list[dict]:
    """
    empty returnCatgeories means return all
    """
    if not os.path.exists(dataCsvPathItemsFile):
        print("ERROR: Item csv not present!")
        return []
    
    global ITEMS_DF_CACHE
    if ITEMS_DF_CACHE is None:
        ITEMS_DF_CACHE = pd.read_csv(dataCsvPathItemsFile)
    
    # TODO remove by making sure Nan is not exported
    clearNanDf = ITEMS_DF_CACHE.replace({np.nan: None})

    if len(returnCatgeories) == 0:
        return clearNanDf.to_dict("records")
    return clearNanDf[returnCatgeories].to_dict("records")

def get_item_property(id, property):
    if not os.path.exists(dataCsvPathItemsFile):
        print("ERROR: Item csv not present!")
        return []
    
    global ITEMS_DF_CACHE
    if ITEMS_DF_CACHE is None:
        ITEMS_DF_CACHE = pd.read_csv(dataCsvPathItemsFile)
    
    value = ITEMS_DF_CACHE.loc[ITEMS_DF_CACHE["ID"] == id, property]

    return value

def is_item_in_categories(itemID:int, categories: list[str]) -> bool:
    """
    performs a lookup into the matched category csv to determine if the item
    is in all categories provided
    """
    if not os.path.exists(dataCsvPathCategoryAssignmentsFile):
        print("ERROR: Assignment csv not present!")
        return False
    
    global ASSIGMENT_DF_CACHE
    if ASSIGMENT_DF_CACHE is None:
        ASSIGMENT_DF_CACHE = pd.read_csv(dataCsvPathCategoryAssignmentsFile, index_col=0)
        
    try:
        matches = ASSIGMENT_DF_CACHE[categories].loc[itemID].values
        for m in matches:
            if not m: return False
        return True
    except KeyError:
        return False