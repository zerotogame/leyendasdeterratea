-- v0.09: galería de imágenes por personaje. Guarda solo la referencia (ruta relativa a /images). Se puede ejecutar varias veces.

CREATE TABLE IF NOT EXISTS public.character_images (
  id           serial PRIMARY KEY,
  character_id integer NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  file         text NOT NULL,
  position     integer NOT NULL DEFAULT 1,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS character_images_character_idx ON public.character_images (character_id, position);
