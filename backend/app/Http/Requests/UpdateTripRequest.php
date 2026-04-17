<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTripRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pickup_address'   => 'sometimes|string|max:255',
            'dropoff_address'  => 'sometimes|string|max:255',
            'scheduled_at'     => 'sometimes|date|after:now',
            'duration_minutes' => 'sometimes|integer|min:15|max:1440',
            'priority'         => 'sometimes|in:low,medium,high',
            'notes'            => 'nullable|string',
        ];
    }
}
