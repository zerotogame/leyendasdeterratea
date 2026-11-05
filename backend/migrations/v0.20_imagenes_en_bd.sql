-- v0.20: las imágenes subidas (personajes y mascotas) se guardan en la BD, no en el disco efímero de Render. Repetible.
CREATE TABLE IF NOT EXISTS public.stored_images (
  file text PRIMARY KEY,            -- misma ruta que las columnas "file"/"image", p. ej. pets/2-ab12.png
  mime text NOT NULL,
  data bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
