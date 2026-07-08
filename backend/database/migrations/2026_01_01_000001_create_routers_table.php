<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up() {
        Schema::create('routers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('host');
            $table->string('port')->default('8728');
            $table->string('user');
            $table->string('password');
            $table->string('status')->default('online');
            $table->timestamps();
        });
    }
    public function down() { Schema::dropIfExists('routers'); }
};
