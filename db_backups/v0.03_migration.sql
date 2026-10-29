-- v0.03: datos de la ficha completa (armamento, habilidades, vitalidad, monedas)

ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS player_name text,
  ADD COLUMN IF NOT EXISTS guild text,
  ADD COLUMN IF NOT EXISTS hit_points integer,
  ADD COLUMN IF NOT EXISTS armor_class integer,
  ADD COLUMN IF NOT EXISTS dodge integer,
  ADD COLUMN IF NOT EXISTS range_reach text,
  ADD COLUMN IF NOT EXISTS gold integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS silver integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS copper integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.character_weapons (
  id serial PRIMARY KEY,
  character_id integer NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  slot integer NOT NULL,
  name text NOT NULL,
  attack_magic integer,
  attack_element integer,
  attack_malediction integer,
  weight text,
  hands integer,
  damage text,
  total text,
  special text
);

CREATE TABLE IF NOT EXISTS public.character_skills (
  id serial PRIMARY KEY,
  character_id integer NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'special' CHECK (category IN ('special', 'extra')),
  position integer NOT NULL,
  name text NOT NULL
);

-- Personaje 4: Badwolf Paulaner Heineken
UPDATE public.characters SET
  player_name = 'Badwolf', hit_points = 71, armor_class = 9, dodge = 1, range_reach = '1-2', guild = 'Marca de fenrir',
  level = 11, gold = 169, silver = 8, copper = 4
WHERE id = 4;

UPDATE public.character_stats SET value = 14 WHERE character_id = 4 AND stat_id = 1;

DELETE FROM public.character_weapons WHERE character_id = 4;
INSERT INTO public.character_weapons (character_id, slot, name, weight, hands, damage, special) VALUES
  (4, 1, 'Tomahok', '1/2', 2, '2D4', 'Contundente'),
  (4, 2, 'Tecnoquimico', NULL, NULL, NULL, NULL);

DELETE FROM public.character_skills WHERE character_id = 4;
INSERT INTO public.character_skills (character_id, category, position, name) VALUES
  (4, 'special', 1, '+1 Tirada aprendizaje'),
  (4, 'special', 2, '100 % cultivo'),
  (4, 'special', 3, 'Forja herrería'),
  (4, 'special', 4, 'Lanza jarras'),
  (4, 'special', 5, 'Fermentación y destilería'),
  (4, 'special', 6, '+1 Daño por oscuridad'),
  (4, 'extra', 1, 'Cerveza arcana');
