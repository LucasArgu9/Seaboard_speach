/**
 * Opciones del selector de registro (móvil). Carreras del cuadro
 * "Carreras UCASAL y Áreas de Seaboard" del speech + "Otra".
 */
export const CAREERS = [
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
  "Otra",
] as const;

export type Career = (typeof CAREERS)[number];

/** Año cursado actual. */
export const STUDY_YEARS = ["1°", "2°", "3°", "4°", "5°", "Otro / avanzado"] as const;

export type StudyYear = (typeof STUDY_YEARS)[number];
