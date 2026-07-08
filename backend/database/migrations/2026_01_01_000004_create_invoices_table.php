<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up() {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->unsignedBigInteger('customer_id');
            $table->decimal('amount', 15, 2);
            $table->string('status')->default('unpaid'); // unpaid, paid, canceled
            $table->date('due_date');
            $table->date('paid_date')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }
    public function down() { Schema::dropIfExists('invoices'); }
};
