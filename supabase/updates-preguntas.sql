-- ============================================================================
--  DESAFÍO SEABOARD · sincronizar el banco de preguntas en Supabase
--  Generado desde questions.json (40 preguntas). Idempotente.
--  Pegar completo en:  Supabase -> SQL Editor -> New query -> Run
-- ============================================================================
--  Posición base de la respuesta correcta (en el juego además se mezcla por sala):
--   q01: correcta en A
--   q02: correcta en B
--   q03: correcta en C
--   q04: correcta en D
--   q05: correcta en A
--   q06: correcta en B
--   q08: correcta en D
--   q09: correcta en A
--   q13: correcta en A
--   q14: correcta en B
--   q15: correcta en C
--   q16: correcta en D
--   q17: correcta en A
--   q18: correcta en B
--   q19: correcta en C
--   q21: correcta en A
--   q22: correcta en B
--   q24: correcta en D
--   q25: correcta en A
--   q26: correcta en B
--   q27: correcta en C
--   q30: correcta en B
--   q31: correcta en C
--   q32: correcta en D
--   q34: correcta en B
--   q35: correcta en C
--   q36: correcta en D
--   q37: correcta en A
--   q38: correcta en B
--   q39: correcta en C
--   q40: correcta en D
--   q41: correcta en C
--   q42: correcta en A
--   q43: correcta en D
--   q44: correcta en D
--   q45: correcta en A
--   q46: correcta en D
--   q47: correcta en A
--   q48: correcta en A
--   q49: correcta en A
-- ============================================================================

begin;

-- 1) Quitar las preguntas que ya no están en el banco (sus opciones caen en cascada).
--    Falla si alguna tiene respuestas guardadas: en ese caso vaciar answers antes.
delete from public.questions where id not in ('q01', 'q02', 'q03', 'q04', 'q05', 'q06', 'q08', 'q09', 'q13', 'q14', 'q15', 'q16', 'q17', 'q18', 'q19', 'q21', 'q22', 'q24', 'q25', 'q26', 'q27', 'q30', 'q31', 'q32', 'q34', 'q35', 'q36', 'q37', 'q38', 'q39', 'q40', 'q41', 'q42', 'q43', 'q44', 'q45', 'q46', 'q47', 'q48', 'q49');

-- 2) Insertar o actualizar las preguntas.
insert into public.questions (id, category, difficulty, prompt, reference, correct_option_id, active) values
  ('q01', 'historia', 'facil', '¿Cuántos años de historia tiene Seaboard en la zona?', '«tenemos más de 100 años de historia en la zona»', 'q01a', true),
  ('q02', 'productos', 'facil', '¿Qué produce Seaboard a partir de la caña de azúcar?', '«Nos dedicamos a producir azúcar, bioetanol y también energía renovables todo a partir de la Caña de Azúcar»', 'q02a', true),
  ('q03', 'ubicacion', 'facil', '¿En qué departamento está ubicada Seaboard?', '«estamos ubicados en el departamento Orán»', 'q03a', true),
  ('q04', 'empleo', 'facil', 'Seaboard es uno de los principales empleadores privados de...', '«Hoy somos el principal empleador privado de Salta»', 'q04a', true),
  ('q05', 'empleo', 'facil', '¿A cuántas personas da trabajo Seaboard de manera directa e indirecta?', '«damos trabajo a mas de 3000 personas de manera directa e indirecta»', 'q05a', true),
  ('q06', 'empleo', 'media', 'El empleo que genera Seaboard es...', '«damos trabajo a mas de 3000 personas de manera directa e indirecta»', 'q06a', true),
  ('q08', 'productos', 'facil', '¿A partir de qué materia prima produce Seaboard?', '«todo a partir de la Caña de Azúcar»', 'q08a', true),
  ('q09', 'sostenibilidad', 'facil', '¿Con qué busca ser responsable Seaboard?', '«buscamos que todo lo que hacemos sea responsable con el ambiente y con la comunidad»', 'q09a', true),
  ('q13', 'pasantias', 'facil', '¿Seaboard tiene programas de pasantías?', '«Sí, tenemos programas de pasantías en distintas áreas»', 'q13a', true),
  ('q14', 'pasantias', 'media', 'Si a un pasante le va bien, ¿qué puede pasar?', '«si les va bien, poder proyectar su carrera dentro de la empresa»', 'q14a', true),
  ('q15', 'empleo', 'facil', '¿Hace falta experiencia previa para trabajar en Seaboard?', '«No. Valoramos mucho la experiencia, pero también apostamos al talento joven»', 'q15a', true),
  ('q16', 'capacitacion', 'media', '¿Qué permiten los programas de formación de Seaboard?', '«programas de formación y capacitaciones que te permiten aprender desde cero y crecer paso a paso»', 'q16a', true),
  ('q17', 'beneficios', 'facil', '¿Cuál es uno de los beneficios de trabajar en Seaboard?', '«ofrecemos capacitaciones permanentes, oportunidades de desarrollo real y estabilidad laboral»', 'q17a', true),
  ('q18', 'beneficios', 'media', 'Además de la experiencia profesional, Seaboard ofrece...', '«ofrecemos capacitaciones permanentes, oportunidades de desarrollo real y estabilidad laboral»', 'q18a', true),
  ('q19', 'beneficios', 'media', 'El trabajo en Seaboard tiene impacto en...', '«el trabajo tiene impacto en la comunidad y en el medio ambiente»', 'q19a', true),
  ('q21', 'vida-oran', 'media', '¿Qué estilo tiene el pueblo del complejo agroindustrial?', '«el pueblo tiene un estilo colonial que te sorprendería»', 'q21a', true),
  ('q22', 'vida-oran', 'media', '¿Qué actividades ofrece el club deportivo de Seaboard?', '«un club con un montón de actividades (gym, tenis, vóley, basquet, funcional, zumba, natación y uno de los mejores campos de golf de la región)»', 'q22a', true),
  ('q24', 'vida-oran', 'media', '¿Qué servicios hay dentro del complejo?', '«además de tener un super dentro, servicio medico, cajeros automáticos y restoran»', 'q24a', true),
  ('q25', 'crecimiento', 'facil', '¿Se puede crecer dentro de Seaboard?', '«Tenemos casos de gente que empezó como pasante y hoy ocupa cargos importantes»', 'q25a', true),
  ('q26', 'crecimiento', 'media', '¿A qué le apuesta la empresa para cubrir sus cargos?', '«La empresa apuesta al desarrollo interno y hay muchas oportunidades para quienes se esfuerzan»', 'q26a', true),
  ('q27', 'postulacion', 'facil', '¿Cómo puede postularse un estudiante a Seaboard?', '«Podés escanear el código QR... Enviar tu CV a Empleos@seaboard.com.ar o dejar tu CV con nosotros»', 'q27a', true),
  ('q30', 'carreras-areas', 'media', '¿Con qué área de Seaboard se vincula Abogacía?', 'Cuadro Carreras y Áreas de Seaboard: Abogacía → Área Legal', 'q30a', true),
  ('q31', 'carreras-areas', 'media', '¿Cuál de estas carreras puede vincularse con Fábrica de Azúcar, Molienda o Destilería?', 'Cuadro: Ing. Industrial → Fábrica de azúcar, Molienda, Destilería, Depósito, Mantenimiento, Centro de Control Agrícola', 'q31a', true),
  ('q32', 'carreras-areas', 'media', 'La Ingeniería en Informática se vincula con áreas como...', 'Cuadro: Ing. en Informática → Aplicaciones, Redes, Base de Datos, Service Desk, Soporte Técnico, Infraestructura IT', 'q32a', true),
  ('q34', 'carreras-areas', 'media', 'Contador Público y Administración de Empresas se vinculan con...', 'Cuadro: Contador Público / Administración de Empresas → Contraloría, Finanzas, Administración, RRHH', 'q34a', true),
  ('q35', 'carreras-areas', 'media', '¿Qué carrera se puede vincular con Recursos Humanos (selección, desarrollo y bienestar laboral)?', 'Cuadro Carreras y Áreas de Seaboard: Recursos Humanos (selección, desarrollo, bienestar laboral).', 'q35a', true),
  ('q36', 'carreras-areas', 'media', '¿Qué carrera se puede vincular con el Área Comercial de Seaboard (exportaciones de azúcar, alcohol y bioetanol)?', 'Cuadro Carreras y Áreas de Seaboard: Área Comercial → exportaciones de azúcar, alcohol y bioetanol.', 'q36a', true),
  ('q37', 'carreras-areas', 'media', '¿Qué carrera se vincula con Intendencia, Infraestructura y Proyectos Hídricos?', 'Cuadro: Ing. Civil → Intendencia, Infraestructura, Proyectos Hídricos, Mantenimiento', 'q37a', true),
  ('q38', 'carreras-areas', 'media', '¿Qué carrera se vincula con las áreas de campo (Control Agrícola, Cultivo, Cosecha y Gestión Agrícola)?', 'Cuadro Carreras y Áreas de Seaboard: áreas de campo (Control Agrícola, Centro de Operaciones, Cultivo, Gestión Agrícola, Herbicidas y Cosecha).', 'q38a', true),
  ('q39', 'carreras-areas', 'media', '¿Qué carrera se vincula con Cogeneración, Calderas y el Centro de Operaciones Integradas (COI)?', 'Cuadro: Lic. en Gestión Eficiente de la Energía → Cogeneración, Calderas, Centro de Operaciones Integradas (COI)', 'q39a', true),
  ('q40', 'empleo', 'facil', 'Según la charla, ¿qué es lo más importante para sumarse a Seaboard?', '«lo importante es que tengas ganas de aprender y de crecer»', 'q40a', true),
  ('q41', 'ubicacion', 'facil', '¿En qué localidad se encuentra ubicada la empresa?', 'Speech (vida en El Tabacal/Orán): el complejo agroindustrial está en El Tabacal, departamento Orán.', 'q41a', true),
  ('q42', 'empresa', 'media', 'Seaboard Energías Renovables y Alimentos forma parte de una empresa con presencia internacional llamada:', 'Pregunta incorporada desde «más preguntas.docx»; no figura textual en el speech.', 'q42a', true),
  ('q43', 'productos', 'facil', '¿Cuál de estos productos NO produce Seaboard?', '«Nos dedicamos a producir azúcar, bioetanol y también energía renovables todo a partir de la Caña de Azúcar»', 'q43a', true),
  ('q44', 'carreras-areas', 'facil', '¿Qué área podría encontrarse dentro de una agroindustria como Seaboard?', 'Cuadro Carreras y Áreas de Seaboard (áreas industriales, de RRHH e institucionales). Correcta inferida: el docx no la marca con ✅.', 'q44a', true),
  ('q45', 'historia', 'media', '¿Con qué nombre es reconocida históricamente nuestra empresa en la región?', 'Pregunta incorporada desde «más preguntas.docx»; no figura textual en el speech.', 'q45a', true),
  ('q46', 'carreras-areas', 'facil', '¿Qué profesional podría trabajar en Seaboard?', 'Cuadro Carreras y Áreas de Seaboard: Ing. Industrial, Contador Público y Lic. en Recursos Humanos tienen áreas en Seaboard.', 'q46a', true),
  ('q47', 'empresa', 'facil', '¿Qué característica tiene una empresa agroindustrial como Seaboard?', 'Cuadro Carreras y Áreas de Seaboard: áreas de campo (cultivo, cosecha) y de fábrica (molienda, destilería).', 'q47a', true),
  ('q48', 'empresa', 'facil', 'Seaboard participa principalmente en el sector:', 'Speech: «Nuestro complejo agroindustrial»; produce azúcar, bioetanol y energía a partir de la caña de azúcar.', 'q48a', true),
  ('q49', 'historia', 'facil', '¿Qué distingue a Seaboard dentro de la región?', '«tenemos más de 100 años de historia en la zona»', 'q49a', true)
on conflict (id) do update set
  category          = excluded.category,
  difficulty        = excluded.difficulty,
  prompt            = excluded.prompt,
  reference         = excluded.reference,
  correct_option_id = excluded.correct_option_id,
  active            = excluded.active;

-- 3) Opciones: reemplazo completo (evita choques con unique(question_id,"order")).
delete from public.question_options;
insert into public.question_options (id, question_id, text, "order") values
  ('q01a', 'q01', 'Más de 100 años', 0),
  ('q01b', 'q01', 'Unos 25 años', 1),
  ('q01c', 'q01', 'Menos de 10 años', 2),
  ('q01d', 'q01', 'Exactamente 50 años', 3),
  ('q02d', 'q02', 'Papel y cartón', 0),
  ('q02a', 'q02', 'Azúcar, bioetanol y energía', 1),
  ('q02b', 'q02', 'Solamente azúcar', 2),
  ('q02c', 'q02', 'Vino y aceite de oliva', 3),
  ('q03b', 'q03', 'Rosario de la Frontera', 0),
  ('q03c', 'q03', 'Cafayate', 1),
  ('q03a', 'q03', 'Orán', 2),
  ('q03d', 'q03', 'General Güemes', 3),
  ('q04b', 'q04', 'Jujuy', 0),
  ('q04c', 'q04', 'Tucumán', 1),
  ('q04d', 'q04', 'Córdoba', 2),
  ('q04a', 'q04', 'Salta', 3),
  ('q05a', 'q05', 'Más de 2000 personas', 0),
  ('q05b', 'q05', 'Alrededor de 300 personas', 1),
  ('q05c', 'q05', 'Menos de 100 personas', 2),
  ('q05d', 'q05', 'Más de 50000 personas', 3),
  ('q06b', 'q06', 'Solo directo', 0),
  ('q06a', 'q06', 'Directo e indirecto', 1),
  ('q06c', 'q06', 'Solo indirecto', 2),
  ('q06d', 'q06', 'Solo temporal por un mes', 3),
  ('q08b', 'q08', 'La soja', 0),
  ('q08c', 'q08', 'El maíz', 1),
  ('q08d', 'q08', 'La uva', 2),
  ('q08a', 'q08', 'La caña de azúcar', 3),
  ('q09a', 'q09', 'Con el ambiente y con la comunidad', 0),
  ('q09d', 'q09', 'Con otros países únicamente', 1),
  ('q09b', 'q09', 'Solo con los accionistas', 2),
  ('q09c', 'q09', 'Con nada en particular', 3),
  ('q13a', 'q13', 'Sí, en distintas áreas', 0),
  ('q13b', 'q13', 'No, nunca tuvo', 1),
  ('q13c', 'q13', 'Solo en el exterior', 2),
  ('q13d', 'q13', 'Solo para posgrados', 3),
  ('q14d', 'q14', 'Pasa obligatoriamente a otra empresa', 0),
  ('q14a', 'q14', 'Puede proyectar su carrera dentro de la empresa', 1),
  ('q14b', 'q14', 'Debe irse apenas termina', 2),
  ('q14c', 'q14', 'No vuelve a tener contacto con Seaboard', 3),
  ('q15b', 'q15', 'Sí, mínimo 10 años', 0),
  ('q15c', 'q15', 'Sí, siempre es obligatoria', 1),
  ('q15a', 'q15', 'No: también apuestan al talento joven', 2),
  ('q15d', 'q15', 'Sí, y debe ser en el exterior', 3),
  ('q16b', 'q16', 'Trabajar sin aprender nada nuevo', 0),
  ('q16c', 'q16', 'Solo observar sin participar', 1),
  ('q16d', 'q16', 'Reemplazar por completo a la universidad', 2),
  ('q16a', 'q16', 'Aprender desde cero y crecer paso a paso', 3),
  ('q17a', 'q17', 'Estabilidad laboral', 0),
  ('q17b', 'q17', 'Contratos de un solo día', 1),
  ('q17c', 'q17', 'Trabajar sin sueldo', 2),
  ('q17d', 'q17', 'Empleo solo en temporada', 3),
  ('q18d', 'q18', 'Nada más que el sueldo', 0),
  ('q18a', 'q18', 'Capacitaciones permanentes y desarrollo real', 1),
  ('q18b', 'q18', 'Un auto 0 km a cada ingresante', 2),
  ('q18c', 'q18', 'Vacaciones de seis meses', 3),
  ('q19d', 'q19', 'Solo en otros continentes', 0),
  ('q19b', 'q19', 'Solamente en la bolsa de valores', 1),
  ('q19a', 'q19', 'La comunidad y el medio ambiente', 2),
  ('q19c', 'q19', 'En nada concreto', 3),
  ('q21a', 'q21', 'Colonial', 0),
  ('q21b', 'q21', 'Futurista', 1),
  ('q21c', 'q21', 'Medieval', 2),
  ('q21d', 'q21', 'Industrial moderno', 3),
  ('q22b', 'q22', 'Únicamente ajedrez', 0),
  ('q22a', 'q22', 'Gym, tenis, vóley, básquet, natación y golf, entre otras', 1),
  ('q22c', 'q22', 'Ninguna actividad deportiva', 2),
  ('q22d', 'q22', 'Solo esquí', 3),
  ('q24b', 'q24', 'Solo una oficina administrativa', 0),
  ('q24c', 'q24', 'Un aeropuerto internacional', 1),
  ('q24d', 'q24', 'Nada, hay que salir del complejo para todo', 2),
  ('q24a', 'q24', 'Súper, servicio médico, cajeros automáticos y restorán', 3),
  ('q25a', 'q25', 'Sí: hay pasantes que hoy ocupan cargos importantes', 0),
  ('q25c', 'q25', 'Solo si te vas y volvés', 1),
  ('q25d', 'q25', 'Solo con contactos externos', 2),
  ('q25b', 'q25', 'No, nadie asciende nunca', 3),
  ('q26b', 'q26', 'A traer siempre gente de afuera', 0),
  ('q26a', 'q26', 'Al desarrollo interno', 1),
  ('q26c', 'q26', 'A dejar los cargos vacantes', 2),
  ('q26d', 'q26', 'A sortearlos al azar', 3),
  ('q27b', 'q27', 'Solo presentando CV en la fábrica', 0),
  ('q27c', 'q27', 'Únicamente por correo electrónico', 1),
  ('q27a', 'q27', 'Escaneando el QR, y subiéndolo en una web', 2),
  ('q27d', 'q27', 'No hay forma de postularse', 3),
  ('q30d', 'q30', 'Calderas', 0),
  ('q30a', 'q30', 'Área Legal', 1),
  ('q30b', 'q30', 'Molienda', 2),
  ('q30c', 'q30', 'Cosecha', 3),
  ('q31c', 'q31', 'Psicología', 0),
  ('q31d', 'q31', 'Lic. en Comercio Internacional', 1),
  ('q31a', 'q31', 'Ingeniería Industrial', 2),
  ('q31b', 'q31', 'Abogacía', 3),
  ('q32d', 'q32', 'Proyectos Hídricos', 0),
  ('q32b', 'q32', 'Cultivo y Cosecha de caña', 1),
  ('q32c', 'q32', 'Relaciones Laborales', 2),
  ('q32a', 'q32', 'Aplicaciones, Redes, Base de Datos, Service Desk y Soporte Técnico', 3),
  ('q34d', 'q34', 'Service Desk y Redes', 0),
  ('q34a', 'q34', 'Contraloría, Finanzas, Administración y Recursos Humanos', 1),
  ('q34b', 'q34', 'Calderas y Cogeneración', 2),
  ('q34c', 'q34', 'Herbicidas y Cosecha', 3),
  ('q35c', 'q35', 'Ingeniería Agronómica', 0),
  ('q35b', 'q35', 'Ingeniería Electromecánica', 1),
  ('q35a', 'q35', 'Licenciatura en Administración', 2),
  ('q35d', 'q35', 'Licenciatura en Enfermería', 3),
  ('q36b', 'q36', 'Ingeniería Química', 0),
  ('q36d', 'q36', 'Ingeniería Civil', 1),
  ('q36c', 'q36', 'Licenciatura en Enfermería', 2),
  ('q36a', 'q36', 'Licenciatura en Administración', 3),
  ('q37a', 'q37', 'Arquitectura', 0),
  ('q37b', 'q37', 'Psicología', 1),
  ('q37c', 'q37', 'Abogacía', 2),
  ('q37d', 'q37', 'Lic. en Recursos Humanos', 3),
  ('q38b', 'q38', 'Contador Público Nacional', 0),
  ('q38a', 'q38', 'Administración Agropecuaria', 1),
  ('q38c', 'q38', 'Licenciatura en Enfermería', 2),
  ('q38d', 'q38', 'Ingeniería Informática / Sistemas', 3),
  ('q39b', 'q39', 'Arquitectura', 0),
  ('q39c', 'q39', 'Contador Público', 1),
  ('q39a', 'q39', 'Lic. en Gestión Eficiente de la Energía', 2),
  ('q39d', 'q39', 'Abogacía', 3),
  ('q40b', 'q40', 'Tener un título de posgrado', 0),
  ('q40c', 'q40', 'Vivir en el exterior', 1),
  ('q40d', 'q40', 'Hablar tres idiomas', 2),
  ('q40a', 'q40', 'Tener ganas de aprender y de crecer', 3),
  ('q41b', 'q41', 'Hipólito Yrigoyen', 0),
  ('q41c', 'q41', 'Pichanal', 1),
  ('q41a', 'q41', 'El Tabacal', 2),
  ('q41d', 'q41', 'Colonia Santa Rosa', 3),
  ('q42a', 'q42', 'Seaboard Corporation', 0),
  ('q42b', 'q42', 'Seaboard Global Energy', 1),
  ('q42c', 'q42', 'Tabacal Corporation', 2),
  ('q42d', 'q42', 'Seaboard Industrial Group', 3),
  ('q43b', 'q43', 'Azúcar', 0),
  ('q43c', 'q43', 'Bioetanol', 1),
  ('q43d', 'q43', 'Energía renovable', 2),
  ('q43a', 'q43', 'Papel', 3),
  ('q44b', 'q44', 'Ingeniería', 0),
  ('q44c', 'q44', 'Recursos Humanos', 1),
  ('q44d', 'q44', 'Comunicación', 2),
  ('q44a', 'q44', 'Todas las anteriores', 3),
  ('q45a', 'q45', 'Ingenio y Refinería San Martín del Tabacal', 0),
  ('q45b', 'q45', 'Ingenio Salteño del Norte', 1),
  ('q45c', 'q45', 'Refinería San Ramón', 2),
  ('q45d', 'q45', 'Complejo Industrial Tabacalero', 3),
  ('q46b', 'q46', 'Ingeniero Industrial', 0),
  ('q46c', 'q46', 'Contador Público', 1),
  ('q46d', 'q46', 'Licenciado en Recursos Humanos', 2),
  ('q46a', 'q46', 'Todos los anteriores', 3),
  ('q47a', 'q47', 'Combina actividades agrícolas e industriales', 0),
  ('q47b', 'q47', 'Solo produce materias primas', 1),
  ('q47c', 'q47', 'Solo comercializa productos', 2),
  ('q47d', 'q47', 'Solo presta servicios', 3),
  ('q48a', 'q48', 'Agroindustrial', 0),
  ('q48b', 'q48', 'Minero', 1),
  ('q48c', 'q48', 'Petrolero', 2),
  ('q48d', 'q48', 'Pesquero', 3),
  ('q49a', 'q49', 'Su trayectoria de más de un siglo', 0),
  ('q49b', 'q49', 'Ser una empresa nueva', 1),
  ('q49c', 'q49', 'Dedicarse únicamente al comercio', 2),
  ('q49d', 'q49', 'No tener operaciones industriales', 3);

commit;
