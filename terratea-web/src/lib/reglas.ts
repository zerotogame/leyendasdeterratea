import { atributos } from './datos'
import type { AtributoId, Clase, Arma, Armadura, ObjetoBase } from '../data/types'

export const IDS_ATRIBUTO: AtributoId[] = ['fuerza', 'destreza', 'constitucion', 'inteligencia', 'sabiduria', 'carisma']

// ---------- dados ----------
const d = (caras: number) => 1 + Math.floor(Math.random() * caras)

/** Cuatro dados de 6 sin ordenar; el total descarta el más bajo (texto/04-caracteristicas-principales.md). */
export const totalSinMenor = (dados: number[]) => dados.reduce((s, x) => s + x, 0) - Math.min(...dados)
/** 7 tiradas de 4D6 con el detalle de cada dado; la más baja se descarta al repartir. */
export const tirar7 = () => Array.from({ length: 7 }, () => [d(6), d(6), d(6), d(6)])
export const tirarFortuna = () => ({ oro: d(20), plata: d(8), cobre: d(6) })
export const tirarVitalidad = () => d(12)

// ---------- modificadores ----------
// Las tablas de caracteristicas.json perdieron el signo «-» de las filas negativas
// (3→"3", 4-5→"2", 6-9→"1"; el libro dice -3, -2, -1). Una cifra sin «+» y distinta de 0 es negativa.
const parseMod = (txt: string) => {
  const t = txt.trim()
  if (t.startsWith('+')) return Number(t.slice(1))
  const n = Number(t)
  return n === 0 ? 0 : -Math.abs(n)
}

const enRango = (puntuacion: number, rango: string) => {
  const nums = rango.match(/\d+/g)?.map(Number) ?? []
  if (nums.length === 0) return false
  if (/\+/.test(rango)) return puntuacion >= nums[0]
  if (nums.length === 1) return puntuacion === nums[0]
  return puntuacion >= nums[0] && puntuacion <= nums[1]
}

export const modificador = (id: AtributoId, puntuacion: number): number => {
  const tabla = atributos.find((a) => a.id === id)!.tabla_modificadores
  const [colPunt, colMod] = tabla.columnas
  for (const fila of tabla.filas as Record<string, string>[]) {
    if (enRango(puntuacion, fila[colPunt])) return parseMod(fila[colMod])
  }
  return 0
}

export const fmtMod = (n: number) => (n > 0 ? `+${n}` : String(n))

// ---------- requisitos de clase ----------
export type Requisito = { atributo: AtributoId; minimo: number; texto: string }
export const requisitosAtributo = (c: Clase) =>
  c.requisitos.filter((r): r is Requisito => 'atributo' in r && !!r.atributo)
export const requisitosTexto = (c: Clase) =>
  c.requisitos.filter((r) => !('atributo' in r && r.atributo)).map((r) => r.texto)

export type Puntuaciones = Partial<Record<AtributoId, number>>
export const requisitosCumplidos = (c: Clase, p: Puntuaciones) =>
  requisitosAtributo(c).every((r) => (p[r.atributo] ?? 0) >= r.minimo)

// ---------- monedas: 1 M.O. = 10 M.P. = 100 M.C. (CLAUDE.md) ----------
export type Monedas = { oro: number; plata: number; cobre: number }
export const aCobre = (m: Monedas) => m.oro * 100 + m.plata * 10 + m.cobre

export const costeEnCobre = (coste?: string): number | null => {
  // el libro a veces omite el último punto («10 M.O»)
  // hay precios con dos monedas («7 M.O. 5 M.P.» = 750 cobres): se suman todas
  const partes = [...(coste?.replace(/\s+/g, ' ').matchAll(/(\d+)\s*M\.?([OPC])\.?/gi) ?? [])]
  if (!partes.length) return null
  return partes.reduce((s, m) => s + Number(m[1]) * ({ O: 100, P: 10, C: 1 }[m[2].toUpperCase() as 'O'] ?? 1), 0)
}

export const fmtCobre = (c: number) => {
  const oro = Math.floor(c / 100), plata = Math.floor((c % 100) / 10), cobre = c % 10
  return [oro && `${oro} M.O.`, plata && `${plata} M.P.`, (cobre || c === 0) && `${cobre} M.C.`]
    .filter(Boolean).join(' ')
}

export const limpiar = (t?: string) => t?.replace(/\s*\n\s*/g, ' ').trim() ?? ''

// ---------- C.A. ----------
// C.A. = 9 + suma de las piezas, truncando el decimal (texto/04: -5,87 → -5).
export const aporteCA = (a: Armadura): number => {
  const txt = a.clase_armadura ?? ''
  const nums = [...txt.matchAll(/:\s*(-?\d+(?:[.,]\d+)?)/g)].map((m) => Number(m[1].replace(',', '.')))
  return nums.reduce((s, n) => s + n, 0)
}
export const calcularCA = (piezas: Armadura[]) => 9 + Math.trunc(piezas.reduce((s, a) => s + aporteCA(a), 0))

export const tipoArmadura = (a: Armadura): 'ligera' | 'media' | 'pesada' | null => {
  const c = (a.categoria ?? '').toUpperCase()
  if (c.includes('LIGERA')) return 'ligera'
  if (c.includes('MEDIA')) return 'media'
  if (c.includes('PESADA')) return 'pesada'
  return null // escudos, mascotas/monturas
}

export const armaduraPermitida = (c: Clase, a: Armadura) => {
  const t = tipoArmadura(a)
  return t ? !!c.armadura[t] : true
}

export type ItemEquipo = (Arma | Armadura | ObjetoBase) & { nombre: string }
