<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrganizationRequest;
use App\Http\Requests\UpdateOrganizationRequest;
use App\Models\Organization;
use Illuminate\Http\JsonResponse;

class OrganizationController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Organization::all());
    }

    public function store(StoreOrganizationRequest $request): JsonResponse
    {
        $org = Organization::create($request->validated());

        return response()->json($org, 201);
    }

    public function show(Organization $organization): JsonResponse
    {
        return response()->json($organization->load(['drivers', 'vehicles']));
    }

    public function update(UpdateOrganizationRequest $request, Organization $organization): JsonResponse
    {
        $organization->update($request->validated());

        return response()->json($organization->fresh());
    }

    public function destroy(Organization $organization): JsonResponse
    {
        $organization->delete();

        return response()->json(null, 204);
    }
}
