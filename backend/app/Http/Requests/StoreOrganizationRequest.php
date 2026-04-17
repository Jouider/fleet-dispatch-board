<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrganizationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'     => 'required|string|max:255',
            'slug'     => 'required|string|max:100|unique:organizations|regex:/^[a-z0-9-]+$/',
            'plan'     => 'sometimes|in:free,pro,enterprise',
            'settings' => 'nullable|array',
        ];
    }
}
