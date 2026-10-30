import { clases } from './datos'
import { alcanceMaximo, infoHabilidad } from './danio'
import type { Combatiente } from './combate'
import type { PersonajeBd } from './sync'

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

/** Modificador ya calculado por el backend (con su signo) del atributo cuyo nombre empieza por `clave`. */
const modDe = (p: PersonajeBd, clave: string) => {
  const k = Object.keys(p.attributes ?? {}).find((n) => norm(n).startsWith(clave))
  return k ? p.attributes[k].modifier : 0
}

/** Convierte una ficha de la base de datos en combatiente: vida, movimiento de combate, alcance, armas y habilidades de clase ya alcanzadas. */
export function combatienteDeFicha(p: PersonajeBd): Combatiente {
  const clase = clases.find((c) => norm(c.nombre) === norm(p.class))
  const armas = p.weapons
    .filter((w) => w.name)
    .map((w) => ({ nombre: w.name, dados: (w.total ?? w.damage ?? null) || null }))
  return {
    uid: crypto.randomUUID(), criaturaId: '', nombre: p.name.split(/\s+/)[0] || p.name, bando: 'jugador', fichaId: p.id,
    vidaMax: p.hit_points, vida: p.hit_points, ca: p.armor_class,
    movimiento: p.rollMovements?.Combate ?? null, alcance: alcanceMaximo(p.range_reach),
    nivel: p.level, clase: p.class, armas,
    mods: { fuerza: modDe(p, 'fuerza'), destreza: modDe(p, 'destreza'), constitucion: modDe(p, 'constitucion') },
    extras: [...(p.specialSkills ?? []), ...(p.extraAttributes ?? [])],
    // una habilidad sin nivel en el libro no se asume alcanzada
    habilidades: (clase?.habilidades ?? []).filter((h) => h.nivel != null && h.nivel <= p.level).map((h) => infoHabilidad(h.nombre, h.descripcion, h.tipo)),
  }
}
