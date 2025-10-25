<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TaskStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required','string','max:255'],
            'description' => ['nullable','string'],
            'due_date' => ['required','date'],
            'priority' => ['nullable', Rule::in(['low','medium','high'])],
            'assignee_email' => ['required','email','exists:users,email'],
        ];
    }
}
