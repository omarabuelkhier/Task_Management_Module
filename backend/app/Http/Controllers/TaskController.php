<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Requests\TaskStoreRequest;
use App\Http\Requests\TaskUpdateRequest;
use App\Http\Requests\TaskAssignRequest;
use App\Http\Resources\TaskResource;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Task::with(['creator:id,name,email','assignee:id,name,email'])
            ->where('assignee_id', $user->id);

        // Filtering
        // status filtering will be applied after fetching because it's derived
        if ($priority = $request->query('priority')) {
            $query->where('priority', $priority);
        }
        $tasks = $query->orderBy('due_date')->get()->each->append('derived_status');

        if ($status = $request->query('status')) {
            $tasks = $tasks->filter(fn($task) => $task->derived_status === $status)->values();
        }

        return TaskResource::collection($tasks);
    }

    public function store(TaskStoreRequest $request)
    {
        $user = $request->user();
        $validated = $request->validated();

        $assignee = User::where('email', $validated['assignee_email'])->first();

        $task = Task::create([
            'creator_id' => $user->id,
            'assignee_id' => $assignee->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'due_date' => $validated['due_date'],
            'priority' => $validated['priority'] ?? 'medium',
            'is_completed' => false,
        ]);

        return (new TaskResource($task->append('derived_status')))->response()->setStatusCode(201);
    }

    public function show(Request $request, Task $task)
    {
        $this->authorize('view', $task);
        $task->load(['creator:id,name,email','assignee:id,name,email'])->append('derived_status');
        return new TaskResource($task);
    }

    public function update(TaskUpdateRequest $request, Task $task)
    {
        $this->authorize('update', $task);
        $validated = $request->validated();

        $task->fill($validated);
        $task->save();
        return new TaskResource($task->append('derived_status'));
    }

    public function destroy(Request $request, Task $task)
    {
        $this->authorize('delete', $task);
        $task->delete();
        return response()->json(['message' => 'Task deleted']);
    }

    public function toggleComplete(Request $request, Task $task)
    {
        $this->authorize('update', $task);
        $task->is_completed = ! $task->is_completed;
        $task->save();
        return new TaskResource($task->append('derived_status'));
    }

    public function assign(TaskAssignRequest $request, Task $task)
    {
        $this->authorize('assign', $task);
        $validated = $request->validated();
        $assignee = User::where('email', $validated['assignee_email'])->first();
        $task->assignee_id = $assignee->id;
        $task->save();
        return new TaskResource($task->append('derived_status'));
    }
}
