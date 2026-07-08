<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class EmployeeController extends Controller
{
    public function index()
    {
        $employees = Employee::with('user:id,name,email,phone')->get();
        return response()->json($employees);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:20|unique:users,phone',
            'password' => 'required|string|min:6',
            'department' => 'required|string',
            'position' => 'required|string',
            'role' => 'required|string|exists:roles,name',
        ]);

        DB::beginTransaction();
        try {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
            ]);

            $user->assignRole($validated['role']);

            $employee = Employee::create([
                'user_id' => $user->id,
                'department' => $validated['department'],
                'position' => $validated['position']
            ]);

            DB::commit();
            return response()->json(['message' => 'Employee created successfully', 'data' => $employee->load('user')], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create employee', 'error' => $e->getMessage()], 500);
        }
    }

    public function show(Employee $employee)
    {
        return response()->json($employee->load('user'));
    }

    public function destroy(Employee $employee)
    {
        DB::beginTransaction();
        try {
            $user = $employee->user;
            $employee->delete();
            if ($user) $user->delete();
            
            DB::commit();
            return response()->json(['message' => 'Employee deleted successfully'], 204);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to delete employee'], 500);
        }
    }
}
