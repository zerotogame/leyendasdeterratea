import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { img2, npcsData } from '../lib/mundo'
import { RazaEnlace } from '../components/Raza'
import { Chip } from '../components/Comunes'

const sinTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export default function Figuras() {
  const [sp, setSp] = useSearchParams()
  const reino = npcsData.reinos.some((r) => r.id === sp.get('reino')) ? sp.get('reino')! : npcsData.reinos[0].id
  const q = sp.get('q') ?? ''
  const poner = (p: Record<string, string>) => setSp({ reino, q, ...p }, { replace: true })

  const lista = useMemo(
    () => npcsData.npcs.filter((n) => n.reino === reino && (!q || sinTildes(`${n.nombre} ${n.raza}`).includes(sinTildes(q)))),
    [reino, q],
  )
  const info = npcsData.reinos.find((r) => r.id === reino)!

  return (
    <>
      <h1>Figuras notables</h1>
      <div className="filtros">
        {npcsData.reinos.map((r) => (
          <button key={r.id} className={r.id === reino ? 'activo' : ''} onClick={() => poner({ reino: r.id })}>
            {r.nombre} ({npcsData.npcs.filter((n) => n.reino === r.id).length})
          </button>
        ))}
      </div>
      <input className="buscador" placeholder={`Buscar en ${info.nombre}…`} value={q} onChange={(e) => poner({ q: e.target.value })} />
      <p className="contador">{lista.length} figuras</p>

      <div className="lista-npc">
        {lista.map((n) => (
          <article key={n.id} className="npc bloque">
            {n.imagen && <img src={img2(n.imagen)} alt={n.nombre} loading="lazy" />}
            <div>
              <h2>{n.nombre}</h2>
              <p className="nota">Raza: <RazaEnlace texto={n.raza} /> · Libro 2, p. {n.pagina}</p>
              <p>{n.descripcion}</p>
              {n.rasgos.length > 0 && <p>{n.rasgos.map((r, i) => <Chip key={i}>{r}</Chip>)}</p>}
              {n.actitud_propuestas && <p><strong>Actitud y propuestas:</strong> {n.actitud_propuestas}</p>}
            </div>
          </article>
        ))}
      </div>

      {reino === 'overfield' && (
        <section className="bloque">
          <h3>Composición del Parlamento</h3>
          <p className="nota">{npcsData.parlamento_overfield.nota} (p. {npcsData.parlamento_overfield.pagina})</p>
          {npcsData.parlamento_overfield.grupos.map((g) => (
            <div key={g.id}>
              <h4>{g.id.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase())}</h4>
              <ul>{g.miembros.map((m, i) => <li key={i}>{m}</li>)}</ul>
              <p>{g.descripcion}</p>
              <p className="nota">{g.raza} · {g.caracteristicas}</p>
            </div>
          ))}
        </section>
      )}
    </>
  )
}
