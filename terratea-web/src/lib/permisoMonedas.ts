/** ¿Puede el usuario subir/fijar monedas (Master)? Si no, solo puede gastarlas.
 *  TODO(merge con roles-login): devolver `puede(useSesion(), 'MASTER')` (lib/auth.ts). Ahora todos son Master (pruebas). */
export const useEsMaster = () => true
