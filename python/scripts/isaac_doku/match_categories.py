#!/usr/bin/python3

"""
Create a csv that counts for each category combination how
many items fit both conditions
"""

from pathlib import Path
import pandas as pd
import os
import json

from scripts import (
    configPathCategoriesFile,
    dataCsvPathCategoryAssignmentsFile,
    dataCsvPathCategoryMatchFile
)

def main():
    if not os.path.exists(dataCsvPathCategoryAssignmentsFile):
        print("ERROR: items have not been catgeorized yet!")
        return
    
    categoryDf = pd.read_csv(dataCsvPathCategoryAssignmentsFile)
    
    with open(configPathCategoriesFile, "r") as file:
        categoryConfig = json.load(file)
    categoryIDs = [c['id'] for c in categoryConfig]
    matchableDf = categoryDf[categoryIDs].astype(int)
    matchDf = (matchableDf.T @ matchableDf)

    matchDf.to_csv(dataCsvPathCategoryMatchFile)
    

if __name__ == "__main__":
    main()