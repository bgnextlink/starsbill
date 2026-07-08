<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GenieacsDevice extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_id', 'customer_id', 'manufacturer', 'product_class', 
        'serial_number', 'mac_address', 'ip_address', 'software_version', 'last_inform'
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
