#!/usr/bin/python3

"""
Create a csv file with all relevant attributes per item, acting as database.
This assumes some files to be present in ../../data, else a warning is issued.

Workflow of main:
- parse modData (item data extracted by the mod ingame) to csv
- parse additional files and append/modify inital csv
"""

from pathlib import Path
import os
import xml.etree.ElementTree as ET
import json
import pandas as pd

from scripts import (
    dataPathItempoolsFile,
    dataPathItemsMetadataFile,
    dataPathItemsFile,
    dataPathModDataFile,
    dataPathStringtableFile,
    dataRawPath,
    dataCsvPath,
    dataCsvPathItemsFile
)
from scripts.isaac_utils import lookup_string,STRING_LOOKUP_TABLE

#################################
## Util
################################# 
def check_files_present() -> bool:
    requiredFiles = [
        dataPathItempoolsFile.name,
        dataPathItemsMetadataFile.name,
        dataPathItemsFile.name,
        dataPathModDataFile.name,
        dataPathStringtableFile.name
    ]
    if not os.path.exists(dataRawPath):
        return False
    presentFiles = os.listdir(dataRawPath)
    for file in requiredFiles:
        if not file in presentFiles:
            return False
    return True

#################################
## ModData (and create csv)
#################################
def parse_mod_data() -> dict[str, list]:
    """
    item attributes:
    'PassiveCache', 'AddBombs', 'Tags', 'Description', 'PersistentEffect', 
    'AddSoulHearts', 'Special', 'AddKeys', 'GfxFileName', 'InitCharge', 
    'MaxCharges', 'DevilPrice', 'MaxCooldown', 'Name', 'AddCostumeOnPickup', 
    'CacheFlags', 'Quality', 'AddBlackHearts', 'ID', 'AchievementID', 
    'ShopPrice', 'CraftingQuality', 'AddMaxHearts', 'Hidden', 'AddCoins', 
    'AddHearts', 'ClearEffectsOnRemove', 'ChargeType'

    requires string lookup:
    'Name', 'Description'

    remove categories:
    'Hidden' (whether an item is used in the game)
    """
    REQUIRES_STRING_LOOKUP = ["Name", "Description"]
    REMOVE_CATEGORIES = ["Hidden"]

    with open(dataPathModDataFile, "r") as file:
        modDataRaw = json.load(file)
    
    # modData contains information ordered by item, for the dataframe
    # this is changed to be ordered by attribute
    parsedItemData = {attrib: [] for attrib in modDataRaw[0].keys() if not attrib in REMOVE_CATEGORIES}
    for itemDataRaw in modDataRaw:
        if itemDataRaw["Hidden"]:
            continue
        for itemAttributeKey, itemAttributeValue in itemDataRaw.items():
            if itemAttributeKey in REQUIRES_STRING_LOOKUP:
                itemAttributeValue = lookup_string(itemAttributeValue)
            if itemAttributeKey in REMOVE_CATEGORIES:
                continue
            parsedItemData[itemAttributeKey].append(itemAttributeValue)
    return parsedItemData

def init_csv_from_modData():
    modData = parse_mod_data()

    df = pd.DataFrame(modData)
    df.drop_duplicates(inplace=True)
    # re-order columns and sort by ID
    columnOrder = ["Name", "ID", "Description", "Quality", "Tags"] # everything else is in the order given by modData.json
    remainingCols = [c for c in df.columns if c not in columnOrder]
    df = df[columnOrder + remainingCols]
    df.sort_values("ID", inplace=True, ignore_index=True)
    df.to_csv(dataCsvPathItemsFile)

#################################
## Itempools
#################################
def parse_itempools() -> dict[str, list[int]]:
    """
    31 itempools: 
    'treasure', 'shop', 'boss', 'devil', 'angel', 
    'secret', 'library', 'shellGame', 'goldenChest', 
    'redChest', 'beggar', 'demonBeggar', 'curse', 'keyMaster', 
    'batteryBum', 'momsChest', 'greedTreasure', 'greedBoss', 
    'greedShop', 'greedCurse', 'greedDevil', 'greedAngel', 
    'greedSecret', 'craneGame', 'ultraSecret', 'bombBum', 
    'planetarium', 'oldChest', 'babyShop', 'woodenChest', 
    'rottenBeggar'
    """
    result = {}
    tree = ET.parse(dataPathItempoolsFile)
    root = tree.getroot()
    for itempool in root:
        poolName = itempool.attrib["Name"]
        poolIds = [int(item.attrib["Id"]) for item in itempool]
        result[poolName] = poolIds
    return result

def _collect_item_itempool(id: int, itempools: dict[str, list[int]]) -> list[str]:
    pools = []
    for pool, items in itempools.items():
        if id in items:
            pools.append(pool)
    return pools

def collect_itempools(ids: list[int], filterPrefixes: list[str] = ['greed']) -> dict[int, list[str]]:
    parsedItempools = parse_itempools()

    result = {}
    for id in ids:
        itempools = _collect_item_itempool(id, parsedItempools)
        filteredItempools = []
        for pool in itempools:
            flag = False
            for prefix in filterPrefixes:
                if pool.startswith(prefix):
                    flag = True
                    break
            if not flag:
                filteredItempools.append(pool)

        result[id] = filteredItempools
    return result

#################################
## Main
#################################
def main():
    if not check_files_present():
        print("Error: Missing files in data! Make sure you called the data fetching scripts beforehand!")

    init_csv_from_modData()

    # TODO use itemIDs from csv instead of explicit list
    allItemIds = [1, 2]
    print(collect_itempools(allItemIds))

if __name__ == "__main__":
    main()