<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Odp extends Model
{
    use HasFactory;
    
    protected $table = 'odps';
    protected $fillable = ['name', 'location', 'total_ports', 'used_ports'];
}
