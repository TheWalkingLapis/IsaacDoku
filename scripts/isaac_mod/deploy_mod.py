#!/usr/bin/python3

from pathlib import Path
import os
import shutil

def main():
    modName = "IsaacDoku"

    modLocation = Path(__file__).resolve().parent.parent / "mod"
    isaacLocation = Path("C:/Program Files (x86)") / "Steam" / "steamapps" / "common" / "The Binding of Isaac Rebirth"

    targetModFolder = isaacLocation.joinpath("mods")
    if not os.path.exists(targetModFolder):
        os.makedirs(targetModFolder)
    
    destinationPath = targetModFolder / modName

    if destinationPath.exists():
        shutil.rmtree(destinationPath)
    shutil.copytree(modLocation / modName, destinationPath)

if __name__ == "__main__":
    main()