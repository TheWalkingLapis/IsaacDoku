<?php
header('Content-Type: text/csv');

readfile("../../data/csv/items.csv");
exit;