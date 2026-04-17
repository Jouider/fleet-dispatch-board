<?php

use App\Http\Controllers\DriverController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\TripController;
use App\Http\Controllers\VehicleController;
use Illuminate\Support\Facades\Route;

Route::apiResource('trips', TripController::class);
Route::post('trips/{trip}/assign', [TripController::class, 'assign']);
Route::patch('trips/{trip}/status', [TripController::class, 'updateStatus']);

Route::apiResource('drivers', DriverController::class);
Route::apiResource('vehicles', VehicleController::class);
Route::apiResource('organizations', OrganizationController::class);
