<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'customer_number',
        'name',
        'email',
        'phone',
        'address',
        'package_id',
        'router_id',
        'odp_id',
        'status',
        'connection_type',
        'username_ppp',
        'password_ppp',
        'ip_address',
        'mac_address',
        'billing_cycle',
    ];

    public static function boot()
    {
        parent::boot();
        self::creating(function ($model) {
            if (empty($model->customer_number) && !empty($model->phone)) {
                $phone = preg_replace('/[^0-9]/', '', $model->phone);
                if (str_starts_with($phone, '0')) {
                    $phone = '62' . substr($phone, 1);
                }
                $model->customer_number = $phone;
            }
        });
    }
}
