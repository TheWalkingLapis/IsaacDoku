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

from scripts import (
    dataPathItempoolsFile,
    dataPathItemsMetadataFile,
    dataPathItemsFile,
    dataPathModDataFile,
    dataPathStringtableFile,
    dataRawPath,
    dataCsvPath
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

#################################
## ModData (and create csv)
#################################
def init_csv_from_modData():
    pass

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

    allItemIds = [1, 2]
    print(collect_itempools(allItemIds))

if __name__ == "__main__":
    main()