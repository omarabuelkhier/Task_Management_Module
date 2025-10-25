<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Task;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Users
        $creator = User::factory()->create([
            'name' => 'Alice Creator',
            'email' => 'alice@example.com',
        ]);
        $assignee = User::factory()->create([
            'name' => 'Bob Assignee',
            'email' => 'bob@example.com',
        ]);

        // Sample task
        Task::create([
            'creator_id' => $creator->id,
            'assignee_id' => $assignee->id,
            'title' => 'Seeded Task',
            'description' => 'This is a seeded task for testing.',
            'due_date' => now()->addDay(),
            'priority' => 'medium',
            'is_completed' => false,
        ]);
    }
}
