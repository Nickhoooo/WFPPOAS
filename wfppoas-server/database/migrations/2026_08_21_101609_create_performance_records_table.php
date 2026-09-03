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
    Schema::create('performance_records', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->foreignId('project_id')->nullable()->constrained()->onDelete('cascade');
        $table->decimal('completion_rate', 5, 2)->nullable();
        $table->integer('revision_count')->default(0);
        $table->decimal('on_time_rate', 5, 2)->nullable();
        $table->foreignId('evaluated_by')->constrained('users')->onDelete('cascade');
        $table->string('period')->nullable();
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('performance_records');
    }
};
