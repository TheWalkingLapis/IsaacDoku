<?php
header('Content-Type: text/csv');

readfile("../../isaacdoku/data/csv/category_assignments.csv");
exit;