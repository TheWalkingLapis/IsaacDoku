# IsaacDoku
Isaac equivalent to PokeDoku


## Install
Run `source ./setup.sh` (see commment in script for installation on Unix).

## Run
Run `python IsaacDoku.py` and access localhost (http://127.0.0.1:5000)

# TODO
- mod:
    - [X] spawn clean isaac, give item and get stat changes/status changes
    - [X] store and write to csv
    - [ ] Cats:
        - [ ] All stat ups
        - [ ] damage multiplier (change that to manual, without repentogon seems unfun)
        - [ ] stat down
        - [ ] for all stats: up/down (cat maybe combination?)
        - [ ] flight
        - [ ] spectral
        - [ ] piercing
- [ ] end game
    - [ ] show all solutions for categories (how should it look like?)
    - [ ] disable further inputs
- [ ] add hp
- [ ] integrate custom properties:
    - [ ] rename items.csv to items_extracted_props.csv
    - [ ] have js/python code to join the table of custom and extracted which is then used as item.csv for everything
- [ ] add more categories
    - [X] items that add to transformation progress
    - [ ] cats for unlock conditions (character, always, progression, ...)
    - [X] release dlc
    - [ ] colors (custom prop issue tbh)
- [ ] beautify
    - [ ] item select background / item seperator
    - [ ] background images maybe other/new?
- ([ ] group categegories and use that for better generation, also maybe difficulty based on #correct solutions)
