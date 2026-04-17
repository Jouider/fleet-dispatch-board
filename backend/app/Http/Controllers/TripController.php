<?php

namespace App\Http\Controllers;

use App\Http\Requests\AssignTripRequest;
use App\Http\Requests\StoreTripRequest;
use App\Http\Requests\UpdateTripRequest;
use App\Models\Driver;
use App\Models\Trip;
use App\Models\Vehicle;
use App\Services\TripAssignmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TripController extends Controller
{
    public function __construct(private TripAssignmentService $assignmentService) {}

    public function index(): JsonResponse
    {
        $trips = Trip::with(['driver', 'vehicle'])
            ->where('org_id', 1) // hardcoded pour le challenge (pas d'auth)
            ->orderBy('scheduled_at')
            ->get()
            ->groupBy('status');

        return response()->json($trips);
    }

    public function store(StoreTripRequest $request): JsonResponse
    {
        $trip = Trip::create([
            ...$request->validated(),
            'org_id' => 1,
        ]);

        return response()->json($trip, 201);
    }

    public function show(Trip $trip): JsonResponse
    {
        return response()->json($trip->load(['driver', 'vehicle']));
    }

    public function update(UpdateTripRequest $request, Trip $trip): JsonResponse
    {
        if (in_array($trip->status, ['in_progress', 'completed', 'cancelled'])) {
            return response()->json(['message' => 'Cannot edit a trip with status: ' . $trip->status], 422);
        }

        $trip->update($request->validated());

        return response()->json($trip->fresh(['driver', 'vehicle']));
    }

    public function destroy(Trip $trip): JsonResponse
    {
        if ($trip->status === 'in_progress') {
            return response()->json(['message' => 'Cannot delete a trip in progress.'], 422);
        }

        $trip->delete();

        return response()->json(null, 204);
    }

    public function assign(AssignTripRequest $request, Trip $trip): JsonResponse
    {
        $driver  = Driver::findOrFail($request->driver_id);
        $vehicle = Vehicle::findOrFail($request->vehicle_id);

        $trip = $this->assignmentService->assign($trip, $driver, $vehicle);

        return response()->json($trip);
    }

    public function updateStatus(Request $request, Trip $trip): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:planned,assigned,in_progress,completed,cancelled',
        ]);

        $trip->update(['status' => $request->status]);

        return response()->json($trip->fresh(['driver', 'vehicle']));
    }
}
