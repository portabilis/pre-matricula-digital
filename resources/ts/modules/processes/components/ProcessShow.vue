<template>
  <main>
    <h1>Processos</h1>
    <skeleton-card-process-list v-if="!process" />
    <template v-else>
      <div class="d-flex flex-column flex-lg-row mt-5 mb-3">
        <div class="d-flex justify-content-between">
          <h4 v-tooltip.start-bottom="processName" class="text-truncate">
            {{ processName }}
          </h4>
        </div>
        <div class="d-flex flex-grow-1 justify-content-end align-items-center">
          <x-btn
            v-if="isAdmin"
            data-test="btn-delete"
            class="text-danger border-danger mr-2"
            label="Excluir"
            no-caps
            no-wrap
            @click="showConfirmDeleteProcess = true"
          />
          <x-btn
            data-test="btn-copy"
            color="primary"
            class="mr-2 border-primary"
            label="Copiar processo"
            no-caps
            no-wrap
            @click="showConfirmCopy"
          />
          <x-btn
            data-test="btn-edit"
            color="primary"
            outline
            label="Editar"
            no-caps
            no-wrap
            @click="
              router.push({
                name: 'process.update',
                params: { id: process.id },
              })
            "
          />
        </div>
      </div>
      <div class="d-flex justify-content-between mt-4 mb-3">
        <h4>Períodos</h4>
        <x-btn
          color="primary"
          outline
          label="Editar"
          no-caps
          no-wrap
          @click="editarPeriodos()"
        />
      </div>
      <div class="row">
        <x-card v-if="process.stages.length === 0" class="col-12" bordered>
          <x-card-section class="text-muted p-3">
            Nenhum etapa foi encontrada.
          </x-card-section>
        </x-card>
        <div
          v-for="stage in process.stages"
          :key="stage.id"
          class="col-12 col-md-6 mb-3"
          style="cursor: pointer"
          @click="editarPeriodos(stage.id)"
        >
          <x-card hoverable bordered>
            <x-card-section class="pb-0">
              <h5 class="text-h5">
                {{ stageTypeText(stage.type) }}
                <small
                  :class="stageStatusBadge(stage.status)"
                  class="badge pull-right"
                >
                  {{ stageStatusText(stage.status) }}
                </small>
              </h5>
            </x-card-section>
            <x-card-section class="pt-0 pb-0">
              <div class="mt-2 d-flex align-items-center text-size-15">
                <i class="fa fa-calendar text-primary mr-2"></i>
                <span class="text-gray-600">
                  {{ $filters.formatDateTime(stage.startAt) }} à
                  {{ $filters.formatDateTime(stage.endAt) }}
                </span>
              </div>
            </x-card-section>
            <x-card-section>
              <small
                v-for="period in process.periods"
                :key="period.id"
                :class="stageStatusBadge(stage.status)"
                class="badge mr-2 mb-2 mb-md-0"
              >
                {{ period.name }}
              </small>
            </x-card-section>
            <x-card-section class="pt-0 pb-0">
              <p v-if="stage.observation" class="text-muted mt-3">
                Observações e documentos a serem entregues pelos responsável:
              </p>
              <div
                class="text-break overflow-hiddden"
                v-html="stage.observation"
              ></div>
            </x-card-section>
            <x-card-section
              class="card-footer d-flex justify-content-center"
            >
              <x-btn
                v-if="(stage.totalWaitingPreRegistrations as number) > 0"
                data-test="btn-reject-in-batch"
                class="mr-2 border-rejected text-rejected"
                icon="pmd-rejected"
                label="Indeferir pré-matrículas"
                no-caps
                no-wrap
                @click.stop="showConfirmrejectInBatch(stage)"
              />
              <x-btn
                color="primary"
                outline
                label="Editar parâmetros"
                no-caps
                no-wrap
                @click.stop="editarPeriodos(stage.id)"
              />
            </x-card-section>
          </x-card>
        </div>
      </div>
      <div class="d-flex justify-content-between mt-5 mb-3">
        <h4>Formulários</h4>
        <div>
          <x-btn
            color="primary"
            outline
            label="Editar"
            no-caps
            no-wrap
            @click="
              router.push({
                name: 'process.fields',
                params: { id: process.id },
              })
            "
          />
        </div>
      </div>
      <div class="row">
        <div class="col-12 col-md-6">
          <p class="border-bottom pb-3">Responsável</p>
          <div class="row">
            <div
              v-if="responsibleFields?.length === 0"
              class="col-12 text-muted"
            >
              Nenhum campo foi adicionado ao formulário do responsável.
            </div>
          </div>
          <div class="row">
            <div
              v-for="field in responsibleFields"
              :key="field.id"
              :class="{
                'col-12 col-md-6': field.field.type !== 'ADDRESS',
                'col-12': field.field.type === 'ADDRESS',
              }"
              class="mb-3"
            >
              <label class="toggle-checkbox">
                <input type="checkbox" disabled :value="field.id" />
                <div
                  :class="{
                    'toggle-required': field.required,
                    'toggle-weight': field.weight !== 0,
                  }"
                  class="toggle-text"
                >
                  {{ field.field.name }}
                </div>
              </label>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <p class="border-bottom pb-3">Aluno</p>
          <div class="row">
            <div v-if="studentFields?.length === 0" class="col-12 text-muted">
              Nenhum campo foi adicionado ao formulário do(a) aluno(a).
            </div>
          </div>
          <div class="row">
            <div
              v-for="field in studentFields"
              :key="field.id"
              :class="{
                'col-12 col-md-6': field.field.type !== 'ADDRESS',
                'col-12': field.field.type === 'ADDRESS',
              }"
              class="mb-3"
            >
              <label class="toggle-checkbox">
                <input type="checkbox" disabled :value="field.id" />
                <div
                  :class="{
                    'toggle-required': field.required,
                    'toggle-weight': field.weight !== 0,
                  }"
                  class="toggle-text"
                >
                  {{ field.field.name }}
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div class="d-flex justify-content-between mt-5 mb-3">
        <h4>Critérios</h4>
        <div>
          <x-btn
            color="primary"
            outline
            label="Editar"
            no-caps
            no-wrap
            @click="
              $router.push({
                name: 'process.fields',
                params: { id: process.id },
              })
            "
          />
        </div>
      </div>
      <hr />
      <div class="row">
        <div v-if="priorityFields?.length === 0" class="col-12 text-muted">
          Nenhum critério de prioridade foi definido.
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          <div
            v-for="field in priorityFields"
            :key="field.id"
            class="line-custom mb-3"
          >
            <div class="d-flex justify-content-between">
              <div class="d-flex flex-grow-1 pr-3">
                {{ field.field.name }}
              </div>
              <div class="d-flex align-items-center">
                {{ field.weight }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <modal
      v-model="showConfirmDeleteProcess"
      title-class="text-primary"
      title="Excluir processo"
    >
      <template #body>
        <div class="row">
          <div class="col-12">
            <span>
              Para excluir, digite o nome do processo
              <strong>{{ process.name }}</strong
              >.
            </span>
            <x-field
              ref="processName"
              v-model="processNameToDelete"
              rules="required"
              container-class="form-group"
              label="NOME DO PROCESSO"
              name="process_name"
              type="TEXT"
              :errors="errorDeleteProcess"
            />
          </div>
        </div>
      </template>
      <template #footer>
        <div class="row">
          <div class="col-12">
            <x-btn
              :loading="loadingDeleteProcess"
              outline
              color="rejected"
              class="w-100"
              label="Excluir"
              no-caps
              no-wrap
              @click="deleteProcess"
            />
          </div>
        </div>
      </template>
    </modal>
    <modal
      v-model="showModalConfirmrejectInBatch"
      title="Indeferimento em lote"
      title-class="font-hind-18-primary text-primary text-uppercase"
    >
      <template #body>
        <div class="row">
          <div class="col-12">
            <div class="mb-4 text-danger font-weight-bold">
              Tem certeza que deseja indeferir
              {{ totalWaitingPreRegistrations }} pré-matrícula(s) em espera?
            </div>
          </div>
          <div class="col-12">
            <span>
              Usando esse recurso, todas as inscrições que se encontram nesta
              etapa serão indeferidas. Caso queira, você pode adicionar uma
              Justificativa para os indeferimentos no campo abaixo.
            </span>
          </div>
          <div class="col-12 mt-4">
            <label class="form-label" for="justification"
              >Justificativa (opcional)</label
            >
            <textarea
              id="justification"
              v-model="justification"
              class="form-control"
            ></textarea>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="row">
          <div class="col-6">
            <x-btn
              color="gray-500"
              outline
              class="w-100"
              label="Voltar"
              no-caps
              no-wrap
              @click="showModalConfirmrejectInBatch = false"
            />
          </div>
          <div class="col-6">
            <x-btn
              :loading="loadingrejectInBatch"
              class="w-100 border-primary"
              color="primary"
              label="Prosseguir"
              no-caps
              no-wrap
              @click="rejectInBatch"
            />
          </div>
        </div>
      </template>
    </modal>
  </main>
</template>

<script setup lang="ts">
import {
  AppContext,
  computed,
  getCurrentInstance,
  inject,
  onMounted,
  ref,
} from 'vue';
import {
  ProcessPostAction,
  ProcessRejectInBatchResponse,
  ProcessShow,
  Stage,
} from '@/modules/processes/types';
import { stageStatusBadge, stageStatusText, stageTypeText } from '@/util';
import {
  useLoader,
  useLoaderAndShowErrorByModal,
  useModal,
} from '@/composables';
import { useRoute, useRouter } from 'vue-router';
import { Filters } from '@/filters';
import Modal from '@/components/elements/Modal.vue';
import { Process as ProcessApi } from '@/modules/processes/api';
import SkeletonCardProcessList from '@/components/loaders/components/CardProcessList.vue';
import XBtn from '@/components/elements/buttons/XBtn.vue';
import XCard from '@/components/elements/cards/XCard.vue';
import XCardSection from '@/components/elements/cards/XCardSection.vue';
import XField from '@/components/x-form/XField.vue';
import { analytics } from '@/packages';
import { useGeneralStore } from '@/store/general';

const { dialog } = useModal();

const $filters = inject('$filters') as Filters;

const { page: pageview } = analytics();

const { loader, data: process } = useLoader<ProcessShow>();

const appContext = getCurrentInstance()?.appContext;

const { loader: loaderPostProcess, loading: loadingDeleteProcess } =
  useLoaderAndShowErrorByModal<ProcessPostAction>(
    appContext as AppContext,
    ref({
      title: 'Erro!',
      description:
        'Não foi possível remover o processo. Por favor, verifique se existem inscrições neste processo.',
    })
  );

const { loader: loaderPostCopy } =
  useLoaderAndShowErrorByModal<ProcessPostAction>(
    appContext as AppContext,
    ref({
      title: 'Erro',
      description:
        'Não foi possível copiar o processo. Por favor, entre em contato com o suporte.',
    })
  );

const { loader: loaderPostReject, loading: loadingrejectInBatch } =
  useLoaderAndShowErrorByModal<ProcessRejectInBatchResponse>(
    appContext as AppContext,
    ref({
      title: 'Erro!',
      description:
        'Não foi possível indeferir matriculas em lote. Por favor, entre em contato com o suporte.',
    })
  );

const store = useGeneralStore();

const router = useRouter();
const route = useRoute();

const showConfirmDeleteProcess = ref(false);
const stageToRejectInBatch = ref<Stage>();
const showModalConfirmrejectInBatch = ref(false);
const justification = ref<string>('');
const totalWaitingPreRegistrations = ref(0);
const processNameToDelete = ref<string>();
const errorDeleteProcess = ref(false);

const isAdmin = computed(() => store.isAdmin);

const responsibleFields = computed(() =>
  process.value?.fields.filter((f) => f.field.group === 'RESPONSIBLE')
);
const studentFields = computed(() =>
  process.value?.fields.filter((f) => f.field.group === 'STUDENT')
);
const priorityFields = computed(() =>
  process.value?.fields
    .filter((f) => f.weight !== 0)
    .sortBy('weight')
    .reverse()
);
const processName = computed(
  () => `${process.value?.name} (${process.value?.schoolYear.year})`
);

const deleteProcess = () => {
  if (
    `${process.value?.name}`.toUpperCase() !==
    processNameToDelete.value?.toUpperCase()
  ) {
    errorDeleteProcess.value = true;
    return;
  }
  errorDeleteProcess.value = false;
  loaderPostProcess(() =>
    ProcessApi.remove({
      id: process.value?.id,
    })
  )
    .then(() => {
      router.push({ name: 'processes' });
    })
    .finally(() => {
      showConfirmDeleteProcess.value = false;
    });
};

const showConfirmCopy = () => {
  dialog({
    title: `Deseja copiar o processo <b>${processName.value}</b>?`,
    titleClass: 'success',
    description: `
      <span>
        Utilize este recurso para facilitar a criação de processos em
        outros anos quando as configurações e regras de prioridade forem
        mantidas, copiando o processo de um ano para o outro.
      </span>
    `,
    onOk: copyProcess,
    confirm: true,
  });
};

const copyProcess = () => {
  loaderPostCopy(() =>
    ProcessApi.postCopy({
      id: process.value?.id,
    })
  ).then(({ process: processResponse }) => {
    router.push({
      name: 'process.update',
      params: { id: processResponse.id },
    });
  });
};

const editarPeriodos = (etapa?: string) => {
  router.push({
    name: 'process.periods',
    params: { id: process.value?.id },
    query: {
      de: 'consulta',
      ...(etapa ? { etapa } : {}),
    },
  });
};

const showConfirmrejectInBatch = (stage: Stage) => {
  stageToRejectInBatch.value = { ...stage };
  totalWaitingPreRegistrations.value = stageToRejectInBatch.value
    ?.totalWaitingPreRegistrations as number;
  showModalConfirmrejectInBatch.value = true;
};

const rejectInBatch = () => {
  loaderPostReject(() =>
    ProcessApi.postRejectInBatch({
      id: process.value?.id,
      stageId: stageToRejectInBatch.value?.id as string,
      justification: justification.value,
    })
  )
    .then((res) => {
      const total = res.rejectInBatch;
      justification.value = '';
      showModalConfirmrejectInBatch.value = false;
      dialog({
        title: `Sucesso!`,
        titleClass: 'success',
        description: `${total} pré-matricula(s) indeferida(s) com sucesso!`,
      });
    })
    .finally(() => {
      load();
    });
};

const load = () => {
  loader(() =>
    ProcessApi.getShow({
      id: route.params.id as string,
    })
  ).then((res) => {
    pageview({
      path: `/processos/consulta/${res.name}`,
    });
  });
};

onMounted(() => load());
</script>
