/**
 * Opciones del selector de registro (móvil). Carreras de la UNSA presentes
 * en la feria + "Otra carrera (especificar)".
 */
export const CAREER_OTHER = "Otra carrera (especificar)";

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

export const CAREERS = [...UNSA_CAREERS, CAREER_OTHER] as const;

export type Career = (typeof CAREERS)[number];

/** Año cursado actual. */
export const STUDY_YEARS = ["1°", "2°", "3°", "4°", "5°", "Otro / avanzado"] as const;

export type StudyYear = (typeof STUDY_YEARS)[number];
