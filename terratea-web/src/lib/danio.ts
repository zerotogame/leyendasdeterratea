import type { HabilidadCombate } from './combate'

/** Conceptos de daño del Libro 1 (reglas básicas): resistente = mitad, vulnerable = doble, inmune = nada. */
export type Multiplicador = 'normal' | 'resistente' | 'vulnerable' | 'inmune'
export const FACTOR: Record<Multiplicador, number> = { normal: 1, resistente: 0.5, vulnerable: 2, inmune: 0 }
export const ETIQUETA_MULT: Record<Multiplicador, string> = { normal: 'Normal', resistente: 'Resistente ½', vulnerable: 'Vulnerable ×2', inmune: 'Inmune 0' }

export type Resolucion = { bruto: number; tras: number; final: number }

/** (base + bonos) × factor, redondeando hacia abajo, y después se resta lo que el objetivo absorba. Nunca baja de 0. */
export function resolverDano(base: number, bonos: number, mult: Multiplicador, reduccion: number): Resolucion {
  const bruto = Math.max(0, base + bonos)
  const tras = Math.floor(bruto * FACTOR[mult])
  return { bruto, tras, final: Math.max(0, tras - Math.max(0, reduccion)) }
}

/** «Sana la mitad del daño causado», redondeando hacia abajo. */
export const curaMitad = (dano: number) => Math.floor(Math.max(0, dano) / 2)

/** Bonificador de daño de un texto de habilidad: «+2 al daño», «+1 tanto … como el daño», «su daño en +2». null si no hay uno claro. */
export function bonoDeTexto(t: string): number | null {
  const m = /\+(\d+)\s+tanto[^.]*?como\s+(?:el\s+)?da[ñn]o/i.exec(t)
    ?? /da[ñn]o\s+en\s+\+(\d+)/i.exec(t)
    ?? /\+(\d+)\s+(?:al|el)\s+da[ñn]o/i.exec(t)
  return m ? Number(m[1]) : null
}

export const infoHabilidad = (nombre: string, descripcion: string, tipo?: string | null): HabilidadCombate => ({
  nombre, descripcion, activa: tipo === 'activa', bonoDano: bonoDeTexto(descripcion), curaMitad: /sana\s+la\s+mitad\s+del\s+da[ñn]o/i.test(descripcion),
})

/** «+1 Daño por oscuridad» (extra de la ficha) → 1. Solo si empieza con el bono y habla de daño. */
export const bonoDeExtra = (t: string): number | null => {
  const m = /^\s*\+(\d+)\s+da[ñn]o/i.exec(t)
  return m ? Number(m[1]) : null
}

/** «1-2» → 2 (alcance máximo), «7» → 7. Cualquier otro texto → null. */
export const alcanceMaximo = (r: string | null | undefined) => (r && /^\d+(-\d+)*$/.test(r.trim()) ? Number(r.trim().split('-').pop()) : null)

export type Tirada = { total: number; detalle: string }

/** Tira una expresión como «2D4», «1D6 + 2D20» o «1D8 + 2». null si no se entiende. */
export function tirarExpresion(expr: string, rnd: () => number = Math.random): Tirada | null {
  const partes = expr.split('+').map((p) => p.trim())
  if (partes.length === 0 || partes.some((p) => !p)) return null
  let total = 0
  const detalle: string[] = []
  for (const p of partes) {
    const d = /^(\d+)\s*d\s*(\d+)$/i.exec(p)
    if (d) {
      const n = Number(d[1]), caras = Number(d[2])
      if (n < 1 || n > 100 || caras < 1) return null
      const r = Array.from({ length: n }, () => 1 + Math.floor(rnd() * caras))
      total += r.reduce((a, b) => a + b, 0)
      detalle.push(`${n}D${caras} [${r.join(', ')}]`)
    } else if (/^\d+$/.test(p)) {
      total += Number(p)
      detalle.push(p)
    } else return null
  }
  return { total, detalle: detalle.join(' + ') }
}

// ---------------------------------------------------------------- pasivas: ¿cuándo suman?
/** `danado` = «cuando el personaje está dañado», `cero` = «llega a 0 de vitalidad», `depende` = otra condición que decide el Máster. */
export type Condicion = 'ninguna' | 'danado' | 'cero' | 'depende'

export function condicionDe(descripcion: string): Condicion {
  if (/llega\s+a\s+0\s+de\s+vitalidad/i.test(descripcion)) return 'cero'
  if (/est[áa]\s+da[ñn]ado/i.test(descripcion)) return 'danado'
  if (/\b(si|cuando|siempre\s+que|cuerpo\s+a\s+cuerpo|a\s+distancia)\b/i.test(descripcion)) return 'depende'
  return 'ninguna'
}

/** La frase de la condición tal como la escribe el libro («si el objetivo tiene un nivel igual o menor…»). */
export const textoCondicion = (descripcion: string): string | null =>
  /\b(si\s[^.]+|cuando\s[^.,]+|en\s+combates?\s[^.,]+)/i.exec(descripcion)?.[1].trim() ?? null

/** true/false si la app puede comprobarlo con la vida del combatiente; null si lo tiene que decidir el Máster. */
export function cumpleCondicion(c: Condicion, v: { vida: number; vidaMax: number | null }): boolean | null {
  if (c === 'ninguna') return true
  if (c === 'cero') return v.vida <= 0
  if (c === 'danado') return v.vidaMax == null ? null : v.vida < v.vidaMax
  return null
}

/** Pasiva sin número que habla de atacar o de daño: se muestra como recordatorio. */
export const relevanteEnCombate = (h: HabilidadCombate) =>
  !h.activa && h.bonoDano == null && !h.curaMitad && /da[ñn]o|\batac(?:ar|a|e)\b|golpe/i.test(h.descripcion)

/** «No puede quedarse K.O. al llegar a 0 de vitalidad» (Frenesí asesino): sigue combatiendo a 0. */
export const actuaA0 = (c: { habilidades?: HabilidadCombate[] }) =>
  (c.habilidades ?? []).some((h) => /no\s+puede\s+quedarse\s+k\.?\s?o/i.test(h.descripcion))
