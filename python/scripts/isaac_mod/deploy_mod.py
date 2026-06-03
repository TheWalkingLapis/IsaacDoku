#!/usr/bin/python3

from pathlib import Path
import os
import shutil

from scripts import (
    modPath,
    isaacModsPath,
    isaacModPath
)

def main():
    if not os.path.exists(isaacModsPath):
        os.makedirs(isaacModsPath)

    if isaacModPath.exists():
        shutil.rmtree(isaacModPath)
    shutil.copytree(modPath, isaacModPath)

if __name__ == "__main__":
    main()