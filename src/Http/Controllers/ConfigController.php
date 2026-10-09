<?php

namespace iEducar\Packages\PreMatricula\Http\Controllers;

use iEducar\Packages\PreMatricula\Support\LocalizarEndereco;
use Illuminate\Http\Response;

/**
 * @codeCoverageIgnore
 */
class ConfigController
{
    /**
     * Return config JS.
     *
     * @return Response
     */
    public function config()
    {
        $mapa = $this->centroDoMapa();
        $config = [
            'city' => config('prematricula.city'),
            'state' => config('prematricula.state'),
            'ibge_codes' => config('prematricula.ibge_codes'),
            'map' => [
                'lat' => $mapa['lat'],
                'lng' => $mapa['lng'],
                'zoom' => intval(config('prematricula.map.zoom')),
            ],
            'token' => config('prematricula.token'),
            'logo' => config('prematricula.logo'),
            'slogan' => config('prematricula.slogan'),
            'allow_optional_address' => config('prematricula.allow_optional_address'),
            'show_how_to_do_video' => config('prematricula.show_how_to_do_video'),
            'video_intro_url' => $this->videoDeBoasVindas(),
            'link_to_restrict_area' => config('prematricula.link_to_restrict_area'),
            'features' => config('prematricula.features'),
        ];

        $config = json_encode($config);

        return new Response("window.config = {$config};", 200, [
            'content-type' => 'text/javascript',
        ]);
    }

    private function videoDeBoasVindas(): string
    {
        $url = config('prematricula.video_intro_url');

        if (is_string($url) && trim($url) !== '') {
            return trim($url);
        }

        return 'https://www.youtube.com/embed/ltXDgjS-XpA?html5=1';
    }

    /**
     * O pacote vinha centrado em Içara. Sem coordenada própria, o mapa abre
     * na cidade da instituição.
     *
     * @return array{lat: float, lng: float}
     */
    private function centroDoMapa(): array
    {
        $lat = floatval(config('prematricula.map.lat'));
        $lng = floatval(config('prematricula.map.lng'));
        $fabrica = abs($lat - (-28.7)) < 0.001 && abs($lng - (-49.3)) < 0.001;
        $cidade = trim((string) config('prematricula.city'));
        $estado = trim((string) config('prematricula.state'));

        if (!$fabrica || $cidade === '' || ($cidade === 'Içara' && $estado === 'SC')) {
            return ['lat' => $lat, 'lng' => $lng];
        }

        $ponto = LocalizarEndereco::coordenada($cidade . ', ' . $estado . ', Brasil');

        if ($ponto === null) {
            return ['lat' => $lat, 'lng' => $lng];
        }

        return [
            'lat' => $ponto['latitude'],
            'lng' => $ponto['longitude'],
        ];
    }
}
