<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up() {
        Schema::create('mikrotik_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('router_id');
            $table->string('action'); // sync, add_user, suspend, unsuspend
            $table->string('status'); // success, failed
            $table->text('message')->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();
        });
    }
    public function down() { Schema::dropIfExists('mikrotik_logs'); }
};
