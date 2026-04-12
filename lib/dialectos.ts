export type Dialecto = 'sqlite' | 'postgresql' | 'mysql'

export const NOMBRES_DIALECTO: Record<Dialecto, string> = {
  sqlite: 'SQLite',
  postgresql: 'PostgreSQL',
  mysql: 'MySQL 8',
}

export const COLOR_DIALECTO: Record<Dialecto, string> = {
  sqlite: '#64748b',
  postgresql: '#336791',
  mysql: '#f29111',
}

// Notes per module (differences vs SQLite baseline)
export const NOTAS_POR_MODULO: Partial<Record<number, Partial<Record<Dialecto, string[]>>>> = {
  1: {
    postgresql: [
      'LIMIT funciona igual. Alternativa estándar: FETCH FIRST 5 ROWS ONLY',
      'ORDER BY es idéntico. Soporte adicional para NULLS FIRST / NULLS LAST',
      'Identificadores con mayúsculas necesitan comillas dobles: "NombreColumna"',
    ],
    mysql: [
      'LIMIT funciona igual que en SQLite',
      'ORDER BY es idéntico al estándar',
      'Los nombres de columnas son case-insensitive por defecto',
    ],
  },
  2: {
    postgresql: [
      'ILIKE para búsqueda case-insensitive: WHERE nombre ILIKE \'%ana%\'',
      'SIMILAR TO para patrones regex-like en strings',
      'Las comparaciones de texto son case-sensitive por defecto (a diferencia de MySQL)',
    ],
    mysql: [
      'LIKE es case-insensitive por defecto (según el collation de la tabla)',
      'REGEXP para patrones: WHERE nombre REGEXP \'^A\'',
      'NULL: usa IS NULL / IS NOT NULL igual que en SQLite',
    ],
  },
  3: {
    postgresql: [
      'FULL OUTER JOIN soportado nativamente (SQLite no lo tiene)',
      'JOIN ... USING (columna) disponible cuando ambas tablas comparten el nombre',
      'NATURAL JOIN disponible pero raramente recomendado en producción',
    ],
    mysql: [
      'FULL OUTER JOIN no disponible, se simula con LEFT JOIN UNION RIGHT JOIN',
      'JOIN ... USING (columna) disponible igual que en PostgreSQL',
      'RIGHT JOIN funciona igual que en SQLite',
    ],
  },
  4: {
    postgresql: [
      'FILTER (WHERE cond) para filtrar dentro de agregaciones: COUNT(*) FILTER (WHERE activo = true)',
      'GROUP BY ROLLUP disponible para calcular subtotales automáticamente',
      'HAVING funciona idéntico al estándar SQL',
    ],
    mysql: [
      'GROUP_CONCAT() para concatenar strings de un grupo: GROUP_CONCAT(nombre ORDER BY nombre)',
      'WITH ROLLUP para subtotales: GROUP BY departamento WITH ROLLUP',
      'HAVING funciona idéntico al estándar SQL',
    ],
  },
  5: {
    postgresql: [
      'STRING_AGG(col, sep) en lugar de GROUP_CONCAT: STRING_AGG(nombre, \', \' ORDER BY nombre)',
      'PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY col) para calcular la mediana',
      'BOOL_AND() y BOOL_OR() para agregaciones booleanas',
    ],
    mysql: [
      'GROUP_CONCAT() en lugar de STRING_AGG: GROUP_CONCAT(nombre SEPARATOR \', \')',
      'JSON_ARRAYAGG() para devolver resultados como array JSON',
      'STD() y VARIANCE() para estadísticas adicionales',
    ],
  },
  6: {
    postgresql: [
      'Subqueries idénticas al estándar. EXISTS y NOT EXISTS disponibles',
      'LATERAL JOIN como alternativa potente a subqueries en el FROM',
      'Subqueries correlacionadas totalmente soportadas y optimizadas',
    ],
    mysql: [
      'Subqueries disponibles desde MySQL 4.1',
      'EXISTS y NOT EXISTS soportados igual que en PostgreSQL',
      'En versiones antiguas los subqueries eran más lentos que JOINs equivalentes',
    ],
  },
  7: {
    postgresql: [
      'CTEs disponibles desde PostgreSQL 8.4 (2009)',
      'WITH RECURSIVE para CTEs recursivos (árboles, jerarquías)',
      'MATERIALIZED / NOT MATERIALIZED para controlar si el CTE se ejecuta una vez o inline',
    ],
    mysql: [
      'CTEs disponibles desde MySQL 8.0 (2018). MySQL 5.7 NO los soporta',
      'WITH RECURSIVE soportado en MySQL 8.0+',
      'La sintaxis WITH ... AS (...) es idéntica al estándar SQL',
    ],
  },
  8: {
    postgresql: [
      'Window functions disponibles desde PostgreSQL 8.4',
      'RANGE BETWEEN disponible además de ROWS BETWEEN',
      'GROUPS BETWEEN disponible desde PostgreSQL 11 para ventanas por grupos',
    ],
    mysql: [
      'Window functions disponibles desde MySQL 8.0 (NO en MySQL 5.7)',
      'ROW_NUMBER(), RANK(), DENSE_RANK(), LAG(), LEAD() son idénticos',
      'PARTITION BY y ORDER BY en OVER() funcionan igual que en PostgreSQL',
    ],
  },
  9: {
    postgresql: [
      'EXPLAIN ANALYZE para ver el plan de ejecución real con tiempos medidos',
      'Índices parciales: CREATE INDEX ON tabla (col) WHERE condicion',
      'Índices de expresión: CREATE INDEX ON tabla (LOWER(email))',
    ],
    mysql: [
      'EXPLAIN FORMAT=JSON para ver el plan de ejecución detallado',
      'FORCE INDEX / USE INDEX para forzar el uso de un índice específico',
      'Índices de texto completo: CREATE FULLTEXT INDEX ON tabla (columna)',
    ],
  },
  10: {
    postgresql: [
      'RETURNING en INSERT/UPDATE/DELETE para obtener las filas afectadas',
      'ON CONFLICT DO UPDATE para UPSERT nativo (más expresivo que MySQL)',
      'JSONB para almacenamiento y consulta eficiente de JSON con índices GIN',
    ],
    mysql: [
      'INSERT ... ON DUPLICATE KEY UPDATE para UPSERT',
      'JSON_EXTRACT() y operador -> para consultar JSON: datos->\'$.nombre\'',
      'REGEXP_REPLACE() y REGEXP_LIKE() disponibles desde MySQL 8.0',
    ],
  },
}
