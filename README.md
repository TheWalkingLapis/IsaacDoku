# IsaacDoku

Access at https://isaacdoku.net/

An Isaac-insprired daily puzzle, similar to Isaacle or IsaacConnect but in the style of Pokedoku.

## The Game

For both columns and rows, three item categories are chosen, resulting in a 3x3 grid.

The player must find an item that fits both the row and column category for each cell in the grid to win.

In contrast to wordle-like games there is (often) more than one solution per cell.

# Install

## Setup repo

Run `source ./setup.sh` (see commment in script for installation on Unix).
Also make sure you have php installed.

## Setup Server

Run `./IsaacDokuServer` and access localhost (http://127.0.0.1:5000).

Depending on your Server, note that the contents of 'public/' should be in the public root directory.
Everything else if fetched via the files in 'public/api/', so you might need to change the path in these files.

## Workflow

When updating categories, item data, etc. some files further down may have to be updated as well to reflect the changes.
In `python/update.py`, every step (except 1.) is executed to assure this happens. 
This is the workflow:

1. Isaac Mod extracts information about items not found in the game files
2. Additional item tags (e.g. color) can be manually added or overwritten
3. Raw data from 1. and 2. is processed and joined together
4. Items are grouped in given categories
5. Categories are matched against each other to get the pair-wise item overlap

# Disclaimer
I am not involved with the creators of The Binding of Isaac and do not own the rights to the related files.