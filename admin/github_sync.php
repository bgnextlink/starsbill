<?php
session_start();
header('Content-Type: application/json');

// Log directory
$logDir = __DIR__ . '/../logs';
if (!file_exists($logDir)) {
    @mkdir($logDir, 0777, true);
}
$logFile = $logDir . '/github_sync.log';

function writeLog($message) {
    global $logFile;
    $date = date('Y-m-d H:i:s');
    @file_put_contents($logFile, "[$date] $message\n", FILE_APPEND);
}

writeLog("Starting GitHub Sync process...");

// Change directory to root of the project
$rootDir = realpath(__DIR__ . '/..');
chdir($rootDir);

$output = [];
$return_var = 0;

// Check if git is installed
exec('git --version 2>&1', $git_check, $git_return);
if ($git_return !== 0) {
    echo json_encode([
        'success' => false, 
        'message' => 'Git tidak ditemukan di server. Harap install Git atau gunakan terminal untuk update manual.', 
        'log' => implode("\n", $git_check)
    ]);
    exit;
}

// Check if it's a git repository
if (!is_dir('.git')) {
    writeLog("Not a git repository, initializing...");
    exec('git init 2>&1', $output);
    exec('git remote add origin https://github.com/bgnextlink/starsbill.git 2>&1', $output);
}

writeLog("Fetching from remote...");
exec('git fetch origin main 2>&1', $output, $return_var);

if ($return_var === 0) {
    writeLog("Resetting to origin/main...");
    exec('git reset --hard origin/main 2>&1', $output, $return_var);
    
    // Attempt to pull just in case
    exec('git pull origin main 2>&1', $output);
}

$outputStr = implode("\n", $output);
writeLog("Git Sync Output:\n$outputStr");

if ($return_var === 0 || strpos($outputStr, 'Already up to date') !== false || strpos($outputStr, 'HEAD is now at') !== false) {
    writeLog("Sync completed successfully.");
    echo json_encode(['success' => true, 'message' => 'Sistem berhasil diperbarui dari GitHub.', 'log' => $outputStr]);
} else {
    writeLog("Sync failed. Exit code: $return_var");
    echo json_encode(['success' => false, 'message' => 'Gagal melakukan sinkronisasi.', 'log' => $outputStr]);
}
