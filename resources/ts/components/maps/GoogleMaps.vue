<template>
  <div class="google-map">
    <div ref="elemento" class="google-map-container"></div>
    <template v-if="mapa">
      <slot name="default" :map="mapa"></slot>
    </template>
  </div>
</template>

<script setup lang="ts">
import { markRaw, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import type { MapaLeaflet } from '@/maps/leaflet';

const props = withDefaults(
  defineProps<{
    config?: Record<string, unknown>;
    lat: number;
    lng: number;
    zoom: number;
    pontos?: { lat: number; lng: number }[];
  }>(),
  {
    config: () => ({}),
    lat: 0,
    lng: 0,
    zoom: 13,
    pontos: () => [],
  }
);

const elemento = ref<HTMLElement>();
const mapa = shallowRef<MapaLeaflet>();

const iconesPadrao = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
};

const enquadrar = (pontos: { lat: number; lng: number }[]) => {
  const validos = pontos.filter((ponto) => ponto.lat != null && ponto.lng != null);
  if (!mapa.value || validos.length === 0) {
    return;
  }
  if (validos.length === 1) {
    mapa.value.setView([validos[0].lat, validos[0].lng], props.zoom || 13);
    return;
  }
  const latitudes = validos.map((ponto) => ponto.lat);
  const longitudes = validos.map((ponto) => ponto.lng);
  mapa.value.fitBounds(
    [
      [Math.min(...latitudes), Math.min(...longitudes)],
      [Math.max(...latitudes), Math.max(...longitudes)],
    ],
    { padding: [32, 32], maxZoom: 15 }
  );
};

onMounted(() => {
  if (!elemento.value) {
    return;
  }

  iconesPadrao();
  const instancia = L.map(elemento.value).setView(
    [props.lat || 0, props.lng || 0],
    props.zoom || 13
  );
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
  }).addTo(instancia);
  mapa.value = markRaw(instancia);
  enquadrar(props.pontos || []);
  setTimeout(() => instancia.invalidateSize(), 0);
});

watch(
  () => props.pontos,
  (pontos) => enquadrar(pontos || []),
  { deep: true }
);

watch(
  () => [props.lat, props.lng, props.zoom],
  () => {
    if (props.lat == null || props.lng == null) {
      return;
    }
    mapa.value?.setView([props.lat, props.lng], props.zoom || 13);
  }
);

onBeforeUnmount(() => {
  mapa.value?.remove();
});

defineExpose({ enquadrar });
</script>

<style scoped>
.google-map,
.google-map-container {
  min-height: 100%;
  width: 100%;
  height: 100%;
}
</style>
