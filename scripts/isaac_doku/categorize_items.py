#!/usr/bin/python3

"""
Create a csv that flags all items present in a 
category for all catgeories in the config json

config categories:
A category is one kind of item, e.g. "All items in the treasure Itempool".
To define a category you need:
"id": unique name for this category
"description": text describing the category
"conditions: conditions as below defining what items are in this category in terms of data entries

The conditions allow to define some statement that needs to evaluate to true for all items
that should be in the category. Within "conditions" you have to define:
"concat": {"and", "or"}, how to concatenate the conditions
"values": the elemental conditions (see below) 
[TODO the current approach allows for either (x and y and z) or (x or y or z)
but not ((x or y) and z). For the future this could be accomplished by allowing
a new "conditions" dict as a value of "values"]

A elemental condition is defined by:
"column": The column from items.csv
"check": {"<", ">", "==", "in"}
"value": the value to perform the check operation with, such that 
        <value> <check> <columnValue>, e.g. "treasure" "in" <"Itempools"> or "0" "==" <"Quality">
"""

from pathlib import Path
import pandas as pd
import os
import json

from scripts import (
    configPathCategoriesFile,
    dataCsvPathItemsFile,
    dataCsvPathCategoryAssignmentsFile
)

from scripts.utils import (
    get_all_item_ids
)

def evaluate_condition(conditionDict, itemData):
    if not ("concat" in conditionDict and "values" in conditionDict):
        print("ERROR: invalid condition in config!")
        return False
    
    # start with False for "or", True for "and"
    evaluationResult = conditionDict["concat"] == "and"

    for condition in conditionDict["values"]:
        condColumn = condition["column"]
        condCheck = condition["check"]
        condValue = condition["value"]

        if condColumn in itemData:
            result = False
            itemValue = itemData[condColumn]
            # if item has no value in a column instantly return flase 
            if pd.isna(itemValue):
                return False
            if condCheck == ">":
                result = condValue > itemValue
            if condCheck == "<":
                result = condValue < itemValue
            if condCheck == "==":
                result = condValue == itemValue
            if condCheck == "in":
                result = condValue in itemValue

            if conditionDict["concat"] == "and":
                evaluationResult = evaluationResult and result
            if conditionDict["concat"] == "or":
                evaluationResult = evaluationResult or result
    
    return evaluationResult

def main():
    if not os.path.exists(configPathCategoriesFile):
        print("ERROR: config file does not exist")
        return
    
    itemDf = pd.read_csv(dataCsvPathItemsFile)

    allItemIDs = get_all_item_ids()
    categoryDf = pd.DataFrame({"id": allItemIDs})

    with open(configPathCategoriesFile) as file:
        categories = json.load(file)
        for cat in categories:
            catEntries = []
            catID = cat["id"]
            catDesc = cat["description"]
            catConds = cat["conditions"]

            for itemID in allItemIDs:
                itemData = itemDf[itemDf["ID"] == itemID]
                if not itemData.empty:
                    catEntries.append(evaluate_condition(catConds, itemData.iloc[0].to_dict()))
            
            categoryDf[catID] = catEntries
        
        categoryDf.to_csv(dataCsvPathCategoryAssignmentsFile, index=False)

if __name__ == "__main__":
    main()