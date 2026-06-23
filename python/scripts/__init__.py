from pathlib import Path

MODNAME = "IsaacDoku"

rootPath = Path(__file__).resolve().parent.parent.parent

scriptPath = rootPath / "python" / "scripts"

modPath = rootPath / "mod" / MODNAME

dataPath = rootPath / "data"
dataRawPath = dataPath / "raw"
dataPathItempoolsFile = dataRawPath / "itempools.xml"
dataPathItemsMetadataFile = dataRawPath / "items_metadata.xml"
dataPathItemsFile = dataRawPath / "items.xml"
dataPathModDataFile = dataRawPath / "modData.json"
dataPathStringtableFile = dataRawPath / "stringtable.sta"
dataCsvPath = dataPath / "csv"
dataCsvPathItemsFile = dataCsvPath / "items.csv"
dataCsvPathItemsModDataFile = dataCsvPath / "items_mod_data.csv"
dataCsvPathItemsCustomPropsFile = dataCsvPath / "items_custom_props.csv"
dataCsvPathCategoryAssignmentsFile = dataCsvPath / "category_assignments.csv"
dataCsvPathCategoryMatchFile = dataCsvPath / "category_match.csv"
dataGamePath = dataPath / "game"
datagamePathDaily = dataGamePath / "daily.json"

configPath = rootPath / "config"
configPathCategoriesFile = configPath / "categories.json" 


## Isaac
isaacPath = Path("E:") / "Steam" / "steamapps" / "common" / "The Binding of Isaac Rebirth"
isaacModsPath = isaacPath / "mods"
isaacModPath = isaacPath / "mods" / MODNAME
isaacModDataPath = isaacPath / "data" / MODNAME