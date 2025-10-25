<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class TaskService
{
    public function listAssignedTasks(User $user, ?string $priority = null, ?string $status = null, int $perPage = 10): LengthAwarePaginator
    {
        $query = Task::with(['creator:id,name,email','assignee:id,name,email'])
            ->where('assignee_id', $user->id);

        if ($priority) {
            $query->where('priority', $priority);
        }

        $paginator = $query->orderBy('due_date')->paginate($perPage);
        $tasks = collect($paginator->items());
        $tasks->each(fn($task) => $task->append('derived_status'));

        if ($status) {
            $filtered = $tasks->filter(fn($task) => $task->derived_status === $status)->values();
            // replace paginator items with filtered set but keep meta consistent
            $paginator->setCollection($filtered);
        }

        return $paginator;
    }

    public function createTask(User $creator, array $data): Task
    {
        $assignee = User::where('email', $data['assignee_email'])->first();

        $task = Task::create([
            'creator_id' => $creator->id,
            'assignee_id' => $assignee->id,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'due_date' => $data['due_date'],
            'priority' => $data['priority'] ?? 'medium',
            'is_completed' => false,
        ]);

        return $task->append('derived_status');
    }

    public function getTaskWithRelations(Task $task): Task
    {
        return $task->load(['creator:id,name,email','assignee:id,name,email'])->append('derived_status');
    }

    public function updateTask(Task $task, array $data): Task
    {
        $task->fill($data);
        $task->save();
        return $task->append('derived_status');
    }

    public function deleteTask(Task $task): void
    {
        $task->delete();
    }

    public function toggleCompletion(Task $task): Task
    {
        $task->is_completed = ! $task->is_completed;
        $task->save();
        return $task->append('derived_status');
    }

    public function assignTask(Task $task, string $assigneeEmail): Task
    {
        $assignee = User::where('email', $assigneeEmail)->first();
        $task->assignee_id = $assignee->id;
        $task->save();
        return $task->append('derived_status');
    }
}
