<?php

namespace iEducar\Packages\PreMatricula\Support;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class LocalizarEndereco
{
    /**
     * @return array{latitude: float, longitude: float, endereco: string}|null
     */
    public static function coordenada(string $endereco): ?array
    {
        $endereco = trim($endereco);

        if (mb_strlen($endereco) < 5) {
            return null;
        }

        $chave = 'pmd-endereco-' . sha1(mb_strtolower($endereco));
        $gravado = Cache::get($chave);

        if (is_array($gravado) && isset($gravado['latitude'], $gravado['longitude'])) {
            return [
                'latitude' => (float) $gravado['latitude'],
                'longitude' => (float) $gravado['longitude'],
                'endereco' => (string) ($gravado['endereco'] ?? ''),
            ];
        }

        try {
            $resposta = Http::timeout(5)
                ->withHeaders(['User-Agent' => 'i-Educar-pre-matricula (consulta interna de endereco)'])
                ->get('https://nominatim.openstreetmap.org/search', [
                    'q' => $endereco,
                    'format' => 'jsonv2',
                    'limit' => 1,
                    'countrycodes' => 'br',
                ]);
            $item = $resposta->json()[0] ?? null;
        } catch (\Throwable) {
            return null;
        }

        if (!is_array($item) || !is_numeric($item['lat'] ?? null) || !is_numeric($item['lon'] ?? null)) {
            return null;
        }

        $ponto = [
            'latitude' => (float) $item['lat'],
            'longitude' => (float) $item['lon'],
            'endereco' => (string) ($item['display_name'] ?? ''),
        ];
        Cache::put($chave, $ponto, now()->addDay());

        return $ponto;
    }
}
