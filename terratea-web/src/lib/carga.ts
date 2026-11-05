import type { PersonajeBd } from './sync'

const FRAC: Record<string, number> = { '½': 0.5, '¼': 0.25, '¾': 0.75 }

/** Peso en kg desde texto del libro: «1/2», «½», «1 1/2», «0,5», «2.00». Lo no legible cuenta 0. */
export function pesoNum(v: string | number | null | undefined): number {
  if (v == null) return 0
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  let s = v.trim().replace(',', '.')
  let suma = 0
  for (const [c, n] of Object.entries(FRAC)) if (s.includes(c)) { suma += n; s = s.replace(c, ' ') }
  const m = s.match(/(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)/)
  if (m) return suma + (m[1] ? Number(m[1]) : 0) + Number(m[2]) / Number(m[3])
  const n = Number(s)
  return suma + (Number.isFinite(n) ? n : 0)
}

export function cargaTotal(p: Pick<PersonajeBd, 'inventory' | 'weapons'>): number {
  return p.inventory.reduce((s, i) => s + pesoNum(i.weight_kg) * i.quantity, 0)
    + p.weapons.reduce((s, w) => s + pesoNum(w.weight), 0)
}
