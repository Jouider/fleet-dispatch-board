<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Organization extends Model
{
    protected $fillable = ['name', 'slug', 'plan', 'settings'];

    protected $casts = ['settings' => 'array'];

    public function drivers()
    {
        return $this->hasMany(Driver::class, 'org_id');
    }

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class, 'org_id');
    }

    public function trips()
    {
        return $this->hasMany(Trip::class, 'org_id');
    }
}
