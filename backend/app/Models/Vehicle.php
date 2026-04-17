<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $fillable = ['org_id', 'name', 'plate', 'year', 'status', 'mileage'];

    public function organization()
    {
        return $this->belongsTo(Organization::class, 'org_id');
    }

    public function trips()
    {
        return $this->hasMany(Trip::class);
    }
}
