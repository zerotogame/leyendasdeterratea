// Torneos entre gremios: cuadro de eliminación con clasificatoria opcional. Se guardan en localStorage.
// Cada nodo del cuadro es una «tarjeta» (dos equipos, sin fuentes) o una «caja» cuyos candidatos son los
// ganadores de sus fuentes. El ganador de un nodo se elige entre sus candidatos (el Máster pulsa la fila).

export type Formato = '1v1' | '3v3' | 'estrategia'

/** `porEquipo`: personajes que combaten por gremio (null = sin límite). */
export const FORMATOS: Record<Formato, { titulo: string; nombre: string; porEquipo: number | null }> = {
  '1v1': { titulo: 'Duelo 1 vs 1', nombre: 'Duelo de Sangre (1v1)', porEquipo: 1 },
  '3v3': { titulo: 'Tríada 3 vs 3', nombre: 'La Tríada (3v3)', porEquipo: 3 },
  estrategia: { titulo: 'Estrategia', nombre: 'Asalto a la Fortaleza (Estrategia)', porEquipo: null },
}

export type Jugador = { id: number; nombre: string }
export type Equipo = { id: string; nombre: string; gremioId: number | null; jugadores: Jugador[] }

export type Nodo = {
  id: string
  columna: number
  fuentes: string[] // ids de los nodos cuyos ganadores llegan aquí
  equipos?: [string | null, string | null] // solo en tarjetas; null = «Sin rival»
  ganador: string | null // id de equipo elegido a mano
  pila: boolean // true: se apila en su columna; false: se centra entre sus fuentes
}

export type Torneo = {
  id: string
  nombre: string
  formato: Formato
  equipos: Equipo[]
  columnas: string[]
  nodos: Nodo[]
}

export const esTarjeta = (n: Nodo) => n.fuentes.length === 0

// ---------- Cuadro ----------

/** Titula las columnas de la fase final según cuántas cajas tienen. */
const tituloRonda = (cajas: number, ronda: number) =>
  cajas === 1 ? 'Final' : cajas === 2 ? 'Semifinales' : cajas === 4 ? 'Cuartos' : `Ronda ${ronda}`

/**
 * Cuadro para `n` equipos (n ≥ 2). E = nº de entradas de la Ronda 1 (potencia de 2 con 2E ≤ n); cada
 * plaza que sobra se resuelve con una clasificatoria (2 tarjetas → 1 entrada de la Ronda 1). Si
 * sobra un hueco, la última tarjeta de la clasificatoria queda «Sin rival».
 */
export function generarCuadro(equipos: string[]): { columnas: string[]; nodos: Nodo[] } {
  const n = equipos.length
  if (n < 2) return { columnas: [], nodos: [] }
  const E = 2 ** Math.floor(Math.log2(n / 2))
  const exceso = n - 2 * E
  const Q = Math.ceil(exceso / 2) // entradas de la Ronda 1 que salen de la clasificatoria
  const columnas: string[] = []
  const nodos: Nodo[] = []
  const cola = [...equipos]
  const tomar = () => cola.shift() ?? null
  let col = 0

  const clasif: Nodo[] = []
  if (Q > 0) {
    columnas.push('Clasificatoria')
    for (let i = 0; i < 2 * Q; i++) clasif.push({ id: `c${i + 1}`, columna: col, fuentes: [], ganador: null, pila: true })
    col++
  }
  columnas.push(E === 1 ? 'Final' : 'Ronda 1')
  let nivel: Nodo[] = []
  for (let i = 0; i < E; i++) {
    const k = i - (E - Q) // posición dentro de las entradas de clasificatoria
    nivel.push(k >= 0
      ? { id: `r1-${i + 1}`, columna: col, fuentes: [clasif[2 * k].id, clasif[2 * k + 1].id], ganador: null, pila: true }
      : { id: `r1-${i + 1}`, columna: col, fuentes: [], ganador: null, pila: true })
  }
  // Los equipos se reparten primero por las tarjetas de la Ronda 1 y luego por las de la clasificatoria.
  for (const nd of nivel) if (esTarjeta(nd)) nd.equipos = [tomar(), tomar()]
  for (const nd of clasif) nd.equipos = [tomar(), tomar()]
  nodos.push(...clasif, ...nivel)

  let ronda = 2
  while (nivel.length > 1) {
    col++
    const cajas = nivel.length / 2
    columnas.push(tituloRonda(cajas, ronda++))
    const siguiente: Nodo[] = []
    for (let i = 0; i < cajas; i++) {
      siguiente.push({ id: `n${col}-${i + 1}`, columna: col, fuentes: [nivel[2 * i].id, nivel[2 * i + 1].id], ganador: null, pila: false })
    }
    nodos.push(...siguiente)
    nivel = siguiente
  }
  return { columnas, nodos }
}

/** Mismo torneo con el cuadro regenerado (se pierden los resultados). */
export function conCuadro(t: Torneo, mezclar = false): Torneo {
  const ids = t.equipos.map((e) => e.id)
  if (mezclar) for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]] }
  return { ...t, ...generarCuadro(ids) }
}

// ---------- Resultados ----------

export type Mapa = Map<string, Nodo>
export const mapaNodos = (t: Torneo): Mapa => new Map(t.nodos.map((n) => [n.id, n]))

/** Quién llega a un nodo: los dos equipos de una tarjeta o los ganadores de sus fuentes (null = sin definir). */
export function candidatos(m: Mapa, n: Nodo): (string | null)[] {
  return n.equipos ? [...n.equipos] : n.fuentes.map((f) => ganadorDe(m, f))
}

/** Ganador elegido; si solo hay un rival posible («Sin rival» o una única fuente) pasa solo. */
export function ganadorDe(m: Mapa, id: string): string | null {
  const n = m.get(id)
  if (!n) return null
  const c = candidatos(m, n)
  const reales = c.filter((x): x is string => x != null)
  if (n.ganador && reales.includes(n.ganador)) return n.ganador
  const pasaSolo = n.equipos ? n.equipos.includes(null) : n.fuentes.length === 1
  return pasaSolo && reales.length === 1 ? reales[0] : null
}

/** Marca (o desmarca, si ya lo era) a `equipoId` como ganador del nodo. */
export function elegirGanador(t: Torneo, nodoId: string, equipoId: string): Torneo {
  return { ...t, nodos: t.nodos.map((n) => n.id === nodoId ? { ...n, ganador: n.ganador === equipoId ? null : equipoId } : n) }
}

/** Campeón: ganador del último nodo del cuadro. */
export function campeon(t: Torneo): string | null {
  if (!t.nodos.length) return null
  const ultima = Math.max(...t.nodos.map((n) => n.columna))
  const final = t.nodos.find((n) => n.columna === ultima)
  return final ? ganadorDe(mapaNodos(t), final.id) : null
}

export const hayResultados = (t: Torneo) => t.nodos.some((n) => n.ganador != null)
export const sinResultados = (t: Torneo): Torneo => ({ ...t, nodos: t.nodos.map((n) => ({ ...n, ganador: null })) })

/** Pone `equipoId` en una posición de una tarjeta; si ya estaba en otra, intercambian (null = «Sin rival»). */
export function asignarEquipo(t: Torneo, nodoId: string, pos: 0 | 1, equipoId: string | null): Torneo {
  const nodos = t.nodos.map((n) => ({ ...n, equipos: n.equipos ? ([...n.equipos] as [string | null, string | null]) : undefined }))
  const destino = nodos.find((n) => n.id === nodoId)
  if (!destino?.equipos) return t
  const previo = destino.equipos[pos]
  if (equipoId != null) {
    for (const n of nodos) {
      const i = n.equipos?.indexOf(equipoId) ?? -1
      if (n.equipos && i >= 0) n.equipos[i] = previo
    }
  }
  destino.equipos[pos] = equipoId
  return { ...t, nodos }
}

// ---------- Equipos ----------

export function nuevoEquipo(nombre: string, gremioId: number | null): Equipo {
  return { id: crypto.randomUUID(), nombre, gremioId, jugadores: [] }
}

/** Alterna un personaje en la alineación respetando el máximo del formato (en 1 contra 1 sustituye). */
export function alternarJugador(e: Equipo, j: Jugador, formato: Formato): Equipo {
  if (e.jugadores.some((x) => x.id === j.id)) return { ...e, jugadores: e.jugadores.filter((x) => x.id !== j.id) }
  const max = FORMATOS[formato].porEquipo
  if (max === 1) return { ...e, jugadores: [j] }
  if (max != null && e.jugadores.length >= max) return e
  return { ...e, jugadores: [...e.jugadores, j] }
}

/** Quita un equipo; el cuadro ya no es válido y se regenera. */
export const quitarEquipo = (t: Torneo, id: string): Torneo => conCuadro({ ...t, equipos: t.equipos.filter((e) => e.id !== id) })

// ---------- Posiciones (pura, para dibujar) ----------

export const ANCHO = 250
export const HUECO_X = 70
export const FILA = 30
export const HUECO_Y = 18

export type Caja = { id: string; x: number; y: number; alto: number }

const filas = (n: Nodo) => (esTarjeta(n) ? 2 : Math.max(2, n.fuentes.length))
const alto = (n: Nodo) => filas(n) * FILA + 2

/** Calcula la posición de cada nodo y el tamaño total del lienzo. */
export function disponer(t: Torneo): { cajas: Map<string, Caja>; ancho: number; alto: number } {
  const cajas = new Map<string, Caja>()
  const consumidor = new Map<string, Nodo>()
  for (const n of t.nodos) for (const f of n.fuentes) consumidor.set(f, n)
  // Las tarjetas que alimentan una entrada apilada (la clasificatoria) se colocan alrededor de ella, al final.
  const alrededor = (n: Nodo) => { const c = consumidor.get(n.id); return esTarjeta(n) && !!c && c.pila }
  const columnas = Math.max(0, ...t.nodos.map((n) => n.columna)) + 1

  const poner = (n: Nodo, y: number) => cajas.set(n.id, { id: n.id, x: n.columna * (ANCHO + HUECO_X), y, alto: alto(n) })
  const centro = (id: string) => { const c = cajas.get(id)!; return c.y + c.alto / 2 }

  for (let col = 0; col < columnas; col++) {
    let libre = 0
    for (const n of t.nodos.filter((x) => x.columna === col && !alrededor(x))) {
      if (n.pila || !n.fuentes.length) { poner(n, libre) }
      else {
        const medio = n.fuentes.reduce((s, f) => s + centro(f), 0) / n.fuentes.length
        poner(n, Math.max(libre, medio - alto(n) / 2))
      }
      libre = cajas.get(n.id)!.y + alto(n) + HUECO_Y
    }
  }
  const grupos = new Map<string, Nodo[]>()
  for (const n of t.nodos.filter(alrededor)) grupos.set(consumidor.get(n.id)!.id, [...(grupos.get(consumidor.get(n.id)!.id) ?? []), n])
  let limite = 0
  for (const [dest, lista] of grupos) {
    const total = lista.reduce((s, n) => s + alto(n), 0) + HUECO_Y * (lista.length - 1)
    let y = Math.max(limite, centro(dest) - total / 2)
    for (const n of lista) { poner(n, y); y += alto(n) + HUECO_Y }
    limite = y
  }
  const todas = [...cajas.values()]
  const minY = Math.min(0, ...todas.map((c) => c.y))
  for (const c of todas) c.y -= minY
  return {
    cajas,
    ancho: columnas * (ANCHO + HUECO_X) - HUECO_X,
    alto: Math.max(0, ...todas.map((c) => c.y + c.alto)),
  }
}

// ---------- Persistencia ----------

const CLAVE = 'terratea-torneos'

const esTorneo = (x: unknown): x is Torneo => {
  const t = x as Torneo
  return !!t && typeof t.id === 'string' && typeof t.nombre === 'string' && t.formato in FORMATOS
    && Array.isArray(t.equipos) && Array.isArray(t.columnas) && Array.isArray(t.nodos)
}

export function listarTorneos(): Torneo[] {
  try {
    const crudo = JSON.parse(localStorage.getItem(CLAVE) ?? '[]')
    return Array.isArray(crudo) ? crudo.filter(esTorneo) : []
  } catch { return [] }
}

const volcar = (lista: Torneo[]) => { try { localStorage.setItem(CLAVE, JSON.stringify(lista)) } catch { /* sin espacio o bloqueado */ } }

export const cargarTorneo = (id: string) => listarTorneos().find((t) => t.id === id) ?? null

export function guardarTorneo(t: Torneo) {
  const lista = listarTorneos()
  const i = lista.findIndex((x) => x.id === t.id)
  if (i >= 0) lista[i] = t; else lista.push(t)
  volcar(lista)
}

export const borrarTorneo = (id: string) => volcar(listarTorneos().filter((t) => t.id !== id))

export const torneoNuevo = (nombre: string, formato: Formato): Torneo =>
  ({ id: crypto.randomUUID(), nombre, formato, equipos: [], columnas: [], nodos: [] })
