<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVehicleRequest;
use App\Http\Requests\UpdateVehicleRequest;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $vehicles = Vehicle::where('org_id', 1)
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->get();

        return response()->json($vehicles);
    }

    public function store(StoreVehicleRequest $request): JsonResponse
    {
        $vehicle = Vehicle::create(['org_id' => 1, ...$request->validated()]);

        return response()->json($vehicle, 201);
    }

    public function show(Vehicle $vehicle): JsonResponse
    {
        return response()->json($vehicle);
    }

    public function update(UpdateVehicleRequest $request, Vehicle $vehicle): JsonResponse
    {
        $data = $request->validated();

        // Si on change le statut vers in_maintenance ou retired, vérifier les trips actifs
        if (isset($data['status']) && $data['status'] !== 'available' && $data['status'] !== $vehicle->status) {
            $activeTrips = $vehicle->trips()
                ->whereIn('status', ['assigned', 'in_progress'])
                ->with('driver')
                ->get();

            if ($activeTrips->isNotEmpty()) {
                $tripDetails = $activeTrips->map(fn($t) => [
                    'id'              => $t->id,
                    'status'          => $t->status,
                    'pickup_address'  => $t->pickup_address,
                    'dropoff_address' => $t->dropoff_address,
                    'scheduled_at'    => $t->scheduled_at,
                ]);

                return response()->json([
                    'message'               => "Cannot change vehicle status to '{$data['status']}': vehicle has active trips that require reassignment.",
                    'active_trips'          => $tripDetails,
                    'requires_reassignment' => true,
                ], 409);
            }
        }

        $vehicle->update($data);

        return response()->json($vehicle->fresh());
    }

    public function destroy(Vehicle $vehicle): JsonResponse
    {
        $activeTrips = $vehicle->trips()
            ->whereIn('status', ['assigned', 'in_progress'])
            ->count();

        if ($activeTrips > 0) {
            return response()->json([
                'message'               => "Cannot delete vehicle with {$activeTrips} active trip(s). Reassign them first.",
                'requires_reassignment' => true,
            ], 409);
        }

        $vehicle->delete();

        return response()->json(null, 204);
    }
}
