<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'invoice_number', 'customer_id', 'amount', 'status', 'due_date', 'paid_date'
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
