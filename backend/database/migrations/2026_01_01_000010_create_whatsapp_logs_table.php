<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up() {
        Schema::create('whatsapp_logs', function (Blueprint $table) {
            $table->id();
            $table->string('phone_number');
            $table->text('message');
            $table->string('status'); // pending, sent, failed
            $table->string('provider')->nullable(); // evolution_api, waha, fonte
            $table->text('response')->nullable();
            $table->timestamps();
        });
    }
    public function down() { Schema::dropIfExists('whatsapp_logs'); }
};
