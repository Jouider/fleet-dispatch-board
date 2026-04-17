<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Trip extends Model
{
    protected $fillable = [
        'org_id', 'driver_id', 'vehicle_id',
        'pickup_address', 'dropoff_address',
        'scheduled_at', 'duration_minutes',
        'priority', 'status', 'notes',
    ];

    protected $casts = ['scheduled_at' => 'datetime'];

    public function organization()
    {
        return $this->belongsTo(Organization::class, 'org_id');
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
