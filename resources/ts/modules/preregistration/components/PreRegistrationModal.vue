<template>
  <modal-component
    v-model="open"
    title-class="font-hind-18-primary text-uppercase text-primary"
    :title="!preregistrationEmpty ? preregistration.student.student_name as string : ''"
    :icon-right="
      preRegistrationStatusClass(
        !preregistrationEmpty ? preregistration.status : ''
      )
    "
    :tooltip-icon="
      preRegistrationStatusText(
        !preregistrationEmpty ? preregistration.status : ''
      )
    "
    :initial-loading="preregistrationEmpty && !loadError"
    :large="true"
    loading-text
    :persistent="preregistrationEmpty"
    @close-modal="$router.push({ name: 'preregistrations' })"
  >
    <template #body>
      <div v-if="loadError" class="alert alert-danger m-4">
        {{ loadError }}
      </div>
      <div v-else class="m-auto" style="max-width: 740px">
        <div v-if="step === 'REJECT'" class="mt-4 text-danger font-weight-bold">
          Tem certeza que deseja indeferir a inscrição?
          <hr />
        </div>
        <div v-if="step === 'SYNC'" class="mt-4 font-weight-bold">
          Encontramos diferenças entre as informações fornecidas na inscrição e
          as já registradas no
          <span style="white-space: nowrap">i-Educar</span>. Por favor,
          selecione quais informações você gostaria de atualizar no i-Educar.
        </div>
        <div
          v-if="['ACCEPT', 'SHOW'].includes(step) && updatedInExternalSystem"
          class="mt-4 font-weight-bold"
        >
          <div class="alert alert-success">
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                width="21.5579"
                height="21.5579"
                rx="10.7789"
                fill="#CCFAB6"
              />
              <path
                d="M11 0C4.93457 0 0 4.93457 0 11C0 17.0654 4.93457 22 11 22C17.0654 22 22 17.0654 22 11C22 4.93457 17.0654 0 11 0ZM11 19.3171C6.41394 19.3171 2.68293 15.5861 2.68293 11C2.68293 6.41394 6.41394 2.68293 11 2.68293C15.5861 2.68293 19.3171 6.41394 19.3171 11C19.3171 15.5861 15.5861 19.3171 11 19.3171Z"
                fill="#298000"
              />
              <path
                d="M11 6.85883C12.4228 6.85883 13.6787 7.57642 14.4245 8.67059H13.0705V9.70589H16.1764V6.6H15.1411V7.89379C14.197 6.6371 12.6939 5.82353 11 5.82353C8.14107 5.82353 5.82349 8.14112 5.82349 11H6.85878C6.85878 8.71289 8.71285 6.85883 11 6.85883ZM15.1411 11C15.1411 13.2871 13.2871 15.1412 11 15.1412C9.57717 15.1412 8.32117 14.4236 7.57543 13.3294H8.92937V12.2941H5.82349V15.4H6.85878V14.1062C7.80287 15.3629 9.30603 16.1765 11 16.1765C13.8588 16.1765 16.1764 13.8589 16.1764 11H15.1411Z"
                fill="#298000"
              />
            </svg>
            <span class="ml-3">
              Informações de cadastro atualizadas no i-Educar!
            </span>
          </div>
        </div>
        <div v-if="step === 'ACCEPT'" class="mt-4 font-weight-bold">
          Selecione a turma que deseja matricular o(a) aluno(a) para completar o
          deferimento da pré-matrícula do(a) aluno(a).
          <hr />
        </div>
        <div v-if="preregistration.status === 'REJECTED'">
          <div class="mt-4 text-danger font-weight-bold">Indeferido</div>
          <div class="row mt-4">
            <dl class="col-6">
              <dt class="font-hind font-size-10">
                Justificativa do indeferimento
              </dt>
              <dd>
                {{ preregistration.observation }}
              </dd>
            </dl>
          </div>
          <hr />
        </div>
        <div
          v-if="
            preregistration.status === 'SUMMONED' && preregistration.observation
          "
        >
          <div class="mt-4 font-weight-bold" style="color: #1900b4">
            Em convocação
          </div>
          <div class="row mt-4">
            <dl class="col-12">
              <dt class="font-hind font-size-10">Observações</dt>
              <dd>
                {{ preregistration.observation }}
              </dd>
            </dl>
          </div>
          <hr />
        </div>
        <div v-if="preregistration.status === 'ACCEPTED'">
          <div class="mt-4 text-success font-weight-bold">Deferido</div>
          <div class="row mt-4">
            <dl class="col-6">
              <dt class="font-hind font-size-10">Escola</dt>
              <dd>
                {{ preregistration.school.name }}
              </dd>
            </dl>
            <dl v-if="preregistration.classroom" class="col-6">
              <dt class="font-hind font-size-10">Turma</dt>
              <dd>
                {{ preregistration.classroom.name }}
              </dd>
            </dl>
          </div>
          <hr />
        </div>
        <div
          v-if="step === 'SYNC'"
          class="row mt-5 mb-4 rounded"
          style="background: #f3f8ff"
        >
          <div class="col-12">
            <div class="d-flex">
              <div class="font-hind text-primary font-weight-bold col-4 p-3">
                Registro no i-Educar
              </div>
              <div
                class="font-hind text-primary font-weight-bold col-4 p-3 bg-white"
              >
                Informações fornecidas na inscrição
              </div>
              <div class="font-hind text-primary font-weight-bold col-4 p-3">
                Selecione os itens que deseja atualizar
              </div>
            </div>
            <div class="d-flex">
              <div class="font-hind font-weight-bold col-4 p-3 pt-0">
                Dados do(a) aluno(a)
              </div>
              <div class="font-hind font-weight-bold col-4 p-3 bg-white"></div>
              <div class="font-hind font-weight-bold col-4 p-3"></div>
            </div>

            <external-system-sync
              v-model="updateExternalPerson.name"
              :external="preregistration.external?.name"
              :internal="preregistration.student.student_name"
              always-show
              label="Nome"
              legend="Atualizar Nome"
            />
            <external-system-sync
              v-model="updateExternalPerson.dateOfBirth"
              :external="
                preregistration.external?.dateOfBirth
                  ? getFormattedDate(preregistration.external.dateOfBirth)
                  : ''
              "
              :internal="
                preregistration.student.student_date_of_birth
                  ? getFormattedDate(
                      preregistration.student.student_date_of_birth
                    )
                  : ''
              "
              always-show
              label="Data de nascimento"
              legend="Atualizar data de nascimento"
            />
            <external-system-sync
              v-model="updateExternalPerson.gender"
              :external="
                getGenderOrEmpty(String(preregistration.external?.gender))
              "
              :internal="
                getGenderOrEmpty(String(preregistration.student.student_gender))
              "
              :always-show="alwaysShow"
              label="Sexo/Gênero"
              legend="Atualizar sexo/gênero"
            />
            <external-system-sync
              v-model="updateExternalPerson.cpf"
              :external="preregistration.external?.cpf"
              :internal="preregistration.student.student_cpf"
              label="CPF"
              legend="Atualizar CPF"
            />
            <external-system-sync
              v-model="updateExternalPerson.rg"
              :external="preregistration.external?.rg"
              :internal="preregistration.student.student_rg"
              :always-show="alwaysShow"
              label="RG"
              legend="Atualizar RG"
            />
            <external-system-sync
              v-model="updateExternalPerson.birthCertificate"
              :external="preregistration.external?.birthCertificate"
              :internal="preregistration.student.student_birth_certificate"
              :always-show="alwaysShow"
              label="Certidão de nascimento"
              legend="Atualizar certidão de nascimento"
            />
            <external-system-sync
              v-model="updateExternalPerson.phone"
              :external="preregistration.external?.phone"
              :internal="
                preregistration.student.student_phone ||
                preregistration.responsible.responsible_phone
              "
              :always-show="alwaysShow"
              label="Telefone"
              legend="Atualizar telefone"
            />
            <external-system-sync
              v-model="updateExternalPerson.mobile"
              :external="preregistration.external?.mobile"
              :internal="
                preregistration.student.student_mobile ||
                preregistration.responsible.responsible_mobile
              "
              :always-show="alwaysShow"
              label="Celular"
              legend="Atualizar celular"
            />
            <external-system-sync
              v-model="updateExternalPerson.email"
              :external="preregistration.external?.email"
              :internal="
                preregistration.student.student_email ||
                preregistration.responsible.responsible_email
              "
              :always-show="alwaysShow"
              label="E-mail"
              legend="Atualizar e-mail"
            />
            <external-system-sync
              v-model="updateExternalPerson.address"
              :external="externalAddress"
              :internal="internalAddress"
              :always-show="alwaysShow"
              label="Endereço"
              legend="Atualizar endereço"
            />
          </div>
        </div>
        <div v-else class="row mt-4">
          <dl class="col-6">
            <dt class="font-hind font-size-10">Posição</dt>
            <dd>{{ preregistration.position }}º</dd>
          </dl>
          <dl class="col-6">
            <dt class="font-hind font-size-10">Tipo</dt>
            <dd>
              <span :class="badgeType(preregistration.type)" class="badge">
                {{ type(preregistration.type) }}
              </span>
            </dd>
          </dl>
          <dl class="col-6">
            <dt class="font-hind font-size-10">Série</dt>
            <dd>
              {{ preregistration.grade.name }}
            </dd>
          </dl>
          <dl class="col-6">
            <dt class="font-hind font-size-10">Turno</dt>
            <dd>
              {{ preregistration.period.name }}
            </dd>
          </dl>
          <dl class="col-12">
            <dt class="font-hind font-size-10">Fase escolar</dt>
            <dd>
              {{ preregistration.grade?.course?.name }}
            </dd>
          </dl>
          <dl class="col-12">
            <dt class="font-hind font-size-10">Escola</dt>
            <dd>
              {{ preregistration.school.name }}
            </dd>
          </dl>
          <dl class="col-6">
            <dt class="font-hind font-size-10">Data da solicitação</dt>
            <dd>
              {{ $filters.formatDateTime(preregistration.date) }}
            </dd>
          </dl>
          <dl v-if="preregistration.inClassroom" class="col-6">
            <dt class="font-hind font-size-10">Turma pré-selecionada</dt>
            <dd>
              {{ preregistration.inClassroom.name }}
            </dd>
          </dl>
        </div>
        <div v-if="step === 'SYNC'" class="row mb-5">
          <div class="col-12">
            <div class="custom-control custom-checkbox">
              <input
                id="always-show"
                v-model="alwaysShow"
                type="checkbox"
                class="custom-control-input"
              />
              <label
                for="always-show"
                class="custom-control-label font-size-10"
              >
                Exibir todas as informações
              </label>
            </div>
          </div>
        </div>
        <div v-if="step === 'SHOW'" class="row">
          <div v-if="preregistration.waiting" class="col-12 mb-3">
            <div class="alert badge-yellow">
              <strong> Este aluno também está em lista de espera: </strong>
              <div class="row mt-3">
                <dl class="col-2 mb-0">
                  <dt class="font-hind font-size-10">Protocolo</dt>
                  <dd>
                    <a
                      href="javascript:void(0)"
                      @click="go(preregistration.waiting.protocol)"
                    >
                      #{{ preregistration.waiting.protocol }}
                    </a>
                  </dd>
                </dl>
                <dl class="col-2 mb-0">
                  <dt class="font-hind font-size-10">Posição</dt>
                  <dd>{{ preregistration.waiting.position }}º</dd>
                </dl>
                <dl class="col-8 mb-0">
                  <dt class="font-hind font-size-10">Escola</dt>
                  <dd>
                    {{ preregistration.waiting.school.name }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div v-if="preregistration.parent" class="col-12 mb-3">
            <div class="alert badge-blue">
              <strong>
                Este(a) aluno(a) também possui uma outra solicitação de
                matrícula:
              </strong>
              <div class="row mt-3">
                <dl class="col-2 mb-0">
                  <dt class="font-hind font-size-10">Protocolo</dt>
                  <dd>
                    <a
                      href="javascript:void(0)"
                      @click="go(preregistration.parent.protocol)"
                    >
                      #{{ preregistration.parent.protocol }}
                    </a>
                  </dd>
                </dl>
                <dl class="col-2 mb-0">
                  <dt class="font-hind font-size-10">Posição</dt>
                  <dd>{{ preregistration.parent.position }}º</dd>
                </dl>
                <dl class="col-8 mb-0">
                  <dt class="font-hind font-size-10">Escola</dt>
                  <dd>
                    {{ preregistration.parent.school.name }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div v-if="preregistration.others.length > 0" class="col-12 mb-3">
            <div class="alert badge-blue">
              <strong>
                O CPF vínculado a este(a) aluno(a) também possui outras
                solicitações de matricula neste mesmo processo:
              </strong>
              <dl
                v-for="(pre, i) in preregistration.others"
                :key="i"
                class="row mt-3"
              >
                <dl class="col-2 mb-0">
                  <dt class="font-hind font-size-10">Protocolo</dt>
                  <dd>
                    <a href="javascript:void(0)" @click="go(pre.protocol)">
                      # {{ pre.protocol }}
                    </a>
                  </dd>
                </dl>
                <dl class="col-2 mb-0">
                  <dt class="font-hind font-size-10">Posição</dt>
                  <dd>{{ pre.position }}º</dd>
                </dl>
                <dl class="col-5 mb-0">
                  <dt class="font-hind font-size-10">Escola</dt>
                  <dd>
                    {{ pre.school.name }}
                  </dd>
                </dl>
                <dl class="col-2 mb-0">
                  <dt class="font-hind font-size-10">Situação</dt>
                  <dd>
                    <span class="badge" :class="stageStatusBadge(pre.status)">
                      {{ preRegistrationStatusText(pre.status) }}
                    </span>
                  </dd>
                </dl>
              </dl>
            </div>
          </div>
          <dl v-for="field in fields.student" :key="field.id" class="col-6">
            <dt class="font-hind font-size-10">
              {{ field.field.name }}
            </dt>
            <dd>
              {{ getFilteredField(field, 'STUDENT') }}
            </dd>
          </dl>
        </div>
        <template v-if="step === 'SHOW'">
          <h3 class="font-hind-18-primary mt-4">
            Dados do(a) responsável pelo(a) aluno(a)
          </h3>
          <hr />
          <div class="row">
            <dl class="col-6">
              <dt class="font-hind font-size-10">Relação com o(a) aluno(a)</dt>
              <dd>
                {{ relationType(preregistration.relationType) }}
              </dd>
            </dl>
          </div>
          <div class="row">
            <dl
              v-for="field in fields.responsible"
              :key="field.id"
              class="col-6"
            >
              <dt class="font-hind font-size-10">
                {{ field.field.name }}
              </dt>
              <dd>
                {{ getFilteredField(field, 'RESPONSIBLE') }}
              </dd>
            </dl>
          </div>
          <div
            v-for="(address, i) in preregistration.responsible
              .responsible_address"
            :key="i"
            class="row"
          >
            <dl class="col-6">
              <dt class="font-hind font-size-10">Endereço</dt>
              <dd>
                {{ address.address }}
              </dd>
            </dl>
            <dl class="col-6">
              <dt class="font-hind font-size-10">Número</dt>
              <dd>
                {{ address.number }}
              </dd>
            </dl>
            <dl v-if="address.complement" class="col-6">
              <dt class="font-hind font-size-10">Complemento</dt>
              <dd>
                {{ address.complement }}
              </dd>
            </dl>
            <dl class="col-6">
              <dt class="font-hind font-size-10">Bairro</dt>
              <dd>
                {{ address.neighborhood }}
              </dd>
            </dl>
            <dl class="col-6">
              <dt class="font-hind font-size-10">Cidade</dt>
              <dd>
                {{ address.city }}
              </dd>
            </dl>
            <dl class="col-6">
              <dt class="font-hind font-size-10">
                Foi alterado a localização manualmente?
              </dt>
              <dd>
                {{ address.manualChangeLocation ? 'Sim' : 'Não' }}
              </dd>
            </dl>
          </div>
          <div>
            <Timeline :items="timelineItems" />
          </div>
        </template>
        <div v-if="step === 'SUMMON'" class="form-group">
          <label class="form-label" for="summon-justification"
            >Observações (opcional)</label
          >
          <textarea
            id="summon-justification"
            v-model="justification"
            class="form-control"
            rows="3"
          ></textarea>
        </div>
        <div v-if="step === 'REJECT'" class="form-group">
          <label class="form-label" for="reject-justification"
            >Justificativa (opcional)</label
          >
          <textarea
            id="reject-justification"
            v-model="justification"
            class="form-control"
            rows="3"
          ></textarea>
        </div>
        <div v-if="step === 'ACCEPT'" class="mt-4 font-weight-bold">
          <div class="row">
            <x-field
              v-model="classroom"
              container-class="col-12"
              name="classroom"
              rules="required"
              label="Para qual turma deseja designar o aluno(a)?"
              type="SELECT"
              :errors="showError"
              :options="classrooms"
            />
          </div>
        </div>
        <div v-if="showError">
          <h2 class="text-danger">
            {{ errorTitle }}
          </h2>
          <span v-html="error"></span>
        </div>
      </div>
    </template>
    <template #footer>
      <div
        v-if="step === 'SYNC'"
        class="d-flex flex-column flex-lg-row justify-content-center"
      >
        <x-btn
          v-if="preregistration.status === 'ACCEPTED'"
          color="primary"
          outline
          class="ml-3 mr-3 mb-3 mb-lg-0"
          label="Voltar"
          no-wrap
          no-caps
          @click="step = 'SHOW'"
        />
        <x-btn
          :loading="loadingUpdateExternalSystem"
          color="primary"
          class="ml-3 mr-3 mb-3 mb-lg-0"
          label="Atualizar informações"
          no-wrap
          no-caps
          @click="updateExternalSystem"
        />
        <x-btn
          v-if="preregistration.status !== 'ACCEPTED'"
          :loading="loadingAccept"
          color="primary"
          outline
          class="ml-3 mr-3 mb-3 mb-lg-0"
          label="Continuar sem alterar informações"
          no-wrap
          no-caps
          loading-normal
          @click="accept"
        />
      </div>
      <div v-else class="d-flex flex-column flex-lg-row justify-content-center">
        <x-btn
          v-if="showSummonButton"
          :loading="loadingSummon"
          color="summon"
          outline
          class="ml-2 mr-2 mb-2 mb-lg-0"
          label="Convocar responsáveis"
          icon="pmd-summon"
          no-wrap
          no-caps
          loading-normal
          @click="summon"
        />
        <x-btn
          v-if="showRejectButton"
          :loading="loadingReject"
          color="rejected"
          outline
          class="ml-2 mr-2 mb-2 mb-lg-0"
          label="Indeferir"
          icon="pmd-rejected"
          no-wrap
          no-caps
          loading-normal
          @click="reject"
        />
        <x-btn
          v-if="showReturnToWaitButton"
          :loading="loadingReturnToWait"
          color="to-wait"
          outline
          class="ml-2 mr-2 mb-2 mb-lg-0"
          label="Voltar para em espera"
          icon="pmd-to-wait"
          no-wrap
          no-caps
          loading-normal
          @click="returnToWait"
        />
        <div class="position-relative ml-2 mr-2 mb-2 mb-lg-0" @click.stop>
          <x-btn
            ref="dropdownBtnRef"
            color="primary"
            outline
            label="Outras opções"
            :icon="undefined"
            icon-right="mdi-chevron-down"
            no-wrap
            no-caps
            class="w-100"
            style="min-width: unset"
            @click="toggleDropdown"
          />
          <div
            v-show="showDropdown"
            :style="dropdownStyle"
            class="bg-white border-radius-normal p-2 shadow-2 position-fixed"
            style="min-width: 160px; max-width: 200px; z-index: 9999"
          >
            <div
              v-if="store.features.allowPreregistrationDataUpdate"
              class="dropdown-menu-item"
              @click="handleDropdownAction(edit)"
            >
              Editar inscrição
            </div>
            <div
              v-if="showUpdateDateButton"
              class="dropdown-menu-item"
              @click="handleDropdownAction(syncExternalSystem)"
            >
              Atualizar dados
            </div>
            <div
              v-if="
                store.features.allowVacancyCertificate &&
                ['ACCEPTED', 'SUMMONED'].includes(preregistration.status)
              "
              class="dropdown-menu-item"
              @click="handleDropdownAction(emitVacancyCertificate)"
            >
              Emitir Atestado
            </div>
          </div>
        </div>
        <x-btn
          v-if="showAcceptButton"
          :loading="loadingAccept"
          color="accepted"
          outline
          class="ml-2 mr-2 mb-2 mb-lg-0"
          label="Deferir"
          icon="pmd-accepted"
          no-wrap
          no-caps
          loading-normal
          @click="accept"
        />
      </div>
    </template>
  </modal-component>
</template>

<script setup lang="ts">
import { ErrorResponse, Option } from '@/types';
import {
  Fields,
  ParseFieldFromProcess,
  PreRegistration,
  PreRegistrationFilter,
  PreRegistrationResponsible,
  PreRegistrationStudent,
} from '@/modules/preregistration/types';
import {
  Preregistration as PreregistrationApi,
  PreregistrationRest,
} from '@/modules/preregistration/api';
import {
  computed,
  getCurrentInstance,
  inject,
  nextTick,
  onMounted,
  ref,
  watch,
} from 'vue';
import {
  getGenderOrEmpty,
  parseResponsibleFieldsFromProcess,
  parseStudentFieldsFromProcess,
  preRegistrationStatusClass,
  preRegistrationStatusText,
  stageStatusBadge,
} from '@/util';
import {
  useLoader,
  useLoaderAndShowErrorByModal,
  useLoaderAndThrowError,
} from '@/composables';
import { useRoute, useRouter } from 'vue-router';
import ExternalSystemSync from '@/modules/preregistration/components/ExternalSystemSync.vue';
import { Filters } from '@/filters';
import ModalComponent from '@/components/elements/Modal.vue';
import Timeline from '@/modules/preregistration/components/Timeline.vue';
import XBtn from '@/components/elements/buttons/XBtn.vue';
import XField from '@/components/x-form/XField.vue';
import fileDownload from 'js-file-download';
import { getFormattedDate } from '@/datetime';
import { listTimeline } from '@/modules/preregistration/api/services/graphql/preregistration';
import { useGeneralStore } from '@/store/general';

const $filters = inject('$filters') as Filters;

const { loader: loaderAccept, loading: loadingAccept } = useLoaderAndThrowError<
  ErrorResponse[] | undefined
>();

const { loader: loaderReject, loading: loadingReject } = useLoader();

const { loader: loaderReturnToWait, loading: loadingReturnToWait } =
  useLoader();

const { loader: loaderClassroomsByPreregistration, data: classrooms } =
  useLoader<Option[]>([]);

const { loader: loaderByProtocol, data: preregistration } =
  useLoader<PreRegistration>({} as PreRegistration);

const { loader: loaderSummon, loading: loadingSummon } = useLoaderAndThrowError<
  ErrorResponse[] | undefined
>();

const {
  loader: loaderUpdateExternalSystem,
  loading: loadingUpdateExternalSystem,
} = useLoaderAndThrowError();

const appContext = getCurrentInstance()?.appContext;
const { loader: loaderToReport } = useLoaderAndShowErrorByModal<Blob>(
  appContext as AppContext,
  ref({
    title: 'Atenção!',
    description: 'Não foi possível emitir o relatório. Tente novamente.',
  })
);

const store = useGeneralStore();
const route = useRoute();
const router = useRouter();

const fields = ref<Fields>({
  responsible: [],
  student: [],
});
const responsible = ref<PreRegistrationResponsible>(
  {} as PreRegistrationResponsible
);
const student = ref<PreRegistrationStudent>({} as PreRegistrationStudent);
const step = ref('SHOW');
const justification = ref<string>('');
const classroom = ref<number>();
const showError = ref(false);
const errorTitle = ref();
const error = ref();
const open = ref(true);
const alwaysShow = ref(false);
const updatedInExternalSystem = ref(false);
const updateExternalPerson = ref({
  cpf: false,
  rg: false,
  birthCertificate: false,
  name: false,
  dateOfBirth: false,
  gender: false,
  phone: false,
  mobile: false,
  email: false,
  address: false,
});
const showDropdown = ref(false);
const dropdownStyle = ref('');
const dropdownBtnRef = ref();

const isAdmin = computed(() => store.isAdmin);
const isCoordinator = computed(() => store.isCoordinator);
const isSecretary = computed(() => store.isSecretary);
const hasDataToUpdateInExternalSystem = computed<boolean>(() => {
  const external = preregistration.value.external;
  const student = preregistration.value.student;
  const responsible = preregistration.value.responsible;

  if (!external) {
    return false;
  }

  if (external?.cpf !== student.student_cpf && !!student.student_cpf) {
    return true;
  }

  if (external?.rg !== student.student_rg && !!student.student_rg) {
    return true;
  }

  if (
    external?.birthCertificate !== student.student_birth_certificate &&
    !!student.student_birth_certificate
  ) {
    return true;
  }

  if (external?.gender !== student.student_gender && !!student.student_gender) {
    return true;
  }

  if (external?.phone !== student.student_phone && !!student.student_phone) {
    return true;
  }

  if (
    external?.phone !== responsible.responsible_phone &&
    !!responsible.responsible_phone
  ) {
    return true;
  }

  if (external?.mobile !== student.student_mobile && !!student.student_mobile) {
    return true;
  }

  if (
    external?.mobile !== responsible.responsible_mobile &&
    !!responsible.responsible_mobile
  ) {
    return true;
  }

  if (external?.email !== student.student_email && !!student.student_email) {
    return true;
  }

  if (
    external?.email !== responsible.responsible_email &&
    !!responsible.responsible_email
  ) {
    return true;
  }

  if (external?.name !== student.student_name && !!student.student_name) {
    return true;
  }

  if (
    external?.dateOfBirth !== student.student_date_of_birth &&
    !!student.student_date_of_birth
  ) {
    return true;
  }

  return false;
});

const internalAddress = computed(() => {
  let place = preregistration.value.responsible.responsible_address[0];
  let result = `${place.address}, ${place.number}`;

  if (place.complement) {
    result = `${result}, ${place.complement}`;
  }

  result = `${result}, ${place.neighborhood}, ${place.postalCode}`;

  return result;
});

const externalAddress = computed(() => {
  if (!preregistration.value.external?.address) {
    return;
  }

  let result = `${preregistration.value.external?.address}, ${preregistration.value.external?.number}`;

  if (preregistration.value.external?.complement) {
    result = `${result}, ${preregistration.value.external?.complement}`;
  }

  result = `${result}, ${preregistration.value.external?.neighborhood}, ${preregistration.value.external?.postalCode}`;

  return result;
});

const preregistrationEmpty = computed(
  () => Object.keys(preregistration.value).length === 0
);

const showAcceptButton = computed(() => {
  return (
    (step.value === 'SHOW' || step.value === 'ACCEPT') &&
    preregistration.value.status !== 'ACCEPTED'
  );
});

const showReturnToWaitButton = computed(() => {
  return (
    (isAdmin.value || isCoordinator.value || isSecretary.value) &&
    preregistration.value.status !== 'WAITING' &&
    step.value === 'SHOW'
  );
});

const showRejectButton = computed(() => {
  return (
    (step.value === 'SHOW' || step.value === 'REJECT') &&
    (preregistration.value.status === 'WAITING' ||
      preregistration.value.status === 'SUMMONED')
  );
});

const showSummonButton = computed(() => {
  return (
    (step.value === 'SHOW' || step.value === 'SUMMON') &&
    preregistration.value.status === 'WAITING'
  );
});

const showUpdateDateButton = computed(() => {
  return (
    hasDataToUpdateInExternalSystem.value &&
    ['WAITING', 'ACCEPTED'].includes(preregistration.value.status) &&
    store.features.allowExternalSystemDataUpdate
  );
});

const getFilteredField = (
  field: ParseFieldFromProcess,
  type: 'STUDENT' | 'RESPONSIBLE'
) => {
  if (type === 'STUDENT') {
    return field.filter(
      student.value[field.key as keyof typeof student.value] as string
    );
  }

  return field.filter(
    responsible.value[field.key as keyof typeof responsible.value] as string
  );
};

const updateExternalSystem = () => {
  showError.value = false;

  loaderUpdateExternalSystem(() =>
    PreregistrationApi.updateStudentInExternalSystem({
      preregistration: preregistration.value.id,
      ...updateExternalPerson.value,
    })
  )
    .then((success) => {
      if (!success) {
        showError.value = true;
        errorTitle.value = 'Erro';
        error.value = 'Não foi possível atualizar as informações no i-Educar';
        return;
      }

      updatedInExternalSystem.value = true;

      if (preregistration.value.status === 'ACCEPTED') {
        step.value = 'SHOW';
      } else {
        accept();
      }
    })
    .catch((err) => {
      showError.value = true;
      errorTitle.value = err.response.data.errors[0].message;
      error.value = err.response.data.errors[0].extensions?.message;
      return;
    });
};

const accept = () => {
  showError.value = false;
  if (step.value === 'SHOW' && hasDataToUpdateInExternalSystem.value) {
    step.value = 'SYNC';
  } else if (['SYNC', 'SHOW'].includes(step.value)) {
    step.value = 'ACCEPT';
    getClassroomsByPreregistration();
  } else if (step.value === 'ACCEPT') {
    if (!Number(classroom.value)) {
      showError.value = true;
      errorTitle.value =
        'É necessário selecionar uma turma para realizar o Deferimento da pré-matrícula.';
      error.value = '';
      return;
    }

    loaderAccept(() =>
      PreregistrationApi.postAccept({
        ids: [preregistration.value.id].map((id) => Number(id)),
        classroom: Number(classroom.value),
      })
    )
      .then(() => {
        router.push({
          name: 'preregistrations',
        });
      })
      .catch((err) => {
        showError.value = true;
        errorTitle.value = err.response.data.errors[0].message;
        error.value = err.response.data.errors[0].extensions?.message;
        return;
      });
  }
};

const reject = () => {
  if (step.value === 'SHOW') {
    justification.value = '';
    step.value = 'REJECT';
  } else if (step.value === 'REJECT') {
    loaderReject(() =>
      PreregistrationApi.postReject({
        ids: [preregistration.value.id],
        justification: justification.value,
      })
    ).then(() => {
      router.push({
        name: 'preregistrations',
      });
    });
  }
};

const returnToWait = () => {
  loaderReturnToWait(() =>
    PreregistrationApi.postReturnToWait({
      ids: [preregistration.value.id],
    })
  ).then(() => {
    router.push({
      name: 'preregistrations',
    });
  });
};

const syncExternalSystem = () => {
  step.value = 'SYNC';
};

const getClassroomsByPreregistration = () => {
  loaderClassroomsByPreregistration(() =>
    PreregistrationApi.getClassroomsByPreregistration({
      period: preregistration.value.period.id,
      school: preregistration.value.school.id,
      grade: preregistration.value.grade.id,
      year: preregistration.value.process.schoolYear.year,
    })
  );
};

const go = (protocol: string) => {
  router.push({
    name: 'preregistration.modal',
    params: {
      protocol,
    },
  });
};

const edit = () => {
  router.push({
    name: 'preregistration.edit.modal',
    params: {
      protocol: route.params.protocol as string,
    },
  });
};

const type = (type: string) => {
  switch (type) {
    case 'REGISTRATION':
      return 'Matrícula';
    case 'REGISTRATION_RENEWAL':
      return 'Rematrícula';
    case 'WAITING_LIST':
    default:
      return 'Lista de espera';
  }
};

const badgeType = (type: string) => {
  switch (type) {
    case 'REGISTRATION':
      return 'badge-blue';
    case 'REGISTRATION_RENEWAL':
      return 'badge-cyan';
    case 'WAITING_LIST':
    default:
      return 'badge-yellow';
  }
};

const relationType = (type: string) => {
  return store.relationTypes.find((r) => r.key === type)?.label;
};

const loadError = ref('');

const load = (protocol: string) => {
  if (!protocol) return;

  loadError.value = '';
  preregistration.value = {} as PreRegistration;

  loaderByProtocol(() =>
    PreregistrationApi.listByProtocol({
      protocol,
    })
  ).then((res) => {
    if (!res?.id) {
      loadError.value = 'Inscrição não encontrada.';
      return;
    }

    const processo = {
      ...(res.process || {}),
      fields: (res.process?.fields || []).filter((field) => field?.field),
    };
    const { fields: responsibleFields, data: responsibleData } =
      parseResponsibleFieldsFromProcess(processo);

    const { fields: studentFields, data: studentData } =
      parseStudentFieldsFromProcess(processo);

    (res.fields || [])
      .filter((f) => f.field?.group === 'RESPONSIBLE')
      .forEach((f) => {
        const key =
          `field_${f.field.id}` as unknown as keyof typeof responsibleData;

        responsibleData[key] =
          f.value as unknown as keyof (typeof responsibleData)[keyof typeof responsibleData];
      });

    (res.fields || [])
      .filter((f) => f.field?.group === 'STUDENT')
      .forEach((f) => {
        const key =
          `field_${f.field.id}` as unknown as keyof typeof studentData;

        studentData[key] =
          f.value as unknown as keyof (typeof studentData)[keyof typeof studentData];
      });

    fields.value.responsible = responsibleFields.sortBy('order');
    responsible.value = {
      ...responsibleData,
      ...res.responsible,
      responsible_place_of_birth:
        res.responsible.responsible_city_of_birth ||
        res.responsible.responsible_place_of_birth,
    };

    fields.value.student = studentFields.sortBy('order');
    student.value = {
      ...studentData,
      ...res.student,
      student_place_of_birth:
        res.student?.student_city_of_birth || res.student?.student_place_of_birth,
    };
  }).catch(() => {
    loadError.value = 'Não foi possível abrir esta inscrição.';
  });
};

const summon = () => {
  if (step.value === 'SHOW') {
    justification.value = '';
    step.value = 'SUMMON';
  } else {
    loaderSummon(() =>
      PreregistrationApi.postSummon({
        ids: [preregistration.value.id],
        justification: justification.value,
      })
    )
      .then(() => {
        router.push({
          name: 'preregistrations',
        });
      })
      .catch((err) => {
        showError.value = true;
        errorTitle.value =
          'Não foi possível realizar a convocação de todos os(as) responsáveis(as)';
        error.value = err.response.data.errors
          .map((e: ErrorResponse) => e.extensions?.message)
          .join('<br>');
      });
  }
};

const reactiveRoute = computed(() => route);

watch(
  reactiveRoute,
  (val) => {
    load(val.params.protocol as string);
  },
  {
    deep: true,
  }
);

watch(open, (val) => {
  if (!val) {
    router.push({ name: 'preregistrations' });
  }
});

const toggleDropdown = async () => {
  showDropdown.value = !showDropdown.value;
  if (showDropdown.value) {
    await nextTick();
    const btn = dropdownBtnRef.value?.$el || dropdownBtnRef.value;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const right = window.innerWidth - (rect.left + rect.width);
      const top = rect.top - 4; // 4px de espaçamento
      dropdownStyle.value = `bottom: ${
        window.innerHeight - top
      }px; left: auto; right: ${right}px; min-width: 150px; max-width: 200px;`;
    }
  }
};

const handleDropdownAction = (fn: () => void) => {
  showDropdown.value = false;
  fn();
};

const timelineItems = ref([]);

watch(
  () => preregistration.value.id,
  async (id) => {
    if (id) {
      try {
        const response = await listTimeline(
          String(id),
          'iEducar\\Packages\\PreMatricula\\Models\\PreRegistration'
        );
        const timelines = response.listTimeline.map((timeline) => ({
          ...timeline,
          payload:
            typeof timeline.payload === 'string'
              ? JSON.parse(timeline.payload)
              : timeline.payload,
        }));
        timelineItems.value = timelines;
      } catch (e) {
        timelineItems.value = [];
      }
    }
  },
  { immediate: true }
);

const emitVacancyCertificate = () => {
  const filters: PreRegistrationFilter = {
    template: '5', //Template VACANCY_CERTIFICATE
    protocol: preregistration.value.protocol,
  };

  loaderToReport(() =>
    PreregistrationRest.toPreRegistrationReport(filters)
  ).then((res) => {
    fileDownload(res, 'atestado-vaga.pdf');
  });
};

onMounted(() => {
  load(reactiveRoute.value.params.protocol as string);
  document.addEventListener('click', () => {
    showDropdown.value = false;
  });
  setTimeout(() => {
    const modal = document.querySelector('.x-card, .modal, .x-modal__inner');
    if (modal) {
      modal.style.overflow = 'visible';
    }
  }, 100);
});
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<style scoped>
.dropdown-menu-item {
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 6px;
  font-size: 15px;
  transition: background 0.15s;
  color: #222;
}
.dropdown-menu-item:hover {
  background: #f3f8ff;
  color: #003473;
}
</style>
