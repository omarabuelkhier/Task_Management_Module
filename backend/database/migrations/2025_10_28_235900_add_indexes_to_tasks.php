<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->index('assignee_id', 'tasks_assignee_id_idx');
            $table->index('due_date', 'tasks_due_date_idx');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex('tasks_assignee_id_idx');
            $table->dropIndex('tasks_due_date_idx');
        });
    }
};
