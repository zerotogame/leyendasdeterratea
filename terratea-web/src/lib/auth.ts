const ID_POR_DEFECTO = Number(import.meta.env.VITE_USER_ID ?? 7)

/** Usuario dueño de los datos: el de pruebas (VITE_USER_ID). Sin login real. */
export const idUsuario = () => ID_POR_DEFECTO

/** Sin sesión todavía: la petición va tal cual. */
export const conAuth = (init: RequestInit = {}): RequestInit => init
