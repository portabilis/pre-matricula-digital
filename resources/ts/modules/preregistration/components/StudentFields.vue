<template>
  <div>
    <h2 class="font-muli-20-primary mb-4">
      Preencha o formulário abaixo para criar sua inscrição:
    </h2>
    <p>
      Preencha os campos abaixo para identificar os dados do(a) aluno(a). Os
      campos com asterisco (*) são de preenchimento
      <strong>obrigatório</strong> para prosseguir com a inscrição.
    </p>
    <hr class="mt-5 mb-5" />
    <div class="mb-3 d-flex justify-content-between">
      <h3 class="font-hind-18-primary">Dados do(a) aluno(a)</h3>
      <x-btn
        class="border-danger text-danger flex-row"
        label="Limpar dados"
        no-caps
        no-wrap
        data-test="clear-student-data"
        @click="$emit('clean')"
      />
    </div>
    <fields
      v-model:fields="modelFields"
      v-model:data="modelStudent"
      :errors="errors"
    />
    <h3 class="mt-4 font-hind-18-primary">Dados da pré-matrícula</h3>
    <p class="text-muted">
      <span v-if="isWaitingList">
        Informe a <strong>série</strong>, <strong>turno</strong> e a
        <strong>escola</strong> que deseja realizar a inscrição de lista de
        espera para o(a) aluno(a).
      </span>
      <span v-else>
        Informe a <strong>série</strong>, <strong>turno</strong> e a
        <strong>escola</strong> que deseja realizar a inscrição de pré-matrícula
        para o(a) aluno(a).
      </span>
      <span v-if="allowWaitingList">
        Caso a escola pretendida <strong>não possua vagas disponíveis</strong>,
        você pode definir a mesma na opção 'Selecionar uma escola para aguardar
        na lista de espera'.
      </span>
    </p>
    <p v-if="process && process.gradeAgeRangeLink">
      <a :href="process.gradeAgeRangeLink" target="_blank">
        Tabela de séries recomendadas por faixa etária
        <i class="fa fa-external-link"></i>
      </a>
    </p>
    <div
      v-if="matchedSchool && matchedGrade"
      class="alert alert-info"
      data-test="alert-matched-school-and-grade"
    >
      O(a) aluno(a) está matriculado(a) atualmente na série
      <strong>{{ matchedGrade.label }}</strong> na escola
      <strong>{{ matchedSchool.name }}</strong>
      <span
        v-if="Number(matchedSchool.id) === Number(modelStudent.school)"
        data-test="alert-matched-school-and-grade-already-selected"
      >
        e ela já está selecionada</span
      >.
    </div>
    <div v-else-if="matchedSchool" class="alert alert-info">
      O(a) aluno(a) está matriculado atualmente na escola
      <strong>{{ matchedSchool.name }}</strong>
      <span v-if="Number(matchedSchool.id) === Number(modelStudent.school)">
        e ela já está selecionada</span
      >.
    </div>
    <div class="row">
      <x-field
        v-model="modelStudent.grade"
        container-class="col-12 col-md-6"
        rules="required"
        label="Série"
        name="grade"
        type="SELECT"
        :options="grades"
        :errors="!!errors['grade']"
        :searchable="false"
      />
      <x-field
        v-model="modelStudent.period"
        container-class="col-12 col-md-6"
        rules="required"
        label="Turno"
        name="period"
        type="SELECT"
        :options="periods"
        :errors="!!errors['period']"
        :searchable="false"
      />
      <suggested-grades-message-component
        class="col-12"
        :suggested-grades="suggestedGrades"
        :suggested-grades-message="suggestedGradesMessage"
      />
      <div v-if="doesntHaveClosestSchools" class="col-12">
        <div class="alert alert-warning">
          Não há escolas próximas ao seu endereço, então todas as escolas com
          vagas disponíveis na série e turno selecionados estão sendo exibidas.
        </div>
      </div>
      <div v-if="doesntHaveSchoolsWithVacancies" class="col-12">
        <div
          v-if="renewalAtSameSchool && !allowWaitingList"
          class="alert alert-warning"
        >
          Não há vagas disponíveis para a série e turno selecionados na escola
          disponível para o aluno(a). Favor contatar a unidade para
          prosseguimento da inscrição.
        </div>
        <div v-else-if="!allowWaitingList" class="alert alert-warning">
          Não há vagas disponíveis para a série e turno selecionados. Favor
          contatar a unidade para prosseguimento da inscrição.
        </div>
        <div v-else class="alert alert-warning">
          Não há escolas com vagas disponíveis para a série e turno
          selecionados, selecione em qual escola você deseja entrar na lista de
          espera.
        </div>
      </div>
      <no-suggested-grades-message
        class="col-12"
        :no-grades-suggested="
          !!(
            $props.stage?.process.blockIncompatibleAgeGroup &&
            suggestedGrades.length < 1 &&
            !!modelStudent.student_date_of_birth
          )
        "
      />
      <div v-if="doesntHaveAnySchools" class="col-12">
        <div class="alert alert-danger">
          Não há escolas disponíveis para a série e turno selecionados.
        </div>
        <x-field
          v-if="doesntHaveAnySchools"
          v-show="false"
          :model-value="null"
          container-class="hidden"
          rules="required"
          label=""
          name="doesntHaveAnySchools"
          type="TEXT"
          :errors="!!errors['doesntHaveAnySchools']"
        />
      </div>
      <template v-if="modelResponsible.useSecondAddress">
        <div class="col-12 mt-4">
          Qual endereço deseja usar para buscar a escola mais próxima?
        </div>
        <div class="col-sm-6 mt-3">
          <label class="card-label">
            <input
              v-model="selectedAddress"
              :value="modelResponsible.address"
              name="which_address"
              type="radio"
              class="card-input"
            />
            <x-card bordered hoverable>
              <x-card-section class="font-hind text-blue-dark">
                <div class="font-weight-bold" style="font-size: 18px">
                  {{ filters.joinAddressLine1(modelResponsible.address) }}
                </div>
                <div class="small">
                  {{ filters.joinAddressLine2(modelResponsible.address) }}
                </div>
                <div class="small">
                  {{ filters.joinAddressLine3(modelResponsible.address) }}
                </div>
              </x-card-section>
            </x-card>
          </label>
        </div>
        <div class="col-sm-6 mt-3">
          <label class="card-label">
            <input
              v-model="selectedAddress"
              :value="modelResponsible.secondAddress"
              name="which_address"
              type="radio"
              class="card-input"
            />
            <x-card bordered hoverable>
              <x-card-section class="font-hind text-blue-dark">
                <div class="font-weight-bold" style="font-size: 18px">
                  {{ filters.joinAddressLine1(modelResponsible.secondAddress) }}
                </div>
                <div class="small">
                  {{ filters.joinAddressLine2(modelResponsible.secondAddress) }}
                </div>
                <div class="small">
                  {{ filters.joinAddressLine3(modelResponsible.secondAddress) }}
                </div>
              </x-card-section>
            </x-card>
          </label>
        </div>
      </template>
      <template v-if="haveSchoolsWithVacancies && !isWaitingList">
        <x-field
          v-model="modelStudent.school"
          container-class="col-12 mt-3"
          rules="required"
          label="Escola"
          name="school"
          type="SELECT"
          :options="closestSchools"
          :errors="!!errors['school']"
          :searchable="false"
        />
        <select-address-position
          v-model:adjusted="adjustedAddressPosition"
          v-model:old="oldAddressPosition"
          :allow-responsible-select-map-address="
            modelStage.process.allowResponsibleSelectMapAddress
          "
          :old-address-postition="oldAddressPosition"
          :is-using-second-address="isUsingSecondAddress"
          @undo-address-position="handleUndoAddressPosition(oldAddressPosition)"
          @confirm-new-location="
            (oldAddressPosition = {
              secondAddress: isUsingSecondAddress,
              lat: selectedAddress.lat as number,
              lng: selectedAddress.lng as number,
            }),
              handleConfirmNewLocation(
                oldAddressPosition,
                adjustedAddressPosition
              )
          "
          @set-new-location="handleSetNewLocation"
          @cancel-new-location="handleCancelNewLocation"
        >
          <template #map="{ adjustAddress, setNewPosition }">
            <div class="col-12">
              <x-card bordered>
                <google-maps
                  :config="store.map.config"
                  :lat="lat"
                  :lng="lng"
                  :zoom="store.map.zoom"
                  style="height: 400px"
                  tabindex="-1"
                >
                  <template #default="{ map }">
                    <google-maps-markers
                      :markers="markerClosestSchools"
                      :map="map"
                      @click="selectFirstSchool"
                    >
                      <template #default="{ marker: markerSlot }">
                        <div>
                          <strong>{{ markerSlot.name }}</strong>
                        </div>
                      </template>
                    </google-maps-markers>
                    <google-maps-marker-component
                      v-if="selectedAddress"
                      :map="map"
                      :marker="marker"
                    >
                      <template #default>
                        <div>
                          <strong>Sua residência</strong>
                        </div>
                      </template>
                    </google-maps-marker-component>
                    <google-maps-marker-component
                      v-if="adjustAddress"
                      :map="map"
                      :marker="markerAdjustedAddress"
                      draggable
                      @new-position="setNewPosition"
                    >
                      <template #default>
                        <div>
                          <strong>Novo ponto de referência</strong>
                        </div>
                      </template>
                    </google-maps-marker-component>
                  </template>
                </google-maps>
              </x-card>
            </div>
          </template>
        </select-address-position>
      </template>
      <div
        v-if="!modelStudent.useSecondSchool && allowWaitingList"
        class="col-12 mt-5"
      >
        <x-btn
          class="w-100"
          color="primary"
          label="Selecionar uma escola para aguardar na lista de espera"
          no-caps
          no-wrap
          @click="setUseSecondSchool"
        />
      </div>
      <template v-if="showWaitingListOption">
        <div class="col-12 mt-4">
          Selecione qual escola deseja ficar em lista de espera
        </div>
        <x-field
          v-if="!isWaitingList"
          v-model="modelStudent.secondPeriod"
          container-class="col-12 col-md-6"
          rules="required"
          label="Turno"
          name="secondPeriod"
          type="SELECT"
          :options="periods"
          :errors="!!errors['secondPeriod']"
          :searchable="false"
        />
        <x-field
          v-model="modelStudent.secondSchool"
          container-class="col-12"
          rules="required"
          label="Escola (lista de espera)"
          name="secondSchool"
          type="SELECT"
          :options="
            getOptionalSchoolsFilter(
              modelStudent.grade,
              isWaitingList ? modelStudent.period : modelStudent.secondPeriod,
              modelStudent.secondSchool
            )
          "
          :errors="!!errors['secondSchool']"
          :searchable="false"
        />
        <select-address-position
          v-model:adjusted="adjustedWaitingListAddressPosition"
          v-model:old="oldWaitingListAddressPosition"
          :allow-responsible-select-map-address="
            modelStage.process.allowResponsibleSelectMapAddress &&
            !modelStudent.useSecondSchool
          "
          :old-address-postition="oldAddressPosition"
          :is-using-second-address="isUsingSecondAddress"
          @undo-address-position="
            handleUndoAddressPosition(oldWaitingListAddressPosition)
          "
          @confirm-new-location="
            (oldWaitingListAddressPosition = {
              secondAddress: isUsingSecondAddress,
              lat: selectedAddress.lat as number,
              lng: selectedAddress.lng as number,
            }),
              handleConfirmNewLocation(
                oldWaitingListAddressPosition,
                adjustedWaitingListAddressPosition
              )
          "
          @set-new-location="handleSetNewLocation"
          @cancel-new-location="handleCancelNewLocation"
        >
          <template #map="{ adjustAddress, setNewPosition }">
            <div class="col-12 mb-3">
              <x-card bordered>
                <google-maps
                  :config="store.map.config"
                  :lat="lat"
                  :lng="lng"
                  :zoom="store.map.zoom"
                  style="height: 400px"
                  tabindex="-1"
                >
                  <template #default="{ map }">
                    <google-maps-markers
                      :markers="
                        markerOptionalSchools(
                          getOptionalSchoolsFilter(
                            modelStudent.grade,
                            isWaitingList
                              ? modelStudent.period
                              : modelStudent.secondPeriod,
                            modelStudent.secondSchool
                          )
                        )
                      "
                      :map="map"
                      @click="selectSecondSchool"
                    >
                      <template #default="{ marker: markerSlot }">
                        <div>
                          <strong>{{ markerSlot.label }}</strong>
                        </div>
                      </template>
                    </google-maps-markers>
                    <google-maps-marker-component
                      :map="map"
                      :marker="marker"
                    >
                      <template #default>
                        <div>
                          <strong>{{ marker.title }}</strong>
                        </div>
                      </template>
                    </google-maps-marker-component>
                    <google-maps-marker-component
                      v-if="adjustAddress"
                      :map="map"
                      :marker="markerAdjustedAddress"
                      draggable
                      @new-position="setNewPosition"
                    >
                      <template #default>
                        <div>
                          <strong>Novo ponto de referência</strong>
                        </div>
                      </template>
                    </google-maps-marker-component>
                  </template>
                </google-maps>
              </x-card>
            </div>
          </template>
        </select-address-position>
        <div v-if="!isWaitingList" class="col-12 mt-3">
          <x-btn
            class="w-100"
            color="primary"
            label="Não usar a opção para aguardar na lista de espera"
            no-caps
            no-wrap
            @click="doesntuseSecondSchool"
          />
        </div>

        <template
          v-for="(waiting, index) in modelStudent.waitingList"
          :key="index"
        >
          <div class="col-12 border-top pt-3 mt-3">
            <div class="row">
              <div class="col-12 mt-3 mb-3">
                Opção {{ index + 2 }}: lista de espera
              </div>
              <x-field
                v-model="modelStudent.grade"
                v-tooltip.bottom="
                  'Você deve alterar a série no campo principal'
                "
                container-class="col-12 col-md-6"
                rules="required"
                label="Série"
                type="SELECT"
                disabled
                :options="grades"
                :errors="!!errors['secondPeriod']"
                :searchable="false"
              />
              <x-field
                v-model="waiting.period"
                container-class="col-12 col-md-6"
                rules="required"
                label="Turno"
                type="SELECT"
                :name="`waitingList.[${index}].period`"
                :options="periods"
                :errors="!!errors[`waitingList.[${index}].period`]"
                :searchable="false"
                @change="waiting.school = ''"
              />
              <x-field
                v-model="waiting.school"
                container-class="col-12"
                rules="required"
                label="Escola (lista de espera)"
                type="SELECT"
                :name="`waitingList.[${index}].school`"
                :options="
                  getOptionalSchoolsFilter(
                    modelStudent.grade,
                    waiting.period,
                    waiting.school
                  )
                "
                :errors="!!errors[`waitingList.[${index}].school`]"
                :searchable="false"
              />
              <div class="col-12 mb-3">
                <x-card bordered>
                  <google-maps
                    :config="store.map.config"
                    :lat="lat"
                    :lng="lng"
                    :zoom="store.map.zoom"
                    style="height: 400px"
                    tabindex="-1"
                  >
                    <template #default="{ map }">
                      <google-maps-markers
                        :markers="
                          markerOptionalSchools(
                            getOptionalSchoolsFilter(
                              modelStudent.grade,
                              waiting.period,
                              waiting.school
                            )
                          )
                        "
                        :map="map"
                        @click="waiting.school = $event?.id"
                      >
                        <template #default="{ marker: markerSlot }">
                          <div>
                            <strong>{{ markerSlot.label }}</strong>
                          </div>
                        </template>
                      </google-maps-markers>
                      <google-maps-marker-component
                        :map="map"
                        :marker="marker"
                      >
                        <template #default>
                          <div>
                            <strong>{{ marker.title }}</strong>
                          </div>
                        </template>
                      </google-maps-marker-component>
                    </template>
                  </google-maps>
                </x-card>
                <x-btn
                  class="ml-auto border-danger text-danger flex-row mt-3"
                  label="Remover essa opção"
                  no-caps
                  no-wrap
                  @click="modelStudent.waitingList.splice(index, 1)"
                />
              </div>
            </div>
          </div>
        </template>

        <div class="col-12">
          <x-btn
            v-if="
              modelStudent.waitingList.length + 1 < process.waitingListLimit
            "
            class="w-100"
            color="primary"
            label="Adicionar outra escola para aguardar na lista de espera"
            no-caps
            no-wrap
            @click="addWaitingList"
          />
        </div>
      </template>

      <x-field
        v-show="false"
        :model-value="student.school || student.secondSchool"
        container-class="hidden"
        rules="required"
        name="atLeastOneSchool"
        type="TEXT"
        :errors="!!errors['atLeastOneSchool']"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  Address,
  AddressPosition,
  GoogleMapsMarker,
  Nullable,
  Option,
  Rules,
} from '@/types';
import {
  ParseFieldFromProcess,
  PreRegistrationResponsibleField,
  PreRegistrationStage,
  PreRegistrationStageProcessSchool,
  PreRegistrationStudentField,
} from '../types';
import {
  PropType,
  computed,
  defineComponent,
  inject,
  onMounted,
  ref,
  watch,
} from 'vue';
import { markerAddress, newLocationPosition } from '@/util';
import { Filters } from '@/filters';
import { GenericFields } from '@/components/form/Fields.vue';
import GoogleMaps from '@/components/maps/GoogleMaps.vue';
import GoogleMapsMarkerComponent from '@/components/maps/GoogleMapsMarker.vue';
import GoogleMapsMarkers from '@/components/maps/GoogleMapsMarkers.vue';
import NoSuggestedGradesMessage from '@/modules/preregistration/components/NoSuggestedGradesMessage.vue';
import SelectAddressPosition from '@/components/elements/SelectAddressPosition.vue';
import SuggestedGradesMessageComponent from '@/modules/preregistration/components/SuggestedGradesMessage.vue';
import XBtn from '@/components/elements/buttons/XBtn.vue';
import XCard from '@/components/elements/cards/XCard.vue';
import XCardSection from '@/components/elements/cards/XCardSection.vue';
import XField from '@/components/x-form/XField.vue';
import { isPointWithinRadius } from 'geolib';
import { isValidDate } from '@/datetime';
import { useGeneralStore } from '@/store/general';
import { useStudentProcessAndSuggestGrades } from '@/composables';
import { useVModel } from '@vueuse/core';

interface School {
  key: string;
  label: string;
  lat: number;
  lng: number;
  position: {
    lat: number;
    lng: number;
  };
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export default defineComponent({
  components: {
    Fields: GenericFields<PreRegistrationStudentField>(),
    XField,
    XBtn,
    XCard,
    XCardSection,
    GoogleMaps,
    GoogleMapsMarkerComponent,
    GoogleMapsMarkers,
    SelectAddressPosition,
    SuggestedGradesMessageComponent,
    NoSuggestedGradesMessage,
  },
  props: {
    student: {
      type: Object as PropType<PreRegistrationStudentField>,
      default: () => ({}),
    },
    stage: {
      type: Object as PropType<PreRegistrationStage>,
      default: () => ({}),
    },
    responsible: {
      type: Object as PropType<PreRegistrationResponsibleField>,
      default: () => ({}),
    },
    fields: {
      type: Array as PropType<ParseFieldFromProcess[]>,
      default: () => [],
    },
    errors: {
      type: Object as PropType<Rules>,
      default: () => ({}),
    },
  },
  emits: ['clean', 'change-primary-address'],
  setup(props, { emit }) {
    const filters = inject('$filters') as Filters;

    const store = useGeneralStore();

    const selectedAddress = ref<Address>(props.responsible.address);
    const matchedSchool = ref<PreRegistrationStageProcessSchool>();
    const matchedGrade = ref<Option>();

    const isUsingSecondAddress = ref(false);
    const adjustedAddressPosition = ref(newLocationPosition());
    const oldAddressPosition = ref(newLocationPosition());
    const adjustedWaitingListAddressPosition = ref(newLocationPosition());
    const oldWaitingListAddressPosition = ref(newLocationPosition());

    const modelStudent = useVModel(props, 'student');
    const modelStage = useVModel(props, 'stage');
    const modelResponsible = useVModel(props, 'responsible');
    const modelFields = useVModel(props, 'fields');

    const process = computed(() => {
      return modelStage.value?.process;
    });

    const { grades, suggestedGrades, suggestGrade, suggestedGradesMessage } =
      useStudentProcessAndSuggestGrades(process);

    const periods = computed<Option[]>(() => {
      return modelStage.value?.process.periods
        .map((g) => ({ key: g.id, label: g.name }))
        .sortBy('label') as Option[];
    });

    const schools = computed(() => {
      return modelStage.value?.process.schools
        .map((s) => ({
          ...s,
          key: s.id,
          label: s.name,
          lat: s.latitude,
          lng: s.longitude,
          position: {
            lat: s.latitude,
            lng: s.longitude,
          },
        }))
        .sortBy('label');
    });

    const isWaitingList = computed(() => {
      return modelStage.value?.type === 'WAITING_LIST';
    });

    const showWaitingListOption = computed(() => {
      if (isWaitingList.value) {
        return true;
      }

      return modelStudent.value.useSecondSchool && allowWaitingList.value;
    });

    const doesntHaveClosestSchools = computed(() => {
      // Exibe a mensagem no período de lista de espera caso não existam escolas dentro do raio
      if (isWaitingList.value) {
        return schoolsWithinRange.value?.length === 0;
      }

      // Evita exibir a mensagem de que não há escolas próximos e que estão sendo exibidas todas as escolas
      if (renewalAtSameSchool.value) {
        return false;
      }

      return (
        filteredSchools.value.length === 0 &&
        (schoolsWithVacancy.value as School[]).length > 0
      );
    });

    const doesntHaveSchoolsWithVacancies = computed(() => {
      // Em caso de período de lista de espera, não exibe a mensagem de que não há vagas disponíveis para a série e
      // turno selecionados
      if (isWaitingList.value) {
        return false;
      }

      // Em caso de rematrícula apenas na escola do ano anterior, força exibir a mensagem para selecionar uma escola em
      // lista de espera caso não haja vaga na escola do ano anterior.
      if (renewalAtSameSchool.value) {
        return filteredSchools.value.length === 0;
      }

      return (
        filteredSchools.value.length === 0 &&
        (schoolsWithVacancy.value as School[]).length === 0 &&
        (allSchools.value as School[]).length > 0
      );
    });

    const doesntHaveAnySchools = computed(() => {
      return (
        filteredSchools.value.length === 0 &&
        (schoolsWithVacancy.value as School[]).length === 0 &&
        (allSchools.value as School[]).length === 0
      );
    });

    const haveSchoolsWithVacancies = computed(() => {
      return !doesntHaveSchoolsWithVacancies.value;
    });

    const lat = computed(() => {
      return selectedAddress.value.lat || store.map.center.lat;
    });

    const lng = computed(() => {
      return selectedAddress.value.lng || store.map.center.lng;
    });

    // Indica que a rematrícula só poderá ser feita na mesma escola do ano anterior.
    const renewalAtSameSchool = computed(() => {
      return modelStage.value?.renewalAtSameSchool;
    });

    // Indica se é possível selecionar uma escola para lista de espera
    const allowWaitingList = computed(() => {
      return modelStage.value?.allowWaitingList;
    });

    // Retorna todas as escolas que possuam latitude e longitude configuradas e que tenham turmas na série e turno
    // selecionados, mesmo que as turmas não tenham mais vagas.
    const allSchools = computed(() => {
      return schools.value
        ?.filter((s) => s.lat && s.lng)
        .filter((school) => {
          const vacancies = process.value?.vacancies.filter(
            (v) => Number(v.school) === Number(school.id)
          );

          if (modelStudent.value.grade && modelStudent.value.period) {
            return vacancies?.find((v) => {
              if (Number(v.school) !== Number(school.id)) {
                return false;
              }

              if (Number(v.grade) !== Number(modelStudent.value.grade)) {
                return false;
              }

              return Number(v.period) === Number(modelStudent.value.period);
            });
          }

          return true;
        });
    });

    // Retorna todas as escolas que possuam latitude e longitude configuradas e que tenham turmas na série e turno
    // selecionados, mesmo que as turmas não tenham mais vagas removendo as opções já selecionadas em outros campos.
    // Utilizado para a listagem das escolas de lista de espera.
    const getOptionalSchoolsFilter = (
      grade: Nullable<string>,
      period: Nullable<string>,
      school: Nullable<string>
    ) => {
      const selectedOptions = modelStudent.value?.waitingList
        .map((w) => `${modelStudent.value.grade}-${w.period}-${w.school}`)
        .concat(
          `${modelStudent.value.grade}-${modelStudent.value.period}-${modelStudent.value.school}`
        )
        .concat(
          `${modelStudent.value.grade}-${
            modelStudent.value.secondPeriod || modelStudent.value.period
          }-${modelStudent.value.secondSchool}`
        )
        .filter(
          (o) =>
            o !== `${grade}-${period}-${school}` && o.includes('null') === false
        );

      const allSchools = isWaitingList.value
        ? schoolsForWaitingList.value
        : schools.value;

      return allSchools
        .filter((s) => s.lat && s.lng)
        .filter((schoolOption) => {
          const vacancies = process.value?.vacancies.filter(
            (v) => Number(v.school) === Number(schoolOption.id)
          );

          if (grade && period) {
            return vacancies?.find((v) => {
              const key = `${v.grade}-${v.period}-${v.school}`;

              if (selectedOptions.includes(key)) {
                return false;
              }

              if (Number(v.school) !== Number(schoolOption.id)) {
                return false;
              }

              if (Number(v.grade) !== Number(grade)) {
                return false;
              }

              return Number(v.period) === Number(period);
            });
          }

          return true;
        });
    };

    // Retorna todas as escolas que possuam latitude e longitude configuradas e que tenham turmas que possuam vagas na
    // série e turno selecionados.
    // Exibe apenas as escolas próximas ao endereço, quando o raio está configurado, caso não haja nenhuma escola
    // disponível, irá exibir todas as escolas que tenham turmas que possuam vagas na série e turno selecionados.
    // Utilizado para a listagem das escolas da escolha principal.
    const closestSchools = computed(() => {
      const filtered = filteredSchools.value;

      if (
        modelStudent.value.grade &&
        modelStudent.value.period &&
        filtered.length === 0
      ) {
        return modelStage.value?.renewalAtSameSchool
          ? []
          : schoolsWithVacancy.value;
      }

      return filtered;
    });

    const markerClosestSchools = computed<GoogleMapsMarker[]>(
      (): GoogleMapsMarker[] =>
        closestSchools.value as unknown as GoogleMapsMarker[]
    );

    const schoolsWithinRange = computed<School[]>(() => {
      return allSchools.value?.filter((school) =>
        isWithinRange(school)
      ) as School[];
    });

    const schoolsForWaitingList = computed(() => {
      let schools: School[] = schoolsWithinRange.value;

      if (schools.length === 0) {
        schools = allSchools.value as School[];
      }

      return schools;
    });

    // Retorna apenas as escolas que possuam latitude e longitude configuradas e que tenham turmas que possuam vagas na
    // série e turno selecionados.
    const schoolsWithVacancy = computed(() => {
      return schools.value
        ?.filter((s) => s.lat && s.lng)
        .filter((school) => {
          const vacancies = process.value?.vacancies.filter(
            (v) => Number(v.school) === Number(school.id)
          );

          if (modelStudent.value.grade && modelStudent.value.period) {
            return vacancies?.find((v) => {
              if (Number(v.school) !== Number(school.id)) {
                return false;
              }

              if (Number(v.grade) !== Number(modelStudent.value.grade)) {
                return false;
              }

              if (Number(v.period) !== Number(modelStudent.value.period)) {
                return false;
              }

              return v.available >= 1;
            });
          }

          return true;
        });
    });

    // Filtra as escolas baseado no raio configurado para o período do processo.
    // Se for uma rematrícula, exibe a escola original mesmo que ela esteja fora do raio.
    const filteredSchools = computed(() => {
      const filteredSchools = (schoolsWithVacancy.value as School[]).filter(
        (school) => isWithinRange(school)
      );

      return filteredSchools || [];
    });

    const marker = computed<GoogleMapsMarker>(
      () =>
        ({
          ...markerAddress(),
          position: {
            lat: selectedAddress.value.lat,
            lng: selectedAddress.value.lng,
          },
        } as unknown as GoogleMapsMarker)
    );

    const markerOptionalSchools = (schools: School[]): GoogleMapsMarker[] =>
      schools.map((s) => ({
        label: s.label,
        position: {
          lat: s.lat,
          lng: s.lng,
        },
        id: s.id,
      })) as unknown as GoogleMapsMarker[];

    const markerAdjustedAddress = computed<GoogleMapsMarker>(
      () =>
        ({
          ...markerAddress(),
          position: {
            lat: selectedAddress.value.lat,
            lng: selectedAddress.value.lng,
          },
        } as unknown as GoogleMapsMarker)
    );

    const clearSchools = () => {
      if (
        !closestSchools.value?.find(
          (s) => Number(s.id) === Number(modelStudent.value.school)
        )
      ) {
        modelStudent.value.school = null;
      }

      if (
        !schools.value?.find(
          (s) => Number(s.id) === Number(modelStudent.value.school)
        )
      ) {
        modelStudent.value.secondSchool = null;
        modelStudent.value.secondPeriod = null;
      }
    };

    const doesntuseSecondSchool = () => {
      modelStudent.value.useSecondSchool = false;
      modelStudent.value.secondSchool = null;
      modelStudent.value.secondPeriod = null;
    };

    const selectFirstSchool = (school?: PreRegistrationStageProcessSchool) => {
      if (!school) return;

      modelStudent.value.school = (
        school as unknown as PreRegistrationStageProcessSchool
      ).id;
    };

    const selectSecondSchool = (school?: PreRegistrationStageProcessSchool) => {
      if (!school) return;

      modelStudent.value.secondSchool = (
        school as unknown as PreRegistrationStageProcessSchool
      ).id;
    };

    const copyDataFromResponsible = () => {
      modelFields.value
        .filter((f) => f.key.substring(0, 7) === 'student')
        .map((f) => f.key.substring(8))
        .forEach((key) => {
          const responsibleKey =
            `responsible_${key}` as keyof typeof modelResponsible.value;
          const studentKey =
            `student_${key}` as keyof typeof modelStudent.value;

          if (modelResponsible.value[responsibleKey]) {
            // Trecho de código para copiar os dados do responsável para o aluno.
            // O typescript interpreta que os dados de dentro de modelResponsible e modelStudent são diferentes, portanto, o cast é necessário.
            const value = modelResponsible.value[
              responsibleKey
            ] as keyof typeof modelStudent.value;
            (modelStudent.value[
              studentKey
            ] as keyof typeof modelStudent.value) = value;
          }
        });
    };

    const isMatchedSchool = (school: string) => {
      return Boolean(
        modelStudent.value.match &&
          Number(modelStudent.value.match?.registration.school.id) ===
            Number(school)
      );
    };

    const isWithinRange = (school: PreRegistrationStageProcessSchool) => {
      if (isMatchedSchool(school.id)) {
        return true;
      }

      // Caso a rematrícula só possa ser feita na escola do ano anterior, não exibe as demais escolas, mesmo que estejam
      // dentro do raio de alcance.
      if (modelStage.value?.renewalAtSameSchool) {
        return false;
      }

      return (
        (modelStage.value as PreRegistrationStage).radius <= 0 ||
        isPointWithinRadius(
          {
            latitude: selectedAddress.value.lat as number,
            longitude: selectedAddress.value.lng as number,
          },
          { latitude: school.latitude, longitude: school.longitude },
          (modelStage.value as PreRegistrationStage).radius
        )
      );
    };

    const setUseSecondSchool = () => {
      modelStudent.value.useSecondSchool = true;
      modelStudent.value.secondPeriod = modelStudent.value.period;
    };

    const handleSetNewLocation = () => {
      emit('change-primary-address', {
        changed: true,
        secondAddress: isUsingSecondAddress.value,
      });
    };

    const handleCancelNewLocation = () => {
      emit('change-primary-address', {
        changed: false,
        secondAddress: false,
      });
    };

    const handleConfirmNewLocation = (
      old: AddressPosition,
      adjusted: AddressPosition
    ) => {
      if (old.secondAddress) {
        modelResponsible.value.secondAddress = {
          ...modelResponsible.value.secondAddress,
          lat: adjusted.lat as number,
          lng: adjusted.lng as number,
        };

        selectedAddress.value = modelResponsible.value.secondAddress;
      } else {
        modelResponsible.value.address = {
          ...modelResponsible.value.address,
          lat: adjusted.lat as number,
          lng: adjusted.lng as number,
        };

        selectedAddress.value = modelResponsible.value.address;
      }

      emit('change-primary-address', {
        changed: true,
        secondAddress: old.secondAddress,
      });
    };

    const handleUndoAddressPosition = (old: AddressPosition) => {
      if (old.secondAddress) {
        ctx.handleUpdateModelResponsible(old, 'secondAddress');
        ctx.handleUpdateSelectedAddress(modelResponsible.value.secondAddress);
      } else {
        ctx.handleUpdateModelResponsible(old, 'address');
        ctx.handleUpdateSelectedAddress(modelResponsible.value.address);
      }

      emit('change-primary-address', {
        changed: false,
        secondAddress: old.secondAddress,
      });
    };

    const handleUpdateModelResponsible = (
      model: AddressPosition,
      key: 'address' | 'secondAddress'
    ) => {
      modelResponsible.value[key].lat = model.lat as number;
      modelResponsible.value[key].lng = model.lng as number;
    };

    const handleUpdateSelectedAddress = (model: Address) => {
      selectedAddress.value = model;
    };

    const addWaitingList = () => {
      modelStudent.value?.waitingList.push({
        period: '',
        school: '',
      });
    };

    onMounted(() => {
      if (modelStudent.value.match) {
        if (isWaitingList.value) {
          modelStudent.value.secondSchool = modelStudent.value.match
            ? String(modelStudent.value.match.registration.school.id)
            : null;
        } else {
          modelStudent.value.school = modelStudent.value.match
            ? String(modelStudent.value.match.registration.school.id)
            : null;
        }
        matchedSchool.value = schools.value?.find(
          (s) =>
            Number(s.id) ===
            Number(modelStudent.value.match?.registration.school.id)
        );
        matchedGrade.value = grades.value.find(
          (g) =>
            Number(g.key) ===
            Number(modelStudent.value.match?.registration.grade.id)
        );
      }

      if (modelStudent.value.student_date_of_birth) {
        suggestGrade(modelStudent.value.student_date_of_birth);
      }
    });

    watch(
      () => modelStudent.value.student_date_of_birth,
      (value) => {
        if (isValidDate(value)) {
          ctx.suggestGrade(value);
        }
      }
    );

    watch(
      () => modelStudent.value.grade,
      () => {
        ctx.clearSchools();
      }
    );

    watch(
      () => modelStudent.value.period,
      () => {
        ctx.clearSchools();
      }
    );

    watch(grades, (value) => {
      if (value.length === 1) {
        modelStudent.value.grade = value[0].key as string;
      } else {
        modelStudent.value.grade = null;
      }
    });

    const ctx = {
      handleUpdateModelResponsible,
      handleUpdateSelectedAddress,
      clearSchools,
      suggestGrade,
      copyDataFromResponsible,
    };

    if (modelResponsible.value.relationType === 'SELF') {
      ctx.copyDataFromResponsible();
    }

    return {
      ctx,
      filters,
      store,
      selectedAddress,
      matchedSchool,
      matchedGrade,
      suggestedGrades,
      modelStudent,
      modelStage,
      modelResponsible,
      modelFields,
      process,
      grades,
      periods,
      schools,
      isWaitingList,
      showWaitingListOption,
      doesntHaveClosestSchools,
      doesntHaveSchoolsWithVacancies,
      doesntHaveAnySchools,
      haveSchoolsWithVacancies,
      lat,
      lng,
      renewalAtSameSchool,
      allowWaitingList,
      allSchools,
      closestSchools,
      markerClosestSchools,
      schoolsWithinRange,
      schoolsForWaitingList,
      schoolsWithVacancy,
      filteredSchools,
      marker,
      suggestedGradesMessage,
      markerOptionalSchools,
      clearSchools,
      doesntuseSecondSchool,
      selectFirstSchool,
      selectSecondSchool,
      suggestGrade,
      copyDataFromResponsible,
      isMatchedSchool,
      isWithinRange,
      setUseSecondSchool,
      markerAdjustedAddress,
      isUsingSecondAddress,
      adjustedAddressPosition,
      oldAddressPosition,
      adjustedWaitingListAddressPosition,
      oldWaitingListAddressPosition,
      handleSetNewLocation,
      handleCancelNewLocation,
      handleConfirmNewLocation,
      handleUndoAddressPosition,
      handleUpdateModelResponsible,
      handleUpdateSelectedAddress,
      addWaitingList,
      getOptionalSchoolsFilter,
    };
  },
});
</script>
