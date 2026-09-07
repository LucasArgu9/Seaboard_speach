/**
 * Opciones del selector de registro (móvil).
 * El estudiante elige primero la universidad y después la carrera; la lista de
 * carreras depende de la universidad. "Otra" universidad => carrera a texto libre.
 */
export const CAREER_OTHER = "Otra carrera (especificar)";
export const UNIVERSITY_OTHER = "Otra";

/** Carreras UCASAL (cuadro "Carreras y Áreas de Seaboard"). */
export const UCASAL_CAREERS = [
  "Abogacía",
  "Contador Público",
  "Administración de Empresas",
  "Psicología",
  "Higiene y Seguridad",
  "Lic. en Recursos Humanos",
  "Arquitectura",
  "Ingeniería en Informática",
  "Tecnicatura en Seguridad Informática",
  "Lic. en Comercio Internacional",
  "Ingeniería Industrial",
  "Ingeniería Civil",
  "Lic. en Administración Agropecuaria",
  "Lic. en Relaciones Públicas e Institucionales",
  "Lic. en Gestión Eficiente de la Energía",
] as const;

/** Carreras de la UNSA presentes en la feria. */
export const UNSA_CAREERS = [
  "Ingeniería Civil",
  "Ingeniería Industrial",
  "Ingeniería Química",
  "Ingeniería Electromecánica",
  "Ingeniería Agronómica",
  "Ingeniería en Recursos Naturales y Medio Ambiente",
  "Ingeniería Informática / Sistemas",
  "Contador Público Nacional",
  "Licenciatura en Administración",
  "Licenciatura en Enfermería",
] as const;

export const UNIVERSITIES = ["UCASAL", "UNSA", UNIVERSITY_OTHER] as const;
export type University = (typeof UNIVERSITIES)[number];

/** Lista de carreras para cada universidad conocida (sin contar "Otra"). */
export const CAREERS_BY_UNIVERSITY: Record<string, readonly string[]> = {
  UCASAL: UCASAL_CAREERS,
  UNSA: UNSA_CAREERS,
};

/** Todas las carreras conocidas + "Otra" — para validar en el servidor. */
export const ALL_CAREERS = [
  ...new Set<string>([...UCASAL_CAREERS, ...UNSA_CAREERS]),
  CAREER_OTHER,
] as const;

/** Año cursado actual. */
export const STUDY_YEARS = ["1°", "2°", "3°", "4°", "5°", "Otro / avanzado"] as const;

export type StudyYear = (typeof STUDY_YEARS)[number];
