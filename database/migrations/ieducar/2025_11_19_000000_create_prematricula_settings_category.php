<?php

use App\Setting;
use App\SettingCategory;
use Illuminate\Database\Migrations\Migration;

/**
 * Coloca as configurações do Pré-Matrícula Digital na categoria própria, usando o
 * formato de chave que a aplicação de fato lê (map.* e features.* aninhados).
 *
 * Instalações antigas gravaram chaves achatadas (prematricula.map_latitude,
 * prematricula.allow_*) que a aplicação nunca lê; aqui o valor delas é movido para
 * a chave aninhada e a antiga é removida. Valores existentes — inclusive o token de
 * cada tenant — não são sobrescritos. É idempotente.
 */
return new class extends Migration
{
    private array $renamedKeys = [
        'prematricula.map_latitude' => 'prematricula.map.lat',
        'prematricula.map_longitude' => 'prematricula.map.lng',
        'prematricula.map_zoom' => 'prematricula.map.zoom',
        'prematricula.allow_preregistration_data_update' => 'prematricula.features.allow_preregistration_data_update',
        'prematricula.allow_external_system_data_update' => 'prematricula.features.allow_external_system_data_update',
        'prematricula.allow_transfer_registration' => 'prematricula.features.allow_transfer_registration',
        'prematricula.allow_vacancy_certificate' => 'prematricula.features.allow_vacancy_certificate',
        'prematricula.transfer_description' => 'prematricula.features.transfer_description',
    ];

    private array $settings = [
        ['prematricula.city', 'Içara', 'string', 'Nome do município'],
        ['prematricula.state', 'SC', 'string', 'Sigla do estado (UF)'],
        ['prematricula.ibge_codes', '', 'string', 'Códigos IBGE separados por vírgula'],
        ['prematricula.logo', '/intranet/imagens/brasao-republica.png', 'string', 'Caminho do logo do município'],
        ['prematricula.slogan', 'Prefeitura Municipal de ', 'string', 'Slogan exibido no cabeçalho'],
        ['prematricula.allow_optional_address', '1', 'boolean', 'Permitir endereço opcional'],
        ['prematricula.show_how_to_do_video', '1', 'boolean', 'Exibir o vídeo de instruções'],
        ['prematricula.video_intro_url', null, 'string', 'URL do vídeo de introdução'],
        ['prematricula.link_to_restrict_area', null, 'string', 'Link para a área restrita'],
        ['prematricula.legacy', '1', 'boolean', 'Modo integrado ao i-Educar'],
        ['prematricula.map.lat', '-28.7', 'string', 'Latitude do centro do mapa'],
        ['prematricula.map.lng', '-49.3', 'string', 'Longitude do centro do mapa'],
        ['prematricula.map.zoom', '13', 'integer', 'Nível de zoom do mapa'],
        ['prematricula.features.allow_preregistration_data_update', '1', 'boolean', 'Permitir atualização dos dados da pré-matrícula'],
        ['prematricula.features.allow_external_system_data_update', '1', 'boolean', 'Permitir atualização dos dados no sistema externo'],
        ['prematricula.features.allow_transfer_registration', '0', 'boolean', 'Permitir transferência de matrícula'],
        ['prematricula.features.transfer_description', 'Transferência Pré-matrícula Digital', 'string', 'Descrição usada na transferência'],
        ['prematricula.features.allow_vacancy_certificate', '0', 'boolean', 'Permitir emissão de comprovante de vaga'],
    ];

    public function up(): void
    {
        $category = SettingCategory::firstOrCreate(['name' => 'Pré-Matrícula Digital']);

        foreach ($this->renamedKeys as $oldKey => $newKey) {
            $old = Setting::where('key', $oldKey)->first();

            if ($old === null) {
                continue;
            }

            if (!Setting::where('key', $newKey)->exists()) {
                Setting::create([
                    'key' => $newKey,
                    'value' => $old->value,
                    'type' => $old->type,
                    'description' => $old->description,
                    'setting_category_id' => $category->getKey(),
                ]);
            }

            $old->delete();
        }

        foreach ($this->settings as [$key, $value, $type, $description]) {
            $setting = Setting::firstOrNew(['key' => $key]);

            if (!$setting->exists) {
                $setting->value = $value;
                $setting->type = $type;
                $setting->description = $description;
            }

            $setting->setting_category_id = $category->getKey();
            $setting->save();
        }

        $token = Setting::firstOrNew(['key' => 'prematricula.token']);

        if (!$token->exists) {
            // Um token vazio casaria com um Bearer vazio e burlaria o guard de auth.
            $token->value = bin2hex(random_bytes(32));
            $token->type = 'string';
            $token->description = 'Token de acesso da API pública (gerado por tenant)';
        }

        $token->setting_category_id = $category->getKey();
        $token->save();

        Setting::where('key', 'like', 'prematricula.%')
            ->update(['setting_category_id' => $category->getKey()]);
    }

    public function down(): void
    {
    }
};
