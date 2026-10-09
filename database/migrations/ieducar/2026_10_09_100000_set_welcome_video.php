<?php

use App\Setting;
use App\SettingCategory;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $category = SettingCategory::firstOrCreate(['name' => 'Pré-Matrícula Digital']);
        $setting = Setting::firstOrNew(['key' => 'prematricula.video_intro_url']);

        if (!$setting->exists || $setting->value === null || trim((string) $setting->value) === '') {
            $setting->value = 'https://www.youtube.com/embed/ltXDgjS-XpA?html5=1';
            $setting->type = 'string';
            $setting->description = 'URL do vídeo de introdução';
            $setting->setting_category_id = $category->getKey();
            $setting->save();
        }
    }
};
