<?php

namespace iEducar\Packages\PreMatricula\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class OpenPreRegistration
{
    public static function url(): ?string
    {
        if (!Schema::hasTable('process_stages')) {
            return null;
        }

        $open = DB::table('process_stages')
            ->where('start_at', '<', now())
            ->where('end_at', '>', now())
            ->exists();

        if (!$open) {
            return null;
        }

        return url('/pre-matricula-digital');
    }
}
