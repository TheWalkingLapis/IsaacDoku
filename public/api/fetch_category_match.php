<?php
header('Content-Type: text/csv');

readfile("../../data/csv/category_match.csv");
exit;