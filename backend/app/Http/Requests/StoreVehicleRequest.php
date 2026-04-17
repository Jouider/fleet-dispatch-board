<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'    => 'required|string|max:255',
            'plate'   => 'required|string|max:20|unique:vehicles',
            'year'    => 'nullable|digits:4|integer|min:1990|max:2030',
            'status'  => 'sometimes|in:available,in_maintenance,retired',
            'mileage' => 'sometimes|integer|min:0',
        ];
    }
}
