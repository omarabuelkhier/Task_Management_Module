<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'creator_id','assignee_id','title','description','due_date','priority','is_completed'
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'is_completed' => 'boolean',
    ];

    protected $appends = [];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function getDerivedStatusAttribute(): string
    {
        if ($this->is_completed) {
            return 'Done';
        }
        $today = now()->startOfDay();
        $due = $this->due_date instanceof \DateTimeInterface ? Carbon::parse($this->due_date) : now();
        if ($due->isBefore($today)) {
            return 'Missed/Late';
        }
        if ($due->isSameDay($today)) {
            return 'Due Today';
        }
        return 'Upcoming';
    }
}
