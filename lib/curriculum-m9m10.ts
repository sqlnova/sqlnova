import type { Leccion, GlosarioItem, ResumenModulo } from './curriculum'

export const LECCIONES_M9: Leccion[] = [
  {
    id: '09-01', num: 1, titulo: 'EXPLAIN — el plan de ejecución', tipo: 'escribir',
    dificultad: 'principiante', xp: 20, tabla: 'posts',
    teoria: '<strong>EXPLAIN QUERY PLAN</strong> te muestra cómo SQL planea ejecutar tu consulta, sin ejecutarla realmente. Te indica si va a hacer un escaneo completo de la tabla (<em>full table scan</em> — lento) o si va a usar un índice (rápido). Es el primer paso para optimizar cualquier query lento: entendé qué hace el motor antes de cambiar nada.',
    enunciado: 'Antes de optimizar, hay que entender el problema. Escribí el comando para ver el plan de ejecución de este query sobre la tabla <strong>posts</strong>:\n\n<code>SELECT * FROM posts WHERE usuario_id = 42</code>',
    pista: 'EXPLAIN QUERY PLAN SELECT * FROM posts WHERE usuario_id = 42',
    solucion: 'EXPLAIN QUERY PLAN SELECT * FROM posts WHERE usuario_id = 42',
  },
  {
    id: '09-02', num: 2, titulo: 'SELECT solo lo que necesitás', tipo: 'escribir',
    dificultad: 'principiante', xp: 15, tabla: 'posts',
    teoria: '<strong>SELECT *</strong> trae todas las columnas aunque no las necesites. Consume más memoria, más red y más CPU. La regla es simple: pedí solo las columnas que vas a usar. En tablas con columnas de texto largo como contenido de posts, la diferencia puede ser enorme.',
    enunciado: 'Este query trae más datos de los necesarios:\n\n<code>SELECT * FROM posts WHERE usuario_id = 42 ORDER BY fecha DESC LIMIT 10</code>\n\nReescribilo para traer solo <strong>id</strong>, <strong>titulo</strong>, <strong>fecha</strong> y <strong>cantidad_likes</strong>.',
    pista: 'SELECT id, titulo, fecha, cantidad_likes FROM posts WHERE usuario_id = 42 ORDER BY fecha DESC LIMIT 10',
    solucion: 'SELECT id, titulo, fecha, cantidad_likes FROM posts WHERE usuario_id = 42 ORDER BY fecha DESC LIMIT 10',
  },
  {
    id: '09-03', num: 3, titulo: 'Indices — que son y para que sirven', tipo: 'escribir',
    dificultad: 'principiante', xp: 20, tabla: 'posts',
    teoria: 'Un <strong>indice</strong> es una estructura que SQL mantiene para encontrar filas rapidamente sin escanear toda la tabla. Es como el indice de un libro: en vez de leer todo, vas directo a la pagina. Los indices aceleran WHERE, JOIN y ORDER BY, pero ocupan espacio y ralentizan los INSERT/UPDATE. Se crean con <code>CREATE INDEX nombre ON tabla(columna)</code>.',
    enunciado: 'La tabla <strong>posts</strong> es muy grande y las busquedas por <strong>usuario_id</strong> son lentas. Crea un indice llamado <strong>idx_posts_usuario</strong> sobre la columna <strong>usuario_id</strong> de la tabla posts.',
    pista: 'CREATE INDEX idx_posts_usuario ON posts(usuario_id)',
    solucion: 'CREATE INDEX idx_posts_usuario ON posts(usuario_id)',
  },
  {
    id: '09-04', num: 4, titulo: 'Indice compuesto', tipo: 'escribir',
    dificultad: 'intermedio', xp: 25, tabla: 'posts',
    teoria: 'Un <strong>indice compuesto</strong> cubre multiples columnas y es muy eficiente cuando filtrás o ordenás por varias columnas a la vez. El orden importa: el indice <code>(usuario_id, fecha)</code> es util para <code>WHERE usuario_id = X ORDER BY fecha</code>, pero no para <code>WHERE fecha = X</code> solo. Siempre poner primero la columna del filtro mas selectivo.',
    enunciado: 'Los queries mas frecuentes filtran posts por <strong>usuario_id</strong> y los ordenan por <strong>fecha</strong>. Crea un indice compuesto llamado <strong>idx_posts_usuario_fecha</strong> sobre ambas columnas de la tabla posts, en ese orden.',
    pista: 'CREATE INDEX idx_posts_usuario_fecha ON posts(usuario_id, fecha)',
    solucion: 'CREATE INDEX idx_posts_usuario_fecha ON posts(usuario_id, fecha)',
  },
  {
    id: '09-05', num: 5, titulo: 'Cuando NO usar indices', tipo: 'escribir',
    dificultad: 'intermedio', xp: 20, tabla: 'usuarios',
    teoria: 'Los indices <strong>no siempre</strong> mejoran el rendimiento. No convienen en columnas con muy pocos valores distintos — si una columna booleana tiene solo 0 y 1, el indice no ayuda porque el motor igual recorre la mitad de la tabla. Si convienen en columnas con muchos valores distintos como pais o email, donde el indice puede descartar muchas filas rapidamente.',
    enunciado: 'Las columnas con pocos valores distintos no se benefician de un indice. La columna <strong>es_premium</strong> solo tiene dos valores posibles (0 o 1). Demostrato: conta cuantos valores distintos tiene usando <strong>COUNT(DISTINCT es_premium)</strong>. Mostra el resultado como "valores_distintos".',
    pista: 'SELECT COUNT(DISTINCT es_premium) AS valores_distintos FROM usuarios',
    solucion: 'SELECT COUNT(DISTINCT es_premium) AS valores_distintos FROM usuarios',
  },
  {
    id: '09-06', num: 6, titulo: 'Evitar funciones en el WHERE', tipo: 'escribir',
    dificultad: 'intermedio', xp: 25, tabla: 'posts',
    teoria: 'Aplicar una funcion sobre una columna indexada en el WHERE hace que el indice no se pueda usar. Esto se llama query <strong>no sargable</strong>. En vez de <code>WHERE strftime(\'%Y\', fecha) = \'2024\'</code>, usa <code>WHERE fecha &gt;= \'2024-01-01\' AND fecha &lt; \'2025-01-01\'</code>. El resultado es el mismo pero el indice si se puede aprovechar.',
    enunciado: 'Este query no puede usar el indice sobre la columna fecha:\n\n<code>SELECT * FROM posts WHERE strftime(\'%Y\', fecha) = \'2024\'</code>\n\nReescribilo de forma eficiente. Trae solo id, titulo y fecha.',
    pista: "SELECT id, titulo, fecha FROM posts WHERE fecha >= '2024-01-01' AND fecha < '2025-01-01'",
    solucion: "SELECT id, titulo, fecha FROM posts WHERE fecha >= '2024-01-01' AND fecha < '2025-01-01'",
  },
  {
    id: '09-07', num: 7, titulo: 'EXISTS vs IN para subqueries', tipo: 'escribir',
    dificultad: 'intermedio', xp: 25, tabla: 'usuarios',
    teoria: 'Cuando la subquery puede devolver muchos resultados, <strong>EXISTS</strong> es mas eficiente que IN. Con IN, el motor evalua todos los resultados. Con EXISTS, se detiene en cuanto encuentra la primera coincidencia. Para tablas grandes la diferencia puede ser enorme.',
    enunciado: 'Reescribi este query usando <strong>EXISTS</strong> en vez de IN:\n\n<code>SELECT id, nombre FROM usuarios WHERE id IN (SELECT usuario_id FROM posts WHERE cantidad_likes > 1000)</code>',
    pista: 'SELECT id, nombre FROM usuarios WHERE EXISTS (SELECT 1 FROM posts WHERE posts.usuario_id = usuarios.id AND cantidad_likes > 1000)',
    solucion: 'SELECT id, nombre FROM usuarios WHERE EXISTS (SELECT 1 FROM posts WHERE posts.usuario_id = usuarios.id AND cantidad_likes > 1000)',
  },
  {
    id: '09-08', num: 8, titulo: 'Paginacion con LIMIT y OFFSET', tipo: 'escribir',
    dificultad: 'principiante', xp: 15, tabla: 'posts',
    teoria: 'Nunca traigas mas datos de los que vas a mostrar. En aplicaciones reales siempre usas paginacion: <strong>LIMIT</strong> para la cantidad de filas por pagina y <strong>OFFSET</strong> para saltar paginas anteriores. <code>LIMIT 20 OFFSET 40</code> trae la tercera pagina de 20 resultados.',
    enunciado: 'La app muestra el feed paginado con <strong>10 posts por pagina</strong>. Arma el query para traer la <strong>segunda pagina</strong>. Mostra id, titulo y fecha, ordenados por fecha DESC.',
    pista: 'SELECT id, titulo, fecha FROM posts ORDER BY fecha DESC LIMIT 10 OFFSET 10',
    solucion: 'SELECT id, titulo, fecha FROM posts ORDER BY fecha DESC LIMIT 10 OFFSET 10',
  },
  {
    id: '09-09', num: 9, titulo: 'Encontra el query lento', tipo: 'debugging',
    dificultad: 'intermedio', xp: 25, tabla: 'posts',
    teoria: 'Los problemas de rendimiento mas comunes: <strong>SELECT *</strong> en tablas grandes, funcion en el WHERE que evita el indice, y falta de LIMIT. Identificar cual es el problema es el primer paso.',
    enunciado: 'Este query es muy lento porque aplica LOWER a la columna titulo (no puede usar indice):\n\n<code>SELECT * FROM posts WHERE LOWER(titulo) = \'tech\'</code>\n\nReescribilo de forma eficiente buscando los posts de la categoria <strong>Tech</strong>. Mostra id, titulo y cantidad_likes.',
    pista: "SELECT id, titulo, cantidad_likes FROM posts WHERE categoria = 'Tech'",
    solucion: "SELECT id, titulo, cantidad_likes FROM posts WHERE categoria = 'Tech'",
    errorQuery: "SELECT * FROM posts WHERE LOWER(categoria) = 'tech'",
  },
  {
    id: '09-10', num: 10, titulo: 'Checklist de optimizacion', tipo: 'escribir',
    dificultad: 'avanzado', xp: 30, tabla: 'posts',
    teoria: 'El checklist en orden de impacto: 1) SELECT solo columnas necesarias. 2) WHERE sin funciones sobre columnas indexadas. 3) LIMIT siempre. 4) JOIN con indices en las claves. 5) EXISTS en vez de IN para subqueries grandes. 6) Filtrar pronto con CTEs antes del JOIN.',
    enunciado: 'Aplica el checklist completo a este query. Identifica todos los problemas y reescribilo optimizado:\n\n<code>SELECT * FROM posts p, usuarios u WHERE p.usuario_id = u.id AND strftime(\'%Y\', p.fecha) = \'2024\' AND u.pais = \'Argentina\' ORDER BY p.fecha</code>',
    pista: "SELECT p.id, p.titulo, p.fecha, p.cantidad_likes, u.nombre FROM posts p INNER JOIN usuarios u ON p.usuario_id = u.id WHERE p.fecha >= '2024-01-01' AND p.fecha < '2025-01-01' AND u.pais = 'Argentina' ORDER BY p.fecha DESC LIMIT 50",
    solucion: "SELECT p.id, p.titulo, p.fecha, p.cantidad_likes, u.nombre FROM posts p INNER JOIN usuarios u ON p.usuario_id = u.id WHERE p.fecha >= '2024-01-01' AND p.fecha < '2025-01-01' AND u.pais = 'Argentina' ORDER BY p.fecha DESC LIMIT 50",
  },
]

export const LECCIONES_M10: Leccion[] = [
  {
    id: '10-01', num: 1, titulo: 'El segundo valor mas alto', tipo: 'escribir',
    dificultad: 'intermedio', xp: 30, tabla: 'empleados',
    teoria: 'Una pregunta clasica de entrevistas: encontrar el N-esimo valor mas alto. La solucion mas directa: excluir el maximo con una subquery y tomar el MAX del resto. Alternativa: <code>ORDER BY salario DESC LIMIT 1 OFFSET 1</code>. Nota: <strong>QUALIFY no esta disponible en SQLite</strong> — es una extension de Snowflake/BigQuery.',
    enunciado: 'Pregunta de entrevista clasica: encontra el <strong>segundo salario mas alto</strong> de la tabla empleados. Mostra solo el valor del salario. Hay varias formas validas — todas son aceptadas si el resultado es correcto.',
    pista: 'SELECT MAX(salario) FROM empleados WHERE salario < (SELECT MAX(salario) FROM empleados)',
    solucion: 'SELECT MAX(salario) FROM empleados WHERE salario < (SELECT MAX(salario) FROM empleados)',
  },
  {
    id: '10-02', num: 2, titulo: 'Empleados que ganan mas que su jefe', tipo: 'escribir',
    dificultad: 'intermedio', xp: 30, tabla: 'empleados',
    teoria: 'Este problema clasico requiere comparar cada empleado con su jefe usando un <strong>self JOIN</strong>. Unis la tabla empleados consigo misma: una copia como el empleado (e) y otra como el jefe (j). Luego filtras donde el salario del empleado supera al del jefe.',
    enunciado: 'Encontra los empleados que ganan <strong>mas que su jefe directo</strong>. La tabla empleados tiene una columna <strong>jefe_id</strong> que referencia al id del jefe. Mostra el nombre del empleado y su salario.',
    pista: 'SELECT e.nombre, e.salario FROM empleados e INNER JOIN empleados j ON e.jefe_id = j.id WHERE e.salario > j.salario',
    solucion: 'SELECT e.nombre, e.salario FROM empleados e INNER JOIN empleados j ON e.jefe_id = j.id WHERE e.salario > j.salario',
  },
  {
    id: '10-03', num: 3, titulo: 'Usuarios sin actividad reciente', tipo: 'escribir',
    dificultad: 'intermedio', xp: 30, tabla: 'usuarios',
    teoria: 'Encontrar registros que NO tienen relacion en otra tabla es un patron muy comun. La solucion clasica: <strong>LEFT JOIN + WHERE columna IS NULL</strong>. El truco esta en poner la condicion de fecha dentro del ON del JOIN, no en el WHERE — asi los usuarios sin posts del periodo siguen apareciendo con NULL.',
    enunciado: 'Encontra los usuarios que <strong>NO publicaron ningun post</strong>. Usa LEFT JOIN entre usuarios y posts para encontrar los que no tienen ninguna fila en posts. Mostra id y nombre.',
    pista: 'SELECT u.id, u.nombre FROM usuarios u LEFT JOIN posts p ON u.id = p.usuario_id WHERE p.id IS NULL',
    solucion: 'SELECT u.id, u.nombre FROM usuarios u LEFT JOIN posts p ON u.id = p.usuario_id WHERE p.id IS NULL',
  },
  {
    id: '10-04', num: 4, titulo: 'Duplicados en una tabla', tipo: 'escribir',
    dificultad: 'intermedio', xp: 30, tabla: 'usuarios',
    teoria: 'Para encontrar duplicados usas <strong>GROUP BY</strong> sobre la columna que deberia ser unica, y <strong>HAVING COUNT(*) &gt; 1</strong> para filtrar los grupos con mas de una ocurrencia. Para eliminar duplicados manteniendo solo uno, se usa un CTE con ROW_NUMBER().',
    enunciado: 'La tabla usuarios puede tener emails duplicados por un bug. Encontra todos los emails que aparecen <strong>mas de una vez</strong>. Mostra el email y cuantas veces aparece, llamando a esa columna <strong>"cantidad"</strong>. Ordena de mayor a menor.',
    pista: 'SELECT email, COUNT(*) AS cantidad FROM usuarios GROUP BY email HAVING COUNT(*) > 1 ORDER BY cantidad DESC',
    solucion: 'SELECT email, COUNT(*) AS cantidad FROM usuarios GROUP BY email HAVING COUNT(*) > 1 ORDER BY cantidad DESC',
  },
  {
    id: '10-05', num: 5, titulo: 'Top 3 por categoria', tipo: 'escribir',
    dificultad: 'avanzado', xp: 40, tabla: 'posts',
    teoria: 'El patron "top N por grupo" es de los mas frecuentes en entrevistas senior. Requiere <strong>ROW_NUMBER() con PARTITION BY</strong> para numerar dentro de cada grupo y un CTE para poder filtrar sobre ese numero. No podes filtrar directamente sobre una window function sin el CTE intermedio.',
    enunciado: 'Encontra los <strong>3 posts con mas likes de cada categoria</strong>. La tabla posts tiene: id, titulo, categoria, cantidad_likes. Mostra categoria, titulo, cantidad_likes y la posicion dentro de la categoria (llamala <strong>"pos"</strong>). Ordena por categoria y pos.',
    pista: 'WITH ranked AS (SELECT id, titulo, categoria, cantidad_likes, ROW_NUMBER() OVER(PARTITION BY categoria ORDER BY cantidad_likes DESC) AS pos FROM posts) SELECT categoria, titulo, cantidad_likes, pos FROM ranked WHERE pos <= 3 ORDER BY categoria, pos',
    solucion: 'WITH ranked AS (SELECT id, titulo, categoria, cantidad_likes, ROW_NUMBER() OVER(PARTITION BY categoria ORDER BY cantidad_likes DESC) AS pos FROM posts) SELECT categoria, titulo, cantidad_likes, pos FROM ranked WHERE pos <= 3 ORDER BY categoria, pos',
  },
  {
    id: '10-06', num: 6, titulo: 'Tasa de retencion de usuarios', tipo: 'escribir',
    dificultad: 'avanzado', xp: 40, tabla: 'posts',
    teoria: 'La <strong>retencion</strong> mide que porcentaje de usuarios de un periodo vuelven en el siguiente. Se calcula como: usuarios activos en periodo 2 que tambien estuvieron en periodo 1 / total usuarios en periodo 1. Requiere dos CTEs con los usuarios unicos de cada periodo y un LEFT JOIN para encontrar los que aparecen en ambos.',
    enunciado: 'Calcula la <strong>tasa de retencion mensual</strong>: que porcentaje de usuarios que publicaron en enero 2024 tambien publicaron en febrero 2024. Usa dos CTEs: <strong>enero</strong> y <strong>febrero</strong>. Llama al resultado <strong>retencion_pct</strong> (ROUND a 1 decimal).',
    pista: "WITH enero AS (SELECT DISTINCT usuario_id FROM posts WHERE strftime('%Y-%m', fecha) = '2024-01'), febrero AS (SELECT DISTINCT usuario_id FROM posts WHERE strftime('%Y-%m', fecha) = '2024-02') SELECT ROUND(COUNT(DISTINCT febrero.usuario_id) * 100.0 / NULLIF(COUNT(DISTINCT enero.usuario_id), 0), 1) AS retencion_pct FROM enero LEFT JOIN febrero ON enero.usuario_id = febrero.usuario_id",
    solucion: "WITH enero AS (SELECT DISTINCT usuario_id FROM posts WHERE strftime('%Y-%m', fecha) = '2024-01'), febrero AS (SELECT DISTINCT usuario_id FROM posts WHERE strftime('%Y-%m', fecha) = '2024-02') SELECT ROUND(COUNT(DISTINCT febrero.usuario_id) * 100.0 / NULLIF(COUNT(DISTINCT enero.usuario_id), 0), 1) AS retencion_pct FROM enero LEFT JOIN febrero ON enero.usuario_id = febrero.usuario_id",
  },
  {
    id: '10-07', num: 7, titulo: 'Arbol de jerarquia con CTE recursivo', tipo: 'escribir',
    dificultad: 'avanzado', xp: 50, tabla: 'empleados',
    teoria: 'Un <strong>CTE recursivo</strong> tiene dos partes separadas por UNION ALL: la <em>base</em> (los nodos raiz) y el <em>paso recursivo</em> (que une la tabla consigo misma para bajar un nivel). Se usa para jerarquias como empleados-jefes. Requiere la palabra <code>RECURSIVE</code> despues de WITH.',
    enunciado: 'Usa un <strong>CTE recursivo</strong> para obtener toda la cadena de jefes del empleado con id = 1. Empieza desde ese empleado y subi por la jerarquia hasta el nivel mas alto. Mostra id, nombre y nivel (0 = empleado inicial, 1 = su jefe directo, etc.).',
    pista: 'WITH RECURSIVE jerarquia AS (SELECT id, nombre, jefe_id, 0 AS nivel FROM empleados WHERE id = 1 UNION ALL SELECT e.id, e.nombre, e.jefe_id, j.nivel + 1 FROM empleados e INNER JOIN jerarquia j ON e.id = j.jefe_id) SELECT id, nombre, nivel FROM jerarquia ORDER BY nivel',
    solucion: 'WITH RECURSIVE jerarquia AS (SELECT id, nombre, jefe_id, 0 AS nivel FROM empleados WHERE id = 1 UNION ALL SELECT e.id, e.nombre, e.jefe_id, j.nivel + 1 FROM empleados e INNER JOIN jerarquia j ON e.id = j.jefe_id) SELECT id, nombre, nivel FROM jerarquia ORDER BY nivel',
  },
  {
    id: '10-08', num: 8, titulo: 'Running total con condicion', tipo: 'escribir',
    dificultad: 'avanzado', xp: 40, tabla: 'ventas',
    teoria: 'Combinar <strong>SUM OVER(ORDER BY)</strong> con <strong>CASE WHEN</strong> permite calcular sumas acumuladas condicionales. Por ejemplo: <code>SUM(CASE WHEN estado = \'aprobada\' THEN monto ELSE 0 END) OVER(ORDER BY fecha)</code>. Las rechazadas suman 0 y no afectan el acumulado.',
    enunciado: 'Calcula el <strong>total acumulado de ventas completadas</strong> por fecha, ignorando las pendientes. De la tabla <strong>ventas</strong> mostra: fecha, monto, estado y el acumulado solo de las completadas (llamalo <strong>acumulado_aprobadas</strong>). Ordena por fecha.',
    pista: "SELECT fecha, monto, estado, SUM(CASE WHEN estado = 'completado' THEN monto ELSE 0 END) OVER(ORDER BY fecha) AS acumulado_aprobadas FROM ventas ORDER BY fecha",
    solucion: "SELECT fecha, monto, estado, SUM(CASE WHEN estado = 'completado' THEN monto ELSE 0 END) OVER(ORDER BY fecha) AS acumulado_aprobadas FROM ventas ORDER BY fecha",
  },
  {
    id: '10-09', num: 9, titulo: 'Pivotear datos con CASE WHEN', tipo: 'escribir',
    dificultad: 'avanzado', xp: 45, tabla: 'metricas_red',
    teoria: 'SQL no tiene PIVOT nativo en SQLite, pero podes simularlo con <strong>SUM(CASE WHEN)</strong>. Para cada categoria que queres como columna, usas <code>SUM(CASE WHEN categoria = X THEN valor END)</code>. El resultado transforma filas en columnas — muy usado en reportes.',
    enunciado: 'Pivotea las metricas por red social: mostra una fila por <strong>mes</strong> con columnas separadas para los likes de cada plataforma (<strong>instagram</strong>, <strong>twitter</strong>, <strong>facebook</strong>). La tabla <strong>metricas_red</strong> tiene: mes, plataforma, likes.',
    pista: "SELECT mes, SUM(CASE WHEN plataforma = 'Instagram' THEN likes END) AS instagram, SUM(CASE WHEN plataforma = 'Twitter' THEN likes END) AS twitter, SUM(CASE WHEN plataforma = 'Facebook' THEN likes END) AS facebook FROM metricas_red GROUP BY mes ORDER BY mes",
    solucion: "SELECT mes, SUM(CASE WHEN plataforma = 'Instagram' THEN likes END) AS instagram, SUM(CASE WHEN plataforma = 'Twitter' THEN likes END) AS twitter, SUM(CASE WHEN plataforma = 'Facebook' THEN likes END) AS facebook FROM metricas_red GROUP BY mes ORDER BY mes",
  },
  {
    id: '10-10', num: 10, titulo: 'Desafio final: analisis de red social', tipo: 'escribir',
    dificultad: 'avanzado', xp: 60, tabla: 'posts',
    teoria: 'El desafio final combina todas las tecnicas: CTEs, window functions, JOINs, agregaciones y CASE WHEN. Estrategia: construi por partes. Primero el CTE con los datos base, luego las window functions encima del CTE.',
    enunciado: 'Arma el reporte de <strong>marzo 2024</strong> de la red social. Por usuario mostra: <strong>nombre</strong>, <strong>pais</strong>, <strong>total_posts</strong>, <strong>total_likes</strong>, <strong>ranking_pais</strong> por likes dentro del pais (RANK), y <strong>categoria</strong> como "Influencer" si supera 1000 likes o "Regular" si no. Solo usuarios con al menos 1 post. Ordena por pais y ranking_pais.',
    pista: "WITH stats AS (SELECT u.id, u.nombre, u.pais, COUNT(p.id) AS total_posts, SUM(p.cantidad_likes) AS total_likes FROM usuarios u INNER JOIN posts p ON u.id = p.usuario_id WHERE strftime('%Y-%m', p.fecha) = '2024-03' GROUP BY u.id, u.nombre, u.pais HAVING COUNT(p.id) >= 1) SELECT nombre, pais, total_posts, total_likes, RANK() OVER(PARTITION BY pais ORDER BY total_likes DESC) AS ranking_pais, CASE WHEN total_likes > 1000 THEN 'Influencer' ELSE 'Regular' END AS categoria FROM stats ORDER BY pais, ranking_pais",
    solucion: "WITH stats AS (SELECT u.id, u.nombre, u.pais, COUNT(p.id) AS total_posts, SUM(p.cantidad_likes) AS total_likes FROM usuarios u INNER JOIN posts p ON u.id = p.usuario_id WHERE strftime('%Y-%m', p.fecha) = '2024-03' GROUP BY u.id, u.nombre, u.pais HAVING COUNT(p.id) >= 1) SELECT nombre, pais, total_posts, total_likes, RANK() OVER(PARTITION BY pais ORDER BY total_likes DESC) AS ranking_pais, CASE WHEN total_likes > 1000 THEN 'Influencer' ELSE 'Regular' END AS categoria FROM stats ORDER BY pais, ranking_pais",
  },
]

export const GLOSARIO_M9: GlosarioItem[] = [
  { termino: 'EXPLAIN QUERY PLAN', descripcion: 'Muestra como SQL planea ejecutar un query sin ejecutarlo. Indica si usa indice o full scan.', ejemplo: 'EXPLAIN QUERY PLAN SELECT * FROM posts WHERE usuario_id = 42' },
  { termino: 'Full table scan', descripcion: 'El motor recorre todas las filas para encontrar las que necesita. Lento en tablas grandes.', ejemplo: 'Sin indice: WHERE usuario_id = 42 -> full scan. Con indice -> busqueda directa.' },
  { termino: 'CREATE INDEX', descripcion: 'Crea un indice sobre una o mas columnas para acelerar busquedas.', ejemplo: 'CREATE INDEX idx_posts_usuario ON posts(usuario_id)' },
  { termino: 'Indice compuesto', descripcion: 'Indice sobre multiples columnas. El orden importa — poner primero la columna mas selectiva.', ejemplo: 'CREATE INDEX idx_posts_usuario_fecha ON posts(usuario_id, fecha)' },
  { termino: 'Query sargable', descripcion: 'Un query que puede aprovechar indices. Evitar funciones sobre columnas indexadas en el WHERE.', ejemplo: "Sargable: WHERE fecha >= '2024-01-01'. No sargable: WHERE strftime('%Y', fecha) = '2024'" },
  { termino: 'EXISTS vs IN', descripcion: 'EXISTS se detiene en la primera coincidencia — mas eficiente para subqueries con muchos resultados.', ejemplo: 'WHERE EXISTS (SELECT 1 FROM posts WHERE posts.usuario_id = usuarios.id)' },
  { termino: 'LIMIT + OFFSET', descripcion: 'Paginacion de resultados. OFFSET = (pagina - 1) x tamano_pagina.', ejemplo: 'SELECT * FROM posts ORDER BY fecha DESC LIMIT 20 OFFSET 40 -- pagina 3' },
]

export const GLOSARIO_M10: GlosarioItem[] = [
  { termino: 'N-esimo valor', descripcion: 'Patron para encontrar el segundo, tercero, etc. valor mas alto usando subquery o OFFSET.', ejemplo: 'SELECT MAX(salario) FROM empleados WHERE salario < (SELECT MAX(salario) FROM empleados)' },
  { termino: 'Self JOIN', descripcion: 'JOIN de una tabla consigo misma. Requiere alias distintos para cada copia.', ejemplo: 'FROM empleados e INNER JOIN empleados j ON e.jefe_id = j.id WHERE e.salario > j.salario' },
  { termino: 'LEFT JOIN + IS NULL', descripcion: 'Patron para encontrar registros que NO tienen relacion en otra tabla.', ejemplo: "FROM usuarios u LEFT JOIN posts p ON u.id = p.usuario_id AND p.fecha >= date('now', '-30 days') WHERE p.id IS NULL" },
  { termino: 'Duplicados con HAVING', descripcion: 'GROUP BY + HAVING COUNT(*) > 1 para encontrar valores repetidos.', ejemplo: 'SELECT email, COUNT(*) FROM usuarios GROUP BY email HAVING COUNT(*) > 1' },
  { termino: 'CTE recursivo', descripcion: 'CTE que se referencia a si mismo para recorrer jerarquias. Requiere RECURSIVE y UNION ALL.', ejemplo: 'WITH RECURSIVE hier AS (SELECT * FROM t WHERE padre IS NULL UNION ALL SELECT t.* FROM t JOIN hier h ON t.padre_id = h.id)' },
  { termino: 'Running total condicional', descripcion: 'Suma acumulada solo para filas que cumplen una condicion, usando SUM + CASE WHEN + OVER.', ejemplo: "SUM(CASE WHEN estado = 'aprobada' THEN monto ELSE 0 END) OVER(ORDER BY fecha)" },
  { termino: 'PIVOT con CASE WHEN', descripcion: 'Transforma filas en columnas usando SUM(CASE WHEN categoria = X THEN valor END) + GROUP BY.', ejemplo: "SUM(CASE WHEN plataforma = 'Instagram' THEN likes END) AS instagram" },
]

export const RESUMEN_M9: ResumenModulo = {
  titulo: 'Lo que aprendiste en Optimizacion',
  puntos: [
    'EXPLAIN QUERY PLAN muestra si el motor usa indice o full scan.',
    'SELECT * es lento — pedi solo las columnas que necesitas.',
    'Los indices aceleran WHERE, JOIN y ORDER BY sobre columnas frecuentes.',
    'Indice compuesto: util para filtros multi-columna. El orden importa.',
    'Evitar funciones sobre columnas indexadas en el WHERE (queries sargables).',
    'EXISTS es mas eficiente que IN cuando la subquery devuelve muchas filas.',
    'LIMIT siempre — nunca traer mas datos de los que vas a mostrar.',
    'Filtrar antes del JOIN con CTEs reduce la cantidad de filas procesadas.',
  ],
  sintaxis: "-- Indice simple\nCREATE INDEX idx_nombre ON tabla(columna)\n\n-- Indice compuesto\nCREATE INDEX idx_nombre ON tabla(col1, col2)\n\n-- Query sargable\nWHERE fecha >= '2024-01-01' AND fecha < '2025-01-01'\n\n-- EXISTS en vez de IN\nWHERE EXISTS (SELECT 1 FROM otra WHERE otra.fk = tabla.id)\n\n-- Paginacion\nSELECT col FROM tabla ORDER BY col DESC LIMIT 20 OFFSET 40",
}

export const RESUMEN_M10: ResumenModulo = {
  titulo: 'Lo que aprendiste en Modo Entrevista',
  puntos: [
    'N-esimo valor: subquery con MAX excluyendo el maximo anterior.',
    'Self JOIN: tabla con si misma para comparaciones jerarquicas.',
    'LEFT JOIN + IS NULL: registros sin relacion en otra tabla.',
    'HAVING COUNT(*) > 1: encontrar duplicados por columna.',
    'Top N por grupo: ROW_NUMBER + PARTITION BY + CTE + WHERE rn <= N.',
    'Retencion: dos CTEs por periodo + LEFT JOIN + NULLIF para el porcentaje.',
    'CTE recursivo: WITH RECURSIVE + UNION ALL para jerarquias.',
    'Running total condicional: SUM(CASE WHEN) OVER(ORDER BY).',
    'PIVOT: SUM(CASE WHEN categoria = X THEN valor END) + GROUP BY.',
  ],
  sintaxis: '-- Top N por grupo\nWITH ranked AS (\n  SELECT *, ROW_NUMBER() OVER(PARTITION BY grupo ORDER BY valor DESC) AS rn\n  FROM tabla\n)\nSELECT * FROM ranked WHERE rn <= 3\n\n-- CTE recursivo\nWITH RECURSIVE hier AS (\n  SELECT * FROM tabla WHERE padre_id IS NULL\n  UNION ALL\n  SELECT t.* FROM tabla t\n  INNER JOIN hier h ON t.padre_id = h.id\n)\nSELECT * FROM hier',
}

export const DATASET_M9M10 = `
CREATE TABLE usuarios(id INTEGER PRIMARY KEY,nombre TEXT,username TEXT,email TEXT,pais TEXT,es_premium INTEGER DEFAULT 0,verificado INTEGER DEFAULT 0);
INSERT INTO usuarios VALUES
(1,'Ana Garcia','anagarcia','ana@mail.com','Argentina',1,1),
(2,'Luis Perez','luisperez','luis@mail.com','Mexico',0,0),
(3,'Maria Lopez','marialopez','maria@mail.com','Argentina',0,1),
(4,'Carlos Ruiz','carlosruiz','carlos@mail.com','Espana',1,1),
(5,'Sofia Torres','sofiatorres','sofia@mail.com','Argentina',0,0),
(6,'Diego Martin','diegomartin','diego@mail.com','Mexico',1,0),
(7,'Laura Sanchez','laurasanchez','laura@mail.com','Espana',0,1),
(8,'Andres Gomez','andresgomez','ana@mail.com','Argentina',0,0);

CREATE TABLE posts(id INTEGER PRIMARY KEY,usuario_id INTEGER,titulo TEXT,descripcion TEXT,categoria TEXT,cantidad_likes INTEGER,fecha TEXT);
INSERT INTO posts VALUES
(1,1,'Mi primer post','Hola mundo','Tech',1200,'2024-01-05'),
(2,1,'SQL es increible',NULL,'Tech',890,'2024-01-15'),
(3,2,'Viajando por Mexico','Un viaje increible','Travel',450,'2024-01-20'),
(4,3,'Recetas saludables','Comer bien','Food',2100,'2024-01-22'),
(5,4,'Optimizacion SQL','Tips de performance','Tech',3400,'2024-01-25'),
(6,1,'Window functions',NULL,'Tech',780,'2024-02-03'),
(7,5,'Mi gato','Fotos del gato','Lifestyle',120,'2024-02-05'),
(8,2,'Cancun en fotos','Hermoso','Travel',1800,'2024-02-08'),
(9,3,'Pasta casera','Receta italiana','Food',560,'2024-02-10'),
(10,4,'Indices en bases de datos','Tutorial avanzado','Tech',4200,'2024-02-12'),
(11,6,'Ciudad de Mexico','Turismo','Travel',890,'2024-02-15'),
(12,1,'CTEs explicados','Guia completa','Tech',1100,'2024-03-01'),
(13,7,'Yoga en casa','Rutina matutina','Lifestyle',340,'2024-03-03'),
(14,4,'JOIN tipos','Inner, Left, Right','Tech',2800,'2024-03-05'),
(15,3,'Tarta de manzana','Postre casero','Food',1500,'2024-03-08');

CREATE TABLE metricas_red(id INTEGER PRIMARY KEY,mes TEXT,plataforma TEXT,likes INTEGER,compartidos INTEGER);
INSERT INTO metricas_red VALUES
(1,'2024-01','Instagram',45200,1200),
(2,'2024-01','Twitter',18900,890),
(3,'2024-01','Facebook',12400,560),
(4,'2024-02','Instagram',52100,1450),
(5,'2024-02','Twitter',21300,1020),
(6,'2024-02','Facebook',14800,680),
(7,'2024-03','Instagram',61800,1890),
(8,'2024-03','Twitter',19700,870),
(9,'2024-03','Facebook',11200,490);
`
