import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { armas, armaduras, objetos, clases, razas, clasesParaRaza, razaPorId } from './datos'
import { costeEnCobre, IDS_ATRIBUTO } from './reglas'

const publico = (ruta: string) => existsSync(join(process.cwd(), 'public', ruta))

describe('integridad de los datos', () => {
  it('cada clase tiene al menos una raza permitida y todas existen', () => {
    for (const c of clases) {
      const permitidas = c.razas_disponibles.filter((r) => r.disponible)
      expect(permitidas.length, c.id).toBeGreaterThan(0)
      for (const r of permitidas) expect(razaPorId(r.raza.split('/')[0]), `${c.id} → ${r.raza}`).toBeDefined()
    }
  })

  it('cada raza (y subraza de Renegado) tiene al menos una clase', () => {
    for (const r of razas) {
      if (r.subrazas) for (const s of r.subrazas) expect(clasesParaRaza(r.id, s.id).length, `${r.id}/${s.id}`).toBeGreaterThan(0)
      else expect(clasesParaRaza(r.id).length, r.id).toBeGreaterThan(0)
    }
  })

  it('los requisitos usan atributos válidos', () => {
    for (const c of clases) for (const q of c.requisitos) {
      if ('atributo' in q && q.atributo) expect(IDS_ATRIBUTO, c.id).toContain(q.atributo)
    }
  })

  it('cada raza tiene tiradas de salvación y las imágenes existen', () => {
    for (const r of razas) {
      expect(r.tiradas_salvacion.length, r.id).toBeGreaterThan(0)
      const imgs = [...r.imagenes.ilustraciones, ...(r.imagenes.titulo ? [r.imagenes.titulo] : []),
        ...(r.subrazas?.flatMap((s) => s.imagenes.ilustraciones) ?? [])]
      for (const i of imgs) expect(publico(i), i).toBe(true)
    }
  })

  it('cada clase tiene ilustración, habilidades, progresión y las imágenes existen', () => {
    for (const c of clases) {
      expect(c.imagenes.ilustraciones.length, c.id).toBeGreaterThan(0)
      expect(c.habilidades.length, c.id).toBeGreaterThan(0)
      expect(c.progresion.length, c.id).toBeGreaterThan(0)
      for (const i of [...c.imagenes.ilustraciones, ...(c.imagenes.titulo ? [c.imagenes.titulo] : [])]) expect(publico(i), i).toBe(true)
    }
  })

  it('toda la tienda tiene coste válido; imágenes existentes', () => {
    for (const it of [...armas, ...armaduras, ...objetos]) {
      expect(costeEnCobre(it.coste), `${it.nombre} (${it.coste})`).not.toBeNull()
      if (it.imagen) expect(publico(it.imagen), it.imagen).toBe(true)
    }
  })
})
