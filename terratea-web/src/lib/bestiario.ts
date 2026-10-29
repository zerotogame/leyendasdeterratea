import bestiarioJson from '../data/libro2/bestiario.json'
import reglasJson from '../data/libro2/bestiario_reglas.json'
import type { Criatura, ReglasBestiario, TipoCriatura } from '../data/libro2.types'

export const criaturas = bestiarioJson as unknown as Criatura[]
export const reglas = reglasJson as unknown as ReglasBestiario

export const criaturaPorId = (id: string) => criaturas.find((c) => c.id === id)
export const categoriaInfo = (id: number) => reglas.categorias.find((c) => c.id === id)

/** Las rutas del Libro 2 viven en public/img/libro2/ (la carpeta `portadas` existe también en el Libro 1). */
export const img2 = (ruta: string) => `${import.meta.env.BASE_URL}img/libro2/${ruta.replace(/^img\//, '')}`

/** `null` en un campo numérico = «¿?» en el libro. */
export const fmtNum = (n: number | null) => (n == null ? '¿?' : n.toLocaleString('es-ES'))

export const NOMBRE_PLANO: Record<string, string> = {
  terrenal: 'Terrenal', espiritual: 'Espiritual', elemental: 'Elemental', infernal: 'Infernal',
  sagrado: 'Sagrado', abisal: 'Abisal', arcano: 'Arcano', atemporal: 'Atemporal', ensueno: 'Ensueño',
  astral: 'Astral', desconocido: 'Desconocido', multiples: 'Múltiples',
}
export const NOMBRE_EJE: Record<string, string> = { legal: 'Legal', neutral: 'Neutral', caotico: 'Caótico' }

// ---------------------------------------------------------------- filtros
export type Rango = [number | null, number | null]
export type Orden = 'nombre' | 'categoria' | 'px' | 'vitalidad' | 'ca'

export type Filtros = {
  q: string
  cats: number[]
  tipos: TipoCriatura[]
  plano: string
  ali: string
  px: Rango
  ca: Rango
  vit: Rango
  orden: Orden
  desc: boolean
}

export const FILTROS_VACIOS: Filtros = {
  q: '', cats: [], tipos: [], plano: '', ali: '', px: [null, null], ca: [null, null], vit: [null, null],
  orden: 'nombre', desc: false,
}

const sinTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Con un rango activo, una criatura con «¿?» no se puede comparar y se excluye. */
const enRango = (v: number | null, [min, max]: Rango) => {
  if (min == null && max == null) return true
  if (v == null) return false
  return (min == null || v >= min) && (max == null || v <= max)
}

export function filtrar(lista: Criatura[], f: Filtros): Criatura[] {
  const q = sinTildes(f.q.trim())
  const res = lista.filter((c) =>
    (!q || sinTildes(c.nombre).includes(q))
    && (f.cats.length === 0 || f.cats.includes(c.categoria))
    && (f.tipos.length === 0 || f.tipos.every((t) => c.tipos.includes(t)))
    && (!f.plano || c.planos.includes(f.plano as never))
    && (!f.ali || c.alineamiento_ejes.includes(f.ali as never))
    && enRango(c.px, f.px) && enRango(c.ca, f.ca) && enRango(c.vitalidad, f.vit))

  const clave = (c: Criatura): number | string | null =>
    f.orden === 'nombre' ? c.nombre : f.orden === 'categoria' ? c.categoria
      : f.orden === 'px' ? c.px : f.orden === 'vitalidad' ? c.vitalidad : c.ca
  const dir = f.desc ? -1 : 1
  return [...res].sort((a, b) => {
    const x = clave(a), y = clave(b)
    if (x == null && y == null) return a.nombre.localeCompare(b.nombre, 'es')
    if (x == null) return 1 // los «¿?» siempre al final
    if (y == null) return -1
    const c = typeof x === 'string' ? x.localeCompare(y as string, 'es') : x - (y as number)
    return (c || a.nombre.localeCompare(b.nombre, 'es')) * dir
  })
}

// ---------------------------------------------------------------- filtros ⇄ URL
const num = (s: string | null): number | null => {
  if (s == null || s.trim() === '') return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}
const ORDENES: Orden[] = ['nombre', 'categoria', 'px', 'vitalidad', 'ca']

export function leerFiltros(sp: URLSearchParams): Filtros {
  const tiposValidos = reglas.tipos.map((t) => t.id)
  const orden = sp.get('orden') as Orden
  return {
    q: sp.get('q') ?? '',
    cats: (sp.get('cats') ?? '').split(',').map(Number).filter((n) => n >= 1 && n <= 5),
    tipos: (sp.get('tipos') ?? '').split(',').filter((t): t is TipoCriatura => (tiposValidos as string[]).includes(t)),
    plano: reglas.planos.includes((sp.get('plano') ?? '') as never) ? sp.get('plano')! : '',
    ali: ['legal', 'neutral', 'caotico'].includes(sp.get('ali') ?? '') ? sp.get('ali')! : '',
    px: [num(sp.get('pxmin')), num(sp.get('pxmax'))],
    ca: [num(sp.get('camin')), num(sp.get('camax'))],
    vit: [num(sp.get('vitmin')), num(sp.get('vitmax'))],
    orden: ORDENES.includes(orden) ? orden : 'nombre',
    desc: sp.get('desc') === '1',
  }
}

export function aParams(f: Filtros): URLSearchParams {
  const sp = new URLSearchParams()
  const set = (k: string, v: string | number | null) => { if (v !== null && v !== '') sp.set(k, String(v)) }
  set('q', f.q.trim())
  set('cats', f.cats.join(','))
  set('tipos', f.tipos.join(','))
  set('plano', f.plano); set('ali', f.ali)
  set('pxmin', f.px[0]); set('pxmax', f.px[1])
  set('camin', f.ca[0]); set('camax', f.ca[1])
  set('vitmin', f.vit[0]); set('vitmax', f.vit[1])
  if (f.orden !== 'nombre') sp.set('orden', f.orden)
  if (f.desc) sp.set('desc', '1')
  return sp
}

// ---------------------------------------------------------------- dados
export type Rng = () => number
export type TiradaDano = { partes: { caras: number; resultados: number[] }[]; total: number; formula: string }

/** Tira los dados de `criatura.dano.dados`. Devuelve null si el libro no da dados (p. ej. «¿?»). */
export function tirarDano(c: Criatura, rng: Rng = Math.random): TiradaDano | null {
  const dados = c.dano.dados
  if (!dados.length) return null
  const partes = dados.map(({ cantidad, caras }) => ({
    caras,
    resultados: Array.from({ length: cantidad }, () => 1 + Math.floor(rng() * caras)),
  }))
  return {
    partes,
    total: partes.reduce((s, p) => s + p.resultados.reduce((a, b) => a + b, 0), 0),
    formula: c.dano.formula ?? partes.map((p) => `${p.resultados.length}D${p.caras}`).join(' + '),
  }
}

// ---------------------------------------------------------------- encuentros
/** Elige `n` criaturas al azar de `pool`; `fijas` se conservan en su posición. Sin repetidas salvo `repetir`. */
export function generarEncuentro(
  pool: Criatura[], n: number, opciones: { repetir?: boolean; fijas?: (Criatura | null)[]; rng?: Rng } = {},
): Criatura[] {
  const { repetir = false, fijas = [], rng = Math.random } = opciones
  const res: Criatura[] = []
  const usadas = new Set<string>(fijas.filter((c): c is Criatura => !!c).map((c) => c.id))
  for (let i = 0; i < n; i++) {
    const fija = fijas[i]
    if (fija) { res.push(fija); continue }
    const candidatas = repetir ? pool : pool.filter((c) => !usadas.has(c.id))
    if (candidatas.length === 0) break
    const elegida = candidatas[Math.floor(rng() * candidatas.length)]
    usadas.add(elegida.id)
    res.push(elegida)
  }
  return res
}

/** Suma de P.X. y cuántas criaturas tienen P.X. «¿?» (no suman). */
export const sumaPx = (lista: Criatura[]) => ({
  total: lista.reduce((s, c) => s + (c.px ?? 0), 0),
  desconocidos: lista.filter((c) => c.px == null).length,
})
