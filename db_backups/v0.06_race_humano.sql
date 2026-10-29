-- v0.06: datos de la raza Humano (antes "Human"). Se puede ejecutar varias veces.

UPDATE public.races SET name = 'Humano', max_carry_kg = 50 WHERE name IN ('Human', 'Humano');

-- Orden de salvaciones: 1 Venenos, 2 Magia, 3 Parálisis/Petrificación, 4 Quemadura, 5 Sortilegios
INSERT INTO public.race_saves (race_id, level_min, level_max, save_id, value)
SELECT r.id, v.level_min, v.level_max, s.n, s.value
FROM public.races r,
  (VALUES
    (1, 3, ARRAY[14,15,16,17,18]),
    (4, 6, ARRAY[12,13,14,15,16]),
    (7, 9, ARRAY[10,11,12,13,14]),
    (10, 12, ARRAY[8,9,10,9,12]),
    (13, 15, ARRAY[6,7,8,7,10]),
    (16, 18, ARRAY[4,5,6,5,8]),
    (19, NULL, ARRAY[3,3,4,4,6])
  ) AS v(level_min, level_max, vals),
  LATERAL unnest(v.vals) WITH ORDINALITY AS s(value, n)
WHERE r.name = 'Humano'
ON CONFLICT (race_id, level_min, save_id) DO UPDATE SET level_max = EXCLUDED.level_max, value = EXCLUDED.value;

DELETE FROM public.race_traits WHERE race_id = (SELECT id FROM public.races WHERE name = 'Humano');

INSERT INTO public.race_traits (race_id, kind, name, description)
SELECT r.id, x.kind, x.name, x.description
FROM public.races r,
  (VALUES
    ('strength', 'Aprendizaje avanzado', '+10 a la tirada de aprendizaje'),
    ('strength', 'Polivalente', 'Pueden aprender cualquier clase'),
    ('weakness', 'Debilidad ante maldiciones', '+1 de daño oscuro')
  ) AS x(kind, name, description)
WHERE r.name = 'Humano';
