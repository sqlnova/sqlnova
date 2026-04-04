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
    teoria: '<strong>SELECT</strong> pide datos. <strong>*</strong> significa todas las columnas. <strong>FROM</strong> indica la tabla.',
    enunciado: 'Traé todos los datos de todas las películas disponibles.',
    pista: 'Usá SELECT * FROM peliculas',
    solucion: 'SELECT * FROM peliculas',
  },
  {
    id: '01-02', num: 2, titulo: 'Columnas específicas', tipo: 'completar',
    dificultad: 'principiante', xp: 10, tabla: 'peliculas',
    teoria: 'En vez de <strong>*</strong> podés listar columnas específicas separadas por <strong>comas</strong>.',
    enunciado: 'Traé solo el título, género y calificación de todas las películas.',
    pista: 'Escribí los nombres separados por comas después de SELECT.',
    solucion: 'SELECT titulo, genero, calificacion FROM peliculas',
    template: 'SELECT ___, ___, ___ FROM peliculas',
    blanks: ['titulo', 'genero', 'calificacion'],
  },
  {
    id: '01-03', num: 3, titulo: 'Alias con AS', tipo: 'escribir',
    dificultad: 'principiante', xp: 15, tabla: 'peliculas',
    teoria: '<strong>AS</strong> cambia el nombre que aparece en el resultado.',
    enunciado: "Traé el título como 'nombre' y duracion_min como 'duracion'.",
    pista: 'Escribí columna AS alias. Ej: titulo AS nombre',
    solucion: 'SELECT titulo AS nombre, duracion_min AS duracion FROM peliculas',
  },
  {
    id: '01-04', num: 4, titulo: 'LIMIT', tipo: 'completar',
    dificultad: 'principiante', xp: 10, tabla: 'peliculas',
    teoria: '<strong>LIMIT</strong> restringe la cantidad de filas devueltas.',
    enunciado: 'Traé solo las primeras 3 películas.',
    pista: 'Agregá LIMIT 3 al final.',
    solucion: 'SELECT * FROM peliculas LIMIT 3',
    template: 'SELECT * FROM peliculas ___',
    blanks: ['LIMIT 3'],
  },
  {
    id: '01-05', num: 5, titulo: 'ORDER BY', tipo: 'escribir',
    dificultad: 'principiante', xp: 15, tabla: 'peliculas',
    teoria: '<strong>ORDER BY</strong> ordena los resultados. <strong>DESC</strong> es de mayor a menor.',
    enunciado: 'Traé título y calificación ordenados de mayor a menor calificación.',
    pista: 'ORDER BY calificacion DESC',
    solucion: 'SELECT titulo, calificacion FROM peliculas ORDER BY calificacion DESC',
  },
  {
    id: '01-06', num: 6, titulo: 'DISTINCT', tipo: 'completar',
    dificultad: 'intermedio', xp: 15, tabla: 'peliculas',
    teoria: '<strong>DISTINCT</strong> elimina duplicados del resultado.',
    enunciado: 'Traé la lista de géneros sin repeticiones.',
    pista: 'SELECT DISTINCT genero...',
    solucion: 'SELECT DISTINCT genero FROM peliculas',
    template: 'SELECT ___ genero FROM peliculas',
    blanks: ['DISTINCT'],
  },
  {
    id: '01-07', num: 7, titulo: 'Top N', tipo: 'escribir',
    dificultad: 'intermedio', xp: 20, tabla: 'peliculas',
    teoria: 'Combinando <strong>ORDER BY</strong> y <strong>LIMIT</strong> obtenés el "top N".',
    enunciado: 'Traé el título y calificación de las 3 películas mejor calificadas.',
    pista: 'ORDER BY calificacion DESC LIMIT 3',
    solucion: 'SELECT titulo, calificacion FROM peliculas ORDER BY calificacion DESC LIMIT 3',
  },
  {
    id: '01-08', num: 8, titulo: 'Consultá series', tipo: 'escribir',
    dificultad: 'intermedio', xp: 20, tabla: 'series',
    teoria: 'La estructura <strong>SELECT...FROM...ORDER BY</strong> funciona igual en cualquier tabla.',
    enunciado: 'Traé título, temporadas y calificación de las series, ordenadas por calificación DESC.',
    pista: 'Usá la tabla series con sus columnas.',
    solucion: 'SELECT titulo, temporadas, calificacion FROM series ORDER BY calificacion DESC',
  },
  {
    id: '01-09', num: 9, titulo: 'Encontrá el error', tipo: 'debugging',
    dificultad: 'intermedio', xp: 20, tabla: 'peliculas',
    teoria: 'Los errores más comunes son palabras clave mal escritas.',
    enunciado: 'Este query tiene un error. Encontralo y corregilo:\n\nSELECT titulo, genero FORM peliculas;',
    pista: '¿Está bien escrita la palabra que indica de dónde vienen los datos?',
    solucion: 'SELECT titulo, genero FROM peliculas',
    errorQuery: 'SELECT titulo, genero FORM peliculas;',
  },
  {
    id: '01-10', num: 10, titulo: 'Desafío final', tipo: 'escribir',
    dificultad: 'avanzado', xp: 30, tabla: 'peliculas',
    teoria: 'Combiná <strong>SELECT</strong> con alias, <strong>FROM</strong>, <strong>ORDER BY</strong> y <strong>LIMIT</strong>.',
    enunciado: "Traé el título (como 'pelicula') y duracion_min (como 'minutos') de las 5 películas más largas.",
    pista: 'SELECT titulo AS pelicula, duracion_min AS minutos FROM peliculas ORDER BY duracion_min DESC LIMIT 5',
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
