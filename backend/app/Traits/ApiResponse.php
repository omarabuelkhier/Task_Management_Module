<?php

namespace App\Traits;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Resources\Json\JsonResource;

trait ApiResponse
{
    protected function success($data = null, string $message = 'OK', int $code = 200, array $meta = [])
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'meta' => (object) $meta,
        ], $code);
    }

    protected function error(string $message = 'Error', int $code = 400, $errors = null)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $code);
    }

    /**
     * Build a standard paginated response.
     *
     * @param  LengthAwarePaginator  $paginator
     * @param  class-string<JsonResource>  $resourceClass
     */
    protected function paginated(LengthAwarePaginator $paginator, string $resourceClass, string $message = 'OK', int $code = 200)
    {
    $items = $resourceClass::collection(collect($paginator->items()));
        $meta = [
            'current_page' => $paginator->currentPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'last_page' => $paginator->lastPage(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
            'has_more' => $paginator->hasMorePages(),
        ];

        return $this->success($items, $message, $code, $meta);
    }
}
