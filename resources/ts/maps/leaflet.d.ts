interface PontoLeaflet {
  lat: number;
  lng: number;
}

interface MapaLeaflet {
  setView(centro: [number, number], zoom?: number): MapaLeaflet;
  fitBounds(
    limites: [[number, number], [number, number]],
    opcoes?: { padding?: [number, number]; maxZoom?: number }
  ): void;
  invalidateSize(): void;
  remove(): void;
  on(evento: string, ouvinte: (evento: { latlng: PontoLeaflet }) => void): void;
}

interface MarcadorLeaflet {
  addTo(mapa: MapaLeaflet): MarcadorLeaflet;
  remove(): void;
  setLatLng(ponto: [number, number]): void;
  bindPopup(html: string): MarcadorLeaflet;
  on(evento: string, ouvinte: (evento: { latlng: PontoLeaflet }) => void): void;
}

interface LeafletGlobal {
  Icon: {
    Default: {
      prototype: { _getIconUrl?: unknown };
      mergeOptions(opcoes: Record<string, string>): void;
    };
  };
  map(elemento: HTMLElement): MapaLeaflet;
  tileLayer(
    url: string,
    opcoes: { attribution: string }
  ): { addTo(mapa: MapaLeaflet): void };
  marker(
    ponto: [number, number],
    opcoes?: { draggable?: boolean; icon?: unknown }
  ): MarcadorLeaflet;
  divIcon(opcoes: {
    className: string;
    html: string;
    iconSize: [number, number];
    iconAnchor?: [number, number];
  }): unknown;
}

declare global {
  const L: LeafletGlobal;
}

export type { MapaLeaflet, MarcadorLeaflet };
