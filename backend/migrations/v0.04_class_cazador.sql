-- v0.04: datos de clase (reglas generales + habilidades) y clase Cazador

ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS alignment text,
  ADD COLUMN IF NOT EXISTS range_distance integer,
  ADD COLUMN IF NOT EXISTS armor_types text,
  ADD COLUMN IF NOT EXISTS weapon_restrictions text,
  ADD COLUMN IF NOT EXISTS requirements text,
  ADD COLUMN IF NOT EXISTS starting_items text,
  ADD COLUMN IF NOT EXISTS allowed_races text[],
  ADD COLUMN IF NOT EXISTS move_base integer,
  ADD COLUMN IF NOT EXISTS move_combat integer,
  ADD COLUMN IF NOT EXISTS move_run integer,
  ADD COLUMN IF NOT EXISTS move_overweight integer,
  ADD COLUMN IF NOT EXISTS move_flee integer;

CREATE TABLE IF NOT EXISTS public.class_abilities (
  id serial PRIMARY KEY,
  class_id integer NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  level smallint NOT NULL,
  name text NOT NULL,
  action text NOT NULL CHECK (action IN ('P', 'A')),
  description text NOT NULL
);

INSERT INTO public.classes
  (name, alignment, range_distance, armor_types, weapon_restrictions, requirements, starting_items, allowed_races,
   move_base, move_combat, move_run, move_overweight, move_flee)
VALUES
  ('Cazador', 'Cualquiera', 7, 'Ligera / Media / Pesada (sin especificar cuáles puede usar)',
   'No puede usar armas pesadas, excepto el Arco de Poleas. No puede equipar ningún tipo de escudo.',
   '10 Sabiduría, 10 Carisma', 'Correa para domesticar',
   ARRAY['Autómata','Aviroide','Elfo','Elfo Oscuro','Enano','Felino','Gnomo','Goblin','Humano','Jotun','Nahiaride','Orco',
         'Renegado: Hombre-Lobo','Renegado: No-Muerto','Renegado: Semidemonio','Reptiliano','Sátiro','Semielfo','Semiorco','Troloide'],
   2, 3, 6, 2, 2);

INSERT INTO public.class_experience (class_id, level, required_experience)
SELECT c.id, x.level, x.xp
FROM public.classes c,
  (VALUES (1,0),(2,2000),(3,4000),(4,8000),(5,16000),(6,30000),(7,60000),(8,100000),(9,220000),(10,330000),
          (11,660000),(12,880000),(13,1000000),(14,1330000),(15,1660000),(16,1880000),(17,2000000),(18,2400000),
          (19,2800000),(20,3000000)) AS x(level, xp)
WHERE c.name = 'Cazador';

INSERT INTO public.class_abilities (class_id, level, name, action, description)
SELECT c.id, a.level, a.name, a.action, a.description
FROM public.classes c,
  (VALUES
    (0, 'Bonificación en Bosques', 'P', '+1 a todas las tiradas en un entorno boscoso.'),
    (0, 'Precisión del Cazador', 'P', 'Los ataques a distancia ignoran escudos, tanto manuales como fijos.'),
    (0, 'Pesca', 'P', '+5 en las tiradas relacionadas con la pesca.'),
    (0, 'Recolector', 'P', '+4 en las tiradas para buscar y recolectar alimento.'),
    (0, 'Saltar y Trepar', 'P', 'Puede saltar y trepar por árboles, muros, murallas y otros obstáculos, superándolos con facilidad.'),
    (0, 'Caza', 'P', '+5 en las tiradas relacionadas con la caza.'),
    (1, 'Compañero Animal', 'P', 'Controla a los animales bajo su cuidado, utilizándolos para asistir en combates o en diversas acciones.'),
    (1, 'Domesticar Animales Simples', 'A', 'Puede domesticar animales comunes (requiere correa para domesticar).'),
    (3, 'Experto en Armas a Distancia', 'P', '+2 al modificador de Destreza al usar armas a distancia.'),
    (3, 'Peletería y Desuello', 'A', 'Puede desollar criaturas, curtir las pieles y elaborar armaduras de nivel medio.'),
    (4, 'Camuflaje', 'A', 'Se oculta con el entorno, permaneciendo inmóvil, para evitar ser detectado.'),
    (4, 'Rastreo', 'A', 'Sigue el rastro de un objetivo mediante huellas y señales del entorno, localizándolo en diversos terrenos.'),
    (5, 'Tiro Certero', 'P', 'Si su ataque a distancia acierta, causa como mínimo 1 punto de daño al objetivo más su modificador de Fuerza.'),
    (5, 'Trampero', 'A', 'Crea trampas de una casilla que inmovilizan al enemigo y le causan daño físico por turno igual al modificador de Destreza.'),
    (5, 'Detectar Trampa', 'A', 'Identifica y localiza trampas escondidas o dispuestas en su entorno.'),
    (5, 'Zoología', 'P', 'Conocimientos detallados sobre características y hábitat de animales de categoría 1, lo que le permite entender y anticipar su comportamiento.'),
    (5, 'Doble Compañero', 'P', 'Puede tener dos compañeros animales que le asisten en combate.'),
    (6, 'Bonificación con Armas a Distancia', 'P', '+2 al daño infligido al usar ballestas, arcos u hondas.'),
    (6, 'Bengala Reveladora', 'A', 'Lanza una bengala de luz que ilumina un área y revela enemigos, objetos y trampas secretas en la zona.'),
    (7, 'Venenos y Parálisis', 'A', 'Las flechas están impregnadas con venenos y agentes paralizantes. Al acertar un disparo, el objetivo recibe daño adicional de 1 más el modificador de Sabiduría del personaje y además puede quedar paralizado.'),
    (8, 'Supervivencia Animal', 'P', 'Vínculo tan profundo con sus compañeros animales que prioriza su supervivencia por encima de todo, asegurando que estén siempre a salvo.'),
    (8, 'Zoología Avanzada', 'P', 'Conocimientos detallados sobre animales de categoría 2.'),
    (8, 'Jauría', 'P', 'Por cada compañero animal en combate, el personaje aumenta en +1 el modificador de Destreza solo al ataque y +1 al daño. Además, cada mascota activa recibe +2 al modificador de Destreza.'),
    (10, 'Doma de Animales Especiales', 'A', 'Puede domesticar animales poco comunes.'),
    (10, 'Triple Compañero', 'P', 'Hasta tres compañeros animales en combate, con un máximo de un animal de categoría poco común.'),
    (11, 'Comprender Animales', 'P', 'Se comunica de manera fluida con los animales, entendiendo y respondiendo a sus necesidades y deseos.'),
    (11, 'Sentidos Agudizados', 'P', '+2 al modificador de Destreza solo para esquivar y +1 a la tirada de percepción.'),
    (13, 'Equitación', 'P', 'Montado, su movimiento base aumenta en +3 y su movimiento en combate en +6, además de la movilidad correspondiente a su clase.'),
    (13, 'Curar Animal', 'A', 'Sana 1d20 más su bonificador de Sabiduría a uno de sus compañeros animales.'),
    (14, 'Camuflaje en Área', 'A', 'Camufla a sus aliados y compañeros animales en una zona del entorno, haciéndolos casi invisibles a los enemigos mientras permanezcan inmóviles.'),
    (14, 'Escapatoria Veloz', 'P', 'Al realizar una carrera, puede duplicar el número de casillas que avanza.'),
    (15, 'Cazador Reputado', 'P', '+30% en sus beneficios económicos al vender cuero, carne, pescado o animales.'),
    (15, 'Tiro Certero Supremo', 'P', 'Ignora 3 puntos del modificador de Constitución y 2 puntos del modificador de Destreza del enemigo en ataques a distancia. Además, siempre inflige al menos 1 punto de daño, sumando también su modificador de Fuerza.'),
    (15, 'Táctica de Emboscada', 'P', '+4 de movilidad a todos los compañeros dentro de su alcance. En un ataque por sorpresa, sus modificadores de Destreza aumentan en +3.'),
    (15, 'Adiestramiento Animal', 'P', 'Los compañeros animales reciben +20 puntos de vitalidad, +2 al daño y +2 a la Destreza.'),
    (15, 'Cuádruple Compañero', 'P', 'Hasta cuatro compañeros animales en combate, con un máximo de dos animales de categoría poco común.'),
    (16, 'Resistencia a Animales Ponzoñosos', 'P', 'Inmune al veneno de animales (mordeduras, picaduras o toxinas de criaturas ponzoñosas).'),
    (16, 'Zoología Suprema', 'P', 'Conocimiento profundo sobre características y hábitat de animales de categoría 3.'),
    (17, 'Tiro en Movimiento', 'P', 'Puede realizar un ataque a distancia al finalizar su movimiento.'),
    (18, 'Quíntuple Compañero', 'P', 'Hasta cinco compañeros animales en combate, con un máximo de dos de categoría poco común y un animal épico o mítico.'),
    (18, 'Influencia Animal', 'A', 'Inspira a los compañeros animales dentro de su rango, otorgando +2 a un modificador de característica y +15 de vitalidad.'),
    (18, 'Doma de Animales Excepcionales', 'A', 'Puede domesticar animales míticos o épicos.'),
    (20, 'Doma de Bestias Extraordinarias', 'A', 'Puede domesticar animales extraordinarios o legendarios.'),
    (20, 'Manada', 'P', 'Hasta seis animales en combate, con un máximo de tres poco comunes, dos épicos o míticos y un legendario.'),
    (20, 'Zoólogo', 'P', 'Conocimiento profundo sobre características y hábitat de animales de categoría 4.')
  ) AS a(level, name, action, description)
WHERE c.name = 'Cazador';
