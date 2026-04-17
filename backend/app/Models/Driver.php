<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    protected $fillable = ['org_id', 'name', 'phone', 'license_no', 'status'];

    public function organization()
    {
        return $this->belongsTo(Organization::class, 'org_id');
    }

    public function trips()
    {
        return $this->hasMany(Trip::class);
    }
}
