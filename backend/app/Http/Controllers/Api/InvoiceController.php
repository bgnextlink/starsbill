<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Carbon\Carbon;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Invoice::query()->with('customer');

        if ($search = $request->input('search')) {
            $query->where('invoice_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        return response()->json($query->paginate($request->input('per_page', 15)));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
        ]);

        $validated['invoice_number'] = 'INV-' . date('YmdHis') . rand(100, 999);
        $validated['status'] = 'unpaid';

        $invoice = Invoice::create($validated);

        return response()->json(['message' => 'Invoice created', 'data' => $invoice], 201);
    }

    public function show(Invoice $invoice)
    {
        return response()->json($invoice->load('customer'));
    }

    public function pay(Request $request, Invoice $invoice)
    {
        $request->validate([
            'payment_method' => 'required|string',
            'amount' => 'required|numeric|min:0'
        ]);

        if ($invoice->status === 'paid') {
            return response()->json(['message' => 'Invoice is already paid'], 400);
        }

        $invoice->update([
            'status' => 'paid',
            'paid_date' => Carbon::now()
        ]);

        // Generate log or payment record here...

        return response()->json(['message' => 'Invoice marked as paid', 'data' => $invoice]);
    }
}
