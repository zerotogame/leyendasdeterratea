-- v0.12: lore del personaje (inicios y trayectoria), visible para otros másters. Se puede ejecutar varias veces.
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS lore_origin text;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS lore_trajectory text;
