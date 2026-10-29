import razasJson from '../data/razas.json'
import clasesJson from '../data/clases.json'
import caracJson from '../data/caracteristicas.json'
import armasJson from '../data/equipo/armas.json'
import armadurasJson from '../data/equipo/armaduras.json'
import objetosJson from '../data/equipo/objetos.json'
import type { Raza, Clase, Atributo, Arma, Armadura, ObjetoBase } from '../data/types'

export const razas = razasJson.razas as unknown as Raza[]
export const clases = clasesJson.clases as unknown as Clase[]
export const atributos = caracJson.atributos as unknown as Atributo[]
export const armas = armasJson as unknown as Arma[]
export const armaduras = armadurasJson as unknown as Armadura[]
export const objetos = objetosJson as unknown as ObjetoBase[]

export const razaPorId = (id: string) => razas.find((r) => r.id === id)
export const clasePorId = (id: string) => clases.find((c) => c.id === id)

/** Clave de una raza en `clases[].razas_disponibles[].raza` (los renegados llevan subraza). */
export const claveRaza = (razaId: string, subrazaId?: string) =>
  razaId === 'renegado' && subrazaId ? `renegado/${subrazaId}` : razaId

export const clasesParaRaza = (razaId: string, subrazaId?: string) => {
  const clave = claveRaza(razaId, subrazaId)
  return clases.filter((c) => c.razas_disponibles.some((r) => r.raza === clave && r.disponible))
}

export const razasParaClase = (c: Clase) =>
  c.razas_disponibles.filter((r) => r.disponible).map((r) => ({
    ...r,
    // renegado/hombre-lobo → página de la raza «renegado»
    enlace: r.raza.split('/')[0],
  }))

export const img = (ruta: string) => `${import.meta.env.BASE_URL}${ruta}`

export const NOMBRE_ATRIBUTO: Record<string, string> = Object.fromEntries(
  atributos.map((a) => [a.id, a.nombre]),
)
