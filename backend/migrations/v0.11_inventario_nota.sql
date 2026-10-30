-- v0.11: nota libre por objeto del inventario de un personaje (p. ej. «2/50 usos» de una garrafa).
ALTER TABLE public.character_object ADD COLUMN IF NOT EXISTS note text;
