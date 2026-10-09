<template>
  <div class="input-group">
    <input
      v-mask="mask"
      v-bind="$attrs"
      :autocomplete="unique"
      class="form-control"
      type="tel"
      @keydown.enter.prevent.stop="search"
    />
    <div class="input-group-append">
      <x-btn
        label="Buscar"
        color="primary"
        class="flex-row"
        style="border-top-left-radius: 0px; border-bottom-left-radius: 0px"
        no-caps
        no-wrap
        :loading="loading"
        loading-normal
        @click="search"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { PropType, computed, defineComponent, ref } from 'vue';
import { localizarEndereco } from '@/maps/localizarEndereco';
import { Nullable } from '@/types';
import XBtn from '@/components/elements/buttons/XBtn.vue';
import axios from 'axios';
import { mask } from 'vue-the-mask';
import { useGeneralStore } from '@/store/general';
export default defineComponent({
  components: {
    XBtn,
  },
  directives: {
    mask,
  },
  props: {
    unique: {
      type: String as PropType<string>,
      default: null,
    },
  },
  emits: ['change:address', 'notFound'],
  setup(props, { attrs, emit }) {
    const store = useGeneralStore();

    const mask = ref('#####-###');
    const loading = ref(false);

    const onlyNumbers = computed(() =>
      attrs.cep ? (attrs.cep as string).replace(/[^[0-9]]*/, '') : ''
    );
    const disabled = computed(() => onlyNumbers.value.length < 8);

    const search = async () => {
      loading.value = true;
      axios
        .get(`https://viacep.com.br/ws/${onlyNumbers.value}/json/`)
        .then((res) => {
          if (res.data.erro) {
            searchFromGoogle();
          } else {
            emit('change:address', res.data);
          }
        })
        .catch(() => {
          emit('notFound');
        })
        .finally(() => {
          loading.value = false;
        });
    };

    const searchFromGoogle = async () => {
      const ponto = await localizarEndereco(`${store.entity.city}, ${store.entity.state}`);
      const texto = ponto?.endereco || '';
      const city = texto.includes(store.entity.city);
      const state = texto.includes(store.entity.state);

      if (ponto && city && state) {
        emit('change:address', {
          logradouro: null,
          complemento: null,
          bairro: null,
          localidade: store.entity.city,
          uf: store.entity.state,
          ibge: null,
        });
        return;
      }

      emit('notFound');
    };

    return {
      mask,
      loading,
      search,
      onlyNumbers,
      disabled,
    };
  },
});
</script>
