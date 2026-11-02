import { armaduras, clasePorId, razaPorId } from './datos'
import { IDS_ATRIBUTO, aCobre, calcularCA, fmtMod, limpiar, modificador, tipoArmadura, vitalidadInicial } from './reglas'
import { costeCompra, itemCompra, nombreCompra, puntuacionesDe, type DatosFicha } from './personajes'
import { urlImagen, type PersonajeBd } from './sync'
import type { Arma, Clase } from '../data/types'

export type ArmaHoja = { nombre: string; peso: string; mano: string; dano: string; especial: string }

/** Lo que se escribe sobre la ficha oficial. Un campo vacío se deja en blanco para rellenarlo a mano. */
export type DatosHoja = {
  raza: string; clase: string
  personaje: string; jugador: string; alineamiento: string; gremio: string
  altura: string; peso: string; edad: string; sexo: string; cabello: string; ojos: string; marcas: string
  atributos: string[] // fuerza … carisma, «valor (mod)»
  salvaciones: string[] // venenos, magia, sortilegios, quemaduras, petrificación
  movimiento: string[] // base, combate, carrera, sobrepeso, huida
  rango: string; ca: string; esquiva: string; vida: string
  oro: string; plata: string; cobre: string
  nivel: string; exp: string; nec: string; carga: string
  armas: ArmaHoja[]
  equipo: string[]; municion: string[]; habilidades: string[]; extra: string[]
  retrato: string // URL de la imagen del personaje ('' si no tiene)
}

// Flechas, virotes, dardos y proyectiles van a la caja de munición en vez de al equipo
const esMunicion = (nombre: string) => /^(flecha|virote|dardo|proyectil)/i.test(nombre.trim())

const txt = (v: unknown) => (v == null ? '' : String(v))
const attr = (valor: number, mod: number) => `${valor} (${fmtMod(mod)})`
const habilidadesDe = (clase: Clase | undefined, nivel: number) =>
  (clase?.habilidades ?? []).filter((h) => h.nivel != null && h.nivel <= nivel)
    .map((h) => (h.tipo ? `${h.nombre} (${h.tipo})` : h.nombre))

export function hojaDeFicha(e: DatosFicha, retrato = ''): DatosHoja {
  const raza = razaPorId(e.razaId)!
  const clase = clasePorId(e.claseId)!
  const pt = puntuacionesDe(e)
  const piezas = e.compras.filter((c) => c.tipo === 'armadura').map((c) => armaduras[c.idx])
    .filter((a) => tipoArmadura(a) || /ESCUDO/i.test(a.categoria ?? ''))
  const modCon = modificador('constitucion', pt.constitucion ?? 10)
  const resto = e.fortuna ? Math.max(0, aCobre(e.fortuna) - e.compras.reduce((s, c) => s + (costeCompra(c) ?? 0), 0)) : null
  const s = raza.tiradas_salvacion[0]
  const m = clase.movimiento
  return {
    raza: raza.nombre, clase: clase.nombre,
    personaje: e.nombre, jugador: '', alineamiento: '', gremio: '',
    altura: '', peso: '', edad: '', sexo: '', cabello: '', ojos: '', marcas: '',
    atributos: IDS_ATRIBUTO.map((id) => (pt[id] != null ? attr(pt[id]!, modificador(id, pt[id]!)) : '')),
    salvaciones: s ? [s.venenos_toxicos, s.magia_maldiciones, s.sortilegios_encantamientos_trampas, s.quemadura_desangrado, s.paralisis_petrificacion_control_mental].map(txt) : [],
    movimiento: [m.base, m.combate, m.carrera, m.carga, m.huida].map(txt),
    rango: txt(clase.rango_distancia), ca: String(calcularCA(piezas)),
    esquiva: pt.destreza != null ? fmtMod(modificador('destreza', pt.destreza)) : '',
    vida: e.vida != null ? String(vitalidadInicial(e.vida, modCon)) : '',
    oro: resto != null ? String(Math.floor(resto / 100)) : '', plata: resto != null ? String(Math.floor((resto % 100) / 10)) : '', cobre: resto != null ? String(resto % 10) : '',
    nivel: '1', exp: '0', nec: '', carga: '',
    armas: e.compras.filter((c) => c.tipo === 'arma' && !esMunicion(nombreCompra(c))).map((c) => {
      const a = itemCompra(c) as Arma
      return { nombre: nombreCompra(c), peso: txt(a.peso), mano: txt(a.manos), dano: limpiar(a.dano), especial: '' }
    }),
    equipo: [...clase.equipo_inicial.filter((x) => !/^ningun[oa]$/i.test(x.trim())), ...e.compras.map(nombreCompra)].filter((x) => !esMunicion(x)),
    municion: [...clase.equipo_inicial, ...e.compras.map(nombreCompra)].filter(esMunicion),
    habilidades: habilidadesDe(clase, 1), extra: [], retrato,
  }
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const porPrefijo = (o: Record<string, number>, prefijos: string[]) =>
  prefijos.map((p) => txt(Object.entries(o).find(([k]) => norm(k).startsWith(p))?.[1]))

const lineaInventario = (i: PersonajeBd['inventory'][number]) =>
  `${i.name}${i.quantity > 1 ? ` (${i.quantity})` : ''}${i.note ? ` — ${i.note}` : ''}`

export function hojaDeBd(p: PersonajeBd, clase: Clase | undefined): DatosHoja {
  const carga = p.inventory.reduce((s, i) => s + (Number(i.weight_kg) || 0) * i.quantity, 0)
    + p.weapons.reduce((s, w) => s + (Number(w.weight) || 0), 0)
  const a = (prefijo: string) => {
    const x = Object.entries(p.attributes).find(([k]) => norm(k).startsWith(prefijo))?.[1]
    return x ? attr(x.value, x.modifier) : ''
  }
  return {
    raza: p.race, clase: p.class,
    personaje: p.name, jugador: txt(p.player_name), alineamiento: txt(p.alignment), gremio: txt(p.guild),
    altura: txt(p.height), peso: txt(p.weight), edad: txt(p.age), sexo: txt(p.sex), cabello: txt(p.hair), ojos: txt(p.eyes), marcas: txt(p.marks),
    atributos: ['fu', 'de', 'co', 'in', 'sa', 'ca'].map(a),
    salvaciones: porPrefijo(p.rollSalvations, ['venenos', 'magia', 'sortilegios', 'quemaduras', 'petrificacion']),
    movimiento: porPrefijo(p.rollMovements, ['base', 'combate', 'carrera', 'sobrepeso', 'huida']),
    rango: txt(p.range_reach), ca: txt(p.armor_class), esquiva: p.dodge != null ? fmtMod(p.dodge) : '', vida: txt(p.hit_points),
    oro: txt(p.gold), plata: txt(p.silver), cobre: txt(p.copper),
    nivel: txt(p.level), exp: txt(p.exp), nec: txt(p.required_experience),
    carga: carga ? `${carga.toLocaleString('es-ES', { maximumFractionDigits: 2 })}${p.max_carry_kg != null ? ` / ${p.max_carry_kg}` : ''} kg` : '',
    armas: p.weapons.map((w) => ({ nombre: w.name, peso: txt(w.weight), mano: txt(w.hands), dano: txt(w.total ?? w.damage), especial: txt(w.special) })),
    equipo: p.inventory.filter((i) => !esMunicion(i.name)).map(lineaInventario),
    municion: p.inventory.filter((i) => esMunicion(i.name)).map((i) => `${i.name} ×${i.quantity}${i.note ? ` — ${i.note}` : ''}`),
    habilidades: [...habilidadesDe(clase, p.level), ...p.specialSkills],
    extra: p.extraAttributes,
    retrato: p.images?.length ? urlImagen(p.images[0].file) : '',
  }
}
