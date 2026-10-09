<template>
  <modal-component
    v-if="preregistration?.student"
    v-model="open"
    title-class="font-hind-18-primary text-uppercase text-primary"
    :title="preregistration.student.student_name ?? ''"
    :large="true"
    loading-text
    @close-modal="$router.push({ name: 'preregistrations' })"
  >
    <template #body>
      <div class="m-auto" style="max-width: 740px">
        <div class="row mt-4">
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
              {{ preregistration.grade.course.name }}
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

        <div class="row mb-4">
          <div class="col-12">
            <x-form @submit="savePreRegistration">
              <div class="col-12">
                <h3 class="font-hind-18-primary mt-4">
                  Editar dados da inscrição
                </h3>
                <hr />
                <div class="row">
                  <x-field
                    v-model="preregistration.grade.id"
                    container-class="col-12 col-md-6"
                    rules="required"
                    label="Série"
                    name="grade"
                    type="SELECT"
                    :options="grades"
                    :searchable="false"
                  />
                  <x-field
                    v-model="preregistration.period.id"
                    container-class="col-12 col-md-6"
                    rules="required"
                    label="Turno"
                    name="period"
                    type="SELECT"
                    :options="periods"
                    :searchable="false"
                  />
                </div>
                <div class="row">
                  <x-field
                    v-model="preregistration.school.id"
                    container-class="col-12"
                    rules="required"
                    label="Escola"
                    name="school"
                    type="SELECT"
                    :options="schoolLabels"
                    :searchable="false"
                  />
                </div>
                <div class="row">
                  <div class="col-12">
                    <x-card bordered>
                      <google-maps
                        :config="store.map.config"
                        :lat="store.map.center.lat"
                        :lng="store.map.center.lng"
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
                            :map="map"
                            :marker="marker"
                          >
                            <template #default>
                              <div>
                                <strong>Sua residência</strong>
                              </div>
                            </template>
                          </google-maps-marker-component>
                        </template>
                      </google-maps>
                    </x-card>
                  </div>
                </div>
                <x-btn
                  :loading="loadingUpdatePreRegistration"
                  label="Editar dados da inscrição"
                  no-caps
                  no-wrap
                  color="primary"
                  class="w-100 mt-3"
                  type="submit"
                />
              </div>
            </x-form>
          </div>
        </div>

        <div class="row mb-4">
          <div class="col-12">
            <x-form @submit="saveStudent">
              <div class="col-12">
                <h3 class="font-hind-18-primary mt-4">
                  Editar dados do(a) aluno(a)
                </h3>
                <hr />
                <Fields
                  v-model:fields="fields.student"
                  v-model:data="student"
                />
                <x-btn
                  :loading="loadingUpdateStudent"
                  label="Editar dados do(a) aluno(a)"
                  no-caps
                  no-wrap
                  color="primary"
                  class="w-100"
                  type="submit"
                />
              </div>
            </x-form>
            <x-form @submit="saveResponsible">
              <div class="col-12">
                <h3 class="font-hind-18-primary mt-4">
                  Editar dados do(a) responsável pelo(a) aluno(a)
                </h3>
                <hr />
                <Fields
                  v-model:fields="fields.responsible"
                  v-model:data="responsible"
                />
                <x-btn
                  :loading="loadingUpdateResponsible"
                  label="Editar dados do(a) responsável pelo(a) aluno(a)"
                  no-caps
                  no-wrap
                  color="primary"
                  class="w-100"
                  type="submit"
                />
              </div>
            </x-form>
            <x-form
              v-if="responsible?.responsible_address"
              @submit="updateAddress"
            >
              <template #default="{ errors, setFieldValue }">
                <div class="col-12">
                  <h3 class="font-hind-18-primary mt-4">
                    Editar dados do(a) endereço do responsável pelo(a) aluno(a)
                  </h3>
                  <address-fields
                    v-model:data="responsible.responsible_address[0]"
                    :fetching-address-lat-lng="false"
                    :set-field-value="setFieldValue"
                    :errors="errors"
                    name="address"
                  />
                  <x-btn
                    :loading="loadingUpdateAddress"
                    label="Editar dados do(a) endereço do responsável pelo(a) aluno(a)"
                    no-caps
                    no-wrap
                    color="primary"
                    class="w-100"
                    type="submit"
                  />
                </div>
              </template>
            </x-form>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="d-flex flex-column flex-lg-row justify-content-center">
        <x-btn
          color="primary"
          outline
          class="ml-3 mr-3 mb-3 mb-lg-0"
          label="Voltar"
          no-wrap
          no-caps
          loading-normal
          @click="back"
        />
      </div>
    </template>
  </modal-component>
</template>

<script setup lang="ts">
import { Address, GoogleMapsMarker, Nullable, Option } from '@/types';
import {
  Fields as FieldsFields,
  PreRegistration,
  PreRegistrationResponsible,
  PreRegistrationStageProcessSchool,
  PreRegistrationStudent,
} from '@/modules/preregistration/types';
import { computed, inject, onMounted, ref, watch } from 'vue';
import {
  markerAddress,
  parseResponsibleFieldsFromProcess,
  parseStudentFieldsFromProcess,
} from '@/util';
import { useRoute, useRouter } from 'vue-router';
import AddressFields from '@/components/form/AddressFields.vue';
import Fields from '@/components/form/Fields.vue';
import { Filters } from '@/filters';
import GoogleMaps from '@/components/maps/GoogleMaps.vue';
import GoogleMapsMarkerComponent from '@/components/maps/GoogleMapsMarker.vue';
import GoogleMapsMarkers from '@/components/maps/GoogleMapsMarkers.vue';
import ModalComponent from '@/components/elements/Modal.vue';
import { Preregistration as PreregistrationApi } from '@/modules/preregistration/api';
import XBtn from '@/components/elements/buttons/XBtn.vue';
import XCard from '@/components/elements/cards/XCard.vue';
import XField from '@/components/x-form/XField.vue';
import XForm from '@/components/x-form/XForm.vue';
import { useGeneralStore } from '@/store/general';
import { useLoader } from '@/composables';

const store = useGeneralStore();

const $filters = inject('$filters') as Filters;

const { loader: loaderByProtocol, data: preregistration } =
  useLoader<PreRegistration>({} as PreRegistration);

const route = useRoute();
const router = useRouter();

const fields = ref<FieldsFields>({
  responsible: [],
  student: [],
});
const responsible = ref<PreRegistrationResponsible>(
  {} as PreRegistrationResponsible
);
const student = ref<PreRegistrationStudent>({} as PreRegistrationStudent);
const open = ref(true);
const grades = ref<Option[]>([]);
const periods = ref<Option[]>([]);
const schools = ref<
  {
    id: string;
    name: string;
    lat: string;
    lng: string;
  }[]
>([]);
const vacancies = ref<
  {
    school: string;
    period: string;
    grade: string;
    total: string;
    available: string;
  }[]
>([]);
const latitude = ref('0');
const longitude = ref('0');

const back = () => {
  router.push({
    name: 'preregistration.modal',
    params: {
      protocol: route.params.protocol,
    },
  });
};

const { loader: loaderUpdateStudent, loading: loadingUpdateStudent } =
  useLoader();
const { loader: loaderUpdateResponsible, loading: loadingUpdateResponsible } =
  useLoader();

const { loader: loaderUpdateAddress, loading: loadingUpdateAddress } =
  useLoader();

const {
  loader: loaderUpdatePreRegistration,
  loading: loadingUpdatePreRegistration,
} = useLoader();

const savePreRegistration = (data: {
  grade: string;
  period: string;
  school: string;
}) => {
  loaderUpdatePreRegistration(() =>
    PreregistrationApi.updatePreRegistration({
      protocol: route.params.protocol as string,
      ...data,
    })
  );
};

const saveStudent = (data: Record<string, Nullable<string>>) => {
  loaderUpdateStudent(() =>
    PreregistrationApi.updateStudent({
      protocol: route.params.protocol as string,
      fields: Object.keys(data).map((key) => ({
        field: key,
        value: data[key] && data[key] !== 'null' ? String(data[key]) : null,
      })),
    })
  );
};

const saveResponsible = (data: Record<string, Nullable<string>>) => {
  loaderUpdateResponsible(() =>
    PreregistrationApi.updateResponsible({
      protocol: route.params.protocol as string,
      fields: Object.keys(data).map((key) => ({
        field: key,
        value: data[key] && data[key] !== 'null' ? String(data[key]) : null,
      })),
    })
  );
};

const updateAddress = (data: { address: Address }) => {
  loaderUpdateAddress(() =>
    PreregistrationApi.updateAddress({
      protocol: route.params.protocol as string,
      address: {
        ...data.address,
        manualChangeLocation: true,
      },
    })
  );
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

const load = (protocol: string) => {
  if (!protocol) return;

  preregistration.value = {} as PreRegistration;

  loaderByProtocol(() =>
    PreregistrationApi.listByProtocol({
      protocol,
      withVacancy: true,
    })
  ).then((res) => {
    const { fields: responsibleFields, data: responsibleData } =
      parseResponsibleFieldsFromProcess(res.process);

    const { fields: studentFields, data: studentData } =
      parseStudentFieldsFromProcess(res.process);

    res.fields
      .filter((f) => f.field.group === 'RESPONSIBLE')
      .forEach((f) => {
        const key =
          `field_${f.field.id}` as unknown as keyof typeof responsibleData;

        responsibleData[key] =
          f.value as unknown as keyof (typeof responsibleData)[keyof typeof responsibleData];
      });

    res.fields
      .filter((f) => f.field.group === 'STUDENT')
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
      responsible_place_of_birth: String(
        res.responsible.responsible_place_of_birth
      ),
    };

    fields.value.student = studentFields.sortBy('order');
    student.value = {
      ...studentData,
      ...res.student,
      student_place_of_birth: String(res.student.student_place_of_birth),
    };

    latitude.value = res.responsible.responsible_address[0].lat;
    longitude.value = res.responsible.responsible_address[0].lng;

    grades.value = res.process.grades
      .map((e) => ({
        key: e.id,
        label: e.name,
      }))
      .sortBy('label');

    periods.value = res.process.periods
      .map((e) => ({
        key: e.id,
        label: e.name,
      }))
      .sortBy('label');

    schools.value = res.process.schools.filter((s) => s.lat && s.lng);

    vacancies.value = res.process.vacancies;
  });
};

const allSchools = computed(() => {
  return schools.value
    .filter((school) => {
      const vac = vacancies.value.filter(
        (v) => Number(v.school) === Number(school.id)
      );

      if (preregistration.value.grade.id && preregistration.value.period.id) {
        return vac.find((v) => {
          if (Number(v.school) !== Number(school.id)) {
            return false;
          }

          if (Number(v.grade) !== Number(preregistration.value.grade.id)) {
            return false;
          }

          if (Number(v.period) !== Number(preregistration.value.period.id)) {
            return false;
          }

          return Number(v.available) >= 1;
        });
      }

      return true;
    })
    .map((s) => ({
      ...s,
      position: {
        lat: s.lat,
        lng: s.lng,
      },
    }))
    .sortBy('label');
});

const schoolLabels = computed(() => {
  return allSchools.value.map((e) => ({
    key: e.id,
    label: e.name,
  }));
});

const markerClosestSchools = computed<GoogleMapsMarker[]>(
  (): GoogleMapsMarker[] => allSchools.value as unknown as GoogleMapsMarker[]
);

const selectFirstSchool = (school: MouseEvent) => {
  if (!school) return;

  preregistration.value.school.id = (
    school as unknown as PreRegistrationStageProcessSchool
  ).id;
};

const marker = computed<GoogleMapsMarker>(
  () =>
    ({
      ...markerAddress(),
      position: {
        lat: latitude.value,
        lng: longitude.value,
      },
    } as unknown as GoogleMapsMarker)
);

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

onMounted(() => load(reactiveRoute.value.params.protocol as string));
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>
