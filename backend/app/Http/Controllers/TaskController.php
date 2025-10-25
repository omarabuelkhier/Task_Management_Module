<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

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
        $tasks = $query->orderBy('due_date')->get()
            ->map(function ($task) {
                $task->append('derived_status');
                return $task;
            });

        if ($status = $request->query('status')) {
            $tasks = $tasks->filter(fn($task) => $task->derived_status === $status)->values();
        }

        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'title' => ['required','string','max:255'],
            'description' => ['nullable','string'],
            'due_date' => ['required','date'],
            'priority' => ['nullable', Rule::in(['low','medium','high'])],
            'assignee_email' => ['required','email','exists:users,email'],
        ]);

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

        return response()->json($task->append('derived_status'), 201);
    }

    public function show(Request $request, Task $task)
    {
        $this->authorizeViewOrEdit($request->user(), $task);
        return response()->json($task->load(['creator:id,name,email','assignee:id,name,email'])->append('derived_status'));
    }

    public function update(Request $request, Task $task)
    {
        $this->authorizeViewOrEdit($request->user(), $task);
        $validated = $request->validate([
            'title' => ['sometimes','required','string','max:255'],
            'description' => ['nullable','string'],
            'due_date' => ['sometimes','required','date'],
            'priority' => ['nullable', Rule::in(['low','medium','high'])],
            'is_completed' => ['sometimes','boolean'],
        ]);

        $task->fill($validated);
        $task->save();
        return response()->json($task->append('derived_status'));
    }

    public function destroy(Request $request, Task $task)
    {
        $user = $request->user();
        if ($task->assignee_id !== $user->id && $task->creator_id !== $user->id) {
            abort(403, 'You are not allowed to delete this task');
        }
        $task->delete();
        return response()->json(['message' => 'Task deleted']);
    }

    public function toggleComplete(Request $request, Task $task)
    {
        $this->authorizeViewOrEdit($request->user(), $task);
        $task->is_completed = ! $task->is_completed;
        $task->save();
        return response()->json($task->append('derived_status'));
    }

    public function assign(Request $request, Task $task)
    {
        $user = $request->user();
        if ($task->creator_id !== $user->id) {
            abort(403, 'Only creator can (re)assign this task');
        }
        $validated = $request->validate([
            'assignee_email' => ['required','email','exists:users,email'],
        ]);
        $assignee = User::where('email', $validated['assignee_email'])->first();
        $task->assignee_id = $assignee->id;
        $task->save();
        return response()->json($task->append('derived_status'));
    }

    private function authorizeViewOrEdit(User $user, Task $task)
    {
        if ($task->assignee_id !== $user->id) {
            abort(403, 'You are not allowed to access this task');
        }
    }
}
