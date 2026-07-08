<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up() {
        Schema::create('genieacs_devices', function (Blueprint $table) {
            $table->id();
            $table->string('device_id')->unique(); // SN or GenieACS ID
            $table->unsignedBigInteger('customer_id')->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('product_class')->nullable();
            $table->string('serial_number')->nullable();
            $table->string('mac_address')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('software_version')->nullable();
            $table->timestamp('last_inform')->nullable();
            $table->timestamps();
        });
    }
    public function down() { Schema::dropIfExists('genieacs_devices'); }
};
