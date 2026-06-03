#!/usr/bin/python3

from pathlib import Path
import os
import shutil
import json

from scripts import (
    dataPathModDataFile,
    isaacModDataPath
)

def main():
    files = os.listdir(isaacModDataPath)
    if len(files) < 1:
        print(f"Error: No saveData found at {isaacModDataPath}")

    # read raw json
    with open(isaacModDataPath / files[0], "r", encoding="utf-8") as f:
        data = json.load(f)

    # write formatted json
    with open(dataPathModDataFile, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)


if __name__ == "__main__":
    main()