-- v0.05: datos de raza (carga máxima, salvaciones por nivel, rasgos) y raza Elfo Oscuro

ALTER TABLE public.races
  ADD COLUMN IF NOT EXISTS max_carry_kg numeric;

-- level_max NULL = sin límite superior (19+)
CREATE TABLE IF NOT EXISTS public.race_saves (
  id serial PRIMARY KEY,
  race_id integer NOT NULL REFERENCES public.races(id) ON DELETE CASCADE,
  level_min smallint NOT NULL,
  level_max smallint,
  save_id integer NOT NULL REFERENCES public.save_definitions(id),
  value integer NOT NULL,
  UNIQUE (race_id, level_min, save_id)
);

CREATE TABLE IF NOT EXISTS public.race_traits (
  id serial PRIMARY KEY,
  race_id integer NOT NULL REFERENCES public.races(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('strength', 'weakness')),
  name text NOT NULL,
  description text
);

INSERT INTO public.races (name, max_carry_kg) VALUES ('Elfo Oscuro', 40);

-- Orden de salvaciones: 1 Venenos, 2 Magia, 3 Parálisis/Petrificación, 4 Quemadura, 5 Sortilegios
INSERT INTO public.race_saves (race_id, level_min, level_max, save_id, value)
SELECT r.id, t.level_min, t.level_max, s.save_id, s.value
FROM public.races r,
  (VALUES (1, 5), (6, 10), (11, 15), (16, 18), (19, NULL)) AS t(level_min, level_max)
  JOIN (VALUES
    (1, 1, 13), (1, 2, 13), (1, 3, 13), (1, 4, 16), (1, 5, 14),
    (6, 1, 11), (6, 2, 11), (6, 3, 11), (6, 4, 14), (6, 5, 12),
    (11, 1, 9), (11, 2, 9), (11, 3, 9), (11, 4, 12), (11, 5, 8),
    (16, 1, 7), (16, 2, 5), (16, 3, 6), (16, 4, 8), (16, 5, 6),
    (19, 1, 6), (19, 2, 4), (19, 3, 5), (19, 4, 7), (19, 5, 4)
  ) AS s(level_min, save_id, value) ON s.level_min = t.level_min
WHERE r.name = 'Elfo Oscuro';

INSERT INTO public.race_traits (race_id, kind, name, description)
SELECT r.id, x.kind, x.name, x.description
FROM public.races r,
  (VALUES
    ('strength', 'Visión nocturna', NULL),
    ('strength', 'Camuflaje', NULL),
    ('strength', 'Bonificación en bosques', '+1 en tirada de iniciativa'),
    ('weakness', 'Debilidad ante el fuego', '+2 de daño recibido por fuego')
  ) AS x(kind, name, description)
WHERE r.name = 'Elfo Oscuro';
