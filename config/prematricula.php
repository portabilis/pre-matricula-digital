<?php

return [

    'active' => env('PMD_ACTIVE', true),

    'token' => env('PMD_TOKEN'),

    'allow_optional_address' => true,

    'show_how_to_do_video' => true,

    'video_intro_url' => null,

    'ibge_codes' => '',

    'city' => 'Içara',

    'state' => 'SC',

    'map' => [
        'lat' => -28.7,
        'lng' => -49.3,
        'zoom' => 13,
    ],

    'logo' => '/intranet/imagens/brasao-republica.png',

    'slogan' => 'Prefeitura Municipal de ',

    'standalone' => !env('PMD_LEGACY', true),

    'legacy' => true,

    'link_to_restrict_area' => null,

    'features' => [

        'allow_preregistration_data_update' => true,

        'allow_external_system_data_update' => true,

        'allow_transfer_registration' => false,

        'transfer_description' => 'Transferência Pré-matrícula Digital',

        'allow_vacancy_certificate' => false,

    ],

    'minha_vaga_na_creche' => [
        'url' => env('PMD_MINHA_VAGA_NA_CRECHE_URL'),
        'token' => env('PMD_MINHA_VAGA_NA_CRECHE_TOKEN'),
    ],

    'user' => env('PMD_USER', 1),

];
