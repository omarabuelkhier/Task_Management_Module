<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        $query = User::query()->select('id','name','email')->orderBy('name');
        if ($q !== '') {
            $query->where(function($sub) use ($q) {
                $sub->where('name', 'like', "%$q%")
                    ->orWhere('email', 'like', "%$q%");
            });
        }
        $users = $query->limit(100)->get();
        return UserResource::collection($users);
    }
}
