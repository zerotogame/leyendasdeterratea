import { describe, expect, it } from 'vitest'
import { DATOS_VACIOS, INICIAL, normalizarGuardado, validarDatos } from './sesion'

const buenos = {
  pool: [13, 17, 12, 12, 11, 9, 15],
  asignacion: { fuerza: 0, destreza: 1, constitucion: 2, inteligencia: 3, sabiduria: 4, carisma: 6 },
  fortuna: { oro: 19, plata: 3, cobre: 4 },
  vida: 8,
  compras: [{ tipo: 'arma', idx: 0 }],
  editando: false,
}

describe('validarDatos: caché corrupta', () => {
  it('conserva datos válidos tal cual', () => expect(validarDatos(buenos)).toEqual(buenos))

  it('basura → datos vacíos', () => {
    for (const x of [null, undefined, 5, 'x', [], {}]) expect(validarDatos(x)).toEqual(DATOS_VACIOS)
  })

  it('siete 10 (valores de ejemplo) sin confirmar → vuelven a modo edición, no quedan bloqueados', () => {
    const d = validarDatos({ pool: [10, 10, 10, 10, 10, 10, 10] })
    expect(d.editando).toBe(true)
  })

  it('tiradas imposibles se descartan', () => {
    expect(validarDatos({ ...buenos, pool: [99, 17, 12, 12, 11, 9, 15] }).pool).toEqual([])
    expect(validarDatos({ ...buenos, pool: [2, 17, 12, 12, 11, 9, 15] }).pool).toEqual([])
    expect(validarDatos({ ...buenos, pool: [13, 17, 12] }).pool).toEqual([])
    expect(validarDatos({ ...buenos, pool: [13.5, 17, 12, 12, 11, 9, 15] }).pool).toEqual([])
  })

  it('asignación con índices repetidos, fuera de rango o atributo desconocido se descarta', () => {
    expect(validarDatos({ ...buenos, asignacion: { fuerza: 1, destreza: 1 } }).asignacion).toEqual({})
    expect(validarDatos({ ...buenos, asignacion: { fuerza: 9 } }).asignacion).toEqual({})
    expect(validarDatos({ ...buenos, asignacion: { suerte: 1 } }).asignacion).toEqual({})
  })

  it('asignación sin tiradas válidas se descarta', () => {
    expect(validarDatos({ ...buenos, pool: [] }).asignacion).toEqual({})
  })

  it('fortuna fuera de rango → sin fortuna (y sin compras)', () => {
    for (const f of [{ oro: 21, plata: 3, cobre: 4 }, { oro: 0, plata: 3, cobre: 4 }, { oro: 5, plata: 9, cobre: 4 }, { oro: 5, plata: 3, cobre: 7 }, { oro: 5 }]) {
      const d = validarDatos({ ...buenos, fortuna: f })
      expect(d.fortuna).toBeNull()
      expect(d.compras).toEqual([])
    }
  })

  it('vitalidad fuera de 1-12 → null', () => {
    for (const v of [0, 13, -1, 3.5, '8']) expect(validarDatos({ ...buenos, vida: v }).vida).toBeNull()
  })

  it('compras con índice o tipo inválido se filtran', () => {
    const d = validarDatos({ ...buenos, compras: [{ tipo: 'arma', idx: 0 }, { tipo: 'arma', idx: 99999 }, { tipo: 'dragon', idx: 0 }, null] })
    expect(d.compras).toEqual([{ tipo: 'arma', idx: 0 }])
  })
})

describe('normalizarGuardado', () => {
  it('basura → estado inicial', () => {
    for (const x of [null, 'x', 5, undefined]) expect(normalizarGuardado(x)).toEqual(INICIAL)
  })

  it('raza o clase desconocidas se limpian', () => {
    const g = normalizarGuardado({ razaId: 'dragon', claseId: 'alquimista' })
    expect(g.razaId).toBe('')
    expect(g.claseId).toBe('')
  })

  it('clase no permitida para la raza se descarta (Elfo no puede ser Alquimista)', () => {
    expect(normalizarGuardado({ razaId: 'elfo', claseId: 'alquimista' }).claseId).toBe('')
    expect(normalizarGuardado({ razaId: 'humano', claseId: 'alquimista' }).claseId).toBe('alquimista')
  })

  it('subraza inexistente se limpia; la válida de Renegado se conserva', () => {
    expect(normalizarGuardado({ razaId: 'humano', subrazaId: 'x' }).subrazaId).toBe('')
    expect(normalizarGuardado({ razaId: 'renegado', subrazaId: 'no-muerto' }).subrazaId).toBe('no-muerto')
  })

  it('formato antiguo (tiradas en la raíz) se migra a su combinación', () => {
    const g = normalizarGuardado({ razaId: 'humano', claseId: 'alquimista', ...buenos })
    expect(g.guardados['humano|alquimista'].pool).toEqual(buenos.pool)
  })

  it('guardados con datos corruptos se sanean por combinación', () => {
    const g = normalizarGuardado({ guardados: { 'humano|bardo': { pool: [99, 1], vida: 50 }, 'elfo|argonauta': buenos } })
    expect(g.guardados['humano|bardo']).toEqual(DATOS_VACIOS)
    expect(g.guardados['elfo|argonauta']).toEqual(buenos)
  })
})
