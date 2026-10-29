import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  CATALOGOS, catalogoPorId, filtrarCatalogo, filtrarTodos, grupoDe, gruposDe, limpiar, totalObjetos,
  type Catalogo, type Entrada,
} from '../lib/catalogo'
import type { ObjetoBase } from '../data/types'
import { img } from '../lib/datos'

const POR_PAGINA = 60

// Solo los listados con varias categorías (armas, armaduras, transportes…) muestran el tipo en la tarjeta.
const CON_TIPO = new Set(CATALOGOS.filter((c) => gruposDe(c).length > 1).map((c) => c.id))

function ObjetoTarjeta({ o, cat }: { o: ObjetoBase; cat: Catalogo }) {
  const precio = cat.precio ? limpiar(o[cat.precio]) : ''
  return (
    <article className="tarjeta objeto">
      {o.imagen && <img src={img(o.imagen)} alt={o.nombre} loading="lazy" />}
      <h3>{o.nombre}</h3>
      {CON_TIPO.has(cat.id) && <small className="tipo">{grupoDe(cat, o)}</small>}
      {precio && <strong className="precio">{precio}</strong>}
      <dl>
        {cat.campos.filter((f) => limpiar(o[f.clave])).map((f) => (
          <div key={f.clave}><dt>{f.etiqueta}</dt><dd>{limpiar(o[f.clave])}</dd></div>
        ))}
      </dl>
    </article>
  )
}

export default function Objetos() {
  const [sp, setSp] = useSearchParams()
  const idCat = sp.get('c') ?? 'todos'
  const cat = catalogoPorId(idCat)
  const esTodos = !cat
  const q = sp.get('q') ?? ''
  const grupo = sp.get('g') ?? ''
  const [visibles, setVisibles] = useState(POR_PAGINA)

  const cambiar = (p: Record<string, string>) => {
    const n = new URLSearchParams(sp)
    for (const [k, v] of Object.entries(p)) {
      if (v) n.set(k, v)
      else n.delete(k)
    }
    setSp(n, { replace: true })
    setVisibles(POR_PAGINA)
  }

  // En «Todos» el filtro es por listado; en un listado, por su categoría interna.
  const grupos = useMemo(() => (cat ? gruposDe(cat) : []), [cat])
  const entradas: Entrada[] = useMemo(
    () => (cat ? filtrarCatalogo(cat, q, grupo).map((o) => ({ cat, o })) : filtrarTodos(q, grupo)),
    [cat, q, grupo],
  )
  const total = cat ? cat.items.length : totalObjetos
  // Encabezado de bloque: el listado en «Todos»; la categoría interna en un listado.
  const etiqueta = (e: Entrada) => (esTodos ? e.cat.nombre : grupoDe(e.cat, e.o))
  const conCabeceras = esTodos ? !grupo : grupos.length > 1 && !grupo

  return (
    <>
      <h1>Objetos y equipo</h1>
      <p className="lead">{totalObjetos} entradas repartidas en {CATALOGOS.length} listados.</p>

      <div className="filtros">
        <button className={esTodos ? 'activo' : ''}
          onClick={() => { setSp(new URLSearchParams({ c: 'todos' }), { replace: true }); setVisibles(POR_PAGINA) }}>
          Todos ({totalObjetos})
        </button>
        {CATALOGOS.map((x) => (
          <button key={x.id} className={x.id === idCat ? 'activo' : ''}
            onClick={() => { setSp(new URLSearchParams({ c: x.id }), { replace: true }); setVisibles(POR_PAGINA) }}>
            {x.nombre} ({x.items.length})
          </button>
        ))}
      </div>

      <p className="nota">{cat ? cat.descripcion : 'Todos los listados juntos.'}</p>
      <div className="filtros">
        <input className="buscador" placeholder={esTodos ? 'Buscar en todo el equipo…' : `Buscar en ${cat.nombre.toLowerCase()}…`} value={q} onChange={(e) => cambiar({ q: e.target.value })} />
        {esTodos ? (
          <select value={grupo} onChange={(e) => cambiar({ g: e.target.value })}>
            <option value="">Todos los listados</option>
            {CATALOGOS.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
          </select>
        ) : grupos.length > 1 && (
          <select value={grupo} onChange={(e) => cambiar({ g: e.target.value })}>
            <option value="">Todas las categorías</option>
            {grupos.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        )}
        {(q || grupo) && <button onClick={() => cambiar({ q: '', g: '' })}>Quitar filtros</button>}
      </div>

      <p className="contador">{entradas.length} de {total}</p>
      {entradas.length === 0 && <p>Nada coincide con esa búsqueda.</p>}

      <div className="tarjetas objetos">
        {entradas.slice(0, visibles).flatMap((e, i) => {
          const g = etiqueta(e)
          const nueva = conCabeceras && (i === 0 || g !== etiqueta(entradas[i - 1]))
          const tarjeta = <ObjetoTarjeta key={`${e.cat.id}-${e.o.nombre}-${i}`} o={e.o} cat={e.cat} />
          return nueva ? [<h2 key={`g-${g}-${i}`} className="grupo-objetos">{g}</h2>, tarjeta] : [tarjeta]
        })}
      </div>
      {visibles < entradas.length && (
        <p style={{ textAlign: 'center' }}><button className="primario" onClick={() => setVisibles((v) => v + POR_PAGINA)}>Mostrar más ({entradas.length - visibles} restantes)</button></p>
      )}
    </>
  )
}
