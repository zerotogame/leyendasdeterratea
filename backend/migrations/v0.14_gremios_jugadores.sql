-- v0.14: gremios de jugadores (hoja de gremio: miembros, tesoro, almacén, ventajas, beneficios, personal, propiedades). Se puede ejecutar varias veces.
CREATE TABLE IF NOT EXISTS public.guilds (
  id serial PRIMARY KEY,
  user_id integer NOT NULL,
  name text NOT NULL,
  founded text,
  location text,
  reputation integer NOT NULL DEFAULT 0 CHECK (reputation BETWEEN 0 AND 100),
  stars integer NOT NULL DEFAULT 0 CHECK (stars BETWEEN 0 AND 10),
  gold integer NOT NULL DEFAULT 0 CHECK (gold >= 0),
  silver integer NOT NULL DEFAULT 0 CHECK (silver >= 0),
  copper integer NOT NULL DEFAULT 0 CHECK (copper >= 0),
  gems jsonb NOT NULL DEFAULT '[]',        -- [{ name, quantity }]
  storage jsonb NOT NULL DEFAULT '[]',     -- [string] columna «Almacén»
  harvest jsonb NOT NULL DEFAULT '[]',     -- [string] columna «Cosecha»
  advantages jsonb NOT NULL DEFAULT '[]',  -- [string]
  benefits jsonb NOT NULL DEFAULT '[]',    -- [string]
  staff jsonb NOT NULL DEFAULT '[]',       -- [{ name, note }] «Personal»
  properties jsonb NOT NULL DEFAULT '[]',  -- [string]
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.guild_members (
  guild_id integer NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  character_id integer NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  PRIMARY KEY (guild_id, character_id)
);
