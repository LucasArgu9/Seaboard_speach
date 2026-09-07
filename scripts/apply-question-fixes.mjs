/**
 * Aplica las correcciones del Excel "preguntas_seaboard_answer.xlsx".
 * Uso puntual: node scripts/apply-question-fixes.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const path = "questions.json";
const bank = JSON.parse(readFileSync(path, "utf8"));
const byId = Object.fromEntries(bank.questions.map((q) => [q.id, q]));
const setOpt = (q, id, text) => {
  const o = q.options.find((x) => x.id === id);
  if (o) o.text = text;
};

// --- AMARILLO: solo cambia el texto ---------------------------------------
setOpt(byId.q02, "q02a", "Azúcar, bioetanol y energía");
byId.q04.prompt = "Seaboard es uno de los principales empleadores privados de...";
setOpt(byId.q05, "q05a", "Más de 2000 personas");
byId.q22.prompt = "¿Qué actividades ofrece el club deportivo de Seaboard?";

// --- ROJO: mencionaban carreras fuera de la lista UNSA -> adaptadas ------
Object.assign(byId.q33, {
  prompt: "¿Qué carrera se vincula con el área MASH (Medio Ambiente, Seguridad e Higiene)?",
  options: [
    { id: "q33a", text: "Ingeniería en Recursos Naturales y Medio Ambiente" },
    { id: "q33b", text: "Contador Público Nacional" },
    { id: "q33c", text: "Licenciatura en Enfermería" },
    { id: "q33d", text: "Ingeniería Química" },
  ],
  correctOptionId: "q33a",
  reference: "Cuadro Carreras y Áreas de Seaboard: el área MASH (Medio Ambiente, Seguridad e Higiene) se vincula con perfiles ambientales.",
});

Object.assign(byId.q35, {
  prompt: "¿Qué carrera se puede vincular con Recursos Humanos (selección, desarrollo y bienestar laboral)?",
  options: [
    { id: "q35a", text: "Licenciatura en Administración" },
    { id: "q35b", text: "Ingeniería Electromecánica" },
    { id: "q35c", text: "Ingeniería Agronómica" },
    { id: "q35d", text: "Licenciatura en Enfermería" },
  ],
  correctOptionId: "q35a",
  reference: "Cuadro Carreras y Áreas de Seaboard: Recursos Humanos (selección, desarrollo, bienestar laboral).",
});

Object.assign(byId.q36, {
  prompt: "El Área Comercial de Seaboard se ocupa de exportar...",
  reference: "Cuadro Áreas de Seaboard: Área Comercial → exportaciones de azúcar, alcohol y bioetanol.",
});

Object.assign(byId.q38, {
  prompt: "¿Qué carrera se vincula con las áreas de campo (Control Agrícola, Cultivo, Cosecha y Gestión Agrícola)?",
  options: [
    { id: "q38a", text: "Ingeniería Agronómica" },
    { id: "q38b", text: "Contador Público Nacional" },
    { id: "q38c", text: "Licenciatura en Enfermería" },
    { id: "q38d", text: "Ingeniería Informática / Sistemas" },
  ],
  correctOptionId: "q38a",
  reference: "Cuadro Carreras y Áreas de Seaboard: áreas de campo (Control Agrícola, Centro de Operaciones, Cultivo, Gestión Agrícola, Herbicidas y Cosecha).",
});

// Consistencia: la feria ahora es en UNSA, no UCASAL.
for (const q of bank.questions) {
  if (typeof q.reference === "string") {
    q.reference = q.reference.replace("Carreras UCASAL y Áreas", "Carreras y Áreas");
  }
}

writeFileSync(path, JSON.stringify(bank, null, 2) + "\n", "utf8");
console.log("questions.json actualizado.");
