import { FindProtocolPreRegistration } from '@/modules/protocol/types';
import { SubmissionHandler } from 'vee-validate';

export type Nullable<T> = T | null;

export type ModelValue = Nullable<
  string | string[] | boolean | number | number[]
>;

export type ID<T = string> = {
  id: T;
};

export interface IdName<T = string> {
  id: T;
  name: string;
}

export interface Indexable {
  [key: string]: Record<string, unknown>;
}

export interface Rules {
  [key: string]: string | boolean | number;
}

export interface Student {
  id?: string;
  name?: string;
  ['student_cpf']?: Nullable<string>;
  ['student_rg']?: Nullable<string>;
  ['student_birth_certificate']?: Nullable<string>;
  ['student_name']?: Nullable<string>;
  ['student_date_of_birth']?: Nullable<string>;
  preregistrations?: FindProtocolPreRegistration[];
}

export interface Option {
  key: Nullable<string | number>;
  label: string;
  subLabel?: string;
}

export interface Field {
  id: string;
  type: string;
  required: boolean;
  field: Field;
  internal: string;
  options: Option[];
  group: string;
  name: string;
}

export interface Address {
  postalCode: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  stateAbbreviation: string;
  cityIbgeCode: number;
  lat?: number;
  lng?: number;
  manualChangeLocation: boolean;
}

export interface AddressPosition {
  secondAddress: boolean;
  lat: Nullable<number>;
  lng: Nullable<number>;
}

export interface Vacancy {
  grade: string;
  period: string;
  process: string;
  school: string;
}

export interface Stages {
  endAt: string;
  id: string;
  name: string;
  startAt: string;
  status: string;
  type: string;
}

export interface SchoolYear {
  year: number;
}

export interface Grades {
  id: number;
  name: string;
  label?: string;
  key?: number;
}

export interface Period {
  id: number;
  name: string;
  label?: string;
  key?: number;
}

export interface Processes {
  id: string;
  name: string;
  schoolYear: SchoolYear;
  stages: Stages[];
  grades: Grades[];
  startAt?: string;
  showWaitingList: boolean;
  criteria: string;
}

export interface FormField {
  label: string;
  description: string;
  subLabel?: string;
  bind?: Indexable;
  mask?: string;
  searchable?: boolean;
  name: string;
  type: string;
  value?: Record<string, unknown>;
  options?: Option[];
  containerClass: string;
  disabled?: boolean;
  rules?: string;
}

export interface FormButton {
  type: string;
  label: string;
  class: string;
  containerClass: string;
  block?: boolean;
  action?: () => void;
  outline?: boolean;
  noCaps?: boolean;
  noWrap?: boolean;
  bind?: Record<string, unknown>;
}

export interface FormSchema {
  fields: FormField[];
  buttons: FormButton[];
  buttonsContainer: {
    class: string;
  };
}

export interface ClassroomPeriod {
  id: string;
  name: string;
}

export interface Classroom {
  id: string;
  key: string;
  label: string;
  period: ClassroomPeriod;
  available?: boolean;
}

export interface School {
  id: string;
  lat: number;
  lng: number;
}

export interface VacancyFilter {
  school: Nullable<string>;
  period: Nullable<string>;
  grade: Nullable<string>;
  year: Nullable<number>;
}

export interface ProcessesVacancy {
  id: string;
  vacancies: number;
  accepted: number;
  rejected: number;
  total: number;
  waiting: number;
  max: number;
  totalExceded: number;
  waitingAvailable: number;
  waitingExceded: number;
  maxWaiting: number;
  available: number;
  process: {
    id: string;
    name: string;
  };
}

export interface Process {
  id: string;
  fields: Field[];
  stages: Stages[];
  grades: Grades[];
}

export interface VacancyVariables {
  schools?: string[];
  schoolsAllowed?: string[];
  grades?: string[];
  periods?: string[];
  year?: number;
}

export type HandleSubmit = (
  evt: Event | SubmissionHandler,
  onSubmit?: SubmissionHandler
) => Promise<unknown>;

export interface PaginatorInfo {
  count: number;
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

export interface GoogleMapsMarker {
  id: string | number;
  title: string;
  name?: string;
  label?: string;
  phone?: string;
  area_code?: number;
  position: Nullable<{ lat: number; lng: number }>;
  lat?: number | null;
  lng?: number | null;
  config?: Record<string, unknown>;
}
export interface ErrorResponse {
  message: string;
  extensions?: {
    message: string;
  };
}

export interface LatLng {
  lat: Nullable<number>;
  lng: Nullable<number>;
}

export enum AccessLevel {
  admin = 1,
  institutional = 2,
  school = 4,
  library = 8,
}
