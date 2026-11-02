-- v0.15: fichas de mascota/montura (dueño = personaje, gremio opcional). Se puede ejecutar varias veces.
CREATE TABLE IF NOT EXISTS public.pets (
  id serial PRIMARY KEY,
  user_id integer NOT NULL,
  owner_id integer REFERENCES public.characters(id) ON DELETE SET NULL,
  guild_id integer REFERENCES public.guilds(id) ON DELETE SET NULL,
  name text NOT NULL,
  species text,                                   -- «Raza»
  alignment text,
  role text NOT NULL DEFAULT 'Mascota',           -- Mascota / Montura
  level integer NOT NULL DEFAULT 1 CHECK (level BETWEEN 0 AND 100),
  category text NOT NULL DEFAULT 'comun' CHECK (category IN ('comun','poco_comun','epico_mitico','legendario')),
  hp integer NOT NULL DEFAULT 0 CHECK (hp >= 0),
  ac integer NOT NULL DEFAULT 10 CHECK (ac >= 0),
  dodge integer NOT NULL DEFAULT 0,               -- «Esquiva (Destr+Habs)»
  attack text,                                    -- p. ej. «2d6 (Garras)»
  attack_note text,                               -- p. ej. «Mordisco + veneno»
  reach text,                                     -- rango de alcance
  extras text,                                    -- línea libre bajo el logo (p. ej. «Atq.: 2 | Cura: 4»)
  move_base integer,
  move_combat integer,
  move_run integer,
  move_overweight integer,
  move_flee integer,
  specials jsonb NOT NULL DEFAULT '[]',           -- [string] «Atributos especiales»
  inventory jsonb NOT NULL DEFAULT '[]',          -- [string]
  load_total text,
  color text NOT NULL DEFAULT '#3a4458',          -- tinta de la hoja
  image text,                                     -- fichero en /images/pets/
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pets_owner_idx ON public.pets (owner_id);
CREATE INDEX IF NOT EXISTS pets_guild_idx ON public.pets (guild_id);
