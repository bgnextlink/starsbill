<?php
session_start();
header('Content-Type: application/json');

// Execute git pull
$output = [];
$return_var = 0;

// Execute git pull (assuming the web server has permission)
exec('git pull origin main 2>&1', $output, $return_var);

$log = implode("\n", $output);

if ($return_var === 0) {
    echo json_encode(['success' => true, 'message' => 'Sistem berhasil diperbarui dari GitHub.', 'log' => $log]);
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal melakukan sinkronisasi.', 'log' => $log]);
}
