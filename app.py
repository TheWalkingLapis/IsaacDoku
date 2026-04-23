from flask import Flask, jsonify, render_template
from scripts.isaac_doku.create_isaac_doku import (
    pick_categories
)

app = Flask(__name__)

@app.route("/categories")
def data():
    rows, cols, _ = pick_categories()
    return jsonify(rows, cols)

@app.route("/")
def home():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)