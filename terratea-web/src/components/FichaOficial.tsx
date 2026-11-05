import { useEffect } from 'react'
import { img } from '../lib/img'
import { combinacion } from '../lib/fichasOficiales'
import type { DatosHoja } from '../lib/hoja'
import { hojaImp1, hojaImp2, hojaPc, type Hoja } from '../lib/hojaLayout'

const RUTA = img('img/fichas/')

/** Una página de la ficha: capas de imagen a lienzo completo y encima los datos del personaje. */
function Pagina({ capas, hoja, retrato, clase, alt }: { capas: string[]; hoja: Hoja; retrato: string; clase: string; alt: string }) {
  const px = (v: number) => `${v / hoja.w * 100}%`
  const py = (v: number) => `${v / hoja.h * 100}%`
  const cq = (v: number) => `${v / hoja.w * 100}cqw`
  return (
    <div className={`of-lienzo ${clase}`} style={{ aspectRatio: `${hoja.w} / ${hoja.h}` }}>
      {capas.map((c, i) => <img key={c} src={RUTA + c} alt={i === 0 ? alt : ''} />)}
      {retrato && hoja.retrato && (
        <img className="of-retrato" src={retrato} alt="Imagen del personaje"
          style={{ left: px(hoja.retrato.x), top: py(hoja.retrato.y), width: px(hoja.retrato.w), height: py(hoja.retrato.h) }} />
      )}
      {hoja.campos.filter((c) => c.t).map((c, i) => (
        <span key={i} className={c.c ? 'of-campo of-centro' : 'of-campo'}
          style={{ left: px(c.x), top: py(c.y), fontSize: cq(c.s), width: c.w ? px(c.w) : undefined }}>{c.t}</span>
      ))}
      {hoja.bloques.filter((b) => b.lineas.length).map((b, i) => (
        <ul key={i} className="of-bloque"
          style={{ left: px(b.x), top: py(b.y), width: px(b.w), height: py(b.h), fontSize: cq(b.s), columnCount: b.cols ?? 1 }}>
          {b.lineas.map((l, j) => <li key={j}>{l}</li>)}
        </ul>
      ))}
    </div>
  )
}

/**
 * Ficha oficial rellena. En pantalla: la hoja PC (raza como base y la clase encima, ambas a lienzo completo).
 * Al imprimir: la versión «Imprimir» en dos páginas (raza y clase) con los mismos datos.
 */
export default function FichaOficial({ datos }: { datos: DatosHoja }) {
  const nombre = datos.personaje
  // «Guardar como PDF» propone el título de la página como nombre de archivo
  useEffect(() => {
    const original = document.title
    const antes = () => {
      const limpio = nombre.replace(/[\\/:*?"<>|]/g, '').trim()
      if (limpio) document.title = `${limpio}_ficha_de_personaje`
    }
    const despues = () => { document.title = original }
    window.addEventListener('beforeprint', antes)
    window.addEventListener('afterprint', despues)
    return () => { window.removeEventListener('beforeprint', antes); window.removeEventListener('afterprint', despues); document.title = original }
  }, [nombre])
  const c = combinacion(datos.raza, datos.clase)
  if (!c) return null
  const alt = `Ficha oficial de ${datos.raza} ${datos.clase}`
  return (
    <div className="ficha-oficial">
      <Pagina capas={[c.pc.raza, c.pc.clase]} hoja={hojaPc(datos)} retrato={datos.retrato} clase="of-pc" alt={alt} />
      <Pagina capas={[c.imp.raza]} hoja={hojaImp1(datos)} retrato={datos.retrato} clase="of-imp" alt={alt} />
      <Pagina capas={[c.imp.clase]} hoja={hojaImp2(datos)} retrato="" clase="of-imp of-pagina2" alt="" />
    </div>
  )
}
