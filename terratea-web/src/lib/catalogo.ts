import armasJson from '../data/equipo/armas.json'
import armadurasJson from '../data/equipo/armaduras.json'
import ropajesJson from '../data/equipo/ropajes.json'
import objetosJson from '../data/equipo/objetos.json'
import transportesJson from '../data/equipo/transportes.json'
import joyeriaJson from '../data/equipo/joyeria.json'
import gemasJson from '../data/equipo/gemas.json'
import metalesJson from '../data/equipo/metales.json'
import telasJson from '../data/equipo/telas.json'
import librosJson from '../data/equipo/libros.json'
import comprasJson from '../data/equipo/compras_gremio.json'
import contratosJson from '../data/equipo/contratos_npj.json'
import type { ObjetoBase } from '../data/types'

export interface Campo { clave: string; etiqueta: string }
export interface Catalogo {
  id: string
  nombre: string
  descripcion: string
  /** Campo por el que se agrupa y filtra (categoria, tipo…). */
  grupo: string
  /** Campo que se muestra como precio destacado. */
  precio?: string
  campos: Campo[]
  items: ObjetoBase[]
}

const c = (clave: string, etiqueta: string): Campo => ({ clave, etiqueta })
const lista = (j: unknown) => j as ObjetoBase[]

export const CATALOGOS: Catalogo[] = [
  { id: 'objetos', nombre: 'Objetos', descripcion: 'Útiles para la aventura.', grupo: 'categoria', precio: 'coste',
    campos: [c('peso', 'Peso')], items: lista(objetosJson) },
  { id: 'armas', nombre: 'Armas', descripcion: 'Armas cuerpo a cuerpo, a distancia y munición.', grupo: 'tipo', precio: 'coste',
    campos: [c('dano', 'Daño'), c('manos', 'Manos'), c('rango', 'Rango'), c('peso', 'Peso'), c('clase_peso', 'Clase')], items: lista(armasJson) },
  { id: 'armaduras', nombre: 'Armaduras', descripcion: 'Armaduras ligeras, medias, pesadas y escudos.', grupo: 'categoria', precio: 'coste',
    campos: [c('clase_armadura', 'C.A.'), c('peso', 'Peso'), c('ruido', 'Ruido'), c('atributos_extra', 'Extra'), c('cantidad', 'Cantidad')], items: lista(armadurasJson) },
  { id: 'ropajes', nombre: 'Ropajes', descripcion: 'Ropa común y de viaje.', grupo: 'categoria', precio: 'coste',
    campos: [c('peso', 'Peso')], items: lista(ropajesJson) },
  { id: 'transportes', nombre: 'Transportes', descripcion: 'Monturas, animales, vehículos terrestres y acuáticos.', grupo: 'categoria', precio: 'coste',
    campos: [c('velocidad', 'Velocidad'), c('carga', 'Carga'), c('poderio_militar', 'Poderío militar'), c('durabilidad', 'Durabilidad'), c('mantenimiento', 'Mantenimiento'), c('dimensiones', 'Dimensiones')], items: lista(transportesJson) },
  { id: 'joyeria', nombre: 'Joyería', descripcion: 'Joyería y bisutería.', grupo: 'categoria', precio: 'coste',
    campos: [c('peso', 'Peso')], items: lista(joyeriaJson) },
  { id: 'gemas', nombre: 'Gemas', descripcion: 'Tabla de gemas.', grupo: 'categoria', precio: 'valor',
    campos: [c('resistencia', 'Resistencia')], items: lista(gemasJson) },
  { id: 'metales', nombre: 'Metales', descripcion: 'Tabla de metales.', grupo: 'categoria',
    campos: [c('descripcion', 'Descripción')], items: lista(metalesJson) },
  { id: 'telas', nombre: 'Telas', descripcion: 'Tabla de telas.', grupo: 'categoria',
    campos: [c('descripcion', 'Descripción')], items: lista(telasJson) },
  { id: 'libros', nombre: 'Libros', descripcion: 'Librería.', grupo: 'categoria', precio: 'coste',
    campos: [c('peso', 'Peso')], items: lista(librosJson) },
  { id: 'gremio', nombre: 'Compras de gremio', descripcion: 'Mobiliario y mejoras para la sede del gremio.', grupo: 'categoria', precio: 'precio',
    campos: [c('descripcion', 'Descripción')], items: lista(comprasJson) },
  { id: 'contratos', nombre: 'Contratos de PNJ', descripcion: 'Personal contratable y su mantenimiento.', grupo: 'categoria', precio: 'coste_mantenimiento',
    campos: [c('descripcion', 'Descripción')], items: lista(contratosJson) },
]

export const catalogoPorId = (id: string) => CATALOGOS.find((x) => x.id === id)
export const totalObjetos = CATALOGOS.reduce((n, x) => n + x.items.length, 0)

/** Los textos del manual traen saltos de línea sueltos («15\nM.O.», «MAZA/\nLÁTIGO»). */
export const limpiar = (v: string | undefined) => (v ?? '').replace(/\s*\n\s*/g, ' ').trim()

const sinTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export const grupoDe = (cat: Catalogo, o: ObjetoBase) => limpiar(o[cat.grupo]) || 'Sin clasificar'

export const gruposDe = (cat: Catalogo) => [...new Set(cat.items.map((o) => grupoDe(cat, o)))]

export function filtrarCatalogo(cat: Catalogo, q: string, grupo: string) {
  const t = sinTildes(q.trim())
  return cat.items.filter((o) => {
    if (grupo && grupoDe(cat, o) !== grupo) return false
    if (!t) return true
    return sinTildes(Object.values(o).filter(Boolean).join(' ')).includes(t)
  })
}

/** Una entrada junto al listado al que pertenece (para la vista «Todos»). */
export interface Entrada { cat: Catalogo; o: ObjetoBase }

export const todasLasEntradas = (): Entrada[] => CATALOGOS.flatMap((cat) => cat.items.map((o) => ({ cat, o })))

export function filtrarTodos(q: string, catId: string): Entrada[] {
  const t = sinTildes(q.trim())
  return todasLasEntradas().filter(({ cat, o }) => {
    if (catId && cat.id !== catId) return false
    return !t || sinTildes(Object.values(o).filter(Boolean).join(' ')).includes(t)
  })
}
