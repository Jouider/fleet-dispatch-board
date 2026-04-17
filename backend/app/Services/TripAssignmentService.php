<?php

namespace App\Services;

use App\Models\Driver;
use App\Models\Trip;
use App\Models\Vehicle;
use Illuminate\Validation\ValidationException;

class TripAssignmentService
{
    public function assign(Trip $trip, Driver $driver, Vehicle $vehicle): Trip
    {
        $this->ensureTripIsAssignable($trip);
        $this->ensureDriverIsAvailable($driver, $trip);
        $this->ensureVehicleIsAvailable($vehicle, $trip);

        $trip->update([
            'driver_id'  => $driver->id,
            'vehicle_id' => $vehicle->id,
            'status'     => 'assigned',
        ]);

        return $trip->fresh(['driver', 'vehicle']);
    }

    private function ensureTripIsAssignable(Trip $trip): void
    {
        if (in_array($trip->status, ['in_progress', 'completed', 'cancelled'])) {
            throw ValidationException::withMessages([
                'trip' => "Cannot assign a trip with status '{$trip->status}'.",
            ]);
        }
    }

    private function ensureDriverIsAvailable(Driver $driver, Trip $trip): void
    {
        if ($driver->status !== 'available') {
            throw ValidationException::withMessages([
                'driver_id' => "Driver '{$driver->name}' is not available (status: {$driver->status}).",
            ]);
        }

        // Vérifie les chevauchements : un autre trip du même driver
        // qui se chevauche avec la plage [scheduled_at, scheduled_at + duration]
        $tripEnd = $trip->scheduled_at->copy()->addMinutes($trip->duration_minutes);

        $conflict = Trip::where('driver_id', $driver->id)
            ->where('id', '!=', $trip->id)
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->where('scheduled_at', '<', $tripEnd)
            ->whereRaw('DATE_ADD(scheduled_at, INTERVAL duration_minutes MINUTE) > ?', [$trip->scheduled_at])
            ->first();

        if ($conflict) {
            throw ValidationException::withMessages([
                'driver_id' => "Driver '{$driver->name}' already has a trip from {$conflict->scheduled_at->format('H:i')} to "
                    . $conflict->scheduled_at->copy()->addMinutes($conflict->duration_minutes)->format('H:i')
                    . " on {$conflict->scheduled_at->format('Y-m-d')}.",
            ]);
        }
    }

    private function ensureVehicleIsAvailable(Vehicle $vehicle, Trip $trip): void
    {
        if ($vehicle->status !== 'available') {
            throw ValidationException::withMessages([
                'vehicle_id' => "Vehicle '{$vehicle->name}' is not available (status: {$vehicle->status}).",
            ]);
        }

        $tripEnd = $trip->scheduled_at->copy()->addMinutes($trip->duration_minutes);

        $conflict = Trip::where('vehicle_id', $vehicle->id)
            ->where('id', '!=', $trip->id)
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->where('scheduled_at', '<', $tripEnd)
            ->whereRaw('DATE_ADD(scheduled_at, INTERVAL duration_minutes MINUTE) > ?', [$trip->scheduled_at])
            ->first();

        if ($conflict) {
            throw ValidationException::withMessages([
                'vehicle_id' => "Vehicle '{$vehicle->name}' is already assigned to a trip on {$conflict->scheduled_at->format('Y-m-d H:i')}.",
            ]);
        }
    }
}
