<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    public function view(User $user, Task $task): bool
    {
       // Spec: Only the assignee can view the task
       return $task->assignee_id === $user->id;
    }

    public function update(User $user, Task $task): bool
    {
       // Spec: Only the assignee can edit/complete the task
       return $task->assignee_id === $user->id;
    }

    public function delete(User $user, Task $task): bool
    {
       // Spec: Assignee or creator can delete
       return $task->assignee_id === $user->id || $task->creator_id === $user->id;
    }

    public function assign(User $user, Task $task): bool
    {
        return $task->creator_id === $user->id;
    }
}
