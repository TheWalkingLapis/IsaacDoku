from pathlib import Path
import os
import json
import xml.etree.ElementTree as ET

from scripts import (
    dataPathStringtableFile,
    dataPathModDataFile
)

STRING_LOOKUP_TABLE = {}
ISAAC_LUA_ENUMS = {}

# string lookup
def _parse_stringtable():
    tree = ET.parse(dataPathStringtableFile)
    root = tree.getroot()
    
    #info = root[0]
    languages = root[1]
    STRING_LOOKUP_TABLE["languages"] = {}
    for language in languages:
        # these are 1-indexed apparently
        STRING_LOOKUP_TABLE["languages"][language.attrib["name"]] = int(language.attrib["index"]) - 1

    STRING_LOOKUP_TABLE["items"] = {}
    for category in root[2:]:
        if category.attrib["name"] == "Items":
            for key in category:
                strings = []
                for lanString in key:
                    strings.append(lanString.text)
                STRING_LOOKUP_TABLE["items"][key.attrib["name"]] = strings
            break

def lookup_string(link, lan="English") -> str:
    """
    <stringtable>
      <info>
      <languages> # contains language indices
      <category name='xxx'>
        <key name='link'>
    """
    if STRING_LOOKUP_TABLE == {}:
        _parse_stringtable()
    
    languageIndex = STRING_LOOKUP_TABLE["languages"][lan] if lan in STRING_LOOKUP_TABLE["languages"] else 0

    parsedLink = link[1:]
    if parsedLink in STRING_LOOKUP_TABLE["items"]:
        return STRING_LOOKUP_TABLE["items"][parsedLink][languageIndex]
    
    return f"[{link}] not present!!!"

# parse mod data
def _parse_mod_data():
    with open(dataPathModDataFile, "r") as file:
        modDataRaw = json.load(file)
    
    enumDataRaw = modDataRaw["enumData"]

    for enumName, enum in enumDataRaw.items():
        ISAAC_LUA_ENUMS[enumName] = {}
        for luaKey, luaValue in enum.items():
            ISAAC_LUA_ENUMS[enumName][luaValue] = luaKey

def get_isaac_enum(name) -> dict:
    if ISAAC_LUA_ENUMS == {}:
        _parse_mod_data()
    
    if not name in ISAAC_LUA_ENUMS:
        print(f"ERROR: {name} is not a stored lua enum!")
        return {}
    
    return ISAAC_LUA_ENUMS[name]

def get_values_of_isaac_enum(enumName: str, value: int) -> list:
    enumEntries = []
    isaacEnum = get_isaac_enum(enumName)
    sortedEnum = sorted(isaacEnum.keys())[::-1]
    if value < sortedEnum[-1]:
        print("WARNING: passed undefind enum value!")
        return []
    while value > 0:
        for enumValue in sortedEnum:
            if value >= enumValue:
                enumEntries.append(isaacEnum[enumValue])
                value -= enumValue
                break
    return enumEntries