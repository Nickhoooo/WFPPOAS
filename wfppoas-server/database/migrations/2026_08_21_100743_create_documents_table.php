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
    Schema::create('documents', function (Blueprint $table) {
        $table->id();
        $table->foreignId('task_id')->nullable()->constrained()->onDelete('cascade');
        $table->foreignId('project_id')->constrained()->onDelete('cascade');
        $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
        $table->string('file_path');
        $table->string('file_type')->nullable();
        $table->integer('version')->default(1);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
