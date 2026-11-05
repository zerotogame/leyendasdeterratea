-- v0.18: índices en las claves de personaje usadas por las lecturas (fichas, listados). Repetible.
CREATE INDEX IF NOT EXISTS character_stats_character_idx ON public.character_stats (character_id);
CREATE INDEX IF NOT EXISTS character_saves_character_idx ON public.character_saves (character_id);
CREATE INDEX IF NOT EXISTS character_movement_character_idx ON public.character_movement (character_id);
CREATE INDEX IF NOT EXISTS character_skills_character_idx ON public.character_skills (character_id, position);
CREATE INDEX IF NOT EXISTS character_object_character_idx ON public.character_object (character_id);
CREATE INDEX IF NOT EXISTS class_experience_class_level_idx ON public.class_experience (class_id, level);
