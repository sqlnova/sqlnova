import type { Leccion, GlosarioItem, ResumenModulo } from './curriculum'

export const LECCIONES_M7: Leccion[] = [
  {
    id: '07-01', num: 1, titulo: 'Qué es un CTE', tipo: 'escribir',
    dificultad: 'principiante', xp: 20, tabla: 'envios',
    teoria: 'Un <strong>CTE</strong> (Common Table Expression) es una consulta con nombre que podés usar dentro de otra consulta. Se define con <code>WITH nombre AS (query)</code> y luego se usa como si fuera una tabla. Hace los queries más legibles y organizados que las subqueries anidadas.',
    enunciado: 'Trabajás en el sistema de logística de una empresa. Usá un CTE llamado <strong>envios_grandes</strong> para obtener los envíos con <strong>peso_kg mayor a 50</strong>. Luego consultá ese CTE para ver todos sus registros.',
    pista: 'WITH envios_grandes AS (SELECT * FROM envios WHERE peso_kg > 50) SELECT * FROM envios_grandes',
    solucion: 'WITH envios_grandes AS (SELECT * FROM envios WHERE peso_kg > 50) SELECT * FROM envios_grandes',
  },
  {
    id: '07-02', num: 2, titulo: 'CTE con cálculo previo', tipo: 'escribir',
    dificultad: 'principiante', xp: 20, tabla: 'envios',
    teoria: 'Los CTEs son muy útiles para hacer un cálculo primero y luego filtrar sobre ese resultado. Podés calcular totales por grupo en el CTE y después filtrar los grupos que te interesan en el SELECT principal — algo imposible de hacer con WHERE directamente sobre una agregación.',
    enunciado: 'Querés ver los choferes que entregaron más de <strong>10 envíos</strong> en total.\n\nCreá un CTE llamado <strong>totales_chofer</strong> que cuente los envíos por <strong>chofer_id</strong>. Luego filtrá los que tienen más de 10.',
    pista: 'WITH totales_chofer AS (SELECT chofer_id, COUNT(*) AS total FROM envios GROUP BY chofer_id) SELECT * FROM totales_chofer WHERE total > 10',
    solucion: 'WITH totales_chofer AS (SELECT chofer_id, COUNT(*) AS total FROM envios GROUP BY chofer_id) SELECT * FROM totales_chofer WHERE total > 10',
  },
  {
    id: '07-03', num: 3, titulo: 'CTE con JOIN', tipo: 'escribir',
    dificultad: 'intermedio', xp: 25, tabla: 'envios',
    teoria: 'Podés combinar un CTE con JOINs. El CTE hace el trabajo pesado del cálculo, y luego lo unís con otra tabla para enriquecer el resultado. Esto es mucho más legible que anidar una subquery dentro de un JOIN.',
    enunciado: 'Creá un CTE llamado <strong>rendimiento</strong> que calcule el total de kg entregados por <strong>chofer_id</strong>.\n\nLuego uní ese CTE con la tabla <strong>choferes</strong> para mostrar el <strong>nombre</strong> del chofer junto con su <strong>total_kg</strong>. Ordená por total_kg DESC.',
    pista: 'WITH rendimiento AS (SELECT chofer_id, SUM(peso_kg) AS total_kg FROM envios GROUP BY chofer_id) SELECT choferes.nombre, rendimiento.total_kg FROM rendimiento INNER JOIN choferes ON rendimiento.chofer_id = choferes.id',
    solucion: 'WITH rendimiento AS (SELECT chofer_id, SUM(peso_kg) AS total_kg FROM envios GROUP BY chofer_id) SELECT choferes.nombre, rendimiento.total_kg FROM rendimiento INNER JOIN choferes ON rendimiento.chofer_id = choferes.id ORDER BY rendimiento.total_kg DESC',
  },
  {
    id: '07-04', num: 4, titulo: 'Múltiples CTEs', tipo: 'escribir',
    dificultad: 'intermedio', xp: 25, tabla: 'envios',
    teoria: 'Podés definir <strong>múltiples CTEs</strong> separados por coma en el mismo WITH. El segundo CTE puede referenciar al primero. Esto permite construir el query en capas lógicas claras, como si fueran pasos de un algoritmo.',
    enunciado: 'Definí dos CTEs:\n1. <strong>envios_completados</strong>: los envíos con estado "completado"\n2. <strong>por_zona</strong>: agrupa esos envíos por zona y cuenta cuántos hay\n\nConsultá por_zona mostrando zona y cantidad, ordenado por cantidad DESC.',
    pista: "WITH envios_completados AS (SELECT * FROM envios WHERE estado = 'completado'), por_zona AS (SELECT zona, COUNT(*) AS cantidad FROM envios_completados GROUP BY zona) SELECT zona, cantidad FROM por_zona ORDER BY cantidad DESC",
    solucion: "WITH envios_completados AS (SELECT * FROM envios WHERE estado = 'completado'), por_zona AS (SELECT zona, COUNT(*) AS cantidad FROM envios_completados GROUP BY zona) SELECT zona, cantidad FROM por_zona ORDER BY cantidad DESC",
  },
  {
    id: '07-05', num: 5, titulo: 'CTE vs Subquery', tipo: 'escribir',
    dificultad: 'intermedio', xp: 20, tabla: 'envios',
    teoria: 'Un CTE y una subquery en el FROM hacen lo mismo, pero el CTE es más legible cuando la lógica es compleja o cuando necesitás reusar el resultado. Saber reescribir subqueries como CTEs es una habilidad muy valorada en entrevistas técnicas.',
    enunciado: 'Este query usa una subquery. Reescribilo usando un <strong>CTE</strong> que devuelva el mismo resultado:\n\n<code>SELECT zona, total FROM (SELECT zona, SUM(peso_kg) AS total FROM envios GROUP BY zona) WHERE total > 500</code>',
    pista: 'WITH totales AS (SELECT zona, SUM(peso_kg) AS total FROM envios GROUP BY zona) SELECT zona, total FROM totales WHERE total > 500',
    solucion: 'WITH totales AS (SELECT zona, SUM(peso_kg) AS total FROM envios GROUP BY zona) SELECT zona, total FROM totales WHERE total > 500',
  },
  {
    id: '07-06', num: 6, titulo: 'CTE para ranking', tipo: 'escribir',
    dificultad: 'intermedio', xp: 25, tabla: 'envios',
    teoria: 'Una combinación muy útil es usar un CTE para calcular métricas y luego hacer un ranking en el query principal. El CTE maneja la complejidad del cálculo, y el SELECT externo hace el ordenamiento y el LIMIT.',
    enunciado: 'Encontrá las <strong>3 zonas con mayor peso total entregado</strong>.\n\nCreá un CTE llamado <strong>peso_zona</strong> que sume el <strong>peso_kg</strong> por zona. Luego consultá el top 3 ordenado por total_kg DESC.',
    pista: 'WITH peso_zona AS (SELECT zona, SUM(peso_kg) AS total_kg FROM envios GROUP BY zona) SELECT zona, total_kg FROM peso_zona ORDER BY total_kg DESC LIMIT 3',
    solucion: 'WITH peso_zona AS (SELECT zona, SUM(peso_kg) AS total_kg FROM envios GROUP BY zona) SELECT zona, total_kg FROM peso_zona ORDER BY total_kg DESC LIMIT 3',
  },
  {
    id: '07-07', num: 7, titulo: 'Encontrá el error', tipo: 'debugging',
    dificultad: 'intermedio', xp: 20, tabla: 'envios',
    teoria: 'Los errores más comunes en CTEs son: olvidar la coma entre múltiples CTEs, olvidar los paréntesis alrededor del SELECT interno, o referenciar el CTE antes de definirlo.',
    enunciado: 'Este query tiene un error. Encontralo y corregilo:\n\n<code>WITH totales AS SELECT zona, COUNT(*) FROM envios GROUP BY zona SELECT * FROM totales</code>',
    pista: 'Al CTE le faltan los paréntesis alrededor del SELECT interno. WITH nombre AS (SELECT ...) es la sintaxis correcta.',
    solucion: 'WITH totales AS (SELECT zona, COUNT(*) AS cantidad FROM envios GROUP BY zona) SELECT * FROM totales',
    errorQuery: 'WITH totales AS SELECT zona, COUNT(*) FROM envios GROUP BY zona SELECT * FROM totales',
  },
  {
    id: '07-08', num: 8, titulo: 'Desafío final: reporte logístico', tipo: 'escribir',
    dificultad: 'avanzado', xp: 40, tabla: 'envios',
    teoria: 'Los reportes logísticos reales usan CTEs para organizar cálculos complejos en pasos claros. Cada CTE resuelve una parte del problema, y el SELECT final los combina con CASE WHEN para la clasificación.',
    enunciado: 'Armá el reporte de rendimiento de choferes con dos CTEs:\n1. <strong>entregas_chofer</strong>: total de envíos y kg por chofer_id\n2. <strong>con_nombre</strong>: une entregas_chofer con choferes para agregar el nombre\n\nConsultá con_nombre mostrando nombre, total_envios, total_kg y clasificá como <strong>"Top"</strong> si total_kg > 500 o <strong>"Regular"</strong> si no. Ordená por total_kg DESC.',
    pista: "WITH entregas_chofer AS (...GROUP BY chofer_id), con_nombre AS (...JOIN choferes...) SELECT nombre, total_envios, total_kg, CASE WHEN total_kg > 500 THEN 'Top' ELSE 'Regular' END FROM con_nombre",
    solucion: "WITH entregas_chofer AS (SELECT chofer_id, COUNT(*) AS total_envios, SUM(peso_kg) AS total_kg FROM envios GROUP BY chofer_id), con_nombre AS (SELECT choferes.nombre, entregas_chofer.total_envios, entregas_chofer.total_kg FROM entregas_chofer INNER JOIN choferes ON entregas_chofer.chofer_id = choferes.id) SELECT nombre, total_envios, total_kg, CASE WHEN total_kg > 500 THEN 'Top' ELSE 'Regular' END AS categoria FROM con_nombre ORDER BY total_kg DESC",
  },
]

export const LECCIONES_M8: Leccion[] = [
  {
    id: '08-01', num: 1, titulo: 'Qué es una Window Function', tipo: 'escribir',
    dificultad: 'intermedio', xp: 25, tabla: 'ventas',
    teoria: 'Una <strong>Window Function</strong> calcula un valor para cada fila usando un conjunto de filas relacionadas (la "ventana"), <strong>sin colapsar las filas</strong> como hace GROUP BY. La cláusula <strong>OVER()</strong> define la ventana. Con OVER() vacío, la ventana es toda la tabla. La diferencia clave con GROUP BY: cada fila sigue existiendo en el resultado, solo gana una columna extra con el cálculo.',
    enunciado: 'Trabajás en el área de ventas. Querés ver cada venta junto con el <strong>total global</strong> de todas las ventas como columna adicional.\n\nUsá <strong>SUM(monto) OVER()</strong> para agregar el total global a cada fila de la tabla <strong>ventas</strong>.',
    pista: 'SELECT id, vendedor_id, monto, SUM(monto) OVER() AS total_global FROM ventas',
    solucion: 'SELECT id, vendedor_id, monto, SUM(monto) OVER() AS total_global FROM ventas',
  },
  {
    id: '08-02', num: 2, titulo: 'PARTITION BY — ventanas por grupo', tipo: 'escribir',
    dificultad: 'intermedio', xp: 25, tabla: 'ventas',
    teoria: '<strong>PARTITION BY</strong> dentro del OVER() divide las filas en grupos y aplica la función a cada grupo por separado. Es como un GROUP BY pero sin colapsar las filas — cada fila mantiene su identidad y además ve el resultado de su grupo. Ejemplo: si hay 3 ventas de zona Norte de $100, $200 y $300, cada una va a mostrar total_zona = $600.',
    enunciado: 'Querés ver cada venta junto con el <strong>total de ventas de ese mismo vendedor</strong>.\n\nUsá <strong>SUM(monto) OVER(PARTITION BY vendedor_id)</strong> para calcular el total por vendedor sin colapsar las filas.',
    pista: 'SELECT id, vendedor_id, monto, SUM(monto) OVER(PARTITION BY vendedor_id) AS total_vendedor FROM ventas',
    solucion: 'SELECT id, vendedor_id, monto, SUM(monto) OVER(PARTITION BY vendedor_id) AS total_vendedor FROM ventas',
  },
  {
    id: '08-03', num: 3, titulo: 'ROW_NUMBER — numerar filas', tipo: 'escribir',
    dificultad: 'intermedio', xp: 25, tabla: 'ventas',
    teoria: '<strong>ROW_NUMBER() OVER(ORDER BY columna)</strong> asigna un número secuencial a cada fila según el orden indicado. Con PARTITION BY podés numerar dentro de cada grupo por separado — la numeración reinicia en cada grupo. Es la función más usada para rankings y para el patrón "top N por grupo".',
    enunciado: 'Numerá todas las ventas de mayor a menor monto.\n\nMostrá <strong>id</strong>, <strong>vendedor_id</strong>, <strong>monto</strong> y una columna <strong>ranking</strong> con el número de fila ordenado por monto DESC.',
    pista: 'SELECT id, vendedor_id, monto, ROW_NUMBER() OVER(ORDER BY monto DESC) AS ranking FROM ventas',
    solucion: 'SELECT id, vendedor_id, monto, ROW_NUMBER() OVER(ORDER BY monto DESC) AS ranking FROM ventas',
  },
  {
    id: '08-04', num: 4, titulo: 'RANK y DENSE_RANK', tipo: 'completar',
    dificultad: 'intermedio', xp: 25, tabla: 'ventas',
    teoria: '<strong>RANK()</strong> asigna el mismo número a filas empatadas pero deja huecos (1,1,3). <strong>DENSE_RANK()</strong> también asigna el mismo número a empatados pero sin huecos (1,1,2). Ejemplo con montos 500, 500, 300: RANK() devuelve 1, 1, 3 (deja un hueco). DENSE_RANK() devuelve 1, 1, 2 (sin huecos). Usá RANK para el "puesto real", DENSE_RANK para la posición relativa sin huecos.',
    enunciado: 'Mostrá el ranking de ventas por monto usando <strong>DENSE_RANK</strong> (sin huecos en caso de empate).\n\nMostrá <strong>id</strong>, <strong>monto</strong> y una columna <strong>puesto</strong> con DENSE_RANK ordenado por monto DESC.',
    pista: 'SELECT id, monto, DENSE_RANK() OVER(ORDER BY monto DESC) AS puesto FROM ventas',
    solucion: 'SELECT id, monto, DENSE_RANK() OVER(ORDER BY monto DESC) AS puesto FROM ventas',
    template: 'SELECT id, monto, ___(___) OVER(ORDER BY monto DESC) AS puesto FROM ventas',
    blanks: ['DENSE_RANK', ''],
  },
  {
    id: '08-05', num: 5, titulo: 'TOP N por grupo', tipo: 'escribir',
    dificultad: 'avanzado', xp: 30, tabla: 'ventas',
    teoria: 'El patrón "top N por grupo" es una de las consultas más pedidas en entrevistas. La técnica: 1) Usás <strong>ROW_NUMBER()</strong> con <strong>PARTITION BY</strong> para numerar filas dentro de cada grupo. 2) Envolvés todo en un CTE. 3) Filtrás <strong>WHERE rn = 1</strong> (o rn &lt;= 3 para top 3). No podés filtrar directamente sobre window functions — siempre necesitás el CTE intermedio.',
    enunciado: 'Querés la <strong>venta más alta de cada zona</strong>.\n\nUsá un CTE con ROW_NUMBER() OVER(PARTITION BY zona ORDER BY monto DESC) y luego filtrá donde el número de fila sea 1. Mostrá vendedor_id, zona y monto.',
    pista: 'WITH ranked AS (SELECT *, ROW_NUMBER() OVER(PARTITION BY zona ORDER BY monto DESC) AS rn FROM ventas) SELECT vendedor_id, zona, monto FROM ranked WHERE rn = 1',
    solucion: 'WITH ranked AS (SELECT *, ROW_NUMBER() OVER(PARTITION BY zona ORDER BY monto DESC) AS rn FROM ventas) SELECT vendedor_id, zona, monto FROM ranked WHERE rn = 1',
  },
  {
    id: '08-06', num: 6, titulo: 'LAG — comparar con fila anterior', tipo: 'escribir',
    dificultad: 'avanzado', xp: 30, tabla: 'ventas',
    teoria: '<strong>LAG(columna, n)</strong> devuelve el valor de la columna n filas antes de la fila actual (dentro de la ventana). <strong>LEAD(columna, n)</strong> devuelve el valor n filas después. Si no existe fila anterior, devuelve NULL (o el valor default si lo especificás). El uso más común: <code>monto - LAG(monto) OVER(ORDER BY fecha)</code> te da la diferencia con la venta anterior.',
    enunciado: 'Querés ver la evolución de ventas de cada vendedor comparando cada venta con la anterior.\n\nMostrá <strong>id</strong>, <strong>vendedor_id</strong>, <strong>monto</strong> y el monto de la venta anterior del mismo vendedor (<strong>LAG</strong>), ordenado por fecha.',
    pista: 'SELECT id, vendedor_id, monto, LAG(monto) OVER(PARTITION BY vendedor_id ORDER BY fecha) AS monto_anterior FROM ventas ORDER BY vendedor_id, fecha',
    solucion: 'SELECT id, vendedor_id, monto, LAG(monto) OVER(PARTITION BY vendedor_id ORDER BY fecha) AS monto_anterior FROM ventas ORDER BY vendedor_id, fecha',
  },
  {
    id: '08-07', num: 7, titulo: 'SUM acumulado', tipo: 'escribir',
    dificultad: 'avanzado', xp: 30, tabla: 'ventas',
    teoria: 'Cuando usás <strong>SUM() OVER(ORDER BY fecha)</strong>, obtenés una suma acumulada (running total). Cada fila muestra la suma de todos los valores hasta ese punto en el orden indicado. Internamente SQL usa <code>ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code> — desde la primera fila hasta la actual. Es ideal para ver crecimiento acumulado de ventas o ingresos.',
    enunciado: 'Calculá el <strong>total acumulado de ventas</strong> ordenado por fecha.\n\nMostrá <strong>fecha</strong>, <strong>monto</strong> y una columna <strong>acumulado</strong> con SUM(monto) OVER(ORDER BY fecha). Ordená por fecha.',
    pista: 'SELECT fecha, monto, SUM(monto) OVER(ORDER BY fecha) AS acumulado FROM ventas ORDER BY fecha',
    solucion: 'SELECT fecha, monto, SUM(monto) OVER(ORDER BY fecha) AS acumulado FROM ventas ORDER BY fecha',
  },
  {
    id: '08-08', num: 8, titulo: 'Promedio móvil', tipo: 'escribir',
    dificultad: 'avanzado', xp: 35, tabla: 'ventas',
    teoria: '<strong>ROWS BETWEEN n PRECEDING AND CURRENT ROW</strong> define una ventana deslizante. Por ejemplo, <code>AVG(monto) OVER(ORDER BY fecha ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)</code> calcula el promedio de la fila actual y las 2 anteriores — un promedio móvil de 3 períodos.',
    enunciado: 'Calculá el <strong>promedio móvil de 3 ventas</strong> (la actual y las 2 anteriores) ordenado por fecha.\n\nMostrá <strong>fecha</strong>, <strong>monto</strong> y <strong>promedio_movil</strong> redondeado a 2 decimales.',
    pista: 'SELECT fecha, monto, ROUND(AVG(monto) OVER(ORDER BY fecha ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS promedio_movil FROM ventas ORDER BY fecha',
    solucion: 'SELECT fecha, monto, ROUND(AVG(monto) OVER(ORDER BY fecha ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS promedio_movil FROM ventas ORDER BY fecha',
  },
  {
    id: '08-09', num: 9, titulo: 'Encontrá el error', tipo: 'debugging',
    dificultad: 'intermedio', xp: 20, tabla: 'ventas',
    teoria: 'Los errores más comunes en window functions son: olvidar los paréntesis en OVER(), filtrar con WHERE sobre el resultado de una window function (debe ir en subquery o CTE), o no incluir ORDER BY cuando la función lo requiere.',
    enunciado: 'Este query tiene un error. Encontralo y corregilo:\n\n<code>SELECT vendedor_id, monto, RANK() OVER ORDER BY monto DESC AS ranking FROM ventas</code>',
    pista: 'SELECT vendedor_id, monto, RANK() OVER(ORDER BY monto DESC) AS ranking FROM ventas',
    solucion: 'SELECT vendedor_id, monto, RANK() OVER(ORDER BY monto DESC) AS ranking FROM ventas',
    errorQuery: 'SELECT vendedor_id, monto, RANK() OVER ORDER BY monto DESC AS ranking FROM ventas',
  },
  {
    id: '08-10', num: 10, titulo: 'Porcentaje del total', tipo: 'escribir',
    dificultad: 'avanzado', xp: 30, tabla: 'ventas',
    teoria: 'Una combinación muy útil es calcular qué porcentaje representa cada fila respecto al total. La fórmula es: <code>monto * 100.0 / SUM(monto) OVER()</code>. El <strong>100.0</strong> (con decimal) es importante para evitar división entera. Con PARTITION BY zona obtenés el porcentaje dentro de cada zona. Sin PARTITION BY obtenés el porcentaje del total global.',
    enunciado: 'Calculá qué <strong>porcentaje del total de ventas</strong> representa cada venta.\n\nMostrá <strong>id</strong>, <strong>vendedor_id</strong>, <strong>monto</strong> y <strong>pct_del_total</strong> redondeado a 1 decimal. Usá SUM(monto) OVER() para el total global.',
    pista: 'SELECT id, vendedor_id, monto, ROUND(monto * 100.0 / SUM(monto) OVER(), 1) AS pct_del_total FROM ventas',
    solucion: 'SELECT id, vendedor_id, monto, ROUND(monto * 100.0 / SUM(monto) OVER(), 1) AS pct_del_total FROM ventas',
  },
  {
    id: '08-11', num: 11, titulo: 'NTILE — dividir en cuartiles', tipo: 'escribir',
    dificultad: 'avanzado', xp: 30, tabla: 'ventas',
    teoria: '<strong>NTILE(n)</strong> divide las filas en n grupos de igual tamaño y asigna el número de grupo a cada fila. NTILE(4) crea cuartiles. Es muy usado en análisis estadístico para segmentar datos en percentiles.',
    enunciado: 'Segmentá las ventas en <strong>4 cuartiles</strong> según el monto (de menor a mayor).\n\nMostrá <strong>id</strong>, <strong>monto</strong> y <strong>cuartil</strong> usando NTILE(4) OVER(ORDER BY monto). Ordená por monto.',
    pista: 'SELECT id, monto, NTILE(4) OVER(ORDER BY monto) AS cuartil FROM ventas ORDER BY monto',
    solucion: 'SELECT id, monto, NTILE(4) OVER(ORDER BY monto) AS cuartil FROM ventas ORDER BY monto',
  },
  {
    id: '08-12', num: 12, titulo: 'Desafío maestro: dashboard de ventas', tipo: 'escribir',
    dificultad: 'avanzado', xp: 45, tabla: 'ventas',
    teoria: 'Los dashboards de ventas reales combinan múltiples window functions en un mismo query. Podés tener varias funciones OVER() con distintas ventanas en el mismo SELECT — cada una define su propia lógica de agrupamiento y orden.',
    enunciado: 'Armá el dashboard completo de ventas con estas 4 columnas calculadas:\n- <strong>ranking_zona</strong>: RANK por zona (mayor monto primero)\n- <strong>total_zona</strong>: suma de ventas de la zona\n- <strong>pct_zona</strong>: porcentaje de la venta sobre el total de su zona (ROUND 1 decimal)\n- <strong>cuartil</strong>: NTILE 4 global por monto\n\nMostrá vendedor_id, zona, monto y las 4 columnas. Ordená por zona y ranking_zona.',
    pista: 'SELECT vendedor_id, zona, monto, RANK() OVER(PARTITION BY zona ORDER BY monto DESC) AS ranking_zona, SUM(monto) OVER(PARTITION BY zona) AS total_zona, ROUND(monto * 100.0 / SUM(monto) OVER(PARTITION BY zona), 1) AS pct_zona, NTILE(4) OVER(ORDER BY monto) AS cuartil FROM ventas ORDER BY zona, ranking_zona',
    solucion: 'SELECT vendedor_id, zona, monto, RANK() OVER(PARTITION BY zona ORDER BY monto DESC) AS ranking_zona, SUM(monto) OVER(PARTITION BY zona) AS total_zona, ROUND(monto * 100.0 / SUM(monto) OVER(PARTITION BY zona), 1) AS pct_zona, NTILE(4) OVER(ORDER BY monto) AS cuartil FROM ventas ORDER BY zona, ranking_zona',
  },
]

export const GLOSARIO_M7: GlosarioItem[] = [
  { termino: 'CTE (Common Table Expression)', descripcion: 'Consulta con nombre definida con WITH. Se usa como tabla temporal dentro del query.', ejemplo: 'WITH mi_cte AS (SELECT * FROM tabla WHERE condicion) SELECT * FROM mi_cte' },
  { termino: 'WITH', descripcion: 'Palabra clave que introduce uno o más CTEs antes del SELECT principal.', ejemplo: 'WITH cte1 AS (...), cte2 AS (...) SELECT * FROM cte2' },
  { termino: 'CTEs múltiples', descripcion: 'Varios CTEs separados por coma. El segundo puede referenciar al primero.', ejemplo: "WITH paso1 AS (SELECT * FROM envios WHERE estado='completado'), paso2 AS (SELECT zona, COUNT(*) FROM paso1 GROUP BY zona) SELECT * FROM paso2" },
  { termino: 'CTE vs Subquery', descripcion: 'Hacen lo mismo pero el CTE es más legible y reutilizable dentro del mismo query.', ejemplo: 'WITH totales AS (SELECT zona, SUM(peso_kg) AS t FROM envios GROUP BY zona) SELECT * FROM totales WHERE t > 500' },
  { termino: 'CTE recursivo', descripcion: 'CTE que se referencia a sí mismo. Útil para jerarquías y estructuras de árbol. (Avanzado)', ejemplo: 'WITH RECURSIVE jerarquia AS (SELECT * FROM tabla WHERE padre_id IS NULL UNION ALL SELECT t.* FROM tabla t JOIN jerarquia j ON t.padre_id = j.id)' },
]

export const GLOSARIO_M8: GlosarioItem[] = [
  { termino: 'Window Function', descripcion: 'Función que calcula sobre un conjunto de filas relacionadas sin colapsar el resultado.', ejemplo: 'SELECT monto, SUM(monto) OVER() AS total FROM ventas' },
  { termino: 'OVER()', descripcion: 'Define la ventana sobre la que opera la función. OVER() vacío = toda la tabla.', ejemplo: 'SUM(monto) OVER() — total de toda la tabla' },
  { termino: 'PARTITION BY', descripcion: 'Divide las filas en grupos dentro del OVER(). La función se aplica por grupo.', ejemplo: 'SUM(monto) OVER(PARTITION BY zona) — total por zona' },
  { termino: 'ROW_NUMBER()', descripcion: 'Número secuencial único por fila según el ORDER BY dentro del OVER().', ejemplo: 'ROW_NUMBER() OVER(ORDER BY monto DESC) AS ranking' },
  { termino: 'RANK()', descripcion: 'Ranking con huecos en caso de empate (1, 1, 3, 4...).', ejemplo: 'RANK() OVER(ORDER BY monto DESC)' },
  { termino: 'DENSE_RANK()', descripcion: 'Ranking sin huecos en caso de empate (1, 1, 2, 3...).', ejemplo: 'DENSE_RANK() OVER(ORDER BY monto DESC)' },
  { termino: 'LAG(col, n)', descripcion: 'Valor de la columna n filas antes de la fila actual.', ejemplo: 'LAG(monto) OVER(PARTITION BY vendedor_id ORDER BY fecha)' },
  { termino: 'LEAD(col, n)', descripcion: 'Valor de la columna n filas después de la fila actual.', ejemplo: 'LEAD(monto) OVER(ORDER BY fecha)' },
  { termino: 'NTILE(n)', descripcion: 'Divide las filas en n grupos iguales. NTILE(4) = cuartiles.', ejemplo: 'NTILE(4) OVER(ORDER BY monto) AS cuartil' },
  { termino: 'ROWS BETWEEN', descripcion: 'Define una ventana deslizante. ROWS BETWEEN 2 PRECEDING AND CURRENT ROW = fila actual + 2 anteriores.', ejemplo: 'AVG(monto) OVER(ORDER BY fecha ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)' },
  { termino: 'Suma acumulada', descripcion: 'SUM con ORDER BY en el OVER() — suma de todos los valores hasta la fila actual.', ejemplo: 'SUM(monto) OVER(ORDER BY fecha) AS acumulado' },
]

export const RESUMEN_M7: ResumenModulo = {
  titulo: 'Lo que aprendiste en CTEs',
  puntos: [
    'WITH nombre AS (query) define un CTE — una consulta con nombre reutilizable.',
    'El CTE se usa igual que una tabla en el SELECT principal.',
    'Podés filtrar sobre resultados de agregación (imposible con WHERE directo).',
    'CTEs múltiples: separados por coma, el segundo puede usar al primero.',
    'Podés hacer JOIN entre un CTE y otra tabla.',
    'Los CTEs hacen el mismo trabajo que subqueries pero son más legibles.',
    'Combiná CTEs con CASE WHEN para clasificaciones sobre cálculos complejos.',
  ],
  sintaxis: 'WITH cte_uno AS (\n  SELECT col, COUNT(*) AS n\n  FROM tabla\n  GROUP BY col\n),\ncte_dos AS (\n  SELECT cte_uno.col, tabla2.nombre, cte_uno.n\n  FROM cte_uno\n  INNER JOIN tabla2 ON cte_uno.col = tabla2.col\n)\nSELECT * FROM cte_dos\nWHERE n > 10\nORDER BY n DESC',
}

export const RESUMEN_M8: ResumenModulo = {
  titulo: 'Lo que aprendiste en Window Functions',
  puntos: [
    'OVER() define la ventana. OVER() vacío = toda la tabla.',
    'PARTITION BY divide la ventana en grupos (como GROUP BY pero sin colapsar).',
    'ROW_NUMBER(): número único por fila. RANK(): con huecos. DENSE_RANK(): sin huecos.',
    'LAG() = valor anterior. LEAD() = valor siguiente.',
    'SUM OVER(ORDER BY) = suma acumulada (running total).',
    'ROWS BETWEEN define ventanas deslizantes para promedios móviles.',
    'NTILE(n) divide en n grupos iguales (cuartiles, deciles, etc.).',
    'Para filtrar sobre el resultado de una window function, usá un CTE o subquery.',
  ],
  sintaxis: '-- Ranking por grupo\nSELECT col, grupo, valor,\n  RANK() OVER(PARTITION BY grupo ORDER BY valor DESC) AS ranking,\n  SUM(valor) OVER(PARTITION BY grupo) AS total_grupo,\n  ROUND(valor * 100.0 / SUM(valor) OVER(PARTITION BY grupo), 1) AS pct\nFROM tabla\n\n-- Top 1 por grupo\nWITH ranked AS (\n  SELECT *, ROW_NUMBER() OVER(PARTITION BY grupo ORDER BY valor DESC) AS rn\n  FROM tabla\n)\nSELECT * FROM ranked WHERE rn = 1',
}

// ── DATASETS M7 y M8 ──
export const DATASET_M7M8 = `
CREATE TABLE choferes(id INTEGER PRIMARY KEY,nombre TEXT,zona TEXT,antiguedad_anios INTEGER);
INSERT INTO choferes VALUES
(1,'Carlos Díaz','Norte',8),
(2,'Laura Martínez','Sur',5),
(3,'Miguel Torres','Norte',12),
(4,'Sofía Ruiz','Este',3),
(5,'Pablo García','Sur',9),
(6,'Ana López','Oeste',6);

CREATE TABLE envios(id INTEGER PRIMARY KEY,chofer_id INTEGER,zona TEXT,peso_kg REAL,estado TEXT,fecha TEXT);
INSERT INTO envios VALUES
(1,1,'Norte',45.5,'completado','2024-01-05'),
(2,1,'Norte',78.2,'completado','2024-01-06'),
(3,2,'Sur',23.1,'completado','2024-01-07'),
(4,3,'Norte',95.0,'completado','2024-01-08'),
(5,3,'Norte',110.5,'completado','2024-01-09'),
(6,4,'Este',34.8,'pendiente','2024-01-10'),
(7,2,'Sur',67.3,'completado','2024-01-11'),
(8,5,'Sur',88.9,'completado','2024-01-12'),
(9,1,'Norte',52.4,'completado','2024-01-13'),
(10,6,'Oeste',41.2,'completado','2024-01-14'),
(11,3,'Norte',73.6,'completado','2024-01-15'),
(12,4,'Este',29.9,'completado','2024-01-16'),
(13,5,'Sur',91.4,'completado','2024-01-17'),
(14,2,'Sur',44.7,'pendiente','2024-01-18'),
(15,6,'Oeste',58.3,'completado','2024-01-19'),
(16,1,'Norte',82.1,'completado','2024-01-20'),
(17,3,'Norte',66.8,'completado','2024-01-21'),
(18,5,'Sur',77.2,'completado','2024-01-22'),
(19,4,'Este',55.0,'completado','2024-01-23'),
(20,6,'Oeste',93.7,'completado','2024-01-24');

CREATE TABLE ventas(id INTEGER PRIMARY KEY,vendedor_id INTEGER,zona TEXT,monto REAL,fecha TEXT);
INSERT INTO ventas VALUES
(1,101,'Norte',8500,'2024-01-03'),
(2,102,'Sur',12300,'2024-01-05'),
(3,103,'Norte',6200,'2024-01-07'),
(4,101,'Norte',15800,'2024-01-10'),
(5,104,'Este',9400,'2024-01-12'),
(6,102,'Sur',7100,'2024-01-14'),
(7,103,'Norte',18200,'2024-01-16'),
(8,105,'Oeste',11600,'2024-01-18'),
(9,101,'Norte',6800,'2024-01-20'),
(10,104,'Este',14200,'2024-01-22'),
(11,102,'Sur',9800,'2024-01-24'),
(12,105,'Oeste',7500,'2024-01-26'),
(13,103,'Norte',21000,'2024-01-28'),
(14,101,'Norte',4300,'2024-02-01'),
(15,104,'Este',16700,'2024-02-03'),
(16,102,'Sur',13400,'2024-02-05'),
(17,105,'Oeste',8900,'2024-02-07'),
(18,103,'Norte',11300,'2024-02-09'),
(19,101,'Norte',19600,'2024-02-11'),
(20,104,'Este',5800,'2024-02-13');
`
