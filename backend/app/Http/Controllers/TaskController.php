<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Requests\TaskStoreRequest;
use App\Http\Requests\TaskUpdateRequest;
use App\Http\Requests\TaskAssignRequest;
use App\Http\Resources\TaskResource;
use App\Services\TaskService;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $tasks = app(TaskService::class)->listAssignedTasks(
            $user,
            $request->query('priority'),
            $request->query('status')
        );
        return TaskResource::collection($tasks);
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
        $this->authorize('view', $task);
        $task = app(TaskService::class)->getTaskWithRelations($task);
        return new TaskResource($task);
    }

    public function update(TaskUpdateRequest $request, Task $task)
    {
        $this->authorize('update', $task);
        $validated = $request->validated();

        $task = app(TaskService::class)->updateTask($task, $validated);
        return new TaskResource($task);
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
