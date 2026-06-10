<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>IsaacDoku</title>

    <link rel="icon" href="data:,">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/choices.js@11.1.0/public/assets/styles/choices.min.css"/>
    <link rel="stylesheet" href="/static/style.css">
</head>

<body>
    <p></p>
    <h1>IsaacDoku</h1>
    <p></p>
    <select id="item-search"></select>
    <p></p>
    <div class="grid" id="game-grid">
        <div class="empty" id="corner-empty"></div>
        <div class="col-label" id="col0-label">A</div>
        <div class="col-label" id="col1-label">B</div>
        <div class="col-label" id="col2-label">C</div>

        <div class="row-label" id="row0-label">X</div>
        <button class="cell" id="cell00" state="inactive">1</button>
        <button class="cell" id="cell01" state="inactive">2</button>
        <button class="cell" id="cell02" state="inactive">3</button>

        <div class="row-label" id="row1-label">Y</div>
        <button class="cell" id="cell10" state="inactive">4</button>
        <button class="cell" id="cell11" state="inactive">5</button>
        <button class="cell" id="cell12" state="inactive">6</button>

        <div class="row-label" id="row2-label">Z</div>
        <button class="cell" id="cell20" state="inactive">7</button>
        <button class="cell" id="cell21" state="inactive">8</button>
        <button class="cell" id="cell22" state="inactive">9</button>
    </div>
    <p></p>
    <button onclick="localStorage.clear()">clear localStorage</button>
    <p></p>
</body>

<script type="module" src="/static/js/game.js"></script>