#!/bin/bash

VENV_DIR=".venv"

python -m venv "$VENV_DIR"
# would be bin instead of Scripts on Unix
source "$VENV_DIR/Scripts/activate"

pip install -r requirements.txt