<template>
  <div style="display: none">
    <slot name="default"></slot>
  </div>
</template>

<script setup lang="ts">
import {
  ComponentInternalInstance,
  getCurrentInstance,
  nextTick,
  markRaw,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  watch,
} from 'vue';
import type { MapaLeaflet, MarcadorLeaflet } from '@/maps/leaflet';
import { GoogleMapsMarker, LatLng } from '@/types';

const emit = defineEmits<{
  (action: 'new-position', payload: LatLng): void;
  (action: 'click', payload: GoogleMapsMarker): void;
}>();

const props = defineProps<{
  map: MapaLeaflet;
  marker: GoogleMapsMarker;
  draggable?: boolean;
}>();

const vm = getCurrentInstance() as ComponentInternalInstance;
const interno = shallowRef<MarcadorLeaflet>();

const ponto = (marcador: GoogleMapsMarker): [number, number] | null => {
  const posicao = marcador.position as { lat?: number | (() => number); lng?: number | (() => number) } | null;
  const lat = typeof posicao?.lat === 'function' ? posicao.lat() : posicao?.lat ?? marcador.lat;
  const lng = typeof posicao?.lng === 'function' ? posicao.lng() : posicao?.lng ?? marcador.lng;

  if (lat == null || lng == null) {
    return null;
  }

  return [Number(lat), Number(lng)];
};

const desenhar = () => {
  const coordenadas = ponto(props.marker);
  if (!props.map || !coordenadas) {
    return;
  }

  if (interno.value) {
    interno.value.setLatLng(coordenadas);
    return;
  }

  const cor = props.draggable || props.marker.config ? '#009b4d' : '#0072ff';
  const icone = L.divIcon({
    className: '',
    html: `<span style="display:block;width:16px;height:16px;border-radius:50%;background:${cor};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45)"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  const marcador = markRaw(L.marker(coordenadas, {
    draggable: props.draggable,
    icon: icone,
  }).addTo(props.map));

  const html = vm.proxy?.$el?.innerHTML?.trim();
  if (html) {
    marcador.bindPopup(html);
  }

  marcador.on('click', () => {
    emit('click', props.marker);
  });

  if (props.draggable) {
    marcador.on('dragend', (evento) => {
      emit('new-position', {
        lat: evento.latlng.lat,
        lng: evento.latlng.lng,
      });
    });
    props.map.on('click', (evento) => {
      marcador.setLatLng([evento.latlng.lat, evento.latlng.lng]);
      emit('new-position', {
        lat: evento.latlng.lat,
        lng: evento.latlng.lng,
      });
    });
  }

  interno.value = marcador;
};

onMounted(async () => {
  await nextTick();
  desenhar();
});

watch(
  () => ponto(props.marker)?.join(','),
  () => desenhar()
);

onBeforeUnmount(() => {
  interno.value?.remove();
});

defineExpose({
  internalMarker: interno,
  marker: props.marker,
});
</script>
