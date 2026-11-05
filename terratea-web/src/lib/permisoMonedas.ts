import { puede, useSesion } from './auth'

/** ¿Puede el usuario subir/fijar monedas (Master o superior)? Si no, solo puede gastarlas. */
export const useEsMaster = () => puede(useSesion(), 'MASTER')
