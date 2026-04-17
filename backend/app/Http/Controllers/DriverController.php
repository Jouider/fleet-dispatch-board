<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDriverRequest;
use App\Http\Requests\UpdateDriverRequest;
use App\Models\Driver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $drivers = Driver::where('org_id', 1)
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->get();

        return response()->json($drivers);
    }

    public function store(StoreDriverRequest $request): JsonResponse
    {
        $driver = Driver::create(['org_id' => 1, ...$request->validated()]);

        return response()->json($driver, 201);
    }

    public function show(Driver $driver): JsonResponse
    {
        return response()->json($driver);
    }

    public function update(UpdateDriverRequest $request, Driver $driver): JsonResponse
    {
        $data = $request->validated();

        // Si on change le statut vers unavailable ou on_leave, vérifier les trips actifs
        if (isset($data['status']) && $data['status'] !== 'available' && $data['status'] !== $driver->status) {
            $activeTrips = $driver->trips()
                ->whereIn('status', ['assigned', 'in_progress'])
                ->with('vehicle')
                ->get();

            if ($activeTrips->isNotEmpty()) {
                $tripDetails = $activeTrips->map(fn($t) => [
                    'id'             => $t->id,
                    'status'         => $t->status,
                    'pickup_address' => $t->pickup_address,
                    'dropoff_address'=> $t->dropoff_address,
                    'scheduled_at'   => $t->scheduled_at,
                ]);

                return response()->json([
                    'message'       => "Cannot change driver status to '{$data['status']}': driver has active trips that require reassignment.",
                    'active_trips'  => $tripDetails,
                    'requires_reassignment' => true,
                ], 409);
            }
        }

        $driver->update($data);

        return response()->json($driver->fresh());
    }

    public function destroy(Driver $driver): JsonResponse
    {
        $activeTrips = $driver->trips()
            ->whereIn('status', ['assigned', 'in_progress'])
            ->count();

        if ($activeTrips > 0) {
            return response()->json([
                'message' => "Cannot delete driver with {$activeTrips} active trip(s). Reassign them first.",
                'requires_reassignment' => true,
            ], 409);
        }

        $driver->delete();

        return response()->json(null, 204);
    }
}
