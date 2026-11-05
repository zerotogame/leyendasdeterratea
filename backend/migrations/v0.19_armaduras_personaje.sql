-- v0.19: armaduras/escudos equipados por personaje (como character_weapons). Se puede ejecutar varias veces.
CREATE TABLE IF NOT EXISTS public.character_armors (
  character_id integer NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  slot integer NOT NULL,
  name text NOT NULL,
  armor_class text,   -- aporte a la C.A. tal como sale del libro (p. ej. «+3»)
  weight text,
  noise text,
  special text,
  PRIMARY KEY (character_id, slot)
);
