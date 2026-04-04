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
