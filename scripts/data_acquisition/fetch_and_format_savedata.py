#!/usr/bin/python3

from pathlib import Path
import os
import shutil
import json

def main():
    modName = "IsaacDoku"
    modDataName = "modData.json"

    dataLocation = Path(__file__).resolve().parent.parent / "data"

    isaacLocation = Path("C:/Program Files (x86)") / "Steam" / "steamapps" / "common" / "The Binding of Isaac Rebirth"
    saveDataLocation = isaacLocation / "data" / modName

    files = os.listdir(saveDataLocation)
    if len(files) < 1:
        print(f"Error: No saveData found at {saveDataLocation}")

    # read raw json
    with open(saveDataLocation / files[0], "r", encoding="utf-8") as f:
        data = json.load(f)

    # write formatted json
    with open(dataLocation / modDataName, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)


if __name__ == "__main__":
    main()