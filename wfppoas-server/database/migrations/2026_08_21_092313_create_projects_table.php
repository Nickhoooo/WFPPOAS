<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
    Schema::create('projects', function (Blueprint $table) {
        $table->id();
        $table->string('project_name');
        $table->string('client_name');
        $table->text('description')->nullable();
        $table->decimal('budget', 12, 2)->nullable();
        $table->date('start_date')->nullable();
        $table->date('end_date')->nullable();
        $table->enum('status', ['ongoing', 'on-hold', 'completed'])->default('ongoing');
        $table->foreignId('manager_id')->constrained('users')->onDelete('cascade');
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
