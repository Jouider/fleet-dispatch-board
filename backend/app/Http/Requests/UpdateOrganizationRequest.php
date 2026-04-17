<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrganizationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $orgId = $this->route('organization')?->id;

        return [
            'name'     => 'sometimes|string|max:255',
            'slug'     => 'sometimes|string|max:100|unique:organizations,slug,' . $orgId . '|regex:/^[a-z0-9-]+$/',
            'plan'     => 'sometimes|in:free,pro,enterprise',
            'settings' => 'nullable|array',
        ];
    }
}
