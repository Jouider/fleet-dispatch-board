<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDriverRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $driverId = $this->route('driver')?->id;

        return [
            'name'       => 'sometimes|string|max:255',
            'phone'      => ['nullable', 'regex:/^(?:\+212|0)(6|7)\d{8}$/', "unique:drivers,phone,{$driverId}"],
            'license_no' => ['nullable', 'string', 'max:50', "unique:drivers,license_no,{$driverId}"],
            'status'     => 'sometimes|in:available,unavailable,on_leave',
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex'          => 'Le numéro de téléphone doit être un numéro marocain valide (ex: 0612345678 ou +212612345678).',
            'phone.unique'         => 'Ce numéro de téléphone est déjà utilisé par un autre chauffeur.',
            'license_no.unique'    => 'Ce numéro de permis est déjà utilisé par un autre chauffeur.',
        ];
    }
}
