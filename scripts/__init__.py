from pathlib import Path

MODNAME = "IsaacDoku"

rootPath = Path(__file__).resolve().parent.parent

scriptPath = rootPath / "scripts"

modPath = rootPath / "mod" / MODNAME

dataPath = rootPath / "data"
dataRawPath = dataPath / "raw"
dataPathItempoolsFile = dataRawPath / "itempools.xml"
dataPathItemsMetadataFile = dataRawPath / "items_metadata.xml"
dataPathItemsFile = dataRawPath / "items.xml"
dataPathModDataFile = dataRawPath / "modData.json"
dataPathStringtableFile = dataRawPath / "stringtable.sta"
dataCsvPath = dataPath / "csv"


## Isaac
isaacPath = Path("C:/Program Files (x86)") / "Steam" / "steamapps" / "common" / "The Binding of Isaac Rebirth"
isaacModsPath = isaacPath / "mods"
isaacModPath = isaacPath / "mods" / MODNAME
isaacModDataPath = isaacPath / "data" / MODNAME