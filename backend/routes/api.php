<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;

// Public auth endpoints (throttled)
Route::prefix('auth')->controller(AuthController::class)->group(function () {
    Route::post('/register', 'register')->middleware('throttle:10,1');
    Route::post('/login', 'login')->middleware('throttle:10,1');
});

Route::middleware('auth:sanctum')->group(function () {
    // Auth (protected)
    Route::prefix('auth')->controller(AuthController::class)->group(function () {
        Route::post('/logout', 'logout')->middleware('throttle:30,1');
    });

    // Tasks
    Route::prefix('tasks')->controller(TaskController::class)->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store')->middleware('throttle:60,1');
        Route::get('/{task}', 'show');
        Route::put('/{task}', 'update')->middleware('throttle:60,1');
        Route::delete('/{task}', 'destroy')->middleware('throttle:60,1');
        Route::post('/{task}/toggle', 'toggleComplete')->middleware('throttle:60,1');
        Route::post('/{task}/assign', 'assign')->middleware('throttle:60,1');
    });

    // Users
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        // kept in AuthController per codebase; path remains /users/lookup
        Route::get('/lookup', [AuthController::class, 'lookupUserByEmail']);
    });
});
