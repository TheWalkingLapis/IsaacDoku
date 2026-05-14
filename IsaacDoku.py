from flask import (
    Flask, 
    Response,
    jsonify, 
    render_template,
    request,
    send_from_directory,
    abort,
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
    get_all_item_ids,
    get_item_property,
    is_item_in_categories
)
from scripts.isaac_doku.create_isaac_doku import (
    pick_categories
)

app = Flask(__name__)

# item metadata
@app.route("/data/items")
def all_items():
    return jsonify(get_all_items())

# fetch item by id
@app.route("/data/items/<int:id>")
def item_data(id):
    items = get_all_items()
    item = [i for i in items if i["ID"] == id]
    if len(item) == 0:
        abort(404)
    return item[0]

# item images
@app.route("/img/items/<int:id>")
def item_image(id):
    ids = get_all_item_ids()
    if not id in ids:
        abort(404)
    gfxpath = get_item_property(id, "GfxFileName").item()
    filename = gfxpath.split("/")[-1].lower()
    print(filename)
    return send_from_directory("static/images/items", filename)

@app.route('/submit', methods=["POST"])
def submit():
    form = request.get_json()
    itemID = int(form.get("id"))
    categoryIDs = form.get("categories")

    # TODO replace with accessing the daily json
    correct = is_item_in_categories(itemID, categoryIDs)

    response = {
        "correct": correct,
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