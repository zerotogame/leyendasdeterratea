-- v0.17: histórico de los Juegos de Gladiadores (ediciones y podios). Se puede ejecutar varias veces.
CREATE TABLE IF NOT EXISTS public.gladiator_editions (
  number integer PRIMARY KEY CHECK (number > 0),
  year integer,
  state text NOT NULL DEFAULT 'celebrada' CHECK (state IN ('celebrada','proxima')),
  date_text text,                                 -- p. ej. «Diciembre»
  chronicle text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.gladiator_results (
  id serial PRIMARY KEY,
  edition integer NOT NULL REFERENCES public.gladiator_editions(number) ON DELETE CASCADE ON UPDATE CASCADE,
  game text NOT NULL,                             -- id del juego (data/gladiadores.json)
  place text NOT NULL CHECK (place IN ('oro','plata','bronce')),
  gladiator text NOT NULL,
  guild text
);
CREATE INDEX IF NOT EXISTS gladiator_results_edition_idx ON public.gladiator_results (edition);
