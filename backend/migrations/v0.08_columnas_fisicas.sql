-- v0.08: más margen en altura y peso (Jotun: hasta 20 m y 1500 kg). Se puede ejecutar varias veces.

ALTER TABLE public.characters
  ALTER COLUMN height TYPE numeric(5,2),
  ALTER COLUMN weight TYPE numeric(7,2);

-- Sexo como lista cerrada: Hombre, Mujer, No definido
UPDATE public.characters SET sex = 'No definido' WHERE sex IS NOT NULL AND sex NOT IN ('Hombre', 'Mujer', 'No definido');
