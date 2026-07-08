<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::query();

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('customer_number', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        return response()->json($query->paginate($request->input('per_page', 15)));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'connection_type' => 'required|in:pppoe,hotspot,static',
            'status' => 'required|in:active,suspended,terminated',
            'package_id' => 'nullable|integer',
            'router_id' => 'nullable|integer',
            'odp_id' => 'nullable|integer',
            'username_ppp' => 'nullable|string',
            'password_ppp' => 'nullable|string',
            'ip_address' => 'nullable|string',
            'mac_address' => 'nullable|string',
            'billing_cycle' => 'required|integer|min:1|max:31',
        ]);

        $customer = Customer::create($validated);
        return response()->json(['message' => 'Customer created successfully', 'data' => $customer], 201);
    }

    public function show(Customer $customer)
    {
        return response()->json($customer);
    }

    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|required|string|max:20',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'connection_type' => 'sometimes|required|in:pppoe,hotspot,static',
            'status' => 'sometimes|required|in:active,suspended,terminated',
            'package_id' => 'nullable|integer',
            'router_id' => 'nullable|integer',
            'odp_id' => 'nullable|integer',
            'username_ppp' => 'nullable|string',
            'password_ppp' => 'nullable|string',
            'ip_address' => 'nullable|string',
            'mac_address' => 'nullable|string',
            'billing_cycle' => 'sometimes|required|integer|min:1|max:31',
        ]);

        $customer->update($validated);
        return response()->json(['message' => 'Customer updated successfully', 'data' => $customer]);
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();
        return response()->json(['message' => 'Customer deleted successfully'], 204);
    }
}
