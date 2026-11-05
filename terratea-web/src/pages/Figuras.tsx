import { useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { img2, npcsData } from '../lib/mundo'
import { RazaEnlace } from '../components/Raza'
import { Chip } from '../components/Comunes'

const sinTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export default function Figuras() {
  const [sp, setSp] = useSearchParams()
  const reino = npcsData.reinos.some((r) => r.id === sp.get('reino')) ? sp.get('reino')! : npcsData.reinos[0].id
  const q = sp.get('q') ?? ''
  const fig = sp.get('fig') ?? ''
  const poner = (p: Record<string, string>) => setSp({ reino, q, ...p }, { replace: true })

  const lista = useMemo(
    () => npcsData.npcs.filter((n) => n.reino === reino && (!q || sinTildes(`${n.nombre} ${n.raza}`).includes(sinTildes(q)))),
    [reino, q],
  )
  const info = npcsData.reinos.find((r) => r.id === reino)!
  const idx = lista.findIndex((n) => n.id === fig)
  const elegida = idx >= 0 ? lista[idx] : null

  const dlg = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = dlg.current
    if (!d) return
    if (elegida && !d.open) d.showModal()
    if (!elegida && d.open) d.close()
  }, [elegida])

  const abrir = (id: string) => setSp({ reino, q, fig: id }, { replace: false })
  const cerrar = () => poner({ fig: '' })
  const ir = (paso: number) => {
    if (!lista.length || idx < 0) return
    poner({ fig: lista[(idx + paso + lista.length) % lista.length].id })
  }
  const alAzar = () => {
    const otras = lista.filter((n) => n.id !== fig)
    if (otras.length) abrir(otras[Math.floor(Math.random() * otras.length)].id)
  }

  return (
    <>
      <h1>Figuras notables</h1>
      <div className="filtros">
        {npcsData.reinos.map((r) => (
          <button key={r.id} className={r.id === reino ? 'activo' : ''} onClick={() => poner({ reino: r.id, fig: '' })}>
            {r.nombre} ({npcsData.npcs.filter((n) => n.reino === r.id).length})
          </button>
        ))}
      </div>
      <div className="figuras-barra">
        <input className="buscador" placeholder={`Buscar en ${info.nombre}…`} value={q} onChange={(e) => poner({ q: e.target.value, fig: '' })} />
        <button onClick={alAzar} disabled={!lista.length}>🎲 Figura al azar</button>
        <span className="contador">{lista.length ? `${lista.length} figuras` : 'Sin resultados'}</span>
      </div>

      <div className="muro" key={reino}>
        {lista.map((n, i) => (
          <button key={n.id} className="figura" style={{ '--i': Math.min(i, 12) } as React.CSSProperties} onClick={() => abrir(n.id)} aria-label={`Ver a ${n.nombre}`}>
            {n.imagen && <img src={img2(n.imagen)} alt="" loading="lazy" />}
            <span className="figura-pie">
              <strong>{n.nombre}</strong>
              <small>{n.raza}</small>
            </span>
          </button>
        ))}
      </div>
      {!lista.length && q && (
        <p className="nota">Ninguna figura de {info.nombre} coincide con «{q}». <button onClick={() => poner({ q: '' })}>Borrar búsqueda</button></p>
      )}

      <dialog
        ref={dlg}
        className="expediente"
        aria-label={elegida?.nombre}
        onClose={() => elegida && cerrar()}
        onClick={(e) => e.target === dlg.current && cerrar()}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); ir(1) }
          if (e.key === 'ArrowLeft') { e.preventDefault(); ir(-1) }
        }}
      >
        {elegida && (
          <div className="expediente-cuerpo" key={elegida.id}>
            {elegida.imagen && <img className="expediente-retrato" src={img2(elegida.imagen)} alt={elegida.nombre} />}
            <div className="expediente-texto">
              <h2>{elegida.nombre}</h2>
              <p className="nota">
                <RazaEnlace texto={elegida.raza} /> · {info.nombre} · Libro 2, p. {elegida.pagina}
              </p>
              <p>{elegida.descripcion}</p>
              {elegida.rasgos.length > 0 && <p>{elegida.rasgos.map((r, i) => <Chip key={i}>{r}</Chip>)}</p>}
              {elegida.actitud_propuestas && (
                <details className="actitud" open>
                  <summary>Actitud y propuestas</summary>
                  <p>{elegida.actitud_propuestas}</p>
                </details>
              )}
            </div>
          </div>
        )}
        <div className="expediente-nav">
          <button onClick={() => ir(-1)} aria-label="Figura anterior">←</button>
          <span>{idx + 1} de {lista.length}</span>
          <button onClick={() => ir(1)} aria-label="Figura siguiente">→</button>
          <button className="expediente-cerrar" onClick={cerrar}>Cerrar</button>
        </div>
      </dialog>

      {reino === 'overfield' && (
        <section className="bloque parlamento">
          <h3>Composición del Parlamento</h3>
          <p className="nota">{npcsData.parlamento_overfield.nota} (p. {npcsData.parlamento_overfield.pagina})</p>
          {npcsData.parlamento_overfield.grupos.map((g) => (
            <details key={g.id}>
              <summary>{g.id.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase())}</summary>
              <ul>{g.miembros.map((m, i) => <li key={i}>{m}</li>)}</ul>
              <p>{g.descripcion}</p>
              <p className="nota">{g.raza} · {g.caracteristicas}</p>
            </details>
          ))}
        </section>
      )}
    </>
  )
}
