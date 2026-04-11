export const MODULOS = [
  { id: 0, titulo: 'Introducción', icono: '🌐', contexto: 'General', lecciones_total: 8, descripcion: 'Qué es una base de datos' },
  { id: 1, titulo: 'SELECT & Básicos', icono: '🌱', contexto: 'Streaming', lecciones_total: 10, descripcion: 'Tu primera consulta SQL' },
  { id: 2, titulo: 'WHERE & Filtros', icono: '🔍', contexto: 'Recursos humanos', lecciones_total: 10, descripcion: 'Filtrá datos con condiciones' },
  { id: 3, titulo: 'JOINs', icono: '🔗', contexto: 'E-commerce', lecciones_total: 12, descripcion: 'Unir tablas relacionadas' },
  { id: 4, titulo: 'GROUP BY & Agregados', icono: '📊', contexto: 'Restaurantes', lecciones_total: 10, descripcion: 'Agrupar y resumir datos' },
  { id: 5, titulo: 'Funciones de Agregación', icono: '🔢', contexto: 'Finanzas', lecciones_total: 12, descripcion: 'SUM, MAX, MIN, LEAD y más' },
  { id: 6, titulo: 'Subqueries', icono: '🪆', contexto: 'Hospital', lecciones_total: 10, descripcion: 'Consultas dentro de consultas' },
  { id: 7, titulo: 'CTEs', icono: '🔄', contexto: 'Logística', lecciones_total: 8, descripcion: 'Consultas organizadas' },
  { id: 8, titulo: 'Window Functions', icono: '🪟', contexto: 'Ventas', lecciones_total: 12, descripcion: 'Análisis avanzado' },
  { id: 9, titulo: 'Optimización', icono: '⚡', contexto: 'Redes sociales', lecciones_total: 8, descripcion: 'Queries rápidos y eficientes' },
  { id: 10, titulo: 'Modo Entrevista', icono: '🎯', contexto: 'Mixto', lecciones_total: 10, descripcion: 'Desafíos técnicos reales' },
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

// ── GLOSARIO POR MÓDULO ──
export type GlosarioItem = { termino: string; descripcion: string; ejemplo: string }

export const GLOSARIO_M1: GlosarioItem[] = [
  { termino: 'SELECT', descripcion: 'Indica qué columnas querés ver en el resultado.', ejemplo: 'SELECT nombre, email FROM usuarios' },
  { termino: 'FROM', descripcion: 'Indica de qué tabla vienen los datos.', ejemplo: 'SELECT * FROM peliculas' },
  { termino: '*', descripcion: 'Comodín que selecciona todas las columnas de una tabla.', ejemplo: 'SELECT * FROM peliculas' },
  { termino: 'AS', descripcion: 'Asigna un alias (nombre alternativo) a una columna o tabla.', ejemplo: 'SELECT titulo AS nombre FROM peliculas' },
  { termino: 'LIMIT', descripcion: 'Restringe la cantidad de filas devueltas por la consulta.', ejemplo: 'SELECT * FROM peliculas LIMIT 5' },
  { termino: 'ORDER BY', descripcion: 'Ordena los resultados por una columna. ASC = menor a mayor, DESC = mayor a menor.', ejemplo: 'SELECT titulo FROM peliculas ORDER BY calificacion DESC' },
  { termino: 'DISTINCT', descripcion: 'Elimina duplicados del resultado, devolviendo solo valores únicos.', ejemplo: 'SELECT DISTINCT genero FROM peliculas' },
]

export const GLOSARIO_M2: GlosarioItem[] = [
  { termino: 'WHERE', descripcion: 'Filtra filas que cumplen una condición. Va después de FROM.', ejemplo: "SELECT * FROM empleados WHERE departamento = 'Ventas'" },
  { termino: '= / <> / != ', descripcion: 'Operadores de igualdad y desigualdad para comparar valores.', ejemplo: "WHERE departamento <> 'Sistemas'" },
  { termino: '> / < / >= / <=', descripcion: 'Operadores de comparación numérica o de fechas.', ejemplo: 'WHERE salario > 80000' },
  { termino: 'AND', descripcion: 'Combina condiciones: ambas deben cumplirse para que la fila aparezca.', ejemplo: "WHERE departamento = 'Marketing' AND salario > 60000" },
  { termino: 'OR', descripcion: 'Combina condiciones: al menos una debe cumplirse.', ejemplo: "WHERE ciudad = 'Buenos Aires' OR ciudad = 'Córdoba'" },
  { termino: 'IN', descripcion: 'Filtra por múltiples valores posibles de una columna.', ejemplo: "WHERE departamento IN ('Ventas', 'Marketing')" },
  { termino: 'LIKE', descripcion: 'Busca texto con patrones. % = cualquier texto, _ = un caracter.', ejemplo: "WHERE nombre LIKE 'A%'" },
  { termino: 'IS NULL / IS NOT NULL', descripcion: 'Filtra filas donde una columna no tiene valor (o sí tiene).', ejemplo: 'WHERE telefono IS NULL' },
  { termino: 'BETWEEN', descripcion: 'Filtra valores dentro de un rango, incluyendo los extremos.', ejemplo: 'WHERE salario BETWEEN 50000 AND 80000' },
]

export const GLOSARIO_M3: GlosarioItem[] = [
  { termino: 'INNER JOIN', descripcion: 'Combina dos tablas devolviendo solo las filas con coincidencia en ambas.', ejemplo: 'FROM pedidos INNER JOIN clientes ON pedidos.cliente_id = clientes.id' },
  { termino: 'LEFT JOIN', descripcion: 'Devuelve todas las filas de la tabla izquierda, con NULL donde no hay coincidencia.', ejemplo: 'FROM clientes LEFT JOIN pedidos ON clientes.id = pedidos.cliente_id' },
  { termino: 'RIGHT JOIN', descripcion: 'Devuelve todas las filas de la tabla derecha, con NULL donde no hay coincidencia.', ejemplo: 'FROM pedidos RIGHT JOIN productos ON pedidos.producto_id = productos.id' },
  { termino: 'ON', descripcion: 'Define la condición de unión entre dos tablas en un JOIN.', ejemplo: 'INNER JOIN clientes ON pedidos.cliente_id = clientes.id' },
  { termino: 'Alias de tabla', descripcion: 'Nombre corto asignado a una tabla para simplificar el query.', ejemplo: 'FROM pedidos p INNER JOIN clientes c ON p.cliente_id = c.id' },
  { termino: 'Self JOIN', descripcion: 'JOIN de una tabla consigo misma. Requiere alias obligatoriamente.', ejemplo: 'FROM empleados e INNER JOIN empleados j ON e.jefe_id = j.id' },
  { termino: 'Clave primaria', descripcion: 'Columna que identifica únicamente cada fila de una tabla (usualmente id).', ejemplo: 'clientes.id' },
  { termino: 'Clave foránea', descripcion: 'Columna que referencia la clave primaria de otra tabla.', ejemplo: 'pedidos.cliente_id referencia a clientes.id' },
]

export const GLOSARIO_M4: GlosarioItem[] = [
  { termino: 'COUNT()', descripcion: 'Cuenta la cantidad de filas. COUNT(*) cuenta todo, COUNT(col) ignora NULLs.', ejemplo: 'SELECT COUNT(*) FROM pedidos' },
  { termino: 'SUM()', descripcion: 'Suma los valores de una columna numérica, ignorando NULLs.', ejemplo: 'SELECT SUM(importe) FROM pedidos_restaurante' },
  { termino: 'AVG()', descripcion: 'Calcula el promedio de una columna numérica, ignorando NULLs.', ejemplo: 'SELECT AVG(importe) FROM pedidos_restaurante' },
  { termino: 'MAX()', descripcion: 'Devuelve el valor máximo de una columna.', ejemplo: 'SELECT MAX(importe) FROM pedidos_restaurante' },
  { termino: 'MIN()', descripcion: 'Devuelve el valor mínimo de una columna.', ejemplo: 'SELECT MIN(importe) FROM pedidos_restaurante' },
  { termino: 'GROUP BY', descripcion: 'Agrupa filas con el mismo valor en una columna para aplicar funciones de agregación.', ejemplo: 'SELECT mesa, COUNT(*) FROM pedidos GROUP BY mesa' },
  { termino: 'HAVING', descripcion: 'Filtra grupos después del GROUP BY. Equivale al WHERE pero para grupos.', ejemplo: 'GROUP BY mesa HAVING SUM(importe) > 3000' },
  { termino: 'WHERE vs HAVING', descripcion: 'WHERE filtra filas antes de agrupar. HAVING filtra grupos después de agrupar.', ejemplo: 'WHERE turno = noche GROUP BY mesa HAVING SUM(importe) > 2000' },
]

// ── RESÚMENES POR MÓDULO ──
export type ResumenModulo = { titulo: string; puntos: string[]; sintaxis: string }

export const RESUMEN_M1: ResumenModulo = {
  titulo: 'Lo que aprendiste en SELECT & Básicos',
  puntos: [
    'SELECT elige qué columnas ver. * trae todas.',
    'FROM indica de qué tabla vienen los datos.',
    'AS renombra columnas en el resultado (alias).',
    'LIMIT restringe cuántas filas devuelve la consulta.',
    'ORDER BY ordena: ASC (menor a mayor), DESC (mayor a menor).',
    'DISTINCT elimina duplicados del resultado.',
    'Combiná ORDER BY + LIMIT para obtener el "Top N".',
  ],
  sintaxis: 'SELECT col1 AS alias, col2\nFROM tabla\nORDER BY col1 DESC\nLIMIT 5',
}

export const RESUMEN_M2: ResumenModulo = {
  titulo: 'Lo que aprendiste en WHERE & Filtros',
  puntos: [
    'WHERE filtra filas antes de devolver el resultado.',
    'Operadores: = igual, <> distinto, > < >= <= para números.',
    'AND requiere que todas las condiciones se cumplan.',
    'OR requiere que al menos una condición se cumpla.',
    'IN filtra por múltiples valores posibles.',
    'LIKE busca patrones de texto. % = cualquier texto.',
    'IS NULL / IS NOT NULL filtra valores vacíos.',
    'BETWEEN filtra rangos de valores (inclusivo).',
  ],
  sintaxis: "SELECT col1, col2\nFROM tabla\nWHERE col1 = 'valor'\n  AND col2 BETWEEN 100 AND 500\nORDER BY col1",
}

export const RESUMEN_M3: ResumenModulo = {
  titulo: 'Lo que aprendiste en JOINs',
  puntos: [
    'INNER JOIN combina tablas devolviendo solo coincidencias.',
    'LEFT JOIN devuelve todas las filas de la tabla izquierda.',
    'RIGHT JOIN devuelve todas las filas de la tabla derecha.',
    'ON define cómo se relacionan las dos tablas.',
    'Los alias de tabla simplifican los queries largos.',
    'Podés encadenar múltiples JOINs para unir 3+ tablas.',
    'LEFT JOIN + IS NULL encuentra registros sin relación.',
    'Self JOIN une una tabla consigo misma usando alias.',
  ],
  sintaxis: 'SELECT a.col1, b.col2\nFROM tabla_a a\nINNER JOIN tabla_b b\n  ON a.id = b.a_id\nWHERE a.col3 > 100',
}

export const RESUMEN_M4: ResumenModulo = {
  titulo: 'Lo que aprendiste en GROUP BY & Agregados',
  puntos: [
    'COUNT(*) cuenta filas. SUM() suma. AVG() promedia. MAX/MIN son extremos.',
    'GROUP BY agrupa filas con el mismo valor y aplica funciones.',
    'La columna agrupada debe aparecer en el SELECT.',
    'HAVING filtra grupos (como WHERE pero para grupos).',
    'WHERE filtra ANTES de agrupar. HAVING filtra DESPUÉS.',
    'ORDER BY sobre grupos ordena el resultado final.',
    'Orden correcto: SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT',
  ],
  sintaxis: 'SELECT col, SUM(valor) AS total\nFROM tabla\nWHERE condicion\nGROUP BY col\nHAVING SUM(valor) > 1000\nORDER BY total DESC',
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

export const LECCIONES_M3: Leccion[] = [
  { id: '03-01', num: 1, titulo: 'Qué es un JOIN', tipo: 'escribir', dificultad: 'principiante', xp: 20, tabla: 'pedidos',
    teoria: 'Hasta ahora trabajaste con una sola tabla. Con <strong>JOIN</strong> podés combinar datos de dos tablas relacionadas. <strong>INNER JOIN</strong> devuelve solo las filas que tienen coincidencia en ambas tablas. La sintaxis es: <code>FROM tabla1 INNER JOIN tabla2 ON tabla1.id = tabla2.tabla1_id</code>.',
    enunciado: 'Trabajás en el área de datos de un e-commerce. Necesitás ver los pedidos junto con el nombre del cliente que los hizo.\n\nUsá <strong>INNER JOIN</strong> para combinar <strong>pedidos</strong> con <strong>clientes</strong> y mostrá: pedidos.id, clientes.nombre y pedidos.total.',
    pista: 'FROM pedidos INNER JOIN clientes ON pedidos.cliente_id = clientes.id',
    solucion: 'SELECT pedidos.id, clientes.nombre, pedidos.total FROM pedidos INNER JOIN clientes ON pedidos.cliente_id = clientes.id' },
  { id: '03-02', num: 2, titulo: 'Alias de tablas', tipo: 'escribir', dificultad: 'principiante', xp: 20, tabla: 'pedidos',
    teoria: 'Cuando usás JOIN, escribir el nombre completo de la tabla todo el tiempo es tedioso. Podés usar <strong>alias</strong> para abreviar: <code>FROM pedidos p INNER JOIN clientes c ON p.cliente_id = c.id</code>. El alias se asigna justo después del nombre de la tabla.',
    enunciado: 'Reescribí la consulta anterior usando alias: <strong>p</strong> para pedidos y <strong>c</strong> para clientes.\n\nMostrá: p.id, c.nombre y p.total.',
    pista: 'Poné el alias después del nombre de tabla: FROM pedidos p INNER JOIN clientes c ON p.cliente_id = c.id',
    solucion: 'SELECT p.id, c.nombre, p.total FROM pedidos p INNER JOIN clientes c ON p.cliente_id = c.id' },
  { id: '03-03', num: 3, titulo: 'JOIN con tres tablas', tipo: 'escribir', dificultad: 'intermedio', xp: 25, tabla: 'pedidos',
    teoria: 'Podés encadenar múltiples JOINs para combinar más de dos tablas. Cada JOIN agrega una tabla nueva a la consulta. El orden importa: empezás desde una tabla base y vas agregando las relacionadas una por una.',
    enunciado: 'Necesitás un reporte completo de ventas.\n\nCombiná <strong>pedidos</strong>, <strong>clientes</strong> y <strong>productos</strong> para mostrar: el nombre del cliente, el nombre del producto y el total del pedido.',
    pista: 'Dos JOINs encadenados: JOIN clientes ON pedidos.cliente_id = clientes.id, luego JOIN productos ON pedidos.producto_id = productos.id',
    solucion: 'SELECT clientes.nombre, productos.nombre, pedidos.total FROM pedidos INNER JOIN clientes ON pedidos.cliente_id = clientes.id INNER JOIN productos ON pedidos.producto_id = productos.id' },
  { id: '03-04', num: 4, titulo: 'LEFT JOIN — incluir todos', tipo: 'escribir', dificultad: 'intermedio', xp: 25, tabla: 'clientes',
    teoria: '<strong>LEFT JOIN</strong> devuelve TODOS los registros de la tabla izquierda (la del FROM), aunque no tengan coincidencia en la tabla derecha. Donde no hay coincidencia, los campos de la tabla derecha aparecen como <strong>NULL</strong>.',
    enunciado: 'Necesitás ver todos los clientes, incluyendo los que nunca hicieron un pedido.\n\nUsá <strong>LEFT JOIN</strong> para traer todos los clientes con sus pedidos. Mostrá clientes.nombre y pedidos.total.',
    pista: 'Cambiá INNER JOIN por LEFT JOIN. Los clientes sin pedidos van a mostrar NULL en total.',
    solucion: 'SELECT clientes.nombre, pedidos.total FROM clientes LEFT JOIN pedidos ON clientes.id = pedidos.cliente_id' },
  { id: '03-05', num: 5, titulo: 'Clientes sin pedidos', tipo: 'escribir', dificultad: 'intermedio', xp: 25, tabla: 'clientes',
    teoria: 'Una combinación muy poderosa es <strong>LEFT JOIN + WHERE IS NULL</strong> para encontrar registros que NO tienen relación. Por ejemplo: clientes sin pedidos, productos sin ventas, empleados sin asignación.',
    enunciado: 'El equipo de marketing quiere contactar a los clientes que nunca compraron.\n\nUsá LEFT JOIN para encontrar los clientes sin ningún pedido (donde pedidos.id IS NULL). Mostrá solo su nombre y email.',
    pista: 'LEFT JOIN de clientes con pedidos, luego WHERE pedidos.id IS NULL',
    solucion: 'SELECT clientes.nombre, clientes.email FROM clientes LEFT JOIN pedidos ON clientes.id = pedidos.cliente_id WHERE pedidos.id IS NULL' },
  { id: '03-06', num: 6, titulo: 'JOIN con WHERE', tipo: 'escribir', dificultad: 'intermedio', xp: 25, tabla: 'pedidos',
    teoria: 'Podés combinar JOIN con WHERE para filtrar los resultados combinados. El WHERE se aplica después de que las tablas se unen, por lo que podés filtrar por columnas de cualquiera de las dos tablas.',
    enunciado: 'Necesitás ver solo los pedidos mayores a $5000.\n\nCombiná <strong>pedidos</strong> y <strong>clientes</strong>, filtrá donde el <strong>total > 5000</strong>. Mostrá nombre del cliente y total.',
    pista: 'Primero hacé el JOIN, luego WHERE pedidos.total > 5000',
    solucion: 'SELECT clientes.nombre, pedidos.total FROM pedidos INNER JOIN clientes ON pedidos.cliente_id = clientes.id WHERE pedidos.total > 5000' },
  { id: '03-07', num: 7, titulo: 'TOP 5 pedidos', tipo: 'escribir', dificultad: 'intermedio', xp: 25, tabla: 'pedidos',
    teoria: 'Todos los modificadores que aprendiste (ORDER BY, LIMIT, WHERE, AS) funcionan igual cuando usás JOIN. Se aplican sobre el resultado combinado de las tablas, como si fuera una sola tabla grande.',
    enunciado: 'Querés ver el top 5 de pedidos más grandes con el nombre del cliente.\n\nCombiná pedidos y clientes, mostrá nombre y total, ordenados por total <strong>descendente</strong> y limitados a <strong>5</strong>.',
    pista: 'JOIN primero, luego ORDER BY pedidos.total DESC LIMIT 5',
    solucion: 'SELECT clientes.nombre, pedidos.total FROM pedidos INNER JOIN clientes ON pedidos.cliente_id = clientes.id ORDER BY pedidos.total DESC LIMIT 5' },
  { id: '03-08', num: 8, titulo: 'Encontrá el error en el JOIN', tipo: 'debugging', dificultad: 'intermedio', xp: 25, tabla: 'pedidos',
    teoria: 'El error más común en JOINs es confundir el orden de las claves en la condición ON. Siempre verificá que estás relacionando <code>tabla.clave_foranea = tabla.clave_primaria</code>.',
    enunciado: 'Este query tiene un error. Encontralo y corregilo:\n\n<code>SELECT c.nombre, p.total FROM pedidos p INNER JOIN clientes c ON c.id = p.id</code>',
    pista: 'La condición ON está mal. p.id es la clave primaria de pedidos, no la foránea que apunta a clientes.',
    solucion: 'SELECT c.nombre, p.total FROM pedidos p INNER JOIN clientes c ON p.cliente_id = c.id',
    errorQuery: 'SELECT c.nombre, p.total FROM pedidos p INNER JOIN clientes c ON c.id = p.id' },
  { id: '03-09', num: 9, titulo: 'Self JOIN', tipo: 'escribir', dificultad: 'avanzado', xp: 30, tabla: 'empleados',
    teoria: 'Un <strong>self JOIN</strong> une una tabla con sí misma. Es útil cuando una tabla tiene una relación interna, como empleados que reportan a otros empleados. Se necesitan alias obligatoriamente para diferenciar las dos copias de la tabla.',
    enunciado: 'La tabla empleados tiene una columna <strong>jefe_id</strong> que apunta al id del jefe de cada empleado.\n\nHacé un self JOIN para mostrar el nombre del empleado junto con el nombre de su jefe.',
    pista: 'FROM empleados e INNER JOIN empleados j ON e.jefe_id = j.id. Mostrá e.nombre y j.nombre AS jefe.',
    solucion: 'SELECT e.nombre, j.nombre AS jefe FROM empleados e INNER JOIN empleados j ON e.jefe_id = j.id' },
  { id: '03-10', num: 10, titulo: 'RIGHT JOIN', tipo: 'completar', dificultad: 'intermedio', xp: 25, tabla: 'pedidos',
    teoria: '<strong>RIGHT JOIN</strong> es lo opuesto al LEFT JOIN: devuelve todos los registros de la tabla <strong>derecha</strong> (la del JOIN), aunque no tengan coincidencia en la izquierda. En la práctica se usa poco porque siempre podés reescribirlo como LEFT JOIN.',
    enunciado: 'Querés ver todos los productos, incluyendo los que nunca fueron pedidos.\n\nUsá <strong>RIGHT JOIN</strong> para traer todos los productos con sus pedidos. Mostrá productos.nombre y pedidos.total.',
    pista: 'FROM pedidos RIGHT JOIN productos ON pedidos.producto_id = productos.id',
    solucion: 'SELECT productos.nombre, pedidos.total FROM pedidos RIGHT JOIN productos ON pedidos.producto_id = productos.id',
    template: 'SELECT productos.nombre, pedidos.total FROM pedidos ___ JOIN productos ON pedidos.producto_id = productos.id',
    blanks: ['RIGHT'] },
  { id: '03-11', num: 11, titulo: 'Reporte de ventas completo', tipo: 'escribir', dificultad: 'avanzado', xp: 35, tabla: 'pedidos',
    teoria: 'En la práctica, los reportes de negocio combinan múltiples JOINs, filtros y ordenamiento. La clave es ir construyendo el query paso a paso: primero el JOIN base, luego más tablas, y finalmente los filtros.',
    enunciado: 'El gerente pide un reporte de ventas completadas.\n\nCombiná pedidos, clientes y productos. Filtrá los pedidos con <strong>estado = "completado"</strong>. Mostrá nombre del cliente, nombre del producto, total. Ordenados por total DESC.',
    pista: "Tres tablas unidas, WHERE pedidos.estado = 'completado', ORDER BY pedidos.total DESC",
    solucion: "SELECT clientes.nombre, productos.nombre, pedidos.total FROM pedidos INNER JOIN clientes ON pedidos.cliente_id = clientes.id INNER JOIN productos ON pedidos.producto_id = productos.id WHERE pedidos.estado = 'completado' ORDER BY pedidos.total DESC" },
  { id: '03-12', num: 12, titulo: 'Clientes top — desafío maestro', tipo: 'escribir', dificultad: 'avanzado', xp: 40, tabla: 'pedidos',
    teoria: 'Combiná todo lo que sabés. Un reporte de mejores clientes requiere unir tablas, agrupar y ordenar. GROUP BY agrupa filas con el mismo valor — lo verás en detalle en el siguiente módulo.',
    enunciado: 'Armá un reporte de los <strong>3 clientes que más gastaron</strong> en total.\n\nUnís pedidos y clientes, sumás el total por cliente con <strong>SUM(pedidos.total)</strong>, agrupás por clientes.nombre, ordenás DESC con LIMIT 3.',
    pista: 'SELECT clientes.nombre, SUM(pedidos.total) AS total_gastado ... GROUP BY clientes.nombre ORDER BY total_gastado DESC LIMIT 3',
    solucion: 'SELECT clientes.nombre, SUM(pedidos.total) AS total_gastado FROM pedidos INNER JOIN clientes ON pedidos.cliente_id = clientes.id GROUP BY clientes.nombre ORDER BY total_gastado DESC LIMIT 3' },
]

export const LECCIONES_M4: Leccion[] = [
  { id: '04-01', num: 1, titulo: 'Contar filas con COUNT', tipo: 'escribir', dificultad: 'principiante', xp: 15, tabla: 'pedidos_restaurante',
    teoria: '<strong>COUNT(*)</strong> cuenta cuántas filas hay en una tabla o grupo. Es la función de agregación más básica. Podés usarla sola para contar todo, o combinada con GROUP BY para contar por categoría.',
    enunciado: 'Trabajás en el sistema de un restaurante. Querés saber cuántos pedidos hay en total.\n\nUsá <strong>COUNT(*)</strong> para contar todos los registros de la tabla <strong>pedidos_restaurante</strong>.',
    pista: 'SELECT COUNT(*) AS total_pedidos FROM pedidos_restaurante',
    solucion: 'SELECT COUNT(*) AS total_pedidos FROM pedidos_restaurante' },
  { id: '04-02', num: 2, titulo: 'Sumar con SUM', tipo: 'escribir', dificultad: 'principiante', xp: 15, tabla: 'pedidos_restaurante',
    teoria: '<strong>SUM(columna)</strong> suma todos los valores de una columna numérica. Muy útil para calcular totales de ventas, ingresos o cantidades. Si hay NULLs en la columna, SUM los ignora automáticamente.',
    enunciado: 'El dueño del restaurante quiere saber cuánto dinero entró en total.\n\nUsá <strong>SUM</strong> para calcular el total de la columna <strong>importe</strong> de <strong>pedidos_restaurante</strong>.',
    pista: 'SELECT SUM(importe) AS total_ingresos FROM pedidos_restaurante',
    solucion: 'SELECT SUM(importe) AS total_ingresos FROM pedidos_restaurante' },
  { id: '04-03', num: 3, titulo: 'Promedio con AVG', tipo: 'escribir', dificultad: 'principiante', xp: 15, tabla: 'pedidos_restaurante',
    teoria: '<strong>AVG(columna)</strong> calcula el promedio de los valores de una columna numérica. Como SUM, ignora los NULLs en el cálculo. Muy útil para métricas como ticket promedio, calificación promedio o precio medio.',
    enunciado: 'Querés saber cuál es el importe promedio de los pedidos en el restaurante.\n\nUsá <strong>AVG</strong> sobre la columna <strong>importe</strong> de <strong>pedidos_restaurante</strong>.',
    pista: 'SELECT AVG(importe) AS promedio FROM pedidos_restaurante',
    solucion: 'SELECT AVG(importe) AS promedio FROM pedidos_restaurante' },
  { id: '04-04', num: 4, titulo: 'Máximo y mínimo', tipo: 'completar', dificultad: 'principiante', xp: 15, tabla: 'pedidos_restaurante',
    teoria: '<strong>MAX(columna)</strong> devuelve el valor más alto de una columna. <strong>MIN(columna)</strong> devuelve el más bajo. Funcionan con números, fechas y texto. Podés usarlos juntos en el mismo SELECT.',
    enunciado: 'Querés ver el pedido más caro y el más barato en un solo resultado.\n\nUsá <strong>MAX</strong> y <strong>MIN</strong> sobre la columna <strong>importe</strong> de <strong>pedidos_restaurante</strong>.',
    pista: 'SELECT MAX(importe) AS maximo, MIN(importe) AS minimo FROM pedidos_restaurante',
    solucion: 'SELECT MAX(importe) AS maximo, MIN(importe) AS minimo FROM pedidos_restaurante',
    template: 'SELECT ___(importe) AS maximo, ___(importe) AS minimo FROM pedidos_restaurante',
    blanks: ['MAX', 'MIN'] },
  { id: '04-05', num: 5, titulo: 'Agrupar con GROUP BY', tipo: 'escribir', dificultad: 'intermedio', xp: 20, tabla: 'pedidos_restaurante',
    teoria: '<strong>GROUP BY</strong> agrupa los registros por los valores de una columna y aplica una función de agregación a cada grupo. La columna del GROUP BY debe aparecer en el SELECT.',
    enunciado: 'Querés saber cuántos pedidos se hicieron por cada <strong>mesa</strong>.\n\nUsá <strong>COUNT(*)</strong> agrupado por la columna <strong>mesa</strong> de <strong>pedidos_restaurante</strong>. Llamá el conteo <strong>"pedidos"</strong>.',
    pista: 'SELECT mesa, COUNT(*) AS pedidos FROM pedidos_restaurante GROUP BY mesa',
    solucion: 'SELECT mesa, COUNT(*) AS pedidos FROM pedidos_restaurante GROUP BY mesa' },
  { id: '04-06', num: 6, titulo: 'GROUP BY con SUM', tipo: 'escribir', dificultad: 'intermedio', xp: 20, tabla: 'pedidos_restaurante',
    teoria: 'Podés combinar GROUP BY con cualquier función de agregación. El resultado es una fila por cada valor único de la columna agrupada, con el resultado de la función aplicada a ese grupo.',
    enunciado: 'El gerente quiere ver cuánto facturó el restaurante por cada <strong>categoría</strong> de plato.\n\nUsá <strong>SUM(importe)</strong> agrupado por <strong>categoria</strong> de <strong>pedidos_restaurante</strong>. Llamá la suma <strong>"total"</strong>.',
    pista: 'SELECT categoria, SUM(importe) AS total FROM pedidos_restaurante GROUP BY categoria',
    solucion: 'SELECT categoria, SUM(importe) AS total FROM pedidos_restaurante GROUP BY categoria' },
  { id: '04-07', num: 7, titulo: 'Filtrar grupos con HAVING', tipo: 'escribir', dificultad: 'intermedio', xp: 25, tabla: 'pedidos_restaurante',
    teoria: '<strong>HAVING</strong> filtra grupos después de que se aplica el GROUP BY. Es como un WHERE pero para grupos. No podés usar WHERE para filtrar resultados de funciones de agregación — tenés que usar HAVING. Siempre va después del GROUP BY.',
    enunciado: 'Querés ver solo las mesas que generaron más de <strong>$3.000</strong> en total.\n\nAgrupá por <strong>mesa</strong>, sumá el <strong>importe</strong> (llamalo <strong>"total"</strong>) y filtrá con <strong>HAVING</strong> los grupos cuyo total supere 3000.',
    pista: 'GROUP BY mesa HAVING SUM(importe) > 3000',
    solucion: 'SELECT mesa, SUM(importe) AS total FROM pedidos_restaurante GROUP BY mesa HAVING SUM(importe) > 3000' },
  { id: '04-08', num: 8, titulo: 'WHERE vs HAVING', tipo: 'escribir', dificultad: 'intermedio', xp: 25, tabla: 'pedidos_restaurante',
    teoria: 'La diferencia clave: <strong>WHERE</strong> filtra filas <em>antes</em> de agrupar. <strong>HAVING</strong> filtra grupos <em>después</em> de agrupar. Podés usarlos juntos: WHERE reduce las filas que entran al GROUP BY, y HAVING filtra los grupos resultantes.',
    enunciado: 'Querés analizar solo los pedidos del <strong>turno noche</strong> y ver qué mesas superaron los <strong>$2.000</strong>.\n\nFiltrá primero con <strong>WHERE turno = "noche"</strong>, agrupá por mesa y usá <strong>HAVING</strong> para filtrar los grupos.',
    pista: "WHERE turno = 'noche' GROUP BY mesa HAVING SUM(importe) > 2000",
    solucion: "SELECT mesa, SUM(importe) AS total FROM pedidos_restaurante WHERE turno = 'noche' GROUP BY mesa HAVING SUM(importe) > 2000" },
  { id: '04-09', num: 9, titulo: 'Ranking con ORDER BY', tipo: 'escribir', dificultad: 'intermedio', xp: 20, tabla: 'pedidos_restaurante',
    teoria: 'Podés ordenar los resultados de un GROUP BY con ORDER BY. El ORDER BY se aplica al final, después del GROUP BY y el HAVING. Podés ordenar por la columna agrupada o por el resultado de la función de agregación.',
    enunciado: 'Querés un ranking de categorías por ingresos, de mayor a menor.\n\nAgrupá por <strong>categoria</strong>, sumá el <strong>importe</strong> (llamalo <strong>"total"</strong>) y ordená el resultado de mayor a menor por ese total.',
    pista: 'GROUP BY categoria ORDER BY total DESC — podés usar el alias en el ORDER BY',
    solucion: 'SELECT categoria, SUM(importe) AS total FROM pedidos_restaurante GROUP BY categoria ORDER BY total DESC' },
  { id: '04-10', num: 10, titulo: 'Desafío final: reporte mensual', tipo: 'escribir', dificultad: 'avanzado', xp: 35, tabla: 'pedidos_restaurante',
    teoria: 'El orden correcto de las cláusulas en SQL es: SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT. Recordalo como un flujo: de dónde traés los datos, cómo los filtrás, cómo los agrupás, cómo filtrás los grupos, y cómo los presentás.',
    enunciado: 'El dueño del restaurante pide el reporte mensual.\n\nDe <strong>pedidos_restaurante</strong>, mostrá las <strong>categorías</strong> con su <strong>total de ingresos</strong> y <strong>cantidad de pedidos</strong>, solo las que superaron los <strong>$5.000</strong> en total, ordenadas de mayor a menor ingreso.',
    pista: 'SELECT categoria, SUM(importe) AS total, COUNT(*) AS pedidos ... GROUP BY categoria HAVING SUM(importe) > 5000 ORDER BY total DESC',
    solucion: 'SELECT categoria, SUM(importe) AS total, COUNT(*) AS pedidos FROM pedidos_restaurante GROUP BY categoria HAVING SUM(importe) > 5000 ORDER BY total DESC' },
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

CREATE TABLE empleados(id INTEGER PRIMARY KEY,nombre TEXT,departamento TEXT,salario REAL,email TEXT,telefono TEXT,fecha_ingreso TEXT,jefe_id INTEGER);
INSERT INTO empleados VALUES
(1,'Ana García','Ventas',72000,'ana@empresa.com','1145678901','2021-03-15',3),
(2,'Luis Pérez','Sistemas',95000,'luis@empresa.com','1167890123','2019-07-01',4),
(3,'María López','Marketing',68000,'maria@empresa.com',NULL,'2022-01-10',NULL),
(4,'Carlos Ruiz','Finanzas',85000,'carlos@empresa.com','1134567890','2020-05-20',NULL),
(5,'Sofía Torres','Ventas',61000,'sofia@empresa.com','1156789012','2023-02-01',3),
(6,'Diego Martín','Marketing',59000,'diego@empresa.com',NULL,'2022-08-15',3),
(7,'Laura Sánchez','Sistemas',102000,'laura@empresa.com','1178901234','2018-11-30',4),
(8,'Andrés Gómez','Finanzas',77000,'andres@empresa.com','1190123456','2021-09-05',4),
(9,'Valentina Cruz','Ventas',88000,'valentina@empresa.com','1112345678','2020-03-22',3),
(10,'Martín Díaz','Sistemas',91000,'martin@empresa.com','1123456789','2019-01-14',2),
(11,'Camila Fernández','Marketing',63000,'camila@empresa.com',NULL,'2023-05-08',3),
(12,'Roberto Jiménez','Finanzas',54000,'roberto@empresa.com','1145670987','2022-11-20',4);

CREATE TABLE clientes(id INTEGER PRIMARY KEY,nombre TEXT,email TEXT,ciudad TEXT,telefono TEXT);
INSERT INTO clientes VALUES
(1,'Martina Rodríguez','martina@mail.com','Buenos Aires','1111111111'),
(2,'Pablo García','pablo@mail.com','Córdoba','1122222222'),
(3,'Lucia Fernández','lucia@mail.com','Buenos Aires','1133333333'),
(4,'Federico López','federico@mail.com','Rosario',NULL),
(5,'Valentina Díaz','valentina@mail.com','Buenos Aires','1155555555'),
(6,'Tomás Pérez','tomas@mail.com','Mendoza',NULL);

CREATE TABLE productos(id INTEGER PRIMARY KEY,nombre TEXT,categoria TEXT,precio REAL,stock INTEGER);
INSERT INTO productos VALUES
(1,'Notebook Pro','Electrónica',85000,15),
(2,'Mouse Inalámbrico','Electrónica',4500,80),
(3,'Silla Ergonómica','Muebles',32000,20),
(4,'Auriculares BT','Electrónica',12000,45),
(5,'Monitor 27"','Electrónica',65000,8),
(6,'Escritorio L','Muebles',48000,12);

CREATE TABLE pedidos(id INTEGER PRIMARY KEY,cliente_id INTEGER,producto_id INTEGER,total REAL,fecha TEXT,estado TEXT);
INSERT INTO pedidos VALUES
(1,1,1,85000,'2024-01-15','completado'),
(2,1,2,4500,'2024-01-20','completado'),
(3,2,3,32000,'2024-02-01','pendiente'),
(4,3,4,12000,'2024-02-10','completado'),
(5,3,5,65000,'2024-02-15','completado'),
(6,5,1,85000,'2024-03-01','completado'),
(7,5,6,48000,'2024-03-05','pendiente'),
(8,2,2,4500,'2024-03-10','completado');

CREATE TABLE pedidos_restaurante(id INTEGER PRIMARY KEY,mesa INTEGER,categoria TEXT,plato TEXT,importe REAL,turno TEXT,fecha TEXT);
INSERT INTO pedidos_restaurante VALUES
(1,1,'Entradas','Empanadas',850,'noche','2024-01-10'),
(2,1,'Principal','Bife de chorizo',3200,'noche','2024-01-10'),
(3,2,'Principal','Milanesa napolitana',2800,'mediodia','2024-01-10'),
(4,2,'Postres','Tiramisú',950,'mediodia','2024-01-10'),
(5,3,'Principal','Pasta al pesto',2400,'noche','2024-01-11'),
(6,3,'Bebidas','Vino Malbec',1800,'noche','2024-01-11'),
(7,4,'Entradas','Tabla de quesos',1200,'mediodia','2024-01-11'),
(8,4,'Principal','Asado completo',5600,'mediodia','2024-01-11'),
(9,1,'Principal','Risotto',2900,'mediodia','2024-01-12'),
(10,2,'Entradas','Bruschetta',780,'noche','2024-01-12'),
(11,5,'Principal','Paella',3800,'noche','2024-01-12'),
(12,5,'Postres','Crème brûlée',1100,'noche','2024-01-12'),
(13,3,'Bebidas','Cerveza artesanal',650,'mediodia','2024-01-13'),
(14,1,'Principal','Salmón grillado',4200,'noche','2024-01-13'),
(15,4,'Principal','Pollo al limón',2600,'noche','2024-01-13');
CREATE TABLE transacciones(id INTEGER PRIMARY KEY,cuenta_id INTEGER,tipo TEXT,monto REAL,estado TEXT,descripcion TEXT,fecha TEXT);
INSERT INTO transacciones VALUES
(1,1,'debito',1500.00,'aprobada','Supermercado','2024-01-05'),
(2,1,'credito',85000.00,'aprobada','Sueldo enero','2024-01-10'),
(3,2,'debito',3200.50,'aprobada','Alquiler','2024-01-15'),
(4,2,'debito',450.00,'rechazada',NULL,'2024-01-18'),
(5,3,'credito',12000.00,'aprobada','Transferencia recibida','2024-01-20'),
(6,3,'debito',980.00,'aprobada','Farmacia','2024-01-22'),
(7,1,'debito',67000.00,'aprobada','Auto','2024-02-01'),
(8,2,'credito',95000.00,'aprobada','Sueldo febrero','2024-02-10'),
(9,4,'debito',2100.00,'rechazada',NULL,'2024-02-12'),
(10,4,'debito',560.00,'rechazada',NULL,'2024-02-14'),
(11,1,'debito',890.00,'aprobada','Restaurant','2024-02-20'),
(12,3,'debito',15000.00,'aprobada','Electrónica','2024-02-25'),
(13,5,'credito',120000.00,'aprobada','Sueldo febrero','2024-02-28'),
(14,5,'debito',4500.00,'aprobada',NULL,'2024-03-05'),
(15,2,'debito',78000.00,'rechazada',NULL,'2024-03-10');

CREATE TABLE cuentas(cuenta_id INTEGER PRIMARY KEY,titular TEXT,email TEXT,tipo_cuenta TEXT,saldo REAL);
INSERT INTO cuentas VALUES
(1,'Lucía Fernández','lucia@banco.com','caja_ahorro',18500.00),
(2,'Martín García','martin@banco.com','cuenta_corriente',42000.00),
(3,'Valentina Ruiz','vale@banco.com','caja_ahorro',97500.00),
(4,'Diego López','diego@banco.com','cuenta_corriente',3200.00),
(5,'Sofía Martínez','sofia@banco.com','caja_ahorro',215000.00);

CREATE TABLE medicos(id INTEGER PRIMARY KEY,nombre TEXT,especialidad TEXT,anios_experiencia INTEGER,email TEXT);
INSERT INTO medicos VALUES
(1,'Dr. Carlos Méndez','Cardiología',15,'cmendez@hospital.com'),
(2,'Dra. Ana Ramos','Pediatría',8,'aramos@hospital.com'),
(3,'Dr. Luis Torres','Neurología',22,'ltorres@hospital.com'),
(4,'Dra. María Silva','Traumatología',4,'msilva@hospital.com'),
(5,'Dr. Jorge Paz','Cardiología',11,'jpaz@hospital.com'),
(6,'Dra. Elena Vega','Pediatría',3,'evega@hospital.com');

CREATE TABLE pacientes(id INTEGER PRIMARY KEY,nombre TEXT,edad INTEGER,medico_id INTEGER,diagnostico_principal TEXT);
INSERT INTO pacientes VALUES
(1,'Roberto Alvarez',62,1,'Hipertensión'),
(2,'Carmen Soto',45,2,'Control rutinario'),
(3,'Pablo Herrera',71,3,'Parkinson'),
(4,'Marta Iglesias',38,1,'Arritmia'),
(5,'Fernando Cruz',29,4,'Fractura tobillo'),
(6,'Gabriela Mora',55,2,'Diabetes'),
(7,'Héctor Ríos',48,5,'Hipertensión'),
(8,'Silvia Gómez',33,6,'Control rutinario');

CREATE TABLE consultas(id INTEGER PRIMARY KEY,paciente_id INTEGER,medico_id INTEGER,fecha TEXT,diagnostico TEXT,costo REAL);
INSERT INTO consultas VALUES
(1,1,1,'2024-01-08','Hipertensión controlada',4500.00),
(2,2,2,'2024-01-10','Vacunación',2800.00),
(3,3,3,'2024-01-12','Control Parkinson',6200.00),
(4,4,1,'2024-01-15','Arritmia leve',4500.00),
(5,1,1,'2024-02-05','Hipertensión',4500.00),
(6,5,4,'2024-02-08','Fractura consolidando',3100.00),
(7,6,2,'2024-02-10','Diabetes tipo 2',2800.00),
(8,7,5,'2024-02-12','Hipertensión severa',4800.00),
(9,3,3,'2024-02-15','Parkinson avanzado',6200.00),
(10,1,1,'2024-03-01','Hipertensión',4500.00),
(11,8,6,'2024-03-05','Control anual',2500.00),
(12,4,1,'2024-03-08','Arritmia controlada',4500.00),
(13,7,5,'2024-03-10','Hipertensión',4800.00),
(14,2,2,'2024-03-12','Control desarrollo',2800.00),
(15,6,2,'2024-03-15','Diabetes controlada',2800.00);

CREATE TABLE choferes(id INTEGER PRIMARY KEY,nombre TEXT,zona TEXT,antiguedad_anios INTEGER);
INSERT INTO choferes VALUES
(1,'Carlos Díaz','Norte',8),(2,'Laura Martínez','Sur',5),(3,'Miguel Torres','Norte',12),
(4,'Sofía Ruiz','Este',3),(5,'Pablo García','Sur',9),(6,'Ana López','Oeste',6);

CREATE TABLE envios(id INTEGER PRIMARY KEY,chofer_id INTEGER,zona TEXT,peso_kg REAL,estado TEXT,fecha TEXT);
INSERT INTO envios VALUES
(1,1,'Norte',45.5,'completado','2024-01-05'),(2,1,'Norte',78.2,'completado','2024-01-06'),
(3,2,'Sur',23.1,'completado','2024-01-07'),(4,3,'Norte',95.0,'completado','2024-01-08'),
(5,3,'Norte',110.5,'completado','2024-01-09'),(6,4,'Este',34.8,'pendiente','2024-01-10'),
(7,2,'Sur',67.3,'completado','2024-01-11'),(8,5,'Sur',88.9,'completado','2024-01-12'),
(9,1,'Norte',52.4,'completado','2024-01-13'),(10,6,'Oeste',41.2,'completado','2024-01-14'),
(11,3,'Norte',73.6,'completado','2024-01-15'),(12,4,'Este',29.9,'completado','2024-01-16'),
(13,5,'Sur',91.4,'completado','2024-01-17'),(14,2,'Sur',44.7,'pendiente','2024-01-18'),
(15,6,'Oeste',58.3,'completado','2024-01-19'),(16,1,'Norte',82.1,'completado','2024-01-20'),
(17,3,'Norte',66.8,'completado','2024-01-21'),(18,5,'Sur',77.2,'completado','2024-01-22'),
(19,4,'Este',55.0,'completado','2024-01-23'),(20,6,'Oeste',93.7,'completado','2024-01-24');

CREATE TABLE ventas(id INTEGER PRIMARY KEY,vendedor_id INTEGER,zona TEXT,monto REAL,fecha TEXT);
INSERT INTO ventas VALUES
(1,101,'Norte',8500,'2024-01-03'),(2,102,'Sur',12300,'2024-01-05'),
(3,103,'Norte',6200,'2024-01-07'),(4,101,'Norte',15800,'2024-01-10'),
(5,104,'Este',9400,'2024-01-12'),(6,102,'Sur',7100,'2024-01-14'),
(7,103,'Norte',18200,'2024-01-16'),(8,105,'Oeste',11600,'2024-01-18'),
(9,101,'Norte',6800,'2024-01-20'),(10,104,'Este',14200,'2024-01-22'),
(11,102,'Sur',9800,'2024-01-24'),(12,105,'Oeste',7500,'2024-01-26'),
(13,103,'Norte',21000,'2024-01-28'),(14,101,'Norte',4300,'2024-02-01'),
(15,104,'Este',16700,'2024-02-03'),(16,102,'Sur',13400,'2024-02-05'),
(17,105,'Oeste',8900,'2024-02-07'),(18,103,'Norte',11300,'2024-02-09'),
(19,101,'Norte',19600,'2024-02-11'),(20,104,'Este',5800,'2024-02-13');

CREATE TABLE usuarios(id INTEGER PRIMARY KEY,nombre TEXT,username TEXT,email TEXT,pais TEXT,es_premium INTEGER DEFAULT 0,verificado INTEGER DEFAULT 0);
INSERT INTO usuarios VALUES
(1,'Ana Garcia','anagarcia','ana@mail.com','Argentina',1,1),(2,'Luis Perez','luisperez','luis@mail.com','Mexico',0,0),
(3,'Maria Lopez','marialopez','maria@mail.com','Argentina',0,1),(4,'Carlos Ruiz','carlosruiz','carlos@mail.com','Espana',1,1),
(5,'Sofia Torres','sofiatorres','sofia@mail.com','Argentina',0,0),(6,'Diego Martin','diegomartin','diego@mail.com','Mexico',1,0),
(7,'Laura Sanchez','laurasanchez','laura@mail.com','Espana',0,1),(8,'Andres Gomez','andresgomez','ana@mail.com','Argentina',0,0);

CREATE TABLE posts(id INTEGER PRIMARY KEY,usuario_id INTEGER,titulo TEXT,descripcion TEXT,categoria TEXT,cantidad_likes INTEGER,fecha TEXT);
INSERT INTO posts VALUES
(1,1,'Mi primer post','Hola mundo','Tech',1200,'2024-01-05'),(2,1,'SQL es increible',NULL,'Tech',890,'2024-01-15'),
(3,2,'Viajando por Mexico','Un viaje increible','Travel',450,'2024-01-20'),(4,3,'Recetas saludables','Comer bien','Food',2100,'2024-01-22'),
(5,4,'Optimizacion SQL','Tips de performance','Tech',3400,'2024-01-25'),(6,1,'Window functions',NULL,'Tech',780,'2024-02-03'),
(7,5,'Mi gato','Fotos del gato','Lifestyle',120,'2024-02-05'),(8,2,'Cancun en fotos','Hermoso','Travel',1800,'2024-02-08'),
(9,3,'Pasta casera','Receta italiana','Food',560,'2024-02-10'),(10,4,'Indices en bases de datos','Tutorial avanzado','Tech',4200,'2024-02-12'),
(11,6,'Ciudad de Mexico','Turismo','Travel',890,'2024-02-15'),(12,1,'CTEs explicados','Guia completa','Tech',1100,'2024-03-01'),
(13,7,'Yoga en casa','Rutina matutina','Lifestyle',340,'2024-03-03'),(14,4,'JOIN tipos','Inner, Left, Right','Tech',2800,'2024-03-05'),
(15,3,'Tarta de manzana','Postre casero','Food',1500,'2024-03-08');

CREATE TABLE metricas_red(id INTEGER PRIMARY KEY,mes TEXT,plataforma TEXT,likes INTEGER,compartidos INTEGER);
INSERT INTO metricas_red VALUES
(1,'2024-01','Instagram',45200,1200),(2,'2024-01','Twitter',18900,890),(3,'2024-01','Facebook',12400,560),
(4,'2024-02','Instagram',52100,1450),(5,'2024-02','Twitter',21300,1020),(6,'2024-02','Facebook',14800,680),
(7,'2024-03','Instagram',61800,1890),(8,'2024-03','Twitter',19700,870),(9,'2024-03','Facebook',11200,490);
`

export const INTRO_SLIDES = [
  {
    id: '00-01',
    titulo: '¿Qué es una base de datos?',
    subtitulo: 'Una base de datos es un sistema organizado para guardar, consultar y gestionar grandes cantidades de información de forma eficiente. A diferencia de un archivo de texto o una planilla, permite encontrar cualquier dato al instante aunque sean millones de registros.',
    tipo: 'concepto' as const,
  },
  {
    id: '00-02',
    titulo: '¿Para qué sirve?',
    subtitulo: 'Casi toda aplicación que usás tiene una base de datos por detrás. Sin bases de datos no existirían las redes sociales, los comercios online ni las apps de banco. Son la columna vertebral de la información digital.',
    tipo: 'apps' as const,
  },
  {
    id: '00-03',
    titulo: 'Una base de datos tiene varias tablas',
    subtitulo: 'Una base de datos se divide en tablas. Cada tabla guarda un tipo de información y se relaciona con las demás a través de claves. Por ejemplo, una tienda tiene una tabla de clientes, otra de productos y otra de pedidos — todas conectadas entre sí.',
    tipo: 'der' as const,
  },
  {
    id: '00-04',
    titulo: 'Las columnas definen qué guardás',
    subtitulo: 'Las columnas definen qué tipo de información se guarda en cada tabla. Son como las preguntas de un formulario: nombre, edad, ciudad. Cada columna tiene un tipo de dato específico y cada tabla puede tener muchas columnas.',
    tipo: 'tabla' as const,
    hlCols: true, hlRow: -1,
  },
  {
    id: '00-05',
    titulo: 'Las filas son los registros',
    subtitulo: 'Cada fila es un registro completo: una persona, un producto, un pedido. La primera fila de esta tabla nos dice todo sobre Ana García: su id, nombre, edad y ciudad de residencia.',
    tipo: 'tabla' as const,
    hlCols: false, hlRow: 0,
  },
  {
    id: '00-06',
    titulo: 'Columnas + Filas = Tabla',
    subtitulo: 'Una tabla combina columnas (qué tipo de dato se guarda) y filas (cada registro individual). Es similar a una planilla de Excel, pero diseñada para manejar millones de registros con velocidad y eficiencia.',
    tipo: 'tabla' as const,
    hlCols: true, hlRow: 0,
  },
  {
    id: '00-07',
    titulo: '¿Qué es SQL y para qué sirve?',
    subtitulo: 'SQL (Structured Query Language) es el lenguaje que usás para comunicarte con una base de datos. Con SQL podés consultar datos, filtrarlos, combinar tablas y generar reportes. Es una habilidad clave para analistas, developers, científicos de datos y cualquier profesional que trabaje con información.',
    tipo: 'sql' as const,
  },
  {
    id: '00-08',
    titulo: '¡Listo para empezar!',
    subtitulo: 'Ya dominás los conceptos base: base de datos, tablas, columnas, filas y SQL. En el Módulo 1 vas a escribir tu primera consulta real y empezar a ganar XP.',
    tipo: 'resumen' as const,
  },
]
