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
    Schema::create('tasks', function (Blueprint $table) {
        $table->id();
        $table->foreignId('project_id')->constrained()->onDelete('cascade');
        $table->foreignId('milestone_id')->nullable()->constrained()->onDelete('cascade');
        $table->foreignId('assigned_to')->constrained('users')->onDelete('cascade');
        $table->string('task_name');
        $table->text('description')->nullable();
        $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
        $table->date('deadline')->nullable();
        $table->integer('progress_percent')->default(0);
        $table->enum('status', ['pending', 'in_progress', 'for_review', 'completed', 'delayed'])->default('pending');
        $table->text('manager_comment')->nullable();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
