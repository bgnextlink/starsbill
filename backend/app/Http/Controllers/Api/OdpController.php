<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Odp;
use Illuminate\Http\Request;

class OdpController extends Controller
{
    public function index()
    {
        return response()->json(Odp::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string',
            'total_ports' => 'required|integer|min:1',
            'used_ports' => 'nullable|integer|min:0',
        ]);

        $odp = Odp::create($validated);
        return response()->json(['message' => 'ODP created successfully', 'data' => $odp], 201);
    }

    public function show(Odp $odp)
    {
        return response()->json($odp);
    }

    public function update(Request $request, Odp $odp)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'location' => 'nullable|string',
            'total_ports' => 'sometimes|required|integer|min:1',
            'used_ports' => 'nullable|integer|min:0',
        ]);

        $odp->update($validated);
        return response()->json(['message' => 'ODP updated successfully', 'data' => $odp]);
    }

    public function destroy(Odp $odp)
    {
        $odp->delete();
        return response()->json(['message' => 'ODP deleted successfully'], 204);
    }
}
