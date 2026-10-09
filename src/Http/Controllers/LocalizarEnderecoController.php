<?php

namespace iEducar\Packages\PreMatricula\Http\Controllers;

use iEducar\Packages\PreMatricula\Support\LocalizarEndereco;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class LocalizarEnderecoController extends Controller
{
    public function __invoke(Request $request)
    {
        $ponto = LocalizarEndereco::coordenada((string) $request->query('endereco', ''));

        if ($ponto === null) {
            return response()->json(['encontrado' => false], 404);
        }

        return response()->json($ponto + ['encontrado' => true]);
    }
}
