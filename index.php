<?php
/**
 * StarBilling ISP Suite - Main Entry
 */
if (!file_exists(__DIR__ . '/config.php')) {
    header("Location: install/");
    exit;
}
require_once "init.php";
echo "Welcome to StarBilling";
