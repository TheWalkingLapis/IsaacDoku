<?php
header('Content-Type: text/csv');

readfile("../../data/csv/category_assignments.csv");
exit;