<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TaskUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes','required','string','max:255'],
            'description' => ['nullable','string'],
            'due_date' => ['sometimes','required','date'],
            'priority' => ['nullable', Rule::in(['low','medium','high'])],
            'is_completed' => ['sometimes','boolean'],
        ];
    }
}
