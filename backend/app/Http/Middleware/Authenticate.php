<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     * Return null to produce a 401 JSON for API requests instead of redirecting to a login route.
     */
    protected function redirectTo(Request $request): ?string
    {
        // For API routes or JSON-expecting requests, do not redirect
        if ($request->expectsJson() || $request->is('api/*')) {
            return null;
        }

        // No web login route in this app; returning null ensures 401 is returned
        return null;
    }
}
