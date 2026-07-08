<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up() {
        Schema::create('odps', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('location')->nullable();
            $table->integer('total_ports')->default(8);
            $table->integer('used_ports')->default(0);
            $table->timestamps();
        });
    }
    public function down() { Schema::dropIfExists('odps'); }
};
