<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTripRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pickup_address'   => 'required|string|max:255',
            'dropoff_address'  => 'required|string|max:255',
            'scheduled_at'     => 'required|date|after:now',
            'duration_minutes' => 'sometimes|integer|min:15|max:1440',
            'priority'         => 'required|in:low,medium,high',
            'notes'            => 'nullable|string',
        ];
    }
}
