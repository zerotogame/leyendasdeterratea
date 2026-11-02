-- v0.16: roles de usuario estilo Jira (un usuario puede tener varios roles y un rol varios usuarios). Se puede ejecutar varias veces.
CREATE TABLE IF NOT EXISTS public.roles (
  id serial PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role_id integer NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

INSERT INTO public.roles (code, name, description) VALUES
  ('PLAYER', 'Jugador', 'Crea y gestiona sus personajes y mascotas'),
  ('GUILD_LEADER', 'Líder de gremio', 'Gestiona gremios de jugadores'),
  ('MASTER', 'Master', 'Dirige la partida: encuentros, combate y recompensas'),
  ('DEVELOPER', 'Programador', 'Administra la web y sus usuarios')
ON CONFLICT (code) DO NOTHING;

-- Los usuarios existentes conservan su rol de la columna users.role (PLAYER / MASTER / ADMIN→Programador).
INSERT INTO public.user_roles (user_id, role_id)
SELECT u.id, r.id
FROM public.users u
JOIN public.roles r ON r.code = CASE WHEN u.role = 'ADMIN' THEN 'DEVELOPER' ELSE u.role END
ON CONFLICT DO NOTHING;

-- Quien se quedara sin ningún rol pasa a ser Jugador.
INSERT INTO public.user_roles (user_id, role_id)
SELECT u.id, (SELECT id FROM public.roles WHERE code = 'PLAYER')
FROM public.users u
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = u.id)
ON CONFLICT DO NOTHING;
