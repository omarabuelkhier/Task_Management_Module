<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Task */
class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'creator_id' => $this->creator_id,
            'assignee_id' => $this->assignee_id,
            'title' => $this->title,
            'description' => $this->description,
            'due_date' => optional($this->due_date)->toIso8601String(),
            'priority' => $this->priority,
            'is_completed' => (bool) $this->is_completed,
            'derived_status' => $this->derived_status,
            'creator' => $this->whenLoaded('creator', fn() => new UserResource($this->creator)),
            'assignee' => $this->whenLoaded('assignee', fn() => new UserResource($this->assignee)),
        ];
    }
}
