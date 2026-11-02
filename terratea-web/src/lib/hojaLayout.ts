import type { DatosHoja } from './hoja'

/** Texto en un punto de la hoja. Coordenadas en «unidades de dibujo» (ancho = 2000), con y al centro de la línea. */
export type Campo = { x: number; y: number; t: string; s: number; c?: boolean; w?: number }
/** Lista de líneas dentro de una caja (con `cols` columnas). */
export type Bloque = { x: number; y: number; w: number; h: number; s: number; cols?: number; lineas: string[] }
/** Marco donde va la imagen del personaje. */
export type Caja = { x: number; y: number; w: number; h: number }
export type Hoja = { w: number; h: number; campos: Campo[]; bloques: Bloque[]; retrato?: Caja }

const f = (x: number, y: number, t: string, s: number, o: Partial<Campo> = {}): Campo => ({ x, y, t, s, ...o })

type Pos = [number, number]
type Cab = {
  personaje: Pos; jugador: Pos; clase: Pos; raza: Pos; alineamiento: Pos; gremio: Pos
  altura: Pos; peso: Pos; edad: Pos; sexo: Pos; cabello: Pos; ojos: Pos; marcas: Pos
}

const cabecera = (h: DatosHoja, p: Cab, s: number, w: Record<keyof Cab, number>) =>
  (Object.keys(p) as (keyof Cab)[]).map((k) => f(p[k][0], p[k][1], h[k], s, { w: w[k] }))

type ColsArma = { nombre: number; peso: number; mano: number; dano: number; especial: number }

const armas = (h: DatosHoja, ys: number[], c: ColsArma, s: number) =>
  h.armas.slice(0, ys.length).flatMap((a, i) => [
    f(c.nombre, ys[i], a.nombre, s, { w: c.peso - c.nombre - 90 }),
    f(c.peso, ys[i], a.peso, s, { c: true }),
    f(c.mano, ys[i], a.mano, s, { c: true }),
    f(c.dano, ys[i], a.dano, s),
    f(c.especial, ys[i], a.especial, s, { w: 220 }),
  ])

/** Hoja PC (3545×1994): raza + recuadro de habilidades de la clase en el mismo lienzo. */
export const hojaPc = (h: DatosHoja): Hoja => {
  const attrY = [610, 649, 689, 730, 772, 813]
  const salY = [908, 948, 990, 1029, 1071]
  const salX = [322, 322, 398, 398, 398]
  const movX = [465, 526, 596, 672, 742]
  return {
    w: 2000, h: 1125,
    retrato: { x: 455, y: 635, w: 320, h: 335 },
    campos: [
      ...cabecera(h, {
        personaje: [155, 36], jugador: [140, 67], clase: [110, 98], raza: [105, 129], alineamiento: [185, 160], gremio: [130, 190],
        altura: [118, 230], peso: [332, 230], edad: [465, 230], sexo: [625, 230], cabello: [125, 261], ojos: [388, 261], marcas: [628, 261],
      }, 17, { personaje: 225, jugador: 240, clase: 270, raza: 275, alineamiento: 195, gremio: 250, altura: 140, peso: 70, edad: 85, sexo: 170, cabello: 195, ojos: 145, marcas: 170 }),
      f(482, 110, h.ca, 40, { c: true }), f(522, 191, h.esquiva, 15),
      f(1090, 140, h.vida, 30, { c: true }),
      f(1625, 55, h.oro, 15), f(1625, 75, h.plata, 15), f(1625, 94, h.cobre, 15),
      ...armas(h, [336, 364, 393, 421, 450, 478], { nombre: 108, peso: 522, mano: 565, dano: 626, especial: 676 }, 14),
      f(352, 526, h.rango, 18, { c: true }),
      ...h.atributos.map((t, i) => f(335, attrY[i], t, 17, { c: true })),
      ...h.salvaciones.map((t, i) => f(salX[i], salY[i], t, 17, { c: true })),
      ...h.movimiento.map((t, i) => f(movX[i], 567, t, 17, { c: true })),
      f(655, 999, h.nivel, 18, { c: true }), f(475, 1071, h.exp, 15), f(658, 1071, h.nec, 15),
      f(1158, 257, h.carga, 13, { c: true, w: 90 }),
    ],
    bloques: [
      { x: 1395, y: 58, w: 130, h: 118, s: 11, lineas: h.municion },
      { x: 868, y: 285, w: 318, h: 710, s: 15, lineas: h.equipo },
      { x: 1295, y: 590, w: 630, h: 225, s: 15, cols: 2, lineas: h.extra },
      { x: 1350, y: 262, w: 570, h: 235, s: 14, cols: 2, lineas: h.habilidades },
    ],
  }
}

/** Hoja Imprimir, página 1 (2481×1754): datos del personaje. */
export const hojaImp1 = (h: DatosHoja): Hoja => {
  const attrY = [311, 373, 437, 500, 569, 633]
  const salY = [316, 379, 448, 508, 576]
  const salX = [1070, 1070, 1080, 1080, 1130]
  const movX = [1435, 1527, 1637, 1755, 1862]
  return {
    w: 2000, h: 1414,
    retrato: { x: 1405, y: 675, w: 505, h: 500 },
    campos: [
      ...cabecera(h, {
        personaje: [228, 68], jugador: [712, 68], clase: [1152, 68], raza: [1425, 68],
        alineamiento: [275, 112], altura: [686, 112], peso: [901, 112], edad: [1119, 112], sexo: [1338, 112],
        cabello: [191, 157], marcas: [533, 157], ojos: [914, 157], gremio: [1213, 157],
      }, 26, { personaje: 310, jugador: 310, clase: 145, raza: 145, alineamiento: 270, gremio: 350, altura: 100, peso: 100, edad: 100, sexo: 230, cabello: 185, ojos: 145, marcas: 270 }),
      f(168, 840, h.ca, 54, { c: true }), f(232, 983, h.esquiva, 20),
      f(1190, 400, h.vida, 42, { c: true }),
      f(1135, 768, h.oro, 20), f(1135, 798, h.plata, 20), f(1135, 828, h.cobre, 20),
      ...armas(h, [1125, 1170, 1216, 1261, 1306, 1350], { nombre: 166, peso: 820, mano: 873, dano: 990, especial: 1070 }, 20),
      f(1050, 640, h.rango, 24, { c: true }),
      ...h.atributos.map((t, i) => f(445, attrY[i], t, 24, { c: true })),
      ...h.salvaciones.map((t, i) => f(salX[i], salY[i], t, 24, { c: true })),
      ...h.movimiento.map((t, i) => f(movX[i], 582, t, 24, { c: true })),
      f(1715, 1228, h.nivel, 24, { c: true }), f(1435, 1336, h.exp, 22), f(1722, 1336, h.nec, 22),
    ],
    bloques: [{ x: 1725, y: 262, w: 190, h: 185, s: 17, lineas: h.municion }],
  }
}

/** Hoja Imprimir, página 2: equipo, habilidades y atributos extra. */
export const hojaImp2 = (h: DatosHoja): Hoja => ({
  w: 2000, h: 1414,
  campos: [f(612, 108, h.carga, 18, { c: true, w: 140 })],
  bloques: [
    { x: 100, y: 150, w: 560, h: 1110, s: 22, lineas: h.equipo },
    { x: 940, y: 120, w: 980, h: 380, s: 22, cols: 2, lineas: h.habilidades },
    { x: 820, y: 620, w: 1100, h: 380, s: 22, cols: 2, lineas: h.extra },
  ],
})
