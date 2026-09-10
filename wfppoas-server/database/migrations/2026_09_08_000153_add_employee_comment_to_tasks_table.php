<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Compatibility marker: the 2026_09_07_055527 migration owns this column.
        // Keep this filename because existing databases may have recorded it.
    }

    public function down(): void
    {
        // No schema change to undo. The original migration removes the column.
    }
};
