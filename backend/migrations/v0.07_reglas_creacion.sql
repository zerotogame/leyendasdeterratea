-- v0.07: soporte para las reglas de creación. Se puede ejecutar varias veces.

ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS pending_stat_points integer NOT NULL DEFAULT 0;

-- allowed_alignments NULL = cualquier alineamiento; min_stats = características mínimas exigidas
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS allowed_alignments text[],
  ADD COLUMN IF NOT EXISTS min_stats jsonb;

UPDATE public.classes SET min_stats = '{"Sabiduría": 10, "Carisma": 10}'::jsonb WHERE name = 'Cazador';

-- Berserker no tenía datos de movimiento: se toman los de la ficha de Badwolf (provisional)
UPDATE public.classes
SET move_base = 4, move_combat = 4, move_run = 7, move_overweight = 2, move_flee = 2
WHERE name = 'Berserker' AND move_base IS NULL;

-- Elemento inicial obligatorio del Cazador (peso y precio sin definir en las reglas)
INSERT INTO public.objects (name, price_copper, weight_kg, is_unique)
SELECT 'Correa para domesticar', 0, 0, false
WHERE NOT EXISTS (SELECT 1 FROM public.objects WHERE name = 'Correa para domesticar');

-- Alineamiento como lista cerrada (nombres de terratea-razas.json)
UPDATE public.characters SET alignment = 'Neutral/Caotico' WHERE alignment = 'Neutral caotico';
