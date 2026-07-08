<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Customers
    Route::apiResource('customers', CustomerController::class);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('invoices', App\Http\Controllers\Api\InvoiceController::class)->except(['update', 'destroy']);
    Route::post('invoices/{invoice}/pay', [App\Http\Controllers\Api\InvoiceController::class, 'pay']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('routers', App\Http\Controllers\Api\RouterController::class);
    Route::get('routers/{router}/ping', [App\Http\Controllers\Api\RouterController::class, 'ping']);
    
    Route::apiResource('packages', App\Http\Controllers\Api\PackageController::class);
});
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('tickets', App\Http\Controllers\Api\TicketController::class)->except(['destroy']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('odps', App\Http\Controllers\Api\OdpController::class);
});
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('employees', App\Http\Controllers\Api\EmployeeController::class)->except(['update']);
});
