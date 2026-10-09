import axios from 'axios';

export async function localizarEndereco(endereco: string): Promise<{
  lat: number;
  lng: number;
  endereco: string;
} | null> {
  try {
    const resposta = await axios.get('/pre-matricula-localizar', {
      params: { endereco },
    });
    const dados = resposta.data;

    if (!dados?.encontrado || dados.latitude == null || dados.longitude == null) {
      return null;
    }

    return {
      lat: Number(dados.latitude),
      lng: Number(dados.longitude),
      endereco: String(dados.endereco || ''),
    };
  } catch {
    return null;
  }
}
