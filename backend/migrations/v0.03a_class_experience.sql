-- Tabla class_experience: existe en la base local pero no estaba en v0.02.sql.
-- Aplicar despues de restaurar v0.02.sql y antes de v0.04_class_cazador.sql.
CREATE TABLE IF NOT EXISTS public.class_experience (
  id SERIAL PRIMARY KEY,
  class_id integer NOT NULL,
  level smallint NOT NULL,
  required_experience integer NOT NULL,
  CONSTRAINT uq_class_level UNIQUE (class_id, level),
  CONSTRAINT fk_class_experience_class FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE
);
