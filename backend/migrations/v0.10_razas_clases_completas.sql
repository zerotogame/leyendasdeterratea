-- v0.10: carga completa de razas y clases (generado desde terratea-web/src/data/razas.json y clases.json).
-- Se puede ejecutar varias veces: no toca las razas/clases que ya existen (Humano, Elfo Oscuro, Berserker, Cazador).
-- Renegado es una sola raza en la BD (la web no envía la subraza); los rasgos de cada subraza llevan su nombre delante.

-- ================= RAZAS =================

-- Autómata
INSERT INTO public.races (name, max_carry_kg)
SELECT 'Autómata', 50
WHERE NOT EXISTS (SELECT 1 FROM public.races WHERE name = 'Autómata');

INSERT INTO public.race_saves (race_id, level_min, level_max, save_id, value)
SELECT r.id, v.level_min, v.level_max, v.save_id, v.value
FROM public.races r,
  (VALUES
    (1, 10, 1, 1),
    (1, 10, 2, 16),
    (1, 10, 3, 7),
    (1, 10, 4, 1),
    (1, 10, 5, 19),
    (11, NULL, 1, 1),
    (11, NULL, 2, 5),
    (11, NULL, 3, 4),
    (11, NULL, 4, 1),
    (11, NULL, 5, 7)
  ) AS v(level_min, level_max, save_id, value)
WHERE r.name = 'Autómata'
ON CONFLICT (race_id, level_min, save_id) DO UPDATE SET level_max = EXCLUDED.level_max, value = EXCLUDED.value;

DELETE FROM public.race_traits WHERE race_id = (SELECT id FROM public.races WHERE name = 'Autómata');
INSERT INTO public.race_traits (race_id, kind, name, description)
SELECT r.id, x.kind, x.name, x.description
FROM public.races r,
  (VALUES
    ('strength', 'No puede ser envenenado', NULL),
    ('strength', 'No puede ser atemorizados', NULL),
    ('strength', 'No sufren de hambre ni sed', NULL),
    ('weakness', 'Complexión muy débil', '-3 de constitución'),
    ('weakness', 'Engaño fácil', '-2 en ante tiradas de engaño')
  ) AS x(kind, name, description)
WHERE r.name = 'Autómata';

-- Aviroide
INSERT INTO public.races (name, max_carry_kg)
SELECT 'Aviroide', 50
WHERE NOT EXISTS (SELECT 1 FROM public.races WHERE name = 'Aviroide');

INSERT INTO public.race_saves (race_id, level_min, level_max, save_id, value)
SELECT r.id, v.level_min, v.level_max, v.save_id, v.value
FROM public.races r,
  (VALUES
    (1, 3, 1, 10),
    (1, 3, 2, 16),
    (1, 3, 3, 14),
    (1, 3, 4, 14),
    (1, 3, 5, 13),
    (4, 6, 1, 6),
    (4, 6, 2, 13),
    (4, 6, 3, 12),
    (4, 6, 4, 13),
    (4, 6, 5, 12),
    (7, 9, 1, 5),
    (7, 9, 2, 11),
    (7, 9, 3, 10),
    (7, 9, 4, 12),
    (7, 9, 5, 10),
    (10, 12, 1, 5),
    (10, 12, 2, 10),
    (10, 12, 3, 9),
    (10, 12, 4, 11),
    (10, 12, 5, 9),
    (13, 15, 1, 5),
    (13, 15, 2, 7),
    (13, 15, 3, 7),
    (13, 15, 4, 8),
    (13, 15, 5, 6),
    (16, 18, 1, 5),
    (16, 18, 2, 5),
    (16, 18, 3, 6),
    (16, 18, 4, 6),
    (16, 18, 5, 4),
    (19, NULL, 1, 3),
    (19, NULL, 2, 4),
    (19, NULL, 3, 4),
    (19, NULL, 4, 3),
    (19, NULL, 5, 4)
  ) AS v(level_min, level_max, save_id, value)
WHERE r.name = 'Aviroide'
ON CONFLICT (race_id, level_min, save_id) DO UPDATE SET level_max = EXCLUDED.level_max, value = EXCLUDED.value;

DELETE FROM public.race_traits WHERE race_id = (SELECT id FROM public.races WHERE name = 'Aviroide');
INSERT INTO public.race_traits (race_id, kind, name, description)
SELECT r.id, x.kind, x.name, x.description
FROM public.races r,
  (VALUES
    ('strength', 'Pueden Volar', NULL),
    ('strength', 'Valor', '+2 en las tiradas de iniciativa'),
    ('weakness', 'Debilidad ante el rayo', '+2 de daño'),
    ('weakness', 'Debilidad ante temperaturas frías', '-1')
  ) AS x(kind, name, description)
WHERE r.name = 'Aviroide';

-- Elfo
INSERT INTO public.races (name, max_carry_kg)
SELECT 'Elfo', 40
WHERE NOT EXISTS (SELECT 1 FROM public.races WHERE name = 'Elfo');

INSERT INTO public.race_saves (race_id, level_min, level_max, save_id, value)
SELECT r.id, v.level_min, v.level_max, v.save_id, v.value
FROM public.races r,
  (VALUES
    (1, 3, 1, 12),
    (1, 3, 2, 13),
    (1, 3, 3, 13),
    (1, 3, 4, 15),
    (1, 3, 5, 15),
    (4, 6, 1, 10),
    (4, 6, 2, 11),
    (4, 6, 3, 11),
    (4, 6, 4, 13),
    (4, 6, 5, 13),
    (7, 9, 1, 8),
    (7, 9, 2, 9),
    (7, 9, 3, 9),
    (7, 9, 4, 9),
    (7, 9, 5, 11),
    (10, NULL, 1, 6),
    (10, NULL, 2, 7),
    (10, NULL, 3, 7),
    (10, NULL, 4, 7),
    (10, NULL, 5, 9)
  ) AS v(level_min, level_max, save_id, value)
WHERE r.name = 'Elfo'
ON CONFLICT (race_id, level_min, save_id) DO UPDATE SET level_max = EXCLUDED.level_max, value = EXCLUDED.value;

DELETE FROM public.race_traits WHERE race_id = (SELECT id FROM public.races WHERE name = 'Elfo');
INSERT INTO public.race_traits (race_id, kind, name, description)
SELECT r.id, x.kind, x.name, x.description
FROM public.races r,
  (VALUES
    ('strength', 'Detectar magia', NULL),
    ('strength', 'Propenso a la magia', '+1 de daño por ataque mágico'),
    ('strength', 'Resistencia Élfica', '-1 de daño ante la magia Arcana'),
    ('weakness', 'Arrogancia', '-1 a las tiradas de Engaño'),
    ('weakness', 'Complexión débil', '+1 de daño recibido por ataque físico')
  ) AS x(kind, name, description)
WHERE r.name = 'Elfo';

-- Enano
INSERT INTO public.races (name, max_carry_kg)
SELECT 'Enano', 60
WHERE NOT EXISTS (SELECT 1 FROM public.races WHERE name = 'Enano');

INSERT INTO public.race_saves (race_id, level_min, level_max, save_id, value)
SELECT r.id, v.level_min, v.level_max, v.save_id, v.value
FROM public.races r,
  (VALUES
    (1, 3, 1, 8),
    (1, 3, 2, 9),
    (1, 3, 3, 10),
    (1, 3, 4, 13),
    (1, 3, 5, 12),
    (4, 6, 1, 6),
    (4, 6, 2, 7),
    (4, 6, 3, 8),
    (4, 6, 4, 10),
    (4, 6, 5, 10),
    (7, 9, 1, 4),
    (7, 9, 2, 5),
    (7, 9, 3, 6),
    (7, 9, 4, 7),
    (7, 9, 5, 8),
    (10, NULL, 1, 2),
    (10, NULL, 2, 3),
    (10, NULL, 3, 4),
    (10, NULL, 4, 4),
    (10, NULL, 5, 6)
  ) AS v(level_min, level_max, save_id, value)
WHERE r.name = 'Enano'
ON CONFLICT (race_id, level_min, save_id) DO UPDATE SET level_max = EXCLUDED.level_max, value = EXCLUDED.value;

DELETE FROM public.race_traits WHERE race_id = (SELECT id FROM public.races WHERE name = 'Enano');
INSERT INTO public.race_traits (race_id, kind, name, description)
SELECT r.id, x.kind, x.name, x.description
FROM public.races r,
  (VALUES
    ('strength', 'Artesanos', '+1 a la tirada de habilidad para crear objetos'),
    ('strength', 'Terráneos', '+2 de resistencia a daño elemental'),
    ('strength', 'Mineros', 'Encontrar objeto extra'),
    ('weakness', 'Beligerantes', '-3 de resistencia a las tiradas para ser provocados'),
    ('weakness', 'Aversión a la magia', 'penalización de -2 al uso de cualquier objeto mágico')
  ) AS x(kind, name, description)
WHERE r.name = 'Enano';

-- Felino
INSERT INTO public.races (name, max_carry_kg)
SELECT 'Felino', 50
WHERE NOT EXISTS (SELECT 1 FROM public.races WHERE name = 'Felino');

INSERT INTO public.race_saves (race_id, level_min, level_max, save_id, value)
SELECT r.id, v.level_min, v.level_max, v.save_id, v.value
FROM public.races r,
  (VALUES
    (1, 3, 1, 9),
    (1, 3, 2, 14),
    (1, 3, 3, 13),
    (1, 3, 4, 16),
    (1, 3, 5, 14),
    (4, 6, 1, 6),
    (4, 6, 2, 13),
    (4, 6, 3, 12),
    (4, 6, 4, 13),
    (4, 6, 5, 12),
    (7, 9, 1, 5),
    (7, 9, 2, 11),
    (7, 9, 3, 10),
    (7, 9, 4, 12),
    (7, 9, 5, 10),
    (10, 12, 1, 3),
    (10, 12, 2, 8),
    (10, 12, 3, 9),
    (10, 12, 4, 11),
    (10, 12, 5, 8),
    (13, 15, 1, 3),
    (13, 15, 2, 7),
    (13, 15, 3, 6),
    (13, 15, 4, 8),
    (13, 15, 5, 6),
    (16, 18, 1, 2),
    (16, 18, 2, 5),
    (16, 18, 3, 5),
    (16, 18, 4, 6),
    (16, 18, 5, 4),
    (19, NULL, 1, 2),
    (19, NULL, 2, 3),
    (19, NULL, 3, 3),
    (19, NULL, 4, 5),
    (19, NULL, 5, 4)
  ) AS v(level_min, level_max, save_id, value)
WHERE r.name = 'Felino'
ON CONFLICT (race_id, level_min, save_id) DO UPDATE SET level_max = EXCLUDED.level_max, value = EXCLUDED.value;

DELETE FROM public.race_traits WHERE race_id = (SELECT id FROM public.races WHERE name = 'Felino');
INSERT INTO public.race_traits (race_id, kind, name, description)
SELECT r.id, x.kind, x.name, x.description
FROM public.races r,
  (VALUES
    ('strength', 'Pelaje felino', 'resistencia al frío +1'),
    ('strength', 'Garras', 'ataque sin armas 1d6'),
    ('strength', 'Visión Nocturna', NULL),
    ('weakness', 'Ralentización de movimiento en calor', '-1 movimiento'),
    ('weakness', 'Hidrofóbicos', '-1 al movimiento en el agua')
  ) AS x(kind, name, description)
WHERE r.name = 'Felino';

-- Gnomo
INSERT INTO public.races (name, max_carry_kg)
SELECT 'Gnomo', 35
WHERE NOT EXISTS (SELECT 1 FROM public.races WHERE name = 'Gnomo');

INSERT INTO public.race_saves (race_id, level_min, level_max, save_id, value)
SELECT r.id, v.level_min, v.level_max, v.save_id, v.value
FROM public.races r,
  (VALUES
    (1, 4, 1, 16),
    (1, 4, 2, 15),
    (1, 4, 3, 13),
    (1, 4, 4, 16),
    (1, 4, 5, 14),
    (5, 8, 1, 14),
    (5, 8, 2, 13),
    (5, 8, 3, 11),
    (5, 8, 4, 14),
    (5, 8, 5, 12),
    (9, 12, 1, 12),
    (9, 12, 2, 11),
    (9, 12, 3, 9),
    (9, 12, 4, 12),
    (9, 12, 5, 10),
    (13, 16, 1, 10),
    (13, 16, 2, 9),
    (13, 16, 3, 7),
    (13, 16, 4, 10),
    (13, 16, 5, 8),
    (17, NULL, 1, 8),
    (17, NULL, 2, 7),
    (17, NULL, 3, 5),
    (17, NULL, 4, 8),
    (17, NULL, 5, 5)
  ) AS v(level_min, level_max, save_id, value)
WHERE r.name = 'Gnomo'
ON CONFLICT (race_id, level_min, save_id) DO UPDATE SET level_max = EXCLUDED.level_max, value = EXCLUDED.value;

DELETE FROM public.race_traits WHERE race_id = (SELECT id FROM public.races WHERE name = 'Gnomo');
INSERT INTO public.race_traits (race_id, kind, name, description)
SELECT r.id, x.kind, x.name, x.description
FROM public.races r,
  (VALUES
    ('strength', 'Ágiles', '+1 de dificultad al recibir daños a distancia'),
    ('strength', 'Inventores', '+2 a la tirada de elaborar objetos'),
    ('weakness', 'Complexión muy débil', '+ 2 al recibir daños físicos y +1 al recibir daños mágicos')
  ) AS x(kind, name, description)
WHERE r.name = 'Gnomo';

-- Goblin
INSERT INTO public.races (name, max_carry_kg)
SELECT 'Goblin', 35
WHERE NOT EXISTS (SELECT 1 FROM public.races WHERE name = 'Goblin');

INSERT INTO public.race_saves (race_id, level_min, level_max, save_id, value)
SELECT r.id, v.level_min, v.level_max, v.save_id, v.value
FROM public.races r,
  (VALUES
    (1, 4, 1, 15),
    (1, 4, 2, 16),
    (1, 4, 3, 14),
    (1, 4, 4, 15),
    (1, 4, 5, 14),
    (5, 8, 1, 12),
    (5, 8, 2, 12),
    (5, 8, 3, 12),
    (5, 8, 4, 14),
    (5, 8, 5, 13),
    (9, 12, 1, 11),
    (9, 12, 2, 11),
    (9, 12, 3, 11),
    (9, 12, 4, 12),
    (9, 12, 5, 10),
    (13, 16, 1, 9),
    (13, 16, 2, 8),
    (13, 16, 3, 7),
    (13, 16, 4, 10),
    (13, 16, 5, 8),
    (17, NULL, 1, 7),
    (17, NULL, 2, 7),
    (17, NULL, 3, 6),
    (17, NULL, 4, 7),
    (17, NULL, 5, 5)
  ) AS v(level_min, level_max, save_id, value)
WHERE r.name = 'Goblin'
ON CONFLICT (race_id, level_min, save_id) DO UPDATE SET level_max = EXCLUDED.level_max, value = EXCLUDED.value;

DELETE FROM public.race_traits WHERE race_id = (SELECT id FROM public.races WHERE name = 'Goblin');
INSERT INTO public.race_traits (race_id, kind, name, description)
SELECT r.id, x.kind, x.name, x.description
FROM public.races r,
  (VALUES
    ('strength', 'Ágiles', '+1 de dificultad al recibir daño a distancia'),
    ('strength', 'Zapadores', '+2 al daño con explosivos'),
    ('weakness', 'Complexión muy débil (+ 2 al recibir daños físicos y +1 al recibir daños mágicos', NULL)
  ) AS x(kind, name, description)
WHERE r.name = 'Goblin';

-- Jotun
INSERT INTO public.races (name, max_carry_kg)
SELECT 'Jotun', 85
WHERE NOT EXISTS (SELECT 1 FROM public.races WHERE name = 'Jotun');

INSERT INTO public.race_saves (race_id, level_min, level_max, save_id, value)
SELECT r.id, v.level_min, v.level_max, v.save_id, v.value
FROM public.races r,
  (VALUES
    (1, 3, 1, 7),
    (1, 3, 2, 7),
    (1, 3, 3, 7),
    (1, 3, 4, 7),
    (1, 3, 5, 7),
    (4, 8, 1, 6),
    (4, 8, 2, 6),
    (4, 8, 3, 6),
    (4, 8, 4, 6),
    (4, 8, 5, 6),
    (9, 15, 1, 4),
    (9, 15, 2, 4),
    (9, 15, 3, 4),
    (9, 15, 4, 4),
    (9, 15, 5, 4),
    (15, NULL, 1, 3),
    (15, NULL, 2, 3),
    (15, NULL, 3, 3),
    (15, NULL, 4, 3),
    (15, NULL, 5, 3)
  ) AS v(level_min, level_max, save_id, value)
WHERE r.name = 'Jotun'
ON CONFLICT (race_id, level_min, save_id) DO UPDATE SET level_max = EXCLUDED.level_max, value = EXCLUDED.value;

DELETE FROM public.race_traits WHERE race_id = (SELECT id FROM public.races WHERE name = 'Jotun');
INSERT INTO public.race_traits (race_id, kind, name, description)
SELECT r.id, x.kind, x.name, x.description
FROM public.races r,
  (VALUES
    ('strength', 'Cuerpo Colosal', '+2Constitución'),
    ('strength', 'Fuerza sobrehumana', '+2 de fuerza'),
    ('strength', '+1 de alcance', NULL),
    ('weakness', 'Reflejos bajos', '-2 destreza'),
    ('weakness', 'Blanco Fácil', '-2 al trabarse en combate')
  ) AS x(kind, name, description)
WHERE r.name = 'Jotun';

-- Nahiaride
INSERT INTO public.races (name, max_carry_kg)
SELECT 'Nahiaride', 37.5
WHERE NOT EXISTS (SELECT 1 FROM public.races WHERE name = 'Nahiaride');

INSERT INTO public.race_saves (race_id, level_min, level_max, save_id, value)
SELECT r.id, v.level_min, v.level_max, v.save_id, v.value
FROM public.races r,
  (VALUES
    (1, 3, 1, 8),
    (1, 3, 2, 9),
    (1, 3, 3, 10),
    (1, 3, 4, 13),
    (1, 3, 5, 12),
    (4, 6, 1, 6),
    (4, 6, 2, 7),
    (4, 6, 3, 8),
    (4, 6, 4, 10),
    (4, 6, 5, 10),
    (7, NULL, 1, 4),
    (7, NULL, 2, 5),
    (7, NULL, 3, 6),
    (7, NULL, 4, 7),
    (7, NULL, 5, 8)
  ) AS v(level_min, level_max, save_id, value)
WHERE r.name = 'Nahiaride'
ON CONFLICT (race_id, level_min, save_id) DO UPDATE SET level_max = EXCLUDED.level_max, value = EXCLUDED.value;

DELETE FROM public.race_traits WHERE race_id = (SELECT id FROM public.races WHERE name = 'Nahiaride');
INSERT INTO public.race_traits (race_id, kind, name, description)
SELECT r.id, x.kind, x.name, x.description
FROM public.races r,
  (VALUES
    ('strength', 'Gran salto y planear en el aire', NULL),
    ('strength', '+2 a las tiradas de hechizos de naturaleza', NULL),
    ('strength', '+1 de Daño contra enemigos de gran tamaño', NULL),
    ('weakness', '+2 de daño de fuego recibido', NULL),
    ('weakness', 'Herméticos', '-1 a las tiradas de convencimiento o persuasión')
  ) AS x(kind, name, description)
WHERE r.name = 'Nahiaride';

-- Orco
INSERT INTO public.races (name, max_carry_kg)
SELECT 'Orco', 65
WHERE NOT EXISTS (SELECT 1 FROM public.races WHERE name = 'Orco');

INSERT INTO public.race_saves (race_id, level_min, level_max, save_id, value)
SELECT r.id, v.level_min, v.level_max, v.save_id, v.value
FROM public.races r,
  (VALUES
    (1, 3, 1, 12),
    (1, 3, 2, 13),
    (1, 3, 3, 14),
    (1, 3, 4, 15),
    (1, 3, 5, 15),
    (4, 6, 1, 10),
    (4, 6, 2, 11),
    (4, 6, 3, 12),
    (4, 6, 4, 13),
    (4, 6, 5, 12),
    (7, 9, 1, 8),
    (7, 9, 2, 9),
    (7, 9, 3, 10),
    (7, 9, 4, 9),
    (7, 9, 5, 11),
    (10, 12, 1, 6),
    (10, 12, 2, 7),
    (10, 12, 3, 8),
    (10, 12, 4, 7),
    (10, 12, 5, 10),
    (13, 15, 1, 4),
    (13, 15, 2, 5),
    (13, 15, 3, 7),
    (13, 15, 4, 5),
    (13, 15, 5, 8),
    (16, 18, 1, 4),
    (16, 18, 2, 5),
    (16, 18, 3, 5),
    (16, 18, 4, 4),
    (16, 18, 5, 7),
    (19, NULL, 1, 3),
    (19, NULL, 2, 4),
    (19, NULL, 3, 4),
    (19, NULL, 4, 4),
    (19, NULL, 5, 5)
  ) AS v(level_min, level_max, save_id, value)
WHERE r.name = 'Orco'
ON CONFLICT (race_id, level_min, save_id) DO UPDATE SET level_max = EXCLUDED.level_max, value = EXCLUDED.value;

DELETE FROM public.race_traits WHERE race_id = (SELECT id FROM public.races WHERE name = 'Orco');
INSERT INTO public.race_traits (race_id, kind, name, description)
SELECT r.id, x.kind, x.name, x.description
FROM public.races r,
  (VALUES
    ('strength', 'Infatigable', NULL),
    ('strength', 'Robustez', '+ 1 de bloqueo de daño físico'),
    ('strength', 'Fuerte sentido del honor', NULL),
    ('weakness', 'Fuerte sentido del honor', NULL),
    ('weakness', 'Debilidad ante la magia', '+1 de daño por ataque mágico recibido')
  ) AS x(kind, name, description)
WHERE r.name = 'Orco';

-- Renegado
INSERT INTO public.races (name, max_carry_kg)
SELECT 'Renegado', 55
WHERE NOT EXISTS (SELECT 1 FROM public.races WHERE name = 'Renegado');

INSERT INTO public.race_saves (race_id, level_min, level_max, save_id, value)
SELECT r.id, v.level_min, v.level_max, v.save_id, v.value
FROM public.races r,
  (VALUES
    (1, 3, 1, 10),
    (1, 3, 2, 18),
    (1, 3, 3, 15),
    (1, 3, 4, 18),
    (1, 3, 5, 19),
    (4, 6, 1, 8),
    (4, 6, 2, 17),
    (4, 6, 3, 13),
    (4, 6, 4, 15),
    (4, 6, 5, 18),
    (7, 9, 1, 6),
    (7, 9, 2, 15),
    (7, 9, 3, 10),
    (7, 9, 4, 10),
    (7, 9, 5, 16),
    (10, 12, 1, 4),
    (10, 12, 2, 12),
    (10, 12, 3, 8),
    (10, 12, 4, 8),
    (10, 12, 5, 10),
    (13, 15, 1, 3),
    (13, 15, 2, 7),
    (13, 15, 3, 8),
    (13, 15, 4, 6),
    (13, 15, 5, 8),
    (16, 18, 1, 2),
    (16, 18, 2, 6),
    (16, 18, 3, 6),
    (16, 18, 4, 6),
    (16, 18, 5, 6),
    (19, NULL, 1, 1),
    (19, NULL, 2, 3),
    (19, NULL, 3, 3),
    (19, NULL, 4, 4),
    (19, NULL, 5, 4)
  ) AS v(level_min, level_max, save_id, value)
WHERE r.name = 'Renegado'
ON CONFLICT (race_id, level_min, save_id) DO UPDATE SET level_max = EXCLUDED.level_max, value = EXCLUDED.value;

DELETE FROM public.race_traits WHERE race_id = (SELECT id FROM public.races WHERE name = 'Renegado');
INSERT INTO public.race_traits (race_id, kind, name, description)
SELECT r.id, x.kind, x.name, x.description
FROM public.races r,
  (VALUES
    ('strength', 'Hombre lobo: Seguir rastros', NULL),
    ('strength', 'Hombre lobo: Superfuerza', '+2 fuerza'),
    ('strength', 'Hombre lobo: Regeneración +1 por turno', NULL),
    ('strength', 'Hombre lobo: Agilidad', '+2 a la esquiva'),
    ('strength', 'Hombre lobo: Sentidos agudizados', '+1 a la percepción'),
    ('strength', 'Hombre lobo: Infatigable', NULL),
    ('strength', 'Hombre lobo: Aullido aterrador', '+2 a intimidación'),
    ('strength', 'Hombre lobo: +15 de Vitalidad en transformación', NULL),
    ('strength', 'Hombre lobo: Garras y mordiscos de lobo (nivel 1 al 5 2D6, nivel 6 al 10 2D10, nivel 11 al 18 2D12 y nivel 19-20 2D20) más modificador de fuerza', NULL),
    ('weakness', 'Hombre lobo: Las habilidades solo se pueden activar de noche', NULL),
    ('weakness', 'Hombre lobo: Inconsciencia', 'Tirada de salvación por Magia y Maldiciones'),
    ('weakness', 'Hombre lobo: Odiados', 'Las demás razas sienten odio o miedo ante estos seres, obtienen un -2 en el modificador de carisma'),
    ('weakness', 'Hombre lobo: Vulnerabilidad ante la plata', '+3 de daño recibido e interrumpe la regeneración'),
    ('weakness', 'Hombre lobo: No puede usar ropas, ni armas', NULL),
    ('weakness', 'Hombre lobo: Rango de alcance reducido a 1', NULL),
    ('strength', 'No-Muerto: Inmortalidad', 'No puede morir por el paso del tiempo'),
    ('strength', 'No-Muerto: Infatigable', NULL),
    ('strength', 'No-Muerto: No necesita alimentarse, ni saciarse', NULL),
    ('strength', 'No-Muerto: No necesita dormir', NULL),
    ('strength', 'No-Muerto: Maldito', '+3 al daño por maldiciones o magia oscura'),
    ('strength', 'No-Muerto: Regeneración rápida', '+1 de curación cada turno'),
    ('strength', 'No-Muerto: Consciencia Perenne', 'al llegar a 0 no se queda inconsciente'),
    ('strength', 'No-Muerto: Telepatía No muerta', 'puede comunicarse con entidades zombis o no muertas'),
    ('weakness', 'No-Muerto: Radiación.', 'durante el día el daño por maldiciones en vez de ser +3, será de +1'),
    ('weakness', 'No-Muerto: Odiados', 'Las demás razas sienten odio o miedo ante estos seres, obtienen un -2 en el modificador de carisma'),
    ('weakness', 'No-Muerto: Debilidad racial', 'es más vulnerable al control mental por parte de nigromantes, liche u otras entidades de control de no muertos'),
    ('weakness', 'No-Muerto: Vulnerabilidad al daño sagrado', 'recibe +2 de daño por ataque sagrado'),
    ('weakness', 'No-Muerto: Ocultación', 'debido a su naturaleza no muerta, debe de ocultar su rostro en sitios públicos'),
    ('strength', 'Semidemonio: Fuerza sobrehumana', '+1 a la fuerza'),
    ('strength', 'Semidemonio: Regeneración demoníaca', '+1 de recuperación de vida cada turno'),
    ('strength', 'Semidemonio: Resistencia demoníaca', '-2 al daño por habilidades demoníacas'),
    ('strength', 'Semidemonio: Visión térmica', NULL),
    ('strength', 'Semidemonio: Inmunidad parcial al daño de fuego', '-2 daño recibido por fuego'),
    ('strength', 'Semidemonio: Alma de demonio', '+1 daño por habilidad de fuego o maldiciones'),
    ('strength', 'Semidemonio: Aprendizaje avanzado', '+10 a la tirada de aprendizaje'),
    ('strength', 'Semidemonio: Inmunidad a las pesadillas', NULL),
    ('weakness', 'Semidemonio: Parte humana', '+1 recibido por daño oscuro'),
    ('weakness', 'Semidemonio: Odiados', 'Las demás razas sienten odio o miedo ante estos seres, obtienen un -2 en el modificador de carisma'),
    ('weakness', 'Semidemonio: Inconsciencia', 'después de cada combate, se debe de tirar una tirada de salvación de control mental para que tu parte demonio no se apodere de ti y ataque a tus compañeros'),
    ('weakness', 'Semidemonio: Debilidad a la luz sagrada', '+1 de daño recibido por ataque sagrado'),
    ('weakness', 'Semidemonio: Parte demonio', 'resistencia reducida a la seducción a -2')
  ) AS x(kind, name, description)
WHERE r.name = 'Renegado';

-- Reptiliano
INSERT INTO public.races (name, max_carry_kg)
SELECT 'Reptiliano', 50
WHERE NOT EXISTS (SELECT 1 FROM public.races WHERE name = 'Reptiliano');

INSERT INTO public.race_saves (race_id, level_min, level_max, save_id, value)
SELECT r.id, v.level_min, v.level_max, v.save_id, v.value
FROM public.races r,
  (VALUES
    (1, 3, 1, 8),
    (1, 3, 2, 15),
    (1, 3, 3, 14),
    (1, 3, 4, 15),
    (1, 3, 5, 14),
    (4, 6, 1, 6),
    (4, 6, 2, 13),
    (4, 6, 3, 12),
    (4, 6, 4, 13),
    (4, 6, 5, 12),
    (7, 9, 1, 5),
    (7, 9, 2, 11),
    (7, 9, 3, 10),
    (7, 9, 4, 12),
    (7, 9, 5, 10),
    (10, 12, 1, 4),
    (10, 12, 2, 9),
    (10, 12, 3, 8),
    (10, 12, 4, 10),
    (10, 12, 5, 8),
    (13, 15, 1, 3),
    (13, 15, 2, 7),
    (13, 15, 3, 6),
    (13, 15, 4, 8),
    (13, 15, 5, 6),
    (16, 18, 1, 2),
    (16, 18, 2, 5),
    (16, 18, 3, 5),
    (16, 18, 4, 6),
    (16, 18, 5, 4),
    (19, NULL, 1, 2),
    (19, NULL, 2, 4),
    (19, NULL, 3, 4),
    (19, NULL, 4, 4),
    (19, NULL, 5, 3)
  ) AS v(level_min, level_max, save_id, value)
WHERE r.name = 'Reptiliano'
ON CONFLICT (race_id, level_min, save_id) DO UPDATE SET level_max = EXCLUDED.level_max, value = EXCLUDED.value;

DELETE FROM public.race_traits WHERE race_id = (SELECT id FROM public.races WHERE name = 'Reptiliano');
INSERT INTO public.race_traits (race_id, kind, name, description)
SELECT r.id, x.kind, x.name, x.description
FROM public.races r,
  (VALUES
    ('strength', 'Respiración acuática', NULL),
    ('strength', 'Bilis Venenosa', 'El personaje puede envenenar a un enemigo, el daño es igual al modificador de sabiduría'),
    ('strength', 'Regeneración de miembros', 'El personaje puede recuperar, con el paso del tiempo, aquellos miembros perdidos que no sean vitales.'),
    ('weakness', 'Debilidad ante el rayo', '+2 de daño'),
    ('weakness', 'Ralentización de movimiento en frio', '-1 movimiento')
  ) AS x(kind, name, description)
WHERE r.name = 'Reptiliano';

-- Sátiro
INSERT INTO public.races (name, max_carry_kg)
SELECT 'Sátiro', 40
WHERE NOT EXISTS (SELECT 1 FROM public.races WHERE name = 'Sátiro');

INSERT INTO public.race_saves (race_id, level_min, level_max, save_id, value)
SELECT r.id, v.level_min, v.level_max, v.save_id, v.value
FROM public.races r,
  (VALUES
    (1, 5, 1, 8),
    (1, 5, 2, 9),
    (1, 5, 3, 10),
    (1, 5, 4, 11),
    (1, 5, 5, 12),
    (6, 10, 1, 7),
    (6, 10, 2, 8),
    (6, 10, 3, 9),
    (6, 10, 4, 8),
    (6, 10, 5, 7),
    (10, NULL, 1, 6),
    (10, NULL, 2, 7),
    (10, NULL, 3, 8),
    (10, NULL, 4, 7),
    (10, NULL, 5, 6)
  ) AS v(level_min, level_max, save_id, value)
WHERE r.name = 'Sátiro'
ON CONFLICT (race_id, level_min, save_id) DO UPDATE SET level_max = EXCLUDED.level_max, value = EXCLUDED.value;

DELETE FROM public.race_traits WHERE race_id = (SELECT id FROM public.races WHERE name = 'Sátiro');
INSERT INTO public.race_traits (race_id, kind, name, description)
SELECT r.id, x.kind, x.name, x.description
FROM public.races r,
  (VALUES
    ('strength', 'Camuflaje', NULL),
    ('strength', 'Cocineros', 'todas las comidas restauran salud'),
    ('weakness', 'Dependencia de la naturaleza', '-1 a las tiradas de destreza fuera de bosque')
  ) AS x(kind, name, description)
WHERE r.name = 'Sátiro';

-- Semielfo
INSERT INTO public.races (name, max_carry_kg)
SELECT 'Semielfo', 45
WHERE NOT EXISTS (SELECT 1 FROM public.races WHERE name = 'Semielfo');

INSERT INTO public.race_saves (race_id, level_min, level_max, save_id, value)
SELECT r.id, v.level_min, v.level_max, v.save_id, v.value
FROM public.races r,
  (VALUES
    (1, 4, 1, 11),
    (1, 4, 2, 12),
    (1, 4, 3, 14),
    (1, 4, 4, 16),
    (1, 4, 5, 15),
    (5, 8, 1, 9),
    (5, 8, 2, 10),
    (5, 8, 3, 12),
    (5, 8, 4, 14),
    (5, 8, 5, 12),
    (9, 12, 1, 7),
    (9, 12, 2, 8),
    (9, 12, 3, 10),
    (9, 12, 4, 12),
    (9, 12, 5, 9),
    (13, 16, 1, 3),
    (13, 16, 2, 4),
    (13, 16, 3, 8),
    (13, 16, 4, 8),
    (13, 16, 5, 6),
    (17, NULL, 1, 2),
    (17, NULL, 2, 4),
    (17, NULL, 3, 6),
    (17, NULL, 4, 6),
    (17, NULL, 5, 5)
  ) AS v(level_min, level_max, save_id, value)
WHERE r.name = 'Semielfo'
ON CONFLICT (race_id, level_min, save_id) DO UPDATE SET level_max = EXCLUDED.level_max, value = EXCLUDED.value;

DELETE FROM public.race_traits WHERE race_id = (SELECT id FROM public.races WHERE name = 'Semielfo');
INSERT INTO public.race_traits (race_id, kind, name, description)
SELECT r.id, x.kind, x.name, x.description
FROM public.races r,
  (VALUES
    ('strength', 'Versátil', 'pueden aprender cualquier clase'),
    ('strength', 'Aprendizaje avanzado', '+10 a la tirada de aprendizaje'),
    ('strength', 'Propenso a la magia', '+1 de daño por ataque mágico'),
    ('weakness', 'Miedo al rechazo', '-2 ante tirada de engaño'),
    ('weakness', 'Debilidad ante las maldiciones', '+1 de daño recibido por ataques oscuros')
  ) AS x(kind, name, description)
WHERE r.name = 'Semielfo';

-- Semiorco
INSERT INTO public.races (name, max_carry_kg)
SELECT 'Semiorco', 60
WHERE NOT EXISTS (SELECT 1 FROM public.races WHERE name = 'Semiorco');

INSERT INTO public.race_saves (race_id, level_min, level_max, save_id, value)
SELECT r.id, v.level_min, v.level_max, v.save_id, v.value
FROM public.races r,
  (VALUES
    (1, 3, 1, 12),
    (1, 3, 2, 13),
    (1, 3, 3, 14),
    (1, 3, 4, 15),
    (1, 3, 5, 16),
    (4, 6, 1, 10),
    (4, 6, 2, 11),
    (4, 6, 3, 12),
    (4, 6, 4, 13),
    (4, 6, 5, 14),
    (7, 9, 1, 8),
    (7, 9, 2, 9),
    (7, 9, 3, 10),
    (7, 9, 4, 9),
    (7, 9, 5, 12),
    (10, 12, 1, 6),
    (10, 12, 2, 7),
    (10, 12, 3, 8),
    (10, 12, 4, 7),
    (10, 12, 5, 10),
    (13, 15, 1, 4),
    (13, 15, 2, 5),
    (13, 15, 3, 6),
    (13, 15, 4, 5),
    (13, 15, 5, 8),
    (16, 18, 1, 4),
    (16, 18, 2, 4),
    (16, 18, 3, 5),
    (16, 18, 4, 4),
    (16, 18, 5, 7),
    (19, NULL, 1, 3),
    (19, NULL, 2, 3),
    (19, NULL, 3, 4),
    (19, NULL, 4, 4),
    (19, NULL, 5, 6)
  ) AS v(level_min, level_max, save_id, value)
WHERE r.name = 'Semiorco'
ON CONFLICT (race_id, level_min, save_id) DO UPDATE SET level_max = EXCLUDED.level_max, value = EXCLUDED.value;

DELETE FROM public.race_traits WHERE race_id = (SELECT id FROM public.races WHERE name = 'Semiorco');
INSERT INTO public.race_traits (race_id, kind, name, description)
SELECT r.id, x.kind, x.name, x.description
FROM public.races r,
  (VALUES
    ('strength', 'Robustez', '+1 de bloqueo de daño físico'),
    ('strength', 'Versátil', 'pueden aprender cualquier clase'),
    ('weakness', 'Miedo al rechazo', '-2 ante tirada de engaño'),
    ('weakness', 'Debilidad ante la magia', '-1 de daño de magia recibido')
  ) AS x(kind, name, description)
WHERE r.name = 'Semiorco';

-- Troloide
INSERT INTO public.races (name, max_carry_kg)
SELECT 'Troloide', 50
WHERE NOT EXISTS (SELECT 1 FROM public.races WHERE name = 'Troloide');

INSERT INTO public.race_saves (race_id, level_min, level_max, save_id, value)
SELECT r.id, v.level_min, v.level_max, v.save_id, v.value
FROM public.races r,
  (VALUES
    (1, 3, 1, 15),
    (1, 3, 2, 14),
    (1, 3, 3, 14),
    (1, 3, 4, 14),
    (1, 3, 5, 14),
    (4, 6, 1, 13),
    (4, 6, 2, 12),
    (4, 6, 3, 12),
    (4, 6, 4, 12),
    (4, 6, 5, 12),
    (7, 9, 1, 11),
    (7, 9, 2, 10),
    (7, 9, 3, 10),
    (7, 9, 4, 10),
    (7, 9, 5, 10),
    (10, 12, 1, 7),
    (10, 12, 2, 8),
    (10, 12, 3, 8),
    (10, 12, 4, 8),
    (10, 12, 5, 8),
    (13, 15, 1, 6),
    (13, 15, 2, 6),
    (13, 15, 3, 6),
    (13, 15, 4, 6),
    (13, 15, 5, 6),
    (16, 18, 1, 5),
    (16, 18, 2, 5),
    (16, 18, 3, 5),
    (16, 18, 4, 5),
    (16, 18, 5, 4),
    (19, NULL, 1, 5),
    (19, NULL, 2, 4),
    (19, NULL, 3, 3),
    (19, NULL, 4, 4),
    (19, NULL, 5, 3)
  ) AS v(level_min, level_max, save_id, value)
WHERE r.name = 'Troloide'
ON CONFLICT (race_id, level_min, save_id) DO UPDATE SET level_max = EXCLUDED.level_max, value = EXCLUDED.value;

DELETE FROM public.race_traits WHERE race_id = (SELECT id FROM public.races WHERE name = 'Troloide');
INSERT INTO public.race_traits (race_id, kind, name, description)
SELECT r.id, x.kind, x.name, x.description
FROM public.races r,
  (VALUES
    ('strength', 'Regeneración pasiva', '+1 de vida cada turno'),
    ('strength', 'Gruesa piel', '+1 de bloqueo de daño físico'),
    ('strength', 'Regeneración de miembros', 'El personaje puede recuperar, con el paso del tiempo, aquellos miembros perdidos que no sean vitales.'),
    ('weakness', 'Debilidad ante ácido y venenos', '+2 de daño'),
    ('weakness', 'Ingenuidad', '-2 ante tirada de salvación por engaño')
  ) AS x(kind, name, description)
WHERE r.name = 'Troloide';

-- ================= CLASES =================

-- Alquimista
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Alquimista', 'Cualquiera', 4, 'Ligera',
  'No puede usar armas pesadas Escudo Ligero: (El personaje está limitado a utilizar únicamente una rodela como escudo)',
  '12 Sabiduría, 10 Inteligencia', 'Juego de alquimia, Guías de Alquimia',
  ARRAY['Autómata', 'Elfo Oscuro', 'Enano', 'Felino', 'Gnomo', 'Goblin', 'Humano', 'Nahiaride', 'Renegado', 'Sátiro', 'Semielfo', 'Semiorco']::text[],
  2, 1, 4, 3, 1,
  '{"Sabiduría":12,"Inteligencia":10}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Alquimista');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Alquimista');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,1000),(3,2000),(4,5000),(5,7000),(6,10000),(7,25000),(8,50000),(9,75000),(10,100000),(11,250000),(12,300000),(13,450000),(14,600000),(15,750000),(16,850000),(17,900000),(18,935000),(19,975000),(20,1000000)) AS x(level, xp)
WHERE c.name = 'Alquimista';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Alquimista');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Cóctel Incendiario', 'A', 'El personaje prepara un cóctel incendiario utilizando un recipiente, alcohol y una mecha. Al prender fuego a la mecha y lanzarlo, provoca 1D6 de daño más modificador de Inteligencia y aplica una quemadura adicional de 1 punto de daño pasivo. El cóctel también crea un área de cuatro casillas en llamas que inflige 1D4 + Inteligencia de daño por turno a cualquier criatura que permanezca en ella.'),
    (0, 'Destreza Arrojadiza', 'P', 'El personaje obtiene una bonificación de +3 a la Destreza para lanzar hechizos, lanzas pócimas y viales a los objetivos'),
    (0, 'Investigación', 'A', 'El personaje puede leer e introducirse en un guía para alquimista, accediendo al conocimiento dentro de sus páginas y descubriendo secretos alquímicos o habilidades ocultas.'),
    (0, 'Herboristería', 'P', 'El personaje tiene un amplio conocimiento sobre todas las variedades de plantas y recibe una bonificación de +5 a las tiradas de suerte al recolectarlas.'),
    (0, 'Conocimiento base de productos Alquímicos', 'P', 'El personaje posee un conocimiento exhaustivo de todos los ingredientes para alquimia conocidos, permitiéndole identificar, recolectar y utilizar cualquier componente con precisión.'),
    (1, 'Pócima Purificadora', 'A', 'El personaje puede elaborar una poción que neutraliza venenos activos, cura afecciones y elimina enfermedades comunes.'),
    (1, 'Elaborar Pócima de Curación Inferior', 'A', 'El personaje puede crear una pócima que restaura una vitalidad de 1D10 más modificador de Sabiduría de un solo uso a un solo objetivo por combate'),
    (3, 'Pócima Venenosa', 'A', 'El personaje crea una poción de veneno que, al aplicarse en un arma, puede envenenar al objetivo con un ataque exitoso. El veneno inflige 1d4 más modificador de Sabiduría de daño pasivo por turno.'),
    (3, 'Pócima de Ácido', 'A', 'El personaje puede crear una poción de ácido capaz de degradar o derretir cualquier tipo de arma, armadura o escudo'),
    (3, 'Elaboración de pócimas de suministro', 'A', 'El personaje elabora una pócima que suprime la sed y el hambre momentáneamente'),
    (5, 'Elaborar Pócima de Curación Media', 'A', 'El personaje puede crear una pócima que restaura una vitalidad de 5D10 más modificador de Sabiduría de un solo uso a un solo objetivo por combate'),
    (5, 'Cóctel Incendiario Mejorado', 'A', 'El personaje perfecciona su cóctel incendiario. Al lanzarlo, provoca 1D8 de daño más el modificador de Inteligencia y aplica una quemadura adicional de 3 puntos de daño pasivo por turno. Además, el área de efecto en llamas se expande a seis casillas, infligiendo 1D6 + Inteligencia de daño por turno a cualquier criatura dentro de ella'),
    (5, 'Pócima para respirar bajo el agua', 'A', 'El personaje realiza una pócima que puede hacer que quien la tome, respire bajo el agua'),
    (5, 'Restaurar', 'A', 'El personaje puede recuperar una planta o algún producto alquímico deteriorado o marchito'),
    (7, 'Trasmutación I', 'P', 'Ingredientes) (El personaje puede modificar la composición de plantas, hierbas y vegetales para transformarlos en otros distintos, siempre que haya estudiado previamente la composición química del material deseado.'),
    (7, 'Concentración', 'P', 'Aumenta el modificador de sabiduría del personaje en +2'),
    (7, 'Leer lenguas', 'P', 'El personaje puede leer todas las lenguas, tanto vivas como muertas o demoníacas'),
    (10, 'Elaborar Pócima de Curación Superior', 'A', 'El personaje puede crear una pócima que restaura una vitalidad de 10D10 más modificador de Sabiduría de un solo uso a un solo objetivo por combate'),
    (10, 'Investigación Aleatoria', 'A', 'El personaje tiene la capacidad de aprender una receta aleatoria que no haya descubierto previamente, utilizando materiales que no haya empleado antes en ninguna otra receta, el resultado nunca puede coincidir con pociones que se aprenden en niveles superiores'),
    (11, 'Sapiente', 'P', 'El modificador de sabiduría del personaje aumenta en +3 y todas sus habilidades de creaciones alquímicas tiene una bonificación de +20 a la tirada'),
    (11, 'Precisión de Lanzamiento', 'P', 'El personaje recibe un bonificador de +2 en el modificador de destreza cuando lanza pociones a objetivos enemigos'),
    (13, 'Pócima de la verdad', 'A', 'El personaje realiza una pócima que obliga a quien la beba de manera temporal a decir la verdad irremediablemente'),
    (13, 'Pócima de resistencia a las temperaturas', 'A', 'El personaje realiza una pócima que resiste a todas las temperaturas de manera momentánea'),
    (13, 'Pócima de Miedo y Alucinógenos', 'A', 'El personaje puede crear una poción que induce miedo y alucinaciones en el objetivo, causando desorientación temporal.'),
    (15, 'Trasmutación II', 'P', 'Minerales, metales y rocas) (El personaje puede modificar la composición de minerales, metales o rocas para convertirlos en otros distintos, siempre que haya estudiado previamente la composición química del material deseado.'),
    (15, 'Pócima de amor', 'A', 'El personaje realiza una pócima que puede enamorar temporalmente quien la toma del primer individuo que vea'),
    (15, 'Elaborar Pócima de Máxima Curación', 'A', 'El personaje puede crear una pócima que restaura la vitalidad completa, "Solo se puede usar una vez por combate y por personaje."'),
    (15, 'Pócima de muerte', 'A', 'El personaje elabora una pócima que mata de manera instantánea y sin dejar rastro, solo se puede beber'),
    (17, 'Trasmutación III', 'P', 'Pócimas) (El personaje puede transformar pociones en otras diferentes, siempre que haya aprendido la receta de la poción deseada.'),
    (17, 'Pócima de Resurrección', 'A', 'El personaje puede elaborar una poción que revive a un ser, personaje o animal que haya muerto, con una penalización de 1 nivel menos.'),
    (17, 'Pócima de Maximización de Habilidades', 'A', 'El personaje puede elaborar una poción que aumenta el modificador de una característica en +3 durante un combate. Solo se puede usar una vez por combate y por personaje.'),
    (20, 'Transfiguraciones de Seres Vivos', 'P', 'El personaje puede transformar a otros en aspectos físicos, clases, personalidades o alterar los puntos de estadísticas, modificando completamente su naturaleza y habilidades de manera permanente.')
  ) AS a(level, name, action, description)
WHERE c.name = 'Alquimista';

-- Amazona
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Amazona', 'Cualquiera', 4, 'Ligera / Media',
  'No puede usar armas pesadas Sin escudo: (El personaje no puede equipar ningún tipo de escudo)',
  '10 Destreza, 12 Constitución', 'Montura',
  ARRAY['Elfo Oscuro', 'Enano', 'Humano', 'Jotun', 'Nahiaride', 'Orco', 'Sátiro', 'Semielfo', 'Semiorco']::text[],
  3, 5, 3, 1, 3,
  '{"Destreza":10,"Constitución":12}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Amazona');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Amazona');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,2000),(3,4000),(4,8000),(5,16000),(6,32000),(7,65000),(8,120000),(9,240000),(10,360000),(11,480000),(12,600000),(13,720000),(14,840000),(15,950000),(16,1100000),(17,1200000),(18,1300000),(19,1400000),(20,1500000)) AS x(level, xp)
WHERE c.name = 'Amazona';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Amazona');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Equitación', 'P', 'Cuando el personaje se encuentra montado, su movimiento base aumenta en +3 y su movimiento en combate se incrementa en +6, además de la movilidad correspondiente a su clase.'),
    (0, 'Mejora de Movilidad', 'P', 'El personaje incrementa su velocidad de desplazamiento en +2 casillas cuando se encuentra en bosques y junglas'),
    (0, 'Resistencia a la Seducción', 'P', 'El personaje obtiene una bonificación de +5 en su resistencia contra intentos de seducción o encantamientos relacionados con el amor'),
    (0, 'Aversión a las ciudades y la tecnología', 'P', 'el personaje siente rechazo por las grandes ciudades y por la tecnología'),
    (0, 'Sastre', 'A', 'el personaje puede fabricar armaduras ligeras si tiene materiales suficientes'),
    (0, 'Bravo Jinete', 'P', 'Cuando realiza un ataque sobre su montura y el personaje aun le quede movimiento, una vez realizado el ataque puedes destrabarse del combate y gastar el resto del movimiento'),
    (0, 'Peletería y Desuello', 'A', 'El personaje tiene la habilidad de desollar criaturas, curtir las pieles obtenidas y elaborar armaduras de nivel medio'),
    (0, 'Bonificación en Bosques y junglas', 'P', 'El personaje recibe un bonificador de +1 a todas las tiradas realizadas mientras se encuentra en un entorno boscoso o de jungla'),
    (3, 'Agilidad', 'P', 'El personaje obtiene un aumento de +2 para esquivar ataques y +1 una casilla de movimiento'),
    (3, 'Rastreo', 'A', 'El personaje posee la habilidad para seguir el rastro de un objetivo mediante huellas y señales en el entorno, lo que le permite localizarlo a lo largo de diversos terrenos.'),
    (3, 'Recolector', 'P', 'El personaje obtiene un bonificador de +4 en las tiradas para buscar y recolectar alimento.'),
    (5, 'Saltar y Trepar', 'P', 'el personaje puede saltar y trepar tanto por los árboles, muros, murallas, y otros obstáculos, superándolos con facilidad.'),
    (5, 'Furia de amazona', 'P', 'el personaje tiene una bonificación de +2 de daño infligido frente al género masculino'),
    (5, 'Camuflaje', 'A', 'el personaje se oculta con el entorno, permaneciendo inmóvil mientras utiliza esta habilidad para evitar ser detectada.'),
    (7, 'Experta con Lanza', 'P', 'Aumenta en +2 el bonificador de destreza del personaje al usar arma de asta'),
    (7, 'Experta comunicación NO verbal', 'A', 'el personaje puede comunicarse con los animales por medio de mímica y sonidos'),
    (7, 'Disciplina', 'A', 'El personaje puede curarse a sí mismo de un estado negativo'),
    (10, 'Mejora de Armadura Ligera', 'P', 'Cuando el personaje usa una armadura ligera, su Clase de Armadura (C.A.) aumenta en -1.'),
    (10, 'Destreza de Arquera Ecuestre', 'P', 'Cuando está sobre una montura, el personaje obtiene una bonificación de +3 en destreza y +1 en daño al usar arco.'),
    (10, 'Jabalina', 'P', 'El personaje incrementa el rango de visión en +2 casillas y el daño en +3 al atacar con una jabalina.'),
    (13, 'Conocimiento de Plantas Curativas y tóxicas', 'A', 'El personaje es capaz de identificar, recolectar y utilizar plantas para curar venenos y enfermedades, así como para crear antídotos y remedios.'),
    (13, 'Plantas Medicinales', 'P', 'El personaje puede utilizar plantas para sanar que restaura 1d8 puntos de vida más el bonificador de Sabiduría.'),
    (13, 'Cuerpo de Amazona', 'P', 'El personaje recibe un aumento de +4 en el bonificador de Constitución y +1 en la de Fuerza'),
    (15, 'Experta en Combate contra Bestias', 'P', 'El personaje inflige +3 de daño adicional cuando combate contra animales o bestias'),
    (15, 'Fortaleza de Amazona', 'P', 'El personaje recibe una bonificación de +2 en Fuerza y +2 en Constitución'),
    (15, 'Doma de Bestias', 'A', 'El personaje puede domesticar una bestia común para que le acompañe como compañera fiel o animal de compañía'),
    (17, 'Tiro Relámpago en montura', 'P', 'El personaje puede lanzar una jabalina y luego atacar con un arco en el mismo turno mientras está montado'),
    (17, 'Venenos y Parálisis', 'P', 'El personaje impregna con venenos y agentes paralizantes sus armas. Cuando acierta un ataque, el objetivo recibe daño adicional de 1 más el modificador de sabiduría del personaje y además puede quedar paralizado.'),
    (17, 'Sigilo en Bosque y Selva', 'P', 'El personaje puede moverse a través de bosques y selvas sin ser detectado.'),
    (20, 'Grito de Amazona', 'A', 'El personaje realiza un grito que incrementa en +6 todos los modificadores propios y de los aliados adyacentes en combate, durante 3 turnos.')
  ) AS a(level, name, action, description)
WHERE c.name = 'Amazona';

-- Argonauta
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Argonauta', 'Legal, Neutral/legal', 3, 'Ligera / Media',
  'Pueden usar todas las armas. No pueden usar escudos.',
  '13 Destreza, 10 Constitución', 'Catalejo, Brújula, Sextante',
  ARRAY['Aviroide', 'Elfo', 'Elfo Oscuro', 'Enano', 'Humano', 'Jotun', 'Orco', 'Reptiliano', 'Semielfo', 'Semiorco', 'Troloide']::text[],
  2, 3, 6, 2, 2,
  '{"Destreza":13,"Constitución":10}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Argonauta');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Argonauta');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,2000),(3,4000),(4,8000),(5,16000),(6,32000),(7,65000),(8,120000),(9,240000),(10,360000),(11,480000),(12,600000),(13,750000),(14,925000),(15,1000000),(16,1025000),(17,1100000),(18,1175000),(19,1200000),(20,1250000)) AS x(level, xp)
WHERE c.name = 'Argonauta';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Argonauta');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Cartógrafo', 'P', 'El personaje puede leer mapas y los cuerpos celestes para orientarse'),
    (0, 'Navegante', 'P', 'El personaje tiene un aumento de +2 a las tiradas en el mar y dentro de barcos'),
    (0, 'Restitución', 'P', 'El personaje recibe una bonificación de +3 a las tiradas de Carisma en situaciones relacionadas con actos de bondad y generosidad'),
    (0, 'Supersticioso', 'P', 'El personaje desconfía profundamente de la magia y se deja influenciar por presagios y augurios negativos, lo que puede causar que se asuste fácilmente ante cualquier señal de mal augurio o fenómeno sobrenatural'),
    (0, 'Determinación', 'P', 'El personaje recibe una bonificación de +3 en las tiradas de convicción o persuasión'),
    (0, 'Caza-filibusteros', 'P', 'El personaje recibe una bonificación de +1 en Destreza y +1 en daño específicamente contra piratas, corsarios, bucaneros o filibusteros'),
    (0, 'Natación Avanzada', 'P', 'El personaje gana un aumento de +2 casillas en su desplazamiento cuando está en el agua.'),
    (0, 'Abstemio', 'P', 'El personaje no puede consumir bebidas alcohólicas'),
    (0, 'Experto en Armas de Mano a Mano', 'P', 'El personaje domina el uso simultáneo de dos armas de una mano, permitiéndole realizar daño con ambas armas al acertar'),
    (3, 'Busca Recompensas', 'P', 'El personaje obtiene un 10% adicional en todas las recompensas recibidas'),
    (3, 'Disciplina', 'A', 'El personaje puede curarse a sí mismo de un estado negativo'),
    (3, 'Rastreo en Agua', 'A', 'El personaje es capaz de seguir pistas y rastrear movimientos en entornos acuáticos, detectando vestigios o señales en el agua con gran precisión.'),
    (5, 'Armamento Avanzado', 'P', 'El personaje puede empuñar un arma de dos manos con una sola mano mientras mantiene un arma de una mano en la otra'),
    (5, 'Suerte', 'A', 'El personaje tiene la habilidad de repetir una tirada realizada por el jugador una vez al día, brindando una segunda oportunidad para mejorar el resultado'),
    (5, 'Vigilia', 'P', 'El personaje aumenta su alcance de visión en +2 casillas y recibe una bonificación de +1 a las tiradas de percepción'),
    (8, 'Dominio sobre el mar y el clima', 'A', 'el personaje puede anticipar cualquier tipo de acontecimiento marino antes de que ocurra, del mismo modo que puede predecir si se acerca algún navío'),
    (8, 'Artillería', 'P', 'El personaje incrementa en un 20% el daño causado por los cañones de los barcos, ya sea al usarlos directamente o al asistir en su uso.'),
    (8, 'Confiable', 'P', 'El personaje recibe una bonificación de +2 al carisma cuando interactúa con civiles'),
    (8, 'Pescador', 'P', 'El personaje recibe una bonificación de +3 a la tirada al pescar'),
    (10, 'Suerte mejorada', 'A', 'El personaje tiene la habilidad de repetir dos tiradas realizadas por el jugador una vez al día, brindando una segunda oportunidad para mejorar el resultado'),
    (10, 'Abordaje', 'P', 'El personaje recibe una bonificación de +4 a las tiradas de iniciativa mientras esté a bordo de un barco. Además, durante el primer ataque del combate, el personaje y todos los aliados a bordo aumentan en +3 su modificador de Destreza para ese ataque.'),
    (10, 'Cocina Marinera', 'P', 'El personaje tiene habilidades culinarias especializadas para preparar peces, mamíferos marinos y mariscos. Los platos hechos con esta habilidad restauran completamente la vida de quienes los consumen fuera de combate.'),
    (13, 'Autoridad Marina', 'P', 'El personaje puede acceder libremente a todos los establecimientos, astilleros y cuarteles militares relacionados con los Argonautas o sus aliados, además sin necesidad de pagar gastos de amarre, en caso de que posea un navío propio.'),
    (13, 'Infundir Miedo sobre los criminales', 'A', 'El personaje aumenta su bonificador de carisma para infundir temor en piratas y filibusteros, otorgando un +5 a las tiradas para intimidar'),
    (13, 'Reparación de Barcos', 'A', 'El personaje puede llevar a cabo reparaciones en navíos mientras está en alta mar'),
    (15, 'Conferir', 'A', 'El personaje otorga temporalmente un aumento de +1 a todos los modificadores de características de un compañero durante el combate, esta habilidad solo se puede usar una vez por combate y por personaje'),
    (15, 'Liderazgo', 'A', 'El personaje inspira a sus compañeros, otorgando una bonificación de +2 a las tiradas de iniciativa y +1 a las tiradas de salvación para todos los aliados dentro de su rango de alcance'),
    (15, 'Abrir Cerraduras por la Fuerza', 'P', 'El personaje recibe una bonificación de +3 a las tiradas para abrir cerraduras mediante fuerza bruta'),
    (18, 'Optimización Naval', 'P', 'El personaje reduce el coste de construcción de nuevos navíos en un 25%'),
    (18, 'Experto en Combate Cuerpo a Cuerpo', 'P', 'El personaje incrementa su bonificador de Destreza y su daño en +1 con ambas armas durante combates cuerpo a cuerpo.'),
    (18, 'El Más Diestro del Alta Mar', 'P', 'El personaje incrementa su Destreza en +3 y el daño de cada arma en +2 mientras combate dentro de un navío o en el agua.'),
    (18, 'Jugar Limpio', 'P', 'El personaje mantiene siempre una conducta honorable, obteniendo una bonificación de +4 en las tiradas de salvación y +3 al Carisma'),
    (20, 'La Suerte No Está de Tu Lado', 'P', 'El personaje nunca recibirá golpes críticos')
  ) AS a(level, name, action, description)
WHERE c.name = 'Argonauta';

-- Bardo
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Bardo', 'Cualquiera', 4, 'Ligera',
  'No puede usar armas pesadas Escudo Ligero: (El personaje está limitado a utilizar únicamente una rodela como escudo)',
  '12 Carisma, 12 Sabiduría, 10 Inteligencia', 'Instrumento musical, Papiro y pluma',
  ARRAY['Aviroide', 'Elfo', 'Enano', 'Gnomo', 'Humano', 'Jotun', 'Nahiaride', 'Renegado', 'Sátiro', 'Semielfo', 'Semiorco']::text[],
  3, 1, 6, 1, 1,
  '{"Carisma":12,"Sabiduría":12,"Inteligencia":10}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Bardo');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Bardo');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,1000),(3,2000),(4,5000),(5,10000),(6,22000),(7,50000),(8,100000),(9,350000),(10,400000),(11,550000),(12,700000),(13,750000),(14,800000),(15,850000),(16,900000),(17,925000),(18,950000),(19,975000),(20,1000000)) AS x(level, xp)
WHERE c.name = 'Bardo';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Bardo');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Conocimiento de bardo', 'A', 'el personaje tirará un dado de porcentaje, con una tirada media-alta, el personaje conocerá una leyenda o canción sobre dicho tema'),
    (0, 'Inspirar Confianza', 'A', 'El personaje canta, otorgando un aumento de +1 a cualquier bonificador de estadística a todos los compañeros dentro de su rango, además de un +1 a la tirada de iniciativa.'),
    (1, 'Pirueta de Bufón', 'P', 'El personaje recibe un aumento de +2 a la destreza para esquivar ataques. Si esquiva con éxito, obtiene dos movimientos adicionales gratuitos, lo que le permite destrabarse automáticamente de su objetivo si está adyacente fuera de su turno.'),
    (1, 'Encanto', 'P', 'El personaje obtiene una bonificación de +2 al carisma cuando intenta convencer a otras personas, facilitando la persuasión y negociación.'),
    (2, 'Imitar Voz', 'A', 'El personaje puede replicar con precisión la voz de cualquier individuo, engañando a quienes escuchen.'),
    (2, 'Sonido Retumbante', 'A', 'El personaje lanza una poderosa onda sónica que empuja a todos los enemigos en un rango de alcance de 3 casillas. Se tira 1d4 para determinar cuántas casillas son empujados los enemigos afectados.'),
    (3, 'Oda de Ánimo', 'A', 'El personaje potencia su canción, otorgando un aumento de +2 a cualquier bonificador de estadística y un +3 en la tirada de iniciativa a todos los compañeros dentro de su rango. Esta habilidad es compatible y acumulable con "Inspirar Confianza".'),
    (3, 'Resonancia Ampliada', 'P', 'Las habilidades musicales del personaje tienen un alcance aumentado de +1 casilla'),
    (4, 'Leer lenguas', 'P', 'el personaje puede leer todas las lenguas, tanto vivas como muertas o demoníacas'),
    (4, 'Hablar lenguas', 'P', 'el personaje puede hablar todas las lenguas, tanto vivas como muertas o demoníacas'),
    (5, 'Maestro del Disfraz', 'A', 'El personaje es capaz de crear y adaptar disfraces perfectos tanto para sí mismo como para sus compañeros'),
    (5, 'Melodía Reanimadora', 'A', 'El personaje toca una melodía que restaura 1d4 puntos de vida más el bonificador de carisma a todos los compañeros dentro de su rango de alcance.'),
    (7, 'Melodía para amansar fieras', 'A', 'el personaje toca una melodía que puede calmar la ira de bestias de poca inteligencia'),
    (7, 'Melodía Lluviosa', 'A', 'el personaje toca una melodía que puede encapota el cielo para que llueva'),
    (8, 'Conocer alineamiento', 'A', 'el personaje puede discernir el alineamiento moral de una persona, revelando si son legales, neutrales o caóticos'),
    (8, 'Te has equivocado de lado', 'A', 'el personaje realiza una canción encandiladora que cambia a los enemigos a aliados a todos los que escucha la canción durante 3 turnos'),
    (9, 'Deshacer Trampa Mágica', 'A', 'El personaje puede desactivar trampas mágicas, neutralizando sus efectos y haciendo el área segura.'),
    (9, 'Reflejos Mejorados', 'P', 'El personaje gana una bonificación de +1 en el modificador de destreza'),
    (9, 'Deshacer Trampa Sagrada', 'A', 'El personaje puede desactivar trampas sagradas, eliminando sus efectos y protegiendo el área de daños divinos.'),
    (10, 'Canción de Cuna', 'A', 'el personaje puede cantar para dormir todos los enemigos que está dentro de su rango'),
    (10, 'Eco Engañoso', 'A', 'El personaje puede usar habilidades musicales para hacer que sonidos o frases se escuchen en otros lugares dentro de su alcance, distrayendo de este modo a su objetivo.'),
    (10, 'Carcajada insidiosa', 'A', 'el personaje obliga a un enemigo humanoide a reírse sin parar, no pudiendo moverse ni atacar'),
    (11, 'Réquiem Sanador', 'A', 'El personaje canta una melodía sanadora que cura 1d8 puntos de vida más el bonificador de carisma y el bonificador de sabiduría a todos los compañeros dentro de su rango de alcance.'),
    (11, 'Descifrar Runas', 'P', 'El personaje puede interpretar runas, permitiéndole leer y comprender su significado.'),
    (12, 'Danza Irresistible', 'P', 'El personaje, gracias a su habilidad excepcional en el baile, obtiene una bonificación de +4 a la seducción, cautivando a quienes lo rodean con su danza.'),
    (12, 'Cantinela del Despertar', 'A', 'El personaje canta una melodía que otorga un bonificador de +3 a cualquier estadística a todos los compañeros dentro de su rango, además de un +5 a la tirada de iniciativa. Esta habilidad es compatible con Oda de Ánimo e Inspirar Confianza.'),
    (13, 'Maestro de las Bellas Artes', 'P', 'El personaje siempre gana el doble de monedas al recibir recompensas o realizar transacciones.'),
    (13, 'Aristócrata', 'P', 'el personaje puede acudir a todos los eventos de la sociedad, además el personaje tiene una bonificación de aumento de reputación por misión de un +10%'),
    (14, 'Marionetista', 'A', 'El personaje puede hacer que todos los objetivos humanoides dentro de su rango de alcance se muevan como si fueran marionetas, controlando sus movimientos con su habilidad.'),
    (14, 'Canción Estimulante', 'A', 'El personaje canta una melodía que cura a todos los aliados dentro de su alcance, restaurando 1d10 puntos de vida más el bonificador de Carisma y el bonificador de Sabiduría.'),
    (15, 'Ritmo Acelerado', 'A', 'El personaje canta una canción que aumenta la velocidad de movimiento de todos los aliados en dentro de su rango de alcance en +3 casillas'),
    (15, 'Elegía Desoladora', 'A', 'El personaje entona una melodía que disminuye las tiradas de salvación de todos los enemigos en -2 durante dentro de su rango de alcance.'),
    (17, 'Canta, Cantar, Que el Mal Espanta', 'A', 'El personaje canta una melodía que elimina el miedo y la cobardía en todos los aliados dentro de su rango.'),
    (17, 'Canción de Sirena', 'A', 'El personaje canta una melodía encantadora que seduce o embelesa a todos los objetivos dentro de su rango de alcance.'),
    (18, 'Encanto Endiablado', 'A', 'El personaje aumenta +5 su bonificación de Carisma y disminuye -2 la bonificación de Carisma del objetivo'),
    (18, 'Balada Traumática', 'A', 'El personaje paraliza a todos los objetivos dentro de su rango de alcance y les inflige un daño pasivo de 1d6 mas el bonificador de Carisma.'),
    (19, 'Afina la Voz', 'A', 'Aumenta el rango de alcance del personaje en +2 casillas al cantar o entonar una melodía.'),
    (19, 'Sinfonía de la Claridad', 'A', 'El personaje canta una melodía que sana 1d12 mas el modificador de carisma y elimina los efectos de control mental o incapacitación mental en todos los aliados dentro de su rango de alcance.'),
    (19, 'Cánticos Infernales', 'A', 'El personaje entona una melodía que instiga a un aliado o enemigo a comportarse de manera caótica, haciendo que actúe impulsivamente y sin control. Posteriormente, el afectado no recordará sus acciones.'),
    (20, 'Meterse en el Personaje', 'A', 'El personaje puede imitar a la perfección a otro jugador o NPJ aliado, replicando sus habilidades y características.')
  ) AS a(level, name, action, description)
WHERE c.name = 'Bardo';

-- Bokor
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Bokor', 'Caótico, neutral/caótico, neutral', 6, 'Ligera',
  'No puede usar armas pesadas. Sin escudo: (El personaje no puede equipar ningún tipo de escudo)',
  '12 Sabiduría, 10 Inteligencia', 'Bastón o Báculo, Símbolo del pacto con espíritu oscuro, Juego de Ungüentos',
  ARRAY['Autómata', 'Aviroide', 'Elfo Oscuro', 'Goblin', 'Humano', 'Nahiaride', 'Renegado', 'Sátiro', 'Semielfo', 'Semiorco', 'Troloide']::text[],
  3, 1, 3, 2, 2,
  '{"Sabiduría":12,"Inteligencia":10}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Bokor');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Bokor');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,1000),(3,5000),(4,8000),(5,20000),(6,30000),(7,50000),(8,100000),(9,400000),(10,550000),(11,600000),(12,850000),(13,950000),(14,1000000),(15,1250000),(16,1350000),(17,1500000),(18,1550000),(19,1750000),(20,1950000)) AS x(level, xp)
WHERE c.name = 'Bokor';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Bokor');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Infundir Miedo', 'A', 'El personaje provoca miedo en un objetivo, mientras el objetivo esté bajo el efecto del miedo, todas las tiradas de acción realizadas contra el objetivo tienen un bonificador de +4.'),
    (0, 'Pacto con los dioses oscuros', 'P', 'Al llegar a 0 de vitalidad, el personaje puede seguir combatiendo en forma espiritual'),
    (0, 'Destreza del Hechicero', 'P', 'El personaje obtiene una bonificación de +3 a la Destreza para acertar hechizos del personaje'),
    (0, 'Pesadilla', 'P', 'El personaje puede acceder a las pesadillas de sus enemigos, descubriendo y utilizando sus temores más profundos.'),
    (0, 'Herboristería', 'P', 'El personaje tiene un amplio conocimiento sobre todas las variedades de plantas y recibe una bonificación de +5 a las tiradas de suerte al recolectarlas.'),
    (2, 'Ungüentos y Curación', 'A', 'El personaje puede aplicar ungüentos que curan 1d6 puntos de vida más el bonificador de sabiduría a un objetivo'),
    (2, 'Absorber Magia y Trampas Mágicas', 'A', 'El personaje puede absorber la magia de un objeto, lugar o trampa'),
    (2, 'Hablar con Muertos', 'A', 'El personaje puede convocar el espíritu de un fallecido y comunicarse con el caído'),
    (3, 'Momificar', 'A', 'El personaje convierte los cuerpos caídos en momias que obedecen sus órdenes, sirviendo como súbditos no muertos bajo su control'),
    (3, 'Tratante', 'P', 'El personaje tiene una habilidad excepcional para realizar tratos, mostrando un afán desmedido por negociar y cerrar acuerdos, otorgándole una bonificación de +3 a las tiradas de persuasión'),
    (3, 'Trampa de Sombras', 'A', 'El personaje crea una trampa de una casilla que inmoviliza al primer enemigo que la active y le causa daño espiritual cada turno, igual al modificador de sabiduría.'),
    (5, 'Ritual del Amarre', 'A', 'Amor) (El personaje puede forzar a un objetivo a enamorarse de otro, creando un vínculo romántico mágico entre ellos. Este vínculo solo puede disiparse si uno de los objetivos fallece o si el personaje que realizó el ritual es derrotado o incapacitado.'),
    (5, 'Curar Almas', 'A', 'El personaje puede eliminar la corrupción o maldiciones espirituales de las almas'),
    (5, 'Transfusión de Vitalidad', 'A', 'El personaje puede transferir parte de su propia vitalidad a un objetivo, curando 1d8 puntos de vida más el bonificador de sabiduría.'),
    (6, 'Invocar Máscara Tiki Encantada', 'A', 'El personaje puede invocar a la Máscara Tiki Encantada durante el combate, la cual posee la mitad de la vitalidad del personaje y lo asiste en la batalla.'),
    (6, 'Destreza Espectral', 'P', 'El modificador de destreza del personaje aumenta en +2. Adicionalmente, cuando el personaje está en modo espíritu, su modificador de destreza se incrementa en +4 en lugar de +2.'),
    (6, 'Leer Mentes', 'A', 'El personaje puede acceder a los pensamientos y emociones del objetivo, revelando sus intenciones y obteniendo respuestas veraces.'),
    (7, 'Ritual de la Cura', 'A', 'El personaje realiza un ritual de sanación que restaura 1d12 puntos de vida más el bonificador de sabiduría.'),
    (7, 'Ritual del Amarre', 'A', 'Espíritu) (El personaje puede levantar a un muerto y retenerlo en el plano terrenal durante el tiempo que desee. El espíritu puede ser atado a un lugar u objeto específico y solo puede liberarse mediante una magia de purificación más poderosa que el ritual, también puede deshacer su hechizo matando o incapacitando al personaje.'),
    (7, 'Ritual de Animación', 'A', 'El personaje realiza un ritual que incrementa las tiradas de salvación en +2, ya sea para sí mismo o para un objetivo.'),
    (10, 'Control Mental', 'A', 'El personaje puede tomar control de la mente de un objetivo humanoide que sea del mismo nivel o inferior.'),
    (10, 'Espíritu Redentor', 'A', 'El personaje lleva a cabo un ritual de curación que restaura 1d20 puntos de vida más el bonificador de sabiduría de un objetivo.'),
    (10, 'Caminante Espiritual', 'A', 'El personaje puede extraer su propio espíritu para caminar sobre el plano espiritual pudiendo volver a su cuerpo cuando le sea necesario'),
    (12, 'Maldecir', 'A', 'El personaje puede lanzar una maldición sobre un objetivo, disminuyendo todos los modificadores de sus estadísticas en -1.'),
    (12, 'Tinieblas', 'A', 'El personaje envuelve al objetivo en un aura espiritual que reduce en -3 un modificador de característica del objetivo y disminuye en -1 las tiradas de salvación del mismo.'),
    (12, 'Curar Amarres', 'A', 'El personaje puede purificar y disolver hechizos de amarre lanzados por bokores o amarradores, eliminando cualquier vínculo mágico impuesto.'),
    (12, 'Drenar Magia', 'A', 'El personaje absorbe la magia de un objetivo, impidiendo que este pueda utilizar hechizos o habilidades mágicas. Solo puede afectar a un objetivo por combate.'),
    (13, 'Retoñar', 'A', 'Cuando la Máscara Tiki Encantada es derrotada, puede sacrificar un 25% de vida del personaje para volver a invocar a la Máscara Tiki Encantada'),
    (13, 'Ritual de la Riqueza', 'A', 'El personaje realiza un ritual que genera un aumento del 25% en los beneficios económicos obtenidos.'),
    (13, 'Muñeco Vudú', 'A', 'El personaje marca a un objetivo y realiza un ritual con una posesión o parte del cuerpo del objetivo. Cualquier acción realizada con el muñeco vudú se extrapola directamente al objetivo, afectándolo como si él mismo lo hubiera experimentado, no obstante, no se puede usar esta habilidad para ejecutar al objetivo.'),
    (15, 'Transferencia de Esencia', 'A', 'El personaje puede robar temporalmente el alma de un compañero para transferir sus estadísticas positivas a otro aliado. Al finalizar el combate, el alma regresa a su cuerpo original y recupera sus estadísticas previas.'),
    (15, 'Separar Alma', 'A', 'El personaje puede extraer el alma de objetivos con igual o menor nivel que él mismo'),
    (15, 'Caminante de las Sombras', 'A', 'El personaje puede absorber espíritus oscuros y malignos de nivel inferior al suyo, lo que le otorga una bonificación temporal en sus estadísticas durante el combate'),
    (16, 'Ritual del Éxtasis', 'A', 'El personaje realiza un ritual que protege a los afectados de incapacitación y control mental durante un día entero.'),
    (16, 'Posesión', 'A', 'El personaje puede transferir su alma a otro cuerpo de nivel igual o inferior, controlándolo y utilizando todas las habilidades del poseído mientras dure la posesión.'),
    (16, 'Reverdecer', 'P', 'Cuando resucitas a la Máscara Tiki encantada, ya no tiene que sacrificar el 25% de la vida del personaje'),
    (17, 'Pacto con el Barón Samedí', 'A', 'A cambio de renunciar a un nivel del personaje, este puede traer de vuelta a otro personaje, este personaje resucitado poseerá entonces la marca del Barón, lo cual significa que no podrá volver a ser objetivo de este pacto'),
    (17, 'Sello de Ritual Único', 'A', 'El personaje coloca un sello de 9 casillas que cura de manera pasiva a todos los personajes dentro de su área, restaurando 1d12 más el bonificador de sabiduría'),
    (17, 'Ritual de Sabiduría Usurpada', 'A', 'El personaje aumenta su sabiduría en +5 al robar temporalmente el modificador de sabiduría de un objetivo de igual o menor nivel.'),
    (20, 'Horda', 'A', 'El jugador lanza 1D20 más su modificador de Sabiduría para invocar y controlar momias, que quedan bajo su voluntad. Mientras haya al menos una momia viva, no puede usar esta habilidad nuevamente. Cuando la última momia muera, podrá volver a usarla. Estas momias usan las estadísticas del personaje.')
  ) AS a(level, name, action, description)
WHERE c.name = 'Bokor';

-- Brujo
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Brujo', 'Caótico, neutral/caótico, neutral', 7, 'Ligera',
  'No puede usar armas pesadas. Sin escudo: (El personaje no puede equipar ningún tipo de escudo)',
  '14 Inteligencia', 'El Necronomicón, Bastón o Catalizador',
  ARRAY['Autómata', 'Elfo Oscuro', 'Gnomo', 'Goblin', 'Humano', 'Jotun', 'Renegado', 'Sátiro', 'Semielfo', 'Semiorco']::text[],
  3, 1, 4, 1, 2,
  '{"Inteligencia":14}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Brujo');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Brujo');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,2000),(3,5000),(4,10000),(5,20000),(6,40000),(7,80000),(8,160000),(9,300000),(10,450000),(11,600000),(12,750000),(13,900000),(14,1100000),(15,1200000),(16,1350000),(17,1500000),(18,1650000),(19,1800000),(20,1950000)) AS x(level, xp)
WHERE c.name = 'Brujo';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Brujo');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Invocar diablillo', 'A', 'El personaje abre un portal que convoca a un diablillo de nivel inferior al suyo. Esta habilidad no puede volver a usarse hasta que hayan transcurrido 5 turnos.'),
    (0, 'Detectar Magia', 'P', 'el personaje puede detectar si un objeto o lugar contiene magia.'),
    (0, 'Destreza del Hechicero', 'P', 'El personaje obtiene una bonificación de +3 a la Destreza para acertar hechizos del personaje'),
    (0, 'Hechizar Personas', 'A', 'El personaje puede controlar mentalmente a un enemigo humanoide de menor nivel, sometiéndolo a su voluntad durante un periodo de tiempo determinado.'),
    (0, 'Leer lenguas', 'P', 'el personaje puede leer todas las lenguas, tanto vivas como muertas o demoníacas'),
    (0, 'Leer Magia', 'P', 'el personaje puede leer las magias arcanas, elementales, sagradas o demoníacas para saber su utilidad y como desactivarlas'),
    (0, 'Infundir Miedo', 'A', 'El personaje provoca miedo en un objetivo, mientras el objetivo esté bajo el efecto del miedo, todas las tiradas de acción realizadas contra el objetivo tienen un bonificador de +4.'),
    (0, 'Profanoguarda contrarcano', 'P', 'El personaje aumenta su C.A. en -1 contra ataques de magia arcana'),
    (0, 'Proyectil Mágico Oscuro', 'A', 'El personaje lanza un proyectil de magia oscura que inflige 1d6 mas el modificador de inteligencia de daño a un objetivo.'),
    (0, 'Ventriloquia', 'A', 'el personaje puede controlar una persona o muñeco para hablar a través de él sin importar la distancia'),
    (2, 'Detectar mal', 'P', 'el personaje puede detectar si un objeto o lugar contiene magia oscura, infernal o maldita.'),
    (2, 'Drenar Vida', 'A', 'El personaje absorbe la vitalidad de un objetivo, recuperando 1d6 puntos de vida más su bonificador de inteligencia.'),
    (2, 'Levitar', 'A', 'el personaje puede flotar para evitar el daño por caída'),
    (2, 'Fuego Fatuo', 'A', 'El personaje invoca un fuego fatuo del más allá que lo guía por el camino correcto, iluminando su senda'),
    (2, 'Corrupción', 'A', 'El personaje puede alterar temporalmente el alineamiento de un objetivo'),
    (3, 'Detectar lo Invisible', 'A', 'El personaje puede revelar la presencia de seres invisibles o camuflados dentro de su rango, haciéndolos visibles incluso si están en sigilo u ocultos.'),
    (3, 'Invisibilidad', 'A', 'El personaje puede volverse invisible a voluntad, volviéndose indetectable para los demás.'),
    (3, 'Percepción Extrasensorial', 'P', 'El personaje puede localizar entidades, entes o individuos incluso en otros planos existenciales'),
    (3, 'Maldecir', 'A', 'El personaje puede lanzar una maldición sobre un objetivo, disminuyendo todos los modificadores de sus estadísticas en -1.'),
    (3, 'Ceguera', 'A', 'El personaje conjura un hechizo que envuelve al objetivo en oscuridad mágica, provocando ceguera temporal. El objetivo queda incapacitado para ver y sufre un penalizador de -4 a todas las tiradas hasta que el hechizo se disipe o sea contrarrestado.'),
    (4, 'Clarividencia', 'P', 'el personaje puede detectar la intención de un atacante antes de realizarlo'),
    (4, 'Infravisión', 'P', 'El personaje puede ver en la oscuridad y en condiciones de poca luz, aumentando su rango de visión en 3 casillas adicionales.'),
    (4, 'Protección contra Proyectiles Arcanos', 'A', 'El personaje genera un escudo temporal que bloquea el próximo ataque de proyectil arcano recibido.'),
    (4, 'Confusión', 'A', 'El personaje puede confundir a un enemigo, haciendo que ataque a otro objetivo. Además, recibe una bonificación de +3 en la tirada para realizar esta acción.'),
    (5, 'Disipar magia', 'A', 'el personaje puede eliminar la magia de un objeto o lugar encantado'),
    (5, 'Inmovilizar', 'A', 'el personaje puede paralizar a un objetivo de nivel igual o inferior'),
    (5, 'Ojo demoníaco', 'P', 'el personaje puede ver el aura de los enemigos'),
    (5, 'Agonía', 'A', 'El personaje lanza un hechizo de asfixia a distancia que incapacita al objetivo de nivel igual o inferior, causándole dolor y dificultadlo para respirar. El objetivo recibe daño pasivo cada turno igual al modificador de Inteligencia.'),
    (6, 'Hechizar monstruo', 'A', 'el personaje puede controlar la mente de un monstruo o bestia de nivel igual o inferior'),
    (6, 'Puerta Dimensional', 'A', 'El personaje abre una puerta que conecta diferentes planos existenciales, permitiendo el tránsito entre ellos y facilitando el acceso a lugares alternativos y realidades paralelas.'),
    (6, 'Bola de Fuego Negra', 'A', 'El personaje lanza una esfera de llamas negras que inflige 1D8 más el modificador de Inteligencia al objetivo. Además, este hechizo puede maldecir al objetivo.'),
    (7, 'Muro Oscuro', 'A', 'El personaje conjura un muro de oscuridad que se extiende a lo largo de 6 casillas. Este muro reduce la visibilidad a 1 para quienes estén detrás de él, y causa ceguera a quienes lo atraviesen.'),
    (7, 'Deformar', 'A', 'El personaje puede desfigurar o alterar la apariencia física de un objetivo a distancia, causando deformaciones visibles en su forma'),
    (7, 'Contactar con Otros Planos', 'P', 'El personaje puede establecer comunicación con entidades de otros planos sin necesidad de desplazarse o abrir un portal dimensional.'),
    (8, 'Invocar Demonio de Baja Categoría', 'A', 'El personaje puede convocar un demonio de categoría 1 sin necesidad de abrir un portal. El demonio solo puede permanecer activo durante la duración del combate.'),
    (8, 'Neblina', 'A', 'El personaje conjura una neblina mágica en su rango de alcance que reduce la visibilidad de todos los objetivos dentro de ella en 1 casilla y les impone un penalizador de -3 en todas las tiradas de Destreza.'),
    (9, 'Paralizar Monstruo', 'A', 'El personaje lanza un hechizo que paraliza a un monstruo o bestia'),
    (9, 'Escudo de magia', 'A', 'El personaje invoca un gran escudo hecho de Magia colocado en el campo de batalla que bloquea el siguiente ataque de cualquier fuente mágica dirigido hacia él, no se puede usar para desactivar trampas mágicas'),
    (10, 'Conocimiento Demoníaco', 'P', 'El personaje tiene la capacidad de hablar y entender todas las lenguas demoníacas, facilitando la comunicación con entidades de origen infernal'),
    (12, 'Bola de Fuego Demoníaca', 'A', 'El personaje lanza una bola de oscuridad que inflige 1d10 más el modificador de inteligencia en daño. Además, provoca una quemadura de fuego demoníaco que causa daño pasivo de 1d4 más el modificador de inteligencia'),
    (12, 'Invocar demonio de categoría media', 'A', 'El personaje puede invocar un segundo demonio sin necesidad de un portal, este segundo demonio puede ser de categoría 2. Ahora puede mantener dos demonios activos durante la duración del combate.'),
    (12, 'Telequinesis demoníaca', 'A', 'el personaje puede desplazar a un demonio en cualquier sitio del campo de batalla dentro de su rango'),
    (12, 'Leer Mentes', 'A', 'el personaje puede acceder a los pensamientos y emociones del objetivo, revelando sus intenciones y obteniendo respuestas veraces.'),
    (12, 'Espada come-almas', 'A', 'el personaje puede invocar una espada capaz de arrancar las almas de los objetivos muertos, no se puede usar para combatir'),
    (13, 'Potenciar Demonio', 'A', 'El personaje puede restaurar la vida de uno de sus demonios y aumentar su daño en +2 y su bonificador de constitución en +2. Esta habilidad solo puede usarse una vez por combate.'),
    (13, 'Mano Apresadora', 'A', 'El personaje lanza un hechizo que crea una mano mágica que agarra y retiene a un enemigo, sin importar la distancia entre el personaje y el objetivo.'),
    (13, 'Incinerar', 'A', 'El personaje pulveriza a distancia cualquier lugar o superficie no mágica, reduciéndolo a cenizas'),
    (13, 'Desintegrar Objetos', 'A', 'El personaje puede pulverizar a distancia cualquier objeto no mágico, reduciéndolo a polvo.'),
    (13, 'Pacto Oscuro', 'A', 'El personaje establece un vínculo con uno de sus demonios, transfiriendo todo el daño que recibe al demonio en lugar de al propio cuerpo. Este pacto se mantiene activo mientras dure el combate o muera el demonio o hasta que se rompa por un hechizo de disipación.'),
    (14, 'Enlace de alma', 'A', 'el personaje puede trasladar el alma que tiene almacenada a otro cuerpo que sea compatible'),
    (14, 'Atrapar alma', 'A', 'el personaje puede succionar el alma de un fallecido sin necesidad de la espada come-almas'),
    (14, 'Pacto de Sangre', 'P', 'El personaje hace un pacto oscuro que aumenta su vitalidad en un 10%, pero reduce la vitalidad de todos los demonios invocados en un 5%.'),
    (14, 'Sentencia Infernal', 'A', 'el personaje lanza un hechizo que reduce la velocidad de movimiento de un enemigo a la mitad si está dentro de su rango de alcance.'),
    (15, 'Conjuro de Muerte', 'A', 'El personaje lanza un conjuro mortal sobre un enemigo de menor nivel. El enemigo queda marcado para morir, y fallecerá cinco turnos después de haber sido afectado por el conjuro, independientemente de su estado en ese momento.'),
    (15, 'Terror Abisal', 'A', 'el personaje lanza un conjuro que causa miedo a todos los enemigos dentro de su rango de alcance. Todos los enemigos afectados deben superar una tirada con un penalizador de -4 a la tirada de salvación o quedar aterrorizados.'),
    (15, 'Trampa Mágica Oscura', 'A', 'El personaje crea una trampa de una casilla que inmoviliza al primer enemigo que la active y le causa daño de maldición cada turno, igual al modificador de Inteligencia.'),
    (15, 'Cauce de Sangre', 'A', 'El personaje sacrifica una cantidad de su vitalidad, que se determina mediante una tirada de 1d20 más el modificador de Inteligencia, para transferir esa energía vital a un demonio bajo su control'),
    (16, 'Hechizar Masas', 'A', 'El personaje puede controlar temporalmente la mente de todos los enemigos dentro de su rango que tengan un nivel inferior al suyo.'),
    (16, 'Marca Infernal', 'A', 'El personaje recibe un aumento temporalmente en el modificador de inteligencia de +1 por cada demonio caído en el combate'),
    (16, 'Llamas del Abismo', 'A', 'El personaje invoca un huracán de fuego demoníaco que infligirá 1D12 puntos de daño más el modificador de inteligencia a todos los personajes que atraviesa. Además, los enemigos afectados son empujados 1d6 casillas en una dirección aleatoria. El huracán se mueve libremente alrededor del mapa, desplazándose hasta 6 casillas y es controlado por el personaje.'),
    (17, 'Invocar Demonio de Categoría Superior', 'A', 'El personaje puede invocar un tercer demonio de categoría 3 sin necesidad de un portal, Manteniéndose los tres demonios activos solo durante la duración del combate.'),
    (17, 'Lluvia de Estrellas Oscuras', 'A', 'El personaje conjura una lluvia de proyectiles mágicos de oscuridad que dañan a todos en un área de 16 casillas. Primero, lanza 1D6 para determinar el número de meteoritos que caen. Luego, lanza 1D12 por cada meteorito, añadiendo el modificador de inteligencia a ambas tiradas'),
    (17, 'Nube Incendiada', 'A', 'El personaje invoca dentro de todo su rango de alcance, una nube de fuego que desciende en forma de gotas ardientes. Todos los enemigos dentro del rango del hechizo reciben 4 puntos de daño por quemaduras más el modificador de inteligencia'),
    (18, 'Desterrar Compañero', 'A', 'El personaje puede enviar a un compañero a un plano existencial distinto del cual no puede escapar, permaneciendo allí hasta que el personaje decida traerlo de vuelta.'),
    (18, 'Símbolo demoníaco', 'P', 'los demonios invocados por el personaje aumentan su vitalidad 20 puntos más'),
    (19, 'Desterrar Grupo', 'A', 'El personaje puede transportar a todos los compañeros a un plano existencial del cual no pueden escapar, hasta que el personaje decida devolverlos a su lugar original.'),
    (19, 'Ejército de Demonios', 'A', 'Invoca dos diablillos, el jugador lanza 1D4 para saber cuántos demonios puede invocar en su próximo turno, pudiendo tener hasta 4 demonios repartiéndose en 2 de categoría 2 y 2 de categoría 3 activos al mismo tiempo. Esta habilidad no puede usarse de nuevo hasta que todos los demonios invocados hayan muerto y es incompatible con las anteriores habilidades de invocar demonio.'),
    (20, 'Conocimiento Compartido', 'A', 'El personaje puede enseñar a cualquier aliado una habilidad de brujo, excepto las de nivel 18, 19 y 20. No puede instruir las habilidades de invocación de demonios, pero sí las de invocación de diablillos.')
  ) AS a(level, name, action, description)
WHERE c.name = 'Brujo';

-- Caballero de la Llama
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Caballero de la Llama', 'Neutral/Legal, legal', 5, 'Ligera / Media / Pesada',
  'Puede usar todas las armas (Exceptuando las armas a distancia) Puede usar todos los escudos.',
  '12 Fuerza, 9 Sabiduría', 'Cualquier tipo de arma ignifuga',
  ARRAY['Enano', 'Humano', 'Jotun', 'Orco', 'Reptiliano', 'Semielfo', 'Semiorco', 'Troloide']::text[],
  4, 3, 4, 2, 1,
  '{"Fuerza":12,"Sabiduría":9}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Caballero de la Llama');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Caballero de la Llama');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,5000),(3,10000),(4,15000),(5,20000),(6,25000),(7,50000),(8,55000),(9,100000),(10,150000),(11,500000),(12,550000),(13,750000),(14,800000),(15,1000000),(16,1050000),(17,1500000),(18,1550000),(19,1750000),(20,2500000)) AS x(level, xp)
WHERE c.name = 'Caballero de la Llama';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Caballero de la Llama');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Disciplina del Caballero', 'P', 'El personaje duplica el modificador de sabiduría en tiradas de salvación.'),
    (0, 'Fuerza Ardiente', 'P', 'El modificador de fuerza del personaje aumenta en +1 cuando utiliza armas imbuidas en fuego sagrado'),
    (0, 'Sentidos Agudizados', 'P', 'El personaje aumenta el modificador de destreza en +2 solo para esquivar y otorga un bonificador de +1 a la tirada de percepción'),
    (0, 'Carga', 'P', 'El personaje puede atacar al finalizar el movimiento'),
    (3, 'Furia de Batalla Justiciera', 'P', 'El personaje es inmune a incapacidades y control mental durante el combate.'),
    (3, 'Forja ígnea', 'A', 'el personaje tiene la habilidad de reparar armas y armaduras sin necesidad de herramientas, hornos ni yunques'),
    (3, 'Evadir', 'P', 'Aumenta en +2 la esquiva del personaje.'),
    (3, 'Tajo de Fuego', 'P', 'Cuando el personaje daña a un enemigo, le aplica una quemadura que inflige +1 de daño pasivo más el modificador de sabiduría.'),
    (6, 'Experto en Combate Cuerpo a Cuerpo', 'P', 'Aumenta en +1 tanto el bonificador de destreza como el daño en combates cuerpo a cuerpo'),
    (6, 'Cegar', 'A', 'El personaje realiza una intensa llamarada con su arma que incapacita a los enemigos frente a él durante 1 turno.'),
    (6, 'Absorción de Llamas', 'A', 'El personaje puede absorber llamas, flamas o quemaduras de enemigos, aliados, objetos, animales o bestias.'),
    (6, 'Espada de Rectitud', 'A', 'El personaje invoca una espada de una mano hecha del fuego sagrado, que inflige 1D10 mas el modificador de sabiduría. Además, duplica el daño de las quemaduras causadas con esta arma'),
    (9, 'Bengala', 'A', 'El personaje ilumina el terreno, creando una fuente de luz que dura un período de tiempo determinado.'),
    (9, 'Alma llameante', 'A', 'el personaje se imbuye en un aura de fuego sagrado que provoca quemadura a los enemigos a dos casillas de alcance de 3 de daño pasivo irreducible más modificador de sabiduría'),
    (9, 'Protección Avenar', 'P', 'Cuando el personaje porta un escudo, este siempre proporciona un CA de -2, sin importar el tipo de escudo que lleve. Además, cuando se enfrenta a magia demoníaca, oscura, nigromántica o similar, la CA del escudo se mejora a -3.'),
    (9, 'Ascuas', 'P', 'El personaje puede invocar ascuas ardientes en una zona a una distancia máxima de 5 casillas'),
    (10, 'Señor del Fuego', 'A', 'El personaje absorbe el fuego de aliados o enemigos para luego lanzarlo a distancia, infligiendo 5 puntos de daño de fuego sagrado irreducible más el modificador de sabiduría a todos los enemigos en un rango de 3 casillas. Los enemigos afectados no podrán utilizar magia de fuego durante 3 turnos.'),
    (10, 'Resistencia al Fuego', 'P', 'El personaje tiene resistencia al fuego elemental o infernal, reduciendo en -2 el daño recibido de estos ataques.'),
    (10, 'Inmunidad a Temperaturas Altas', 'P', 'El personaje es completamente inmune a los efectos adversos causados por temperaturas extremas de calor'),
    (10, 'Inquisidor', 'P', 'El personaje está protegido contra alteraciones en su alineamiento y la corrupción de sus ideales por influencias externas. Además, tiene la habilidad de instigar y convencer a los demás para adoptar su forma de pensar.'),
    (13, 'Ignición Frenética', 'P', 'Si el enemigo no tiene una quemadura, el personaje puede realizar un ataque adicional después de su primer ataque.'),
    (13, 'Inmolar', 'A', 'El personaje lanza un hechizo sagrado poderoso, como ataque adicional que inflige 1d20 de daño más el modificador de sabiduría, a cambio de sacrificar 10 puntos de vitalidad.'),
    (13, 'Ardor', 'P', 'Si el enemigo tiene una quemadura, el personaje puede realizar una acción adicional, siempre que tenga un escudo equipado y esté adyacente, puede empujarlo 1d6 más el modificador de Fuerza.'),
    (13, 'Llamas Purificadoras', 'A', 'El personaje se envuelve en llamas sagradas que lo sanan, curándose 1d20 más el modificador de sabiduría.'),
    (16, 'Rayo de Justicia', 'A', 'El personaje lanza un rayo de energía sagrada que inflige 1d12 más el modificador de sabiduría y más el modificador de inteligencia. Si acierta, provoca quemaduras de daño sagrado a los enemigos acertados a un rango de 4 casillas.'),
    (16, 'Golpe de Fuego Incandescente', 'P', 'Cada ataque realizado con éxito por parte del personaje, añade un ataque de llamas de justicia como ataque extra.'),
    (16, 'Venganza por los Caídos', 'P', 'Cuando un compañero cae en combate o queda K.O., el personaje aumenta temporalmente en +5 el daño de todas sus fuentes de daño. Este efecto se desvanece si el aliado es sanado o resucitado.'),
    (16, 'Llamas de Justicia', 'A', 'El personaje lanza una llamarada con su arma que inflige 1d12 más el modificador de sabiduría y el modificador de inteligencia a un objetivo dentro de su rango de alcance'),
    (19, 'Fénix', 'A', 'El personaje se recubre con alas de fénix, recuperando toda su salud y ganando la capacidad de volar para atacar o esquivar. Solo puede usar esta habilidad una vez por combate, y las alas desaparecen al finalizar el combate.'),
    (19, 'Ni las furias acabaron conmigo', 'P', 'el personaje puede ver en la mirada de la gente los pecados y actos malvados cometidos por ellos mismos, esta habilidad solo puede ser usado con humanoides'),
    (19, 'Cuerpo de represión', 'A', 'el siguiente golpe que reciba con éxito el personaje, este ignora la mitad del daño recibido'),
    (19, 'Maldito Hereje', 'P', 'el personaje puede imponer una reducción de -3 de carisma a un objetivo, una vez lo realice, todas las tiradas contra este objetivo son de +2'),
    (20, 'Alma de Cenizas', 'P', 'Cuando el personaje muere, puede resucitar con una penalización de -1 nivel después del combate.'),
    (20, 'Eco de las Erinias', 'P', 'Cuando alguien que ha sido previamente juzgado por la habilidad Ni las Furias Acabaron Conmigo muere dentro del rango del personaje, este puede quemar su alma, desintegrándolo de la existencia.'),
    (20, 'Marca de Castigo', 'P', 'Mientras un objetivo esté marcado por la habilidad Ni las Furias Acabaron Conmigo, el personaje inflige el doble de daño por quemaduras sagradas a este objetivo'),
    (20, 'Sangre del Fénix', 'P', 'Mientras el personaje tenga activa la habilidad Fénix, se cura al final de su turno una cantidad de vida igual al daño que haya infligido con sus quemaduras a los objetivos.')
  ) AS a(level, name, action, description)
WHERE c.name = 'Caballero de la Llama';

-- Cazador de Sombras
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Cazador de Sombras', 'Legal, neutral/legal, neutral', 4, 'Ligera / Media',
  'No puede usar armas pesadas. Sin escudo: (El personaje no puede equipar ningún tipo de escudo).',
  '12 Fuerza, 12 Destreza, 10 Sabiduría', 'Crossar, Estacadora, Agua bendita, Gargantilla Protectora, Espejo de Mano, Guía de seres impíos',
  ARRAY['Elfo', 'Felino', 'Humano', 'Nahiaride', 'Orco', 'Renegado', 'Reptiliano', 'Sátiro', 'Semielfo', 'Semiorco']::text[],
  3, 3, 4, 1, 2,
  '{"Fuerza":12,"Destreza":12,"Sabiduría":10}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Cazador de Sombras');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Cazador de Sombras');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,2000),(3,4000),(4,8000),(5,16000),(6,32000),(7,65000),(8,120000),(9,240000),(10,360000),(11,480000),(12,600000),(13,720000),(14,840000),(15,950000),(16,1100000),(17,1200000),(18,1300000),(19,1400000),(20,1500000)) AS x(level, xp)
WHERE c.name = 'Cazador de Sombras';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Cazador de Sombras');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Detectar Magia', 'P', 'el personaje puede detectar si un objeto o lugar contiene magia.'),
    (0, 'Precisión del Cazador', 'P', 'Los ataques a distancia del personaje ignoran escudos, tanto manuales como fijos.'),
    (0, 'Detectar mal', 'P', 'el personaje puede detectar si un objeto o lugar contiene magia oscura, infernal o maldita.'),
    (0, 'Purificar Agua y Alimentos', 'A', 'el personaje limpia y purifica agua y alimentos, eliminando cualquier tipo de contaminación, impurezas, o maldiciones que puedan estar presentes.'),
    (0, 'Inexperto con Armas Comunes', 'P', 'El personaje sufre un -1 a todas las tiradas de ataque cuando porta armas que no son de su clase.'),
    (0, 'Resistencia al frío', 'P', 'El personaje tiene una resistencia al frío y a climas extremadamente bajos de +2'),
    (0, 'Mejora de Ingeniería', 'P', 'Al utilizar un arma mejorada con una pieza de ingeniería, aumenta su daño en +2 y su modificador de destreza en +1 mientras la empuñe; en caso de tratarse de una pieza de armadura, incrementa su C.A. en -1.'),
    (0, 'Condena Impía', 'P', 'El personaje tiene una bonificación de +2 a todas las tiradas contra seres impíos, espirituales o demoníacos.'),
    (2, 'Resistencia al Fuego', 'P', 'El personaje tiene resistencia al fuego elemental o infernal, reduciendo en -2 el daño recibido de estos ataques.'),
    (2, 'Protección contra el Mal', 'A', 'Aumenta tu C.A. del personaje en -2 contra magias oscuras o infernales.'),
    (2, 'Trampa sagrada', 'A', 'El personaje crea una trampa de una casilla que inmoviliza al primer enemigo que la active y le causa daño sagrado en cada turno, igual al modificador de sabiduría.'),
    (2, 'Conocer alineamiento', 'A', 'el personaje puede discernir el alineamiento moral de una persona, revelando si son legales, neutrales o caóticos'),
    (5, 'Quitar Miedo', 'A', 'El personaje suprime cualquier efecto de miedo en un objetivo.'),
    (5, 'Purificar Armas o Armaduras', 'A', 'El personaje puede eliminar maldiciones de armas o armaduras, restaurando sus efectos positivos y eliminando cualquier influencia negativa.'),
    (5, 'Estallido de Fuerza', 'A', 'El personaje lanza una onda de pulso ataca a todos los enemigos a 2 casillas de distancia, infligiendo 1d4 más el modificador de sabiduría de daño sagrado. Además, los enemigos son empujados una distancia igual al daño recibido.'),
    (5, 'Saltar y Trepar', 'P', 'el personaje puede saltar y trepar tanto por los árboles, muros, murallas, y otros obstáculos, superándolos con facilidad.'),
    (5, 'Trampero', 'A', 'El personaje puede crear trampas de una casilla que inmovilizan al enemigo y le causan daño físico por turno, igual al modificador de Destreza.'),
    (5, 'Asustar', 'A', 'El personaje realiza una acción que inspira miedo en el objetivo, con una bonificación de +4 a la tirada.'),
    (7, 'Hablar con Muertos', 'A', 'El personaje puede convocar el espíritu de un fallecido y comunicarse con el caído'),
    (7, 'Rastreo de Seres Paranormales', 'P', 'El personaje puede localizar con precisión a entidades paranormales, seres impíos o demoníacos en cualquier sitio o escenario.'),
    (7, 'Quitar Maldiciones', 'A', 'El personaje elimina todas maldiciones de un objetivo dentro de su rango de alcance'),
    (10, 'Protección Divina Contra el Mal', 'A', 'El personaje aumenta su C.A. contra magias oscuras o infernales en -3, en lugar de -2.'),
    (10, 'Detectar Mentiras', 'P', 'El personaje recibe una bonificación de +5 a la tirada de Carisma cuando intenta discernir si alguien está mintiendo o engañándolo'),
    (10, 'Golpe Flamígero Sagrado', 'A', 'El personaje imbuye su arma en fuego sagrado, infligiendo +2 de daño sagrado más el modificador de Sabiduría e Inteligencia en cada golpe exitoso.'),
    (10, 'Disipar magia', 'A', 'el personaje puede eliminar la magia de un objeto o lugar encantado'),
    (10, 'Dominio de Armas Especializadas', 'P', 'El personaje aumenta el bonificador de la Destreza en +2 y el daño en +1 al utilizar armas de su clase.'),
    (10, 'Maestría en Armas Comunes', 'P', 'El personaje elimina cualquier penalización al usar armas que no sean de su clase'),
    (12, 'Proyectil de Rayo Sagrado', 'A', 'El personaje ataca lanzando un rayo de energía sagrada que inflige 1d10 más el modificador de sabiduría en daño sagrado. El proyectil tiene un rango de 4 casillas.'),
    (12, 'Infravisión', 'P', 'El personaje puede ver en la oscuridad y en condiciones de poca luz, aumentando su rango de visión en 3 casillas adicionales.'),
    (12, 'Ver Disfraces y Camuflajes', 'P', 'El personaje puede ver a través de disfraces, hechizos de camuflaje y ropas que se mimetizan con el entorno.'),
    (12, 'Golpe Aéreo Potente', 'P', 'El personaje aumenta en +3 el daño infligido al realizar un ataque en caída desde lo alto sobre su objetivo.'),
    (15, 'Plaga Sagrada', 'A', 'El personaje desata una plaga de daño sagrado sobre el terreno de combate, causando daño pasivo de 1d6 más el modificador de Sabiduría a todos los enemigos en el campo de batalla.'),
    (15, 'Cuchillos Bendecidos', 'A', 'El personaje convierte parte de su energía espiritual en dagas bendecidas, que puede lanzar a todos los objetivos dentro de un rango de 4 casillas, causando 1d4 más el modificador de Sabiduría y más el modificador de destreza en daño. La munición es ilimitada mientras dure el hechizo.'),
    (15, 'Maestro del Látigo', 'P', 'El personaje obtiene un bonificador de +3 a las tiradas de destreza y +2 al daño al atacar con armas de látigo.'),
    (15, 'Maestro de la Ballesta y la Estaca', 'P', 'El personaje obtiene un bonificador de +3 a las tiradas de destreza y +2 al daño al atacar con la Ballesta y la Estacadora.'),
    (15, 'Dominio de Armas Contundentes', 'P', 'El personaje obtiene un bonificador de +1 a las tiradas de destreza y +2 al daño al atacar con armas contundentes.'),
    (15, 'Estacas de Luz Sagrada', 'P', 'El personaje materializa estacas de luz sagrada, aumentando el daño sagrado de los ataques con estacas en +2 más el modificador de sabiduría.'),
    (17, 'Símbolo Divino', 'P', 'El personaje imbuye sus armas con energía sagrada, infligiendo un adicional de +5 de daño sagrado más el modificador de Sabiduría en cada ataque con éxito.'),
    (17, 'Protección Divina', 'P', 'El personaje está bajo una poderosa protección que le impide ser convertido en un renegado o ser impío.'),
    (17, 'Exorcismo', 'A', 'El personaje puede realizar un ritual de exorcismo para expulsar a seres impíos de una región, una persona o un objeto poseído. La realización del ritual otorga un bonificador de +3 a la tirada para determinar el éxito del exorcismo.'),
    (20, 'Palabras Sagradas', 'A', 'El personaje imbuye a sí mismo y a todos los compañeros cercanos con poder sagrado, otorgándoles un +6 de daño sagrado en sus ataques más el modificador de Sabiduría del personaje que ha realizado el hechizo. Este efecto no entra en conflicto con otros efectos activos que reciban los compañeros, excepto aquellos de origen sagrado, como Símbolo Divino o Bendecir.'),
    (20, 'Voto de Hallen', 'P', 'El personaje se vuelve inmune a cualquier tipo de maldición, corrupción o marca proveniente de un ser impío, demoníaco u oscuro.')
  ) AS a(level, name, action, description)
WHERE c.name = 'Cazador de Sombras';

-- Cazarecompensas
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Cazarecompensas', 'Neutral/caótico, neutral, neutral/legal', 6, 'Ligera / Media',
  'No puede usar lanzas, jabalinas, guadañas ni picas. Puede usar todos los escudos (Menos el Scutum)',
  '10 Carisma', 'Lista de recompensas, Distintivo de Cazarecompensas',
  ARRAY['Aviroide', 'Elfo', 'Elfo Oscuro', 'Enano', 'Felino', 'Goblin', 'Humano', 'Jotun', 'Orco', 'Renegado', 'Reptiliano', 'Semielfo', 'Semiorco']::text[],
  4, 3, 4, 4, 1,
  '{"Carisma":10}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Cazarecompensas');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Cazarecompensas');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,2000),(3,4000),(4,8000),(5,16000),(6,32000),(7,65000),(8,120000),(9,240000),(10,360000),(11,480000),(12,600000),(13,720000),(14,840000),(15,950000),(16,1100000),(17,1200000),(18,1300000),(19,1400000),(20,1500000)) AS x(level, xp)
WHERE c.name = 'Cazarecompensas';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Cazarecompensas');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Código de Mercenario', 'P', 'El personaje está obligado a seguir un estricto código de honor que le impide robar la presa o el objetivo de otro Cazarecompensas.'),
    (1, 'Robo', 'P', 'El personaje recibe una bonificación de +3 a la tirada al realizar acciones de robo.'),
    (1, 'Perspicaz', 'P', 'El personaje recibe una bonificación de +3 a las tiradas relacionadas con la observación, lo que le permite detectar detalles ocultos, amenazas potenciales o pistas importantes con mayor facilidad.'),
    (1, 'Chantaje', 'P', 'El personaje tiene una bonificación de +5 a la tirada cuando intenta manipular a otros mediante amenazas o presión.'),
    (1, 'Precisión del Cazador', 'P', 'Los ataques a distancia del personaje ignoran escudos, tanto manuales como fijos.'),
    (1, 'Trampero', 'A', 'El personaje puede crear trampas de una casilla que inmovilizan al enemigo y le causan daño físico por turno, igual al modificador de Destreza.'),
    (1, 'Rastreo', 'A', 'El personaje posee la habilidad para seguir el rastro de un objetivo mediante huellas y señales en el entorno, lo que le permite localizarlo a lo largo de diversos terrenos.'),
    (1, 'Amenazar', 'P', 'El personaje obtiene una bonificación de +4 a la tirada al intentar intimidar o amenazar a un objetivo.'),
    (1, 'Detectar Magia', 'P', 'el personaje puede detectar si un objeto o lugar contiene magia.'),
    (3, 'Camuflaje', 'A', 'el personaje se oculta con el entorno, permaneciendo inmóvil mientras utiliza esta habilidad para evitar ser detectada.'),
    (3, 'Atontar', 'A', 'el personaje realiza un ataque, en vez de hacerle daño, deja al enemigo K.O., esta habilidad solo se puede usar de sorpresa o cuando le quede menos del 10% de vida'),
    (3, 'Percepción muy aguda', 'A', 'El personaje observa a un objetivo para deducir detalles clave sobre su carácter, intenciones, estado emocional y acciones recientes'),
    (3, 'Escalar', 'P', 'Permite al personaje subir y descender superficies verticales con agilidad, facilitando el acceso a lugares elevados o difíciles de alcanzar, sin necesidad de accesorios'),
    (5, 'Control del Objetivo', 'A', 'cuando el personaje saca un crítico puede optar por realizar la mitad de daño, y en cambio el enemigo es Aturdido'),
    (5, 'Voluntad Ambigua', 'P', 'El personaje no está sujeto a ninguna ética fija y actuará siempre en su propio beneficio, independientemente de su alineación. Como resultado, ya no está obligado a seguir el Código de Mercenario ni cualquier otro código moral o ético.'),
    (5, 'Sigilo', 'A', 'el personaje puede desplazarse entre las sombras sin ser detectado'),
    (7, 'Resistencia a la Parálisis', 'P', 'El personaje obtiene una bonificación de +3 a la tirada de salvación para resistir efectos de parálisis.'),
    (7, 'Recuperación Rápida', 'P', 'El personaje puede recuperarse de la fatiga una vez por combate sin necesidad de descansar, permitiéndole continuar combatiendo con normalidad.'),
    (9, 'Engaño', 'P', 'El personaje recibe una bonificación de +3 a las tiradas para engañar a otros.'),
    (10, 'Tahúr', 'P', 'El personaje tiene una habilidad excepcional en juegos de azar y apuestas. Obtiene una bonificación de +5 en tiradas relacionadas con juegos de cartas, dados, y similares, y es capaz de leer a sus oponentes para aumentar sus probabilidades de éxito.'),
    (10, 'Maestría con Grilletes', 'P', 'El personaje domina el arte de atar y liberarse. Obtiene +6 al intentar encadenar a un enemigo y puede zafarse automáticamente de ataduras no mágicas, sin necesidad de tirada.'),
    (11, 'Sabotaje', 'P', 'El personaje recibe un bonificador de +4 a la tirada cuando intenta desactivar, destruir o inutilizar mecanismos, estructuras o dispositivos.'),
    (11, 'Resistencia al Dolor', 'P', 'el personaje reduce el daño físico recibido en -2 y otorga una bonificación de +5 a la resistencia contra torturas.'),
    (11, 'Recompensa Incrementada', 'P', 'Aumenta todas sus recompensas del personaje en un +20%'),
    (11, 'Amaestrar mascotas de rastreo', 'A', 'El personaje puede domesticar mascotas que sirvan de rastreo'),
    (11, 'Presentimiento', 'P', 'Permite al personaje percibir la presencia de enemigos camuflados dentro de un alcance de 3 casillas'),
    (11, 'Maestro del Regateo', 'P', 'El personaje obtiene una bonificación de +10% en todas las transacciones de compraventa'),
    (11, 'Experto en Armas de Puños', 'P', 'El personaje tiene una bonificación de +2 a la destreza y de +2 de daño cuando utiliza armas de puños o golpea sin armas'),
    (11, 'Furia Controlada', 'P', 'El personaje canaliza su ira de manera efectiva, ganando una bonificación de +2 al modificador de Fuerza durante el combate.'),
    (13, 'Recompensa Aumentada', 'P', 'El personaje incrementa todas sus recompensas en un 50% en lugar del 20%'),
    (13, 'Experto en Armas con Ballesta', 'P', 'El personaje tiene una bonificación de +3 a las tiradas tirada de destreza y de +2 al daño al utilizar ballestas'),
    (13, 'Líder de información', 'P', 'el personaje teje una red de contacto por todas las ciudades para poder sacar información útil de cualquier sitio'),
    (13, 'Corazonada', 'P', 'Permite al personaje percibir la presencia de enemigos en sigilo o invisibles dentro de un alcance de 3 casillas'),
    (15, 'Interrogador', 'P', 'El personaje incrementa en +6 la tirada de las técnicas de interrogación para obtener información de los prisioneros'),
    (15, 'Tú Eres Mi Objetivo', 'A', 'El personaje marca a un objetivo como recompensa, después obtiene una bonificación de +3 en todos los modificadores de características al realizar acciones frente a ese objetivo, esta habilidad se termina cuando el objetivo es capturado o asesinado.'),
    (15, 'Duplicar Recompensas', 'P', 'Las recompensas recibidas al personaje serán siempre el doble de la cantidad estándar.'),
    (17, 'Castigar', 'P', 'El personaje puede reduce la Constitución del enemigo en -3 después del primer golpe acertado sin arma contra ese objetivo'),
    (17, 'Polifacético', 'A', 'El personaje puede disfrazarse e interpretar un papel con absoluta fidelidad, imitando con gran precisión tanto la apariencia como el comportamiento de cualquier persona.'),
    (19, 'Investigador', 'P', 'El personaje posee un conocimiento especializado en la localización de armas, armaduras y recompensas especiales'),
    (20, 'Suertudo', 'P', 'El personaje puede repetir una tirada por ronda de combate y también tiene la capacidad de repetir una acción fuera de combate con diferentes objetivos'),
    (20, 'Líder del gremio', 'P', 'Todos los integrantes tienen que pagar un tributo del 10% del botín obtenido al personaje')
  ) AS a(level, name, action, description)
WHERE c.name = 'Cazarecompensas';

-- Chamán
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Chamán', 'Neutral/caótico, neutral, neutral/legal', 5, 'Ligera / Media',
  'No puede armas pesadas. Puede usar todos los escudos (Menos el Scutum)',
  '14 Inteligencia, 10 Carisma, 12 Sabiduría', 'Juego de ungüentos, Conjunto de piedras runa, HABILIDAD ESPECIAL, Los tótems realizan acciones independientemente al chaman cada turno en combate, estos tótems tienen 4 puntos de vida y su rango de alcance es de 5',
  ARRAY['Autómata', 'Aviroide', 'Goblin', 'Humano', 'Nahiaride', 'Orco', 'Renegado', 'Sátiro', 'Semielfo', 'Semiorco', 'Troloide']::text[],
  3, 1, 6, 1, 1,
  '{"Inteligencia":14,"Carisma":10,"Sabiduría":12}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Chamán');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Chamán');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,1000),(3,3000),(4,4000),(5,6000),(6,7000),(7,10000),(8,20000),(9,40000),(10,80000),(11,100000),(12,200000),(13,400000),(14,600000),(15,800000),(16,1000000),(17,1250000),(18,1500000),(19,1750000),(20,2000000)) AS x(level, xp)
WHERE c.name = 'Chamán';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Chamán');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Fuego', 'P', 'el personaje invoca fuego puede ser utilizado fuera de combate'),
    (0, 'Invocar tótem de agua', 'A', 'el personaje invoca dentro de su rango de alcance, un tótem que lanza chorros de agua que sana a los aliados 1d4 más el modificador de sabiduría'),
    (0, 'Viaje astral', 'P', 'El alma del personaje puede desposeerse de cuerpo y visitar sitios a grandes distancias, esta habilidad solo se puede hacer fuera de combate'),
    (0, 'Hablar con los Ancestros', 'A', 'El personaje tiene la capacidad de comunicarse con los espíritus de sus familiares fallecidos, siempre que estos estén presentes en el área cercana.'),
    (0, 'Localizar agua subterránea', 'P', 'el personaje puede localizar las corrientes subterráneas de agua en cualquier lugar'),
    (0, 'Lanzamiento de Rocas', 'A', 'El personaje puede lanzar grandes rocas desde el suelo hacia un enemigo dentro de su rango de alcance, este ataque inflige 1d6 de daño más el modificador de Inteligencia.'),
    (2, 'Invocar Elemental de Tierra', 'A', 'El personaje invoca un elemental de roca que bloquea ataques. La vitalidad del elemental es igual a la mitad de la vida del personaje, y su constitución es igual a la de su conjurador.'),
    (2, 'Invocar tótem de tierra', 'A', 'el personaje invoca dentro de su rango de alcance, un tótem que lanza rocas que pueden golpear enemigos 1d4 más el modificador de inteligencia'),
    (2, 'Lluvia regenerativa', 'A', 'El personaje invoca una lluvia de agua regenerativa que cura 1d4 más el bonificador de sabiduría a todo lo que este dentro del área, ya sea amigo o enemigo, el tamaño de la lluvia son 16 casillas'),
    (2, 'Premonición', 'P', 'El personaje puede lanzar y leer las runas para prever cualquier acontecimiento fuera de combate, obteniendo una bonificación en la tirada basado en su modificador de Sabiduría.'),
    (3, 'Magma', 'A', 'El personaje lanza una corriente de magma volcánica que inflige 1d8 más el modificador de Inteligencia, además, causa quemaduras que añaden 1d4 más el bonificador de Inteligencia de manera pasiva.'),
    (3, 'Vendaval', 'A', 'El personaje desata un impulso de aire potente que empuja a todos los que se hallan frente a él. La distancia de empuje depende de una tirada de 1d12 más el modificador de Inteligencia.'),
    (3, 'Tótem de Aumento de Experiencia', 'A', 'el personaje invoca dentro de su rango de alcance, un tótem que, mientras esté activo, aumenta la experiencia obtenida al final de un evento que genere experiencia. Se realiza una tirada de porcentaje al concluir el evento, y se suma el resultado a la experiencia ganada, aumentando así el total obtenido.'),
    (5, 'Invocar tótem de viento', 'A', 'El personaje invoca dentro de su rango de alcance, un tótem que lanza fuertes corrientes de aire que dificulta los ataques a distancia dentro del rango de alcance del tótem, lo que supone un aumento de todos los que se hallan dentro del rango de -2 C.A. a los este tipo de ataques.'),
    (5, 'Mejora Totémica', 'P', 'Los tótems del personaje ahora tienen 6 puntos de vida más su modificador de Sabiduría.'),
    (5, 'Cuerpo Pétreo', 'A', 'El personaje envuelve en piedra móvil a sí mismo o a un aliado, reduciendo el movimiento de desplazamiento en 2 casillas, pero aumentando la Constitución en +1.'),
    (5, 'Invocar tótem de fuego', 'A', 'el personaje invoca dentro de su rango de alcance, un tótem que lanza llamaradas que puede golpear enemigos 1d6 más el modificador de inteligencia'),
    (7, 'Invocar Elemental de Viento', 'A', 'El personaje invoca un elemental de viento que protege a él mismo o a un compañero de proyectiles físicos a distancia. La vitalidad del elemental es igual a la mitad de la vida del personaje, y su destreza es igual a la de su conjurador.'),
    (7, 'Cadena de Rayos', 'A', 'El personaje lanza un rayo frontal que inflige 1d10 más el modificador de Inteligencia, el rayo se extiende a los objetivos adyacentes, causando el mismo daño, además, los objetivos impactados tienen una posibilidad de quedar paralizados.'),
    (7, 'Invocar Familiar', 'A', 'el personaje puedes invocar a un Familiar que se halle en la sede de Gremio o en algún refugio de su propiedad'),
    (7, 'Tótem de Gravedad', 'A', 'El personaje invoca dentro de su rango de alcance, un tótem que dentro de su rango de alcance, reduce la movilidad de todas las criaturas a 1 casilla, además, los proyectiles físicos quedan inutilizados cuando acceden al área de efecto del tótem.'),
    (10, 'Tótem de niebla', 'A', 'El personaje invoca dentro de su rango de alcance, un tótem que lanza niebla en todo el terreno, esta niebla provoca una reducción considerablemente la visibilidad de los que estén dentro a una casilla de distancia'),
    (10, 'Tótem de Lodo', 'A', 'el personaje invoca dentro de su rango de alcance, un tótem que convierte el terreno en un pantano espeso o arenas movedizas, inmovilizando y atrapando a cualquier entidad que lo cruce.'),
    (0, 'Tótem de vigilancia', 'P', 'el personaje invoca dentro de su rango de alcance, un tótem que avisa cuando se acerca cualquier peligro, además detecta toda entidad camuflada, invisible o en sigilo'),
    (0, 'Corrientes Ascendentes', 'A', 'El personaje invoca un géiser de agua que proyecta una poderosa columna de agua hacia arriba, este géiser puede ser utilizado para crear una barrera de agua, proporcionar un impulso, o incluso para despejar obstáculos, no se puede usar para atacar a un objetivo'),
    (12, 'Fuerza Totémica', 'P', 'Los tótems del personaje ahora tienen 8 puntos de vida más su modificador de Sabiduría.'),
    (12, 'Invocar Elemental de Agua', 'A', 'El personaje invoca un elemental de agua que puede curar a los tótems, elementales, al personaje o aliados. Las curas infligen 1d12 más el modificador de Sabiduría del personaje. La vida del elemental es igual a la mitad de la vitalidad del personaje y el elemental posee el mismo modificador de Sabiduría al de su conjurador.'),
    (12, 'Calmar Aguas', 'A', 'Esta habilidad permite al personaje apaciguar las aguas que hay dentro de su rango de alcance, eliminando olas, marejadas o turbulencias.'),
    (12, 'Tótem de Rayos', 'A', 'El personaje invoca dentro de su rango de alcance, un tótem que emite ráfagas de rayos. Estos rayos infligen 1d6 más el modificador de Inteligencia a los enemigos dentro de su rango de alcance. Además, existe una probabilidad de paralizar al enemigo afectado por el tótem.'),
    (13, 'Tótem de Calma', 'A', 'el personaje invoca dentro de su rango de alcance, un tótem que, dentro de su rango, calma la ira, rabia y miedos de los seres afectados.'),
    (13, 'Invocar elemental de fuego', 'A', 'El personaje invoca un elemental de llamas que lanza ráfagas de fuego que provoca 1d12 más el modificador de inteligencia, la vitalidad del elemental es la mitad de la vida del personaje y además el elemental posee la misma inteligencia al de su conjurador'),
    (13, 'Tótem de chirrido', 'A', 'el personaje invoca dentro de su rango de alcance, un tótem que provoca un chirrido muy intenso con tiene como finalidad espantar o alejar a enemigos dentro de su rango de alcance'),
    (15, 'Tótem somnífero', 'A', 'el personaje invoca dentro de su rango de alcance, un tótem que lanza esporas somnolientas que provoca sueño en todo los que está a 5 casillas del tótem'),
    (15, 'Destreza del Ancestro', 'P', 'El personaje aumenta su modificador de Destreza en +3, y todos los tótems y elementales bajo su control reciben un aumento de +2 en su modificador de Destreza.'),
    (15, 'Vigor Totémico', 'P', 'Los tótems del personaje ahora tienen 10 puntos de vida más su modificador de Sabiduría.'),
    (15, 'Frenesí Totémico', 'A', 'El personaje puede invocar a todos los tótems posibles en un solo turno. Después de usar esta habilidad, no podrá volver a usarla durante 5 turnos.'),
    (17, 'Terremoto', 'A', 'El personaje convoca una sacudida sísmica que agita violentamente el suelo, provocando grietas y fisuras que alteran el campo de batalla. Estas fracturas generan zonas inestables que dificultan el movimiento y la estabilidad de quienes se encuentren en el área afectada. Se trata de una habilidad enfocada en moldear el terreno al antojo del personaje y no en infligir daño directo.'),
    (17, 'Maremoto', 'A', 'El personaje invoca una poderosa ola, junto con torbellinos y corrientes violentas que sacuden y desestabilizan el campo de batalla, desplazando los navíos en la zona a su antojo. Esta habilidad no inflige daño directo, sino que altera el terreno para beneficiar al personaje.'),
    (17, 'Volcán', 'A', 'El personaje abre el suelo para provocar la erupción de un volcán. Durante 1 día, el terreno queda cubierto de lava y cenizas, dificultando la movilidad y causando daño a todos los personajes en el área. Al finalizar el efecto, el terreno se cierra, aunque puede quedar con cicatrices que tardarán semanas o meses en sanar. El tamaño del volcán se determina con 2d20 más el modificador de Inteligencia, y el daño por permanecer en la lava es de 3d10 más el modificador de Inteligencia por turno. Esta habilidad solo puede usarse una vez al día.'),
    (17, 'Poderío Totémico', 'P', 'Los tótems del personaje ahora tienen 12 puntos de vida más su modificador de Sabiduría.'),
    (20, 'Control de Sangre', 'A', 'El personaje controla el agua de la sangre de todos los enemigos dentro de su rango de alcance, sometiéndolos a su voluntad. Este control inflige daños elemental de 2d6 mas el bonificador de Inteligencia y daños físicos de 3d4, los enemigos afectados quedan bajo el control del personaje mientras dure el efecto.')
  ) AS a(level, name, action, description)
WHERE c.name = 'Chamán';

-- Clérigo
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Clérigo', 'Legal, neutral/legal', 4, 'Ligera',
  'No puede usar armas de filo. Puede usar todos los escudos (Menos el Scutum)',
  '14 Sabiduría', 'Símbolo sagrado, Libro sagrado',
  ARRAY['Elfo', 'Gnomo', 'Humano', 'Jotun', 'Nahiaride', 'Semielfo', 'Semiorco']::text[],
  3, 1, 4, 1, 2,
  '{"Sabiduría":14}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Clérigo');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Clérigo');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,1000),(3,3000),(4,6000),(5,12000),(6,25000),(7,50000),(8,100000),(9,200000),(10,300000),(11,400000),(12,500000),(13,600000),(14,700000),(15,800000),(16,900000),(17,1000000),(18,1100000),(19,1200000),(20,1300000)) AS x(level, xp)
WHERE c.name = 'Clérigo';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Clérigo');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Leer Lenguas Ocultas', 'P', 'Permite al personaje entender y traducir idiomas y textos ocultos, cifrados o camuflados por magia'),
    (0, 'Sanación Básica', 'A', 'El personaje restaura 1d4 puntos de vida más su modificador de Sabiduría a un objetivo.'),
    (0, 'Detectar mal', 'P', 'el personaje puede detectar si un objeto o lugar contiene magia oscura, infernal o maldita.'),
    (0, 'Premonición', 'A', 'El personaje puede solicitar a los dioses respuestas a través de visiones, obteniendo imágenes que le permiten prever futuros acontecimientos fuera de combate, obteniendo una bonificación en la tirada basado en su modificador de Sabiduría.'),
    (0, 'Protección Divina Contra el Mal', 'A', 'El personaje aumenta su C.A. contra magias oscuras o infernales en -3'),
    (0, 'Purificar Agua y Alimentos', 'P', 'el personaje limpia y purifica agua y alimentos, eliminando cualquier tipo de contaminación, impurezas, o maldiciones que puedan estar presentes.'),
    (0, 'Resistencia al Miedo', 'P', 'El personaje recibe una bonificación de +3 en la tirada de salvación contra efectos que inducen miedo o pánico.'),
    (2, 'Disipar el Mal', 'A', 'El personaje elimina cualquier tipo de corrupción de alma, maldición o pacto oscuro que afecte a un objetivo'),
    (2, 'Bendecir', 'A', 'El personaje imbuye un arma con magia sagrada, otorgándole una bonificación de +1 de daño sagrado durante el combate, esta bonificación se incrementa adicionalmente con el modificador de Sabiduría del personaje.'),
    (2, 'Detectar Magia', 'P', 'el personaje puede detectar si un objeto o lugar contiene magia.'),
    (2, 'Sanar Estados', 'A', 'El personaje elimina un estado negativo de un objetivo'),
    (5, 'Conocer alineamiento', 'P', 'el personaje puede discernir el alineamiento moral de una persona, revelando si son legales, neutrales o caóticos'),
    (5, 'Bienaventurado', 'P', 'El personaje no puede ser silenciado mientras porte su símbolo sagrado.'),
    (5, 'Destreza Angelical', 'P', 'El personaje aumenta en +1 el modificador de destreza de los ataques con armas contundentes y hechizos sagrados.'),
    (5, 'Sacra veteranía', 'P', 'Incrementa en +1 el modificador de Sabiduría del personaje solo para habilidades de sanación y efectos de estado'),
    (5, 'Estallido de Fuerza', 'A', 'el personaje ataca a todos los enemigos a 2 casillas de distancia con daño sagrado de 1d4 más el modificador de sabiduría y los empuja tanto como daño se haya realizado'),
    (5, 'Detectar Trampa sagradas', 'P', 'El personaje tiene la habilidad de identificar y localizar trampas escondidas o dispuestas en su entorno que contengan magia sagrada'),
    (5, 'Sello de Claridad', 'A', 'El personaje puede crear varias esferas de luz brillante que acompaña a los aliados y a sí mismo, iluminando el camino y disipando la oscuridad en un área circundante'),
    (5, 'Resistencia al Fuego', 'P', 'El personaje tiene resistencia al fuego elemental o infernal, reduciendo en -2 el daño recibido de estos ataques.'),
    (5, 'Retener Persona', 'A', 'El personaje inmoviliza la mente de un objetivo mediante cadenas mágicas sagradas que lo atan al suelo, dejándolo incapaz de moverse ni actuar.'),
    (5, 'Conocimientos Avanzados de Clérigo', 'P', 'El personaje posee un profundo y especializado conocimiento sobre divinidades, tanto benignas como malignas, permitiéndole comprender y manipular aspectos complejos de la religión, historia y la magia sagrada'),
    (5, 'Luz Permanente', 'A', 'El arma o símbolo sagrado del personaje emite una luz constante que ilumina todo el terreno circundante, revelando cualquier objeto o criatura en la oscuridad. Esta luz no puede ser contrarrestada mientras el personaje mantenga su fe.'),
    (5, 'Silenciar', 'A', 'El personaje impide que un enemigo pueda lanzar hechizos, bloqueando su capacidad para conjurar magia hasta su próximo turno.'),
    (8, 'Proyectil de Rayo Sagrado', 'A', 'El personaje ataca lanzando un rayo de energía sagrada que inflige 1d10 más el modificador de sabiduría en daño sagrado. El proyectil tiene un rango de 4 casillas.'),
    (8, 'Encontrar el camino', 'P', 'ante la duda de la elección de un camino, el personaje suelta su báculo para escoger el camino más adecuado'),
    (8, 'Sanación', 'A', 'El personaje restaura 1D8 puntos de vida más su modificador de Sabiduría a un objetivo.'),
    (10, 'Expulsar Seres Espectros y No-Muertos', 'A', 'El personaje realiza un ataque poderoso que destierra a todos los enemigos espectrales y no-muertos dentro de su rango de alcance hacia la Isla de Nox. Los seres con nivel menor que el del clérigo son trasladados de manera automática. A los enemigos de igual nivel recibe una penalización de -3 en la tirada de acción. No surte efectos con los enemigos de mayor nivel'),
    (10, 'Disipar magia', 'A', 'el personaje puede eliminar la magia de un objeto o lugar encantado'),
    (10, 'Sabiduría Iluminada', 'P', 'Incrementa en +2 el modificador de Sabiduría del personaje solo para habilidades de sanación y efectos de estado'),
    (10, 'Golpe Sacro', 'A', 'El personaje incrementa el daño sagrado de un ataque físico propio en +2, más el modificador de Sabiduría, además, aumenta su modificador de Destreza en +1.'),
    (10, 'Localizar Objetos Malditos', 'P', 'El personaje obtiene una bonificación de +5 en la tirada para detectar objetos que estén malditos o encantados con magia oscura'),
    (10, 'Luz Permanente en Grupo', 'A', 'El personaje lanza un hechizo que genera aureolas a cada miembro del grupo, iluminando el camino. Esta luz no puede ser contrarrestada mientras todos los miembros del grupo mantengan fe en el personaje que lo ha invocado.'),
    (10, 'Quitar Maldiciones', 'A', 'El personaje elimina todas maldiciones de un objetivo dentro de su rango de alcance'),
    (10, 'Crear Alimentos', 'P', 'El personaje puede generar alimentos a partir de objetos inertes o no comestibles, transformándolos en comidas nutritivas y comestibles.'),
    (10, 'Detectar Mentiras', 'P', 'El personaje recibe una bonificación de +5 a la tirada de Carisma cuando intenta discernir si alguien está mintiendo o engañándolo'),
    (10, 'Neutralizar Venenos', 'A', 'El personaje elimina un efecto de envenenamiento en un objetivo.'),
    (12, 'Sanación en Grupo', 'A', 'El personaje cura a todos los aliados dentro de su alcance, restaurando 1d8 puntos de vida más el modificador de Sabiduría.'),
    (12, 'Golpe Flamígero Sagrado', 'A', 'El personaje imbuye su arma en fuego sagrado, infligiendo +2 de daño sagrado más el modificador de Sabiduría e Inteligencia en cada golpe exitoso, esta habilidad es compatible con Golpe Sacro'),
    (12, 'Sanación Superior', 'A', 'El personaje restaura 1D12 puntos de vida más el modificador de Sabiduría a un objetivo.'),
    (12, 'Visión Verdadera', 'P', 'El personaje puede ver a través de camuflajes y sigilos, revelando la verdadera forma de los enemigos dentro de su rango.'),
    (15, 'Rayo Sagrado', 'A', 'El personaje lanza un rayo de luz divina que se extiende a lo largo de cuatro casillas, este rayo inflige daño sagrado de 1d12 más el modificador de sabiduría a todos los enemigos en su trayectoria y, al mismo tiempo, sana a todos los aliados afectados con la misma cantidad de puntos.'),
    (15, 'Levitar', 'P', 'el personaje puede flotar para evitar el daño por caída'),
    (15, 'Palabras Sagradas Menor', 'A', 'El personaje imbuye a sí mismo y a todos los compañeros cercanos con poder sagrado, otorgándoles un +3 de daño sagrado en sus ataques más el modificador de Sabiduría del personaje que ha realizado el hechizo. Este efecto no entra en conflicto con otros efectos activos que reciban los compañeros, excepto aquellos de origen sagrado, como Símbolo Divino o Bendecir.'),
    (15, 'Regeneración', 'P', 'El personaje recupera de manera pasiva 2 puntos de daño más el modificador de Sabiduría al final de cada turno.'),
    (15, 'Restablecimiento', 'A', 'El personaje restaura instantáneamente toda su vitalidad. Esta habilidad puede usarse solo una vez por combate.'),
    (15, 'Sanación Excelente', 'A', 'El personaje restaura 1d20 puntos de vida más el modificador de Sabiduría a un objetivo.'),
    (15, 'Diva Tempestad', 'A', 'El personaje invoca una lluvia sagrada con un alcance de 12 casillas que reduce el modificador de Destreza y Constitución de los enemigos en -1, si los enemigos afectados son seres demoníacos o impíos, la reducción es de -2.'),
    (15, 'Resurrección', 'A', 'El personaje puede levantar a un aliado fallecido en combate, devolviéndolo a la vida con una penalización de -1 a su nivel. Esta habilidad solo se puede utilizar fuera de combate.'),
    (15, 'Beatífico primoroso', 'P', 'Incrementa en +3 el modificador de Sabiduría del personaje solo para habilidades de sanación y efectos de estado'),
    (15, 'Caminar por las Aguas', 'P', 'El personaje puede conceder a sí mismo y a sus compañeros la capacidad de caminar sobre el agua, sin hundirse ni ser ralentizados.'),
    (15, 'Símbolo de la Deidad Única', 'A', 'El personaje puede imbuir su arma con el poder celestial de su deidad, incrementando el daño sagrado en +5 más el modificador de Sabiduría. Esta habilidad solo puede ser utilizada por el personaje y es incompatible con la habilidad activas de Palabras Sagradas Menor y el Palabras Sagradas.'),
    (15, 'Calmar el Clima', 'A', 'El personaje puede influir en las condiciones meteorológicas, calmando tormentas, reduciendo vientos fuertes y despejando cielos nublados dentro de su rango.'),
    (18, 'Expulsar Seres Infernales y Malditos', 'A', 'El personaje realiza un ataque poderoso que destierra a todos los enemigos infernales, impíos y malditos dentro de su rango de alcance hacia la Isla de Nox. Los seres con nivel menor que el del clérigo son trasladados de manera automática. A los enemigos de igual nivel recibe una penalización de -3 en la tirada de acción.'),
    (18, 'Misionero', 'A', 'modifica el alineamiento caótico, caótico/neutral de un objetivo con igual o menor nivel que el personaje'),
    (18, 'Abrir Aguas', 'A', 'El personaje puede dividir o apartar las aguas en su entorno, creando un camino transitable o despejando áreas inundadas.'),
    (20, 'Resurrección en Masa', 'A', 'El personaje puede revivir a todos los aliados caídos dentro del combate, pero con una penalización de -1 al nivel de cada aliado.'),
    (20, 'Sanación suprema', 'A', 'El personaje cura a todos los aliados dentro de su alcance, restaurando 1d20 puntos de vida más el modificador de Sabiduría.')
  ) AS a(level, name, action, description)
WHERE c.name = 'Clérigo';

-- Druida
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Druida', 'Legal, neutral/legal, neutral', 4, 'Ligera / Media',
  'No puede armas pesadas. Puede usar todos los escudos (Menos el Scutum)',
  '12 Sabiduría, 10 Constitución', 'Ninguno, HABILIDAD ESPECIAL, Los druidas no pueden realizar otros hechizos mientras estén convertidos, Información adicional sobre la transformación del personaje:, Animales Comunes: Bestias de categoría 1 o animales que no estén en el bestiario. Las estadísticas de las bestias que no están incorporadas en el bestiario, se dejan a criterio del Máster, Animales Poco Comunes: Bestias de categoría 2. Se usan las estadísticas del bestiario, no obstante, la vida del druida se mantiene, además de sumarse el 5% de la vitalidad del animal que aparece en el bestiario, Animales Míticos: Bestias de categoría 3. Se usan las estadísticas del bestiario, no obstante, la vida del druida se mantiene, además de sumarse el 10% de la vitalidad del animal que aparece en el bestiario, Animales Legendarios: Bestias de categoría 4. Se usa las estadísticas del bestiario, no obstante, la vida del druida se mantiene, además de sumarse el 20% de la vitalidad del animal que aparece en el bestiario',
  ARRAY['Elfo', 'Elfo Oscuro', 'Felino', 'Humano', 'Jotun', 'Nahiaride', 'Orco', 'Sátiro', 'Semielfo', 'Semiorco', 'Troloide']::text[],
  2, 3, 4, 1, 5,
  '{"Sabiduría":12,"Constitución":10}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Druida');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Druida');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,1000),(3,3000),(4,4000),(5,6000),(6,7000),(7,10000),(8,20000),(9,40000),(10,80000),(11,100000),(12,200000),(13,400000),(14,600000),(15,800000),(16,1000000),(17,1250000),(18,1500000),(19,1750000),(20,2000000)) AS x(level, xp)
WHERE c.name = 'Druida';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Druida');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Detectar Magia', 'P', 'Permite detectar si un objeto o lugar contiene magia.'),
    (0, 'Sello de Claridad', 'P', 'El personaje puede crear varias esferas de luz brillante que acompaña a los aliados y a sí mismo, iluminando el camino y disipando la oscuridad en un área circundante'),
    (0, 'Leer Magia', 'P', 'puede leer las magias arcanas para saber su utilidad y como desactivarlas'),
    (0, 'Curar Heridas Leves', 'A', 'El personaje realiza una sanación hacia un objetivo dentro de su rango de alcance, restaurando 1d4 puntos de salud más el modificador de Sabiduría del personaje.'),
    (0, 'Detectar el Mal en Elementos de la Naturaleza', 'P', 'El personaje puede percibir y reconocer la corrupción o influencia maligna en plantas, animales o cualquier parte del entorno natural.'),
    (0, 'Hablar con los Animales', 'P', 'El personaje puede comunicarse verbalmente con cualquier animal'),
    (0, 'Transformación Animal', 'A', 'Pequeños Seres) (El personaje puede transformarse en cualquier criatura pequeña, como una alimaña, un roedor o un insecto'),
    (0, 'Herboristería', 'P', 'El personaje tiene un amplio conocimiento sobre todas las variedades de plantas y recibe una bonificación de +5 a las tiradas de suerte al recolectarlas.'),
    (2, 'Enredaderas', 'A', 'El personaje invoca raíces y enredaderas que emergen del suelo, paralizando a todos los enemigos en un radio de 5 casillas, impidiéndoles moverse o actuar'),
    (2, 'Calmar a los Animales', 'A', 'El personaje tiene la capacidad de apaciguar a los animales en su entorno'),
    (3, 'Sanar compañeros', 'A', 'El personaje realiza una sanación hacia un objetivo dentro de su rango de alcance, restaurando 1d6 puntos de salud más el modificador de Sabiduría del personaje.'),
    (3, 'Conocimiento de Remedios Naturales', 'P', 'El personaje posee conocimientos de remedios para neutralizar envenenamientos causados por animales o plantas tóxicas.'),
    (4, 'Regeneración Silvestre', 'P', 'Mientras el personaje se encuentre en un bosque o entorno boscoso, extrae poder de la naturaleza, sanándose de manera pasiva 1 punto de vida por turno, más el modificador de Sabiduría.'),
    (4, 'Pericia Encantada', 'P', 'El personaje obtiene un aumento en el modificador de destreza de +2 al lanzar hechizos mientras está en modo humanoide'),
    (5, 'Silenciar', 'A', 'El personaje puede impedir que un enemigo dentro de su rango de alcance lance hechizos.'),
    (6, 'Transformación Animal', 'A', 'Cualquier bestia común) (El druida puede transformarse en cualquier criatura común, adaptándose cualquier entorno con total libertad.'),
    (8, 'Crecimiento animal', 'A', 'aumenta la constitución del personaje en +2'),
    (8, 'Sanar Heridas graves', 'A', 'El personaje realiza una sanación hacia un objetivo dentro de su rango de alcance, restaurando 1d8 puntos de salud más el modificador de Sabiduría del personaje.'),
    (9, 'Comunicación en Transformación', 'P', 'El personaje puede mantener la capacidad de hablar en idioma común incluso mientras está transformado en un animal.'),
    (10, 'Piel gruesa de animal', 'P', 'el C.A. en forma animal del personaje, aumenta en -2'),
    (10, 'Latido de la Tierra', 'P', 'Mientras el personaje se encuentre en un bosque o entorno boscoso, extrae poder de la naturaleza, sanándose de manera pasiva 2 punto de vida por turno, más el modificador de Sabiduría y además todos los compañeros dentro del rango de alcance del druida se beneficia una regeneración pasiva de 1 punto de vida más el modificador de sabiduría, esta habilidad sustituye a Regeneración Silvestre'),
    (12, 'Transformación Animal', 'A', 'Bestias Poco Comunes) (El personaje puede transformarse en bestias raras y poderosas como el Amarok, adquiriendo sus habilidades y características únicas mientras conserva su consciencia'),
    (12, 'Vigor de la tierra', 'A', 'El personaje realiza una sanación hacia un objetivo dentro de su rango de alcance, restaurando 1d12 puntos de salud más el modificador de Sabiduría del personaje.'),
    (13, 'Crear Alimentos', 'A', 'El personaje puede generar alimentos a partir de objetos inertes o no comestibles, transformándolos en comidas nutritivas y comestibles.'),
    (13, 'Invocar Familiar', 'A', 'el personaje puedes invocar a un familiar que se halle en la sede de Gremio o en algún refugio de su propiedad'),
    (14, 'Transformación Vegetal', 'A', 'El personaje puede convertirse en cualquier tipo de árbol o planta, adoptando sus características y habilidades. Esto le permite mezclarse con el entorno natural, obtener ventajas en camuflaje y manipular elementos del ecosistema a su favor mientras mantiene su consciencia.'),
    (14, 'Viveza natural', 'A', 'El personaje realiza una sanación hacia un objetivo dentro de su rango de alcance, restaurando 1d20 puntos de salud más el modificador de Sabiduría del personaje.'),
    (15, 'Escudo en Grupo', 'A', 'El personaje invoca enredaderas resistentes que forman un escudo protector alrededor de sus compañeros en un alcance de 5 casillas. Este escudo bloquea el hechizo de daño masivo o ataque poderoso dirigidos a todos los aliados dentro del área de protección'),
    (16, 'Transformación Épica', 'A', 'Cualquier Bestia) (El personaje puede transformarse en poderosas criaturas míticas como fénixes o hidras, adquiriendo sus habilidades sobrenaturales y características legendarias mientras conserva su consciencia.'),
    (18, 'Revivir Animales', 'A', 'Permite al personaje resucitar a cualquier tipo de animal, sin importar su rareza, devolviéndolo a la vida sin ninguna penalización'),
    (18, 'Seducción', 'P', 'Incrementa la habilidad del personaje en carisma para las acciones de seducción, con un bonificador de +4 a la tirada'),
    (19, 'Comunión con la Naturaleza', 'A', 'El personaje canaliza un aura floral que envuelve el entorno, que mientras esté activa, el personaje y sus aliados dentro de su rango de alcance reciben una regeneración pasiva de +3, más el bonificador de Sabiduría. Asimismo, todos obtienen un +2 a sus tiradas de iniciativa. Esta habilidad reemplaza a Latido de la Tierra y puede ser utilizada en cualquier entorno, no solo en zonas boscosas.'),
    (20, 'Transformación Legendaria', 'A', 'Cualquier Bestia) (El personaje puede transformarse en poderosas criaturas Legendaria como dragones, adquiriendo sus habilidades sobrenaturales y características legendarias mientras conserva su consciencia.'),
    (20, 'Resurrección', 'A', 'el personaje levanta a un aliado caído, con una penalización de –1 al nivel, solo fuera de combate')
  ) AS a(level, name, action, description)
WHERE c.name = 'Druida';

-- Espadachín
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Espadachín', 'Cualquiera', 1, 'Ligera',
  'Sólo puede usar armas de filo. Sin escudo: (El personaje no puede equipar ningún tipo de escudo)',
  '14 Destreza', 'Cualquier tipo de arma cuerpo a cuerpo',
  ARRAY['Aviroide', 'Elfo', 'Elfo Oscuro', 'Enano', 'Humano', 'Jotun', 'Orco', 'Renegado', 'Semielfo', 'Semiorco']::text[],
  3, 5, 3, 2, 2,
  '{"Destreza":14}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Espadachín');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Espadachín');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,4000),(3,6000),(4,10000),(5,18000),(6,34000),(7,67000),(8,122000),(9,242000),(10,340000),(11,460000),(12,580000),(13,700000),(14,820000),(15,930000),(16,1000000),(17,1150000),(18,1290000),(19,1450000),(20,1600000)) AS x(level, xp)
WHERE c.name = 'Espadachín';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Espadachín');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Sendero del duelista', 'P', 'El personaje está obligado a utilizar armas de filo en combate o en su defecto cualquier espada perforante. No puede emplear armas de otro tipo.'),
    (0, 'Desenvainar rápido', 'P', 'Aumenta la tirada de iniciativa del personaje en +7'),
    (0, 'Bonificación con espada', 'P', 'El personaje aumenta en +1 a la destreza con armas de espada, estoque o armas similares'),
    (0, 'Orgulloso', 'P', 'El personaje actúa con gran confianza y dignidad, lo que le concede una penalización de -3 al Carisma en la provocación.'),
    (2, 'Finta/Amague', 'A', 'El personaje ejecuta una maniobra engañosa que confunde al enemigo, aumentando en +2 la destreza del espadachín contra el ataque del objetivo durante el siguiente turno.'),
    (2, 'Maestro de Esgrima', 'P', 'El personaje obtiene una bonificación de -1 a la Clase de Armadura (C.A.) y un +2 al daño cuando combate con una espada en una mano.'),
    (3, 'Esquive', 'P', 'el personaje aumenta en +1 a la destreza para la esquiva'),
    (3, 'Deslizamiento', 'P', 'el personaje obtiene dos pasos de movimientos gratuitos en cada ronda de combate'),
    (5, 'Contraataque', 'P', 'Cuando un enemigo realiza un ataque cuerpo a cuerpo, el personaje puede lanzar 1d20. Si el resultado es mayor que el ataque del enemigo, esquiva el golpe y contraataca, infligiendo 1d4 de daño, no se puede aplicar bonificaciones y solo se puede usar una vez por ronda)'),
    (5, 'Habilidad Acrobática', 'P', 'El personaje recibe una bonificación de +1 a la destreza para esquivar y además puede utilizar la habilidad de Saltar y Trepar'),
    (6, 'Carga', 'P', 'El personaje puede atacar al finalizar el movimiento'),
    (7, 'Experto en el Combate Duelista', 'P', 'Cuando el personaje realiza un ataque exitoso, inflige daño con ambas armas cuerpo a cuerpo, siendo la segunda arma siempre una daga.'),
    (7, 'Desangrar', 'P', 'Al acertar un ataque, el personaje inflige un daño pasivo por desangre de +1 por turno al objetivo. Este efecto no se acumula si se aplica al mismo objetivo'),
    (7, 'Bonificación en Duelo', 'P', 'En un combate uno a uno, el personaje recibe un aumento de +1 en todas sus bonificaciones mientras dure el enfrentamiento.'),
    (9, 'Agilidad del Retador', 'P', 'Cuando el contrincante falla un ataque cuerpo a cuerpo, el personaje puede desplazarse 1 casilla de manera gratuita.'),
    (10, 'Ataque Doble', 'P', 'Permite al personaje realizar un segundo ataque inmediatamente después del primero en el mismo turno.'),
    (10, 'Mofa', 'P', 'Aumenta en +3 la tirada de carisma cuando el personaje intenta provocar o burlarse de un enemigo.'),
    (10, 'Desviar Proyectiles', 'P', 'Permite al personaje intentar esquivar ataques de proyectiles a distancia, ya sean físicos o mágicos. Si obtiene una tirada de 1d20 superior al ataque del enemigo, esquiva el proyectil con éxito. No se aplican bonificaciones a esta tirada y solo se puede usar una vez por ronda'),
    (12, 'Impacto Certero', 'P', 'Cuando el personaje daña a un enemigo en combate cuerpo a cuerpo, el daño mínimo que inflige siempre será de 1 punto'),
    (12, 'Bonificación con Armadura Ligera', 'P', 'El personaje aumenta su movimiento en +4 casillas y aumenta su Clase de Armadura (C.A.) en -1'),
    (13, 'Explotar debilidad', 'P', 'el personaje ignora la constitución del enemigo'),
    (13, 'Destreza del Camorrista', 'P', 'La destreza del personaje no puede ser reducida.'),
    (15, 'Espada Danzante', 'P', 'Permite al personaje usar Contraataque y Desviar Proyectiles múltiples veces en un solo turno, siempre que cada acción sea contra un enemigo diferente.'),
    (15, 'Golpe Desestabilizador', 'P', 'Al acertar el primer golpe, el personaje reduce la Destreza del enemigo en -1 hasta el final del combate.'),
    (16, 'Interceptar ataque', 'P', 'el personaje puede interponerse en el ataque que va a recibir un aliado adyacente con contrarrestar o desviar proyectil'),
    (17, 'Espada Danzante Endemoniada', 'P', 'Permite al personaje realizar Contraataque y Desviar Proyectiles sin límite de veces durante el combate.'),
    (17, 'Ataque perfecto', 'P', 'El personaje puede ignorar completamente la Clase de Armadura (CA) de sus objetivos durante el ataque'),
    (17, 'Destreza aumentada', 'P', 'Aumenta el modificador de destreza del personaje en +3'),
    (19, 'Excelencia de la espada', 'P', 'El personaje puede atacar una tercera vez, no obstante si realiza este ataque, en el próximo turno estará fatigado'),
    (20, 'Dueño del Duelo', 'P', 'En un combate uno a uno, el personaje tira tres dados de 20 y elige el resultado más alto para sus tiradas de ataque')
  ) AS a(level, name, action, description)
WHERE c.name = 'Espadachín';

-- Explorador
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Explorador', 'Cualquiera', 2, 'Ligera / Media',
  'No puede usar armas pesadas (Exceptuando las armas de Asta) Sin escudo: (El personaje no puede equipar ningún tipo de escudo)',
  '13 Constitución', 'Papiro y pluma, Catalejo, Mapa, Brújula',
  ARRAY['Aviroide', 'Elfo', 'Elfo Oscuro', 'Enano', 'Goblin', 'Humano', 'Nahiaride', 'Orco', 'Renegado', 'Reptiliano', 'Sátiro', 'Semielfo', 'Semiorco', 'Troloide']::text[],
  6, 4, 7, 1, 4,
  '{"Constitución":13}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Explorador');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Explorador');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,2000),(3,4000),(4,8000),(5,16000),(6,32000),(7,65000),(8,120000),(9,240000),(10,360000),(11,480000),(12,600000),(13,720000),(14,840000),(15,950000),(16,1100000),(17,1200000),(18,1300000),(19,1400000),(20,1500000)) AS x(level, xp)
WHERE c.name = 'Explorador';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Explorador');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Cartografía', 'P', 'El personaje es capaz de leer mapas y guiarse utilizando los cuerpos celestes para navegar u orientarse en cualquier entorno.'),
    (0, 'Arqueología', 'P', 'El personaje posee conocimientos profundos sobre historia antigua, reliquias y objetos antiguos, lo que le otorga una bonificación de +3 en la tirada para descubrir secretos, hechizos e identificar la veracidad de las reliquias.'),
    (0, 'Suerte para encontrar reliquias', 'P', 'Otorga al personaje un bonificador de +3 a la tirada cuando se buscan reliquias u objetos valiosos ocultos'),
    (0, 'Detectar Emboscadas', 'P', 'El personaje aumenta en +3 su tirada de percepción al intentar detectar emboscadas.'),
    (0, 'Resistencia a las Temperaturas', 'P', 'El personaje obtiene una bonificación de +2 en las tiradas de salvación relacionadas con temperaturas extremas'),
    (2, 'Encontrar refugio', 'A', 'el personaje localiza un refugio para el grupo de manera eficiente'),
    (2, 'Equitación', 'P', 'Cuando el personaje se encuentra montado, su movimiento base aumenta en +3 y su movimiento en combate se incrementa en +6, además de la movilidad correspondiente a su clase.'),
    (3, 'Detectar Trampa', 'P', 'El personaje tiene la habilidad de identificar y localizar trampas escondidas o dispuestas en su entorno'),
    (3, 'Bonificación en Ruinas', 'P', 'Mientras el personaje se encuentre en ruinas, templos u otros sitios antiguos, recibe una bonificación en el modificador de destreza de +1, una bonificación a la tirada de +3 a la Percepción y +2 de Movimiento.'),
    (3, 'Tierra Desconocida', 'P', 'Mientras el personaje se encuentra en sitios desconocidos o por descubrir, obtiene una bonificación de +3 a la Percepción y +3 al Movimiento.'),
    (3, 'Descifrar enigmas', 'A', 'el personaje conoce la mayoría de los intrincados acertijos que se hallan en templos, santuarios, basílicas, etc.'),
    (3, 'Saltar y Trepar', 'A', 'el personaje puede saltar y trepar tanto por los árboles, muros, murallas, y otros obstáculos, superándolos con facilidad.'),
    (3, 'Ignorar Penalización del Terreno', 'P', 'El personaje puede moverse a través de cualquier terreno sin sufrir ninguna penalización a su velocidad o acciones.'),
    (5, 'Suerte para Encontrar el Camino', 'P', 'El personaje tiene una habilidad excepcional para orientarse y encontrar rutas seguras, otorgando un bonificador de +6 a la tirada de percepción para localizar el camino correcto.'),
    (5, 'Navegante', 'P', 'El personaje posee habilidades avanzadas en navegación, proporcionando un bonificador de +2 a todas las tiradas relacionadas con el mar y el manejo de barcos'),
    (5, 'Miembro de la Liga de Expedicionarios de Terratea', 'P', 'El personaje ha sido admitido en la prestigiosa Liga de Expedicionarios de Terratea, obteniendo acceso a recursos, información y apoyo exclusivo de la organización, así como reconocimiento entre otros exploradores'),
    (5, 'Escalar', 'P', 'Permite al personaje subir y descender superficies verticales con agilidad, facilitando el acceso a lugares elevados o difíciles de alcanzar, sin necesidad de accesorios'),
    (5, 'Percepción Mejorada', 'P', 'el personaje incrementa el bonificador en +5 a las tiradas de percepción'),
    (6, 'Velocidad y Agilidad Aumentadas', 'P', 'el personaje mejora la tirada de iniciativa en +4 y aumenta en +1 la destreza al esquivar'),
    (6, 'Rastreo', 'P', 'El personaje posee la habilidad para seguir el rastro de un objetivo mediante huellas y señales en el entorno, lo que le permite localizarlo a lo largo de diversos terrenos.'),
    (6, 'Leer lenguas', 'P', 'el personaje puede leer todas las lenguas, tanto vivas como muertas o demoníacas'),
    (8, 'Supervivencia', 'P', 'el personaje predomina su seguridad por encima de la seguridad de otros individuos'),
    (8, 'Sentidos Agudizados', 'P', 'El personaje aumenta el modificador de destreza en +2 solo para esquivar y otorga un bonificador de +1 a la tirada de percepción'),
    (8, 'Bonificación con Armas de Asta', 'P', 'el personaje incrementa el modificador de destreza en +1 al usar armas de asta y otorga un +2 al daño infligido con estas armas.'),
    (10, 'Iniciativa al combate', 'P', 'el personaje siempre empieza el combate'),
    (12, 'Aumento de Rango en la Liga de Expedicionarios', 'P', 'El personaje ha ascendido a un rango superior dentro de la Liga de Expedicionarios a Eremita, obteniendo mayores responsabilidades y privilegios dentro de la organización. y aumentando en +1 el bonificador de carisma'),
    (12, 'Máximo Esfuerzo', 'P', 'La carrera del personaje aumenta en +3 casillas'),
    (13, 'Espionaje', 'P', 'Amplifica la visión y el oído del personaje, duplicando su capacidad para detectar detalles a distancia y en silencio. Además, le otorga habilidades de camuflaje avanzadas que le permiten ocultarse con gran eficacia en su entorno.'),
    (13, 'Comprender Lenguas', 'P', 'El personaje puede aprender a leer y entender idiomas desconocidos o incomprensibles, incluyendo lenguas nuevas o encriptadas.'),
    (13, 'Inmunidad a Temperaturas Altas', 'P', 'El personaje es completamente inmune a los efectos adversos causados por temperaturas extremas de calor'),
    (13, 'Experto en Armas de Dos Lanzas', 'P', 'El personaje domina el uso de dos lanzas ligeras simultáneamente, permitiéndole dañar con una lanza en cada mano'),
    (13, 'Escape Rápido', 'P', 'El personaje obtiene una bonificación de +2 a su movimiento de Huir cuando intenta escapar o zafarse de un combate'),
    (13, 'Contactos', 'P', 'El personaje puede desempeñar labores de reportero o realizar trabajos en periódicos y medios de comunicación, obteniendo acceso a información privilegiada o rumores locales, es por ello que mejora su modificador carisma en +1.'),
    (15, 'Realizar enigmas', 'A', 'el personaje puede elaborar de manera eficiente acertijos, en lugares donde lo desea, tanto mágicas, oscuras, sagradas o físicas'),
    (15, 'Arremetida Relámpago', 'A', 'El personaje puede realizar una carrera sin ser trabado por los enemigos en su camino, atacando con un arma de una mano a todos los que se cruce. Después de la carrera, el personaje queda fatigado, descansando 2 turnos.'),
    (15, 'Experto en Redes', 'P', 'El personaje puede infligir 1D12, más su modificador de fuerza y atrapar a su enemigo utilizando redes y látigos. Además, puede utilizar estos instrumentos para coger objetos a distancia o atarlos a pilares y objetos rígidos.'),
    (15, 'Mapeado', 'A', 'el personaje puede realizar mapas y bocetos'),
    (15, 'Explorador Reconocido', 'P', 'El personaje asciende al rango de Profesor Agregado dentro de la Liga de Expedicionarios. Este estatus eleva su influencia y reputación, proporcionando un aumento de +2 a su Carisma.'),
    (16, 'Aumento de Rango en la Liga de Expedicionarios', 'P', 'El personaje asciende a un rango superior dentro de la Liga de Expedicionarios a cargo de Profesor Adjunto, lo que le otorga mayores privilegios y reconocimiento dentro de la organización aumentando el bonificador de +3 de Carisma'),
    (16, 'Infatigable', 'P', 'El personaje no necesita descansar después de realizar una carrera o cualquier acción que requiera fuerza y resistencia extraordinarias'),
    (16, 'Arremetida Relámpago Mejorado', 'P', 'El personaje perfecciona su habilidad de Arremetida Relámpago, reduciendo el tiempo de recuperación a solo 1 turno en lugar de 2'),
    (18, 'Piernas Ágiles', 'P', 'El personaje aumenta su esquiva en +3 y también incrementa todos sus movimientos en +2.'),
    (18, 'Brazos Veloces', 'P', 'El personaje aumenta en +4 su bonificador a las tiradas de destreza para abrir cerraduras y desmantelar trampas, y recibe una bonificación de +1 a la destreza al atacar.'),
    (18, 'Mente Audaz', 'P', 'Permite al personaje ignorar 2 puntos de Constitución del enemigo a la hora de atacar con éxito'),
    (20, 'Ultra instinto', 'P', 'el personaje siempre empieza y acaba las rondas de combate')
  ) AS a(level, name, action, description)
WHERE c.name = 'Explorador';

-- Forajido
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Forajido', 'Caótico, Neutral/Caótico, Neutral', 6, 'Ligera / Media',
  'No puede usar armas pesadas excepto el Gastrafetes. Puede usar todos los escudos (Menos en Scutum)',
  '12 Destreza, 10 Constitución, 10 Carisma', 'Ninguna',
  ARRAY['Aviroide', 'Elfo Oscuro', 'Enano', 'Felino', 'Goblin', 'Humano', 'Jotun', 'Orco', 'Renegado', 'Reptiliano', 'Sátiro', 'Semielfo', 'Semiorco', 'Troloide']::text[],
  2, 3, 6, 2, 2,
  '{"Destreza":12,"Constitución":10,"Carisma":10}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Forajido');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Forajido');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,2000),(3,4000),(4,8000),(5,16000),(6,30000),(7,60000),(8,100000),(9,220000),(10,330000),(11,450000),(12,600000),(13,750000),(14,880000),(15,990000),(16,1150000),(17,1250000),(18,1375000),(19,1450000),(20,1500000)) AS x(level, xp)
WHERE c.name = 'Forajido';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Forajido');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Robo', 'P', 'El personaje recibe una bonificación de +3 a la tirada al realizar acciones de robo.'),
    (0, 'Perspicaz', 'P', 'El personaje recibe una bonificación de +3 a las tiradas relacionadas con la observación, lo que le permite detectar detalles ocultos, amenazas potenciales o pistas importantes con mayor facilidad.'),
    (0, 'Resistencia a los Climas Cálidos', 'P', 'El personaje obtiene una bonificación de +6 a la tirada de salvación en condiciones de calor extremo.'),
    (0, 'Equitación', 'P', 'Cuando el personaje se encuentra montado, su movimiento base aumenta en +3 y su movimiento en combate se incrementa en +6, además de la movilidad correspondiente a su clase.'),
    (0, 'Resistencia al Alcohol', 'P', 'El personaje recibe una bonificación de +3 a las tiradas de salvación contra la embriaguez.'),
    (0, 'Buscado', 'P', 'El personaje debe ocultarse o camuflarse al entrar en una ciudad para evitar ser detectado por las autoridades y otros enemigos.'),
    (1, 'Chantaje', 'P', 'El personaje tiene una bonificación de +5 a la tirada cuando intenta manipular a otros mediante amenazas o presión.'),
    (2, 'Táctica de Emboscada', 'P', 'El personaje incrementa la movilidad en +4 de todos los compañeros dentro de su alcance. Además, cuando realiza un ataque por sorpresa, sus modificadores de destreza aumentan en +3'),
    (3, 'Experto en Armas a Distancia', 'P', 'El personaje recibe un aumento de +2 en el modificador de destreza al utilizar armas a distancia.'),
    (4, 'Sabotaje', 'P', 'El personaje recibe un bonificador de +4 a la tirada cuando intenta desactivar, destruir o inutilizar mecanismos, estructuras o dispositivos.'),
    (4, 'Sintonía Atmosférica', 'A', 'El personaje tiene la habilidad de prever la llegada de tormentas de arena u otras tormentas con mucha antelación'),
    (4, 'Mala Suerte', 'A', 'Una vez al día, el personaje puede obligar a un oponente a repetir una tirada.'),
    (4, 'Intimidación', 'P', 'El personaje recibe un bonificador de +5 a la tirada al amenazar o coaccionar a un objetivo.'),
    (5, 'Encontrar refugio', 'A', 'el personaje localiza un refugio para el grupo de manera eficiente'),
    (6, 'Creación y Uso de Explosivos', 'A', 'El personaje posee conocimientos de ingeniería básica para montar y desmontar explosivos o trampas explosivas, y puede utilizarlos con alta eficiencia.'),
    (7, 'Yo Siempre Desenfundo Primero', 'P', 'El personaje siempre obtiene una bonificación de +20 en la tirada de iniciativa'),
    (8, 'Saqueo Eficaz', 'P', 'El personaje recibe una bonificación en el saqueo de cadáveres y objetos encontrados, realizando dos tiradas y quedándose con el resultado más alto para determinar los resultados. Además, la tirada se ve aumentada por el modificador de Destreza del personaje.'),
    (10, 'Resistencia al Hambre y la Sed', 'P', 'El personaje recibe una bonificación de +5 en la tirada de salvación para resistir los efectos negativos de la falta de comida o agua.'),
    (10, 'Rastreo', 'A', 'El personaje posee la habilidad para seguir el rastro de un objetivo mediante huellas y señales en el entorno, lo que le permite localizarlo a lo largo de diversos terrenos.'),
    (10, 'Bonificación en el Desierto', 'P', 'Mientras el personaje se encuentre en el desierto, el personaje recibe una bonificación de +2 en las tiradas de salvación, +2 al modificador de destreza y +1 al daño causado'),
    (10, 'Contrabando', 'A', 'El personaje puede realizar negociaciones ilícitas con éxito. Al tirar un dado de 4 caras (1d4) para determinar el beneficio, si obtiene: 1: Gana un 10% más en las transacciones. 2: Gana un 25% más en las transacciones. 3: Gana un 50% más en las transacciones. 4: Gana un 75% más en las transacciones.'),
    (10, 'Resistencia al Miedo', 'P', 'El personaje recibe una bonificación de +3 en la tirada de salvación contra efectos que inducen miedo o pánico.'),
    (10, 'Proyectiles En Llamas', 'A', 'Los proyectiles del personaje siempre están envueltos en llamas, infligiendo daño adicional de fuego al impactar, los proyectiles causan quemaduras, que infligen un daño pasivo de 1d6 en cada turno mientras persista la quemadura.'),
    (11, 'Experto en Armas y Utensilios Fabricados por Ingenieros', 'P', 'El personaje tiene un +2 a las tiradas de acción al usar armas y utensilios fabricados por ingenieros, en el caso de las armas aumenta su bonificador en +2 la destreza y +2 el daño.'),
    (12, 'Precisión Certera', 'P', 'El personaje recibe un bonificador de +2 a la destreza en ataques a distancia y asegura un mínimo de 1 punto de daño en cada ataque exitoso.'),
    (13, 'Inmunidad a Temperaturas Altas', 'P', 'El personaje es completamente inmune a los efectos adversos causados por temperaturas extremas de calor'),
    (14, 'Liderazgo', 'A', 'El personaje inspira a sus compañeros, otorgando una bonificación de +2 a las tiradas de iniciativa y +1 a las tiradas de salvación para todos los aliados dentro de su rango de alcance'),
    (14, 'Explotar Debilidad a Distancia', 'A', 'El personaje puede atacar las debilidades específicas del enemigo desde una distancia, suprimiendo su bonificación de constitución durante sus ataques a distancia.'),
    (14, 'Análisis del Terreno', 'P', 'El personaje evalúa el campo de batalla para identificar debilidades y vulnerabilidades del enemigo, lo que permite planificar estrategias más efectivas y explotar puntos débiles.'),
    (14, 'Proyectiles Explosivos', 'A', 'Cuando el personaje realiza un ataque a distancia, puede provocar una explosión en un área de 9 casillas. La explosión inflige el mismo daño que el arma que está utilizando para el ataque, los daños de explosión no se pueden combinar con la habilidad "Explotar Debilidad a Distancia".'),
    (15, 'Sueño Muy Ligero', 'P', 'El personaje tiene un sueño muy ligero, lo que le otorga un bonificador de +5 a las tiradas de percepción durante el descanso y le permite detectar amenazas inminentes con mayor eficacia.'),
    (16, 'Insurrecto', 'P', 'El personaje recibe una bonificación de +2 al modificador de Destreza y un incremento de +3 al daño cuando se enfrenta a guardias reales, centinelas o figuras de autoridad.'),
    (17, 'Resistencia al Dolor', 'P', 'el personaje reduce el daño físico recibido en -2 y otorga una bonificación de +5 a la resistencia contra torturas.'),
    (18, 'Ráfaga de Ataque a Distancia', 'P', 'El personaje puede realizar dos ataques a distancia en un solo turno. Si ambos ataques son exitosos, tiene la opción de realizar un tercer ataque adicional en el mismo turno.'),
    (20, 'Duelo al Amanecer', 'A', 'El personaje puede seleccionar a un oponente para ser trasladado a un plano alternativo de combate. En este plano, solo el personaje y el rival pueden interactuar, aislando al adversario de cualquier ayuda externa. Durante este duelo, el forajido recibe un bonificador de +3 a la Destreza para todas las acciones relacionadas con el combate uno a uno.'),
    (20, 'El más buscado', 'P', 'El personaje es ampliamente conocido y temido, otorgándole un bonificador de +5 al Carisma en tiradas de intimidación. Su notoriedad provoca que tanto civiles como guardias comunes sientan un intenso respeto o miedo hacia el personaje')
  ) AS a(level, name, action, description)
WHERE c.name = 'Forajido';

-- Gladiador
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Gladiador', 'Cualquiera', 3, 'Ligera / Media / Pesada',
  'Puede Usar todas las armas. Puede usar todos los escudos.',
  '13 Constitución, 13 Fuerza', 'Ninguno',
  ARRAY['Enano', 'Humano', 'Jotun', 'Orco', 'Renegado', 'Reptiliano', 'Semielfo', 'Semiorco', 'Troloide']::text[],
  3, 3, 3, 3, 3,
  '{"Constitución":13,"Fuerza":13}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Gladiador');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Gladiador');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,2000),(3,4000),(4,8000),(5,16000),(6,32000),(7,65000),(8,120000),(9,240000),(10,360000),(11,480000),(12,600000),(13,720000),(14,840000),(15,950000),(16,1100000),(17,1200000),(18,1300000),(19,1400000),(20,1500000)) AS x(level, xp)
WHERE c.name = 'Gladiador';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Gladiador');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Esclavo', 'P', 'El personaje no puede contradecir ni desobedecer las órdenes de su amo bajo ninguna circunstancia.'),
    (0, 'Versátil', 'P', 'El personaje puede usar cualquier tipo de armadura y arma con eficacia, incluyendo aquellas que estén encantadas, malditas o hechizadas, sin sufrir penalizaciones.'),
    (0, 'Megalomaníaco', 'P', 'El personaje tiene una alta admiración por sí mismo, lo que puede llevar a actitudes y comportamientos egocéntricos.'),
    (0, 'Ataque Doble', 'P', 'El personaje puede ejecutar dos ataques en un solo turno, lo que le permite golpear a su objetivo dos veces consecutivas.'),
    (0, 'Brutalidad', 'P', 'Aumenta +2 el daño del ataque si el objetivo tiene un nivel igual o menor que el personaje.'),
    (2, 'Ególatra', 'P', 'Cuando el personaje combate en una arena o frente a una audiencia, se siente impulsado por la admiración del público. Esto le otorga un bonificador de +1 a todas sus tiradas, salvo el daño que aumenta en +2.'),
    (2, 'Desangrar como Oficio', 'P', 'Cada vez que el personaje acierte un ataque, inflige una herida que provoca un desangrado continuo, causando 1 punto de daño adicional en cada turno hasta que la herida sea tratada.'),
    (2, 'Rugido de Batalla', 'A', 'El personaje libera un poderoso rugido que reduce la destreza de los enemigos en el campo de batalla en -1 y aumenta la iniciativa de los aliados en +2 durante el próximo turno.'),
    (3, 'Sed de Sangre', 'P', 'Cada vez que el personaje inflige un ataque exitoso, el daño de desangrado adicional se acumula, incrementándose con cada ataque consecutivo exitoso'),
    (3, 'Rotura', 'A', 'El personaje puede tomar las armas y armaduras comunes de sus oponentes durante el combate y romperlas, reduciendo su eficacia o destruyéndolas completamente.'),
    (4, 'Cuerpo Esculpido por Dioses', 'P', 'El personaje posee una físico formidable, otorgándole un bonificador de +3 al modificador de Constitución.'),
    (4, 'Resistencia al Miedo', 'P', 'El personaje recibe una bonificación de +3 en la tirada de salvación contra efectos que inducen miedo o pánico.'),
    (5, 'Admiración', 'A', 'El personaje se cura a sí mismo, recuperando 1d4 puntos de vida más su bonificador de Constitución cada vez que recibe elogios o admiración de su entorno, ya sea durante un combate o fuera de ella.'),
    (5, 'Erosión de Armadura', 'P', 'El personaje reduce la Clase de Armadura (CA) de su objetivo en +1 después del primer golpe acertado con éxito, lo que hace que el objetivo sea más vulnerable a los ataques tanto del gladiador como de sus aliados.'),
    (8, 'Infatigable', 'P', 'El personaje no necesita descansar después de realizar una carrera o cualquier acción que requiera fuerza y resistencia extraordinarias'),
    (8, 'Impulso', 'P', 'El personaje recibe una bonificación de +5 a la tirada de iniciativa'),
    (10, 'Maestro del Desarme', 'A', 'El personaje puede desarmar a su oponente durante el combate y, una vez desarmado, puede usar el arma que ha despojado del enemigo.'),
    (10, 'Ráfaga de Golpes', 'A', 'El personaje puede realizar dos ataques en un solo turno. Si ambos ataques son exitosos, tiene la opción de realizar un tercer ataque adicional en el mismo turno.'),
    (12, 'Pelea con Honor', 'P', 'Cuando el personaje deja a un oponente fuera de combate, se abstiene de ejecutarlo a menos que reciba una orden directa de su amo para hacerlo'),
    (12, 'Contra Más, Mejor', 'P', 'El personaje es un experto en enfrentarse a múltiples oponentes simultáneamente. Mientras haya más adversarios que aliados en el combate, aumenta su bonificador de destreza en +2 y su daño en +3.'),
    (12, 'Maestro de Armas', 'P', 'El personaje recibe una bonificación de +3 en el modificador de Destreza y +2 al modificador de Fuerza al utilizar cualquier tipo de arma, siempre y cuando no porte un escudo.'),
    (13, 'Técnica de Contención', 'A', 'El personaje puede incapacitar a un enemigo utilizando técnicas de lucha cuerpo a cuerpo, reteniéndolo con su propio cuerpo. Al realizar esta acción, el personaje obtiene una bonificación de +5 a la tirada, y además del modificador de Constitución'),
    (13, 'Regreso Triunfal', 'P', 'Cuando el personaje queda K.O., tiene la posibilidad de levantarse si es animado por sus compañeros o por la multitud que lo vitorea, y además su vitalidad se recupera en 1d12 más el modificador de Sabiduría.'),
    (14, 'Golpe Debilitante', 'P', 'Cada vez que el personaje realiza un ataque exitoso contra un enemigo, la Constitución del objetivo se reduce en -1. Esta penalización solo se aplica una vez por ronda, limitando su efecto a una sola vez por turno de combate'),
    (14, 'Heridas Profundas', 'P', 'Cuando el personaje provoca desangrado en un enemigo, ahora el efecto del desangrado aumenta con el modificador de Fuerza.'),
    (15, 'Compañerismo', 'P', 'El personaje está comprometido a proteger y defender a sus compañeros en todo momento, priorizando su seguridad y bienestar durante el combate sobre su propia seguridad.'),
    (15, 'Aceptable', 'P', 'El personaje no tiene prejuicios ni fobias hacia ninguna raza, género o estatus social, tratando a todos con imparcialidad, esta habilidad no puede ser contrarrestada.'),
    (18, 'Ataque de Gladiador', 'P', 'Cuando el personaje realiza un ataque con éxito, el daño infligido es irreducible y no puede ser mitigado por ninguna habilidad o equipo del oponente.'),
    (18, 'Superioridad', 'P', 'Todo el daño causado por desangrado es irreducible y no puede ser contrarrestado o mitigado por habilidades o defensas del oponente.'),
    (20, 'Líbero', 'P', 'El personaje se libera de su condición de esclavo y se convierte en su propio amo, obteniendo autonomía completa y la capacidad de tomar decisiones sin restricciones impuestas por un superior.'),
    (20, 'Amo y Señor del Coliseo', 'P', 'El personaje ha alcanzado el pináculo de habilidad en combate, y su Clase de Armadura (CA) pasa a ser 1, independientemente de la armadura que use.')
  ) AS a(level, name, action, description)
WHERE c.name = 'Gladiador';

-- Guardabosques
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Guardabosques', 'Cualquiera', 8, 'Ligera',
  'No puede usar armas pesadas excepto el Arco de Poleas. Sin escudo: (El personaje no puede equipar ningún tipo de escudo)',
  '14 Destreza', 'Arco',
  ARRAY['Aviroide', 'Elfo', 'Elfo Oscuro', 'Enano', 'Gnomo', 'Goblin', 'Humano', 'Nahiaride', 'Orco', 'Renegado', 'Sátiro', 'Semielfo', 'Semiorco', 'Troloide']::text[],
  3, 2, 3, 1, 1,
  '{"Destreza":14}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Guardabosques');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Guardabosques');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,2000),(3,4000),(4,8000),(5,16000),(6,32000),(7,65000),(8,120000),(9,240000),(10,360000),(11,480000),(12,600000),(13,720000),(14,840000),(15,950000),(16,1100000),(17,1200000),(18,1300000),(19,1400000),(20,1500000)) AS x(level, xp)
WHERE c.name = 'Guardabosques';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Guardabosques');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Infravisión', 'P', 'El personaje puede ver en la oscuridad y en condiciones de poca luz, aumentando su rango de visión en 3 casillas adicionales.'),
    (0, 'Bonificación en Bosques', 'P', 'El personaje recibe un bonificador de +1 a todas las tiradas realizadas mientras se encuentra en un entorno boscoso'),
    (0, 'Recolector', 'P', 'El personaje obtiene un bonificador de +4 en las tiradas para buscar y recolectar alimento.'),
    (0, 'Sueño Ligero', 'P', 'El personaje tiene un sueño muy ligero, lo que le otorga un bonificador de +3 a las tiradas de percepción durante el descanso y le permite detectar amenazas inminentes con mayor eficacia.'),
    (0, 'Penalización Cuerpo a Cuerpo', 'P', 'El personaje sufre una penalización de -2 en todas las tiradas relacionadas con el combate cuerpo a cuerpo.'),
    (1, 'Construir Refugio en Bosques', 'A', 'El personaje tiene la habilidad de construir refugios de manera eficiente en entornos forestales, proporcionando un lugar seguro y adecuado para todo el grupo durante la travesía o el descanso.'),
    (2, 'Saltar y Trepar', 'P', 'el personaje puede saltar y trepar tanto por los árboles, muros, murallas, y otros obstáculos, superándolos con facilidad.'),
    (3, 'Detectar Trampa', 'P', 'El personaje tiene la habilidad de identificar y localizar trampas escondidas o dispuestas en su entorno'),
    (4, 'Tiro Rápido', 'P', 'El personaje obtiene una bonificación de +6 a la tirada de iniciativa'),
    (5, 'Camuflaje', 'A', 'el personaje se oculta con el entorno, permaneciendo inmóvil mientras utiliza esta habilidad para evitar ser detectada.'),
    (6, 'Experto en Armas Arrojadizas', 'P', 'El personaje tiene una bonificación de +2 a la destreza al usar armas arrojadizas como cuchillos, hachas de una mano u otros objetos ligero arrojadizos'),
    (6, 'Pesca', 'P', 'El personaje obtiene un bonificador de +5 en las tiradas relacionadas con la pesca'),
    (6, 'Caza', 'P', 'El personaje recibe un bonificador de +5 en las tiradas relacionadas con la caza'),
    (7, 'Tiro Doble', 'P', 'El personaje puede lanzar dos proyectiles a distancia en un solo ataque.'),
    (8, 'Experto en Distancia', 'P', 'El personaje recibe un bonificador de +2 a la destreza en todos los ataques a distancia'),
    (9, 'Cuerpo Ligero', 'P', 'El personaje tiene una agilidad excepcional que le permite reducir en -3 el daño recibido por caídas.'),
    (10, 'Sigilo', 'A', 'El personaje puede desplazarse entre las sombras sin ser detectado'),
    (10, 'Bonificación en Oscuridad', 'P', 'El personaje recibe un bonificador de +1 a todas las tiradas realizadas en condiciones de oscuridad o nocturnidad'),
    (10, 'Detectar Invisibilidad', 'P', 'El personaje obtiene un bonificador de +3 a las tiradas de percepción para identificar y localizar seres o objetos invisibles en su entorno.'),
    (10, 'Paso del Tirador', 'P', 'Cada vez que el personaje realiza un ataque a distancia, puede desplazarse hasta 2 casillas de forma gratuita al finalizar el ataque.'),
    (10, 'Maestría con Arco Largo', 'P', 'Cuando el personaje utiliza un arco largo, obtiene un +2 al modificador de Destreza y suma +2 al daño infligido con cada impacto exitoso.'),
    (11, 'Luchador Experimentado', 'P', 'El personaje ha perfeccionado su técnica en combate a corta distancia, eliminando la penalización que se aplicaba al combatir cuerpo a cuerpo'),
    (12, 'Ojo de Halcón', 'P', 'El personaje incrementa su rango de alcance a 10 casillas, permitiéndole observar y atacar objetivos a distancias mayores'),
    (13, 'Crítico Aumentado', 'P', 'El personaje, al utilizar un arco, logra un impacto crítico en tiradas de 19 o más'),
    (14, 'Tiro triple', 'P', 'El personaje puede lanzar tres proyectiles a distancia en un solo ataque.'),
    (15, 'Venenos y Parálisis', 'P', 'Las flechas del personaje están impregnadas con venenos y agentes paralizantes. Cuando acierta un disparo, el objetivo recibe daño adicional de 1 más el modificador de sabiduría del personaje y además puede quedar paralizado.'),
    (16, 'Explotar Debilidad a Distancia', 'P', 'El personaje puede atacar las debilidades específicas del enemigo desde una distancia, suprimiendo su bonificación de constitución durante sus ataques a distancia.'),
    (16, 'Tiro en Movimiento', 'P', 'El personaje puede realizar un ataque a distancia al finalizar su movimiento'),
    (16, 'Reparar Arco y Munición', 'A', 'El personaje puede reparar su arco y fabricar munición utilizando materiales del bosque.'),
    (17, 'Ojo Avizor', 'P', 'El personaje incrementa su alcance con armas a distancia en +3 casillas más.'),
    (18, 'Lluvia de Flechas', 'A', 'El personaje lanza una ráfaga de flechas que golpea a todos los enemigos dentro de su alcance. Esta habilidad no puede combinarse con las habilidades Tiro Doble, Tiro Triple o Tiro Cuádruple'),
    (19, 'Tiro cuádruple', 'P', 'El personaje puede lanzar cuatro proyectiles a distancia en un solo ataque.'),
    (20, 'Nunca Fallo', 'P', 'El personaje puede realizar únicamente ataques a distancia, impactando a cualquier enemigo en el campo de batalla, sin que la distancia, los obstáculos o la cobertura interfieran en sus disparos. Además, sus ataques ignoran cualquier tipo de escudo mágico, muros o hechizos de barrera')
  ) AS a(level, name, action, description)
WHERE c.name = 'Guardabosques';

-- Guerrero Nórdico
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Guerrero Nórdico', 'Cualquiera', 2, 'Ligera / Media / Pesada',
  'No puede usar armas pesadas a distancia. Puede ninguno de los escudos.',
  '10 Fuerza, 10 Constitución', 'Ninguno',
  ARRAY['Enano', 'Felino', 'Humano', 'Jotun', 'Orco', 'Renegado', 'Semielfo', 'Semiorco']::text[],
  4, 2, 4, 4, 1,
  '{"Fuerza":10,"Constitución":10}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Guerrero Nórdico');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Guerrero Nórdico');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,2000),(3,4000),(4,8000),(5,16000),(6,32000),(7,65000),(8,120000),(9,240000),(10,360000),(11,500000),(12,750000),(13,900000),(14,1100000),(15,1300000),(16,1500000),(17,1700000),(18,1800000),(19,1900000),(20,2000000)) AS x(level, xp)
WHERE c.name = 'Guerrero Nórdico';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Guerrero Nórdico');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Resistencia al frío', 'P', 'El personaje tiene una resistencia al frío y a climas extremadamente bajos de +2'),
    (0, 'Honra del Guerrero', 'P', 'El personaje aumenta el modificador de fuerza en +1'),
    (0, 'Caminar por el Hielo', 'P', 'Permite al personaje moverse con eficiencia y sin penalizaciones sobre superficies heladas o resbaladizas.'),
    (0, 'Peletería y Desuello', 'A', 'El personaje tiene la habilidad de desollar criaturas, curtir las pieles obtenidas y elaborar armaduras de nivel medio'),
    (0, 'Brutalidad', 'P', 'Aumenta +2 el daño del ataque si el objetivo tiene un nivel igual o menor que el personaje.'),
    (2, 'Saqueo', 'P', 'El personaje tiene una bonificación de +4 a las tiradas relacionadas con la recolección de botines y tesoros.'),
    (2, 'Bonificación de Navegante', 'P', 'El personaje obtiene una bonificación de +1 en todas las tiradas mientras se encuentra en navíos.'),
    (2, 'Adaptación Invernal', 'P', 'El personaje recibe una bonificación de +1 en todas las tiradas mientras se encuentra en terrenos nevados o en elevaciones.'),
    (5, 'Experto en Combate Cuerpo a Cuerpo', 'P', 'El personaje aumenta en +1 tanto el bonificador de destreza como el daño en combates cuerpo a cuerpo'),
    (5, 'Fiereza', 'P', 'El personaje obtiene una bonificación en su modificador de fuerza de +2'),
    (7, 'Furia de Guerrero', 'P', 'El personaje se vuelve inmune al miedo, tanto en combate como fuera de él.'),
    (0, 'Inamovible', 'P', 'El personaje se vuelve completamente resistente a cualquier tipo de desplazamiento forzado, ya sea por ataques físicos, magia o elementos que intenten empujarlo o moverlo de su posición.'),
    (0, 'Maestría en Armas de Dos Manos', 'P', 'El personaje recibe una bonificación de +1 al daño al utilizar Martillos de dos manos, Espadas Largas y Hachas a Dos Manos.'),
    (9, 'Regeneración Indomable', 'P', 'Cuando el personaje pierde más del 50% de su vida, comienza a regenerar 2 puntos de vida por turno, más su modificador de Constitución, hasta que su vitalidad alcance nuevamente el 50% de su salud máxima.'),
    (9, 'Ajuste Perfecto', 'P', 'El personaje obtiene bonificaciones a la Destreza según la armadura que lleve. Cuando usa armadura ligera, recibe un aumento de +3 al modificador de Destreza; con armadura media, un +2 al modificador de Destreza; y con armadura pesada, un +1 al modificador de Destreza.'),
    (10, 'Armas de Dos Manos en Cada Mano', 'P', 'El personaje puede atacar con ambas armas simultáneamente en un solo ataque y es capaz de portar armas de dos manos en una sola mano.'),
    (12, 'Inmunidad a hechizos de Frío y Hielo', 'P', 'El personaje no puede recibir daño por hechizos de frío o hielo.'),
    (12, 'Ira de la Tormenta', 'P', 'El personaje es capaz de ver claramente en un radio de 5 casillas durante tormentas de nieve. Además, su modificador de destreza aumenta en +1 y su daño se incrementa en +3, mientras se encuentre en estas condiciones.'),
    (12, 'Corazón de Hielo', 'P', 'El personaje tiene un control emocional excepcional, lo que le permite resistir efectos de miedo, seducción o encanto. Obtiene un +4 a la tirada para resistir estos efectos.'),
    (15, 'Ferocidad', 'P', 'El daño del personaje aumenta +3 con cada arma que utilice simultáneamente'),
    (15, 'Endurecimiento de las montañas', 'P', 'Por cada 10 puntos de vitalidad perdidos, el cuerpo del personaje se endurece, otorgándole 5 puntos de vitalidad provisional.'),
    (17, 'Ayuda de Valkiria', 'A', 'El personaje invoca la ayuda divina de una valkiria, restaurando toda su vitalidad y otorgándole alas que le permiten volar. Esta habilidad solo puede usarse una vez por combate.'),
    (17, 'Dureza Nevada', 'P', 'El modificador de constitución del personaje aumenta en +1 y el modificador de fuerza aumenta en +3'),
    (17, 'Guía Invernal', 'A', 'El personaje tiene la habilidad de encontrar refugio seguro en entornos nevados o durante tormentas de nieve.'),
    (19, 'Atrocidad', 'P', 'El modificador de fuerza del personaje aumenta +4.'),
    (19, 'Gracia del Amarok Ártico', 'A', 'Aumenta el movimiento del personaje en +3 y le permite dar un pequeño salto durante los ataques, extendiendo su rango de alcance en +1. Además, el personaje puede realizar un ataque adicional por turno durante los próximos 5 turnos. Después de este período, el personaje quedará fatigado.'),
    (20, 'Bendición de los Dioses', 'A', 'El personaje tira un dado de 6 caras para recibir una habilidad especial otorgada por uno de los dioses durante un día completo. El resultado del dado determina la habilidad obtenida, que será una de las siguientes:) 1-Odín +5 en Inteligencia +20 de vitalidad Inmunidad a la magia arcana Acceso a hechizos básicos de mago. 2-Thor +5 en Fuerza +20 de vitalidad Inmune al rayo Aura de rayos de 2 casillas que electrifica a los enemigos causando 1d6 de daño pasivo y con posibilidad de paralizar a los enemigos que hayan recibido el daño. 3-Tyr +5 en Destreza +20 de vitalidad 2 a la CA Maestría con todas las armas, manteniendo todas las bonificaciones correspondientes. 4-Loki +5 en Carisma +20 de vitalidad Engaño siempre efectivo Control sobre la probabilidad (tira dos dados de 20 en interacciones de carisma y se queda con la tirada más alta). 5-Freyja +5 en Constitución +50 de vitalidad regenera 2 puntos de vida más la bonificación de Constitución al final de cada turno No pierde la consciencia al llegar a 0 de vitalidad. 6-Mimir +5 en Sabiduría +20 de vitalidad Conoce y explota las debilidades del enemigo (ignora la Constitución del enemigo) Predice el próximo ataque de los enemigos.')
  ) AS a(level, name, action, description)
WHERE c.name = 'Guerrero Nórdico';

-- Guerrero Rúnico
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Guerrero Rúnico', 'Cualquiera', 4, 'Ligera / Media / Pesada',
  'Puede usar todas las armas excepto las armas pesadas a distancia Puede usar todos los escudos, Exceptuando el Scutun.',
  '12 Destreza, 12 Fuerza, 12 Inteligencia', 'Tatuajes',
  ARRAY['Elfo', 'Felino', 'Humano', 'Jotun', 'Renegado', 'Semielfo', 'Semiorco']::text[],
  3, 5, 4, 1, 2,
  '{"Destreza":12,"Fuerza":12,"Inteligencia":12}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Guerrero Rúnico');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Guerrero Rúnico');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,2000),(3,4000),(4,8000),(5,16000),(6,32000),(7,65000),(8,120000),(9,240000),(10,360000),(11,480000),(12,600000),(13,720000),(14,940000),(15,1000000),(16,1200000),(17,1300000),(18,1500000),(19,1700000),(20,2000000)) AS x(level, xp)
WHERE c.name = 'Guerrero Rúnico';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Guerrero Rúnico');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Resistencia a las Temperaturas', 'P', 'El personaje obtiene una bonificación de +2 en las tiradas de salvación relacionadas con temperaturas extremas'),
    (0, 'Honra del Guerrero', 'P', 'El personaje aumenta el modificador de fuerza en +1'),
    (0, 'Penalización contra el Elemento Contrario', 'P', 'El personaje es más vulnerable al elemento opuesto al que esté usando, lo que le otorga un penalizador de +1 al daño recibido cuando es atacado por dicho elemento.'),
    (0, 'Versátil', 'P', 'El personaje puede usar cualquier tipo de armadura y arma con eficacia, incluyendo aquellas que estén encantadas, malditas o hechizadas, sin sufrir penalizaciones.'),
    (0, 'Infravisión', 'P', 'El personaje puede ver en la oscuridad y en condiciones de poca luz, aumentando su rango de visión en 3 casillas adicionales.'),
    (1, 'Escudo Arcano', 'A', 'El personaje invoca un escudo mágico que bloquea un único ataque mágico o desactiva una trampa mágica'),
    (1, 'Explotar debilidad', 'P', 'el personaje ignora la constitución del enemigo'),
    (1, 'Hechizar Arma', 'A', 'Hielo) (El personaje imbuye su arma con el poder del hielo, agregando su bonificación de Inteligencia al daño base del arma en cada ataque. Los enemigos golpeados también pueden sufrir efectos de congelación, ralentizando sus movimientos.'),
    (2, 'Crear Lluvia', 'A', 'El personaje puede invocar una lluvia mágica que afecta el área a su alrededor.'),
    (2, 'Hechizar Arma', 'A', 'Magia Arcana) (El personaje imbuye su arma con poder arcano puro, agregando su bonificación de Inteligencia al daño base del arma en cada ataque. Este hechizo potencia tanto el ataque físico como la capacidad de penetrar armaduras sagradas, haciéndolo más efectivo contra enemigos con este tipo de protección.'),
    (3, 'Ráfaga de Viento', 'A', 'El personaje lanza un ataque de golpe de aire que empuja a un objetivo a una distancia de 1d4 más su modificador de Inteligencia.'),
    (3, 'Crear escudo', 'A', 'el personaje materializa un escudo mágico para sí mismo, que bloquea un ataque físico'),
    (3, 'Hechizar Arma', 'A', 'Luz) (El personaje imbuye su arma con luz. Esta luz ilumina el terreno a su alrededor, disipando la oscuridad y revelando enemigos ocultos o trampas en el área.'),
    (4, 'Escudo de Piedra', 'A', 'El personaje conjura un sólido escudo de piedra que refuerza la defensa. Este escudo aumenta la Clase de Armadura en -1, ya sea para el propio personaje o para un aliado'),
    (4, 'Abrir Aguas', 'A', 'El personaje puede dividir o apartar las aguas en su entorno, creando un camino transitable o despejando áreas inundadas.'),
    (4, 'Ruta Helada Despejada', 'A', 'El personaje utiliza su magia para eliminar el hielo y la nieve de un área determinada, creando un camino seguro y despejado'),
    (5, 'Hechizar Armas', 'A', 'Fuego) (El personaje imbuye su arma con fuego elemental, agregando su bonificación de Inteligencia al daño base del arma en cada ataque. Además, el arma inflige una quemadura adicional que causa 1 punto de daño pasivo adicional a los enemigos golpeados.'),
    (5, 'Derretir', 'A', 'El personaje usa la palma de sus manos para derretir cualquier objeto, arma o armadura que no esté encantada ni maldita'),
    (6, 'Terremoto', 'A', 'El personaje convoca una intensa sacudida que agita el suelo, generando grietas y fisuras en el terreno circundante. Este temblor altera el campo de batalla, creando zonas inestables que dificultan el movimiento y la estabilidad de todos los que se encuentren en el área afectada.'),
    (6, 'Crear Munición Elemental', 'A', 'El personaje puede conjurar flechas o virotes hechos de un elemento específico (fuego, hielo, metal o rayo). Cada tipo de munición elemental proporciona efectos adicionales en combate: Fuego: Inflige daño de quemadura adicional (1 punto de daño pasivo). Hielo: Reduce la movilidad del objetivo, aplicando penalización a sus movimientos de -3 al movimiento. Metal: Aumenta la penetración de armaduras, ignorando 1 punto el CA del enemigo. Rayo: Tiene la posibilidad de paralizar al objetivo o desorientarlo momentáneamente. El daño de cada tipo de munición elemental es igual al daño base del arma más el modificador de Inteligencia del personaje.'),
    (7, 'Congelar', 'A', 'El personaje puede lanzar un rayo de hielo a través de su arma, congelando a un objetivo e inmovilizándolo por completo.'),
    (8, 'Leer Magia', 'P', 'el personaje puede leer las magias arcanas, elementales, sagradas o demoníacas para saber su utilidad y como desactivarlas'),
    (8, 'Hechizar Arma', 'A', 'Oscuridad) (El personaje imbuye su arma con magia de oscuridad, agregando su bonificación de Inteligencia al daño base del arma en cada ataque. Cuando acierta un golpe, la oscuridad emanada reduce la visibilidad del enemigo en a 1'),
    (9, 'Hechizar Armas', 'A', 'Rayo) (El personaje imbuye su arma con energía eléctrica, añadiendo su bonificación de Inteligencia al daño base del arma en cada ataque. Además, cada golpe exitoso tiene una probabilidad de paralizar al objetivo, dejándolo inmovilizado temporalmente y vulnerable a ataques adicionales.'),
    (9, 'Petrificación elemental', 'A', 'El personaje puede tocar a un objetivo con sus manos, transformándolo en piedra si el objetivo tiene un nivel igual o inferior al del personaje.'),
    (10, 'Eliminar Preparación', 'P', 'La habilidad de imbuir un arma con magia se convierte en una acción pasiva, permitiendo que el personaje aplique encantamientos sin necesidad de realizar una acción activa para ello.'),
    (10, 'Resistencia absoluta a las temperaturas', 'P', 'Al personaje no le afecta los climas ni las temperaturas extremas'),
    (11, 'Absorción de Fuerza Elemental', 'P', 'El personaje puede absorber el elemento de un ataque elemental, ya sea a distancia o cuerpo a cuerpo, así como trampas u objetos encantados con magia elemental'),
    (11, 'Hechizar Arma', 'A', 'Sagrada) (El personaje imbuye su arma con magia divina, agregando su bonificación de inteligencia al daño base del arma en cada ataque. Este hechizo potencia tanto el ataque físico como la capacidad de penetrar armaduras infernales, haciéndolo más efectivo contra enemigos con este tipo de protección.'),
    (11, 'Repeler Magia a Distancia', 'P', 'El personaje tiene la habilidad de redirigir un ataque mágico dirigido hacia él. Para utilizar esta habilidad, debe realizar una tirada de 1d20 y superar la tirada del ataque del contrincante. Si tiene éxito, el ataque mágico es desviado de su objetivo original y se dirige de vuelta hacia el lanzador.'),
    (12, 'Hechizar Arma', 'P', 'Nigromancia) El personaje imbuye su arma con un hechizo que permite absorber la vida de sus enemigos. Cada vez que el personaje inflige daño con esta arma, el daño base del arma más la bonificación de Inteligencia es convertido en una absorción de vitalidad, curando al portador una cantidad equivalente al daño infligido.'),
    (12, 'Tormenta', 'A', 'El personaje convoca una tormenta mágica que afecta a todos los personajes dentro de su alcance. La tormenta inflige daño de 1d6 más el modificador de Inteligencia y tiene la capacidad de desplazar a los enemigos tanto como daño realizado.'),
    (13, 'Disparo Preciso', 'P', 'El personaje aumenta la destreza en ataques a distancia en +2'),
    (13, 'Trampa Mágica', 'A', 'El personaje puede crear trampas de una casilla que inmoviliza al primer enemigo que la active y le causa daño arcano cada turno, igual al modificador de Inteligencia.'),
    (13, 'Hechizar Arma', 'P', 'Viento) (El personaje imbuye su arma con magia elemental del viento, agregando su bonificación de Inteligencia al daño base del arma en cada ataque. Además, el impacto de cada golpe empuja al enemigo el daño del arma base, más el modificador de inteligencia.'),
    (14, 'ataque preciso', 'P', 'El personaje aumenta la destreza en ataques cuerpo a cuerpo en +2'),
    (14, 'Descifrar Runas', 'P', 'El personaje puede interpretar runas, permitiéndole leer y comprender su significado.'),
    (14, 'Hechizar Arma', 'P', 'Magma) (El personaje imbuye su arma con magia elemental de magma, sumando su bonificación de Inteligencia al daño base del arma en cada ataque. Además, el arma inflige una quemadura adicional que causa daño pasivo de 1d6. Existe una probabilidad de que el magma funde o degrade armas y armaduras convencionales que entren en contacto con ella'),
    (15, 'Detectar Magia', 'P', 'el personaje puede detectar si un objeto o lugar contiene magia.'),
    (15, 'Hechizar Arma', 'A', 'Magia Infernal) (El personaje imbuye su arma con fuego infernal, añadiendo su bonificación de Inteligencia al daño base del arma en cada ataque. Este hechizo potencia tanto el ataque físico como la capacidad de penetrar armaduras encantas con magia arcana, haciéndolo más efectivo contra enemigos con este tipo de protección.'),
    (16, 'Huracán', 'A', 'El personaje desata un huracán devastador que arrastra a todos los enemigos fuera del área de combate. Este poderoso fenómeno meteorológico no solo desplaza a los enemigos, sino que también los obliga a abandonar el terreno de combate, facilitando así la huida o la reorganización del equipo.'),
    (16, 'Tormenta Incendiaria', 'A', 'El personaje invoca una tormenta de intensa lluvia de fuego y viento asfixiante que cubre un área de 9 casillas. Todos los personajes dentro de esta área sufren un daño de 3 puntos de daño, más la bonificación de Inteligencia del personaje en cada turno que permanezcan en el área de la tormenta.'),
    (17, 'Hechizar Arma', 'A', 'Multi-Hechizo) (El personaje puede aplicar dos encantamientos diferentes a un arma simultáneamente. Cada encantamiento se integra en el arma, añadiendo múltiples efectos mágicos en cada ataque. Además, se acumula la bonificación de Inteligencia, incrementando la eficacia de cada encantamiento aplicado.'),
    (18, 'Invocar Armas', 'A', 'Cuando el personaje se encuentra desarmado, puede conjurar armas mágicas de energía elemental. Estas armas tienen un daño base de 1d10 y están imbuidas con un elemento específico (fuego, hielo, rayo o roca'),
    (18, 'Control sobre la Magia Rival', 'A', 'El personaje puede identificar un hechizo de nivel inferior a 18 que haya sido lanzado por un oponente. Tras identificarlo, puede usar ese hechizo contra el rival solo durante el mismo combate.'),
    (19, 'Comunicarse con los Titanes Elementales', 'A', 'El personaje puede establecer una conexión mental con cualquier titán elemental fuera del plano elemental, permitiéndole comunicarse con estos seres sin sufrir daños permanentes o efectos adversos.'),
    (19, 'Hechizar Arma', 'A', 'Ráfaga de Hechizos) (El personaje puede aplicar hasta tres encantamientos diferentes a un arma simultáneamente. Cada encantamiento se integra en el arma, añadiendo múltiples efectos mágicos en cada ataque. Además, se acumula la bonificación de Inteligencia'),
    (20, 'Liberar Fuerza Rúnica', 'A', 'El personaje desata toda su energía mágica para imbuir simultáneamente todas las armas con cada hechizo de imbuir arma disponible. El personaje no puede aplicar estos encantamientos a las armas de sus aliados. Las bonificaciones de Inteligencia se acumulan, potenciando aún más el poder de las armas encantadas.')
  ) AS a(level, name, action, description)
WHERE c.name = 'Guerrero Rúnico';

-- Guerrero
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Guerrero', 'Cualquiera', 2, 'Ligera / Media / Pesada',
  'No puede usar dagas o armas de puño. Puede usar todos los escudos.',
  NULL, 'Ninguno',
  ARRAY['Aviroide', 'Enano', 'Felino', 'Humano', 'Jotun', 'Orco', 'Renegado', 'Reptiliano', 'Semielfo', 'Semiorco', 'Troloide']::text[],
  5, 3, 5, 5, 3,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Guerrero');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Guerrero');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,2000),(3,4000),(4,8000),(5,16000),(6,32000),(7,65000),(8,120000),(9,240000),(10,450000),(11,600000),(12,800000),(13,1000000),(14,1250000),(15,1500000),(16,1750000),(17,2000000),(18,2100000),(19,2200000),(20,2250000)) AS x(level, xp)
WHERE c.name = 'Guerrero';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Guerrero');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Resistencia a las Temperaturas', 'P', 'El personaje obtiene una bonificación de +2 en las tiradas de salvación relacionadas con temperaturas extremas'),
    (0, 'Honra del Guerrero', 'P', 'El personaje aumenta el modificador de fuerza en +1'),
    (0, 'Aliento de Guerrero', 'A', 'el personaje golpea su escudo para llamar la atención de los enemigos dentro de tres casillas de rango'),
    (0, 'Brazos de Guerrero', 'P', 'El personaje obtiene una bonificación temporal de +1 al daño después de derrotar a un enemigo. Esta bonificación es acumulable durante la misma batalla, después del combate se disipa este aumento'),
    (3, 'Corazón de Guerrero', 'P', 'El personaje incrementa su daño en +2 (en lugar de +1) después de matar a un enemigo. Esta bonificación temporal es acumulable durante toda la batalla, después del combate se disipa este aumento'),
    (3, 'Gran resistencia al Veneno', 'P', 'El personaje obtiene una bonificación de +5 en las tiradas de salvación contra venenos'),
    (3, 'Versatilidad del Guerrero', 'P', 'El personaje puede usar todas las armas sin sufrir penalización. Si el guerrero se encuentra desarmado, obtiene una bonificación de +1 al daño con ataques sin armas.'),
    (5, 'Crecimiento del guerrero', 'P', 'aumenta el modificador de la constitución del personaje en +1 y la destreza en +1 solo para atacar con armas de dos manos'),
    (5, 'Adaptación de Guerrero', 'P', 'El personaje se adapta según el tipo de arma que utilice. Cuando usa un arma a distancia, su modificador de Fuerza aumenta en +2; si porta un arma de dos manos, su modificador de Destreza aumenta en +2; y al usar armas de una mano, su modificador de Constitución se incrementa en +2.'),
    (6, 'Grito de Batalla', 'A', 'El personaje lanza un poderoso grito de guerra que inspira a sus aliados. Todos los compañeros en un radio de 3 casillas ganan un bonificador de +2 a la Fuerza y +3 a la Iniciativa durante el combate.'),
    (6, 'Plasticidad en Combate', 'P', 'Cuando un enemigo está trabado en combate contra el personaje, la tirada del contrincante para destrabarse se reduce en -2, mientras que la tirada del personaje para destrabarse se aumenta en +2 a la tirada.'),
    (6, 'Carga', 'P', 'El personaje puede atacar al finalizar el movimiento'),
    (9, 'Romper escudo', 'A', 'el personaje realiza un ataque que se centra en destroza el escudo convencional del rival'),
    (10, 'Cuerpo Fortalecido', 'P', 'El personaje reduce -2 el daño físico recibido'),
    (10, 'Dominador', 'P', 'Cuando un enemigo está trabado en combate contra el personaje, la tirada del contrincante para destrabarse se reduce en -5, mientras que la tirada del personaje para destrabarse se aumenta en +5 a la tirada. Esta habilidad es compatible con Plasticidad en Combate'),
    (10, 'Experiencia del Guerrero', 'P', 'Si el personaje posee algún modificador en negativo, este se ajusta a 0, no aplicando penalizaciones de ningún tipo de característica.'),
    (13, 'Cuerpo Único', 'P', 'El personaje reduce -2 el daño recibido de hechizos arcanos, elementales o sagrados'),
    (13, 'Alma de Guerrero', 'P', 'El personaje incrementa su daño en +3 (en lugar de +2) después de matar a un enemigo. Esta bonificación temporal es acumulable durante toda la batalla, después del combate se disipa este aumento.'),
    (13, 'Romper arma', 'A', 'el personaje realiza un ataque que se centra en destroza el arma convencional del rival'),
    (15, 'Resistencia Sobrehumanoide', 'P', 'El personaje debe sobrepasar el -10 de vida para poder morir'),
    (15, 'Experiencia del Guerrero', 'A', 'El personaje puede usar un escudo incluso cuando lleva un arma de dos manos equipada.'),
    (16, 'Romper armadura', 'A', 'el personaje realiza un ataque que se centra en destroza la armadura convencional del rival'),
    (16, 'Determinación de Guerrero', 'P', 'El contrincante nunca podrá destrabarse del combate si está peleando cuerpo a cuerpo con el personaje'),
    (16, 'Furia de Guerrero', 'P', 'El personaje se vuelve inmune al miedo, tanto en combate como fuera de él.'),
    (19, 'Honor del Guerrero', 'P', 'El personaje puede interponerse para recibir un golpe letal en lugar de un compañero, siempre y cuando esté dentro de su rango de alcance. Al recibir el daño, el personaje recibe una bonificación temporal de +3 en Constitución.'),
    (20, 'Muda de Piel', 'A', 'El personaje recupera su Clase de Armadura (CA) cuando esta se ve afectada por acciones mágicas o habilidades que la rompan, supriman o eliminen. Esta habilidad solo puede ser contrarrestada por objetivos de niveles superiores al del personaje.'),
    (20, 'Leyenda de Guerrero', 'P', 'El personaje incrementa su daño en +4 (en lugar de +3) después de matar a un enemigo. Esta bonificación temporal es acumulable durante toda la batalla, después del combate se disipa este aumento'),
    (20, 'Gracia de Héroe', 'P', 'El personaje sobrevive a un golpe mortal de un enemigo una vez por combate.')
  ) AS a(level, name, action, description)
WHERE c.name = 'Guerrero';

-- Ingeniero
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Ingeniero', 'Cualquiera', 4, 'Ligera / Media / Pesada',
  'No puede usar armas pesadas. Escudo Ligero: (El personaje está limitado a utilizar únicamente una rodela como escudo)',
  '12 Inteligencia', 'Kit de manitas, Grimorio de inventos “propios”',
  ARRAY['Autómata', 'Aviroide', 'Enano', 'Gnomo', 'Goblin', 'Humano', 'Renegado', 'Semielfo', 'Semiorco']::text[],
  2, 1, 3, 4, 1,
  '{"Inteligencia":12}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Ingeniero');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Ingeniero');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,1000),(3,2000),(4,5000),(5,7000),(6,10000),(7,25000),(8,50000),(9,75000),(10,100000),(11,250000),(12,300000),(13,450000),(14,600000),(15,750000),(16,850000),(17,900000),(18,935000),(19,975000),(20,1000000)) AS x(level, xp)
WHERE c.name = 'Ingeniero';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Ingeniero');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Reparar', 'A', 'El personaje puede reparar cualquier objeto, armadura o arma convencional.'),
    (0, 'Rebuscar Material', 'A', 'El personaje puede desmantelar cualquier objeto en piezas aprovechables. Además, obtiene piezas de ingeniería adicionales al despojar o buscar.'),
    (0, 'Son Mis Inventos', 'P', 'El personaje recibe una bonificación de +1 a la destreza y +2 al daño cuando usa sus propios inventos para atacar.'),
    (0, 'Son Sus Inventos', 'P', 'El personaje recibe una bonificación de +1 al daño cuando usa armas fabricadas por ingenieros ajenos para atacar'),
    (0, 'Fabricación de Munición', 'A', 'El personaje puede fabricar balas de cañón, flechas, shurikens, púas, bolas para hondas, dardos y virotes.'),
    (1, 'Elaboración de Bombas', 'A', 'El personaje puede fabricar bombas explosivas, causando daño de 1d4, 1d6 o 1d8, aumentando el daño en función del bonificador de inteligencia, y dependiendo su tirada en la fabricación de la bomba'),
    (2, 'Elaborar Dinamita', 'A', 'El personaje puede fabricar bombas de dinamita para demolición que causan 1d4, 1d6, 1d8 o 1d10 de daño, aumentando el daño en función del bonificador de Inteligencia y de la tirada realizada durante la fabricación.'),
    (2, 'Joyero', 'A', 'El personaje puede pulir gemas e incorporarlas en armas, anillos, colgantes y armaduras para mejorar sus propiedades.'),
    (3, 'Forja', 'A', 'El personaje puede fabricar cualquier tipo de armas y armaduras solamente pesadas.'),
    (4, 'Elaborar Mina', 'A', 'El personaje puede fabricar minas explosivas diseñadas para usarse como trampas, con un daño de 1d4, 1d6, o 1d8, que aumenta el daño en función del bonificador de Inteligencia, aumentando el daño en función del bonificador de Inteligencia y de la tirada realizada durante la fabricación'),
    (5, 'Fabricación de Armaduras', 'A', 'El personaje puede fabricar cualquier tipo de armadura'),
    (6, 'Estudio de investigación Base', 'P', 'el personaje obtiene una bonificación de +1 al modificador de inteligencia'),
    (7, 'Campo Electromagnético', 'A', 'El personaje fabrica dispositivos que generan un campo de fuerzas intransitables, creando barreras electromagnéticas que impiden el paso a través de ellas sin necesidad de materiales previos, además cada torreta del campo electromagnético se coloca siempre adyacente al personaje, uno por ronda.'),
    (8, 'Elaboración de Bombas de Gran Tamaño', 'A', 'El personaje puede fabricar bombas de gran tamaño con efectos devastadores. Estas bombas pueden causar 2d6, 2d8, o 2d10 de daño, aumentando con el bonificador de inteligencia y de la tirada realizada durante la fabricación'),
    (8, 'Estudio de investigación intermedio', 'P', 'el personaje obtiene una bonificación de +2 al modificador de inteligencia'),
    (9, 'Añadir Mejora a una Pieza de Arma o Armadura', 'A', 'El personaje puede reforjar un arma o una armadura añadiendo nuevas piezas de ingeniería, lo que aumenta su daño o defensa. Esta mejora se puede aplicar solo una vez a cada arma o armadura.'),
    (10, 'Ingeniería Inversa', 'A', 'El personaje puede aprender a fabricar máquinas, objetos de ingeniería, armas o armaduras ya existentes mediante un estudio exhaustivo y desmantelamiento de estos elementos.'),
    (11, 'Pavés de Absorción Protector', 'A', 'El personaje fabrica escudos móviles que absorbe y protege contra ataques mágicos a distancia'),
    (12, 'Forjas de Armas de Asedio', 'A', 'El personaje fabrica armas de asedio, como catapultas, arietes, bombardas, balistas y otros dispositivos de gran escala para el asalto de fortalezas.'),
    (12, 'Estudio de investigación avanzado', 'P', 'el personaje obtiene una bonificación de +3 al modificador de inteligencia'),
    (13, 'Ojo Avizor', 'P', 'El personaje incrementa su alcance con armas a distancia en +3 casillas más.'),
    (14, 'Intuición', 'P', 'El personaje gana un bonificador de +1 al modificador de Destreza.'),
    (15, 'Ingeniería Arcana', 'A', 'El personaje puede fabricar dispositivos y canalizadores que almacenan todo tipo de energía o magias.'),
    (16, 'Baluarte Prismático', 'A', 'El personaje crea un gran escudo que, al clavarse en el suelo, bloquea y absorbe todos los ataques a distancia dirigidos desde el frente, protegiendo a quien está detrás.'),
    (17, 'Constructor/Arquitecto', 'A', 'El personaje puede diseñar y construir edificaciones con alta eficiencia y precisión, incorporando elementos de ingeniería para reforzarlas.'),
    (18, 'Restaurador Antiguo', 'A', 'El personaje puede devolver los elementos antiguos, como reliquias, fósiles, ruinas y objetos, a su estado original.'),
    (18, 'Creación de Armas y Armaduras Potenciadas', 'A', 'El personaje puede fabricar armas y armaduras que son irrompibles'),
    (19, 'Fabricación de Autómatas', 'A', 'El personaje puede fabricar autómatas, requiriendo canalizadores de energía cargada para activarlos.'),
    (20, 'Elaborar Bomba de Destrucción Masiva', 'A', 'El personaje puede fabricar una bomba de gran escala capaz de devastar el campo de batalla o ciudades enteras. La explosión causa 5d20, que aumenta con el bonificador de Inteligencia, afectando a todos los personajes en el área de impacto.')
  ) AS a(level, name, action, description)
WHERE c.name = 'Ingeniero';

-- Invocador
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Invocador', 'Cualquiera', 8, 'Ligera',
  'No puede usar armas pesadas. Sin escudo: (El personaje no puede equipar ningún tipo de escudo)',
  '10 Inteligencia, 10 Sabiduría, 10 Destreza, 10 Constitución', 'Báculo, HABILIDAD ESPECIAL, Las invocaciones poseen un máximo de nivel de 18 (Excepto el Héroe), Las estadísticas de las invocaciones son las misma que la del invocador, Las vidas de las invocaciones son equivalentes a la mitad de la vida del invocador',
  ARRAY['Autómata', 'Elfo', 'Elfo Oscuro', 'Felino', 'Gnomo', 'Goblin', 'Humano', 'Renegado', 'Sátiro', 'Semielfo', 'Semiorco']::text[],
  3, 0, 4, 1, 3,
  '{"Inteligencia":10,"Sabiduría":10,"Destreza":10,"Constitución":10}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Invocador');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Invocador');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,2000),(3,5000),(4,12000),(5,24000),(6,48000),(7,92000),(8,150000),(9,320000),(10,480000),(11,660000),(12,770000),(13,990000),(14,1110000),(15,1250000),(16,1450000),(17,1600000),(18,1750000),(19,1850000),(20,2000000)) AS x(level, xp)
WHERE c.name = 'Invocador';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Invocador');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Invocación: Guerrero', 'A', 'El personaje puede invocar a un guerrero para el enfrentamiento y controlarlo durante el combate'),
    (0, 'Invocación: Clérigo', 'A', 'El personaje puede invocar a un clérigo para el enfrentamiento y controlarlo durante el combate.'),
    (0, 'Invocación: Guardabosques', 'A', 'El personaje puede invocar a un guardabosques para el enfrentamiento y controlarlo durante el combate'),
    (0, 'Invocación: Mago', 'A', 'El personaje puede invocar a un mago para el enfrentamiento y controlarlo durante el combate'),
    (0, 'Destreza del Hechicero', 'P', 'El personaje obtiene una bonificación de +3 a la Destreza para acertar hechizos del personaje'),
    (0, 'Transportador de Nébula', 'P', 'El personaje abre un portal para almacenar objetos en un cuerpo celeste orbitador, donde no hay aire, gravedad, ni presión. Debido a estas condiciones, los objetos almacenados no sufren sobrecarga ni deterioro. (Sólo puede usarse fuera de combate)'),
    (0, 'Cuerpo Frágil', 'P', 'Durante el periodo de invocación, el personaje debe permanecer inmóvil y recibe un aumento de +2 al daño de cualquier tipo de ataque que reciba. Además, pierde automáticamente la concentración si recibe daño, lo que provoca que la invocación se deshaga de inmediato.'),
    (2, 'Adquisición de Nuevo Sello', 'A', 'Montura) (El personaje puede invocar una montura espectral compatible con cualquier tipo de invocación. El invocador puede mantenerse sobre la montura sin perder la concentración y moverse encima de la montura teniendo un movimiento de 6 casillas.'),
    (2, 'Sanación a la Invocación', 'A', 'El personaje puede sanar a una invocación un 1d6 más el modificador de Sabiduría.'),
    (2, 'Inspirar Equipo', 'A', 'El personaje puede inspirar a todos los compañeros dentro de su rango de alcance, otorgándoles un bonificación de +1 a un modificador de su elección.'),
    (4, 'Adquisición de Nuevo Sello', 'P', 'Falange) (Una vez por combate, el personaje puede usar una acción gratuita, que se usa fuera de su turno, para invocar un muro de contención que bloqueará cualquier tipo de ataque durante una ronda entera'),
    (4, 'Aura de Sanación', 'A', 'El personaje emite un aura de sanación en un radio de 4 casillas que cura 1d6 más el modificador de Sabiduría del personaje a todos los compañeros dentro de su alcance, excluyendo las invocaciones.'),
    (4, 'Visión del Pasado', 'P', 'Al tocar a un individuo, el personaje puede ver fragmentos de su pasado, revelando eventos y recuerdos clave.'),
    (6, 'Trampa Mágica', 'A', 'El personaje puede crear trampas de una casilla que inmoviliza al primer enemigo que la active y le causa daño arcano cada turno, igual al modificador de Inteligencia.'),
    (6, 'Deshacer Trampa Mágica', 'P', 'El personaje puede desactivar trampas mágicas, neutralizando sus efectos y haciendo el área segura.'),
    (6, 'Descifrar Runas', 'P', 'El personaje puede interpretar runas, permitiéndole leer y comprender su significado.'),
    (8, 'Adquisición de Nuevo Sello', 'A', 'Volar) (El personaje puede volar libremente por el aire, ganando la capacidad de moverse sin restricciones por este medio. Sin embargo, esta habilidad no es compatible con el sello de montura. Mientras vuela, el personaje cuenta únicamente con su movimiento base y movimiento de combate'),
    (8, 'Flujo del Tiempo', 'A', 'Una vez por combate el personaje puede manipular las corrientes del tiempo para revertir su estado físico al inicio del turno anterior, recuperando su vida, las condiciones y la ubicación que estaban en ese momento.'),
    (8, 'Cronólogo', 'A', 'El personaje puede aumentar el nivel de un objetivo en 1 durante 3 turnos, mejorando temporalmente sus habilidades, vitalidad y capacidades, Esta habilidad no podrá usarse nuevamente en el mismo objetivo mientras este tenga la habilidad activa, tampoco podrá ser usada hacia otro objetivo mientras este activa en otro jugador.'),
    (10, 'Adquisición de Nuevo Sello', 'A', 'Doble Invocación) (El personaje puede invocar dos tipos diferentes de invocaciones simultáneamente.'),
    (10, 'Adquisición de Nuevo Sello', 'A', 'Eco de la Ruptura) (El personaje inflige 1d12 mas el modificador de inteligencia de daño temporal a todos los enemigos en su rango. Este daño puede aplicar de inmediato o posponerlo y liberarlo en cualquier momento del combate, incluso fuera de su turno. Este efecto es acumulable.'),
    (10, 'Reversión Temporal', 'A', 'Una vez por combate el personaje puede usar la habilidad Flujo del Tiempo para revertir el estado de aliados e invocaciones'),
    (10, 'Distorsión Temporal', 'A', 'El personaje puede usar Flujo del Tiempo para afectar a enemigos de igual o menor nivel'),
    (10, 'Salto Temporal', 'A', 'El personaje puede teletransportarse instantáneamente a un lugar dentro de su rango de alcance.'),
    (12, 'Adquisición de Nuevo Sello', 'A', 'Héroe Caído) (El personaje invoca a un héroe legendario del pasado, esta invocación no es compatible con otras invocaciones, excepto con el sello de montura. La vida y estadísticas del héroe son iguales a las del personaje.'),
    (12, 'Control sobre el Cuerpo y la Mente', 'P', 'El personaje ya no sufre de los efectos de Cuerpo Frágil y puede mantener la invocación incluso si recibe daño'),
    (12, 'Invocaciones Espectrales', 'P', 'El personaje invoca espectros temporales que protegen a los compañeros de un ataque mortal de manera individual. Esta habilidad se puede usar una vez por combate.'),
    (14, 'Adquisición de Nuevo sello', 'A', 'Cristalizar) (El personaje se congela en un bloque de hielo, manteniendo su cuerpo en un estado sólido mientras conserva el control sobre sus invocaciones. El bloque de hielo tiene la mitad de la vida del invocador y una Clase de Armadura (CA) de 19. Durante este estado, el personaje está inmóvil y no puede actuar directamente, pero sus invocaciones siguen operando bajo su control. Esta habilidad se puede usar una vez por combate.'),
    (14, 'Maldición del Tiempo', 'A', 'Reduce a la mitad el movimiento de un objetivo dentro de su rango de alcance'),
    (14, 'Manipulación del Destino', 'P', 'El personaje puede interrumpir la habilidad de detener el tiempo utilizada por otros, neutralizando su efecto y permitiendo que el flujo temporal vuelva a la normalidad.'),
    (16, 'Adquisición de Nuevo Sello', 'A', 'Estampida) (el personaje invoca una ingente manada de animales temporales que arrasan con todos a su paso en un área de hasta 10 casillas de alcance (incluyendo terreno). Los enemigos en el área sufren 1d20 más el modificador de Inteligencia'),
    (16, 'Invocación del Ente Propio', 'A', 'El personaje fragmenta su espectro en 1D4 visiones espectrales independientes. Cada fragmento actúa y puede invocar por separado, pero solo tiene 1 punto de vida, todos los fragmentos están al nivel 15, está habilidad no es compatible cuando está activa la habilidad clonar'),
    (16, 'Conocimiento Temporal', 'P', 'El modificador de inteligencia del personaje aumenta en +2'),
    (18, 'Detener Tiempo', 'A', 'El personaje detiene el tiempo en el campo de batalla. Primero, tira 1d4 para determinar cuántas rondas los objetivos permanecerán suspendidos en el tiempo. Luego, tira 1d20; los aliados deben superar la tirada del personaje para evitar quedar también detenidos en el tiempo. Si no lo logran, serán afectados por la detención temporal junto con los objetivos. Solo se puede usar una vez por combate'),
    (18, 'Redención Temporal', 'A', 'el personaje puede sanar por completo a una invocación. Esta habilidad solo puede usarse una vez por combate.'),
    (18, 'Líneas del Tiempo', 'A', 'El personaje puede viajar a una línea temporal alternativa que no coincida con su propia línea temporal. Esto le permite explorar o interactuar con eventos y realidades paralelas.'),
    (20, 'Último Sello de Invocación', 'A', 'El personaje puede invocar simultáneamente todas sus invocaciones disponibles, además de un Lidarnis bajo su control, el cual posee sus propias estadísticas personales.')
  ) AS a(level, name, action, description)
WHERE c.name = 'Invocador';

-- Jinete Luxo
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Jinete Luxo', 'Cualquiera', 3, 'Ligera / Media / Pesada',
  'No puede usar dagas ni armas a distancia. Puede usar todos los escudos.',
  '12 Destreza, 10 Carisma', 'Montura',
  ARRAY['Enano', 'Humano', 'Semielfo', 'Semiorco', 'Troloide']::text[],
  9, 8, 9, 8, 9,
  '{"Destreza":12,"Carisma":10}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Jinete Luxo');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Jinete Luxo');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,3000),(3,6000),(4,12000),(5,24000),(6,48000),(7,96000),(8,192000),(9,384000),(10,768000),(11,1000000),(12,1050000),(13,1200000),(14,1400000),(15,1500000),(16,1700000),(17,1800000),(18,1900000),(19,1950000),(20,2000000)) AS x(level, xp)
WHERE c.name = 'Jinete Luxo';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Jinete Luxo');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Equitación luxa', 'P', 'Cuando el personaje se encuentra montado, su movimiento base aumenta en +3 y su movimiento en combate se incrementa en +6, además de la movilidad correspondiente a su clase. Además la montura puede realizar un ataque en el mismo turno del personaje'),
    (0, 'Experto en Combates con Armas de Asta', 'P', 'El personaje obtiene una bonificación en el modificador de +1 a la Destreza y +1 a la Fuerza cuando combate con lanzas, picas, alabardas o cualquier tipo de arma de asta'),
    (0, 'Disciplina del Caballero', 'P', 'El personaje duplica el modificador de sabiduría en tiradas de salvación.'),
    (0, 'Dependencia Ecuestre', 'P', 'El personaje sufre un penalizador de -2 a todas las tiradas de combate cuerpo a cuerpo cuando lucha sin estar montado. Además, pierde la mitad de su velocidad de movimiento'),
    (0, 'Bravo Jinete', 'P', 'Cuando realiza un ataque sobre su montura y el personaje aun le quede movimiento, una vez realizado el ataque puedes destrabarte del combate y gastar el resto del movimiento'),
    (0, 'Estrategia', 'P', 'El personaje organiza planes siempre antes de los combates de manera efectiva, aumentando la coordinación del equipo. Esto le permite transportar a todos sus aliados a cualquier punto del campo de batalla donde lo desee'),
    (0, 'Establos', 'P', 'El personaje puede almacenar monturas de todo tipo, y el coste económico por su mantenimiento y alimentación se reduce a la mitad'),
    (0, 'Carga', 'P', 'El personaje puede atacar al finalizar el movimiento'),
    (1, 'Desenganche Ecuestre', 'P', 'El personaje puede destrabarse automáticamente de estar trabado en combate sin necesidad de realizar una tirada. Sin embargo, esta habilidad solo puede utilizarse si el personaje está montado.'),
    (2, 'Carismáticos', 'P', 'Aumenta el modificador de Carisma del personaje en +1'),
    (2, 'Domar Monturas', 'P', 'Comunes) (El personaje tiene la habilidad para domar y entrenar monturas comunes con facilidad, estableciendo una conexión rápida y efectiva con ellas.'),
    (2, 'Vanguardista', 'P', 'El personaje puede utilizar simultáneamente un arma de asta mientras porta un escudo.'),
    (4, 'Habilidad de Defensa Montada', 'P', 'Aumenta la Clase de Armadura (CA) del personaje en -1 mientras esté en montura'),
    (4, 'Zoología', 'P', 'El personaje posee conocimientos detallados sobre las características y hábitat de los animales comunes, lo que le permite entender y anticipar su comportamiento'),
    (4, 'Embestida', 'A', 'El personaje realiza un ataque cuerpo a cuerpo en línea recta, afectando a todos los enemigos que se encuentren dentro de su trayectoria de movimiento.'),
    (7, 'Liderazgo', 'A', 'El personaje inspira a sus compañeros, otorgando una bonificación de +2 a las tiradas de iniciativa y +1 a las tiradas de salvación para todos los aliados dentro de su rango de alcance'),
    (7, 'Vínculo Especial con la Montura', 'P', 'Si la montura percibe que su jinete está en peligro, acudirá automáticamente en su ayuda, apareciendo para asistirle en la situación'),
    (7, 'Experto en Combate Cuerpo a Cuerpo', 'P', 'El personaje aumenta en +1 tanto el bonificador de destreza como el daño en combates cuerpo a cuerpo'),
    (7, 'Sanación a su Montura', 'A', 'El personaje puede aplicar una sanción a su montura, restaurando 1d20 más el modificador de Sabiduría en puntos de vida de la montura'),
    (10, 'Vista de Lince', 'P', 'El personaje aumenta su alcance de visión en +1 casilla'),
    (10, 'Domar Monturas Especiales', 'P', 'El personaje tiene la habilidad para domar y entrenar monturas poco comunes, estableciendo una conexión efectiva incluso con criaturas más difíciles de controlar.'),
    (10, 'Entrenador de Monturas', 'P', 'El personaje tiene la habilidad para entrenar a sus monturas, aumentando la Constitución de la montura en +2 y su Clase de Armadura (CA) en -1.'),
    (10, 'Comando de Montura', 'P', 'El personaje puede llevar consigo dos monturas. Una de ellas siempre está en la retaguardia y puede acudir de manera inmediata en caso de necesidad, asegurando que el caballero jinete tenga una montura de respaldo lista para cualquier situación.'),
    (10, 'Giro Ágil', 'P', 'El personaje puede usar la habilidad de Embestida sin necesidad de realizarla en línea recta. Puede moverse con fluidez en cualquier dirección durante su movimiento, permitiéndole atacar a enemigos en su trayectoria de forma más versátil.'),
    (10, 'Ataque de Montura', 'P', 'Ahora la montura del personaje puede realizar un ataque adicional en el mismo turno que el personaje'),
    (10, 'Zoología Avanzada', 'P', 'El personaje posee conocimientos detallados sobre las características y hábitat de los animales poco comunes, lo que le permite entender y anticipar su comportamiento'),
    (10, 'Curación y Remedición de Heridas', 'A', 'El personaje puede curar todas las heridas provocadas a su montura, pero no podrá repetir esta habilidad hasta pasados 5 turnos.'),
    (10, 'Reducción de la Dependencia Ecuestre', 'P', 'El personaje sufre un penalizador de -1 a todas las tiradas de combate cuerpo a cuerpo cuando lucha sin estar montado, en vez de -2'),
    (10, 'Fuerza de Impacto Ecuestre', 'P', 'Las monturas del personaje aumentan su daño en +2'),
    (10, 'Aceleración Ecuestre', 'P', 'La montura del personaje aumenta su movimiento en +2 casillas'),
    (10, 'Amo de los Establos', 'P', 'El coste de mantenimiento de las monturas y el coste del alimento para las monturas es completamente gratuito.'),
    (11, 'Transporte', 'P', 'El personaje puede llevar consigo tantas monturas como compañeros necesiten y, si es necesario, estas monturas pueden tirar de grandes carruajes, carromatos, carros u otros sistemas de transporte. Esta habilidad solo puede usarse fuera de combate.'),
    (12, 'Cabalgata Luxa', 'P', 'El personaje puede enseñar equitación a sus aliados. Si un compañero monta una montura que pertenezca al personaje, este puede hacer que la montura realice un ataque adicional durante el turno del compañero, estas monturas no pueden superar la categoría poco común.'),
    (12, 'Liderato', 'A', 'El personaje puede tener un aprendiz o escudero que se encargue de las funciones triviales y le asista en los combates'),
    (12, 'Análisis del Terreno', 'P', 'El personaje identifica debilidades, trampas ocultas, minas y objetos del enemigo en el campo de batalla, proporcionando información crucial sobre el entorno y los peligros potenciales.'),
    (14, 'Criar Monturas Míticas', 'P', 'El personaje puede cuidar y adiestrar desde su nacimiento a bestias de categoría épica o mítica, preparándolas para ser domesticadas y utilizadas como monturas únicas, esta montura no se puede ceder a un compañero para que sea montable'),
    (14, 'Zoología Suprema', 'P', 'El personaje posee un conocimiento profundo sobre las características y el hábitat de animales míticos o épicos'),
    (14, 'Carga Imparable', 'P', 'Cuando el personaje realiza una embestida contra un enemigo, puede desplazarlo o derribarlo, con una posibilidad de incapacitar al enemigo durante 1 turno. El enemigo debe realizar una tirada de salvación para evitar ser incapacitado.'),
    (17, 'Señor del Cielo', 'P', 'El personaje mejora significativamente su combate aéreo, aumentando su modificador de Destreza en +2 y su modificador de Fuerza en +3 mientras esté en combate aéreo.'),
    (17, 'Resistencia al frío', 'P', 'El personaje tiene una resistencia al frío y a climas extremadamente bajos de +2'),
    (17, 'Vínculo de Hierro', 'P', 'Cuando el personaje o la montura usen armadura pesada, al recibir daño pueden lanzar un dado de 1d20. Si la tirada es superior al ataque recibido (sin incluir bonificaciones), el daño se reduce a la mitad.'),
    (17, 'Fortaleza del Jinete', 'P', 'Aumenta el modificador de constitución del personaje en +1 y el modificador de constitución de la montura en +5.'),
    (20, 'General', 'P', 'El personaje se integra en las grandes esferas de la aristocracia, burguesía y como miembro del consejo. Tiene el derecho a presentar propuestas y votar en el parlamento. Además, su modificador de Carisma aumenta en +3.'),
    (20, 'Zoólogo', 'P', 'El personaje posee un conocimiento profundo sobre las características y el hábitat de animales de categoría 4'),
    (20, 'Vinculo de Acero', 'P', 'Cuando el personaje o la montura usen armadura pesada, al recibir daño pueden lanzar un dado de 1D20. Si la tirada es superior al ataque recibido (sin incluir bonificación), el daño se reduce un 75%'),
    (20, 'Criar Montura Legendarias', 'P', 'El personaje puede cuidar y adiestrar desde su nacimiento a bestias de categoría legendaria, preparándolas para ser domésticas y utilizadas como monturas únicas, esta montura no se puede ceder a un compañero para que sea montable')
  ) AS a(level, name, action, description)
WHERE c.name = 'Jinete Luxo';

-- Ladrón
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Ladrón', 'Caótico, neutral/caótico, neutral, neutral/legal', 1, 'Ligera',
  'No puede usar armas pesadas. Escudo Ligero (El personaje está limitado a utilizar únicamente una rodela como escudo)',
  '12 Destreza', 'Juego de ganzúas, Juego de escalada, Cualquier tipo de Daga',
  ARRAY['Autómata', 'Elfo', 'Elfo Oscuro', 'Enano', 'Felino', 'Gnomo', 'Goblin', 'Humano', 'Nahiaride', 'Renegado', 'Reptiliano', 'Sátiro', 'Semielfo', 'Semiorco']::text[],
  4, 3, 5, 2, 2,
  '{"Destreza":12}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Ladrón');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Ladrón');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,1200),(3,2000),(4,5000),(5,10000),(6,20000),(7,40000),(8,80000),(9,160000),(10,280000),(11,400000),(12,520000),(13,640000),(14,760000),(15,880000),(16,1000000),(17,1100000),(18,1250000),(19,1350000),(20,1500000)) AS x(level, xp)
WHERE c.name = 'Ladrón';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Ladrón');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Abrir Cerraduras', 'P', 'El personaje obtiene una bonificación de +5 a las tiradas para abrir cerraduras.'),
    (0, 'Encontrar y Desactivar Trampas', 'P', 'El personaje recibe un bonificación de +4 a las tiradas para encontrar y desactivar trampas.'),
    (0, 'Hurto', 'P', 'El personaje recibe una bonificación de +3 en las tiradas de destreza para realizar actos de robo'),
    (0, 'Sigilo', 'A', 'El personaje puede desplazarse entre las sombras sin ser detectado'),
    (0, 'Escalar', 'P', 'Permite subir y descender superficies verticales con agilidad, facilitando el acceso a lugares elevados o difíciles de alcanzar, sin necesidad de accesorios'),
    (0, 'Esconderse en las Sombras', 'P', 'El personaje puede esfumar en mitad de un combate para evadirlo, obteniendo una bonificación de +5 a la tirada de destrabe. Luego, puede entrar en sigilo para evitar ser detectado.'),
    (0, 'Saltar y Trepar', 'A', 'el personaje puede saltar y trepar tanto por los árboles, muros, murallas, y otros obstáculos, superándolos con facilidad.'),
    (0, 'Escuchar Ruidos', 'P', 'Aumenta la Percepción en +2, mejorando la capacidad del personaje para detectar y distinguir sonidos sutiles en su entorno.'),
    (0, 'Infravisión', 'P', 'El personaje puede ver en la oscuridad y en condiciones de poca luz, aumentando su rango de visión en 3 casillas adicionales.'),
    (0, 'Obligación', 'P', 'El personaje debe ceder un 10% de todos sus beneficios al gremio al que pertenece.'),
    (3, 'Acrobacia', 'P', 'El personaje obtiene una bonificación de +2 en el modificador de destreza específicamente para esquivar ataques.'),
    (3, 'Negociador', 'P', 'El personaje obtiene un descuento del 15% en sus compras.'),
    (3, 'Robo con Sutileza', 'P', 'El personaje recibe una bonificación de +6 a las tiradas para realizar robos de manera discreta'),
    (3, 'Sueño Ligero', 'P', 'El personaje tiene un sueño muy ligero, lo que le otorga un bonificador de +3 a las tiradas de percepción durante el descanso y le permite detectar amenazas inminentes con mayor eficacia.'),
    (3, 'Ataques Sorpresa', 'P', 'Las tiradas de combate realizadas mientras el personaje está en sigilo reciben una bonificación de al modificador de destreza +4'),
    (5, 'Precisión', 'P', 'El personaje, en una tirada de ataque en combate, considera un resultado natural de 19 como un golpe crítico.'),
    (5, 'Leer lenguas', 'P', 'el personaje puede leer todas las lenguas, tanto vivas como muertas o demoníacas'),
    (5, 'Conocimiento de Venenos', 'P', 'El personaje tiene la habilidad de identificar, preparar y neutralizar venenos'),
    (5, 'Encontrar y Desactivar Trampas Mágicas', 'A', 'El personaje recibe una bonificación de +4 en las tiradas para encontrar y desactivar trampas mágicas,'),
    (5, 'Eficiencia Sigilosa', 'P', 'Las tiradas de acciones no relacionadas con el combate realizadas mientras el personaje está en sigilo reciben una bonificación de +4'),
    (8, 'Invisibilidad', 'A', 'El personaje puede volverse invisible a voluntad, volviéndose indetectable para los demás.'),
    (8, 'Engaño', 'P', 'El personaje recibe una bonificación de +3 a las tiradas para engañar a otros.'),
    (8, 'Líder de información', 'A', 'el personaje teje una red de contacto por todas las ciudades para poder sacar información útil de cualquier sitio'),
    (8, 'Sueño Muy Ligero', 'P', 'El personaje tiene un sueño muy ligero, lo que le otorga un bonificador de +5 a las tiradas de percepción durante el descanso y le permite detectar amenazas inminentes con mayor eficacia.'),
    (8, 'Abrir Cerraduras Mágicas o Malditas', 'P', 'El personaje recibe una bonificación de +4 a las tiradas para abrir cerraduras que son mágicas o están malditas'),
    (10, 'Más Preciso', 'P', 'El personaje, en una tirada de ataque en combate, considera un resultado natural de 18 como un golpe crítico.'),
    (10, 'Percepción Aumentada', 'P', 'El personaje recibe una bonificación de +4 a las tiradas de percepción'),
    (10, 'Atontar', 'A', 'el personaje realiza un ataque, en vez de hacerle daño, deja al enemigo K.O., esta habilidad solo se puede usar de sorpresa o cuando le quede menos del 10% de vida'),
    (10, 'Experto en Armas de Daga y Puñales', 'P', 'El personaje recibe una bonificación de +1 al modificador de Destreza y al daño al usar dagas, puñales, falcatas y sais'),
    (10, 'Desviar Atención', 'A', 'El personaje puede crear distracciones mientras está en sigilo para desviar la atención de los guardias u otros personajes'),
    (13, 'Ladrón de Guante Blanco', 'P', 'El personaje aumenta el modificador de destreza en +3 para realizar acciones relacionadas con abrir cerraduras, robar, hurtar y realizar trucos con las manos'),
    (13, 'Manipulación de Percepciones', 'A', 'El personaje puede reducir la percepción de su objetivo en -3'),
    (13, 'Colocar Falsas Pistas', 'A', 'El personaje puede dejar pistas falsas para engañar a quienes intenten rastrear sus movimientos'),
    (13, 'Estaba preparado', 'P', 'El personaje en caso de fallar al intentar desactivar una trampa, el daño recibido se reduce a la mitad'),
    (13, 'Velocidad Sigilosa', 'A', 'Mientras el personaje está en sigilo, su movimiento aumenta en +3 casillas'),
    (15, 'Mega Preciso', 'P', 'El personaje, en una tirada de ataque en combate, considera un resultado natural de 17 como un golpe crítico.'),
    (15, 'Rapidez', 'P', 'Aumenta la movilidad del personaje en +2 casillas'),
    (15, 'Sin Dejar Rastro', 'A', 'El personaje puede moverse sin dejar huellas o pistas, dificultando el rastreo de sus movimientos por parte de otros.'),
    (15, 'Embaucar', 'P', 'El personaje recibe una bonificación de +2 a las tiradas para engañar, manipular o persuadir a otros'),
    (15, 'Ojo Avizor', 'P', 'El personaje incrementa su alcance con armas a distancia en +3 casillas más.'),
    (18, 'Poliglota', 'P', 'El personaje conoce y puede hablar lenguas muertas y demoníacas, así como idiomas cifrados'),
    (18, 'Falsificación de Documentos', 'A', 'El personaje puede falsificar documentos con gran precisión, creando copias que son prácticamente indistinguibles de los originales, lo que le permite engañar a autoridades o acceder a información restringida.'),
    (18, 'Crear Ilusiones', 'A', 'El personaje puede generar espejismos de objetos, personas o utensilios para engañar a los objetivos'),
    (18, 'Máximo Esfuerzo', 'P', 'La carrera del personaje aumenta en +3 casillas'),
    (18, 'Sabotaje', 'P', 'El personaje recibe un bonificador de +4 a la tirada cuando intenta desactivar, destruir o inutilizar mecanismos, estructuras o dispositivos.'),
    (20, 'Ultra Preciso', 'P', 'El personaje, en una tirada de ataque en combate, considera un resultado natural de 16 como un golpe crítico.'),
    (20, 'Liberar Responsabilidades', 'P', 'El personaje queda exento de la obligación de ceder el 10% de todos sus beneficios al gremio'),
    (20, 'Golpe Sombrío', 'A', 'Al realizar un golpe exitoso, el ladrón activa automáticamente la habilidad de Esconderse en las Sombras sin gastar acción adicional'),
    (20, 'Maestro de Cerraduras', 'P', 'El personaje puede abrir cualquier tipo de cerradura sin necesidad de herramientas y con éxito garantizado'),
    (20, 'Armadura de Sombras', 'P', 'El personaje aumenta en -2 puntos su Clase de Armadura (C.A.) contra ataques de origen de magia oscura.')
  ) AS a(level, name, action, description)
WHERE c.name = 'Ladrón';

-- Legionario
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Legionario', 'Cualquiera', 2, 'Ligera / Media / Pesada',
  'No puede usar látigo, dagas o armas a distancia (exceptuando en Pilum) Puede usar todos los escudos.',
  '14 Constitución', 'Gladius, Escutum, Pilum',
  ARRAY['Enano', 'Humano', 'Orco', 'Semielfo', 'Semiorco', 'Troloide']::text[],
  6, 2, 4, 6, 2,
  '{"Constitución":14}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Legionario');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Legionario');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,2000),(3,5000),(4,9000),(5,20000),(6,44000),(7,90000),(8,169000),(9,350000),(10,549000),(11,700000),(12,900000),(13,1001000),(14,1200000),(15,1451000),(16,1600000),(17,1650000),(18,1800000),(19,1901000),(20,2000000)) AS x(level, xp)
WHERE c.name = 'Legionario';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Legionario');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Soporte titánico', 'P', 'El personaje permite manejar o cargar peso equivalente a un Jotun.'),
    (0, 'Servidumbre', 'P', 'El personaje está obligado a servir al Emperador de Lusitanius, cumpliendo sus órdenes y misiones sin opción a negarse.'),
    (0, 'Vitalidad de Legionario', 'P', 'En el caso del personaje, el incremento en la vitalidad por nivel se distribuirá de la siguiente manera: del nivel 1 al 9, se añaden 10 puntos de vida; del 10 al 15, se agregan 13 puntos; del 16 al 19, se suman 12 puntos adicionales; finalmente, al alcanzar el nivel 20, se incrementan 35 puntos de vida.'),
    (0, 'Diplomacia', 'P', 'El personaje recibe una bonificación de +3 a las tiradas en negociaciones.'),
    (0, 'Resistencia al Miedo', 'P', 'El personaje recibe una bonificación de +3 en la tirada de salvación contra efectos que inducen miedo o pánico.'),
    (0, 'Maestro del Regateo', 'P', 'El personaje obtiene una bonificación de +10% en todas las transacciones de compraventa'),
    (0, 'Resiliencia Inquebrantable', 'P', 'El personaje recibe una bonificación de +1 en todas las tiradas de salvación.'),
    (0, 'Golpe de Escudo', 'A', 'El personaje puede golpear con el escudo a un enemigo, infligiendo 1d4 puntos de daño y empujando al objetivo una distancia igual a las casillas correspondientes al daño realizado.'),
    (0, 'Estrategia', 'A', 'El personaje organiza planes siempre antes de los combates de manera efectiva, aumentando la coordinación del equipo. Esto le permite transportar a todos sus aliados a cualquier punto del campo de batalla donde lo desee'),
    (0, 'Llamada de atención', 'A', 'el personaje llama la atención de un enemigo que atrae su atención a un rango máximo de 6 casillas de distancia'),
    (0, 'Recuperación Rápida', 'P', 'El personaje puede recuperarse de la fatiga una vez por combate sin necesidad de descansar, permitiéndole continuar combatiendo con normalidad.'),
    (5, 'Cuerpo de Roca', 'A', 'El personaje activa una armadura de 20 puntos de vitalidad que se agota antes de afectar los puntos de vida, puede usar esta habilidad cada vez que pierde el 25% de su vitalidad total.'),
    (5, 'Táctica Legionaria', 'P', 'El personaje puede lanzar el Pilum y luego atacar con el Gladius en el mismo turno.'),
    (5, 'Infatigable', 'P', 'El personaje no necesita descansar después de realizar una carrera o cualquier acción que requiera fuerza y resistencia extraordinarias'),
    (9, 'Experto en Combate Cuerpo a Cuerpo', 'P', 'El personaje aumenta en +1 tanto el bonificador de destreza como el daño en combates cuerpo a cuerpo'),
    (9, 'Defensa Coordinada', 'A', 'El personaje aplica la Clase de Armadura proporcionada por su escudo a los aliados que estén adyacentes a él.'),
    (9, 'Formación de Batalla', 'P', 'Mientras el personaje se encuentre adyacente a aliados, su modificador de Constitución y el de sus compañeros juntos a él aumenta en +2, además, el personaje nunca atacará por pifia a un aliado adyacente.'),
    (10, 'Ataque Doble', 'P', 'Permite al personaje realizar un segundo ataque inmediatamente después del primero en el mismo turno.'),
    (10, 'Ignorar Penalización del Terreno', 'P', 'El personaje puede moverse a través de cualquier terreno sin sufrir ninguna penalización a su velocidad o acciones.'),
    (10, 'Bendición del Legionario', 'A', 'Otorga a todos los jugadores una armadura de 10 puntos de vitalidad, que se puede aplicar nuevamente cada 5 turnos, hasta un máximo de 50 puntos de vitalidad extra.'),
    (15, 'Táctica de Centuria', 'A', 'Los aliados adyacentes al personaje pueden desplazarse, fuera de su turno, la misma distancia que el personaje durante su movimiento, manteniendo la misma formación que tenían antes del movimiento del personaje.'),
    (15, 'Soporte colosal', 'P', 'El personaje puede cargar y soportar el doble de peso que normalmente se le permite sin sufrir penalizaciones a su movilidad.'),
    (15, 'Resistencia Desmesurada', 'P', 'Aumenta el modificador de la constitución del personaje en +5.'),
    (19, 'Falange', 'A', 'Bloquea todos los ataques físicos, arcanos, oscuros, infernales y sagrados de la próxima ronda, protegiendo tanto al personaje como a todos los compañeros situados detrás de él. Solo se puede usar 3 veces en un combate.'),
    (19, 'Oficial', 'P', 'Aumenta en +3 el modificador de carisma de manera irreducible y permite al personaje enviar a subordinados no jugadores (NPJ) a misiones sin necesidad de estar presente con el grupo.'),
    (19, 'Eliminar Penalizaciones', 'P', 'Se elimina la obligación de lealtad del personaje, liberándolo de cualquier penalización o restricción asociada a esta obligación.'),
    (20, 'Impenetrable', 'P', 'El personaje solo puede ser herido por ataques críticos cuando recibe daño exclusivamente físico.')
  ) AS a(level, name, action, description)
WHERE c.name = 'Legionario';

-- Mago Arcano
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Mago Arcano', 'Cualquiera', 7, 'Ligera',
  'No puede usar armas pesadas. Sin escudo: (El personaje no puede equipar ningún tipo de escudo)',
  '14 Inteligencia', 'Bastón o varita',
  ARRAY['Autómata', 'Elfo', 'Elfo Oscuro', 'Felino', 'Gnomo', 'Goblin', 'Humano', 'Jotun', 'Nahiaride', 'Orco', 'Sátiro', 'Semielfo', 'Semiorco']::text[],
  3, 1, 4, 1, 2,
  '{"Inteligencia":14}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Mago Arcano');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Mago Arcano');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,2000),(3,5000),(4,10000),(5,20000),(6,40000),(7,80000),(8,160000),(9,300000),(10,450000),(11,600000),(12,750000),(13,900000),(14,1100000),(15,1200000),(16,1350000),(17,1500000),(18,1650000),(19,1800000),(20,1950000)) AS x(level, xp)
WHERE c.name = 'Mago Arcano';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Mago Arcano');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Cerrar Portales', 'A', 'El personaje puede cerrar portales ya abiertos, deteniendo su efecto y evitando el paso a través de ellos.'),
    (0, 'Detectar Magia', 'P', 'el personaje puede detectar si un objeto o lugar contiene magia.'),
    (0, 'Destreza del Hechicero', 'P', 'El personaje obtiene una bonificación de +3 a la Destreza para acertar hechizos del personaje'),
    (0, 'Transportador de Nébula', 'A', 'El personaje abre un portal para almacenar objetos en un cuerpo celeste orbitante, donde no hay aire, gravedad, ni presión. Debido a estas condiciones, los objetos almacenados no sufren sobrecarga ni deterioro. (Sólo puede usarse fuera de combate)'),
    (0, 'Dormir', 'A', 'El personaje lanza un hechizo para dormir a un objetivo, sumando +2 a la tirada al lanzar el hechizo. Si el objetivo queda dormido, todos los ataques y hechizos dirigidos a él recibirán un bonificación de +5 a la tirada.'),
    (0, 'Escudo Arcano', 'A', 'El personaje invoca un escudo mágico que bloquea un único ataque mágico o desactiva una trampa mágica'),
    (0, 'Leer lenguas', 'P', 'el personaje puede leer todas las lenguas, tanto vivas como muertas o demoníacas'),
    (0, 'Leer Magia', 'P', 'el personaje puede leer las magias arcanas, elementales, sagradas o demoníacas para saber su utilidad y como desactivarlas'),
    (0, 'Luz Mágica', 'P', 'El personaje invoca una esfera de luz que lo acompaña e ilumina el camino, proporcionando visibilidad en la oscuridad.'),
    (0, 'Proyectil Mágico', 'A', 'El personaje lanza un proyectil mágico que inflige 1d6 de daño más el modificador de inteligencia del personaje.'),
    (0, 'Ventriloquia', 'A', 'El personaje puede controlar una persona o muñeco para hablar a través de él, sin importar la distancia.'),
    (1, 'Protección contra la Hechicería', 'A', 'Imbuye a un compañero o a sí mismo con un escudo mágico que bloquea un ataque mágico o una trampa mágica.'),
    (1, 'Hechizar Personas', 'A', 'El personaje puede controlar mentalmente a un enemigo humanoide de menor nivel, sometiéndolo a su voluntad durante un periodo de tiempo determinado.'),
    (2, 'Abrir Cerraduras Mágicas o Malditas', 'P', 'El personaje recibe una bonificación de +4 a las tiradas para abrir cerraduras que son mágicas o están malditas'),
    (2, 'Cerradura Arcana', 'A', 'El personaje puede crear cerraduras encantadas que solo se pueden abrir mediante magia, bloqueando intentos físicos o convencionales de acceso.'),
    (2, 'Detectar mal', 'A', 'el personaje puede detectar si un objeto o lugar contiene magia oscura, infernal o maldita.'),
    (2, 'Levitar', 'P', 'el personaje puede flotar para evitar el daño por caída'),
    (2, 'Localizar objetos', 'A', 'El personaje obtiene una bonificación de +4 en la tirada para detectar objetos'),
    (2, 'Luz Permanente', 'A', 'El personaje invoca una bola de luz que permanece activa e inextinguible, sin poder ser contrarrestada ni apagada.'),
    (3, 'Detectar Invisibilidad', 'P', 'El personaje obtiene un bonificador de +3 a las tiradas de percepción para identificar y localizar seres u objetos invisibles en su entorno.'),
    (3, 'Imagen Reflejada', 'A', 'Invoca una copia ilusoria del personaje o de un compañero para engañar y distraer a los enemigos.'),
    (3, 'Invisibilidad', 'A', 'El personaje puede volverse invisible a voluntad, volviéndose indetectable para los demás.'),
    (3, 'Percepción Extrasensorial', 'P', 'El personaje puede localizar entidades, entes o individuos incluso en otros planos existenciales'),
    (3, 'Bola de Fuego', 'A', 'El personaje lanza una bola de fuego que inflige 1d6 de daño más el modificador de inteligencia, y tiene la posibilidad de provocar una quemadura adicional que causa daño de manera pasiva'),
    (3, 'Acelerar', 'P', 'Al personaje se le otorga una bonificación de +4 a la tirada de iniciativa.'),
    (4, 'Clarividencia', 'P', 'el personaje puede detectar la intención de un atacante antes de realizarlo'),
    (4, 'Infravisión', 'P', 'El personaje puede ver en la oscuridad y en condiciones de poca luz, aumentando su rango de visión en 3 casillas adicionales.'),
    (4, 'Leer Mentes', 'A', 'el personaje puede acceder a los pensamientos y emociones del objetivo, revelando sus intenciones y obteniendo respuestas veraces.'),
    (4, 'Ráfaga de Proyectiles', 'A', 'El personaje lanza un ataque que puede seleccionar de 1 a 3 objetivos diferentes. Realiza 1d6 de daño, y a cada proyectil se le suma el modificador de inteligencia del personaje al daño. Los proyectiles deben ser dirigidos a diferentes tipos de objetivos; no se pueden usar múltiples proyectiles en el mismo objetivo.'),
    (4, 'Rayo Eléctrico', 'A', 'El personaje lanza una descarga eléctrica que inflige 1d4 de daño más el modificador de inteligencia del personaje, además, tiene la posibilidad de paralizar al enemigo.'),
    (4, 'Confusión', 'A', 'El personaje puede confundir a un enemigo, haciendo que ataque a otro objetivo. Además, recibe una bonificación de +3 en la tirada para realizar esta acción.'),
    (5, 'Disipar magia', 'A', 'el personaje puede eliminar la magia de un objeto o lugar encantado'),
    (5, 'Conjuro de Inmovilización', 'A', 'El personaje puede paralizar a un objetivo de nivel igual o inferior al suyo, con una bonificación de +4 a la tirada para lograr la inmovilización.'),
    (5, 'Invisibilidad en Grupo', 'A', 'El personaje puede volver invisible a todo el grupo, haciendo que todos los miembros se vuelvan indetectables para los demás.'),
    (5, 'Protección contra la hechicería en grupo', 'A', 'el personaje coloca un escudo protector a todos los compañeros que tenga a su alcance contra ataques mágicos o trampas'),
    (5, 'Volar', 'A', 'El personaje puede volar libremente por el aire, ganando la capacidad de moverse sin restricciones por este medio'),
    (6, 'Hechizar monstruo', 'A', 'el personaje puede controlar la mente de un monstruo o bestia de nivel igual o inferior'),
    (6, 'Ojo Arcano', 'A', 'El personaje invoca un globo ocular mágico que puede desplazar su visión hacia otros lugares sin ser detectado, permitiendo observar y vigilar discretamente.'),
    (6, 'Puerta Dimensional', 'A', 'El personaje abre una puerta que conecta diferentes planos existenciales, permitiendo el tránsito entre ellos y facilitando el acceso a lugares alternativos y realidades paralelas.'),
    (6, 'Quitar Maldiciones', 'A', 'El personaje elimina todas maldiciones de un objetivo dentro de su rango de alcance'),
    (6, 'Terreno Ilusorio', 'A', 'El personaje puede provocar ilusiones que alteran la apariencia del terreno o lugar, creando cambios visuales que engañan a quienes lo observan.'),
    (7, 'Muro de Fuego', 'A', 'El personaje crea un muro de fuego de 6 casillas de longitud que inflige daño por quemadura igual al modificador de inteligencia del personaje a cualquier enemigo que lo atraviese o esté en contacto con él.'),
    (7, 'Muro de Hielo', 'A', 'El personaje crea un muro de hielo de 6 casillas de longitud. El muro no puede ser atravesado hasta que se rompa, teniendo una vida igual a la mitad de la vida del personaje y una Clase de Armadura (CA) de 19.'),
    (7, 'Polimorfia', 'A', 'El personaje transforma a un objetivo, de nivel igual o inferior, en un ser inofensivo durante un período de tiempo determinado.'),
    (7, 'Despetrificar', 'A', 'El personaje puede revertir la petrificación de un objetivo, con una bonificación de +4 a la tirada más el modificador de inteligencia del personaje'),
    (7, 'Desintegrar Objetos', 'A', 'El personaje puede pulverizar a distancia cualquier objeto no mágico, reduciéndolo a polvo.'),
    (7, 'Atontar', 'A', 'el personaje realiza un ataque, en vez de hacerle daño, deja al enemigo K.O., esta habilidad solo se puede usar de sorpresa o cuando le quede menos del 10% de vida'),
    (7, 'Contactar con Otros Planos', 'A', 'El personaje puede establecer comunicación con entidades de otros planos sin necesidad de desplazarse o abrir un portal dimensional.'),
    (8, 'Invocar Elemental', 'A', 'El personaje puede invocar cualquier tipo de elemental, el cual tiene una vitalidad igual a la mitad de la del personaje y comparte las mismas características que su conjurador.'),
    (8, 'Muro de Piedra', 'A', 'El personaje crea un muro de piedra de 6 casillas de longitud. El muro no puede ser atravesado hasta que se rompa, y tiene una vida igual de la del personaje con una Clase de Armadura (CA) de 10.'),
    (8, 'Neblina', 'A', 'El personaje conjura una neblina mágica que reduce la visibilidad de todos los objetivos dentro de su alcance en 1 casilla, reduciendo todas las tiradas en -3'),
    (8, 'Volar en Grupo', 'A', 'El personaje puede hacer volar a todos los miembros del equipo dentro de su rango de alcance.'),
    (8, 'Pasadizo Arcano', 'A', 'El personaje puede crear caminos entre distancias cortas, desbloqueando obstáculos y permitiendo el paso a través de barreras que normalmente bloquearían el acceso.'),
    (8, 'Teleportar', 'A', 'El personaje puede desplazar a un compañero a otro lado del campo de batalla instantáneamente, independientemente de la distancia.'),
    (8, 'Abrir Aguas', 'A', 'El personaje puede dividir o apartar las aguas en su entorno, creando un camino transitable o despejando áreas inundadas.'),
    (9, 'Paralizar Monstruo', 'A', 'El personaje lanza un hechizo que paraliza a un monstruo o bestia'),
    (9, 'Invocar Familiar', 'A', 'el personaje puedes invocar a un familiar que se halle en la sede de Gremio o en algún refugio de su propiedad'),
    (9, 'Telequinesis', 'A', 'El personaje puede desplazar objetos del terreno a distancia mediante magia arcana, moviéndolos sin contacto físico directo, dentro del rango de alcance del personaje.'),
    (9, 'Escudo de magia', 'A', 'El personaje invoca un gran escudo hecho de Magia colocado en el campo de batalla que bloquea el siguiente ataque de cualquier fuente mágica dirigido hacia él, no se puede usar para desactivar trampas mágicas'),
    (10, 'Clonar', 'A', 'El personaje puede crea una copia idéntica de ti mismo o de un aliado. Solo puede usarse una vez por combate y solo puede haber una copia activa. Si la copia posee esta habilidad, no puede utilizarla.'),
    (11, 'Merodeador Invisible', 'A', 'El personaje vuelve invisible a cualquier animal o montura que acompañe al grupo, haciéndolos indetectables para los demás.'),
    (11, 'Proyectar Imagen', 'A', 'El personaje puede proyectar su imagen y hablar a cualquier lugar, permitiendo la comunicación y la presencia visual a distancia.'),
    (12, 'Explosión Arcana', 'A', 'El personaje lanza un proyectil arcano que explota en un área de 4 casillas, infligiendo 1d10 de daño más el modificador de inteligencia.'),
    (12, 'Abrir Cerraduras Mágicas o malditas Mejoradas', 'P', 'El personaje recibe una bonificación de +8 a las tiradas para abrir cerraduras que son mágicas o están malditas'),
    (12, 'Conjuro de Inmovilización Mejorada', 'A', 'El personaje puede paralizar a un objetivo de nivel igual o inferior al suyo, con una bonificación de +7 a la tirada para lograr la inmovilización.'),
    (12, 'Conocimiento Arcano', 'A', 'Una vez por combate el personaje mejora su modificador de inteligencia en +2'),
    (12, 'Localizar objeto mejorado', 'A', 'El personaje obtiene una bonificación de +8 en la tirada para detectar objetos'),
    (12, 'Espada Mágica', 'A', 'El personaje imbuye cualquier arma con magia arcana, haciendo que esta provoque daño adicional igual al modificador de intelecto del hechicero.'),
    (13, 'Petrificar', 'A', 'El personaje transforma en piedra a cualquier enemigo, añadiendo una bonificación de +3 a la tirada para asegurar el éxito del conjuro.'),
    (13, 'Mano Apresadora', 'A', 'El personaje lanza un hechizo que crea una mano mágica que agarra y retiene a un enemigo, sin importar la distancia entre el personaje y el objetivo.'),
    (13, 'Eclipse Intelectual', 'A', 'El personaje lanza un hechizo sobre un objetivo que reduce su modificador de inteligencia en -3.'),
    (13, 'Acelerar mejorada', 'P', 'el personaje obtiene una bonificación de +6 a la tirada de iniciativa'),
    (13, 'Confusión mejorada', 'A', 'El personaje puede confundir a un enemigo, haciendo que ataque a otro objetivo. Además, recibe una bonificación de +5 en la tirada para realizar esta acción.'),
    (13, 'Palabras Arcanas: Atontar', 'A', 'El personaje canaliza el hechizo durante 5 turnos, al acabar el hechizo el enemigo queda totalmente incapacitado, este efecto no puede ser ignorado, pero el hechizo puede ser interrumpido'),
    (14, 'Puerta de Fase', 'A', 'El personaje puede abrir puertas mágicas que le permiten atravesar paredes, creando caminos instantáneos a través de barreras físicas.'),
    (14, 'Encantar Armadura', 'A', 'El personaje imbuye en magia una armadura propia o de un aliado, reduciendo el daño arcano recibido en -2, durante el combate'),
    (14, 'Despetrificar mejorado', 'A', 'El personaje puede revertir la petrificación de un objetivo, con una bonificación de +6 a la tirada más el modificador de inteligencia del personaje'),
    (14, 'Petrificar mejorado', 'A', 'El personaje transforma en piedra a cualquier enemigo, añadiendo una bonificación de +5 a la tirada para asegurar el éxito del conjuro.'),
    (14, 'Redirigir Ataque Mágico', 'P', 'El personaje puede modificar la trayectoria de un ataque a mágico a distancia, fuera de su turno. Debe lanzar 1D20, y si el resultado es mayor que el ataque del enemigo sin modificadores, puede redirigir el ataque hacia el lugar deseado.'),
    (14, 'Sellado de Corrupción', 'A', 'El personaje puede desterrar el mal de un objeto o persona y redirigirlo a cualquier objeto compatible que pueda almacenar esa energía negativa.'),
    (15, 'Palabras Arcanas: Conjuro de muerte', 'A', 'El personaje marca a un enemigo de menor nivel que él, después canalizara el hechizo durante 5 turnos cuando este se haya completado, el enemigo morirá al instante, el hechizo puede ser interrumpido'),
    (15, 'Cristalizar', 'A', 'El personaje se congela en un bloque de hielo, manteniendo su cuerpo en un estado sólido mientras conserva el control sobre sus invocaciones. El bloque de hielo tiene la mitad de la vida del invocador y una Clase de Armadura (CA) de 19. Durante este estado, el personaje está inmóvil y no puede actuar directamente. Esta habilidad se puede usar una vez por combate.'),
    (15, 'Mano Apresadora en Masa', 'A', 'El personaje lanza un hechizo que invoca manos mágicas que afecta hasta 1d6 enemigos más el bonificador de inteligencia, independientemente del rango de alcance del personaje.'),
    (15, 'Sellos de Teletransporte', 'A', 'El personaje puede colocar dos sellos mágicos en el suelo. Cuando un individuo pisa uno de los sellos, es teletransportado instantáneamente al otro sello.'),
    (15, 'Encantar Proyectiles', 'A', 'El personaje puede encantar flechas, virotes o estacas de aliados, otorgándoles una bonificación adicional de daño igual al modificador de inteligencia del hechicero.'),
    (16, 'Hechizar personas en masas', 'A', 'El personaje puede controlar mentalmente a todos los enemigo humanoide de menor nivel dentro de su rango de alcance, sometiéndolo a su voluntad durante un periodo de tiempo determinado.'),
    (16, 'Ojo del Mago', 'P', 'El personaje puede percibir el aura mágica de todos los seres y objetos en su entorno, revelando el poder mágico y calculado su potencial.'),
    (16, 'Dormir mejorado', 'A', 'El personaje lanza un hechizo para dormir a un objetivo, sumando +5 a la tirada al lanzar el hechizo. Si el objetivo queda dormido, todos los ataques y hechizos dirigidos a él recibirán un bonificación de +7 a la tirada.'),
    (16, 'Enlace Arcano', 'P', 'El personaje puede establecer un enlace mágico con un aliado, permitiendo la transferencia de información y el intercambio de puntos de vida o energía mágica.'),
    (16, 'Aura Arcana', 'A', 'El personaje genera un aura mágica alrededor dentro de su rango que proporciona bonificaciones de +2 de daño a los hechizos arcanos a sus aliados y a si mismo'),
    (17, 'Mente en blanco', 'A', 'el personaje lanza un hechizo para borra los recuerdos de cualquier objetivo, puede ser momentos específicos o todos'),
    (17, 'Lluvia de Meteoritos Incandescentes', 'A', 'El personaje convoca una lluvia de meteoritos de fuego mágicos que dañan a todos los combatientes del campo de batalla. Primero lanza 1d6 para determinar cuántos meteoritos caen. Luego, para cada meteorito, lanza 1d12 y añade el modificador de inteligencia del hechicero para calcular el daño infligido.'),
    (17, 'Conjurador', 'P', 'el personaje puede volver a lanzar otro hechizo'),
    (17, 'Invocar Piedra Angular Artificial', 'A', 'El personaje puede crear una piedra angular mágica de un solo uso mediante su poder arcano. Esta piedra sirve como un uso de teletransporte inmediata, permitiendo al personaje regresar a la ubicación del teletransporte cuando activa la piedra.'),
    (17, 'Crear Transportador', 'A', 'El personaje puede encantar una piedra común para convertirla en un transportador mágico. Esta piedra encantada se vincula a las Piedras Angulares Artificiales, permitiendo el teletransporte entre la piedra transportadora y las Piedras Angulares previamente establecidas.'),
    (17, 'Nube Incendiada', 'A', 'El personaje invoca una nube de fuego que desciende en forma de gotas ardientes. Todos los enemigos dentro del rango del hechizo reciben 4 puntos de daño por quemaduras más el modificador de inteligencia'),
    (17, 'Barricada Arcanas', 'A', 'El personaje conjura un imponente muro de magia arcana que se extiende a lo largo de 10 casillas. Este muro bloquea todos los ataques a distancia durante una ronda entera, reduciendo su daño y protegiendo a los aliados al interponerse entre ellos y los enemigos.'),
    (18, 'Polimorfizar Objetos', 'A', 'El personaje puede transformar objetos en seres vivos inofensivos durante un período de tiempo determinado.'),
    (18, 'Éxtasis Nexiano', 'A', 'El personaje aumenta el modificador de inteligencia en +3 durante el combate'),
    (18, 'Sellado de Congelación', 'A', 'El personaje lanza un proyectil mágico que encierra al objetivo en un bloque de hielo, dejándolo en suspensión y paralizado durante el tiempo de efecto del hechizo.'),
    (18, 'Silenciar Hechizos Arcanos', 'A', 'El personaje puede neutralizar o anular los hechizos arcanos de un objetivo enemigo.'),
    (18, 'Manos Mágicas', 'A', 'el personaje puede restaurar la magia agotada o pérdida de un aliado'),
    (18, 'Rayos Arcanos Apresadores', 'A', 'El personaje lanza un rayo arcano que inflige 1d12 de daño más el modificador de Inteligencia al objetivo. En el siguiente turno, el personaje debe realizar un segundo ataque a otro enemigo u objeto, creando un rayo continuo que conecta a ambos objetivos. Este vínculo de rayos atrae a los dos objetivos entre sí, pudiendo arrastrarlos o acercarlos'),
    (18, 'Magus de Esfera Arcana', 'A', 'El personaje invoca un orbe flotante de magia arcana que flota a su alrededor. Este orbe tiene la capacidad de absorber todos los proyectiles mágicos que se lancen dentro de un rango de 3 casillas a su alrededor. Cuando el mago lo desee, puede liberar toda la energía acumulada en el orbe, lanzando la esfera y creando una explosión de energía mágica que inflige daño en un área de 9 casillas, causando un impacto por el valor del daño absorbido'),
    (19, 'Símbolo Arcano', 'A', 'el personaje aumenta el modificador de inteligencia de todos los aliados en +3'),
    (19, 'Esfera Prismática', 'P', 'El personaje crea una esfera mágica que aumenta su rango de alcance en +2'),
    (19, 'Aprisionar', 'A', 'El personaje encierra a un objetivo en un plano diferente, aislándolo de su entorno actual y de las acciones de los demás.'),
    (19, 'Palabras Arcanas: Cúpula de Protección', 'A', 'El personaje conjura una cúpula mágica que cubre un área de 12 casillas. Durante 1 ronda entera, bloquea todos los ataques mágicos que intenten atravesarla y puede absorber hasta 100 puntos de daño. Una vez que la cúpula alcanza su límite o es destruida, no puede volver a activarse hasta pasados 5 turnos.'),
    (20, 'Detener Tiempo', 'A', 'El personaje detiene el tiempo en el campo de batalla. Primero, tira 1d4 para determinar cuántas rondas los objetivos permanecerán suspendidos en el tiempo. Luego, tira 1d20; los aliados deben superar la tirada del personaje para evitar quedar también detenidos en el tiempo. Si no lo logran, serán afectados por la detención temporal junto con los objetivos. Solo se puede usar una vez por combate'),
    (20, 'Palabras Arcana: Matar', 'A', 'El personaje marcará a todos los enemigos que se encuentre en su rango de visión y tenga menos de un 25% de vida para después canalizar el hechizo durante 3 turnos, una vez completado el conjuro todos los enemigos marcados morirán, este conjuro puede ser interrumpido'),
    (20, 'Conocimiento Desmesurado', 'P', 'El personaje puede aprender a usar todas las habilidades mágicas de otras clases, excepto aquellas que requieran del nivel 18,19 y 20.')
  ) AS a(level, name, action, description)
WHERE c.name = 'Mago Arcano';

-- Místico
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Místico', 'Neutral, neutral/legal, legal', 5, 'Ligera',
  'No puede usar armas pesadas. Sin escudo: (El personaje no puede equipar ningún tipo de escudo)',
  '12 Inteligencia, 12 Sabiduría', 'Mapa de las estrellas, Varita',
  ARRAY['Autómata', 'Aviroide', 'Elfo', 'Elfo Oscuro', 'Felino', 'Gnomo', 'Humano', 'Nahiaride', 'Semielfo', 'Semiorco', 'Troloide']::text[],
  2, 3, 3, 2, 2,
  '{"Inteligencia":12,"Sabiduría":12}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Místico');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Místico');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,1000),(3,3000),(4,6000),(5,12000),(6,25000),(7,50000),(8,100000),(9,200000),(10,300000),(11,400000),(12,500000),(13,600000),(14,700000),(15,800000),(16,900000),(17,1000000),(18,1100000),(19,1200000),(20,1300000)) AS x(level, xp)
WHERE c.name = 'Místico';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Místico');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Leer Mentes', 'A', 'el personaje puede acceder a los pensamientos y emociones del objetivo, revelando sus intenciones y obteniendo respuestas veraces.'),
    (0, 'Destreza del Hechicero', 'P', 'El personaje obtiene una bonificación de +3 a la Destreza para acertar hechizos del personaje'),
    (0, 'Transportador de Nébula', 'A', 'El personaje abre un portal para almacenar objetos en un cuerpo celeste orbitante, donde no hay aire, gravedad, ni presión. Debido a estas condiciones, los objetos almacenados no sufren sobrecarga ni deterioro. (Sólo puede usarse fuera de combate))'),
    (1, 'Cartógrafo', 'P', 'el personaje puede leer mapas y los cuerpos celestes para orientarse'),
    (1, 'Cegar', 'A', 'El personaje realiza una intensa llamarada con su arma que incapacita a los enemigos frente a él durante 1 turno.'),
    (1, 'Detectar Magia', 'P', 'el personaje puede detectar si un objeto o lugar contiene magia.'),
    (1, 'Sanación Mágica', 'A', 'El personaje sana a un objetivo dentro de su rango de alcance, restaurando 1d4 puntos de vida más el modificador de sabiduría del personaje.'),
    (1, 'Premonición', 'A', 'El personaje puede ver en las fuerzas cósmicas para prever cualquier acontecimiento fuera de combate, obteniendo una bonificación en la tirada basado en su modificador de Sabiduría.'),
    (1, 'Protección contra la Hechicería', 'A', 'Imbuye a un compañero o a sí mismo con un escudo mágico que bloquea un ataque mágico o una trampa mágica.'),
    (1, 'Purificar Agua y Alimentos', 'P', 'el personaje limpia y purifica agua y alimentos, eliminando cualquier tipo de contaminación, impurezas, o maldiciones que puedan estar presentes.'),
    (1, 'Despejar Cielos', 'A', 'El personaje puede disipar cualquier tormenta o fenómeno atmosférico mágico, despejando los cielos y restaurando condiciones climáticas normales en la zona.'),
    (1, 'Escudo Arcano', 'A', 'El personaje invoca un escudo mágico que bloquea un único ataque mágico o desactiva una trampa mágica'),
    (1, 'Deflagración Astrológica', 'A', 'El personaje lanza una onda de pulso de energía estelar que afecta a todos los objetivos dentro de su rango de alcance, provocando 1D4 de daño más el modificador de inteligencia del personaje.'),
    (2, 'Proyectil Estelar', 'A', 'El personaje lanza un proyectil de magia astral desde su varita, que impacta a un objetivo infligiendo 1d6 de daño más el modificador de inteligencia del personaje.'),
    (2, 'Meditación Cósmica', 'A', 'El personaje entra en un estado de meditación profunda durante un turno. Al finalizar la meditación, el próximo hechizo que lance duplicará su modificador de Inteligencia.'),
    (2, 'Atracción Gravitatoria', 'A', 'El personaje altera el campo gravitatorio de una zona dentro de su rango de alcance, designando una casilla específica como centro de la atracción. Cada turno, todos los personajes situados en dicha casilla o en las casillas adyacentes son arrastrados hacia el punto marcado.'),
    (2, 'Comunión Astral', 'A', 'El personaje puede tomar un espejo común y, utilizando su poder astral, transformarlo en un espejo de comunicación mística.'),
    (2, 'Ojo Cósmico', 'P', 'El personaje activa su percepción cósmica, lo que le permite ver el aura de las personas. A través de estas auras, puede discernir las intenciones y emociones de los demás.'),
    (2, 'Puente Estelar', 'A', 'El personaje puede crear caminos o puentes físicos utilizando magia astral, conectando dos puntos distantes entre sí.'),
    (5, 'Sanar Estados', 'A', 'El personaje elimina un estado negativo de un objetivo'),
    (5, 'Visión Astral', 'P', 'El personaje proyecta su conciencia más allá de su forma física, explorando otros lugares a través de los planos existenciales. Esta habilidad solo se puede utilizar fuera de combate.'),
    (5, 'Transportación Astral', 'P', 'El personaje, hasta dos veces por ronda, puede desplazarse de manera instantánea a cualquier punto dentro de su alcance visual. Para utilizar esta habilidad, debe tener línea de visión directa hacia el lugar al que desea trasladarse.'),
    (5, 'Curación Cósmica', 'A', 'El personaje sana a un objetivo dentro de su rango de alcance, restaurando 1d6 puntos de vida más el modificador de sabiduría del personaje.'),
    (5, 'Infusión de Energía Mística', 'A', 'El personaje puede imbuir energía mística en una figura, dando vida a un Alebrije que actuará como su acompañante, con habilidades mágicas según su naturaleza.'),
    (5, 'Puertas Interdimensionales', 'A', 'El personaje establece dos puntos dentro de su rango de visión a los que cualquier ser puede teletransportarse durante el combate.'),
    (5, 'Cúpula Curativa', 'A', 'El personaje invoca una cúpula de energía sanadora que abarca un área de 4 casillas. Todos los aliados dentro de esta zona recuperan 1d4 puntos de vida mas el modificador de Sabiduría al inicio de cada turno del personaje. La cúpula permanece activa hasta que el combate finaliza o hasta que sea neutralizada por un efecto de silencio u otra habilidad.'),
    (8, 'Hechizar Personas', 'A', 'El personaje puede controlar mentalmente a un enemigo humanoide de menor nivel, sometiéndolo a su voluntad durante un periodo de tiempo determinado.'),
    (10, 'Convergencia', 'P', 'Mejora en +1 todas las características base del personaje'),
    (11, 'Vínculo Psíquico', 'P', 'El personaje establece un vínculo mental con un aliado, permitiéndoles comunicarse telepáticamente sin importar la distancia que los separe.'),
    (11, 'Crear Ilusiones', 'A', 'El personaje puede generar espejismos de objetos, personas o utensilios para engañar a los objetivos'),
    (11, 'Volar', 'A', 'El personaje puede volar libremente por el aire, ganando la capacidad de moverse sin restricciones por este medio'),
    (11, 'Luz de Luna', 'P', 'El personaje tiene la habilidad de controlar los ciclos lunares, permitiéndole manipular la fase de la luna a voluntad.'),
    (11, 'Ataduras Etéreas', 'A', 'El personaje conjura cadenas místicas que inmovilizan al enemigo, impidiendo que se mueva durante un tiempo. El hechizo otorga una bonificación de +6 a la tirada para asegurar el éxito de la inmovilización.'),
    (11, 'Luz Permanente', 'P', 'El personaje invoca una bola de luz que permanece activa e inextinguible, sin poder ser contrarrestada ni apagada.'),
    (11, 'Caminante Galáctico', 'A', 'El personaje se vuelve intangible durante 2 turnos, volviéndose inmune a los ataques y habilidades de los enemigos. Durante este estado, solo puede desplazarse y no puede realizar ninguna otra acción.'),
    (11, 'Parálisis mental', 'A', 'el personaje perturba la mente del enemigo dejándolo incapacitado durante el próximo turno, tiene una bonificación de +6 a la tirada'),
    (11, 'Lunático', 'A', 'El personaje aumenta su modificador de Sabiduría en +2 y su Inteligencia en +3 mientras haya luz de luna presente.'),
    (11, 'Fuente Curativa de las Estrellas', 'A', 'El personaje convoca la luz de las estrellas para curar a uno o varios aliados, restaurando 1d10 puntos de vida más el modificador de Sabiduría. El rango de alcance de la curación se determina con 1d6 más el modificador de Inteligencia del personaje, teniendo el epicentro en el personaje mismo y curando a todos los aliados dentro del rango de alcance.'),
    (12, 'Eclipse', 'A', 'El personaje aumenta la oscuridad y la nocturnidad durante el día.'),
    (12, 'Cantos de las Estrellas', 'A', 'El personaje entona cánticos místicos que inspiran calma y valentía a los compañeros, curando todos los estados negativos que sufran los aliados dentro de su rango de alcance.'),
    (12, 'Aurora Curativa', 'A', 'El personaje sana a un objetivo dentro de su rango de alcance, restaurando 1d20 puntos de vida más el modificador de sabiduría del personaje.'),
    (12, 'Energía Lunar', 'A', 'El personaje canaliza la energía de la luna para curar a todos los aliados, independientemente de su distancia, restaurando 1d12 puntos de vida más el modificador de Sabiduría. Esta habilidad solo puede usarse si la luna está visible en el campo de batalla o durante un eclipse.'),
    (12, 'Hechizar personas en masas', 'A', 'El personaje puede controlar mentalmente a todos los enemigo humanoide de menor nivel dentro de su rango de alcance, sometiéndolo a su voluntad durante un periodo de tiempo determinado.'),
    (12, 'Aegis Agnóstica', 'A', 'El personaje manifiesta un escudo etéreo que envuelve a sí mismo y a todos los aliados dentro de su rango de alcance. Este escudo bloquea por completo el próximo ataque de naturaleza sagrada, anulando sus efectos tanto de control como de daño. La protección de la Aegis dura únicamente una ronda antes de desvanecerse.'),
    (15, 'Vínculo de Alivio', 'P', 'El personaje puede compartir el daño recibido con un compañero a la mitad de manera bidireccional, permitiendo que ambos se protejan mutuamente. La efectividad del vínculo se incrementa con el modificador de Constitución de ambos personajes.'),
    (15, 'Cauterización Astronómica', 'P', 'El personaje regenera de manera pasiva 3 puntos de vida por turno durante todo el combate, sumando el modificador de Sabiduría del personaje a la regeneración.'),
    (15, 'Comprensión Universal', 'P', 'El personaje conoce todas las lenguas vivas y además aumenta su modificador de Inteligencia en +1.'),
    (15, 'Maestro Polígloto', 'P', 'El personaje vincula su mente con la de un aliado, permitiéndole enseñarle una lengua que conoce.'),
    (15, 'Cristalizar', 'A', 'El personaje se congela en un bloque de hielo, manteniendo su cuerpo en un estado sólido mientras conserva el control sobre sus invocaciones. El bloque de hielo tiene la mitad de la vida del invocador y una Clase de Armadura (CA) de 19. Durante este estado, el personaje está inmóvil y no puede actuar directamente. Esta habilidad se puede usar una vez por combate.'),
    (15, 'Invisibilidad en Grupo', 'A', 'El personaje puede volver invisible a todo el grupo, haciendo que todos los miembros se vuelvan indetectables para los demás.'),
    (15, 'Restauradora del Cosmos', 'A', 'El personaje aumenta temporalmente su capacidad de curación en +1 por cada compañero o aliado que haya curado durante el combate de manera acumulable. Este aumento se mantiene hasta el final del combate.'),
    (18, 'Última Voluntad', 'A', 'El personaje puede levantar un cuerpo espectral de un compañero o aliado fallecido durante el combate para darle una segunda oportunidad. Esta habilidad solo puede usarse una vez por combate y el cuerpo espectral no puede recibir daño físico.'),
    (20, 'Lluvia de Meteoritos', 'A', 'El personaje crea una lluvia de meteoritos que impacta en un área de 36 casillas. Primero lanza 1d8 más el modificador de Sabiduría para determinar cuántos meteoritos caen. Luego, lanza 1d12 más el modificador de Inteligencia por cada meteorito, causando daño a los todos los que se encuentren en el área de efecto.')
  ) AS a(level, name, action, description)
WHERE c.name = 'Místico';

-- Monje
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Monje', 'Legal, neutral/legal, neutral', 1, 'Ligera',
  'Sólo puede usar armas de puño. Sin escudo: (El personaje no puede equipar ningún tipo de escudo)',
  '11 Destreza, 11 Sabiduría, 11 Constitución', 'Ninguno',
  ARRAY['Aviroide', 'Elfo', 'Elfo Oscuro', 'Humano', 'Semielfo', 'Semiorco']::text[],
  3, 2, 3, 1, 1,
  '{"Destreza":11,"Sabiduría":11,"Constitución":11}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Monje');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Monje');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,2000),(3,4000),(4,8000),(5,16000),(6,32000),(7,64000),(8,128000),(9,256000),(10,512000),(11,612000),(12,712000),(13,812000),(14,912000),(15,1012000),(16,1112000),(17,1212000),(18,1312000),(19,1412000),(20,1512000)) AS x(level, xp)
WHERE c.name = 'Monje';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Monje');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Carga de Chi', 'A', 'El personaje permanece inmóvil durante un turno para canalizar su energía, en el próximo ataque con éxito el daño será crítico.'),
    (0, 'Reflejos de combate', 'P', 'El personaje incrementa su modificador de destreza en +2 y reduce en 2 puntos el daño que recibe.'),
    (0, 'Toque Secreto de Jade', 'A', 'El personaje realiza un ataque que, en lugar de causar daño, inmoviliza al enemigo. Esta habilidad solo funciona contra humanoides de nivel igual o inferior al del personaje.'),
    (0, 'Resistencia a Control Mental', 'P', 'El personaje obtiene una bonificación de +3 a la tirada de salvación cuando intenta resistir cualquier tipo de control mental o influencia psíquica.'),
    (0, 'Ataque a Mano Desnuda', 'P', 'Cuando el personaje realiza un ataque sin armas, inflige 2d4 puntos de daño.'),
    (2, 'Instinto Veloz', 'P', 'El personaje puede atrapar flechas u otros proyectiles físicos disparados hacia él o cerca de su posición. Fuera de su turno, debe tirar 1d20; si la tirada iguala o supera el 12, podrá atrapar el proyectil. Esta habilidad no funciona con grandes proyectiles.'),
    (2, 'Experto en Armas de Puños', 'P', 'El personaje tiene una bonificación de +2 a la destreza y de +2 de daño cuando utiliza armas de puños'),
    (3, 'Detectar mal', 'P', 'el personaje puede detectar si un objeto o lugar contiene magia oscura, infernal o maldita.'),
    (3, 'Expulsar Espíritus', 'A', 'El personaje puede expulsar espíritus malditos de lugares u objetos, liberando el área o el objeto de su influencia sobrenatural.'),
    (3, 'Detectar Magia', 'P', 'el personaje puede detectar si un objeto o lugar contiene magia.'),
    (5, 'Instrucción en armas de asta', 'P', 'El personaje recibe una bonificación de +2 a su modificador de destreza y un incremento de +1 al daño cuando utiliza armas de asta sin filo.'),
    (5, 'Protección contra el Mal', 'A', 'Aumenta tu C.A. del personaje en -2 contra magias oscuras o infernales.'),
    (5, 'Resistencia a las Temperaturas', 'P', 'El personaje obtiene una bonificación de +2 en las tiradas de salvación relacionadas con temperaturas extremas'),
    (5, 'Puño de Hierro', 'P', 'Cada vez que el personaje acierta un golpe, el daño infligido se incrementa con el modificador de Fuerza, pero además del modificador de Destreza.'),
    (7, 'Toque Restaurador', 'A', 'El personaje sana 1d4 puntos de vida a sí mismo, sumando su modificador de Sabiduría'),
    (8, 'Golpe Celestial', 'P', 'Cuando el personaje realiza un ataque sin armas, inflige 2d6 puntos de daño.'),
    (8, 'Toque de Renovación', 'A', 'El personaje sana 1d6 puntos de vida a sí mismo, sumando su modificador de Sabiduría.'),
    (8, 'Reflejos Relámpago', 'P', 'Aumenta la capacidad del personaje para esquivar ataques, otorgando una bonificación de -2 al CA siempre que el personaje no esté usando armadura o cuando el personaje esté usando armadura ligera.'),
    (10, 'Disciplina', 'A', 'El personaje puede curarse a sí mismo de un estado negativo'),
    (10, 'Conocer alineamiento', 'P', 'el personaje puede discernir el alineamiento moral de una persona, revelando si son legales, neutrales o caóticos'),
    (10, 'Toque Paralizante', 'P', 'El personaje realiza un ataque a todos los enemigos frente a él. En lugar de infligir daño, inmoviliza a los enemigos. Se suma un +3 a la tirada de acierto para este ataque.'),
    (12, 'Golpes sagrados', 'P', 'Cuando el personaje realiza un ataque sin armas, inflige 2d8 puntos de daño.'),
    (12, 'Experto en combate Mano a Mano', 'P', 'El personaje recibe un aumento de +2 a su Destreza cuando pelea usando los puños o armas de mano'),
    (13, 'Curar Enfermedades', 'A', 'El personaje puede sanar cualquier tipo de enfermedad que afecte a un objetivo.'),
    (13, 'Quitar Maldiciones', 'A', 'El personaje elimina todas maldiciones de un objetivo dentro de su rango de alcance'),
    (13, 'Golpe Divino', 'A', 'El personaje realiza un daño adicional de +2 en sagrado después de acertar un ataque, más el modificador de sabiduría.'),
    (15, 'Aplomo Inquebrantable', 'P', 'El personaje mantiene una estabilidad inquebrantable en combate, siendo inmune a ser derribado y en caso de ser empujado, el personaje se moverá donde desee'),
    (15, 'Habilidad Acrobática', 'P', 'El personaje recibe una bonificación de +1 a la destreza para esquivar y además puede utilizar la habilidad de Saltar y Trepar.'),
    (15, 'Detectar Mentiras', 'P', 'El personaje recibe una bonificación de +5 a la tirada de Carisma cuando intenta discernir si alguien está mintiendo o engañándolo'),
    (15, 'Neutralizar Venenos', 'A', 'El personaje elimina un efecto de envenenamiento en un objetivo'),
    (17, 'Misionero', 'A', 'modifica el alineamiento caótico, caótico/neutral de un objetivo con igual o menor nivel que el personaje'),
    (18, 'Protección Divina Contra el Mal', 'A', 'El personaje aumenta su C.A. contra magias oscuras o infernales en -3'),
    (18, 'Más Puños Divinos', 'P', 'El personaje aumenta el daño de las manos descubiertas a 2d10 más el modificador de Sabiduría, Destreza y Fuerza.'),
    (18, 'Patada Giratoria', 'A', 'El personaje ejecuta un movimiento circular que golpea a todos los enemigos adyacentes a hasta dos casillas de distancia. Este ataque inflige 2d10 de daño, más el modificador de Fuerza y el modificador de Destreza.'),
    (20, 'Furia Divina con Armas de Puños', 'P', 'La habilidad "Más Puños Divinos" ahora puede usarse con armas de puños, aumentando el daño de estas armas al 2d10.'),
    (20, 'Mis Manos Son un Arma Letal', 'A', 'El personaje puede romper la Clase de Armadura (C.A.) de cualquier objetivo con sus ataques'),
    (20, 'Alcanzar el Nirvana', 'A', 'Una vez por combate, el personaje se queda estático durante un turno para recuperar toda la vida y eliminar estados negativos')
  ) AS a(level, name, action, description)
WHERE c.name = 'Monje';

-- Nigromante
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Nigromante', 'Caótico, caótico/neutral', 6, 'Ligera',
  'No puede usar armas pesadas. Sin escudo: (El personaje no puede equipar ningún tipo de escudo)',
  '14 Inteligencia, 14 Carisma, 9 Sabiduría', 'El Necronomicón, Filacteria, Bastón o Báculo',
  ARRAY['Gnomo', 'Goblin', 'Humano', 'Renegado', 'Semielfo', 'Semiorco']::text[],
  2, 2, 4, 1, 1,
  '{"Inteligencia":14,"Carisma":14,"Sabiduría":9}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Nigromante');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Nigromante');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,600),(3,660),(4,666),(5,6000),(6,6600),(7,6660),(8,6666),(9,60000),(10,66000),(11,66600),(12,66660),(13,66666),(14,600000),(15,660000),(16,666000),(17,666600),(18,666660),(19,666666),(20,6666666)) AS x(level, xp)
WHERE c.name = 'Nigromante';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Nigromante');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Cercano a lo Impío', 'P', 'El personaje recibe una penalización de +3 al daño recibido de ataques de magia sagrada.'),
    (0, 'Resistencia ante la Magia', 'P', 'El personaje recibe una reducción de -2 en el daño recibido de cualquier tipo de magia, exceptuando la Magia Sagrada.'),
    (0, 'Destreza del Hechicero', 'P', 'El personaje obtiene una bonificación de +3 a la Destreza para acertar hechizos del personaje'),
    (0, 'Resistencia Absoluta al Hambre y Sueño', 'P', 'El personaje no sufre los efectos de la necesidad de comer, beber o dormir.'),
    (0, 'Penalización a la Luz Solar', 'P', 'El personaje recibe una penalización de -1 en cualquier tirada realizada en plena luz del día.'),
    (0, 'Ver entre las Sombras', 'P', 'El personaje tiene la capacidad de detectar el camuflaje y el sigilo de los enemigos'),
    (0, 'Premonición', 'A', 'El personaje puede realizar adivinación mediante las vísceras para prever cualquier acontecimiento fuera de combate, obteniendo una bonificación en la tirada basado en su modificador de sabiduría.'),
    (0, 'Longevidad', 'P', 'El personaje no muere debido al paso del tiempo.'),
    (0, 'Canibalismo', 'A', 'Al alimentarse el personaje de un cadáver o ingerir una parte significativa de un humanoide, restaura 1d8 puntos de vida mas su modificador de Sabiduría'),
    (0, 'Infravisión', 'P', 'El personaje puede ver en la oscuridad y en condiciones de poca luz, aumentando su rango de visión en 3 casillas adicionales.'),
    (5, 'Alzar Muertos', 'A', 'El personaje puede reanimar cadáveres presentes en el terreno, transformándolos en zombis bajo su control. Para determinar cuántos se levantan, tira 1D100 y alza un número de cadáveres equivalente al porcentaje obtenido de todos aquellos humanoides fallecidos que estén dentro de su rango de alcance. Si no hay cadáveres disponibles, el personaje puede invocar un único zombi.'),
    (5, 'Hablar con Muertos', 'A', 'El personaje puede convocar el espíritu de un fallecido y comunicarse con el caído'),
    (5, 'Leer Mentes', 'A', 'el personaje puede acceder a los pensamientos y emociones del objetivo, revelando sus intenciones y obteniendo respuestas veraces.'),
    (5, 'Miasma', 'A', 'El personaje emana un aura tóxica que envenena a todo ser vivo dentro de su rango de visión, afectando tanto a aliados como a enemigos. Las criaturas envenenadas reciben daño igual al modificador de Inteligencia del personaje al inicio de cada ronda.'),
    (5, 'Pacto Profano', 'A', 'El personaje establece un vínculo oscuro con un aliado, transfiriendo todo el daño que recibe a este aliado en lugar de recibirlo directamente. Este pacto se rompe si uno de los dos personajes vinculados es silenciado, muere, o se encuentra fuera del rango de alcance del personaje.'),
    (5, 'Hechizar Personas', 'A', 'El personaje puede controlar mentalmente a un enemigo humanoide de menor nivel, sometiéndolo a su voluntad durante un periodo de tiempo determinado.'),
    (5, 'Levantar Esqueletos', 'A', 'El personaje puede invocar o reanimar esqueletos. Lanza 1D6 para determinar cuántos se levantan. Si todos los esqueletos invocados son derrotados, el personaje puede realizar una nueva tirada de 1D6 para intentar alzarlos nuevamente.'),
    (5, 'Crear Ilusiones', 'A', 'El personaje puede generar espejismos de objetos, personas o utensilios para engañar a los objetivos'),
    (5, 'Explosión de Cadáveres', 'A', 'El personaje hace que los zombis bajo su control dentro de su rango de alcance estallen, causando daño en un área a todos los enemigos adyacentes al cadáver. El daño infligido es de 1D8 más el bonificador de Inteligencia del personaje.'),
    (5, 'Caminante de Sombras', 'A', 'El personaje se camufla en las sombras, enviando una sombra ilusoria en una dirección para engañar a sus enemigos, esto le otorga un bonificador de +3 a la tirada para engaño'),
    (10, 'Aura de Muerte', 'A', 'En lugares como cementerios o sitios afectados por desastres con muchas muertes, el personaje se fortalece, obteniendo un aumento de +3 al modificador de Inteligencia, +2 a la Destreza y +1 al Carisma.'),
    (10, 'Cadena de nigrománticas', 'P', 'el personaje conecta su vitalidad con la de un enemigo, redirigiendo 25% del daño recibido hacia el enemigo vinculado.'),
    (10, 'Inmortalidad Virtual', 'P', 'El personaje almacena parte de su alma en una Filacteria. Si este muere, puede ser resucitado por terceros mediante métodos de nigromancia, siempre que la filacteria permanezca intacta y accesible.'),
    (10, 'Dominación Oscura', 'P', 'Los seres impíos bajo el control del personaje aumenta su modificador en +2 a su Destreza y +1 a su Fuerza mientras permanezcan bajo su influencia del personaje.'),
    (10, 'Visión de la Muerte', 'P', 'El personaje puede ver a través de los ojos de los no muertos que controla, permitiéndole detectar espíritus o entidades no muertas ocultas o disfrazadas.'),
    (10, 'Escudo Espectral', 'A', 'El personaje puede crea un escudo de energía espectral que bloquea el próximo ataque de daño espiritual dirigido a él o a un aliado.'),
    (10, 'Impío Mejorado', 'P', 'El personaje disminuye el daño adicional recibido de la magia divina, el incremento de daño sagrado que normalmente sería de +3 se reduce a +1.'),
    (10, 'Resistencia Diurna', 'P', 'El personaje ya no sufre la penalización de -1 en cualquier tirada durante plena luz del día.'),
    (10, 'Levantamiento de Esqueletos Mejorado', 'A', 'El personaje invoca esqueletos con mayor efectividad, pudiendo ahora levantar 2D6 esqueletos en lugar de 1D6.'),
    (10, 'Aura de Desesperanza', 'A', 'El personaje emite una aura que reduce en -2 el modificador de Inteligencia de todos los enemigos dentro de su rango de alcance.'),
    (15, 'Robar Alma', 'A', 'El personaje puede robar el alma de un enemigo para tomar control de su cuerpo. El alma del enemigo regresa a su cuerpo original una vez que el efecto termina, a menos que tengan en posesión de una filacteria, en cuyo caso el alma queda almacenada en la filacteria. El enemigo debe tener menos Inteligencia, Carisma y nivel que el personaje para que la habilidad sea efectiva.'),
    (15, 'Hechizar personas en masas', 'A', 'El personaje puede controlar mentalmente a todos los enemigo humanoide de menor nivel dentro de su rango de alcance, sometiéndolo a su voluntad durante un periodo de tiempo determinado.'),
    (15, 'Muro de Huesos', 'A', 'El personaje conjura una barrera de huesos malditos utilizando cadáveres del campo de batalla. Esta barrera de 6 casillas protege al personaje y a sus aliados de ataques físicos y mágicos durante 2 turnos o hasta que sea destruida. El CA del muro es de 19 y la vitalidad del muro es igual a la mitad de la vitalidad combinada de los cadáveres utilizados en su creación.'),
    (15, 'Estallido de Fuerza Oscura', 'A', 'El personaje genera una onda de magia oscura que golpea a un enemigo, infligiendo 1d8 más el modificador de Inteligencia en daño. Además, todos los enemigos impactados por el estallido son empujados una distancia igual al resultado del daño recibido, desplazándolos fuera de la zona afectada.'),
    (15, 'Tránsito Umbrío', 'P', 'El personaje se desvanece en sombras y reaparece en el lugar que desee, sin necesidad de tener visión directa ni estar limitado por su rango de alcance. Esta habilidad también puede utilizarse para teletransportar a los zombis y esqueletos bajo su control, siempre que la zona de destino no esté expuesta directamente a la luz solar.'),
    (15, 'Maldecir', 'A', 'El personaje puede lanzar una maldición sobre un objetivo, disminuyendo todos los modificadores de sus estadísticas en -1.'),
    (15, 'Quitar Maldiciones', 'A', 'El personaje elimina todas maldiciones de un objetivo dentro de su rango de alcance'),
    (15, 'Infundir Miedo', 'A', 'El personaje provoca miedo en un objetivo, mientras el objetivo esté bajo el efecto del miedo, todas las tiradas de acción realizadas contra el objetivo tienen un bonificador de +4.'),
    (15, 'Robar personalidad', 'A', 'El personaje vincula su mente con el del objetivo humanoide, adquiriendo su personalidad e implementándole otro diferente, este objetivo tiene que tener menos carisma que el personaje'),
    (15, 'Corromper Alma', 'A', 'El personaje vincula el alma de un objetivo humanoide al suyo, otorgándole al objetivo poderes básicos de nigromante (nivel 0). A cambio, el objetivo debe obedecer siempre las órdenes del personaje. Esta habilidad también permite al personaje conocer en todo momento la ubicación y las intenciones del objetivo.'),
    (20, 'Invocar Acechador Invisible', 'A', 'El personaje lanza 1D6 para invocar esa cantidad de Acechadores Invisibles que luchan a su favor. Esta habilidad solo puede usarse una vez por combate.'),
    (20, 'Desterrar almas', 'A', 'El personaje realiza un ataque poderoso que destierra a todos los enemigos las almas dentro de su rango de alcance hacia la Isla de Nox. Los seres con nivel menor que el del personaje son trasladados de manera automática. A los enemigos de igual nivel recibe una penalización de -3 en la tirada de acción'),
    (20, 'Robar Almas en Masa', 'A', 'El personaje puede robar las almas de todos los enemigos humanoides dentro de su rango de alcance. Las almas robadas permiten al personaje controlar temporalmente los cuerpos de los enemigos afectados. Si el personaje tiene una filacteria, las almas quedan almacenadas en ella; de lo contrario, las almas regresan a sus cuerpos originales una vez que el efecto termina. Los enemigos deben tener menos Inteligencia, Carisma y nivel que el personaje para que la habilidad sea efectiva.'),
    (20, 'Tormenta de Almas', 'A', 'El personaje puede liberar todas las almas almacenadas de su filacteria para causar una tormenta de energía oscura en un área específica 25 casillas, siendo el epicentro la propia filacteria, infligiendo daño a todos los enemigos dentro de esa área. El daño infligido es igual a 1, mas el modificador de inteligencia, por cada alma almacenada en la filacteria. Tras el uso de la habilidad, las almas se disiparán. A cambio, el personaje guardará su propia alma en la filacteria, permitiendo que pueda renacer en otro cuerpo si su cuerpo actual muere.'),
    (20, 'Drenaje de la Vitalidad', 'A', 'El personaje absorbe la vitalidad de un objetivo, infligiendo 1d20 más el modificador de Inteligencia y Sabiduría en daño. El daño infligido se suma a la vida del personaje. Si la vida del personaje ya está al máximo, el exceso se convierte en un escudo de energía vital que protege al personaje.'),
    (20, 'Nube de Plaga', 'A', 'El personaje invoca una nube tóxica que se extiende por un área de 36 casillas. La nube derrite la carne de todos los personajes dentro de ella, causando 1D10 más el modificador de Inteligencia de daño cada turno. El daño infligido por la nube es irreducible y continúa afectando a los personajes mientras permanezcan dentro de ella.'),
    (20, 'Invocar Abominación', 'A', 'El personaje lanza 1D4 para determinar cuántas abominaciones invoca. Cuando todas las abominaciones invocadas mueren, el personaje puede volver a lanzar 1D4 para invocar nuevas abominaciones.'),
    (20, 'Resistencia No Muerta', 'P', 'El personaje transfiere todo el daño recibido a los esbirros que controla, siempre y cuando al menos uno de ellos esté en pie. Además, el daño transferido se reduce en un 10%.'),
    (20, 'Rayo Necrótico', 'A', 'El personaje lanza un rayo de energía oscura que inflige 1d20 más el modificador de Inteligencia en daño a un objetivo. Además, el daño del rayo se incrementa en +1 por cada alma que el personaje tenga almacenada en la filacteria.'),
    (20, 'Niebla del Olvido', 'A', 'El personaje crea una niebla densa que se extiende por todo su rango de alcance, borrando temporalmente los recuerdos recientes de los enemigos dentro de su área de efecto. Además, la niebla reduce el rango de visión de los enemigos afectados a solo 2 casillas.')
  ) AS a(level, name, action, description)
WHERE c.name = 'Nigromante';

-- Ninja/Kunoichi
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Ninja/Kunoichi', 'Caótico, neutral/caótico, neutral, neutral/legal', 3, 'Ligera',
  'No puede usar armas pesadas. Sin escudo: (El personaje no puede equipar ningún tipo de escudo)',
  '14 Destreza, 10 Sabiduría', 'Shurikens, Indumentaria ninja, Juego de escalada, Cerbatana',
  ARRAY['Aviroide', 'Elfo', 'Elfo Oscuro', 'Felino', 'Gnomo', 'Goblin', 'Humano', 'Renegado', 'Semielfo', 'Semiorco']::text[],
  3, 3, 5, 2, 1,
  '{"Destreza":14,"Sabiduría":10}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Ninja/Kunoichi');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Ninja/Kunoichi');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,2000),(3,3000),(4,6000),(5,11000),(6,21000),(7,41000),(8,81000),(9,161000),(10,281000),(11,401000),(12,521000),(13,641000),(14,761000),(15,881000),(16,1001000),(17,1101000),(18,1251000),(19,1351000),(20,1501000)) AS x(level, xp)
WHERE c.name = 'Ninja/Kunoichi';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Ninja/Kunoichi');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Camuflaje', 'A', 'El personaje se oculta con el entorno, permaneciendo inmóvil mientras utiliza esta habilidad para evitar ser detectada.'),
    (0, 'Localizar objetos', 'A', 'El personaje obtiene una bonificación de +4 en la tirada para detectar objetos'),
    (0, 'Lanzamiento de Shurikens', 'A', 'El personaje lanza Shurikens a un rango de 4 casillas, causando 1d4 de daño más el modificador de Destreza y el modificador de Fuerza.'),
    (0, 'Saltar y Trepar', 'P', 'el personaje puede saltar y trepar tanto por los árboles, muros, murallas, y otros obstáculos, superándolos con facilidad.'),
    (2, 'Sentidos Agudizados', 'P', 'El personaje aumenta el modificador de destreza en +2 solo para esquivar y otorga un bonificador de +1 a la tirada de percepción'),
    (2, 'Puerta Secreta del Shinobi', 'A', 'El personaje tiene la habilidad de encontrar o materializar un acceso secreto para entrar en cualquier recinto, sin importar su nivel de seguridad o barreras físicas.'),
    (2, 'Sigilo', 'A', 'el personaje puede desplazarse entre las sombras sin ser detectado'),
    (2, 'Bomba de Humo', 'A', 'El personaje lanza una bomba que provoca una explosión de humo en un rango de 4 casillas. El humo denso reduce el campo de visión de todos los que se encuentren en el área afectada en 1 casilla.'),
    (4, 'Trueque forzado', 'P', 'El personaje tiene la capacidad de sustraer y reintegrar objetos de sus objetivos sin que estos se percaten de ello. El personaje recibe un +4 a la tirada para realizar esta acción de manera sigilosa y efectiva.'),
    (4, 'Robo con Sutileza', 'P', 'El personaje recibe una bonificación de +6 a las tiradas para realizar robos de manera discreta'),
    (4, 'Gran resistencia al Veneno', 'P', 'El personaje obtiene una bonificación de +5 en las tiradas de salvación contra venenos'),
    (4, 'Venenos y Parálisis', 'P', 'El personaje impregna con venenos y agentes paralizantes sus armas. Cuando acierta un ataque, el objetivo recibe daño adicional de 1 más el modificador de sabiduría del personaje y además puede quedar paralizado.'),
    (7, 'Cometa del Velo de Sombrío', 'A', 'El personaje puede realizar movimientos rápidos y acrobáticos en el aire sin recibir daño por caída. Esta habilidad le permite descender de grandes alturas o realizar maniobras aéreas sin sufrir daños, asegurando un aterrizaje seguro y controlado.'),
    (7, 'Zuecos para el Agua', 'A', 'El personaje puede caminar sobre el agua como si fuera una superficie sólida, permitiéndole moverse con normalidad sin hundirse o nadar.'),
    (7, 'Captar Punto Débil', 'P', 'El personaje obtiene una bonificación de +2 al modificador de Destreza y +1 al daño en sus ataques. Además, sus ataques ignoran la mitad de la Constitución del enemigo.'),
    (7, 'Sabotaje', 'P', 'El personaje recibe un bonificador de +4 a la tirada cuando intenta desactivar, destruir o inutilizar mecanismos, estructuras o dispositivos.'),
    (10, 'Asesinato', 'A', 'El personaje puede rematar a un enemigo que tenga el 10% o menos de su vida máxima.'),
    (10, 'Experto en Combate Cuerpo a Cuerpo', 'P', 'El personaje aumenta en +1 tanto el bonificador de destreza como el daño en combates cuerpo a cuerpo'),
    (10, 'Explotar debilidad', 'A', 'el personaje ignora la constitución del enemigo'),
    (10, 'Escalar', 'P', 'Permite al personaje subir y descender superficies verticales con agilidad, facilitando el acceso a lugares elevados o difíciles de alcanzar, sin necesidad de accesorios'),
    (10, 'Esconderse en las Sombras', 'A', 'El personaje puede esfumar en mitad de un combate para evadirlo, obteniendo una bonificación de +5 a la tirada de destrabe. Luego, puede entrar en sigilo para evitar ser detectado.'),
    (10, 'Salto de la Niebla', 'P', 'El personaje puede saltar a un rango de 6 casillas de manera gratuita una vez por ronda.'),
    (10, 'Toxina del Loto', 'P', 'Los venenos aplicados por este personaje no pueden ser salvados ni mitigados mediante tiradas de salvación, resistencias o habilidades pasivas. Sus efectos solo pueden ser detenidos o eliminados mediante remedios externos'),
    (10, 'Sinapsis Ponzoñosa', 'P', 'Por cada enemigo envenenado por el personaje, su modificador de Sabiduría aumenta en +1 únicamente para los daños de venenos y tóxicos.'),
    (10, 'Tormenta de Shurikens', 'A', 'El personaje lanza shurikens a todos los enemigos en un rango de 3 casillas. Cada objetivo impactado recibe 1D4 más el modificador de Fuerza , además se le aplica los efectos de veneno.'),
    (10, 'Paso Silencioso', 'P', 'El personaje realiza todas sus acciones sin emitir ningún tipo de sonido.'),
    (12, 'Dardos Aturdidores', 'A', 'El personaje lanza dardos que afectan a todos los enemigos dentro de un rango de 4 casillas. Cada dardo inflige 2D6 más el modificador de Fuerza en daño y tiene la capacidad de inutilizar temporalmente a los enemigos afectados'),
    (12, 'Esprintar', 'P', 'El personaje aumenta su alcance de movimiento de combate en 3 casillas más.'),
    (12, 'Bonificación en Oscuridad', 'P', 'El personaje recibe un bonificador de +1 a todas las tiradas realizadas en condiciones de oscuridad o nocturnidad'),
    (12, 'Técnica de Clon', 'A', 'El personaje crea entre 1 y 4 clones ilusorios que imitan perfectamente sus movimientos. Aunque los clones no infligen daño, sirven para confundir a los enemigos y desviar ataques.'),
    (14, 'Experto en Armas de Daga y Puñales', 'P', 'El personaje recibe una bonificación de +1 al modificador de Destreza y al daño al usar Dagas, Puñales, Falcatas y Sais'),
    (14, 'Venenos Letales', 'A', 'Los venenos aplicados a las armas del personaje infligen un daño incrementado en +3, más el modificador de sabiduría y destreza. Los enemigos afectados sufren efectos tóxicos más graves.'),
    (14, 'Engaño Nocturno', 'P', 'Las tiradas para engañar en entornos nocturnos o con poca luz reciben una bonificación de +4.'),
    (14, 'Aprovechar Debilidades', 'P', 'El personaje recibe un bonificador de +2 a la tirada de Destreza y +3 al daño contra enemigos que estén envenenados o paralizados.'),
    (17, 'Multiplicarse', 'A', 'El personaje crea 1d6 clones ilusorios que replican exactamente sus acciones y ataques. Pero esta vez, cada clon realiza el mismo daño al mismo objetivo que el personaje original, no obstante cada uno tiene solo 1 punto de vida.'),
    (17, 'Gas Paralizante', 'A', 'El personaje lanza una bomba de humo que se extiende por un rango de alcance de 4 casillas, reduciendo la visión de todos los personajes dentro del rango a solo 1 casilla. Además, todos los personajes afectados por el gas quedan automáticamente paralizados, incapaces de moverse o actuar durante un turno.'),
    (17, 'Incremento Letal', 'P', 'Todos los ataques del personaje están imbuidos con potentes venenos. Cada vez que el personaje inflige daño con un ataque, el efecto del veneno se acumula, aumentando el daño adicional causado por el veneno en cada ataque sucesivo. Este efecto de acumulación desaparece al finalizar el combate'),
    (17, 'Toxicidad', 'P', 'Aumenta en +3 el modificador de Sabiduría del personaje específicamente para efectos relacionados con tóxicos y venenos, mejorando su capacidad para resistir, aplicar y comprender venenos y toxinas.'),
    (20, 'Crítico Triplicado', 'P', 'El personaje realizará un golpe crítico con una tirada natural de 18 o más. Cuando se realiza el daño en un golpe crítico, el daño se triplica en vez de duplicarse.')
  ) AS a(level, name, action, description)
WHERE c.name = 'Ninja/Kunoichi';

-- Nómada del Desierto
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Nómada del Desierto', 'Cualquiera', 1, 'Ligera',
  'Puede usar todas las armas. Escudo Ligero: (El personaje está limitado a utilizar únicamente una rodela como escudo)',
  '10 Destreza, 10 constitución', 'Montura, Kit de Acampada del desierto',
  ARRAY['Elfo', 'Gnomo', 'Goblin', 'Humano', 'Renegado', 'Reptiliano', 'Semielfo', 'Semiorco']::text[],
  4, 4, 2, 1, 1,
  '{"Destreza":10,"Constitución":10}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Nómada del Desierto');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Nómada del Desierto');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,2000),(3,4000),(4,8000),(5,16000),(6,32000),(7,65000),(8,120000),(9,240000),(10,360000),(11,880000),(12,990000),(13,1110000),(14,1220000),(15,1440000),(16,1550000),(17,1770000),(18,1880000),(19,1990000),(20,2000000)) AS x(level, xp)
WHERE c.name = 'Nómada del Desierto';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Nómada del Desierto');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Aliento del Desierto', 'P', 'El personaje, ante climas extremos tiene +2 a la constitución y +1 a la destreza, además cuando está en clima templado +2 a la destreza y +1 a la constitución'),
    (0, 'Aversión a las ciudades y la tecnología', 'P', 'el personaje siente rechazo por las grandes ciudades y por la tecnología'),
    (0, 'Montura de las Dunas', 'P', 'El personaje viene equipado con un camello o un dromedario'),
    (0, 'Arma Abrasadora', 'A', 'El personaje infunde su arma con energía térmica, haciendo que el arma emita calor y un brillo intenso. Esto aumenta el daño infligido en +1 por fuego elemental y reduce las tiradas de salvación por calor extremo de los enemigos que estén adyacentes.'),
    (0, 'Inmunidad a Temperaturas Altas', 'P', 'El personaje es completamente inmune a los efectos adversos causados por temperaturas extremas de calor'),
    (0, 'Bravo Jinete', 'P', 'Cuando realiza un ataque sobre su montura y el personaje aun le quede movimiento, una vez realizado el ataque puedes destrabarte del combate y gastar el resto del movimiento'),
    (0, 'Evasión ágil', 'P', 'El personaje tiene una bonificación de +5 a la tirada para poder destrabarse del combate'),
    (0, 'Engaño Lingüístico', 'P', 'El personaje usa su habilidad para cambiar de idioma en situaciones estratégicas, engañando o confundiendo a otros. Obtiene un bonificador de +5 a las tiradas de engaño y manipulación relacionadas con el uso del lenguaje.'),
    (0, 'Orientación desértica', 'P', 'El personaje tiene un sentido agudo de la orientación en entornos desérticos, facilitando la navegación y evitando perderse, del mismo modo que conoce donde se hallan oasis'),
    (0, 'Senda Segura', 'P', 'El personaje puede identificar zonas de arena inestable antes de caminar sobre ellas, evitando hundirse o sufrir accidentes. Además, es capaz de analizar la zona para encontrar la forma más segura de atravesarla y enseñar a sus compañeros a hacerlo'),
    (3, 'Resistencia al Hambre y la Sed', 'P', 'El personaje recibe una bonificación de +5 en la tirada de salvación para resistir los efectos negativos de la falta de comida o agua.'),
    (3, 'Equitación', 'P', 'Cuando el personaje se encuentra montado, su movimiento base aumenta en +3 y su movimiento en combate se incrementa en +6, además de la movilidad correspondiente a su clase.'),
    (3, 'Desenfoque de Atención', 'P', 'El personaje puede ignorar al enemigo con el que está enzarzado en combate, permitiéndole atacar a otros rivales, incluso a distancia, mientras sigue en cuerpo a cuerpo con el adversario original.'),
    (3, 'Caza y Rastreo en el Desierto', 'P', 'El personaje tiene una habilidad para rastrear y cazar en terrenos desérticos. Recibe un bonificador de +3 a todas las tiradas relacionadas con caza y rastreo en estos entornos.'),
    (5, 'Encontrar refugio', 'A', 'el personaje localiza un refugio para el grupo de manera eficiente'),
    (8, 'Combate en Altas Temperaturas', 'P', 'El personaje recibe un bonificador de +2 al modificador de Destreza y +2 al modificador de Fuerza, en situaciones y lugares de extremas de calor.'),
    (8, 'Cartógrafo', 'P', 'el personaje puede leer mapas y los cuerpos celestes para orientarse'),
    (10, 'Experto en Armas Curvas', 'P', 'El personaje obtiene un bonificador de +2 al modificador de Destreza al usar armas curvas.'),
    (10, 'Camino de Espejismos', 'A', 'el personaje puede crear ilusiones de espejismos para confundir a los enemigos y desviar su atención, dando un -3 a las tiradas de ataque de los enemigos.'),
    (10, 'Refrescamiento Instantáneo', 'A', 'el personaje puede crear una burbuja de aire fresco alrededor de sí mismo y sus aliados en el desierto, eliminando la penalización por calor y la deshidratación mientras dure la burbuja'),
    (10, 'Cáliz Arenoso', 'A', 'El personaje puede alterar el terreno en un rango de 10 casillas, convirtiéndolo en un área arenosa mágica y abrasadora. Esta habilidad dificulta el movimiento de los enemigos, aplicando -2 a sus tiradas de esquivar los ataques y -3 a su velocidad de movimiento. La transformación dura 3 turnos y puede usarse una vez cada 5 turnos.'),
    (10, 'Maldición del desierto', 'A', 'El personaje inflige una maldición que aumenta el daño recibido por ataques de fuego en +3 durante 5 turnos y reduce el movimiento del maldito en -1'),
    (13, 'Infatigable', 'P', 'El personaje no necesita descansar después de realizar una carrera o cualquier acción que requiera fuerza y resistencia extraordinarias'),
    (13, 'Agilidad del Nómada', 'P', 'El personaje obtiene una bonificación de +3 al modificador de Destreza cuando usa armaduras ligeras. Además, si el enemigo tiene mayor Constitución que el personaje, su daño aumenta en +3.'),
    (13, 'Camuflaje Polvoriento', 'A', 'el personaje se oculta con el entorno del desierto, permaneciendo inmóvil mientras utiliza esta habilidad para evitar ser detectada.'),
    (13, 'Surcador de Caravanas', 'P', 'El personaje incrementa su velocidad de desplazamiento en arenas, desierto y dunas, otorgando un bonificador de +3 al movimiento de los compañeros que viajen en monturas, carromatos o transportes terrestres, y un +5 de movimiento a su propia montura.'),
    (15, 'Intuición para las tormentas', 'P', 'el personaje prevé una tormenta de arena a tiempo para buscar un refugio, aumenta todos sus movimientos en +2'),
    (18, 'Caminante de las Arenas', 'P', 'El personaje puede moverse, camuflarse, atacar y desplazarse en sigilo en medio de una tormenta de arena sin sufrir ninguna penalización. Además, obtiene una bonificación de +2 al modificador de Destreza y +1 al daño mientras combate en este tipo de condiciones.'),
    (18, 'Avatar de la Tormenta Ardiente', 'A', 'El personaje puede invocar tormentas de arena a su alrededor. Mientras la tormenta esté activa y haya sido invocada por el personaje, este obtiene un bonificador de +2 en todas sus tiradas dentro de la tormenta, la tormenta de arena ocupa todo el campo de batalla'),
    (20, 'Deseo de Djinn', 'A', 'El personaje tiene la capacidad de invocar un Djinn a voluntad. La primera vez que lo invoque, el Djinn concederá un deseo sin malinterpretación ni consecuencias negativas. A partir de la segunda invocación, el Djinn servirá como un siervo poderoso del personaje, obedeciendo sus órdenes, pero sin la capacidad de conceder más deseos, cuando el Djinn es derrotado, puede volver a ser invocado en el próximo combate')
  ) AS a(level, name, action, description)
WHERE c.name = 'Nómada del Desierto';

-- Paladín
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Paladín', 'Legal, neutral/legal', 5, 'Ligera / Media / Pesada',
  'Puede usar todas las armas (Exceptuando las armas a distancia) Puede usar todos los escudos.',
  '12 Fuerza, 10 Carisma, 10 Sabiduría', 'Símbolo sagrado',
  ARRAY['Aviroide', 'Humano', 'Jotun', 'Orco', 'Reptiliano', 'Semielfo', 'Semiorco', 'Troloide']::text[],
  5, 3, 5, 5, 3,
  '{"Fuerza":12,"Carisma":10,"Sabiduría":10}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Paladín');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Paladín');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,2000),(3,5000),(4,10000),(5,20000),(6,45000),(7,90000),(8,170000),(9,350000),(10,550000),(11,800000),(12,1000000),(13,1200000),(14,1400000),(15,1650000),(16,1800000),(17,2000000),(18,2200000),(19,2500000),(20,3000000)) AS x(level, xp)
WHERE c.name = 'Paladín';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Paladín');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Curar Almas', 'A', 'El personaje puede eliminar la corrupción o maldiciones espirituales de las almas'),
    (0, 'Detectar mal', 'P', 'el personaje puede detectar si un objeto o lugar contiene magia oscura, infernal o maldita.'),
    (0, 'Disciplina del Caballero', 'P', 'El personaje duplica el modificador de sabiduría en tiradas de salvación.'),
    (0, 'Tributo', 'P', 'El personaje está obligado a ceder el 10% de sus ganancias a la Orden de Paladines'),
    (0, 'Rectitud', 'P', 'El personaje no tolera acciones caóticas ni perversas. Su moral inquebrantable y firme sentido del deber lo impulsan a mantener el orden y la bondad en todo momento.'),
    (0, 'Alma Bondadosa', 'P', 'El personaje, movido por su generosidad y sentido de comunidad, debe cede un 10% de sus beneficios al gremio al que pertenece.'),
    (0, 'Hablar con Muertos', 'A', 'El personaje puede convocar el espíritu de un fallecido y comunicarse con el caído'),
    (0, 'Filo del Alba', 'A', 'El personaje materializa un arma hecha de luz divina que inflige 1d6 más el modificador de Sabiduría como daño sagrado'),
    (1, 'Esfera de luz sagrada', 'A', 'el personaje envuelve todo el campo en una luz que cura a los aliados 1 punto pasivo cada turno y daña 1 punto de sagrado a todos los enemigos'),
    (1, 'Aura Resplandeciente', 'A', 'El personaje emite un halo de luz que elimina todos los efectos de reducción de visibilidad en un radio de 3 casillas.'),
    (2, 'Escudo Sagrado', 'A', 'El personaje imbuye su escudo con poder divino. Esta habilidad otorga un aumento en la Clase de Armadura (C.A.) en -2 durante el próximo ataque que reciba.'),
    (2, 'Purificar Agua y Alimentos', 'P', 'el personaje limpia y purifica agua y alimentos, eliminando cualquier tipo de contaminación, impurezas, o maldiciones que puedan estar presentes.'),
    (3, 'Martillo de Justicia', 'P', 'El personaje obtiene +1 al modificador de Destreza y Fuerza con armas sin filo, e inflige +1 de daño sagrado adicional más el modificador de Sabiduría.'),
    (3, 'Escudo de Fe', 'A', 'El personaje materializa un escudo hecho de luz sagrada que concede un -1 al CA y frente a ataques de origen impíos, oscuros o demoníacos, la protección aumenta a -2 en el CA.'),
    (4, 'Provocar', 'A', 'El personaje llama la atención de un enemigo dentro de su rango de alcance, forzándolo a redirigir sus ataques hacia él.'),
    (4, 'Proyectil de Rayo Sagrado', 'A', 'El personaje ataca lanzando un rayo de energía sagrada que inflige 1d10 más el modificador de sabiduría en daño sagrado. El proyectil tiene un rango de 4 casillas.'),
    (5, 'Golpe Luminoso', 'P', 'El personaje incrementa el daño de cada ataque en +2 de sagrado en vez de +1, más el modificador de Sabiduría.'),
    (5, 'Regeneración', 'P', 'El personaje recupera de manera pasiva 2 puntos de daño más el modificador de Sabiduría al final de cada turno.'),
    (6, 'Transcender Espíritus', 'A', 'El personaje rescata el alma de cualquier objetivo y la devuelve a su cuerpo, ya sea que esté almacenada en objetos malditos, filacterias o un plano independiente.'),
    (6, 'Protector', 'P', 'El personaje se interpone ante proyectiles y ataques mágicos dirigidos a sus aliados, siempre que esté a un máximo de 3 casillas de distancia. Aumenta su Constitución en +2 al recibir el golpe en lugar del aliado.'),
    (7, 'Llamada del Honor', 'P', 'Ante cualquier amenaza que ponga en peligro a un compañero, el personaje está obligado a intervenir.'),
    (7, 'Defensor', 'P', 'Cuando un aliado a un máximo de 3 casillas recibe un ataque cuerpo a cuerpo, el personaje puede interponerse, desplazando al aliado detrás del personaje y recibiendo el golpe en su lugar. Al hacerlo, su Constitución aumenta en +2 durante ese impacto.'),
    (8, 'Fe Inquebrantable', 'P', 'El personaje es inmune al control mental y es imposible cambiar su alineamiento.'),
    (8, 'Ánimas Sagradas', 'A', 'Invoca 4 ánimas sagradas que giran en torno al personaje. Cada ánima inflige 4 puntos de daño a cada enemigo adyacente al personaje más el modificador de Sabiduría, y cura 4 puntos de vitalidad a cada aliado adyacente más el modificador de Sabiduría.'),
    (9, 'Fuerza Divina', 'P', 'El personaje obtiene un aumento de +2 en el modificador de Fuerza, +1 en el modificador de Sabiduría y +1 en el modificador de Constitución.'),
    (9, 'Espada de Justicia', 'P', 'El personaje obtiene +1 al modificador de Destreza y Fuerza con armas con filo, e inflige +1 de daño sagrado adicional más el modificador de Sabiduría.'),
    (10, 'Escudo en Área', 'A', 'El personaje invoca escudos de luz que protegen a 5 aliados, aumentando su Clase de Armadura (C.A.) en -2 durante el próximo ataque que reciban.'),
    (10, 'Maniobra del Justo', 'P', 'El personaje aumenta el modificador de Destreza en +2 y el de Carisma en +3.'),
    (11, 'Aguante Sobrehumano', 'P', 'El personaje obtiene una bonificación en el modificador de +2 a su Constitución durante el combate, además, cuando enfrenta ataques infernales, oscuros, malditos o similares, su modificador de constitución aumenta en +4 contra esos tipos de daños'),
    (11, 'Halo Radiante', 'A', 'El personaje invoca 6 ánimas sagradas que giran a su alrededor. Cada ánima inflige 6 puntos de daño sagrado mas el modificador de Sabiduría a todos los enemigos adyacentes y cura 6 puntos de vitalidad más el modificador de Sabiduría a cada aliado adyacente al final de cada ronda. Esta habilidad sustituye a Ánimas Sagradas.'),
    (12, 'Imposición de Manos', 'A', 'Sana el 50% de las heridas del personaje o de cualquier aliado, y puede usarse solo una vez por combate.'),
    (12, 'Impacto restaurador', 'A', 'El personaje puede realizar un ataque y en el mismo turno, curarse 1d10 puntos de vida, más el modificador de sabiduría.'),
    (13, 'Claridad en la Batalla', 'P', 'El personaje aumenta temporalmente su modificador de Sabiduría en +1 por cada enemigo de alineación Caótica o Neutra/Caótica que derrote durante el combate.'),
    (13, 'Purificación', 'A', 'El personaje elimina todas las maldiciones y efectos negativos de origen oscuro o demoníaco de un aliado o de sí mismo'),
    (14, 'Restablecimiento', 'A', 'El personaje restaura instantáneamente toda su vitalidad. Esta habilidad puede usarse solo una vez por combate.'),
    (14, 'Aura Imponente', 'P', 'El personaje incrementa su modificador de Carisma en +2 cuando intenta intimidar o asustar a entidades infernales, espirituales o malditas, o cuando se enfrenta a ellas.'),
    (15, 'Liderato', 'P', 'El personaje puede tener un aprendiz o escudero que se encargue de las funciones triviales y le asista en los combates'),
    (15, 'Rayo Sagrado', 'A', 'El personaje lanza un rayo de luz divina que se extiende a lo largo de cuatro casillas, este rayo inflige daño sagrado de 1d12 más el modificador de sabiduría a todos los enemigos en su trayectoria y, al mismo tiempo, sana a todos los aliados afectados con la misma cantidad de puntos.'),
    (16, 'Sentencia Consagrada', 'A', 'El siguiente ataque del personaje duplica su modificador de Sabiduría y Fuerza al golpear a un ser infernal, impío o espiritual.'),
    (16, 'Revitalización en el Fragor', 'P', 'Cada vez que el personaje recibe daño, sana un 20% del daño recibido, con un máximo de 20 puntos de vida restaurados por golpe.'),
    (17, 'Último Esfuerzo', 'P', 'Ante un ataque mortal, el personaje puede anticiparse y realizar un movimiento de carrera de manera gratuita. Esta habilidad se puede usar una vez por ronda fuera de su turno, y después de usarla, el personaje estará fatigado.'),
    (17, 'Tormenta de Refulgencia', 'A', 'El personaje invoca una lluvia de luz sagrada en un área de 9 casillas. Todos los personajes que vuelen o floten dentro del área no pueden mantenerse en el aire durante el efecto.'),
    (18, 'Bendición de los Santos', 'A', 'Bendice al personaje y a sus compañeros dentro de su rango de alcance, otorgándoles una regeneración de 5 puntos de vida cada turno, más el modificador de Sabiduría.'),
    (18, 'Escudo en Área Sagrado', 'A', 'El personaje invoca escudos de luz que protegen a 5 aliados dentro de su rango de alcance, aumentando su Clase de Armadura (C.A.) en -2 y reduciendo el daño de hechizos oscuros, demoníacos, maldiciones y espirituales en -2.'),
    (19, 'Intercepción de Ataque', 'P', 'El personaje lanza su escudo para interceptar un ataque dirigido a un aliado a un rango de 6 casillas, despojándose del escudo. Esta habilidad puede usarse en cualquier momento del combate, incluso fuera de su turno'),
    (0, 'Milagro', 'P', 'El personaje establece contacto con la deidad que ha escogido y puede escuchar sus consejos, recibir guías divinas o visiones breves que orienten sus decisiones en combate o fuera de él.'),
    (20, 'Redención Divina', 'A', 'El personaje puede resucitar NPJ o aliados, sin penalización alguna.'),
    (20, 'Escudo de Sagrada Luminiscencia', 'P', 'El personaje se envuelve automáticamente en un escudo protector que absorbe todo el daño del próximo ataque recibido. El escudo se regenera al inicio del turno del personaje')
  ) AS a(level, name, action, description)
WHERE c.name = 'Paladín';

-- Pirata
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Pirata', 'Caótico, Neutral/caótico', 3, 'Ligera / Media',
  'Puede usar todas las armas. Sin escudo: (El personaje no puede equipar ningún tipo de escudo)',
  '13 Destreza, 10 Constitución', 'Catalejo, Brújula, Sextante',
  ARRAY['Aviroide', 'Elfo', 'Elfo Oscuro', 'Enano', 'Gnomo', 'Goblin', 'Humano', 'Nahiaride', 'Orco', 'Renegado', 'Reptiliano', 'Sátiro', 'Semielfo', 'Semiorco', 'Troloide']::text[],
  3, 2, 6, 2, 2,
  '{"Destreza":13,"Constitución":10}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Pirata');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Pirata');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,2000),(3,4000),(4,8000),(5,16000),(6,32000),(7,65000),(8,120000),(9,240000),(10,360000),(11,480000),(12,600000),(13,750000),(14,925000),(15,1000000),(16,1025000),(17,1100000),(18,1175000),(19,1200000),(20,1250000)) AS x(level, xp)
WHERE c.name = 'Pirata';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Pirata');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Cartógrafo', 'P', 'el personaje puede leer mapas y los cuerpos celestes para orientarse'),
    (0, 'Navegante', 'P', 'el personaje tiene un aumento de +2 a las tiradas en el mar y dentro de barcos'),
    (0, 'Hurto', 'P', 'El personaje recibe una bonificación de +3 en las tiradas de destreza para realizar actos de robo'),
    (0, 'Supersticioso', 'P', 'El personaje desconfía profundamente de la magia y se deja influenciar por presagios y augurios negativos, lo que puede causar que se asuste fácilmente ante cualquier señal de mal augurio o fenómeno sobrenatural'),
    (0, 'Cavar', 'A', 'El personaje recibe una bonificación de +3 a las tiradas de suerte para encontrar objetos al cavar.'),
    (0, 'Resistente a Seducciones y Borrachera', 'P', 'El personaje obtiene una bonificación de +4 a las tiradas para resistir intentos de seducción y los efectos de la borrachera.'),
    (0, 'Natación Avanzada', 'P', 'El personaje gana un aumento de +2 casillas en su desplazamiento cuando está en el agua,'),
    (0, 'Experto en Armas de Una Mano', 'P', 'El personaje obtiene una bonificación de +2 al modificador de Destreza y +3 al daño físico con armas de una mano.'),
    (3, 'Perspicaz', 'P', 'El personaje recibe una bonificación de +3 a las tiradas relacionadas con la observación, lo que le permite detectar detalles ocultos, amenazas potenciales o pistas importantes con mayor facilidad.'),
    (3, 'Chantaje', 'P', 'El personaje tiene una bonificación de +5 a la tirada cuando intenta manipular a otros mediante amenazas o presión.'),
    (3, 'Engaño', 'P', 'El personaje recibe una bonificación de +3 a las tiradas para engañar a otros.'),
    (3, 'Mofa', 'P', 'Aumenta en +3 la tirada de carisma cuando el personaje intenta provocar o burlarse de un enemigo.'),
    (5, 'Experto en Armas de Mano a Mano', 'P', 'El personaje domina el uso simultáneo de dos armas de una mano, permitiéndole realizar daño con ambas armas al acertar'),
    (5, 'Suerte', 'A', 'El personaje puede repetir una tirada cualquiera una vez al día.'),
    (5, 'Ignorar Resistencia', 'P', 'El personaje puede suprimir la mitad del modificador de Constitución del enemigo al realizarle el daño.'),
    (8, 'Dominio sobre el mar y el clima', 'A', 'el personaje puede anticipar cualquier tipo de acontecimiento marino antes de que ocurra, del mismo modo que puede predecir si se acerca algún navío'),
    (8, 'Infundir Miedo', 'A', 'El personaje provoca miedo en un objetivo, mientras el objetivo esté bajo el efecto del miedo, todas las tiradas de acción realizadas contra el objetivo tienen un bonificador de +4.'),
    (8, 'Pescador', 'P', 'El personaje recibe una bonificación de +3 a la tirada al pescar'),
    (8, 'Rastreo en Agua', 'A', 'El personaje es capaz de seguir pistas y rastrear movimientos en entornos acuáticos, detectando vestigios o señales en el agua con gran precisión.'),
    (10, 'Suerte Mejorada', 'A', 'El personaje puede repetir hasta dos tiradas una vez por día.'),
    (10, 'Abordaje', 'P', 'El personaje recibe una bonificación de +4 a las tiradas de iniciativa mientras esté a bordo de un barco. Además, durante el primer ataque del combate, el personaje y todos los aliados a bordo aumentan en +3 su modificador de Destreza para ese ataque.'),
    (10, 'Cocina Marinera', 'A', 'El personaje posee habilidades culinarias especializadas para preparar cualquier tipo de pez, mamífero marino o marisco. Los platillos preparados con esta habilidad otorgan curación de vida a quienes los consumen'),
    (13, 'Contrabando', 'A', 'El personaje puede realizar negociaciones ilícitas con éxito. Al tirar un dado de 4 caras (1d4) para determinar el beneficio, si obtiene: 1: Gana un 10% más en las transacciones. 2: Gana un 25% más en las transacciones. 3: Gana un 50% más en las transacciones. 4: Gana un 75% más en las transacciones.'),
    (13, 'Reparación de Barcos', 'A', 'El personaje puede llevar a cabo reparaciones en navíos mientras está en alta mar'),
    (13, 'Alma del Corsario', 'P', 'El personaje aumenta la moral y la resistencia de sí mismo, otorgando un +2 a las tiradas de salvación contra miedo y un +4 de resistencia a las tiradas de Carisma.'),
    (15, 'Maldecir', 'A', 'El personaje puede lanzar una maldición sobre un objetivo, disminuyendo todos los modificadores de sus estadísticas en -1.'),
    (15, 'Liderazgo', 'A', 'El personaje inspira a sus compañeros, otorgando una bonificación de +2 a las tiradas de iniciativa y +1 a las tiradas de salvación para todos los aliados dentro de su rango de alcance'),
    (15, 'Abrir Cerraduras por la Fuerza', 'P', 'El personaje recibe una bonificación de +3 a las tiradas para abrir cerraduras mediante fuerza bruta'),
    (18, 'Cazador de Tesoros', 'P', 'el personaje incrementa la probabilidad de encontrar tesoros ocultos o artefactos valiosos en +3 a la tirada'),
    (18, 'Experto en Combate Cuerpo a Cuerpo', 'P', 'El personaje aumenta en +1 tanto el modificador de destreza como el daño en combates cuerpo a cuerpo'),
    (18, 'El Más Diestro del Alta Mar', 'P', 'El personaje incrementa su Destreza en +3 y el daño de cada arma en +2 mientras combate dentro de un navío o en el agua'),
    (18, 'Jugar Sucio', 'P', 'El personaje puede ejecutar un ataque sorpresa, fuera de combate, con una bonificación de +6 al daño y +5 a la destreza.'),
    (20, 'La suerte está de mi lado', 'P', 'el personaje nunca podrá sacar una tirada de pifia')
  ) AS a(level, name, action, description)
WHERE c.name = 'Pirata';

-- Piromántico
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Piromántico', 'Cualquiera', 6, 'Ligera',
  'No puede usar armas pesadas. Escudo Ligero: (El personaje está limitado a utilizar únicamente una rodela como escudo)',
  '12 Inteligencia, 12 Sabiduría', 'Guante del piromántico',
  ARRAY['Autómata', 'Aviroide', 'Elfo', 'Gnomo', 'Goblin', 'Humano', 'Orco', 'Renegado', 'Reptiliano', 'Semielfo', 'Semiorco']::text[],
  3, 1, 5, 1, 1,
  '{"Inteligencia":12,"Sabiduría":12}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Piromántico');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Piromántico');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,2000),(3,4000),(4,8000),(5,16000),(6,32000),(7,65000),(8,120000),(9,240000),(10,360000),(11,480000),(12,600000),(13,720000),(14,840000),(15,950000),(16,1100000),(17,1200000),(18,1300000),(19,1400000),(20,1500000)) AS x(level, xp)
WHERE c.name = 'Piromántico';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Piromántico');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Destreza del Hechicero', 'P', 'El personaje obtiene una bonificación de +3 a la Destreza para acertar hechizos del personaje'),
    (0, 'Debilidad ante el Agua', 'P', 'El personaje sufre un penalizador de -2 a todas sus tiradas cuando se encuentra dentro del mar o en zonas muy húmedas'),
    (0, 'Antorcha', 'A', 'El personaje puede utilizar su mano, equipada con el guante del piromántico, como si fuera una antorcha, generando luz suficiente para iluminar su entorno.'),
    (0, 'Proyectil Ígneo', 'A', 'El personaje utiliza el guante del piromántico para lanzar una flecha hecha de fuego que inflige 1d4 de daño adicional más el modificador de Inteligencia al objetivo.'),
    (1, 'Ola de Calor', 'A', 'El personaje aumenta la temperatura ambiente en el área alrededor de él, afectando a todo lo que se encuentre dentro de su rango de alcance.'),
    (1, 'Resistencia al Fuego', 'P', 'El personaje tiene resistencia al fuego elemental o infernal, reduciendo en -2 el daño recibido de estos ataques.'),
    (1, 'Quemadura', 'A', 'El personaje puede provocar quemaduras en el enemigo, infligiendo 1 punto de daño pasivo adicional más el modificador de Inteligencia.'),
    (4, 'Bola de Fuego', 'A', 'El personaje lanza una bola de fuego que inflige 1d6 de daño adicional más el modificador de Inteligencia al objetivo.'),
    (4, 'Guante de Piromántico', 'P', 'Todas las habilidades del personaje que involucren fuego causan una quemadura en el objetivo al impactar.'),
    (4, 'Comunión Phyroelemental', 'A', 'El personaje puede comunicarse telepáticamente con entidades elementales o seres vinculados con el fuego.'),
    (5, 'Muro de Fuego', 'A', 'El personaje crea un muro de fuego de 6 casillas de longitud que inflige daño por quemadura a cualquier enemigo que lo atraviese o esté en contacto con él.'),
    (5, 'Látigo de Fuego', 'A', 'El personaje crea un látigo hecho de fuego que inflige daño al objetivo. El daño causado es igual a 1d6 más el modificador de Inteligencia del personaje.'),
    (5, 'Pulso de Fuego', 'A', 'El personaje genera un pulso de fuego que afecta a todos los enemigos dentro de su rango de alcance, infligiendo 1d4 más el modificador de Inteligencia en daño a cada objetivo alcanzado por el pulso.'),
    (7, 'Pilar de Fuego', 'A', 'El personaje eleva una columna de fuego que levanta a todos los objetivos dentro de su rango de alcance, abarcando una zona de cuatro casillas. Los enemigos afectados reciben 1D6 más el modificador de Inteligencia en daño por el impacto de las llamas, además de su correspondiente daño por caída'),
    (8, 'Golpe Flamígero de Piromántico', 'A', 'El personaje imbuye un arma con poder de fuego elemental, causando quemaduras en el objetivo con ataques acertados. El daño infligido de la quemadura y daño elemental es igual a 1d6 más el modificador de Inteligencia del personaje.'),
    (8, 'Rayo de Energía Ígnea', 'A', 'El personaje canaliza un rayo hecho de fuego a lo largo del máximo de su visión, infligiendo 1d10 más el modificador de Inteligencia en daño de fuego al objetivo impactado.'),
    (9, 'Garras de Fuego', 'A', 'El personaje transforma temporalmente su mano con un guante piromántico en gigantescas garras de fuego, que pueden agarrar a un enemigo, estas garras lo queman, incapacitan e inmovilizan, provocando un daño pasivo de 1d8 más el modificador de Inteligencia en cada turno mientras esté atrapado'),
    (9, 'Espiral de Fuego', 'A', 'El personaje invoca un cono de llamas en frente de él, golpeando a todos los enemigos dentro de su alcance con 1d8 más el modificador de Inteligencia en daño por fuego, además, cada enemigo impactado es empujado hacia atrás un número de casillas igual al daño recibido.'),
    (10, 'Invocar Elemental de Fuego', 'A', 'El personaje invoca un elemental de fuego que lanza ráfagas de fuego, infligiendo 1d12 más el modificador de Inteligencia en daño al objetivo impactado. La vitalidad del elemental es la mitad de la vida total del personaje, su rango de alcance, su Inteligencia y Destreza son las mismas que las del conjurador.'),
    (10, 'Desplazamiento a Reacción', 'A', 'El personaje canaliza ráfagas ígneas que le impulsan rápidamente. Esto le otorga vuelo y un bonificador de +4 a la movilidad en combate y un +2 en Destreza para esquivar ataques si ha usado esta habilidad en su turno. Esta habilidad se mantiene activa hasta el final del combate o hasta que sea silenciado.'),
    (10, 'Luz de la Hoguera', 'A', 'El personaje invoca una hoguera mágica que emite una cálida luz en un radio de 5 casillas, todos los aliados dentro de este radio reciben curación de 1d8 puntos de vida más el modificador de Sabiduría, la hoguera también proporciona luz y calor, iluminando el área circundante.'),
    (10, 'Piel de Fuego', 'A', 'El personaje cubre su cuerpo con llamas, reduciendo el daño mágico recibido en un 10%. Además, cualquier enemigo que ataque cuerpo a cuerpo al personaje recibe 1D6 de daño por fuego, más el modificador de Inteligencia.'),
    (10, 'Control Absoluto del Fuego', 'A', 'El personaje puede absorber fuego de cualquier fuente cercana, ya sea aliada o enemiga, acumulando el daño absorbido durante el combate, cuando decide lanzar un hechizo de fuego, puede liberar toda la energía acumulada, Aumentando específicamente durante ese hechizo su modificador de inteligencia en +1 por cada fuente de daño absorbido'),
    (11, 'Infusión Ardiente', 'P', 'El personaje aumenta su modificador de Inteligencia en +3'),
    (11, 'Evocación de Llama Sagrada', 'P', 'El personaje aumenta su modificador de Sabiduría en +2'),
    (11, 'Flamas Precisas', 'P', 'El personaje incrementa su modificador de Destreza en +3. Si el enemigo sufre de quemaduras, el daño infligido contra esos objetivos aumenta en +5.(No aumenta la esquiva)'),
    (14, 'Bola de Fuego de Explosión Retardada', 'A', 'El personaje lanza una bola de fuego que queda pegada al objetivo. El personaje puede decidir cuándo hacer que la bola explote, infligiendo 1D6 más el modificador de Inteligencia en daño de fuego. El portador del objetivo puede eliminar la bola de fuego con agua o un contrahechizo antes de que explote.'),
    (14, 'Llamas Purificadoras', 'A', 'El personaje se envuelve en llamas sagradas que lo sanan, curándose 1d20 más el modificador de sabiduría.'),
    (14, 'Humareda de Ceniza', 'A', 'El personaje crea una nube de humo dentro de su rango de visión, reduciendo la visibilidad a 2 casillas. Además, todos los que permanezcan dentro del humo reciben 1 punto de daño pasivo irreducible por turno, más el modificador de inteligencia.'),
    (15, 'Nube Incendiada', 'A', 'El personaje invoca una nube de fuego dentro de su rango de alcance que desciende en forma de gotas ardientes. Todos los enemigos dentro del rango del hechizo reciben 4 puntos de daño por quemaduras más el modificador de inteligencia'),
    (15, 'Rayo de Fuego Primordial', 'A', 'El personaje lanza un rayo de fuego primordial que inflige 1d12 más el modificador de Sabiduría y el modificador de Inteligencia en daño al objetivo. En caso de acierto, el objetivo también sufre quemaduras que causan daño sagrado y elemental al mismo tiempo.'),
    (15, 'Crecimiento Ardiente', 'P', 'Por cada enemigo que haya sido dañado por el personaje con un ataque de fuego, su daño de fuego aumenta temporalmente en +1 durante el combate.'),
    (17, 'Lluvia de Meteoritos Incandescentes', 'A', 'El personaje convoca una lluvia de meteoritos de fuego mágicos que dañan a todos los combatientes del campo de batalla. Primero lanza 1d6 para determinar cuántos meteoritos caen. Luego, para cada meteorito, lanza 1d12 y añade el modificador de inteligencia del hechicero para calcular el daño infligido.'),
    (18, 'Abrasar Alma', 'A', 'El personaje puede quemar el alma de sus enemigos, expulsándolas de sus cuerpos de forma que se vuelvan irrecuperables. Esta habilidad solo puede utilizarse contra enemigos de nivel inferior al del personaje.'),
    (18, 'Llama Oscura', 'A', 'El personaje lanza una llamarada oscura hacia un enemigo, infligiendo 1d12 más el modificador de Inteligencia en daño oscuro. Además, el objetivo sufre una quemadura irreducible que inflige daño adicional a lo largo del tiempo.'),
    (19, 'Absorción de Llamas', 'P', 'El personaje puede absorber llamas, flamas o quemaduras de enemigos, aliados, objetos, animales o bestias.'),
    (19, 'Volcán', 'A', 'El personaje abre el suelo para provocar la erupción de un volcán. Durante 1 día, el terreno queda cubierto de lava y cenizas, dificultando la movilidad y causando daño a todos los personajes en el área. Al finalizar el efecto, el terreno se cierra, aunque puede quedar con cicatrices que tardarán semanas o meses en sanar. El tamaño del volcán se determina con 2D20 más el modificador de Inteligencia, y el daño por permanecer en la lava es de 3D10 más el modificador de Inteligencia por turno. Esta habilidad solo puede usarse una vez al día.'),
    (20, 'Sol Artificial', 'A', 'El personaje puede crear una estrella incandescente de proporciones desorbitadas para el uso que estime oportuno. Si se lanza contra un grupo de enemigos, inflige 2D10 más 1D12 más el modificador de Inteligencia en daño de fuego elemental. Todos los personajes dentro del campo de batalla, incluyendo al propio personaje, se verán afectados por esta explosión de fuego, además que quedarán completamente cegados')
  ) AS a(level, name, action, description)
WHERE c.name = 'Piromántico';

-- Ronin
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Ronin', 'Caótico, neutral/caótico, neutral', 1, 'Ligera',
  'Puede usar todas las armas, exceptuando las armas pesadas a distancia. Sin escudo: (El personaje no puede equipar ningún tipo de escudo)',
  '13 Destreza, 12 Fuerza, 10 Constitución', 'Algún tipo de katana',
  ARRAY['Aviroide', 'Elfo', 'Humano', 'Orco', 'Semielfo', 'Semiorco']::text[],
  3, 2, 3, 2, 2,
  '{"Destreza":13,"Fuerza":12,"Constitución":10}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Ronin');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Ronin');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,4000),(3,6000),(4,10000),(5,18000),(6,34000),(7,67000),(8,122000),(9,242000),(10,340000),(11,660000),(12,780000),(13,900000),(14,1020000),(15,1300000),(16,1450000),(17,1650000),(18,1790000),(19,1850000),(20,2000000)) AS x(level, xp)
WHERE c.name = 'Ronin';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Ronin');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Instruido', 'P', 'El personaje obtiene un aumento de +1 al daño y +1 al modificador de Destreza al usar armas de estilo Katana.'),
    (0, 'Estigma del Paria', 'P', 'el personaje es considerado un paria en su reino natal, lo que resulta en ser odiado en su tierra de origen.'),
    (0, 'Disciplina', 'A', 'El personaje puede curarse a sí mismo de un estado negativo'),
    (0, 'Supersticioso', 'P', 'El personaje desconfía profundamente de la magia y se deja influenciar por presagios y augurios negativos, lo que puede causar que se asuste fácilmente ante cualquier señal de mal augurio o fenómeno sobrenatural'),
    (0, 'Supervivencia', 'P', 'el personaje predomina su seguridad por encima de la seguridad de otros individuos'),
    (0, 'Sentidos Agudizados', 'P', 'El personaje aumenta el modificador de destreza en +2 solo para esquivar y otorga un bonificador de +1 a la tirada de percepción'),
    (0, 'Resistencia al Alcohol', 'P', 'El personaje recibe una bonificación de +3 a las tiradas de salvación contra la embriaguez.'),
    (0, 'Carga', 'P', 'El personaje puede atacar al finalizar el movimiento'),
    (1, 'Meditación del Errante', 'A', 'El personaje puede curar todos los estados negativos que sufra, restaurando su estado a la normalidad.'),
    (3, 'Furia de Batalla', 'P', 'Mientras está en combate, el personaje no puede ser controlado mentalmente por enemigos del mismo nivel o inferior.'),
    (3, 'Experto en combate Mano a Mano', 'P', 'El personaje recibe un aumento de +2 a su Destreza cuando pelea usando los puños o armas de una mano.'),
    (4, 'Golpe Crítico Alterado', 'P', 'Si el personaje realiza un golpe crítico, después de lanzar el dado de daño, puede optar por en vez de duplicar el daño, lanzar dos dados de daño y sumar el resultado obtenido.'),
    (6, 'Maestro de Armas', 'P', 'El personaje recibe una bonificación de +3 en el modificador de Destreza y +2 al modificador de Fuerza al utilizar cualquier tipo de arma, siempre y cuando no porte un escudo.'),
    (6, 'Resistencia al Miedo', 'P', 'El personaje recibe una bonificación de +3 en la tirada de salvación contra efectos que inducen miedo o pánico.'),
    (8, 'Detectar Camuflajes', 'P', 'El personaje recibe un bonificador de +5 a la tirada para detectar camuflajes'),
    (8, 'Infundir Miedo', 'A', 'El personaje provoca miedo en un objetivo, mientras el objetivo esté bajo el efecto del miedo, todas las tiradas de acción realizadas contra el objetivo tienen un bonificador de +4.'),
    (10, 'Marca del Ronin', 'P', 'Cada vez que el personaje elimina a un enemigo en combate, reduce la Destreza del siguiente objetivo en -1, este efecto es acumulable y aumenta por cada enemigo que el personaje haya derrotado durante la batalla, no obstante, solo se puede marcar a un solo objetivo simultáneamente'),
    (10, 'Valentía', 'P', 'El personaje elimina cualquier penalización que hubiera sido causada por supersticiones.'),
    (11, 'Golpe Espiritual', 'P', 'El personaje canaliza su energía al arma, añadiendo 1d4 de daño espiritual al ataque acertado.'),
    (13, 'Carga de Chi', 'A', 'El personaje permanece inmóvil durante un turno para canalizar su energía, en el próximo ataque con éxito el daño será crítico.'),
    (13, 'Esquivar Proyectiles', 'P', 'El personaje recibe un bonificador de +4 a la tirada de esquiva contra ataques físicos a distancia.'),
    (14, 'Alcanzar el Nirvana', 'A', 'El personaje permanece estático durante dos turnos para recuperar toda su vida y eliminar todos los estados negativos, maldiciones, sortilegios y hechizos. Esta habilidad puede usarse solo una vez por combate.'),
    (16, 'Desangrar', 'P', 'Al acertar un ataque, el personaje inflige un daño pasivo por desangre de +1 por turno al objetivo. Este efecto no se acumula si se aplica al mismo objetivo'),
    (16, 'Golpe Desenvainado', 'P', 'El personaje recibe un bonificador de +10 a la tirada de iniciativa.'),
    (18, 'Tajo de Aire', 'P', 'El personaje puede realizar ataques cuerpo a cuerpo con un alcance de hasta 4 casillas.'),
    (18, 'Artes Marciales', 'P', 'El personaje puede realizar ataques desarmados con un daño de 1d6, añadiendo el modificador de Destreza y Fuerza al daño infligido.'),
    (20, 'Ráfaga de Golpes', 'P', 'El personaje puede realizar una serie de ataques cuerpo a cuerpo consecutivos contra un único objetivo, continuando sus embates hasta que uno de los ataques falle.')
  ) AS a(level, name, action, description)
WHERE c.name = 'Ronin';

-- Samurái
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Samurái', 'Legal, neutral/legal', 1, 'Ligera / Media / Pesada',
  'Puede usar todas las armas, exceptuando las armas pesadas a distancia. Sin escudo: (El personaje no puede equipar ningún tipo de escudo)',
  '13 Destreza, 12 Fuerza, 10 Constitución', NULL,
  ARRAY['Aviroide', 'Elfo', 'Humano', 'Orco', 'Semielfo', 'Semiorco']::text[],
  3, 2, 3, 3, 1,
  '{"Destreza":13,"Fuerza":12,"Constitución":10}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Samurái');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Samurái');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,4000),(3,6000),(4,10000),(5,18000),(6,34000),(7,67000),(8,122000),(9,242000),(10,340000),(11,460000),(12,580000),(13,780000),(14,820000),(15,930000),(16,1000000),(17,1350000),(18,1490000),(19,1650000),(20,2000000)) AS x(level, xp)
WHERE c.name = 'Samurái';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Samurái');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Instruido', 'P', 'El personaje obtiene un aumento de +1 al daño y +1 al modificador de Destreza al usar armas de estilo Katana.'),
    (0, 'Servidumbre', 'P', 'El personaje está obligado a servir al Líder de la familia samurái al que pertenece, cumpliendo todas sus órdenes y misiones sin posibilidad de negarse.'),
    (0, 'Disciplina', 'A', 'El personaje puede curarse a sí mismo de un estado negativo'),
    (0, 'Supersticioso', 'P', 'El personaje desconfía profundamente de la magia y se deja influenciar por presagios y augurios negativos, lo que puede causar que se asuste fácilmente ante cualquier señal de mal augurio o fenómeno sobrenatural'),
    (0, 'Sentido del Honor', 'P', 'El personaje se rige estrictamente por un código honorable, siendo idolatrado en su tierra natal por su integridad y principios.'),
    (0, 'Sentidos Agudizados', 'P', 'El personaje aumenta el modificador de destreza en +2 solo para esquivar y otorga un bonificador de +1 a la tirada de percepción'),
    (0, 'Carga', 'P', 'El personaje puede atacar al finalizar el movimiento'),
    (1, 'Meditación del Bushido', 'A', 'El personaje puede curar todos los estados negativos que sufra, restaurando su estado a la normalidad.'),
    (3, 'Furia de Batalla', 'P', 'Mientras está en combate, el personaje no puede ser controlado mentalmente por enemigos del mismo nivel o inferior.'),
    (3, 'Experto en Combate Cuerpo a Cuerpo', 'P', 'El personaje aumenta en +1 tanto el bonificador de destreza como el daño en combates cuerpo a cuerpo'),
    (4, 'Golpe Crítico Alterado', 'P', 'Si el personaje realiza un golpe crítico, después de lanzar el dado de daño, puede optar por en vez de duplicar el daño, lanzar dos dados de daño y sumar el resultado obtenido.'),
    (6, 'Maestro de Armas', 'P', 'El personaje recibe una bonificación de +3 en el modificador de Destreza y +2 al modificador de Fuerza al utilizar cualquier tipo de arma, siempre y cuando no porte un escudo.'),
    (6, 'Resistencia al Miedo', 'P', 'El personaje recibe una bonificación de +3 en la tirada de salvación contra efectos que inducen miedo o pánico.'),
    (8, 'Detectar Camuflajes', 'P', 'El personaje recibe un bonificador de +5 a la tirada para detectar camuflajes'),
    (8, 'Inspirar Equipo', 'P', 'El personaje puede inspirar a todos los compañeros dentro de su rango de alcance, otorgándoles un bonificación de +1 a un modificador de su elección.'),
    (10, 'Designio del Samurái', 'P', 'Cada vez que el personaje elimina a dos enemigos en combate, aumenta temporalmente su Destreza en +1 solo para atacar, este efecto es acumulativo durante la batalla'),
    (10, 'Valentía', 'P', 'El personaje elimina cualquier penalización que hubiera sido causada por supersticiones.'),
    (11, 'Golpe Espiritual', 'P', 'El personaje canaliza su energía al arma, añadiendo 1d4 de daño espiritual al ataque acertado.'),
    (13, 'Carga de Chi', 'A', 'El personaje permanece inmóvil durante un turno para canalizar su energía, en el próximo ataque con éxito el daño será crítico.'),
    (13, 'Esquivar Proyectiles', 'P', 'El personaje recibe un bonificador de +4 a la tirada de esquiva contra ataques físicos a distancia.'),
    (14, 'Alcanzar el Nirvana', 'A', 'El personaje permanece estático durante dos turnos para recuperar toda su vida y eliminar todos los estados negativos, maldiciones, sortilegios y hechizos. Esta habilidad puede usarse solo una vez por combate.'),
    (16, 'Desangrar', 'P', 'Al acertar un ataque, el personaje inflige un daño pasivo por desangre de +1 por turno al objetivo. Este efecto no se acumula si se aplica al mismo objetivo'),
    (16, 'Golpe Desenvainado', 'P', 'El personaje recibe un bonificador de +10 a la tirada de iniciativa.'),
    (18, 'Tajo de Aire', 'P', 'El personaje puede realizar ataques cuerpo a cuerpo con un alcance de hasta 4 casillas.'),
    (18, 'Artes Marciales', 'P', 'El personaje puede realizar ataques desarmados con un daño de 1d6, añadiendo el modificador de Destreza y Fuerza al daño infligido'),
    (20, 'Embate de Cortes Incesantes', 'P', 'Cada vez que un enemigo falle un ataque cuerpo a cuerpo contra el personaje, este ejecutará de inmediato un ataque cuerpo a cuerpo')
  ) AS a(level, name, action, description)
WHERE c.name = 'Samurái';

-- Sirkhan
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Sirkhan', 'Cualquiera', 1, 'Ligera / Media / Pesada',
  'No puede usar armas a distancia. Puede usar todos los escudos.',
  '13 Fuerza, 10 Constitución', 'Armadura pesada, Espada Curva',
  ARRAY['Enano', 'Humano', 'Reptiliano', 'Semielfo', 'Semiorco']::text[],
  4, 1, 2, 4, 2,
  '{"Fuerza":13,"Constitución":10}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Sirkhan');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Sirkhan');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,2000),(3,3000),(4,7000),(5,15000),(6,30000),(7,70000),(8,100000),(9,220000),(10,330000),(11,440000),(12,550000),(13,660000),(14,770000),(15,880000),(16,990000),(17,1110000),(18,1400000),(19,1750000),(20,2000000)) AS x(level, xp)
WHERE c.name = 'Sirkhan';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Sirkhan');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Aliento del Desierto', 'P', 'El personaje, ante climas extremos tiene +2 a la constitución y +1 a la destreza, además cuando está en clima templado +2 a la destreza y +1 a la constitución'),
    (0, 'Resistencia al Hambre y la Sed', 'P', 'El personaje recibe una bonificación de +5 en la tirada de salvación para resistir los efectos negativos de la falta de comida o agua.'),
    (0, 'Servidumbre', 'P', 'El personaje está obligado a servir al sultán de Maurizanian, cumpliendo todas sus órdenes y misiones sin posibilidad de negarse.'),
    (0, 'Cuerpo Duro', 'P', 'El personaje recibe un aumento de +1 a su modificador de Constitución'),
    (0, 'Imperativo', 'A', 'El personaje impone su voluntad sobre un objetivo, reduciéndole el modificador de Carisma en -1.'),
    (0, 'Retención Firme', 'P', 'Los contrincantes trabados en combate contra el personaje tienen una penalización de -5 a la tirada para zafarse del combate'),
    (0, 'Percepción muy aguda', 'P', 'El personaje observa a un objetivo para deducir detalles clave sobre su carácter, intenciones, estado emocional y acciones recientes'),
    (0, 'Inmunidad a Temperaturas Altas', 'P', 'El personaje es completamente inmune a los efectos adversos causados por temperaturas extremas de calor'),
    (0, 'Estabilidad', 'P', 'El personaje puede moverse sin sufrir penalizaciones en terrenos pantanosos o arenas movedizas.'),
    (2, 'Carga', 'P', 'El personaje puede atacar al finalizar el movimiento'),
    (2, 'Armadura Desértica', 'P', 'El personaje obtiene una bonificación de -1 al C.A. mientras lleva la armadura de acero y oro, la armadura predilecta de los Shirkanes, independientemente del entorno.'),
    (2, 'Rugido de Atención', 'A', 'El personaje emite un potente rugido que atrae la atención de todos los enemigos dentro de un radio de 5 casillas.'),
    (5, 'Combate en Altas Temperaturas', 'P', 'El personaje obtiene un bonificador de +1 en todas las tiradas de combate cuando se encuentra en el desierto o en ambientes de altas temperaturas.'),
    (5, 'Altivo', 'P', 'Los intentos de engañar al personaje tienen una dificultad aumentada en +1.'),
    (7, 'Cuerpo Fortalecido', 'P', 'El personaje reduce -2 el daño físico recibido'),
    (7, 'Experto en Armas Curvas', 'P', 'El personaje obtiene un bonificador de +2 al modificador de Destreza al usar armas curvas.'),
    (7, 'Dominio sobre el Enemigo', 'P', 'Si el objetivo enemigo tiene un modificador de Destreza mayor que el del personaje, el modificador de Destreza del personaje aumenta en +1 y el daño infligido se incrementa en +1 durante el combate contra ese enemigo.'),
    (10, 'Cuerpo Esculpido por la Batalla', 'P', 'El personaje gana un bonificador de +1 en Constitución cada vez que derrota a un enemigo. Este bonificador se acumula durante la batalla y se aplica hasta el final del combate.'),
    (10, 'Detectar engaño', 'P', 'El personaje recibe una bonificación de +3 a la tirada de Carisma cuando intenta discernir si alguien está mintiendo o engañándolo'),
    (12, 'Portador de Hierro', 'P', 'El personaje recibe un aumento de +2 al modificador de Fuerza al usar armaduras pesadas y de +1 al modificador de Fuerza al usar armaduras medias.'),
    (12, 'Resistencia a la Seducción', 'A', 'El personaje obtiene una bonificación de +5 en su resistencia contra intentos de seducción o encantamientos relacionados con el amor'),
    (12, 'Guardia del Desierto', 'P', 'Mientras el personaje se encuentre en el desierto o de calor extremo, recibe una protección adicional contra ataques críticos, aumentando su modificador de Constitución en +5'),
    (15, 'Resignarse a la Muerte', 'P', 'El personaje debe sobrepasar los -6 de vitalidad para morir y llegar al -3 para quedarse inconsciente'),
    (15, 'Golpe Cegador', 'A', 'El personaje utiliza arena, tierra, nieve, agua o un material similar para cegar temporalmente la vista del enemigo, reduciendo su visibilidad y precisión en el combate durante 1 turno.'),
    (17, 'Inmunidad a hechizos de fuego', 'P', 'El personaje no puede recibir daño por hechizos de fuego, ya sea elemental, demoníaco o sagrado.'),
    (17, 'Perspicacia Suprema', 'P', 'El personaje solo puede ser engañado si el adversario obtiene un resultado crítico en su intento de engaño.'),
    (17, 'Furia de las Arenas Tempestuosas', 'A', 'El arma del personaje se envuelve en arena mágica, aumentando su alcance en +2 casillas los ataques, además el daño infligido por el arma se incrementa también con el modificador de Constitución del personaje.'),
    (20, 'Ascensión Colosal', 'A', 'El personaje aumenta su altura en 10 metros, lo que incrementa su rango de alcance en +2 casillas y obtiene un aumento de +30 puntos en su vitalidad, +5 al modificador de su Constitución y +2 al de Fuerza. Esta habilidad no puede ser contrarrestada ni ignorada.'),
    (20, 'Golpe Desalentador', 'P', 'Cuando el personaje acierta un ataque contra un enemigo, el enemigo sufrirá de fatiga.')
  ) AS a(level, name, action, description)
WHERE c.name = 'Sirkhan';

-- Vagabundo
INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee, min_stats)
SELECT 'Vagabundo', 'Cualquiera', 1, 'Ligera / Media',
  'No puede llevar armas pesadas. Escudo Ligero: (El personaje está limitado a utilizar únicamente una rodela como escudo)',
  '12 Destreza', 'Ninguno',
  ARRAY['Elfo', 'Elfo Oscuro', 'Enano', 'Felino', 'Gnomo', 'Goblin', 'Humano', 'Nahiaride', 'Renegado', 'Sátiro', 'Semielfo', 'Semiorco']::text[],
  4, 4, 2, 2, 4,
  '{"Destreza":12}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'Vagabundo');

DELETE FROM public.class_experience WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Vagabundo');
INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,2000),(3,4000),(4,8000),(5,16000),(6,32000),(7,65000),(8,120000),(9,240000),(10,360000),(11,480000),(12,600000),(13,720000),(14,840000),(15,950000),(16,1100000),(17,1200000),(18,1300000),(19,1400000),(20,1500000)) AS x(level, xp)
WHERE c.name = 'Vagabundo';

DELETE FROM public.class_abilities WHERE class_id = (SELECT id FROM public.classes WHERE name = 'Vagabundo');
INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Camuflaje', 'A', 'el personaje se oculta con el entorno, permaneciendo inmóvil mientras utiliza esta habilidad para evitar ser detectada.'),
    (0, 'Espía', 'A', 'El personaje puede disfrazarse con perfección para infiltrarse en lugares o eventos. Los hechizos o habilidades diseñados para detectar camuflaje o ver disfraces, no afectan al personaje mientras realiza esta habilidad.'),
    (0, 'Paria', 'P', 'el personaje es considerado un paria, lo que resulta en ser odiado en Terratea, reduciendo su modificador de carisma en -1'),
    (0, 'Bonificación en Ciudad', 'P', 'El personaje recibe un bonificador de +2 a todas sus tiradas mientras se encuentra en entornos urbanos o ciudades.'),
    (0, 'Espionaje', 'A', 'Amplifica la visión y el oído del personaje, duplicando su capacidad para detectar detalles a distancia y en silencio. Además, le otorga habilidades de camuflaje avanzadas que le permiten ocultarse con gran eficacia en su entorno.'),
    (0, 'Detectar Emboscadas', 'P', 'El personaje aumenta en +3 su tirada de percepción al intentar detectar emboscadas.'),
    (2, 'Maestro del Disfraz', 'A', 'El personaje es capaz de crear y adaptar disfraces perfectos tanto para sí mismo como para sus compañeros'),
    (2, 'Encontrar y Desactivar Trampas', 'P', 'El personaje recibe un bonificación de +4 a las tiradas para encontrar y desactivar trampas.'),
    (2, 'Encontrar refugio', 'A', 'el personaje localiza un refugio para el grupo de manera eficiente'),
    (2, 'Recuperación Rápida', 'P', 'El personaje puede recuperarse de la fatiga una vez por combate sin necesidad de descansar, permitiéndole continuar combatiendo con normalidad.'),
    (2, 'Sigilo', 'A', 'el personaje puede desplazarse entre las sombras sin ser detectado'),
    (4, 'Escuchar Ruidos', 'P', 'Aumenta la Percepción en +2, mejorando la capacidad del personaje para detectar y distinguir sonidos sutiles en su entorno.'),
    (4, 'Sueño Ligero', 'P', 'El personaje tiene un sueño muy ligero, lo que le otorga un bonificador de +3 a las tiradas de percepción durante el descanso y le permite detectar amenazas inminentes con mayor eficacia.'),
    (4, 'Parkour', 'P', 'El personaje puede utilizar la habilidad de "Saltar y Trepar" con mayor eficacia, pero solo en entornos urbanos y similares.'),
    (4, 'Conocer alineamiento', 'P', 'el personaje puede discernir el alineamiento moral de una persona, revelando si son legales, neutrales o caóticos'),
    (5, 'Percepción muy aguda', 'P', 'El personaje observa a un objetivo para deducir detalles clave sobre su carácter, intenciones, estado emocional y acciones recientes'),
    (5, 'Sastre', 'A', 'Especialista en confección y ajuste de ropa a medida, encargado de diseñar, crear y modificar prendas para satisfacer las necesidades del gremio.'),
    (5, 'Ataque sorpresa', 'P', 'El personaje obtiene un bonificador de +3 a la tirada de ataque en situaciones de sorpresa y un bonificador de +2 al daño si el ataque es exitoso. Este efecto dura durante todo el combate contra el enemigo sorprendido.'),
    (6, 'Leer lenguas', 'P', 'el personaje puede leer todas las lenguas, tanto vivas como muertas o demoníacas'),
    (6, 'Escalar', 'P', 'Permite al personaje subir y descender superficies verticales con agilidad, facilitando el acceso a lugares elevados o difíciles de alcanzar, sin necesidad de accesorios'),
    (6, 'Navegante', 'P', 'el personaje tiene un aumento de +2 a las tiradas en el mar y dentro de barcos'),
    (6, 'Modista', 'A', 'Cuando el personaje crea disfraces para sus aliados, estos no pueden ser detectados por habilidades o hechizos que detectan camuflaje o disfraces.'),
    (6, 'Poliglota', 'P', 'El personaje conoce y puede hablar lenguas muertas y demoníacas, así como idiomas cifrados'),
    (8, 'Supervivencia', 'P', 'el personaje predomina su seguridad por encima de la seguridad de otros individuos'),
    (8, 'Sentidos Agudizados', 'P', 'El personaje aumenta el modificador de destreza en +2 solo para esquivar y otorga un bonificador de +1 a la tirada de percepción'),
    (8, 'Cartógrafo', 'P', 'el personaje puede leer mapas y los cuerpos celestes para orientarse'),
    (10, 'Elemento Sorpresivo', 'A', 'El personaje puede realizar un ataque a distancia a un rango de 3 casillas desde su camuflaje o disfraz sin ser detectado (con dardos, kunai, cuchillos u otros artilugios lanzables). Obtiene un bonificador de +6 a la Destreza en el ataque, y si acierta, inflige +3 de daño al objetivo durante todo el combate. Si el objetivo es eliminado con este ataque, el personaje permanece sin ser detectado y puede continuar fuera de combate.'),
    (10, 'Engaño', 'P', 'El personaje recibe una bonificación de +3 a las tiradas para engañar a otros.'),
    (10, 'Conocimiento de Venenos', 'P', 'El personaje tiene la habilidad de identificar, preparar y neutralizar venenos'),
    (10, 'Localizar objetos', 'P', 'El personaje obtiene una bonificación de +4 en la tirada para detectar objetos'),
    (10, 'Filo Oculto', 'A', 'Cuando el personaje tiene dos o más enemigos adyacentes independientemente de su ubicación, puede realizar un ataque cuerpo a cuerpo contra todos ellos en su turno. Si el personaje lleva dos hojas ocultas, inflige daño con ambas armas a todos los enemigos adyacentes'),
    (10, 'Falsificación de Documentos', 'A', 'El personaje puede falsificar documentos con gran precisión, creando copias que son prácticamente indistinguibles de los originales, lo que le permite engañar a autoridades o acceder a información restringida.'),
    (12, 'Leer Labios', 'P', 'El personaje puede interpretar las palabras de alguien al observar sus labios, permitiéndole entender conversaciones a distancia o en silencio.'),
    (12, 'Comunicación Secreta', 'P', 'El personaje puede transmitir mensajes ocultos y secretos sin ser detectado, recibiendo un bonificador de +6 a las tiradas relacionadas con la comunicación secreta.'),
    (12, 'Agilidad', 'P', 'El personaje obtiene un aumento de +2 para esquivar ataques y +1 una casilla de movimiento'),
    (12, 'Pericia en el Deslizamiento', 'P', 'El personaje aumenta en +3 todos los movimientos en ciudades, asentamientos y áreas similares.'),
    (12, 'Elusividad', 'P', 'El personaje se vuelve extremadamente difícil de atacar mientras está invisible, en sigilo, camuflado o disfrazado, recibiendo una asignación de -4 a la Clase de Armadura (CA) mientras se encuentra en este estado.'),
    (14, 'Mendicidad Experta', 'P', 'El personaje puede pedir limosna o buscar ayuda en la calle con gran eficacia, aumentando su éxito en obtener recursos o información en un +5 a las tiradas relacionadas con mendicidad o persuasión en contextos urbanos.'),
    (14, 'Escuchar ruidos mejorado', 'P', 'Aumenta la Percepción en +5, mejorando la capacidad del personaje para detectar y distinguir sonidos sutiles en su entorno.'),
    (14, 'Detectar emboscada mejorada', 'P', 'El personaje aumenta en +6 su tirada de percepción al intentar detectar emboscadas.'),
    (14, 'Trampero', 'A', 'El personaje puede crear trampas de una casilla que inmovilizan al enemigo y le causan daño físico por turno, igual al modificador de Destreza.'),
    (15, 'Experto en Armas de Daga y Puñales', 'P', 'El personaje recibe una bonificación de +1 al modificador de Destreza y al daño al usar Dagas, Puñales, Falcatas y Sais'),
    (15, 'Neutralizar Venenos', 'A', 'El personaje elimina un efecto de envenenamiento en un objetivo.'),
    (15, 'Acrobacia', 'P', 'El personaje obtiene una bonificación de +2 en el modificador de destreza específicamente para esquivar ataques.'),
    (16, 'Sueño Muy Ligero', 'P', 'El personaje tiene un sueño muy ligero, lo que le otorga un bonificador de +5 a las tiradas de percepción durante el descanso y le permite detectar amenazas inminentes con mayor eficacia.'),
    (16, 'Abrir Cerraduras', 'P', 'El personaje obtiene una bonificación de +5 a las tiradas para abrir cerraduras'),
    (16, 'Abrir Cerraduras Mágicas o Malditas', 'P', 'El personaje recibe un bonificación de +4 a las tiradas para abrir cerraduras que son mágicas o están malditas'),
    (16, 'Contraespionaje', 'P', 'El personaje está entrenado en la detección de espías, personas camufladas o mimetizadas, y aquellos que han usurpado identidades. Obtiene un bonificador de +6 a las tiradas de percepción y perspicacia relacionadas con la identificación de infiltrados o actividades clandestinas.'),
    (16, 'Líder de información', 'P', 'el personaje teje una red de contacto por todas las ciudades para poder sacar información útil de cualquier sitio'),
    (18, 'Asaltar y destruir recintos', 'P', 'el personaje sabe perfectamente donde colocar las bombas incendiarias o dinamitas para acabar con cualquier tipo de recinto, castillo o ciudades'),
    (18, 'Manipulación de rumores', 'P', 'El personaje es experto en difundir y controlar información falsa o sesgada. Esta habilidad le permite influir en la opinión pública, desacreditar a enemigos y desviar la atención de acciones clandestinas propias.'),
    (18, 'Experticia Metropolitana', 'P', 'En ciudades y asentamientos, el personaje siempre tira dos dados y usa el resultado más alto para todas las acciones relacionadas.'),
    (20, 'Héroe Reconocido', 'P', 'El personaje aumenta 6 puntos en características en lugar de 2 al llegar al nivel 20 y elimina la penalización por ser un paria.'),
    (20, 'Maestro de la Hoja', 'P', 'El personaje domina el uso de sus hojas ocultas, mientras maneja estas armas, recibe un aumento de +3 al modificador de Destreza y de +3 al daño durante el ataque'),
    (20, 'Metamorfosis', 'A', 'El personaje puede cambiar su raza a voluntad siempre que lo desee, adoptando también las habilidades raciales asociadas a la nueva forma')
  ) AS a(level, name, action, description)
WHERE c.name = 'Vagabundo';

-- La web guarda "Renegado" (sin subraza): el Cazador ya existente lo lista por subrazas, así que se añade el nombre general.
UPDATE public.classes
SET allowed_races = array_append(allowed_races, 'Renegado')
WHERE name = 'Cazador' AND NOT ('Renegado' = ANY (allowed_races));
