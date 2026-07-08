<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    public function index()
    {
        return response()->json(Package::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'price' => 'required|numeric|min:0',
            'profile_mikrotik' => 'nullable|string',
            'speed_download' => 'nullable|integer',
            'speed_upload' => 'nullable|integer',
        ]);

        $package = Package::create($validated);
        return response()->json(['message' => 'Package created', 'data' => $package], 201);
    }

    public function show(Package $package)
    {
        return response()->json($package);
    }

    public function update(Request $request, Package $package)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric|min:0',
            'profile_mikrotik' => 'nullable|string',
            'speed_download' => 'nullable|integer',
            'speed_upload' => 'nullable|integer',
        ]);

        $package->update($validated);
        return response()->json(['message' => 'Package updated', 'data' => $package]);
    }

    public function destroy(Package $package)
    {
        $package->delete();
        return response()->json(['message' => 'Package deleted'], 204);
    }
}
