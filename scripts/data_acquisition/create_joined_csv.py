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
from scripts.isaac_utils import (
    lookup_string,
    get_values_of_isaac_enum
)

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

def get_all_item_ids() -> list[int]:
    """
    assumes the csv is initalized since thats where the ids are read from
    """
    df = pd.read_csv(dataCsvPathItemsFile)
    return list(df["ID"])

def sort_csv_columns(filter = ["ID"], omitRemaining = False):
    if not os.path.exists(dataCsvPathItemsFile):
        print("ERROR: csv item file not found!")
        return
    
    df = pd.read_csv(dataCsvPathItemsFile, index_col=0)
    remainingCols = [c for c in df.columns if c not in filter]
    df = df[filter if omitRemaining else filter + remainingCols]
    if "ID" in filter:
        df.sort_values("ID", inplace=True, ignore_index=True)
    df.to_csv(dataCsvPathItemsFile)

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
    PARSE_ENUM = {"Tags": "ItemConfig"}

    with open(dataPathModDataFile, "r") as file:
        modDataRaw = json.load(file)
    
    itemDataRaw = modDataRaw["itemData"]

    # itemData contains information ordered by item, for the dataframe
    # this is changed to be ordered by attribute
    parsedItemData = {attrib: [] for attrib in itemDataRaw[0].keys() if not attrib in REMOVE_CATEGORIES}
    for itemDataRawEntry in itemDataRaw:
        if itemDataRawEntry["Hidden"]:
            continue
        for itemAttributeKey, itemAttributeValue in itemDataRawEntry.items():
            if itemAttributeKey in REQUIRES_STRING_LOOKUP:
                itemAttributeValue = lookup_string(itemAttributeValue)
            if itemAttributeKey in REMOVE_CATEGORIES:
                continue
            if itemAttributeKey in PARSE_ENUM:
                if type(itemAttributeValue) == int:
                    itemAttributeValue = get_values_of_isaac_enum(PARSE_ENUM[itemAttributeKey], itemAttributeValue)
                    itemAttributeValue = ",".join(itemAttributeValue)
                else:
                    print(f"ERROR: Category {itemAttributeKey} defined as parsable but doesnt have int value!")
            parsedItemData[itemAttributeKey].append(itemAttributeValue)
    return parsedItemData

def init_csv_from_modData():
    modData = parse_mod_data()

    df = pd.DataFrame(modData)
    df.drop_duplicates(inplace=True)
    df.to_csv(dataCsvPathItemsFile)
    sort_csv_columns(["Name", "ID", "Description", "Quality", "Type", "Tags"])

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
    """
    returns the itempools for each id in the given list
    """
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

def mod_csv_with_itempools():
    itempools = collect_itempools(get_all_item_ids())
    if not os.path.exists(dataCsvPathItemsFile):
        print("ERROR: csv item file not found!")
        return
    
    df = pd.read_csv(dataCsvPathItemsFile, index_col=0)
    df['Itempools'] = df['ID'].map(itempools).apply(lambda pool: ','.join(pool))
    df.to_csv(dataCsvPathItemsFile)
    sort_csv_columns(["Name", "ID", "Description", "Quality", "Itempools"])

#################################
## Main
#################################
def main():
    if not check_files_present():
        print("Error: Missing files in data! Make sure you called the data fetching scripts beforehand!")

    init_csv_from_modData()

    mod_csv_with_itempools()

if __name__ == "__main__":
    main()