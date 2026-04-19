from pathlib import Path
import os
import xml.etree.ElementTree as ET

from scripts import (
    dataPathStringtableFile
)

STRING_LOOKUP_TABLE = {}

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