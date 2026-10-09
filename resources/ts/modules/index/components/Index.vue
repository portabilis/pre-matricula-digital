<template>
  <div>
    <div class="row mt-3">
      <header-entity-data />
    </div>
    <div class="row mt-3">
      <div class="col-12 col-md-10 offset-md-1">
        <protocol-consult title="Consulta de inscrição" />
      </div>
    </div>
    <skeleton-card-notices v-if="loadingNotices" />
    <div
      v-if="hasNotice && !loadingNotices"
      data-test="notice-block"
      class="row mt-4"
    >
      <div class="col-12 col-md-10 offset-md-1">
        <x-card bordered>
          <x-card-section class="pl-4 pr-4 pt-3 p-0">
            <h5 class="text-h5 text-primary">Avisos</h5>
          </x-card-section>
          <x-card-section class="pl-4 pr-4 pb-3 p-0">
            <div class="row">
              <div
                class="col-12 text-break overfflow-hidden"
                v-html="truncateText"
              ></div>
            </div>
            <div class="row">
              <div
                class="col-11 col-lg-2 font-hind offset-lg-10 pr-0 pr-md-4 text-right"
              >
                <router-link to="/avisos">Leia mais</router-link>
              </div>
            </div>
          </x-card-section>
        </x-card>
      </div>
    </div>
    <skeleton-card-processes v-if="loadingProcesses" />
    <div v-else class="row mt-3">
      <div class="container-sm col-12 col-md-10 offset-md-1 mt-4">
        <div class="row">
          <div class="col">
            <h2 class="title mb-3">Inscrições</h2>
          </div>
        </div>
        <div
          v-for="process in processes"
          :key="process.id"
          data-test="process-block"
        >
          <div class="row">
            <div class="col-12 mt-3 mt-sm-2 d-flex">
              <h4 class="m-0">
                {{ process.name }} ({{ process.schoolYear.year }})
              </h4>
              <router-link
                v-if="process.showWaitingList"
                :to="`/lista-de-espera/${process.id}`"
                class="ml-auto p-2 bg-primary rounded text-white"
              >
                Consultar lista de espera
              </router-link>
              <span
                v-else
                class="ml-auto p-2 bg-gray-300 text-gray-700 rounded"
              >
                Lista de espera não disponível
              </span>
            </div>
          </div>
          <process-stages :process="process" class="mb-3" />
        </div>
      </div>
    </div>
    <modal
      v-model="showVideoTutorial"
      data-test="modal-intro"
      title="Boas-vindas!"
      :large="true"
    >
      <template #body>
        <div class="row">
          <div class="col-12 col-lg-8 offset-lg-2 text-center">
            <span>
              Olá! Você sabe como realizar uma solicitação de matrícula? Caso
              ainda não saiba, assista o vídeo abaixo e veja como realizar a
              inscrição.
            </span>
          </div>
        </div>
        <div class="row mt-4">
          <div
            class="col-12 col-lg-8 offset-lg-2 embed-responsive embed-responsive-16by9"
          >
            <iframe
              class="embed-responsive-item"
              :src="getConfig.video_intro_url"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              title="Vídeo instrutivo"
            >
            </iframe>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="d-flex flex-md-row flex-column justify-content-center">
          <div
            class="d-flex align-items-center justify-content-center justify-content-lg-start"
          >
            <div class="custom-control custom-checkbox">
              <input
                id="showVideoTutorial"
                v-model="dontShowVideoTutorial"
                type="checkbox"
                class="custom-control-input"
              />
              <label
                for="showVideoTutorial"
                class="custom-control-label font-weight-bold"
              >
                Não mostrar mais esta mensagem
              </label>
            </div>
          </div>
          <div class="d-flex align-items-center ml-0 ml-lg-3 mt-3 mt-lg-0">
            <x-btn
              label="Entendi"
              class="w-100"
              color="primary"
              no-caps
              no-wrap
              @click="close"
            />
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>

<script lang="ts">
import { Processes, Stages, Vacancy } from '@/types';
import { Ref, computed, defineComponent, reactive, ref } from 'vue';
import { getCookie, setCookie } from '@/util';
import HeaderEntityData from '@/components/elements/HeaderEntityData.vue';
import Modal from '@/components/elements/Modal.vue';
import { Notice } from '@/modules/notice/types';
import { Notice as NoticeApi } from '@/modules/notice/api';
import { Process as ProcessApi } from '@/modules/processes/api';
import ProcessStages from '@/components/elements/ProcessStages.vue';
import ProtocolConsult from '@/components/elements/ProtocolConsult.vue';
import SkeletonCardNotices from '@/components/loaders/components/CardNotices.vue';
import SkeletonCardProcesses from '@/components/loaders/components/CardProcesses.vue';
import XBtn from '@/components/elements/buttons/XBtn.vue';
import XCard from '@/components/elements/cards/XCard.vue';
import XCardSection from '@/components/elements/cards/XCardSection.vue';
import clip from 'text-clipper';
import { useGeneralStore } from '@/store/general';
import { useLoader } from '@/composables';
export default defineComponent({
  components: {
    Modal,
    HeaderEntityData,
    ProtocolConsult,
    ProcessStages,
    SkeletonCardNotices,
    SkeletonCardProcesses,
    XBtn,
    XCard,
    XCardSection,
  },
  setup() {
    const vacancies: Vacancy[] = reactive([]);
    const showVideoTutorial: Ref<boolean> = ref(false);
    const dontShowVideoTutorial: Ref<boolean> = ref(false);
    const cookieName: Ref<string> = ref('SHOW_VIDEO_INTRO');

    const store = useGeneralStore();
    const {
      data: notice,
      loading: loadingNotices,
      loader: loadNotice,
    } = useLoader<Notice>();
    const {
      loading: loadingProcesses,
      loader: loadProcess,
      data: processes,
    } = useLoader<Processes[]>([]);

    const getProcesses = computed<Processes[]>(() => {
      const processesOpened: Processes[] = [];
      const processesNotOpened: Processes[] = [];
      processes.value.forEach((process: Processes) => {
        if (process.stages.some((stage: Stages) => stage.status === 'OPEN')) {
          processesOpened.push(process);
        } else {
          processesNotOpened.push(process);
        }
      });
      const processesOpenedWithDate = processesOpened.map((process) => {
        const { stages } = process;
        const internalProcess: Processes = { ...process };
        stages.sort((a: Stages, b: Stages) => {
          const aDate = new Date(a.startAt);
          const bDate = new Date(b.startAt);
          /**
           * Segundo este link, uma boa solução para subtrair valores diferentes de números, seria colocando o operador
           * "+" na frente das variáveis que desejamos calcular.
           *
           * https://stackoverflow.com/questions/14980014/how-can-i-calculate-the-time-between-2-dates-in-typescript
           */
          return +bDate - +aDate;
        });
        internalProcess.startAt = stages[0].startAt;
        return internalProcess;
      });
      const processesNotOpenedWithDate = processesNotOpened.map((process) => {
        const { stages } = process;
        const internalProcess = { ...process };
        stages.sort((a, b) => +new Date(b.startAt) - +new Date(a.startAt));
        internalProcess.startAt = stages[0].startAt;
        return internalProcess;
      });
      processesOpenedWithDate.sortBy('startAt').reverse();
      processesNotOpenedWithDate.sortBy('startAt').reverse();
      return processesOpenedWithDate.concat(processesNotOpenedWithDate);
    });
    const truncateText = computed(() =>
      notice.value.text
        ? clip(notice.value.text, 193, { html: true, maxLines: 4 })
        : ''
    );
    const hasNotice = computed(() => !!notice.value && !!notice.value.id);
    const getConfig = computed(() => store.getConfig);
    const showHowToDoVideo = computed(
      () => getConfig.value.show_how_to_do_video
    );
    function close() {
      if (dontShowVideoTutorial.value) {
        setCookie(cookieName.value, '1', 365);
      }
      showVideoTutorial.value = false;
    }
    async function getNotices() {
      loadNotice(NoticeApi.list);
    }
    async function getProceses() {
      loadProcess(ProcessApi.list).then((res) => {
        const allProcesses = res.filter((process) => process.stages.length);

        processes.value = allProcesses;
      });
    }
    function getData() {
      getNotices();
      getProceses();
    }
    getData();
    if (
      getCookie(cookieName.value) !== '1' &&
      showHowToDoVideo.value &&
      getConfig.value.video_intro_url
    ) {
      showVideoTutorial.value = true;
    }

    return {
      vacancies,
      loadingNotices,
      loadingProcesses,
      showVideoTutorial,
      dontShowVideoTutorial,
      cookieName,
      notice,
      processes: getProcesses,
      truncateText,
      hasNotice,
      close,
      getConfig,
      showHowToDoVideo,
    };
  },
});
</script>
