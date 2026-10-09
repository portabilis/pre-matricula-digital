import {
  Address,
  AddressPosition,
  GoogleMapsMarker,
  Nullable,
  Option,
  Rules,
  Student,
} from '@/types';
import {
  ParseFieldFromProcess,
  PreRegistrationProcess,
  PreRegistrationResponsibleField,
  PreRegistrationStageProcess,
  PreRegistrationStudentField,
  ProcessField,
  ProcessFieldField,
  WaitingList,
} from './modules/preregistration/types';
import { getFormattedDate, isValidDate } from '@/datetime';
import { ProcessCheck } from './modules/processes/types';
import { useGeneralStore } from '@/store/general';

type ProcessTypes =
  | PreRegistrationProcess
  | PreRegistrationStageProcess
  | ProcessCheck;

export interface MarkerAddress {
  id: number;
  title: string;
  position: Nullable<{ lat: number; lng: number }>;
  config: {
    icon: {
      path: string;
      strokeOpacity: number;
      strokeWeight: number;
      strokeColor: string;
      fillColor: string;
      fillOpacity: number;
      scale: number;
    };
  };
}

const fieldTypes = (): Option[] => [
  { key: 'TEXT', label: 'Texto' },
  { key: 'LONG_TEXT', label: 'Texto longo' },
  { key: 'NUMBER', label: 'Número' },
  { key: 'SELECT', label: 'Escolha' },
  { key: 'CHECKBOX', label: 'Checkbox' },
  { key: 'RADIO', label: 'Radio' },
  { key: 'DATE', label: 'Data' },
  { key: 'TIME', label: 'Hora' },
  { key: 'EMAIL', label: 'E-mail' },
  { key: 'PHONE', label: 'Telefone' },
  { key: 'CPF', label: 'CPF' },
  { key: 'RG', label: 'RG' },
  { key: 'CITY', label: 'Cidade' },
  { key: 'BIRTH_CERTIFICATE', label: 'Certidão de nascimento' },
  { key: 'MARITAL_STATUS', label: 'Estado civil' },
  { key: 'GENDER', label: 'Gênero' },
  { key: 'FILE', label: 'Arquivo (em breve)' },
];

const genders = (): Option[] => [
  { key: 1, label: 'Feminino' },
  { key: 2, label: 'Masculino' },
];

const sortPreRegistrations = (): Option[] => [
  { key: 'DATE', label: 'Data' },
  { key: 'POSITION', label: 'Posição' },
  { key: 'SCHOOL', label: 'Escola' },
  { key: 'NAME', label: 'Nome do(a) aluno(a)' },
  { key: 'DATE_OF_BIRTH', label: 'Data de nascimento do(a) aluno(a)' },
];

const maritalStatuses = (): Option[] => [
  { key: 2, label: 'Casado(a)' },
  { key: 6, label: 'Companheiro(a)' },
  { key: 3, label: 'Divorciado(a)' },
  { key: 7, label: 'Não informado' },
  { key: 4, label: 'Separado(a)' },
  { key: 1, label: 'Solteiro(a)' },
  { key: 5, label: 'Viúvo(a)' },
];

const reportsTemplates = () => [
  { key: 1, label: 'Detalhado' },
  { key: 2, label: 'Simplificado' },
  { key: 3, label: 'Nominal' },
  { key: 4, label: 'Quantitativo' },
];

const markerAddress = (): GoogleMapsMarker => ({
  id: 1,
  title: 'Seu endereço',
  position: null,
  config: {
    icon: {
      path: 'M 0, 0 m -5, 0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0',
      strokeOpacity: 0.7,
      strokeWeight: 4,
      strokeColor: 'rgb(0,155,77)',
      fillColor: 'rgb(255,255,255)',
      fillOpacity: 0.7,
      scale: 1,
    },
  },
});

const newAddress = (): Address => ({
  postalCode: '',
  address: '',
  number: '',
  complement: '',
  neighborhood: '',
  lat: 0,
  lng: 0,
  city: '',
  cityIbgeCode: 0,
  stateAbbreviation: '',
  manualChangeLocation: false,
});

const newLocationPosition = (): AddressPosition => ({
  secondAddress: false,
  lat: null,
  lng: null,
});

const joinAddress = (address: Address): string => {
  if (!address) {
    return '-';
  }

  const final = [
    address.address,
    address.number,
    address.complement,
    address.neighborhood,
    address.city,
    address.stateAbbreviation,
  ]
    .filter((i) => i)
    .join(', ');

  return final || '-';
};

const joinAddressLine1 = (address: Address): string => {
  if (!address) {
    return '-';
  }

  const final = [address.address, address.number, address.complement]
    .filter((i) => i)
    .join(', ');

  return final || '-';
};

const joinAddressLine2 = (address: Address): string => {
  if (!address) {
    return '-';
  }

  const final = [address.neighborhood, address.postalCode]
    .filter((i) => i)
    .join(', ');

  return final || '-';
};

const joinAddressLine3 = (address: Address): string => {
  if (!address) {
    return '-';
  }

  const final = [address.city, address.stateAbbreviation]
    .filter((i) => i)
    .join('/');

  return final || '-';
};

const getGender = (value: string) => {
  const filteredGender = genders().find((g) => Number(g.key) === Number(value));
  return filteredGender ? filteredGender.label : '-';
};

const getGenderOrEmpty = (value: string) => {
  const filteredGender = genders().find((g) => Number(g.key) === Number(value));
  return filteredGender ? filteredGender.label : '';
};

const getMaritalStatus = (field: ProcessFieldField, value: string) => {
  const filteredMaritalStatus = field.options.find(
    (o) => Number(o.key) === Number(value)
  );
  return filteredMaritalStatus ? filteredMaritalStatus.label : '-';
};

const getMaritalStatuses = (value: string) => {
  const filteredMaritalStatuses = maritalStatuses().find(
    (m) => Number(m.key) === Number(value)
  );
  return filteredMaritalStatuses ? filteredMaritalStatuses.label : '-';
};

const defineFieldFilter = (field: ProcessFieldField) => {
  const store = useGeneralStore();
  switch (field.type) {
    case 'DATE':
      return (value: string) =>
        isValidDate(value) ? getFormattedDate(value) : '-';

    case 'SELECT':
    case 'RADIO':
      return (value: string) => (value ? getMaritalStatus(field, value) : '-');

    case 'CHECKBOX':
      return (value: string) => (value ? 'Sim' : 'Não');

    case 'GENDER':
      return (value: string) => (value ? getGender(value) : '-');

    case 'MARITAL_STATUS':
      return (value: string) => (value ? getMaritalStatuses(value) : '-');

    case 'CITY':
      return (value: string) =>
        store.cities[Object.keys(store.cities).indexOf(value)] || value || '-';

    default:
      return (value: string) => value || '-';
  }
};

const defineFieldRules = (field: ProcessField) => {
  const rules: Rules = {
    required: field.required as string | number | boolean,
  };

  if (field.field.type === 'CPF') {
    rules.cpf = true;
  }

  if (field.field.type === 'RG') {
    rules.rg = true;
  }

  if (field.field.type === 'PHONE') {
    rules.phone = true;
  }

  if (field.field.type === 'DATE') {
    rules.date = true;
  }

  if (
    field.field.internal === 'student_date_of_birth' ||
    field.field.internal === 'responsible_date_of_birth'
  ) {
    rules.born_date = true;
  }

  if (field.field.type === 'TIME') {
    rules.hour = true;
  }

  if (field.field.type === 'EMAIL') {
    rules.email = true;
  }

  if (
    field.field.internal === 'responsible_rg' ||
    field.field.internal === 'student_rg'
  ) {
    rules.max = 20;
  }

  if (field.field.type === 'BIRTH_CERTIFICATE') {
    rules.length = 32;
  }

  return rules;
};

const parseFieldsFromProcess = <T>(
  process: ProcessTypes,
  initial: T,
  type: string
) => {
  const data: T = { ...initial };
  const fields: ParseFieldFromProcess[] = process.fields
    .filter((f) => f.field.group === type)
    .map((f) => ({
      ...f,
      id: (f.field.internal as string) || `field_${f.field.id}`,
      key: (f.field.internal as string) || `field_${f.field.id}`,
      rules: defineFieldRules(f),
      classes: {
        'col-12 col-md-6':
          f.field.type !== 'CHECKBOX' && f.field.type !== 'RADIO',
        'col-12': f.field.type === 'CHECKBOX' || f.field.type === 'RADIO',
      },
      type: f.field.type as string,
      label: f.field.name,
      filter: defineFieldFilter(f.field),
    }));

  Object.values(fields).forEach((field) => {
    const key = field.key as unknown as keyof T;

    data[key] = null as unknown as T[keyof T];
  });

  return {
    data: data as T,
    fields,
  };
};

const parseResponsibleFieldsFromProcess = (process: ProcessTypes) =>
  parseFieldsFromProcess<PreRegistrationResponsibleField>(
    process,
    {
      relationType: null,
      address: newAddress(),
      useSecondAddress: false,
      secondAddress: newAddress(),
    } as PreRegistrationResponsibleField,
    'RESPONSIBLE'
  );

const parseStudentFieldsFromProcess = (process: ProcessTypes) =>
  parseFieldsFromProcess<PreRegistrationStudentField>(
    process,
    {
      grade: null,
      period: null,
      school: null,
      useSecondSchool: false,
      secondSchool: null,
      secondPeriod: null,
      match: null,
      waitingList: [] as WaitingList[],
    } as PreRegistrationStudentField,
    'STUDENT'
  );

const stageTypeText = (type: string): string => {
  switch (type) {
    case 'REGISTRATION_RENEWAL':
      return 'Rematrícula';

    case 'WAITING_LIST':
      return 'Lista de Espera';

    default:
    case 'REGISTRATION':
      return 'Matrícula';
  }
};

const stageStatusText = (status: string): string => {
  switch (status) {
    case 'NOT_OPEN':
      return 'não iniciada';

    case 'CLOSED':
      return 'encerrada';

    case 'OPEN':
    default:
      return 'em andamento';
  }
};

const preRegistrationStatusText = (status: string): string => {
  switch (status) {
    case 'REJECTED':
      return 'Indeferido';
    case 'ACCEPTED':
      return 'Deferido';
    case 'SUMMONED':
      return 'Em convocação';
    case 'IN_CONFIRMATION':
      return 'Em confirmação';
    case 'WAITING':
    default:
      return 'Em espera';
  }
};

const preRegistrationStatusClass = (status: string): string => {
  switch (status) {
    case 'REJECTED':
      return 'status-red';
    case 'ACCEPTED':
      return 'status-green';
    case 'SUMMONED':
      return 'status-purple';
    case 'IN_CONFIRMATION':
      return 'status-light-orange';
    case 'WAITING':
    default:
      return 'status-yellow';
  }
};

const stageStatusBadge = (status: string): string => {
  switch (status) {
    case 'OPEN':
    case 'ACCEPTED':
      return 'badge-green';
    case 'NOT_OPEN':
    case 'WAITING':
      return 'badge-yellow';
    case 'SUMMONED':
      return 'badge-purple';
    case 'IN_CONFIRMATION':
      return 'badge-light-orange';
    case 'CLOSED':
    case 'REJECTED':
    default:
      return 'badge-red';
  }
};

const stageCardDisabled = (status: string): boolean => status !== 'OPEN';

const fieldGroups = (): Option[] => [
  {
    key: 'RESPONSIBLE',
    label: 'Responsável',
  },
  {
    key: 'STUDENT',
    label: 'Aluno',
  },
];

const defineMatchQueryAndVariables = (
  type: string,
  student: Student,
  year: number
) => {
  switch (type) {
    case 'CPF':
      return {
        variables: {
          cpf: student.student_cpf?.replace(/[^\d]/g, '').trimStart(),
          year: year - 1,
        },
        query: `
          query match(
            $cpf: String!
            $year: Int!
          ) {
            match: matchByStudentCpf(
              cpf: $cpf
              year: $year
            ) {
              id
              school
              grade
              initials
              dateOfBirth
            }
          }
        `,
      };
    case 'RG':
      return {
        variables: {
          rg: student.student_rg,
          year: year - 1,
        },
        query: `
          query match(
            $rg: String!
            $year: Int!
          ) {
            match: matchByStudentRg(
              rg: $rg
              year: $year
            ) {
              id
              school
              grade
              initials
              dateOfBirth
            }
          }
        `,
      };
    case 'BIRTH_CERTIFICATE':
      return {
        variables: {
          birthCertificate: student.student_birth_certificate,
          year: year - 1,
        },
        query: `
          query match(
            $birthCertificate: String!
            $year: Int!
          ) {
            match: matchByStudentBirthCertificate(
              birthCertificate: $birthCertificate
              year: $year
            ) {
              id
              school
              grade
              initials
              dateOfBirth
            }
          }
        `,
      };
    default:
    case 'NAME_DATE_OF_BIRTH':
      return {
        variables: {
          name: student.student_name,
          dateOfBirth: student.student_date_of_birth,
          year: year - 1,
        },
        query: `
          query match(
            $name: String!
            $dateOfBirth: Date!
            $year: Int!
          ) {
            match: matchByStudentNameAndDateOfBirth(
              name: $name
              dateOfBirth: $dateOfBirth
              year: $year
            ) {
              id
              school
              grade
              initials
              dateOfBirth
            }
          }
        `,
      };
  }
};

const defineFindProtocolQueryAndVariables = (
  type: string,
  student: Student
) => {
  switch (type) {
    case 'CPF':
      return {
        variables: {
          cpf: student.student_cpf,
        },
        query: `
          query findProtocol(
            $cpf: String!
          ) {
            preregistrations: findPreRegistrationsByStudentCpf(
              cpf: $cpf
            ) {
              id
              protocol
              status
              process {
                schoolYear {
                  year
                }
              }
              student {
                initials
                dateOfBirth
              }
            }
          }
        `,
      };
    case 'RG':
      return {
        variables: {
          rg: student.student_rg,
        },
        query: `
          query findProtocol(
            $rg: String!
          ) {
            preregistrations: findPreRegistrationsByStudentRg(
              rg: $rg
            ) {
              id
              protocol
              status
              process {
                schoolYear {
                  year
                }
              }
              student {
                initials
                dateOfBirth
              }
            }
          }
        `,
      };
    case 'BIRTH_CERTIFICATE':
      return {
        variables: {
          birthCertificate: student.student_birth_certificate,
        },
        query: `
          query findProtocol(
            $birthCertificate: String!
          ) {
            preregistrations: findPreRegistrationsByStudentBirthCertificate(
              birthCertificate: $birthCertificate
            ) {
              id
              protocol
              status
              process {
                schoolYear {
                  year
                }
              }
              student {
                initials
                dateOfBirth
              }
            }
          }
        `,
      };
    default:
    case 'NAME_DATE_OF_BIRTH':
      return {
        variables: {
          name: student.student_name,
          dateOfBirth: student.student_date_of_birth,
        },
        query: `
          query findProtocol(
            $name: String!
            $dateOfBirth: Date!
          ) {
            preregistrations: findPreRegistrationsByStudentNameAndDateOfBirth(
              name: $name
              dateOfBirth: $dateOfBirth
            ) {
              id
              protocol
              status
              process {
                schoolYear {
                  year
                }
              }
              student {
                initials
                dateOfBirth
              }
            }
          }
        `,
      };
  }
};

const setCookie = (name: string, value: string, expirationDays: number) => {
  const date = new Date();
  date.setTime(date.getTime() + expirationDays * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/`;
};

const getCookie = (name: string): string | undefined => {
  const cookieName = `${name}=`;
  const ccookieDecoded = decodeURIComponent(document.cookie);
  const cookies = ccookieDecoded.split('; ');
  let res;
  cookies.forEach((val) => {
    if (val.indexOf(cookieName) === 0) {
      res = val.substring(cookieName.length);
    }
  });
  return res;
};

export {
  defineFindProtocolQueryAndVariables,
  defineMatchQueryAndVariables,
  fieldGroups,
  fieldTypes,
  genders,
  getGenderOrEmpty,
  joinAddress,
  joinAddressLine1,
  joinAddressLine2,
  joinAddressLine3,
  maritalStatuses,
  markerAddress,
  newAddress,
  newLocationPosition,
  parseResponsibleFieldsFromProcess,
  parseStudentFieldsFromProcess,
  sortPreRegistrations,
  stageCardDisabled,
  stageTypeText,
  stageStatusText,
  stageStatusBadge,
  preRegistrationStatusText,
  preRegistrationStatusClass,
  setCookie,
  getCookie,
  reportsTemplates,
};
