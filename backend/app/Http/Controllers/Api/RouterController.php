<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Router;
use App\Services\MikrotikService;
use Illuminate\Http\Request;

class RouterController extends Controller
{
    public function index()
    {
        return response()->json(Router::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'host' => 'required|ip',
            'port' => 'required|integer',
            'user' => 'required|string',
            'password' => 'required|string',
        ]);

        $router = Router::create($validated);
        return response()->json(['message' => 'Router created successfully', 'data' => $router], 201);
    }

    public function show(Router $router)
    {
        return response()->json($router);
    }

    public function update(Request $request, Router $router)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string',
            'host' => 'sometimes|required|ip',
            'port' => 'sometimes|required|integer',
            'user' => 'sometimes|required|string',
            'password' => 'sometimes|required|string',
            'status' => 'sometimes|required|string'
        ]);

        $router->update($validated);
        return response()->json(['message' => 'Router updated successfully', 'data' => $router]);
    }

    public function destroy(Router $router)
    {
        $router->delete();
        return response()->json(['message' => 'Router deleted successfully'], 204);
    }

    public function ping(Router $router, MikrotikService $mikrotikService)
    {
        try {
            $mikrotikService->connect($router->host, $router->user, $router->password, $router->port);
            $resources = $mikrotikService->getSystemResource();
            
            $router->update(['status' => 'online']);
            
            return response()->json([
                'message' => 'Connected successfully',
                'resources' => $resources[0] ?? []
            ]);
        } catch (\Exception $e) {
            $router->update(['status' => 'offline']);
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}
