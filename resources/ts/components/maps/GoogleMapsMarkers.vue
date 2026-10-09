<template>
  <div style="display: none">
    <google-maps-marker-component
      v-for="marker in markers"
      :key="marker.id"
      :map="map"
      :marker="marker"
      @click="$emit('click', $event)"
    >
      <slot name="default" :map="map" :marker="marker"></slot>
    </google-maps-marker-component>
  </div>
</template>

<script setup lang="ts">
import type { MapaLeaflet } from '@/maps/leaflet';
import { GoogleMapsMarker } from '@/types';
import GoogleMapsMarkerComponent from './GoogleMapsMarker.vue';

defineEmits<{
  (action: 'click', payload: GoogleMapsMarker): void;
}>();

defineProps<{
  map: MapaLeaflet;
  markers: GoogleMapsMarker[];
}>();
</script>
