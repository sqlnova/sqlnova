-- SQLNova · Retos semanales
-- Semana: 2026-04-13 a 2026-04-19

BEGIN;

DELETE FROM retos
WHERE fecha BETWEEN '2026-04-13' AND '2026-04-19';

INSERT INTO retos (fecha, nivel, titulo, enunciado, pista, solucion, xp, dataset_sql, activo)
VALUES
-- =========================
-- 2026-04-13 · Lunes
-- =========================
('2026-04-13','inicial','Top géneros por catálogo','Mostrá la cantidad de títulos por género. Devolvé columnas: genero, total_titulos. Ordená por total_titulos DESC.','Usá GROUP BY genero y COUNT(*).','SELECT genero, COUNT(*) AS total_titulos FROM contenido GROUP BY genero ORDER BY total_titulos DESC;',15,
'DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS contenido;
DROP TABLE IF EXISTS visualizaciones;
CREATE TABLE usuarios (id INTEGER, nombre TEXT, pais TEXT, plan TEXT, fecha_registro TEXT);
CREATE TABLE contenido (id INTEGER, titulo TEXT, genero TEXT, anio INTEGER, duracion_min INTEGER);
CREATE TABLE visualizaciones (id INTEGER, usuario_id INTEGER, contenido_id INTEGER, fecha TEXT, minutos_vistos INTEGER, completado INTEGER);
INSERT INTO usuarios VALUES
(1,''Ana'',''AR'',''pro'',''2025-11-02''),(2,''Luis'',''MX'',''basic'',''2025-12-10''),(3,''Carla'',''CO'',''pro'',''2026-01-15''),(4,''Diego'',''AR'',''premium'',''2026-02-01''),(5,''Sofía'',''CL'',''basic'',''2026-02-20''),(6,''Mateo'',''PE'',''pro'',''2026-03-01'');
INSERT INTO contenido VALUES
(101,''El Umbral'',''Sci-Fi'',2023,120),(102,''Ciudad Gris'',''Drama'',2022,95),(103,''Ritmo Nocturno'',''Música'',2024,88),(104,''Código Rojo'',''Thriller'',2021,110),(105,''Mares del Sur'',''Documental'',2020,70),(106,''Órbita 9'',''Sci-Fi'',2024,105),(107,''Barrio Norte'',''Drama'',2025,98),(108,''Cocina en Ruta'',''Reality'',2023,52);
INSERT INTO visualizaciones VALUES
(1,1,101,''2026-04-10'',120,1),(2,1,106,''2026-04-11'',95,0),(3,2,102,''2026-04-11'',90,0),(4,3,101,''2026-04-12'',120,1),(5,4,104,''2026-04-12'',110,1),(6,4,107,''2026-04-12'',98,1),(7,5,105,''2026-04-13'',50,0),(8,6,103,''2026-04-13'',88,1),(9,2,108,''2026-04-13'',52,1),(10,3,106,''2026-04-13'',105,1);',true),
('2026-04-13','avanzado','Consumo por país','Calculá minutos totales vistos por país usando JOIN entre usuarios y visualizaciones. Devolvé: pais, minutos_totales. Ordená por minutos_totales DESC.','JOIN por usuario_id = id y SUM(minutos_vistos).','SELECT u.pais, SUM(v.minutos_vistos) AS minutos_totales FROM usuarios u JOIN visualizaciones v ON v.usuario_id = u.id GROUP BY u.pais ORDER BY minutos_totales DESC;',30,
'DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS contenido;
DROP TABLE IF EXISTS visualizaciones;
CREATE TABLE usuarios (id INTEGER, nombre TEXT, pais TEXT, plan TEXT, fecha_registro TEXT);
CREATE TABLE contenido (id INTEGER, titulo TEXT, genero TEXT, anio INTEGER, duracion_min INTEGER);
CREATE TABLE visualizaciones (id INTEGER, usuario_id INTEGER, contenido_id INTEGER, fecha TEXT, minutos_vistos INTEGER, completado INTEGER);
INSERT INTO usuarios VALUES
(1,''Ana'',''AR'',''pro'',''2025-11-02''),(2,''Luis'',''MX'',''basic'',''2025-12-10''),(3,''Carla'',''CO'',''pro'',''2026-01-15''),(4,''Diego'',''AR'',''premium'',''2026-02-01''),(5,''Sofía'',''CL'',''basic'',''2026-02-20''),(6,''Mateo'',''PE'',''pro'',''2026-03-01'');
INSERT INTO contenido VALUES
(101,''El Umbral'',''Sci-Fi'',2023,120),(102,''Ciudad Gris'',''Drama'',2022,95),(103,''Ritmo Nocturno'',''Música'',2024,88),(104,''Código Rojo'',''Thriller'',2021,110),(105,''Mares del Sur'',''Documental'',2020,70),(106,''Órbita 9'',''Sci-Fi'',2024,105),(107,''Barrio Norte'',''Drama'',2025,98),(108,''Cocina en Ruta'',''Reality'',2023,52);
INSERT INTO visualizaciones VALUES
(1,1,101,''2026-04-10'',120,1),(2,1,106,''2026-04-11'',95,0),(3,2,102,''2026-04-11'',90,0),(4,3,101,''2026-04-12'',120,1),(5,4,104,''2026-04-12'',110,1),(6,4,107,''2026-04-12'',98,1),(7,5,105,''2026-04-13'',50,0),(8,6,103,''2026-04-13'',88,1),(9,2,108,''2026-04-13'',52,1),(10,3,106,''2026-04-13'',105,1);',true),
('2026-04-13','experto','Título más visto por minutos','Obtené el título con mayor suma de minutos vistos. Devolvé: titulo, minutos_totales.','Agrupá por título, sumá minutos y quedate con el TOP 1.','SELECT c.titulo, SUM(v.minutos_vistos) AS minutos_totales FROM visualizaciones v JOIN contenido c ON c.id = v.contenido_id GROUP BY c.titulo ORDER BY minutos_totales DESC LIMIT 1;',50,
'DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS contenido;
DROP TABLE IF EXISTS visualizaciones;
CREATE TABLE usuarios (id INTEGER, nombre TEXT, pais TEXT, plan TEXT, fecha_registro TEXT);
CREATE TABLE contenido (id INTEGER, titulo TEXT, genero TEXT, anio INTEGER, duracion_min INTEGER);
CREATE TABLE visualizaciones (id INTEGER, usuario_id INTEGER, contenido_id INTEGER, fecha TEXT, minutos_vistos INTEGER, completado INTEGER);
INSERT INTO usuarios VALUES
(1,''Ana'',''AR'',''pro'',''2025-11-02''),(2,''Luis'',''MX'',''basic'',''2025-12-10''),(3,''Carla'',''CO'',''pro'',''2026-01-15''),(4,''Diego'',''AR'',''premium'',''2026-02-01''),(5,''Sofía'',''CL'',''basic'',''2026-02-20''),(6,''Mateo'',''PE'',''pro'',''2026-03-01'');
INSERT INTO contenido VALUES
(101,''El Umbral'',''Sci-Fi'',2023,120),(102,''Ciudad Gris'',''Drama'',2022,95),(103,''Ritmo Nocturno'',''Música'',2024,88),(104,''Código Rojo'',''Thriller'',2021,110),(105,''Mares del Sur'',''Documental'',2020,70),(106,''Órbita 9'',''Sci-Fi'',2024,105),(107,''Barrio Norte'',''Drama'',2025,98),(108,''Cocina en Ruta'',''Reality'',2023,52);
INSERT INTO visualizaciones VALUES
(1,1,101,''2026-04-10'',120,1),(2,1,106,''2026-04-11'',95,0),(3,2,102,''2026-04-11'',90,0),(4,3,101,''2026-04-12'',120,1),(5,4,104,''2026-04-12'',110,1),(6,4,107,''2026-04-12'',98,1),(7,5,105,''2026-04-13'',50,0),(8,6,103,''2026-04-13'',88,1),(9,2,108,''2026-04-13'',52,1),(10,3,106,''2026-04-13'',105,1);',true),

-- =========================
-- 2026-04-14 · Martes
-- =========================
('2026-04-14','inicial','Planes activos','Contá usuarios por plan. Devolvé: plan, total_usuarios. Ordená por total_usuarios DESC.','Tabla usuarios + GROUP BY plan.','SELECT plan, COUNT(*) AS total_usuarios FROM usuarios GROUP BY plan ORDER BY total_usuarios DESC;',15,
'DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (id INTEGER, nombre TEXT, pais TEXT, plan TEXT, activo INTEGER, fecha_alta TEXT);
INSERT INTO usuarios VALUES
(1,''Ana'',''AR'',''pro'',1,''2025-10-01''),(2,''Luis'',''MX'',''basic'',1,''2025-11-03''),(3,''Carla'',''CO'',''pro'',1,''2025-12-15''),(4,''Diego'',''AR'',''premium'',1,''2026-01-10''),(5,''Sofía'',''CL'',''basic'',0,''2026-02-09''),(6,''Valen'',''AR'',''premium'',1,''2026-03-05''),(7,''Tomás'',''PE'',''basic'',1,''2026-03-20'');',true),
('2026-04-14','avanzado','Países con plan premium','Listá países con cantidad de usuarios premium activos. Devolvé: pais, premium_activos.','Filtrá plan = ''premium'' y activo = 1 antes del GROUP BY.','SELECT pais, COUNT(*) AS premium_activos FROM usuarios WHERE plan = ''premium'' AND activo = 1 GROUP BY pais ORDER BY premium_activos DESC;',30,
'DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (id INTEGER, nombre TEXT, pais TEXT, plan TEXT, activo INTEGER, fecha_alta TEXT);
INSERT INTO usuarios VALUES
(1,''Ana'',''AR'',''pro'',1,''2025-10-01''),(2,''Luis'',''MX'',''basic'',1,''2025-11-03''),(3,''Carla'',''CO'',''pro'',1,''2025-12-15''),(4,''Diego'',''AR'',''premium'',1,''2026-01-10''),(5,''Sofía'',''CL'',''basic'',0,''2026-02-09''),(6,''Valen'',''AR'',''premium'',1,''2026-03-05''),(7,''Tomás'',''PE'',''basic'',1,''2026-03-20'');',true),
('2026-04-14','experto','Tasa de actividad por plan','Calculá para cada plan: total_usuarios y activos_pct (porcentaje de activos, redondeado a 2 decimales).','Usá SUM(activo)*100.0/COUNT(*) y ROUND(...,2).','SELECT plan, COUNT(*) AS total_usuarios, ROUND(SUM(activo) * 100.0 / COUNT(*), 2) AS activos_pct FROM usuarios GROUP BY plan ORDER BY activos_pct DESC;',50,
'DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (id INTEGER, nombre TEXT, pais TEXT, plan TEXT, activo INTEGER, fecha_alta TEXT);
INSERT INTO usuarios VALUES
(1,''Ana'',''AR'',''pro'',1,''2025-10-01''),(2,''Luis'',''MX'',''basic'',1,''2025-11-03''),(3,''Carla'',''CO'',''pro'',1,''2025-12-15''),(4,''Diego'',''AR'',''premium'',1,''2026-01-10''),(5,''Sofía'',''CL'',''basic'',0,''2026-02-09''),(6,''Valen'',''AR'',''premium'',1,''2026-03-05''),(7,''Tomás'',''PE'',''basic'',1,''2026-03-20'');',true),

-- =========================
-- 2026-04-15 · Miércoles
-- =========================
('2026-04-15','inicial','Visualizaciones completadas','Mostrá cuántas visualizaciones quedaron completas (completado = 1). Devolvé: total_completadas.','COUNT(*) con filtro WHERE completado = 1.','SELECT COUNT(*) AS total_completadas FROM visualizaciones WHERE completado = 1;',15,
'DROP TABLE IF EXISTS contenido;
DROP TABLE IF EXISTS visualizaciones;
CREATE TABLE contenido (id INTEGER, titulo TEXT, genero TEXT);
CREATE TABLE visualizaciones (id INTEGER, contenido_id INTEGER, minutos_vistos INTEGER, completado INTEGER);
INSERT INTO contenido VALUES
(201,''Delta'' ,''Drama''),(202,''Sector 8'',''Sci-Fi''),(203,''Tiempo Lento'',''Documental''),(204,''Pista Cero'',''Thriller'');
INSERT INTO visualizaciones VALUES
(1,201,45,0),(2,201,92,1),(3,202,100,1),(4,202,60,0),(5,203,55,1),(6,204,40,0),(7,204,98,1);',true),
('2026-04-15','avanzado','Promedio de minutos por género','Calculá el promedio de minutos vistos por género. Devolvé: genero, minutos_promedio. Ordená desc.','JOIN + AVG(minutos_vistos).','SELECT c.genero, ROUND(AVG(v.minutos_vistos), 2) AS minutos_promedio FROM visualizaciones v JOIN contenido c ON c.id = v.contenido_id GROUP BY c.genero ORDER BY minutos_promedio DESC;',30,
'DROP TABLE IF EXISTS contenido;
DROP TABLE IF EXISTS visualizaciones;
CREATE TABLE contenido (id INTEGER, titulo TEXT, genero TEXT);
CREATE TABLE visualizaciones (id INTEGER, contenido_id INTEGER, minutos_vistos INTEGER, completado INTEGER);
INSERT INTO contenido VALUES
(201,''Delta'' ,''Drama''),(202,''Sector 8'',''Sci-Fi''),(203,''Tiempo Lento'',''Documental''),(204,''Pista Cero'',''Thriller'');
INSERT INTO visualizaciones VALUES
(1,201,45,0),(2,201,92,1),(3,202,100,1),(4,202,60,0),(5,203,55,1),(6,204,40,0),(7,204,98,1);',true),
('2026-04-15','experto','Géneros con alta finalización','Mostrá géneros con tasa de finalización > 50%. Devolvé: genero, tasa_finalizacion.','tasa = SUM(completado)*1.0/COUNT(*), y filtrá con HAVING.','SELECT c.genero, ROUND(SUM(v.completado) * 1.0 / COUNT(*), 2) AS tasa_finalizacion FROM visualizaciones v JOIN contenido c ON c.id = v.contenido_id GROUP BY c.genero HAVING SUM(v.completado) * 1.0 / COUNT(*) > 0.5 ORDER BY tasa_finalizacion DESC;',50,
'DROP TABLE IF EXISTS contenido;
DROP TABLE IF EXISTS visualizaciones;
CREATE TABLE contenido (id INTEGER, titulo TEXT, genero TEXT);
CREATE TABLE visualizaciones (id INTEGER, contenido_id INTEGER, minutos_vistos INTEGER, completado INTEGER);
INSERT INTO contenido VALUES
(201,''Delta'' ,''Drama''),(202,''Sector 8'',''Sci-Fi''),(203,''Tiempo Lento'',''Documental''),(204,''Pista Cero'',''Thriller'');
INSERT INTO visualizaciones VALUES
(1,201,45,0),(2,201,92,1),(3,202,100,1),(4,202,60,0),(5,203,55,1),(6,204,40,0),(7,204,98,1);',true),

-- =========================
-- 2026-04-16 · Jueves
-- =========================
('2026-04-16','inicial','Ingresos por plan','Sumá ingresos por plan. Devolvé: plan, ingreso_total.','Usá SUM(monto) agrupando por plan.','SELECT plan, SUM(monto) AS ingreso_total FROM pagos GROUP BY plan ORDER BY ingreso_total DESC;',15,
'DROP TABLE IF EXISTS pagos;
CREATE TABLE pagos (id INTEGER, usuario_id INTEGER, plan TEXT, monto REAL, fecha TEXT, estado TEXT);
INSERT INTO pagos VALUES
(1,1,''basic'',9.99,''2026-04-01'',''aprobado''),(2,2,''pro'',19.99,''2026-04-02'',''aprobado''),(3,3,''premium'',29.99,''2026-04-02'',''aprobado''),(4,4,''pro'',19.99,''2026-04-03'',''rechazado''),(5,5,''premium'',29.99,''2026-04-03'',''aprobado''),(6,1,''pro'',19.99,''2026-04-10'',''aprobado'');',true),
('2026-04-16','avanzado','Ticket promedio aprobado','Calculá el ticket_promedio de pagos aprobados por plan.','Filtrá estado = ''aprobado'' y aplicá AVG(monto).','SELECT plan, ROUND(AVG(monto), 2) AS ticket_promedio FROM pagos WHERE estado = ''aprobado'' GROUP BY plan ORDER BY ticket_promedio DESC;',30,
'DROP TABLE IF EXISTS pagos;
CREATE TABLE pagos (id INTEGER, usuario_id INTEGER, plan TEXT, monto REAL, fecha TEXT, estado TEXT);
INSERT INTO pagos VALUES
(1,1,''basic'',9.99,''2026-04-01'',''aprobado''),(2,2,''pro'',19.99,''2026-04-02'',''aprobado''),(3,3,''premium'',29.99,''2026-04-02'',''aprobado''),(4,4,''pro'',19.99,''2026-04-03'',''rechazado''),(5,5,''premium'',29.99,''2026-04-03'',''aprobado''),(6,1,''pro'',19.99,''2026-04-10'',''aprobado'');',true),
('2026-04-16','experto','Plan con mayor facturación aprobada','Devolvé solo el plan con mayor facturación aprobada. Columnas: plan, facturacion.','Agrupá pagos aprobados y quedate con LIMIT 1.','SELECT plan, SUM(monto) AS facturacion FROM pagos WHERE estado = ''aprobado'' GROUP BY plan ORDER BY facturacion DESC LIMIT 1;',50,
'DROP TABLE IF EXISTS pagos;
CREATE TABLE pagos (id INTEGER, usuario_id INTEGER, plan TEXT, monto REAL, fecha TEXT, estado TEXT);
INSERT INTO pagos VALUES
(1,1,''basic'',9.99,''2026-04-01'',''aprobado''),(2,2,''pro'',19.99,''2026-04-02'',''aprobado''),(3,3,''premium'',29.99,''2026-04-02'',''aprobado''),(4,4,''pro'',19.99,''2026-04-03'',''rechazado''),(5,5,''premium'',29.99,''2026-04-03'',''aprobado''),(6,1,''pro'',19.99,''2026-04-10'',''aprobado'');',true),

-- =========================
-- 2026-04-17 · Viernes
-- =========================
('2026-04-17','inicial','Contenido reciente','Listá títulos lanzados desde 2024 inclusive. Columnas: titulo, anio. Ordená por anio DESC.','WHERE anio >= 2024.','SELECT titulo, anio FROM contenido WHERE anio >= 2024 ORDER BY anio DESC, titulo ASC;',15,
'DROP TABLE IF EXISTS contenido;
CREATE TABLE contenido (id INTEGER, titulo TEXT, genero TEXT, anio INTEGER, rating REAL);
INSERT INTO contenido VALUES
(301,''Bruma Azul'',''Drama'',2022,7.8),(302,''Código Nube'',''Sci-Fi'',2024,8.4),(303,''Mapa Ciego'',''Thriller'',2025,8.1),(304,''Ruta Lenta'',''Documental'',2021,7.5),(305,''Voltaje'',''Acción'',2026,8.7);',true),
('2026-04-17','avanzado','Promedio rating por género','Mostrá rating promedio por género con 2 decimales. Columnas: genero, rating_promedio.','AVG(rating) y ROUND(...,2).','SELECT genero, ROUND(AVG(rating), 2) AS rating_promedio FROM contenido GROUP BY genero ORDER BY rating_promedio DESC;',30,
'DROP TABLE IF EXISTS contenido;
CREATE TABLE contenido (id INTEGER, titulo TEXT, genero TEXT, anio INTEGER, rating REAL);
INSERT INTO contenido VALUES
(301,''Bruma Azul'',''Drama'',2022,7.8),(302,''Código Nube'',''Sci-Fi'',2024,8.4),(303,''Mapa Ciego'',''Thriller'',2025,8.1),(304,''Ruta Lenta'',''Documental'',2021,7.5),(305,''Voltaje'',''Acción'',2026,8.7);',true),
('2026-04-17','experto','Ranking de títulos por rating','Creá un ranking de mayor a menor rating usando ROW_NUMBER(). Columnas: puesto, titulo, rating.','ROW_NUMBER() OVER (ORDER BY rating DESC).','SELECT ROW_NUMBER() OVER (ORDER BY rating DESC) AS puesto, titulo, rating FROM contenido ORDER BY puesto;',50,
'DROP TABLE IF EXISTS contenido;
CREATE TABLE contenido (id INTEGER, titulo TEXT, genero TEXT, anio INTEGER, rating REAL);
INSERT INTO contenido VALUES
(301,''Bruma Azul'',''Drama'',2022,7.8),(302,''Código Nube'',''Sci-Fi'',2024,8.4),(303,''Mapa Ciego'',''Thriller'',2025,8.1),(304,''Ruta Lenta'',''Documental'',2021,7.5),(305,''Voltaje'',''Acción'',2026,8.7);',true),

-- =========================
-- 2026-04-18 · Sábado
-- =========================
('2026-04-18','inicial','Usuarios de Argentina','Mostrá nombre y plan de usuarios de AR. Columnas: nombre, plan.','WHERE pais = ''AR''.','SELECT nombre, plan FROM usuarios WHERE pais = ''AR'' ORDER BY nombre;',15,
'DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (id INTEGER, nombre TEXT, pais TEXT, plan TEXT, xp INTEGER);
INSERT INTO usuarios VALUES
(1,''Ana'',''AR'',''pro'',420),(2,''Luis'',''MX'',''basic'',180),(3,''Carla'',''CO'',''pro'',350),(4,''Diego'',''AR'',''premium'',510),(5,''Sofía'',''CL'',''basic'',210),(6,''Noa'',''AR'',''basic'',130);',true),
('2026-04-18','avanzado','XP promedio por país','Calculá xp_promedio por país.','GROUP BY pais + AVG(xp).','SELECT pais, ROUND(AVG(xp), 2) AS xp_promedio FROM usuarios GROUP BY pais ORDER BY xp_promedio DESC;',30,
'DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (id INTEGER, nombre TEXT, pais TEXT, plan TEXT, xp INTEGER);
INSERT INTO usuarios VALUES
(1,''Ana'',''AR'',''pro'',420),(2,''Luis'',''MX'',''basic'',180),(3,''Carla'',''CO'',''pro'',350),(4,''Diego'',''AR'',''premium'',510),(5,''Sofía'',''CL'',''basic'',210),(6,''Noa'',''AR'',''basic'',130);',true),
('2026-04-18','experto','Top usuario por país','Mostrá el usuario con más xp dentro de cada país. Columnas: pais, nombre, xp.','Usá ROW_NUMBER() PARTITION BY pais ORDER BY xp DESC y filtrá rn=1.','WITH ranking AS (SELECT pais, nombre, xp, ROW_NUMBER() OVER (PARTITION BY pais ORDER BY xp DESC) AS rn FROM usuarios) SELECT pais, nombre, xp FROM ranking WHERE rn = 1 ORDER BY pais;',50,
'DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (id INTEGER, nombre TEXT, pais TEXT, plan TEXT, xp INTEGER);
INSERT INTO usuarios VALUES
(1,''Ana'',''AR'',''pro'',420),(2,''Luis'',''MX'',''basic'',180),(3,''Carla'',''CO'',''pro'',350),(4,''Diego'',''AR'',''premium'',510),(5,''Sofía'',''CL'',''basic'',210),(6,''Noa'',''AR'',''basic'',130);',true),

-- =========================
-- 2026-04-19 · Domingo
-- =========================
('2026-04-19','inicial','Sesiones por día','Contá cuántas sesiones hubo por fecha. Columnas: fecha, total_sesiones.','GROUP BY fecha.','SELECT fecha, COUNT(*) AS total_sesiones FROM sesiones GROUP BY fecha ORDER BY fecha;',15,
'DROP TABLE IF EXISTS sesiones;
CREATE TABLE sesiones (id INTEGER, usuario_id INTEGER, fecha TEXT, minutos INTEGER, dispositivo TEXT);
INSERT INTO sesiones VALUES
(1,1,''2026-04-15'',25,''mobile''),(2,2,''2026-04-15'',40,''desktop''),(3,1,''2026-04-16'',30,''desktop''),(4,3,''2026-04-16'',50,''mobile''),(5,4,''2026-04-17'',45,''tablet''),(6,2,''2026-04-17'',20,''mobile''),(7,5,''2026-04-17'',35,''desktop'');',true),
('2026-04-19','avanzado','Minutos por dispositivo','Sumá minutos por dispositivo. Columnas: dispositivo, minutos_totales.','SUM(minutos) + GROUP BY dispositivo.','SELECT dispositivo, SUM(minutos) AS minutos_totales FROM sesiones GROUP BY dispositivo ORDER BY minutos_totales DESC;',30,
'DROP TABLE IF EXISTS sesiones;
CREATE TABLE sesiones (id INTEGER, usuario_id INTEGER, fecha TEXT, minutos INTEGER, dispositivo TEXT);
INSERT INTO sesiones VALUES
(1,1,''2026-04-15'',25,''mobile''),(2,2,''2026-04-15'',40,''desktop''),(3,1,''2026-04-16'',30,''desktop''),(4,3,''2026-04-16'',50,''mobile''),(5,4,''2026-04-17'',45,''tablet''),(6,2,''2026-04-17'',20,''mobile''),(7,5,''2026-04-17'',35,''desktop'');',true),
('2026-04-19','experto','Retención día a día','Calculá el cambio de minutos vs día previo con LAG(). Columnas: fecha, minutos_dia, delta_vs_prev.','Primero agregá minutos por fecha y después aplicá LAG.','WITH diario AS (SELECT fecha, SUM(minutos) AS minutos_dia FROM sesiones GROUP BY fecha) SELECT fecha, minutos_dia, minutos_dia - LAG(minutos_dia) OVER (ORDER BY fecha) AS delta_vs_prev FROM diario ORDER BY fecha;',50,
'DROP TABLE IF EXISTS sesiones;
CREATE TABLE sesiones (id INTEGER, usuario_id INTEGER, fecha TEXT, minutos INTEGER, dispositivo TEXT);
INSERT INTO sesiones VALUES
(1,1,''2026-04-15'',25,''mobile''),(2,2,''2026-04-15'',40,''desktop''),(3,1,''2026-04-16'',30,''desktop''),(4,3,''2026-04-16'',50,''mobile''),(5,4,''2026-04-17'',45,''tablet''),(6,2,''2026-04-17'',20,''mobile''),(7,5,''2026-04-17'',35,''desktop'');',true);

COMMIT;
