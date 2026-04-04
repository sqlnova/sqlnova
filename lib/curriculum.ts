export const MODULOS = [
  { id: 0, titulo: 'Introducción', icono: '🌐', contexto: 'General', lecciones_total: 7, descripcion: 'Qué es una base de datos' },
  { id: 1, titulo: 'SELECT & Básicos', icono: '🌱', contexto: 'Streaming', lecciones_total: 10, descripcion: 'Tu primera consulta SQL' },
  { id: 2, titulo: 'WHERE & Filtros', icono: '🔍', contexto: 'Recursos humanos', lecciones_total: 10, descripcion: 'Filtrá datos con condiciones' },
  { id: 3, titulo: 'JOINs', icono: '🔗', contexto: 'E-commerce', lecciones_total: 12, descripcion: 'Unir tablas relacionadas' },
  { id: 4, titulo: 'GROUP BY', icono: '📊', contexto: 'Restaurantes', lecciones_total: 10, descripcion: 'Agrupar y resumir datos' },
  { id: 5, titulo: 'Funciones de Agregación', icono: '🔢', contexto: 'Finanzas', lecciones_total: 12, descripcion: 'SUM, MAX, MIN, LEAD y más' },
  { id: 6, titulo: 'Subqueries', icono: '🪆', contexto: 'Hospital', lecciones_total: 10, descripcion: 'Consultas dentro de consultas' },
  { id: 7, titulo: 'CTEs', icono: '🔄', contexto: 'Logística', lecciones_total: 8, descripcion: 'Consultas organizadas' },
  { id: 8, titulo: 'Window Functions', icono: '🪟', contexto: 'Ventas', lecciones_total: 12, descripcion: 'Análisis avanzado' },
  { id: 9, titulo: 'Optimización', icono: '⚡', contexto: 'Redes sociales', lecciones_total: 8, descripcion: 'Queries rápidos y eficientes' },
  { id: 10, titulo: 'Modo Entrevista', icono: '🎯', contexto: 'Mixto', lecciones_total: 20, descripcion: 'Desafíos técnicos reales' },
]

export type Leccion = {
  id: string
  num: number
  titulo: string
  tipo: 'escribir' | 'completar' | 'debugging'
  dificultad: 'principiante' | 'intermedio' | 'avanzado'
  xp: number
  teoria: string
  enunciado: string
  pista: string
  solucion: string
  tabla: string
  template?: string
  blanks?: string[]
  errorQuery?: string
}

export const LECCIONES_M1: Leccion[] = [
  {
    id: '01-01', num: 1, titulo: 'Tu primera consulta', tipo: 'escribir',
    dificultad: 'principiante', xp: 10, tabla: 'peliculas',
    teoria: '<strong>SELECT</strong> es la instrucción que le dice a SQL "quiero ver datos". Siempre va acompañada de <strong>FROM</strong>, que indica de qué tabla traerlos. El asterisco <strong>*</strong> es un atajo que significa "todas las columnas". Pensalo como decirle: <em>"Mostrá todo de esta tabla"</em>.',
    enunciado: 'Trabajás en una plataforma de streaming y necesitás ver el catálogo completo.\n\nTraé todos los datos de todas las películas disponibles en la tabla <strong>peliculas</strong>.',
    pista: 'Usá SELECT * para pedir todas las columnas, y FROM peliculas para indicar la tabla.',
    solucion: 'SELECT * FROM peliculas',
  },
  {
    id: '01-02', num: 2, titulo: 'Elegir columnas específicas', tipo: 'completar',
    dificultad: 'principiante', xp: 10, tabla: 'peliculas',
    teoria: 'En lugar de traer todas las columnas con <strong>*</strong>, podés elegir exactamente cuáles querés ver. Esto es útil cuando la tabla tiene muchas columnas y solo necesitás algunas. Simplemente escribís los nombres de las columnas <strong>separados por coma</strong> después de SELECT.',
    enunciado: 'El equipo de contenido quiere una vista simplificada del catálogo.\n\nTraé solo el <strong>título</strong>, <strong>género</strong> y <strong>calificación</strong> de todas las películas (no el resto de las columnas).',
    pista: 'Escribí los tres nombres de columna separados por comas: titulo, genero, calificacion.',
    solucion: 'SELECT titulo, genero, calificacion FROM peliculas',
    template: 'SELECT ___, ___, ___ FROM peliculas',
    blanks: ['titulo', 'genero', 'calificacion'],
  },
  {
    id: '01-03', num: 3, titulo: 'Renombrar columnas con AS', tipo: 'escribir',
    dificultad: 'principiante', xp: 15, tabla: 'peliculas',
    teoria: 'Si necesitás que una columna aparezca con un nombre diferente en el resultado, usás <strong>AS</strong> para ponerle un alias. Por ejemplo, <code>duracion_min AS duracion</code> hace que la columna se llame "duracion" en el resultado. El alias <strong>no modifica la tabla</strong>, solo cambia cómo se muestra.',
    enunciado: 'La API del frontend espera recibir los campos con nombres más simples.\n\nTraé el <strong>titulo</strong> renombrado como <em>"nombre"</em> y <strong>duracion_min</strong> renombrado como <em>"duracion"</em> de todas las películas.',
    pista: 'Usá el formato: columna AS alias. Por ejemplo: titulo AS nombre, duracion_min AS duracion.',
    solucion: 'SELECT titulo AS nombre, duracion_min AS duracion FROM peliculas',
  },
  {
    id: '01-04', num: 4, titulo: 'Limitar resultados con LIMIT', tipo: 'completar',
    dificultad: 'principiante', xp: 10, tabla: 'peliculas',
    teoria: 'Cuando una tabla tiene miles de registros, traerlos todos es lento e innecesario. <strong>LIMIT</strong> restringe cuántas filas devuelve la consulta. Siempre va al <strong>final</strong> del query. Es muy útil para paginar resultados o hacer pruebas rápidas.',
    enunciado: 'La página de inicio del streaming solo muestra 3 películas destacadas.\n\nTraé todos los datos de las primeras <strong>3 películas</strong> únicamente.',
    pista: 'Agregá LIMIT 3 al final del query, después del FROM.',
    solucion: 'SELECT * FROM peliculas LIMIT 3',
    template: 'SELECT * FROM peliculas ___',
    blanks: ['LIMIT 3'],
  },
  {
    id: '01-05', num: 5, titulo: 'Ordenar con ORDER BY', tipo: 'escribir',
    dificultad: 'principiante', xp: 15, tabla: 'peliculas',
    teoria: 'Por defecto, SQL no garantiza el orden en que devuelve los datos. Para ordenarlos usás <strong>ORDER BY</strong> seguido del nombre de la columna. <strong>ASC</strong> ordena de menor a mayor (A→Z, 1→9) y <strong>DESC</strong> de mayor a menor (Z→A, 9→1). ORDER BY va antes de LIMIT si usás los dos.',
    enunciado: 'Querés mostrar las películas en orden de calidad para la página principal.\n\nTraé el <strong>título</strong> y la <strong>calificación</strong> de todas las películas, ordenadas de <strong>mayor a menor calificación</strong>.',
    pista: 'Usá ORDER BY calificacion DESC para ordenar de mayor a menor.',
    solucion: 'SELECT titulo, calificacion FROM peliculas ORDER BY calificacion DESC',
  },
  {
    id: '01-06', num: 6, titulo: 'Eliminar duplicados con DISTINCT', tipo: 'completar',
    dificultad: 'intermedio', xp: 15, tabla: 'peliculas',
    teoria: 'Si una columna tiene valores repetidos y querés ver solo los valores únicos, usás <strong>DISTINCT</strong> justo después de SELECT. Por ejemplo, si hay 50 películas de Drama, <code>SELECT DISTINCT genero</code> te devuelve "Drama" una sola vez. Es ideal para explorar qué valores existen en una columna.',
    enunciado: 'Necesitás saber qué géneros de películas están disponibles en la plataforma.\n\nTraé la lista de <strong>géneros únicos</strong> de la tabla peliculas, sin repetir ninguno.',
    pista: 'Poné DISTINCT entre SELECT y el nombre de la columna: SELECT DISTINCT genero...',
    solucion: 'SELECT DISTINCT genero FROM peliculas',
    template: 'SELECT ___ genero FROM peliculas',
    blanks: ['DISTINCT'],
  },
  {
    id: '01-07', num: 7, titulo: 'Top N: ORDER BY + LIMIT', tipo: 'escribir',
    dificultad: 'intermedio', xp: 20, tabla: 'peliculas',
    teoria: 'Una de las combinaciones más usadas en SQL es <strong>ORDER BY + LIMIT</strong> para obtener el "Top N". Primero ordenás los datos como necesitás, y después limitás cuántos querés ver. El orden de las cláusulas importa: siempre ORDER BY antes de LIMIT.',
    enunciado: 'El equipo editorial quiere destacar las joyas del catálogo en la home.\n\nTraé el <strong>título</strong> y la <strong>calificación</strong> de las <strong>3 películas mejor calificadas</strong> de toda la plataforma.',
    pista: 'Primero ordená por calificacion DESC (mayor a menor), luego limitá con LIMIT 3.',
    solucion: 'SELECT titulo, calificacion FROM peliculas ORDER BY calificacion DESC LIMIT 3',
  },
  {
    id: '01-08', num: 8, titulo: 'Explorando otra tabla: series', tipo: 'escribir',
    dificultad: 'intermedio', xp: 20, tabla: 'series',
    teoria: 'Lo que aprendiste de SELECT, FROM, ORDER BY y LIMIT funciona exactamente igual en <strong>cualquier tabla</strong> de la base de datos. La estructura del query no cambia, solo cambia el nombre de la tabla y las columnas disponibles.',
    enunciado: 'La plataforma también tiene series. Querés ver su calidad.\n\nTraé el <strong>título</strong>, <strong>temporadas</strong> y <strong>calificación</strong> de todas las series, ordenadas por <strong>calificación de mayor a menor</strong>.',
    pista: 'Usá la tabla series. Las columnas son: titulo, temporadas, calificacion.',
    solucion: 'SELECT titulo, temporadas, calificacion FROM series ORDER BY calificacion DESC',
  },
  {
    id: '01-09', num: 9, titulo: 'Encontrá el error', tipo: 'debugging',
    dificultad: 'intermedio', xp: 20, tabla: 'peliculas',
    teoria: 'Los errores más comunes en SQL son errores tipográficos en las palabras clave: <strong>FORM</strong> en vez de <strong>FROM</strong>, <strong>SELCT</strong> en vez de <strong>SELECT</strong>, etc. Leer el mensaje de error con atención siempre da una pista de dónde está el problema.',
    enunciado: 'Un colega te mandó este query y dice que no funciona. Encontrá el error y corregilo:\n\n<code>SELECT titulo, genero FORM peliculas;</code>',
    pista: '¿Está bien escrita la palabra que indica de dónde vienen los datos? Compará letra por letra.',
    solucion: 'SELECT titulo, genero FROM peliculas',
    errorQuery: 'SELECT titulo, genero FORM peliculas;',
  },
  {
    id: '01-10', num: 10, titulo: 'Desafío final del módulo', tipo: 'escribir',
    dificultad: 'avanzado', xp: 30, tabla: 'peliculas',
    teoria: 'Ya aprendiste todos los elementos básicos: <strong>SELECT</strong> para elegir columnas, <strong>AS</strong> para renombrarlas, <strong>FROM</strong> para la tabla, <strong>ORDER BY</strong> para ordenar y <strong>LIMIT</strong> para limitar. Ahora los combinás todos juntos.',
    enunciado: 'El equipo de marketing quiere un reporte de las películas más largas para una campaña especial.\n\nTraé el <strong>título</strong> renombrado como <em>"pelicula"</em> y <strong>duracion_min</strong> renombrado como <em>"minutos"</em> de las <strong>5 películas más largas</strong>, de mayor a menor duración.',
    pista: 'Necesitás: SELECT con AS, FROM, ORDER BY duracion_min DESC, y LIMIT 5.',
    solucion: 'SELECT titulo AS pelicula, duracion_min AS minutos FROM peliculas ORDER BY duracion_min DESC LIMIT 5',
  },
]

export const LECCIONES_M2: Leccion[] = [
  {
    id: '02-01', num: 1, titulo: 'Filtrar con WHERE', tipo: 'escribir',
    dificultad: 'principiante', xp: 15, tabla: 'empleados',
    teoria: 'Hasta ahora traías todos los registros de una tabla. Con <strong>WHERE</strong> podés filtrar y traer solo los que cumplen una condición. Es como decirle a SQL: "Dame los datos, pero solo los que cumplan esta regla". WHERE siempre va después de FROM.',
    enunciado: 'Trabajás en el área de RRHH de una empresa. Necesitás ver los empleados de un departamento específico.\n\nTraé todos los datos de los empleados que trabajen en el departamento <strong>"Ventas"</strong>.',
    pista: "La sintaxis es: SELECT * FROM empleados WHERE columna = 'valor'. Los textos van entre comillas simples.",
    solucion: "SELECT * FROM empleados WHERE departamento = 'Ventas'",
  },
  {
    id: '02-02', num: 2, titulo: 'Comparar números con WHERE', tipo: 'escribir',
    dificultad: 'principiante', xp: 15, tabla: 'empleados',
    teoria: 'WHERE no solo funciona con textos. También podés comparar números usando operadores: <strong>&gt;</strong> (mayor que), <strong>&lt;</strong> (menor que), <strong>&gt;=</strong> (mayor o igual) y <strong>&lt;=</strong> (menor o igual). Esto es muy útil para filtrar por rangos de valores.',
    enunciado: 'La empresa quiere identificar a los empleados mejor pagados para una revisión salarial.\n\nTraé el <strong>nombre</strong> y <strong>salario</strong> de todos los empleados que ganen más de <strong>$80.000</strong>.',
    pista: 'Usá el operador > después de WHERE: WHERE salario > 80000',
    solucion: 'SELECT nombre, salario FROM empleados WHERE salario > 80000',
  },
  {
    id: '02-03', num: 3, titulo: 'Filtrar por desigualdad con <>', tipo: 'completar',
    dificultad: 'principiante', xp: 15, tabla: 'empleados',
    teoria: 'Para filtrar registros que <strong>no sean iguales</strong> a un valor usás el operador <strong>&lt;&gt;</strong> (o también <strong>!=</strong>). Es el equivalente a "distinto de". Muy útil cuando querés excluir un grupo específico de los resultados.',
    enunciado: 'Hubo un cambio organizacional y necesitás ver todos los empleados <strong>excepto</strong> los de Sistemas.\n\nTraé nombre y departamento de los empleados cuyo departamento sea distinto de <strong>"Sistemas"</strong>.',
    pista: "El operador de distinto en SQL es <> . Ejemplo: WHERE columna <> 'valor'",
    solucion: "SELECT nombre, departamento FROM empleados WHERE departamento <> 'Sistemas'",
    template: "SELECT nombre, departamento FROM empleados WHERE departamento ___ 'Sistemas'",
    blanks: ['<>'],
  },
  {
    id: '02-04', num: 4, titulo: 'Combinar condiciones con AND', tipo: 'escribir',
    dificultad: 'principiante', xp: 20, tabla: 'empleados',
    teoria: 'Podés combinar múltiples condiciones con <strong>AND</strong>. Cuando usás AND, ambas condiciones deben cumplirse al mismo tiempo para que el registro aparezca. Es como decir "quiero los empleados que cumplan esto Y también aquello".',
    enunciado: 'Necesitás encontrar empleados específicos para un proyecto.\n\nTraé el <strong>nombre</strong>, <strong>departamento</strong> y <strong>salario</strong> de los empleados que trabajen en <strong>"Marketing"</strong> Y que ganen más de <strong>$60.000</strong>.',
    pista: "Conectá dos condiciones con AND: WHERE departamento = 'Marketing' AND salario > 60000",
    solucion: "SELECT nombre, departamento, salario FROM empleados WHERE departamento = 'Marketing' AND salario > 60000",
  },
  {
    id: '02-05', num: 5, titulo: 'Ampliar resultados con OR', tipo: 'escribir',
    dificultad: 'principiante', xp: 20, tabla: 'empleados',
    teoria: 'Con <strong>OR</strong> el registro aparece si cumple <strong>al menos una</strong> de las condiciones. Es lo opuesto a AND: no necesitás que se cumplan todas, solo una. Muy útil cuando querés traer datos de varios grupos a la vez.',
    enunciado: 'Necesitás convocar a dos departamentos para una reunión.\n\nTraé el <strong>nombre</strong> y <strong>departamento</strong> de los empleados que trabajen en <strong>"Ventas"</strong> O en <strong>"Marketing"</strong>.',
    pista: "Usá OR entre las dos condiciones: WHERE departamento = 'Ventas' OR departamento = 'Marketing'",
    solucion: "SELECT nombre, departamento FROM empleados WHERE departamento = 'Ventas' OR departamento = 'Marketing'",
  },
  {
    id: '02-06', num: 6, titulo: 'Buscar en una lista con IN', tipo: 'completar',
    dificultad: 'intermedio', xp: 20, tabla: 'empleados',
    teoria: "Cuando querés filtrar por varios valores posibles de una misma columna, en lugar de encadenar muchos OR podés usar <strong>IN</strong>. Es más limpio y fácil de leer. La sintaxis es: <code>WHERE columna IN ('valor1', 'valor2')</code>.",
    enunciado: 'Necesitás ver los empleados de tres departamentos a la vez.\n\nTraé <strong>nombre</strong> y <strong>departamento</strong> de los empleados que pertenezcan a <strong>"Ventas"</strong>, <strong>"Marketing"</strong> o <strong>"Finanzas"</strong>. Usá IN.',
    pista: "La sintaxis de IN es: WHERE departamento IN ('Ventas', 'Marketing', 'Finanzas')",
    solucion: "SELECT nombre, departamento FROM empleados WHERE departamento IN ('Ventas', 'Marketing', 'Finanzas')",
    template: "SELECT nombre, departamento FROM empleados WHERE departamento IN (___)",
    blanks: ["'Ventas', 'Marketing', 'Finanzas'"],
  },
  {
    id: '02-07', num: 7, titulo: 'Buscar texto parcial con LIKE', tipo: 'escribir',
    dificultad: 'intermedio', xp: 20, tabla: 'empleados',
    teoria: "<strong>LIKE</strong> te permite buscar texto que coincida con un patrón. El símbolo <strong>%</strong> actúa como comodín y significa 'cualquier cosa'. Por ejemplo, <code>LIKE 'Ana%'</code> encuentra todo lo que empieza con 'Ana'. <code>LIKE '%García'</code> encuentra todo lo que termina con 'García'.",
    enunciado: 'Querés encontrar empleados cuyo nombre empiece con la letra <strong>"A"</strong>.\n\nTraé el <strong>nombre</strong> y <strong>departamento</strong> de todos los empleados cuyo nombre comience con <strong>"A"</strong>.',
    pista: "Usá LIKE con el comodín % al final: WHERE nombre LIKE 'A%'",
    solucion: "SELECT nombre, departamento FROM empleados WHERE nombre LIKE 'A%'",
  },
  {
    id: '02-08', num: 8, titulo: 'Filtrar valores nulos con IS NULL', tipo: 'escribir',
    dificultad: 'intermedio', xp: 20, tabla: 'empleados',
    teoria: 'En SQL, <strong>NULL</strong> representa la ausencia de valor — no es cero ni vacío, es "desconocido". Para filtrar registros sin valor en una columna usás <strong>IS NULL</strong>. Para los que sí tienen valor usás <strong>IS NOT NULL</strong>. Importante: nunca uses = NULL, siempre IS NULL.',
    enunciado: 'Al revisar la base de empleados encontrás que algunos no tienen teléfono registrado.\n\nTraé el <strong>nombre</strong> y <strong>email</strong> de los empleados que <strong>no tienen teléfono</strong> cargado.',
    pista: 'Para filtrar valores vacíos usá IS NULL, nunca = NULL: WHERE telefono IS NULL',
    solucion: 'SELECT nombre, email FROM empleados WHERE telefono IS NULL',
  },
  {
    id: '02-09', num: 9, titulo: 'Rango de valores con BETWEEN', tipo: 'completar',
    dificultad: 'intermedio', xp: 25, tabla: 'empleados',
    teoria: '<strong>BETWEEN</strong> filtra registros dentro de un rango de valores, incluyendo los extremos. Es equivalente a <code>WHERE salario &gt;= 50000 AND salario &lt;= 80000</code> pero mucho más legible. Funciona con números, fechas y texto.',
    enunciado: 'RRHH necesita identificar la franja salarial media de la empresa.\n\nTraé <strong>nombre</strong> y <strong>salario</strong> de los empleados que ganen entre <strong>$50.000</strong> y <strong>$80.000</strong> (ambos inclusive). Usá BETWEEN.',
    pista: 'La sintaxis es: WHERE salario BETWEEN 50000 AND 80000',
    solucion: 'SELECT nombre, salario FROM empleados WHERE salario BETWEEN 50000 AND 80000',
    template: 'SELECT nombre, salario FROM empleados WHERE salario ___ 50000 AND 80000',
    blanks: ['BETWEEN'],
  },
  {
    id: '02-10', num: 10, titulo: 'Desafío final: combiná todo', tipo: 'escribir',
    dificultad: 'avanzado', xp: 30, tabla: 'empleados',
    teoria: 'En la práctica los filtros reales combinan múltiples condiciones. Podés mezclar AND, OR, IN, LIKE y BETWEEN en un mismo WHERE. Cuando combinás AND y OR, usá <strong>paréntesis</strong> para asegurarte de que las condiciones se evalúen en el orden correcto.',
    enunciado: 'El gerente necesita un reporte específico.\n\nTraé <strong>nombre</strong>, <strong>departamento</strong> y <strong>salario</strong> de los empleados que trabajen en <strong>"Ventas"</strong> o <strong>"Marketing"</strong>, Y que ganen más de <strong>$55.000</strong>. Ordenados por salario de mayor a menor.',
    pista: "Usá paréntesis para el OR: WHERE (departamento = 'Ventas' OR departamento = 'Marketing') AND salario > 55000",
    solucion: "SELECT nombre, departamento, salario FROM empleados WHERE (departamento = 'Ventas' OR departamento = 'Marketing') AND salario > 55000 ORDER BY salario DESC",
  },
]

export const DATASET_SQL = `
CREATE TABLE peliculas(id INTEGER PRIMARY KEY,titulo TEXT,genero TEXT,anio INTEGER,duracion_min INTEGER,calificacion REAL,idioma TEXT,director TEXT);
INSERT INTO peliculas VALUES
(1,'Galaxia Perdida','Ciencia Ficción',2021,142,8.3,'Inglés','Ana Martínez'),
(2,'El Último Tango','Drama',2019,98,7.1,'Español','Carlos Ruiz'),
(3,'Risa Sin Fin','Comedia',2022,88,6.5,'Español','Laura Gómez'),
(4,'Sombras del Pasado','Terror',2020,115,7.8,'Inglés','Mark Johnson'),
(5,'Velocidad Total','Acción',2023,120,7.5,'Inglés','Ana Martínez'),
(6,'Amor en Buenos Aires','Drama',2021,105,8.1,'Español','Sofia Pérez'),
(7,'El Robot y el Mar','Ciencia Ficción',2018,130,9.0,'Inglés','Carlos Ruiz'),
(8,'Noche de Lobos','Terror',2022,95,6.2,'Español','Mark Johnson');

CREATE TABLE series(id INTEGER PRIMARY KEY,titulo TEXT,genero TEXT,temporadas INTEGER,anio_inicio INTEGER,calificacion REAL,en_emision INTEGER,idioma TEXT);
INSERT INTO series VALUES
(1,'El Imperio Caído','Drama',4,2018,9.2,0,'Inglés'),
(2,'Detectives del Sur','Crimen',2,2022,8.0,1,'Español'),
(3,'Futuros Posibles','Ciencia Ficción',3,2020,7.6,1,'Inglés'),
(4,'La Cocinera','Comedia',1,2023,7.1,1,'Español'),
(5,'Mentes Oscuras','Crimen',5,2016,8.8,0,'Inglés');

CREATE TABLE empleados(id INTEGER PRIMARY KEY,nombre TEXT,departamento TEXT,salario REAL,email TEXT,telefono TEXT,fecha_ingreso TEXT);
INSERT INTO empleados VALUES
(1,'Ana García','Ventas',72000,'ana@empresa.com','1145678901','2021-03-15'),
(2,'Luis Pérez','Sistemas',95000,'luis@empresa.com','1167890123','2019-07-01'),
(3,'María López','Marketing',68000,'maria@empresa.com',NULL,'2022-01-10'),
(4,'Carlos Ruiz','Finanzas',85000,'carlos@empresa.com','1134567890','2020-05-20'),
(5,'Sofía Torres','Ventas',61000,'sofia@empresa.com','1156789012','2023-02-01'),
(6,'Diego Martín','Marketing',59000,'diego@empresa.com',NULL,'2022-08-15'),
(7,'Laura Sánchez','Sistemas',102000,'laura@empresa.com','1178901234','2018-11-30'),
(8,'Andrés Gómez','Finanzas',77000,'andres@empresa.com','1190123456','2021-09-05'),
(9,'Valentina Cruz','Ventas',88000,'valentina@empresa.com','1112345678','2020-03-22'),
(10,'Martín Díaz','Sistemas',91000,'martin@empresa.com','1123456789','2019-01-14'),
(11,'Camila Fernández','Marketing',63000,'camila@empresa.com',NULL,'2023-05-08'),
(12,'Roberto Jiménez','Finanzas',54000,'roberto@empresa.com','1145670987','2022-11-20');
`

export const INTRO_SLIDES = [
  {
    id: '00-01',
    titulo: '¿Qué es una base de datos?',
    subtitulo: 'Una base de datos es como una libreta organizada donde guardás información. En vez de papel, todo queda en la computadora y podés encontrarlo al instante.',
    tipo: 'svg' as const,
  },
  {
    id: '00-02',
    titulo: '¿Para qué sirve?',
    subtitulo: 'Casi toda aplicación que usás tiene una base de datos por detrás. Sin bases de datos no existirían las redes sociales, los comercios online ni las apps de banco.',
    tipo: 'apps' as const,
  },
  {
    id: '00-03',
    titulo: 'Tablas — la estructura básica',
    subtitulo: 'Una base de datos se divide en tablas. Cada tabla guarda un tipo de información. Una tienda tiene tabla de clientes, de productos y de pedidos.',
    tipo: 'tabla' as const,
    hlCols: false, hlRow: -1,
  },
  {
    id: '00-04',
    titulo: 'Las columnas',
    subtitulo: 'Las columnas definen qué tipo de información se guarda. Son como las preguntas de un formulario: nombre, edad, ciudad.',
    tipo: 'tabla' as const,
    hlCols: true, hlRow: -1,
  },
  {
    id: '00-05',
    titulo: 'Las filas',
    subtitulo: 'Cada fila es un registro completo: una persona, un producto, un pedido. La primera fila nos dice todo sobre Ana.',
    tipo: 'tabla' as const,
    hlCols: false, hlRow: 0,
  },
  {
    id: '00-06',
    titulo: 'Columnas + Filas = Tabla',
    subtitulo: 'Una tabla combina columnas (qué tipo de dato) y filas (cada registro). Es como una planilla de Excel, pero mucho más potente.',
    tipo: 'tabla' as const,
    hlCols: true, hlRow: 0,
  },
  {
    id: '00-07',
    titulo: '¡Listo para empezar!',
    subtitulo: 'Ya sabés los conceptos base. Una base de datos tiene tablas, las tablas tienen columnas y filas. En el Módulo 1 vas a aprender a consultar esos datos con SQL.',
    tipo: 'resumen' as const,
  },
]
