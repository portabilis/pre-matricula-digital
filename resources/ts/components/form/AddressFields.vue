<template>
  <div class="row">
    <x-field
      ref="cityPostalCode"
      v-model="modelData.postalCode"
      rules="required|postal_code"
      container-class="form-group col-sm-6"
      label="CEP"
      :name="`${name}.postalCode`"
      type="CEP"
      :errors="checkError('postalCode')"
      @change:address="updateAddress"
    />
    <x-field
      v-model="modelData.address"
      rules="required"
      container-class="form-group col-sm-9"
      label="Endereço"
      :name="`${name}.address`"
      type="TEXT"
      :errors="checkError('address')"
      :disabled="!canEditAddress"
      @blur="updateLatLng"
    />
    <x-field
      ref="addressNumber"
      v-model="modelData.number"
      rules="required"
      container-class="form-group col-sm-3"
      label="Número"
      :name="`${name}.number`"
      type="TEXT"
      :errors="checkError('number')"
      :disabled="!canEditAddress"
      :loading="modelFetchingAddressLatLng"
      @blur="updateLatLng"
    />
    <x-field
      v-model="modelData.complement"
      container-class="form-group col-sm-6"
      label="Complemento"
      :name="`${name}.complement`"
      type="TEXT"
      :errors="checkError('complement')"
      :disabled="!canEditAddress"
    />
    <x-field
      v-model="modelData.neighborhood"
      rules="required"
      container-class="form-group col-sm-6"
      label="Bairro"
      :name="`${name}.neighborhood`"
      type="TEXT"
      :errors="checkError('neighborhood')"
      :disabled="!canEditAddress"
    />
  </div>
</template>

<script setup lang="ts">
import { Address } from '@/types';
import { computed, ref } from 'vue';
import { localizarEndereco } from '@/maps/localizarEndereco';
import XField from '@/components/x-form/XField.vue';
import { useGeneralStore } from '@/store/general';
import { useVModel } from '@vueuse/core';

defineEmits<{
  (action: 'update:fetchingAddressLatLng', payload: boolean): void;
  (action: 'update:fetchingPrimaryAddressLatLng', payload: boolean): void;
}>();

const props = withDefaults(
  defineProps<{
    data: Address;
    name: string;
    setFieldValue: (name: string, value: number | string) => void;
    errors: { [key: string]: boolean };
    fetchingAddressLatLng: boolean;
  }>(),
  {
    data: () => ({} as Address),
    name: '',
    errors: () => ({}),
    fetchingAddressLatLng: false,
  }
);

const store = useGeneralStore();

const cityPostalCode = ref();

const lastAddress = ref<string>();
const lastNumber = ref<string>();

const modelData = useVModel(props, 'data');
const modelFetchingAddressLatLng = useVModel(props, 'fetchingAddressLatLng');

const isCityPostalCode = () => {
  const codes = store.entity.ibgeCodes;
  if (codes.length === 0) {
    return true;
  }
  return (
    codes.includes(modelData.value.cityIbgeCode) ||
    modelData.value.city === window.config.city
  );
};

const canEditAddress = computed(
  () => modelData.value.city && isCityPostalCode()
);

const updateAddress = (data: {
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
}) => {
  modelData.value.address = data.logradouro;
  modelData.value.complement = data.complemento;
  modelData.value.neighborhood = data.bairro;
  modelData.value.city = data.localidade;
  modelData.value.stateAbbreviation = data.uf;
  modelData.value.cityIbgeCode = Number(data.ibge);
  props.setFieldValue(`${props.name}.city`, modelData.value.city);
  props.setFieldValue(
    `${props.name}.stateAbbreviation`,
    modelData.value.stateAbbreviation
  );
  props.setFieldValue(
    `${props.name}.cityIbgeCode`,
    modelData.value.cityIbgeCode
  );

  if (!ctx.isCityPostalCode() && cityPostalCode.value) {
    cityPostalCode.value.$refs.validator.setErrors([
      'O CEP deve ser do município',
    ]);
  } else {
    document.getElementsByName(`${props.name}.number`)[1].focus();
  }
};

const intervalLatLng = ref();

const updateLatLng = () => {
  clearInterval(intervalLatLng.value);

  if (
    modelData.value.address === lastAddress.value &&
    modelData.value.number === lastNumber.value
  ) {
    return;
  }

  intervalLatLng.value = setTimeout(async () => {
    if (modelFetchingAddressLatLng.value) {
      return;
    }

    if (!modelData.value.address || !modelData.value.number) {
      return;
    }

    modelFetchingAddressLatLng.value = true;
    const address = [
      modelData.value.address,
      modelData.value.number,
      modelData.value.city,
      modelData.value.stateAbbreviation,
      modelData.value.postalCode,
    ]
      .filter((i) => i)
      .join(', ');
    const ponto = await localizarEndereco(address);
    if (ponto) {
      modelData.value.lat = ponto.lat;
      modelData.value.lng = ponto.lng;
      props.setFieldValue(`${props.name}.lat`, ponto.lat);
      props.setFieldValue(`${props.name}.lng`, ponto.lng);
      lastAddress.value = modelData.value.address;
      lastNumber.value = modelData.value.number;
    }
    modelFetchingAddressLatLng.value = false;
  }, 1000);
};

const checkError = (name: string) => {
  return Boolean(
    props.errors[`${name}.postalCode` as keyof typeof props.errors]
  );
};

const ctx = {
  isCityPostalCode,
};
</script>
