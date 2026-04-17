<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $vehicleId = $this->route('vehicle')?->id;

        return [
            'name'    => 'sometimes|string|max:255',
            'plate'   => 'sometimes|string|max:20|unique:vehicles,plate,' . $vehicleId,
            'year'    => 'nullable|digits:4|integer|min:1990|max:2030',
            'status'  => 'sometimes|in:available,in_maintenance,retired',
            'mileage' => 'sometimes|integer|min:0',
        ];
    }
}
