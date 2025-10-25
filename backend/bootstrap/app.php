<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Enable CORS globally for API requests
        $middleware->use([
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
        // Ensure unauthenticated requests don't redirect to route('login')
        $middleware->redirectGuestsTo(fn () => null);

            // Middleware aliases
            $middleware->alias([
                'auth' => \App\Http\Middleware\Authenticate::class,
            ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Return JSON 401 for unauthenticated API requests instead of redirecting to route('login')
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
            return null; // use default handling for non-API
        });
    })->create();
