import { Address, ErrorResponse, Nullable, Option, PaginatorInfo, Student } from '@/types';
import {
  Filter,
  GetPreregistrations,
  GetProcess,
  Grade,
  Match,
  Period,
  PreRegistration,
  PreRegistrationList,
  PreRegistrationOverview,
  PreRegistrationStage,
  PreregistrationBatchAccept,
  PreregistrationBatchReject,
  PreregistrationBatchResponse,
  PreregistrationBatchSummon,
  PreregistrationClassroom,
  PreregistrationLoad,
  PreregistrationSubmit,
  PreregistrationSubmitInput,
  Processes,
  School,
  StatProcesses,
} from '@/modules/preregistration/types';
import { Preregistration } from "@/modules/processes/types";
import { graphql } from '@/api';

export const list = (data: {
  id: string,
  code: string,
  load: boolean,
}): Promise<{ stage: PreRegistrationStage, preregistration?: Preregistration }> => {
  const payload = {
    variables: data,
    query: `
      query process(
        $id: ID! 
        $code: String
        $load: Boolean = false
      ) {
        stage: processByStage(id: $id) {
          id
          renewalAtSameSchool
          allowWaitingList
          allowSearch
          radius
          type
          status
          restrictionType
          process {
            id
            name
            messageFooter
            gradeAgeRangeLink
            forceSuggestedGrade
            showPriorityProtocol
            allowResponsibleSelectMapAddress
            blockIncompatibleAgeGroup
            autoRejectByDays
            autoRejectDays
            onePerYear
            waitingListLimit
            minimumAge
            schoolYear {
              year
            }
            grades {
              id
              name
              startBirth
              endBirth
            }
            periods {
              id
              name
            }
            schools {
              id
              name
              latitude
              longitude
            }
            fields {
              id
              order
              field {
                id
                name
                description
                group
                type
                internal
                options {
                  id
                  key: id
                  name
                  label: name
                }
              }
              required
              weight
            }
            vacancies {
              school
              period
              grade
              total
              available
            }
          }
        }
        preregistration: preregistrationByCode(code: $code) @include(if: $load) {
          id
          protocol
          student {
            student_name: name
            student_date_of_birth: dateOfBirth
            student_cpf: cpf
            student_rg: rg
            student_marital_status: maritalStatus
            student_birth_certificate: birthCertificate
            student_gender: gender
            student_email: email
            student_phone: phone
            student_mobile: mobile
          }
          responsible {
            responsible_name: name
            responsible_date_of_birth: dateOfBirth
            responsible_cpf: cpf
            responsible_rg: rg
            responsible_marital_status: maritalStatus
            responsible_gender: gender
            responsible_email: email
            responsible_phone: phone
            responsible_mobile: mobile
          }
        }
      }
    `,
  };

  return graphql<{
    data: {
      data: {
        stage: PreRegistrationStage;
        preregistration: Preregistration;
      };
    };
  }>(payload).then(res => res.data.data);
};

export const postMatch = async (data: {
  stage: PreRegistrationStage;
  student: Student;
}): Promise<Match[]> => {
  const queryAndVariables = {
    variables: {
      stage: data.stage.id,
      cpf: data.student.student_cpf,
      rg: data.student.student_rg,
      birthCertificate: data.student.student_birth_certificate,
      name: data.student.student_name,
      dateOfBirth: data.student.student_date_of_birth,
    },
    query: `
      query matches(
        $stage: ID!
        $name: String
        $dateOfBirth: Date
        $cpf: String
        $rg: String
        $birthCertificate: String
      ) {
        matches: getStudentMatches(
          stage: $stage
          name: $name
          dateOfBirth: $dateOfBirth
          cpf: $cpf
          rg: $rg
          birthCertificate: $birthCertificate
        ) {
          id
          initials
          dateOfBirth
          type
          registration {
            year
            school {
              id
              name
            }
            grade {
              id
              name
            }
          }
        }
      }
    `,
  };

  const res = await graphql<{
    data: {
      data: {
        matches: Match[];
      };
    };
  }>(queryAndVariables);

  return res.data.data.matches;
};

export const post = (data: PreregistrationSubmitInput): Promise<PreregistrationSubmit> => {
  const payload = {
    variables: {
      input: data
    },
    query: `
      mutation NewPreRegistration(
        $input: PreRegistrationInput!
      ) {
        preregistrations: newPreRegistration(
         input: $input
        ) {
          id
          protocol
          code
          type
          date
          position
          school {
            id
            name
            area_code
            phone
          }
          period {
            id
            name
          }
          grade {
            id
            name
          }
        }
      }
    `,
  };

  return graphql<{
    data: {
      errors?: ErrorResponse[];
      data: {
        preregistrations: PreRegistrationOverview[];
      }
    }
  }>(payload)
    .then(res => ({
      errors: res.data.errors,
      preregistrations: res.data.data.preregistrations,
    }));
};

export const postAcceptBatch = (data: {
  ids: number[];
  classroom: number;
}): Promise<PreregistrationBatchAccept> => {
  const payload = {
    variables: data,
    query: `
      mutation acceptPreRegistrations(
        $ids: [ID!]!,
        $classroom: ID!
      ) {
        acceptPreRegistrations(ids: $ids, classroom: $classroom) {
          id
          student {
            name
          }
        }
      }
    `,
  };

  return graphql<{
    data: {
      data: {
        acceptPreRegistrations: PreregistrationBatchResponse[];
      }
      errors?: ErrorResponse[];
    }
  }>(payload)
    .then(res => ({
      errors: res.data.errors,
      acceptPreRegistrations: res.data.data.acceptPreRegistrations,
    }));
};

export const postRejectBatch = (data: {
  ids: string[];
  justification: string;
}): Promise<PreregistrationBatchReject> => {
  const payload = {
    variables: data,
    query: `
      mutation rejectPreRegistrations(
        $ids: [ID!]!
        $justification: String
      ) {
        rejectPreRegistrations(
          ids: $ids
          justification: $justification
        ) {
          id
        }
      }
    `,
  };

  return graphql<{
    data: {
      data: {
        rejectPreRegistrations: PreregistrationBatchResponse[];
      };
      errors?: ErrorResponse[]
    }
  }>(payload)
    .then(res => ({
      errors: res.data.errors,
      rejectPreRegistrations: res.data.data.rejectPreRegistrations,
    }));
};

export const postSummonBatch = (data: {
  ids: string[];
  justification: string;
}): Promise<PreregistrationBatchSummon> => {
  const payload = {
    variables: data,
    query: `
      mutation summonPreRegistrations(
        $ids: [ID!]!
        $justification: String
      ) {
        summonPreRegistrations(
          ids: $ids
          justification: $justification
        ) {
          id
        }
      }
    `,
  };

  return graphql<{
    data: {
      data: {
        summonPreRegistrations: PreregistrationBatchResponse[];
      };
      errors?: ErrorResponse[]
    }
  }>(payload)
    .then(res => ({
      errors: res.data.errors,
      summonPreRegistrations: res.data.data.summonPreRegistrations,
    }));
};

export const getClassroomsByPreregistration = (data: {
  period?: string;
  school: string;
  grade: string;
  year: number;
}): Promise<Option[]> => {
  const payload = {
    variables: data,
    query: `
      query classroomsByPreregistration(
        $school: ID!
        $grade: ID!
        $year: Int!
      ) {
        classrooms: classroomsByPreregistration(
          school: $school
          grade: $grade
          year: $year
          first: 100
        ) {
          data {
            key:id
            label:name
            period {
              name
            }
            available
          }
        }
      }
    `,
  };

  return graphql<{
    data: {
      data: {
        classrooms: {
          data: PreregistrationClassroom[]
        }
      }
    }
  }>(payload)
    .then(res => res.data.data.classrooms.data.map((c) => ({
      key: c.key,
      label: `${c.label}/${c.period.name} (vagas: ${c.available})`,
    })));
};

export const postSendEmail = (data: {
  preregistrations: number[];
  email: string;
}): Promise<boolean> => {
  const payload = {
    variables: data,
    query: `
      mutation sendProtocolsByEmail(
        $preregistrations: [ID!]!
        $email: String!
      ) {
        success: sendProtocolsByEmail(
          preregistrations: $preregistrations
          email: $email
        )
      }
    `,
  };

  return graphql<{
    data: {
      data: {
        success: boolean;
      }
    }
  }>(payload)
    .then(res => res.data.data.success);
};

export const getList = (data: Filter): Promise<PreregistrationLoad> => {
  const payload = {
    variables: data,
    query: `
      query preregistrations(
        $first: Int
        $page: Int
        $search: String
        $process: ID
        $processes: [ID!]
        $school: ID
        $schools: [ID!]
        $grade: ID
        $grades: [ID]
        $period: ID
        $type: PreRegistrationType
        $status: PreRegistrationStatus
        $sort: PreRegistrationSort
        $year: Int
      ) {
        processes(
          year: $year
        ) {
          data {
            id
            vacancies: totalVacancies
            total: totalPreRegistrations
            accepted: totalAcceptedPreRegistrations
            rejected: totalRejectedPreRegistrations
            waiting: totalWaitingPreRegistrations
          }
        }
        preregistrations(
          first: $first
          page: $page
          search: $search
          process: $process
          processes: $processes
          school: $school
          schools: $schools
          grade: $grade
          grades: $grades
          period: $period
          type: $type
          status: $status
          sort: $sort
          year: $year
        ) {
          paginatorInfo {
            count
            currentPage
            lastPage
            perPage
            total
          }
          data {
            id
            type
            protocol
            status
            student {
              name
              initials
            }
            grade {
              name
            }
            period {
              name
            }
            school {
              name
            }
            schoolYear {
              year
            }
            position
            waiting {
              id
              type
              status
              position
              student {
                name
              }
              period {
                name
              }
              school {
                name
              }
              schoolYear {
                year
              }
            }
            parent {
              id
              type
              status
              position
              student {
                name
              }
              period {
                name
              }
              school {
                name
              }
              schoolYear {
                year
              }
            }
          }
        }
      }
    `,
  };

  return graphql<{
    data: {
      data: {
        preregistrations: {
          data: PreRegistrationList[];
          paginatorInfo: PaginatorInfo;
        };
        processes: {
          data: StatProcesses[];
        };
      };
      errors?: string;
    };
  }>(payload)
    .then(res => {
      const stats = res.data.data.processes.data.reduce((p, v) => ({
        vacancies: p.vacancies + v.vacancies,
        total: p.total + v.total,
        accepted: p.accepted + v.accepted,
        rejected: p.rejected + v.rejected,
        waiting: p.waiting + v.waiting,
      }), {
        vacancies: 0,
        total: 0,
        accepted: 0,
        rejected: 0,
        waiting: 0,
      });

      return {
        errors: Boolean(res.data.errors),
        stats,
        preregistrations: res.data.data.preregistrations.data,
        paginator: res.data.data.preregistrations.paginatorInfo,
      };
    });
};

export const getPreregistrations = (data: {
  schools?: string[];
}): Promise<GetPreregistrations> => {
  const payload = {
    variables: data,
    query: `
      query all(
        $schools: [ID!]
      ) {
        grades(first: 100) {
          data {
            id
            name
            key: id
            label: name
          }
        }
        periods(first: 100) {
          data {
            id
            name
          }
        }
        schools(
          first: 200
          schools: $schools
        ) {
          data {
            id
            name
            key: id
            label: name
          }
        }
        processes(first: 100) {
          data {
            id
            name
            key: id
            label: name
            totalPreRegistrations
            schoolYear {
              year
            }
          }
        }
      }
    `,
  };

  return graphql<{
    data: {
      data: {
        grades: {
          data: Grade[];
        };
        periods: {
          data: Period[];
        };
        processes: {
          data: Processes[];
        };
        schools: {
          data: School[];
        }
      }
    }
  }>(payload)
    .then(res => ({
      grades: res.data.data.grades.data,
      periods: res.data.data.periods.data,
      processes: res.data.data.processes.data,
      schools: res.data.data.schools.data,
    }));
};

export const getProcess = (data: {
  id: string;
}): Promise<GetProcess> => {
  const payload = {
    variables: data,
    query: `
      query process($id: ID!) {
        process(id: $id) {
          id
          name
          key: id
          label: name
          totalPreRegistrations
          schoolYear {
            year
          }
          grades {
            id
            name
            key: id
            label: name
          }
          periods {
            id
            name
          }
          schools {
            id
            name
            key: id
            label: name
          }
          fields {
            id
            order
            field {
              id
              name
              group
              type
              options {
                id
                name
                weight
              }
            }
            required
            weight
          }
          criteria
        }
      }
    `,
  };

  return graphql<{
    data: {
      data: {
        process: GetProcess,
      }
    }
  }>(payload)
    .then(res => res.data.data.process);
};

export const postAccept = (data: {
  ids: number[];
  classroom: number;
}): Promise<ErrorResponse[] | undefined> => {
  const payload = {
    variables: data,
    query: `
      mutation acceptPreRegistrations($ids: [ID!]!, $classroom: ID!) {
        acceptPreRegistrations(ids: $ids, classroom: $classroom) {
          id
        }
      }
    `,
  };

  return graphql<{
    data: {
      errors?: ErrorResponse[];
    }
  }>(payload)
    .then(res => res.data.errors);
};

export const postReject = (data: {
  ids: number[];
  justification: string;
}) => {
  const payload = {
    variables: data,
    query: `
      mutation rejectPreRegistrations(
        $ids: [ID!]!
        $justification: String
      ) {
        rejectPreRegistrations(
          ids: $ids
          justification: $justification
        ) {
          id
        }
      }
    `,
  };

  return graphql(payload);
};

export const postReturnToWait = (data: {
  ids: number[];
}) => {
  const payload = {
    variables: data,
    query: `
      mutation returnToWaitPreRegistrations(
        $ids: [ID!]!
      ) {
        returnToWaitPreRegistrations(
          ids: $ids
        ) {
          id
        }
      }
    `,
  };

  return graphql(payload);
};

export const postSummon = (data: {
  ids: number[];
  justification: string;
}) => {
  const payload = {
    variables: data,
    query: `
      mutation summonPreRegistrations(
        $ids: [ID!]!
        $justification: String
      ) {
        summonPreRegistrations(
          ids: $ids
          justification: $justification
        ) {
          id
        }
      }
    `,
  };

  return graphql<{
    data: {
      errors?: ErrorResponse[];
    };
  }>(payload)
    .then(res => res.data.errors);
};

export const listByProtocol = (data: {
  protocol: string;
  withVacancy?: boolean;
}): Promise<PreRegistration> => {
  const payload = {
    variables: data,
    query: `
      query preregistrationByProtocol(
          $protocol: String! 
          $withVacancy: Boolean = false
      ) {
          preregistration: preregistrationByProtocol(
              protocol: $protocol
              withVacancy: $withVacancy
          ) {
          id
          date
          protocol
          status
          type
          observation
          grade {
            id
            name
            course {
              name
            }
          }
          period {
            id
            name
          }
          school {
            id
            name
          }
          classroom {
            id
            name
          }
          position
          waiting {
            id
            protocol
            school {
              id
              name
            }
            position
          }
          parent {
            id
            protocol
            school {
              id
              name
            }
            position
          }
          others {
            id
            protocol
            status
            school {
              id
              name
            }
            position
          }
          student {
            student_name: name
            student_date_of_birth: dateOfBirth
            student_cpf: cpf
            student_rg: rg
            student_marital_status: maritalStatus
            student_place_of_birth: placeOfBirth
            student_city_of_birth: cityOfBirth
            student_birth_certificate: birthCertificate
            student_gender: gender
            student_email: email
            student_phone: phone
            student_mobile: mobile
          }
          responsible {
            responsible_name: name
            responsible_date_of_birth: dateOfBirth
            responsible_cpf: cpf
            responsible_rg: rg
            responsible_marital_status: maritalStatus
            responsible_place_of_birth: placeOfBirth
            responsible_city_of_birth: cityOfBirth
            responsible_gender: gender
            responsible_email: email
            responsible_phone: phone
            responsible_mobile: mobile
            responsible_address: addresses {
              postalCode
              address
              number
              complement
              neighborhood
              city
              manualChangeLocation
              lat
              lng
            }
          }
          relationType
          fields {
            id
            value
            field {
              id
              name
              internal
              group
            }
          }
          process {
            id
            name
            fields {
              id
              order
              field {
                id
                name
                group
                type
                internal
                options {
                  id
                  key: id
                  name
                  label: name
                }
              }
              required
              weight
            }
            schoolYear {
              year
            }
            ...ProcessInfo @include(if: $withVacancy)
          }
          inClassroom {
            id
            name
            period {
              name
            }
          }
          external {
            id
            name
            gender
            dateOfBirth
            cpf
            rg
            birthCertificate
            phone
            mobile
            email
            address
            number
            complement
            neighborhood
            postalCode
          }
        }
      }
      
      fragment ProcessInfo on Process {
        grades {
            id
            name
            startBirth
            endBirth
        }
        periods {
            id
            name
        }
        schools {
            id
            name
            lat: latitude
            lng: longitude
        }
        vacancies {
            school
            period
            grade
            total
            available
        }
      }
    `,
  };

  return graphql<{
    data: {
      data: {
        preregistration: PreRegistration;
      }
    }
  }>(payload)
    .then(res => res.data.data.preregistration)
    .catch((error) => {
      const recuperada = error?.response?.data?.data?.preregistration;

      if (recuperada?.id) {
        return recuperada;
      }

      throw error;
    });
};

export const updateStudentInExternalSystem = (data: {
  preregistration: number,
  cpf: boolean,
  rg: boolean,
  birthCertificate: boolean,
  name: boolean,
  dateOfBirth: boolean,
  gender: boolean,
  phone: boolean,
  mobile: boolean,
  address: boolean,
}): Promise<boolean> => {
  const payload = {
    variables: data,
    query: `
      mutation updateStudentInExternalSystem(
        $preregistration: ID!
        $cpf: Boolean
        $rg: Boolean
        $birthCertificate: Boolean
        $name: Boolean
        $dateOfBirth: Boolean
        $gender: Boolean
        $phone: Boolean
        $mobile: Boolean
        $address: Boolean
      ) {
        updateStudentInExternalSystem(
          preregistration: $preregistration
          cpf: $cpf
          rg: $rg
          birthCertificate: $birthCertificate
          name: $name
          dateOfBirth: $dateOfBirth
          gender: $gender
          phone: $phone
          mobile: $mobile
          address: $address
        )
      }
    `,
  };

  return graphql<{
    data: {
      data: {
        updateStudentInExternalSystem: boolean,
      }
    }
  }>(payload)
    .then(res => res.data.data.updateStudentInExternalSystem);
};

export const getNextInLine = (data: {
  process: number|string;
  school: number|string;
  grade: number|string;
  period: number|string;
}): Promise<{ nextInLine: Nullable<{ id: string; protocol: string; }> }> => {
  const payload = {
    variables: data,
    query: `
      query summonNextInLine(
        $process: ID!
        $school: ID!
        $grade: ID!
        $period: ID!
      ) {
        summonNextInLine(
          process: $process
          school: $school
          grade: $grade
          period: $period
        ) {
          id
          protocol
        }
      }
    `,
  };

  return graphql<{
    data: {
      data: {
        summonNextInLine: Nullable<{ id: string; protocol: string; }>
      },
    },
  }>(payload)
    .then(res => ({
      nextInLine: res.data.data.summonNextInLine,
    }));
};

export const updateAddress = (data: {
  protocol: string;
  address: Address;
}): Promise<{ updateAddress: Nullable<{ id: string; protocol: string; }> }> => {
  const payload = {
    variables: data,
    query: `
      mutation updateAddress(
        $protocol: String!
        $address: AddressInput!
      ) {
        updateAddress(
          protocol: $protocol
          address: $address
        ) {
          id
          protocol
        }
      }
    `,
  };

  return graphql<{
    data: {
      data: {
        updateAddress: Nullable<{ id: string; protocol: string; }>
      },
    },
  }>(payload)
    .then(res => ({
      updateAddress: res.data.data.updateAddress,
    }));
};

export const updateResponsible = (data: {
  protocol: string;
  fields: {
    field: string;
    value: Nullable<string>
  }[];
}): Promise<{ updateResponsible: Nullable<{ id: string; protocol: string; }> }> => {
  const payload = {
    variables: data,
    query: `
      mutation updateResponsible(
        $protocol: String!
        $fields: [PreRegistrationFieldInput!]!
      ) {
        updateResponsible(
          protocol: $protocol
          fields: $fields
        ) {
          id
          protocol
        }
      }
    `,
  };

  return graphql<{
    data: {
      data: {
        updateResponsible: Nullable<{ id: string; protocol: string; }>
      },
    },
  }>(payload)
    .then(res => ({
      updateResponsible: res.data.data.updateResponsible,
    }));
};

export const updateStudent = (data: {
  protocol: string;
  fields: {
    field: string;
    value: Nullable<string>
  }[];
}): Promise<{ updateStudent: Nullable<{ id: string; protocol: string; }> }> => {
  const payload = {
    variables: data,
    query: `
      mutation updateStudent(
        $protocol: String!
        $fields: [PreRegistrationFieldInput!]!
      ) {
        updateStudent(
          protocol: $protocol
          fields: $fields
        ) {
          id
          protocol
        }
      }
    `,
  };

  return graphql<{
    data: {
      data: {
        updateStudent: Nullable<{ id: string; protocol: string; }>
      },
    },
  }>(payload)
    .then(res => ({
      updateStudent: res.data.data.updateStudent,
    }));
};

export const updatePreRegistration = (data: {
  protocol: string;
  grade: string;
  period: string;
  school: string;
}): Promise<{ updatePreRegistration: Nullable<{ id: string; }> }> => {

  const payload = {
    variables: data,
    query: `
      mutation updatePreRegistration(
          $protocol: String!
          $grade: ID!
          $school: ID!
          $period: ID!
      ) {
          updatePreRegistration(
              protocol: $protocol
              grade: $grade
              school: $school
              period: $period
          ) {
              protocol
              grade {
                  id
              }
              school {
                  id
              }
              period {
                  id
              }
          }
      }
    `,
  };

  return graphql<{
    data: {
      data: {
        updatePreRegistration: Nullable<{ id: string; }>
      },
    },
  }>(payload)
    .then(res => ({
      updatePreRegistration: res.data.data.updatePreRegistration,
    }));
};

export interface TimelinePayload {
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  [key: string]: unknown;
}

export interface Timeline {
  id: string;
  modelId: number;
  modelType: string;
  type: string;
  payload: TimelinePayload;
  createdAt: Date;
}

export interface TimelineResponse {
  listTimeline: Timeline[];
}

export const listTimeline = (modelId: string, modelType: string): Promise<TimelineResponse>  => {
  const payload = {
    variables: {
      modelId: modelId,
      modelType: modelType,
    },
    query: `
      query getTimelines($modelId: ID!, $modelType: String!) {
        getTimelines(modelId: $modelId, modelType: $modelType) {
          id
          modelId
          modelType
          type
          payload
          createdAt
        }
      }
    `,
  };

  return graphql<{ data: { data: TimelineResponse } }>(payload)
  .then(res => {
    return {
      listTimeline: res.data.data.getTimelines.map((timeline: Timeline) => ({
        ...timeline,
        createdAt: new Date(timeline.createdAt)
      }))
    };
  });
};
