<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('customer_number', 20)->unique()->comment('Using Phone Number 628xxx');
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone', 20);
            $table->text('address')->nullable();
            $table->unsignedBigInteger('package_id')->nullable();
            $table->unsignedBigInteger('router_id')->nullable();
            $table->unsignedBigInteger('odp_id')->nullable();
            $table->string('status')->default('active'); // active, suspended, terminated
            $table->string('connection_type')->default('pppoe'); // pppoe, hotspot, static
            $table->string('username_ppp')->nullable();
            $table->string('password_ppp')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('mac_address')->nullable();
            $table->integer('billing_cycle')->default(1);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('customers');
    }
};
