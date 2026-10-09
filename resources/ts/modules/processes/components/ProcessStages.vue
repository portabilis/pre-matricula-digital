<template>
  <main class="container" style="max-width: 740px">
    <h2 class="font-muli-20-primary">
      {{
        editando
          ? 'Editar períodos'
          : 'Crie o processo de pré-matrícula'
      }}
    </h2>
    <p v-if="editando">
      Ajuste os parâmetros de cada período: matrícula, rematrícula e lista de
      espera. O período aberto a partir do processo aparece primeiro.
    </p>
    <p v-else>
      Crie os períodos de pré-matrícula que deseja para o seu processo. Cada
      processo poderá conter mais de um período de pré-matrícula, sendo as
      opções: um período de rematrícula e/ou um de matrícula. Você também pode
      escolher as escolas que aparecerão disponíveis por distância.
    </p>
    <skeleton-page-process-stages v-if="loadingContent" class="mt-5" />
    <x-form
      v-if="!loadingContent"
      :schema="schema"
      :initial-values="{ stages }"
      :loading="loading"
      @submit="submit"
    >
      <template #default="{ errors, values }">
        <div
          v-for="(stage, i) in stages"
          :key="'process-stage-' + i"
          class="col-12 mt-5"
        >
          <hr v-if="i > 0" class="mb-5" />
          <div class="row">
            <div class="col-12">
              <div class="d-flex">
                <x-field
                  v-model="stages[i].type"
                  container-class="w-100 mr-4"
                  rules="required"
                  label="Tipo de período"
                  :name="`stages[${i}].type`"
                  type="SELECT"
                  :options="stageTypes"
                  :errors="!!errors[`stages[${i}].type`]"
                />
                <div class="d-flex align-items-center mt-3">
                  <x-btn
                    type="button"
                    class="border-danger text-danger"
                    no-caps
                    no-wrap
                    label="Remover"
                    @click="removeStage(i)"
                  />
                </div>
              </div>
            </div>
            <x-field
              v-model="stages[i].radius"
              container-class="col-12"
              rules="numeric"
              label="Opções de escola por raio <span style='font-size: 14px'>(?)</span>"
              :name="`stages[${i}].radius`"
              type="NUMBER"
              :errors="!!errors[`stages[${i}].radius`]"
            />
            <div class="mb-2">
              <x-field
                v-model="stages[i].restrictionType"
                container-class="col-12 form-group"
                label="Aceitar inscrições"
                sub-label="Permite apenas inscrições de alunos(as) que possuam uma matrícula ativa no ano anterior"
                :name="`stages[${i}].restrictionType`"
                type="RADIO"
                :errors="!!errors[`stages[${i}].restrictionType`]"
                :options="restrictionTypes"
              />
            </div>
            <x-field
              v-if="
                values.stages[i] && values.stages[i].type !== 'WAITING_LIST'
              "
              v-model="stages[i].allowWaitingList"
              container-class="col-12 form-group"
              label="Permitir selecionar uma escola para lista de espera"
              sub-label="Possibilita que no momento da pré-matrícula seja selecionada uma escola para lista de espera"
              :name="`stages[${i}].allowWaitingList`"
              type="CHECKBOX"
              :errors="!!errors[`stages[${i}].allowWaitingList`]"
            />
            <x-field
              v-model="stages[i].renewalAtSameSchool"
              container-class="col-12 form-group"
              label="Permitir se inscrever somente na escola atual do aluno"
              sub-label="Só possibilitará a inscrição caso exista vaga na escola atual do aluno"
              :name="`stages[${i}].renewalAtSameSchool`"
              type="CHECKBOX"
              :errors="!!errors[`stages[${i}].renewalAtSameSchool`]"
            />
            <x-field
              v-if="['REGISTRATION', 'WAITING_LIST'].includes(stages[i].type)"
              v-model="stages[i].allowSearch"
              container-class="col-12 form-group"
              label="Permitir buscar por cadastros do i-Educar"
              sub-label="Possibilitará buscar pelo aluno no i-Educar para reaproveitar os dados"
              :name="`stages[${i}].allowSearch`"
              type="CHECKBOX"
              :errors="!!errors[`stages[${i}].allowSearch`]"
            />
            <x-field
              v-model="stages[i].startAt"
              container-class="col-12 col-md-6"
              label="Data Inicial"
              :name="`stages[${i}].startAt`"
              type="DATE"
              rules="required|date"
              :errors="!!errors[`stages[${i}].startAt`]"
            />
            <x-field
              v-model="stages[i].startHourAt"
              container-class="col-12 col-md-6"
              label="Hora Inicial"
              :name="`stages[${i}].startHourAt`"
              type="TIME"
              rules="required|hour"
              :errors="!!errors[`stages[${i}].startHourAt`]"
            />
            <x-field
              v-model="stages[i].endAt"
              container-class="col-12 col-md-6"
              label="Data Final"
              :name="`stages[${i}].endAt`"
              type="DATE"
              rules="required|date"
              :errors="!!errors[`stages[${i}].endAt`]"
            />
            <x-field
              v-model="stages[i].endHourAt"
              container-class="col-12 col-md-6"
              label="Hora Final"
              :name="`stages[${i}].endHourAt`"
              type="TIME"
              rules="required|hour"
              :errors="!!errors[`stages[${i}].endHourAt`]"
            />
            <x-field
              v-model="stages[i].observation"
              container-class="col-12"
              label="Observações e lista de documentos a serem entregues na matrícula"
              :name="`stages[${i}].observation`"
              type="RICH_TEXT"
              :errors="!!errors[`stages[${i}].observation`]"
            />
          </div>
          <div
            v-show="
              values.stages[i] &&
              values.stages[i].type === 'REGISTRATION_RENEWAL'
            "
            class="row"
          >
            <div class="col-12">
              <p>
                O tipo de período 'Rematrícula' irá validar a compatibilidade de
                rematrícula, ou seja, validações de compatibilidade com os dados
                existentes no i-Educar permitindo a rematrícula somente de
                alunos que já estudam na rede.
              </p>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6 offset-md-3 mt-5">
          <div class="d-flex justify-content-center">
            <x-btn
              data-test="add-stage-btn"
              type="button"
              color="primary"
              class="w-100"
              no-caps
              no-wrap
              label="Adicionar outro período"
              @click="addStage"
            />
          </div>
        </div>
      </template>
    </x-form>
  </main>
</template>

<script lang="ts">
import {
  ProcessPostStage,
  ProcessStage,
  ProcessStageResponse,
} from '@/modules/processes/types';
import {
  PropType,
  computed,
  defineComponent,
  onMounted,
  ref,
  watch,
} from 'vue';
import { FormSchema } from '@/types';
import { GenericXForm } from '@/components/x-form/XForm.vue';
import { Process as ProcessApi } from '@/modules/processes/api';
import SkeletonPageProcessStages from '@/components/loaders/pages/PageProcessStages.vue';
import XBtn from '@/components/elements/buttons/XBtn.vue';
import XField from '@/components/x-form/XField.vue';
import { analytics } from '@/packages';
import { useGeneralStore } from '@/store/general';
import { useLoader } from '@/composables';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
  components: {
    SkeletonPageProcessStages,
    XBtn,
    XField,
    XForm: GenericXForm<ProcessStage[]>(),
  },
  props: {
    id: {
      type: String as PropType<string>,
      required: true,
    },
    newProcess: {
      type: String as PropType<'true' | 'false'>,
      default: 'false',
    },
  },
  setup(props) {
    const {
      loader,
      loading: loadingContent,
      data,
    } = useLoader<ProcessStageResponse>();

    const { loader: loaderPostStages, loading } = useLoader();

    const { page: pageview } = analytics();

    const router = useRouter();
    const route = useRoute();
    const editando = computed(() => route.query.de === 'consulta');

    const store = useGeneralStore();

    const stageTypes = computed(() => store.getStageTypes);

    const restrictionTypes = computed(() => store.getRestrictionTypes);

    const newStage = ref<ProcessStage>({
      id: null,
      type: 'REGISTRATION',
      radius: null,
      startAt: null,
      endAt: null,
      startHourAt: null,
      endHourAt: null,
      observation: null,
      renewalAtSameSchool: false,
      allowWaitingList: false,
      restrictionType: 'NONE',
      allowSearch: false,
    });
    const stages = ref<ProcessStage[]>([]);

    const submit = () => {
      const stagesToPost: ProcessPostStage[] = stages.value.map(
        (s) =>
          ({
            id: s.id,
            type: s.type,
            name: 'Test',
            radius: Number(s.radius),
            restrictionType: s.restrictionType,
            startAt: `${s.startAt} ${s.startHourAt}:00`,
            endAt: `${s.endAt} ${s.endHourAt}:00`,
            observation: s.observation,
            renewalAtSameSchool: [
              'REGISTRATION_RENEWAL',
              'WAITING_LIST',
            ].includes(s.type)
              ? s.renewalAtSameSchool
              : false,
            allowWaitingList:
              s.type === 'WAITING_LIST' ? false : s.allowWaitingList,
            allowSearch: s.allowSearch,
          } as unknown as ProcessPostStage)
      );

      loaderPostStages(() =>
        ProcessApi.postStages({
          id: props.id,
          stages: stagesToPost,
        })
      ).then(() => {
        if (editando.value) {
          router.push({
            name: 'process.show',
            params: { id: props.id },
          });
          return;
        }

        router.push({
          name: 'process.check',
          params: {
            id: props.id,
            newProcess: props.newProcess,
          },
        });
      });
    };

    const addStage = () => {
      stages.value.push({ ...newStage.value });
    };

    const removeStage = (index: number) => {
      stages.value.splice(index, 1);

      if (stages.value.length === 0) {
        addStage();
      }
    };

    const handleClickBack = () => {
      if (editando.value) {
        router.push({
          name: 'process.show',
          params: { id: props.id },
        });
        return;
      }

      router.push({
        name: 'process.fields',
        params: {
          id: props.id,
          newProcess: props.newProcess,
        },
      });
    };

    const getData = () => {
      loader(() =>
        ProcessApi.listStages({
          id: props.id,
        })
      ).then((res) => {
        const etapa = String(route.query.etapa || '');
        stages.value = [...res.stages].sort((a, b) => {
          if (!etapa) {
            return 0;
          }
          if (String(a.id) === etapa) {
            return -1;
          }
          if (String(b.id) === etapa) {
            return 1;
          }
          return 0;
        });

        if (props.newProcess === 'true') {
          pageview({
            path: '/processos/criar-novo/periodos',
          });
        } else {
          pageview({
            path: `/processos/${res.process.name
              .toLowerCase()
              .replaceAll(' ', '-')}/periodos`,
          });
        }
      });
    };

    const schema = ref<FormSchema>({
      fields: [],
      buttons: [
        {
          type: 'button',
          label: 'Voltar',
          class: 'btn btn-block btn-outline-light',
          containerClass: 'offset-md-3 col-md-3',
          action: handleClickBack,
          bind: {
            'data-test': 'button-back',
          },
        },
        {
          type: 'submit',
          label: route.query.de === 'consulta' ? 'Salvar' : 'Prosseguir',
          class: 'btn btn-block btn-primary',
          containerClass: 'col-md-3 mt-3 mt-md-0',
          block: true,
        },
      ],
      buttonsContainer: {
        class: 'row mt-5',
      },
    });

    watch(stages, (value) => {
      if (value.length === 0) {
        addStage();
      }
    });

    // Adiciona watcher para limpar allowSearch quando o tipo mudar
    watch(
      () => stages.value.map((stage) => stage.type),
      (newTypes, oldTypes) => {
        newTypes.forEach((type, index) => {
          if (
            oldTypes[index] !== type &&
            !['REGISTRATION', 'WAITING_LIST'].includes(type)
          ) {
            stages.value[index].allowSearch = false;
          }
        });
      }
    );

    getData();

    onMounted(() => {
      if (stages.value.length === 0) {
        addStage();
      }
    });

    return {
      data,
      stageTypes,
      restrictionTypes,
      submit,
      removeStage,
      schema,
      loadingContent,
      stages,
      loading,
      addStage,
      editando,
    };
  },
});
</script>
