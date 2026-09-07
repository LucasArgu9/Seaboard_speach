-- ============================================================================
--  DESAFÍO SEABOARD · sincronizar el banco de preguntas en Supabase
--  Generado desde questions.json. Idempotente: se puede correr varias veces.
--  Pegar completo en:  Supabase -> SQL Editor -> New query -> Run
-- ============================================================================
--  Posición de la respuesta correcta tras intercalar:
--   q01: correcta en A
--   q02: correcta en B
--   q03: correcta en C
--   q04: correcta en D
--   q05: correcta en A
--   q06: correcta en B
--   q07: correcta en C
--   q08: correcta en D
--   q09: correcta en A
--   q10: correcta en B
--   q11: correcta en C
--   q12: correcta en D
--   q13: correcta en A
--   q14: correcta en B
--   q15: correcta en C
--   q16: correcta en D
--   q17: correcta en A
--   q18: correcta en B
--   q19: correcta en C
--   q20: correcta en D
--   q21: correcta en A
--   q22: correcta en B
--   q23: correcta en C
--   q24: correcta en D
--   q25: correcta en A
--   q26: correcta en B
--   q27: correcta en C
--   q28: correcta en D
--   q29: correcta en A
--   q30: correcta en B
--   q31: correcta en C
--   q32: correcta en D
--   q33: correcta en A
--   q34: correcta en B
--   q35: correcta en C
--   q36: correcta en D
--   q37: correcta en A
--   q38: correcta en B
--   q39: correcta en C
--   q40: correcta en D
-- ============================================================================

begin;

-- 1) Preguntas: enunciado, dificultad, referencia y opción correcta ---------
update public.questions q set
  prompt            = v.prompt,
  difficulty        = v.difficulty,
  reference         = v.reference,
  correct_option_id = v.correct
from (values
  ('q01', '¿Cuántos años de historia tiene Seaboard en la zona?', 'facil', '«tenemos más de 100 años de historia en la zona»', 'q01a'),
  ('q02', '¿Qué produce Seaboard a partir de la caña de azúcar?', 'facil', '«Nos dedicamos a producir azúcar, bioetanol y también energía renovables todo a partir de la Caña de Azúcar»', 'q02a'),
  ('q03', '¿En qué departamento está ubicada Seaboard?', 'facil', '«estamos ubicados en el departamento Orán»', 'q03a'),
  ('q04', 'Seaboard es uno de los principales empleadores privados de...', 'facil', '«Hoy somos el principal empleador privado de Salta»', 'q04a'),
  ('q05', '¿A cuántas personas da trabajo Seaboard de manera directa e indirecta?', 'facil', '«damos trabajo a mas de 3000 personas de manera directa e indirecta»', 'q05a'),
  ('q06', 'El empleo que genera Seaboard es...', 'media', '«damos trabajo a mas de 3000 personas de manera directa e indirecta»', 'q06a'),
  ('q07', '¿Qué tres cosas combina Seaboard según su presentación?', 'media', '«mezclamos lo mejor de tres cosas: la tradición... la tecnología... y la sostenibilidad»', 'q07a'),
  ('q08', '¿A partir de qué materia prima produce Seaboard?', 'facil', '«todo a partir de la Caña de Azúcar»', 'q08a'),
  ('q09', '¿Con qué busca ser responsable Seaboard?', 'facil', '«buscamos que todo lo que hacemos sea responsable con el ambiente y con la comunidad»', 'q09a'),
  ('q10', '¿En qué innova Seaboard con tecnología?', 'media', '«la tecnología con la que innovamos en bioetanol y energías renovables»', 'q10a'),
  ('q11', '¿Cada cuánto capacita Seaboard a sus equipos?', 'facil', '«tenemos programas de formación, capacitaciones permanentes»', 'q11a'),
  ('q12', '¿Cuántas horas de entrenamiento da Seaboard cada año?', 'media', '«cada año damos miles de horas de entrenamiento a nuestros equipos»', 'q12a'),
  ('q13', '¿Seaboard tiene programas de pasantías?', 'facil', '«Sí, tenemos programas de pasantías en distintas áreas»', 'q13a'),
  ('q14', 'Si a un pasante le va bien, ¿qué puede pasar?', 'media', '«si les va bien, poder proyectar su carrera dentro de la empresa»', 'q14a'),
  ('q15', '¿Hace falta experiencia previa para trabajar en Seaboard?', 'facil', '«No. Valoramos mucho la experiencia, pero también apostamos al talento joven»', 'q15a'),
  ('q16', '¿Qué permiten los programas de formación de Seaboard?', 'media', '«programas de formación y capacitaciones que te permiten aprender desde cero y crecer paso a paso»', 'q16a'),
  ('q17', '¿Cuál es uno de los beneficios de trabajar en Seaboard?', 'facil', '«ofrecemos capacitaciones permanentes, oportunidades de desarrollo real y estabilidad laboral»', 'q17a'),
  ('q18', 'Además de la experiencia profesional, Seaboard ofrece...', 'media', '«ofrecemos capacitaciones permanentes, oportunidades de desarrollo real y estabilidad laboral»', 'q18a'),
  ('q19', 'El trabajo en Seaboard tiene impacto en...', 'media', '«el trabajo tiene impacto en la comunidad y en el medio ambiente»', 'q19a'),
  ('q20', '¿Cómo es la vida en Orán según la presentación?', 'facil', '«Orán es una ciudad en donde la vida tranquila»', 'q20a'),
  ('q21', '¿Qué estilo tiene el pueblo del complejo agroindustrial?', 'media', '«el pueblo tiene un estilo colonial que te sorprendería»', 'q21a'),
  ('q22', '¿Qué actividades ofrece el club deportivo de Seaboard?', 'media', '«un club con un montón de actividades (gym, tenis, vóley, basquet, funcional, zumba, natación y uno de los mejores campos de golf de la región)»', 'q22a'),
  ('q23', '¿Por qué se destaca el campo de golf del complejo?', 'media', '«uno de los mejores campos de golf de la región»', 'q23a'),
  ('q24', '¿Qué servicios hay dentro del complejo?', 'media', '«además de tener un super dentro, servicio medico, cajeros automáticos y restoran»', 'q24a'),
  ('q25', '¿Se puede crecer dentro de Seaboard?', 'facil', '«Tenemos casos de gente que empezó como pasante y hoy ocupa cargos importantes»', 'q25a'),
  ('q26', '¿A qué le apuesta la empresa para cubrir sus cargos?', 'media', '«La empresa apuesta al desarrollo interno y hay muchas oportunidades para quienes se esfuerzan»', 'q26a'),
  ('q27', '¿Cómo puede postularse un estudiante a Seaboard?', 'facil', '«Podés escanear el código QR... Enviar tu CV a Empleos@seaboard.com.ar o dejar tu CV con nosotros»', 'q27a'),
  ('q28', '¿A qué correo se puede enviar el CV?', 'media', '«Enviar tu CV a Empleos@seaboard.com.ar»', 'q28a'),
  ('q29', 'Si dejás tu CV en el stand, ¿para qué te tienen en cuenta?', 'media', '«Te vamos a tener en cuenta para las búsquedas activas y para programas de pasantías o formación»', 'q29a'),
  ('q30', '¿Con qué área de Seaboard se vincula Abogacía?', 'media', 'Cuadro Carreras y Áreas de Seaboard: Abogacía → Área Legal', 'q30a'),
  ('q31', '¿Cuál de estas carreras puede vincularse con Fábrica de Azúcar, Molienda o Destilería?', 'media', 'Cuadro: Ing. Industrial → Fábrica de azúcar, Molienda, Destilería, Depósito, Mantenimiento, Centro de Control Agrícola', 'q31a'),
  ('q32', 'La Ingeniería en Informática se vincula con áreas como...', 'media', 'Cuadro: Ing. en Informática → Aplicaciones, Redes, Base de Datos, Service Desk, Soporte Técnico, Infraestructura IT', 'q32a'),
  ('q33', '¿Qué carrera se vincula con el área MASH (Medio Ambiente, Seguridad e Higiene)?', 'media', 'Cuadro Carreras y Áreas de Seaboard: el área MASH (Medio Ambiente, Seguridad e Higiene) se vincula con perfiles ambientales.', 'q33a'),
  ('q34', 'Contador Público y Administración de Empresas se vinculan con...', 'media', 'Cuadro: Contador Público / Administración de Empresas → Contraloría, Finanzas, Administración, RRHH', 'q34a'),
  ('q35', '¿Qué carrera se puede vincular con Recursos Humanos (selección, desarrollo y bienestar laboral)?', 'media', 'Cuadro Carreras y Áreas de Seaboard: Recursos Humanos (selección, desarrollo, bienestar laboral).', 'q35a'),
  ('q36', 'El Área Comercial de Seaboard se ocupa de exportar...', 'media', 'Cuadro Áreas de Seaboard: Área Comercial → exportaciones de azúcar, alcohol y bioetanol.', 'q36a'),
  ('q37', '¿Qué carrera se vincula con Intendencia, Infraestructura y Proyectos Hídricos?', 'media', 'Cuadro: Ing. Civil → Intendencia, Infraestructura, Proyectos Hídricos, Mantenimiento', 'q37a'),
  ('q38', '¿Qué carrera se vincula con las áreas de campo (Control Agrícola, Cultivo, Cosecha y Gestión Agrícola)?', 'media', 'Cuadro Carreras y Áreas de Seaboard: áreas de campo (Control Agrícola, Centro de Operaciones, Cultivo, Gestión Agrícola, Herbicidas y Cosecha).', 'q38a'),
  ('q39', '¿Qué carrera se vincula con Cogeneración, Calderas y el Centro de Operaciones Integradas (COI)?', 'media', 'Cuadro: Lic. en Gestión Eficiente de la Energía → Cogeneración, Calderas, Centro de Operaciones Integradas (COI)', 'q39a'),
  ('q40', 'Según la charla, ¿qué es lo más importante para sumarse a Seaboard?', 'facil', '«lo importante es que tengas ganas de aprender y de crecer»', 'q40a')
) as v(id, prompt, difficulty, reference, correct)
where q.id = v.id;

-- 2) Opciones: texto y posición A/B/C/D (0..3), ya intercaladas ------------
--    Se quita la restricción unique(question_id,"order") mientras se reordena
--    y se vuelve a poner al final (evita choques transitorios).
alter table public.question_options drop constraint if exists question_options_unique_order;

update public.question_options o set
  text    = v.text,
  "order" = v.ord
from (values
  ('q01a', 'Más de 100 años', 0),
  ('q01b', 'Unos 25 años', 1),
  ('q01c', 'Menos de 10 años', 2),
  ('q01d', 'Exactamente 50 años', 3),
  ('q02c', 'Vino y aceite de oliva', 0),
  ('q02a', 'Azúcar, bioetanol y energía', 1),
  ('q02d', 'Papel y cartón', 2),
  ('q02b', 'Solamente azúcar', 3),
  ('q03b', 'Rosario de la Frontera', 0),
  ('q03d', 'General Güemes', 1),
  ('q03a', 'Orán', 2),
  ('q03c', 'Cafayate', 3),
  ('q04b', 'Jujuy', 0),
  ('q04c', 'Tucumán', 1),
  ('q04d', 'Córdoba', 2),
  ('q04a', 'Salta', 3),
  ('q05a', 'Más de 2000 personas', 0),
  ('q05d', 'Más de 50000 personas', 1),
  ('q05c', 'Menos de 100 personas', 2),
  ('q05b', 'Alrededor de 300 personas', 3),
  ('q06d', 'Solo temporal por un mes', 0),
  ('q06a', 'Directo e indirecto', 1),
  ('q06c', 'Solo indirecto', 2),
  ('q06b', 'Solo directo', 3),
  ('q07d', 'Importación, reventa y logística', 0),
  ('q07b', 'Turismo, minería y pesca', 1),
  ('q07a', 'Tradición, tecnología y sostenibilidad', 2),
  ('q07c', 'Moda, música y deporte', 3),
  ('q08b', 'La soja', 0),
  ('q08d', 'La uva', 1),
  ('q08c', 'El maíz', 2),
  ('q08a', 'La caña de azúcar', 3),
  ('q09a', 'Con el ambiente y con la comunidad', 0),
  ('q09c', 'Con nada en particular', 1),
  ('q09d', 'Con otros países únicamente', 2),
  ('q09b', 'Solo con los accionistas', 3),
  ('q10b', 'En videojuegos', 0),
  ('q10a', 'En bioetanol y energías renovables', 1),
  ('q10d', 'En autos eléctricos', 2),
  ('q10c', 'En telefonía celular', 3),
  ('q11d', 'Solo a los gerentes', 0),
  ('q11c', 'Nunca', 1),
  ('q11a', 'De forma permanente', 2),
  ('q11b', 'Una vez cada diez años', 3),
  ('q12d', 'Una hora por persona', 0),
  ('q12b', 'Cinco horas', 1),
  ('q12c', 'Ninguna', 2),
  ('q12a', 'Miles de horas', 3),
  ('q13a', 'Sí, en distintas áreas', 0),
  ('q13b', 'No, nunca tuvo', 1),
  ('q13c', 'Solo en el exterior', 2),
  ('q13d', 'Solo para posgrados', 3),
  ('q14c', 'No vuelve a tener contacto con Seaboard', 0),
  ('q14a', 'Puede proyectar su carrera dentro de la empresa', 1),
  ('q14d', 'Pasa obligatoriamente a otra empresa', 2),
  ('q14b', 'Debe irse apenas termina', 3),
  ('q15c', 'Sí, siempre es obligatoria', 0),
  ('q15b', 'Sí, mínimo 10 años', 1),
  ('q15a', 'No: también apuestan al talento joven', 2),
  ('q15d', 'Sí, y debe ser en el exterior', 3),
  ('q16b', 'Trabajar sin aprender nada nuevo', 0),
  ('q16d', 'Reemplazar por completo a la universidad', 1),
  ('q16c', 'Solo observar sin participar', 2),
  ('q16a', 'Aprender desde cero y crecer paso a paso', 3),
  ('q17a', 'Estabilidad laboral', 0),
  ('q17b', 'Contratos de un solo día', 1),
  ('q17c', 'Trabajar sin sueldo', 2),
  ('q17d', 'Empleo solo en temporada', 3),
  ('q18c', 'Vacaciones de seis meses', 0),
  ('q18a', 'Capacitaciones permanentes y desarrollo real', 1),
  ('q18d', 'Nada más que el sueldo', 2),
  ('q18b', 'Un auto 0 km a cada ingresante', 3),
  ('q19c', 'En nada concreto', 0),
  ('q19d', 'Solo en otros continentes', 1),
  ('q19a', 'La comunidad y el medio ambiente', 2),
  ('q19b', 'Solamente en la bolsa de valores', 3),
  ('q20d', 'Sin ningún servicio', 0),
  ('q20b', 'Muy estresante', 1),
  ('q20c', 'Igual que en una megaciudad', 2),
  ('q20a', 'Tranquila', 3),
  ('q21a', 'Colonial', 0),
  ('q21c', 'Medieval', 1),
  ('q21b', 'Futurista', 2),
  ('q21d', 'Industrial moderno', 3),
  ('q22c', 'Ninguna actividad deportiva', 0),
  ('q22a', 'Gym, tenis, vóley, básquet, natación y golf, entre otras', 1),
  ('q22b', 'Únicamente ajedrez', 2),
  ('q22d', 'Solo esquí', 3),
  ('q23c', 'Está siempre cerrado', 0),
  ('q23b', 'Es el más pequeño del país', 1),
  ('q23a', 'Es uno de los mejores de la región', 2),
  ('q23d', 'No tiene césped', 3),
  ('q24b', 'Solo una oficina administrativa', 0),
  ('q24d', 'Nada, hay que salir del complejo para todo', 1),
  ('q24c', 'Un aeropuerto internacional', 2),
  ('q24a', 'Súper, servicio médico, cajeros automáticos y restorán', 3),
  ('q25a', 'Sí: hay pasantes que hoy ocupan cargos importantes', 0),
  ('q25d', 'Solo con contactos externos', 1),
  ('q25b', 'No, nadie asciende nunca', 2),
  ('q25c', 'Solo si te vas y volvés', 3),
  ('q26c', 'A dejar los cargos vacantes', 0),
  ('q26a', 'Al desarrollo interno', 1),
  ('q26b', 'A traer siempre gente de afuera', 2),
  ('q26d', 'A sortearlos al azar', 3),
  ('q27b', 'Solo presentándose sin CV en la fábrica', 0),
  ('q27c', 'Únicamente por correo postal', 1),
  ('q27a', 'Escaneando el QR, enviando el CV por mail o dejándolo en el stand', 2),
  ('q27d', 'No hay forma de postularse', 3),
  ('q28c', 'cv@universidad.edu', 0),
  ('q28b', 'info@salta.gob.ar', 1),
  ('q28d', 'contacto@caña.com', 2),
  ('q28a', 'Empleos@seaboard.com.ar', 3),
  ('q29a', 'Para búsquedas activas y programas de pasantías o formación', 0),
  ('q29b', 'Para nada, solo lo archivan', 1),
  ('q29c', 'Solo para puestos gerenciales', 2),
  ('q29d', 'Solo para trabajo en el exterior', 3),
  ('q30c', 'Cosecha', 0),
  ('q30a', 'Área Legal', 1),
  ('q30d', 'Calderas', 2),
  ('q30b', 'Molienda', 3),
  ('q31d', 'Lic. en Comercio Internacional', 0),
  ('q31b', 'Abogacía', 1),
  ('q31a', 'Ingeniería Industrial', 2),
  ('q31c', 'Psicología', 3),
  ('q32c', 'Relaciones Laborales', 0),
  ('q32d', 'Proyectos Hídricos', 1),
  ('q32b', 'Cultivo y Cosecha de caña', 2),
  ('q32a', 'Aplicaciones, Redes, Base de Datos, Service Desk y Soporte Técnico', 3),
  ('q33a', 'Ingeniería en Recursos Naturales y Medio Ambiente', 0),
  ('q33c', 'Licenciatura en Enfermería', 1),
  ('q33b', 'Contador Público Nacional', 2),
  ('q33d', 'Ingeniería Química', 3),
  ('q34c', 'Herbicidas y Cosecha', 0),
  ('q34a', 'Contraloría, Finanzas, Administración y Recursos Humanos', 1),
  ('q34d', 'Service Desk y Redes', 2),
  ('q34b', 'Calderas y Cogeneración', 3),
  ('q35c', 'Ingeniería Agronómica', 0),
  ('q35b', 'Ingeniería Electromecánica', 1),
  ('q35a', 'Licenciatura en Administración', 2),
  ('q35d', 'Licenciatura en Enfermería', 3),
  ('q36b', 'Autos y maquinaria', 0),
  ('q36d', 'Ropa y calzado', 1),
  ('q36c', 'Software y videojuegos', 2),
  ('q36a', 'Azúcar, alcohol y bioetanol', 3),
  ('q37a', 'Ingeniería Civil', 0),
  ('q37d', 'Lic. en Recursos Humanos', 1),
  ('q37c', 'Abogacía', 2),
  ('q37b', 'Psicología', 3),
  ('q38b', 'Contador Público Nacional', 0),
  ('q38a', 'Ingeniería Agronómica', 1),
  ('q38c', 'Licenciatura en Enfermería', 2),
  ('q38d', 'Ingeniería Informática / Sistemas', 3),
  ('q39b', 'Arquitectura', 0),
  ('q39d', 'Abogacía', 1),
  ('q39a', 'Lic. en Gestión Eficiente de la Energía', 2),
  ('q39c', 'Contador Público', 3),
  ('q40d', 'Hablar tres idiomas', 0),
  ('q40c', 'Vivir en el exterior', 1),
  ('q40b', 'Tener un título de posgrado', 2),
  ('q40a', 'Tener ganas de aprender y de crecer', 3)
) as v(id, text, ord)
where o.id = v.id;

alter table public.question_options
  add constraint question_options_unique_order unique (question_id, "order");

commit;
