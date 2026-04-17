<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignTripRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'driver_id'  => 'required|exists:drivers,id',
            'vehicle_id' => 'required|exists:vehicles,id',
        ];
    }
}
