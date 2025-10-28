<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use App\Http\Requests\TaskStoreRequest;
use App\Http\Requests\TaskUpdateRequest;
use App\Http\Requests\TaskAssignRequest;
use App\Http\Resources\TaskResource;
use App\Services\TaskService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $tasks = app(TaskService::class)->listAssignedTasks(
            $user,
            $request->query('priority'),
            $request->query('status'),
            (int) $request->query('per_page', 10)
        );
        return $this->paginated($tasks, TaskResource::class);
    }

    public function store(TaskStoreRequest $request)
    {
        $user = $request->user();
        $validated = $request->validated();

        $task = app(TaskService::class)->createTask($user, $validated);
        return (new TaskResource($task))->response()->setStatusCode(201);
    }

    public function show(Request $request, Task $task)
    {
        $rid = (string) Str::uuid();
        $user = $request->user();
        Log::info('Task show: incoming', [
            'rid' => $rid,
            'path' => $request->path(),
            'method' => $request->method(),
            'user_id' => $user?->id,
            'task_id' => $task->id,
            'query' => $request->query(),
            'ip' => $request->ip(),
        ]);
        try {
            $this->authorize('view', $task);
        } catch (AuthorizationException $e) {
            Log::warning('Task show: unauthorized', [
                'rid' => $rid,
                'user_id' => $user?->id,
                'task_id' => $task->id,
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
        $task = app(TaskService::class)->getTaskWithRelations($task);
        Log::info('Task show: success', [
            'rid' => $rid,
            'user_id' => $user?->id,
            'task_id' => $task->id,
            'status' => 200,
        ]);
        return (new TaskResource($task))
            ->response()
            ->header('X-Request-Id', $rid);
    }

    public function update(TaskUpdateRequest $request, Task $task)
    {
        $rid = (string) Str::uuid();
        $user = $request->user();
        Log::info('Task update: incoming', [
            'rid' => $rid,
            'path' => $request->path(),
            'method' => $request->method(),
            'user_id' => $user?->id,
            'task_id' => $task->id,
            'payload' => $request->only(['title','description','due_date','priority','assignee_email']),
            'ip' => $request->ip(),
        ]);
        try {
            $this->authorize('update', $task);
        } catch (AuthorizationException $e) {
            Log::warning('Task update: unauthorized', [
                'rid' => $rid,
                'user_id' => $user?->id,
                'task_id' => $task->id,
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
        $validated = $request->validated();

        $task = app(TaskService::class)->updateTask($task, $validated);
        Log::info('Task update: success', [
            'rid' => $rid,
            'user_id' => $user?->id,
            'task_id' => $task->id,
            'status' => 200,
        ]);
        return (new TaskResource($task))
            ->response()
            ->header('X-Request-Id', $rid);
    }

    public function destroy(Request $request, Task $task)
    {
        $this->authorize('delete', $task);
        app(TaskService::class)->deleteTask($task);
        return response()->json(['message' => 'Task deleted']);
    }

    public function toggleComplete(Request $request, Task $task)
    {
        $this->authorize('update', $task);
        $task = app(TaskService::class)->toggleCompletion($task);
        return new TaskResource($task);
    }

    public function assign(TaskAssignRequest $request, Task $task)
    {
        $this->authorize('assign', $task);
        $validated = $request->validated();
        $task = app(TaskService::class)->assignTask($task, $validated['assignee_email']);
        return new TaskResource($task);
    }
}
