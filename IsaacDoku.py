from flask import (
    Flask, 
    Response,
    jsonify, 
    render_template,
    request,
)

from datetime import datetime
import os
import json
from pathlib import Path

from scripts import (
    datagamePathDaily
)
from scripts.utils import (
    get_all_items,
    is_item_in_categories
)
from scripts.isaac_doku.create_isaac_doku import (
    pick_categories
)

app = Flask(__name__)

@app.route("/data/items")
def all_items():
    return jsonify(get_all_items())

@app.route('/submit', methods=["POST"])
def submit():
    form = request.get_json()
    itemID = int(form.get("id"))
    categoryIDs = form.get("categories")

    # TODO replace with accessing the daily json
    correct = is_item_in_categories(itemID, categoryIDs)
    remainingTries = 1

    response = {
        "correct": correct,
        "remainingTries": remainingTries,
    }
    return jsonify(response)

@app.route("/data/daily")
def daily():
    dailyData = []
    with open(datagamePathDaily, "r") as dailyFile:
        dailyData = json.load(dailyFile)
    
    fullDate = datetime.today().isoformat(sep="T")
    date = fullDate.split("T")[0]

    if date in dailyData:
        rows, cols, items = dailyData[date]["rows"], dailyData[date]["cols"], dailyData[date]["items"]
    else:
        rows, cols, items = pick_categories()
        dailyData[date] = {
            "rows": rows,
            "cols": cols,
            "items": items
        }
        with open(datagamePathDaily, "w") as dailyFile:
            json.dump(dailyData, dailyFile, indent=4)

    return jsonify({
        "rows": rows,
        "cols": cols
    })

@app.route('/favicon.ico')
def favicon():
    return Response(status=204)

@app.route("/")
def home():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)