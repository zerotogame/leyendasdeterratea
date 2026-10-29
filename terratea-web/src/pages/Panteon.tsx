import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { deidadesData, img2, tirarColorAstral } from '../lib/mundo'
import { Dado } from '../components/Dados'
import type { GrupoDeidad } from '../data/libro2.types'

const sinTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function ColoresAstrales() {
  const [res, setRes] = useState<{ n: number; id: number } | null>(null)
  const tirar = () => setRes({ n: tirarColorAstral().tirada, id: (res?.id ?? 0) + 1 })
  const fila = res && deidadesData.colores_astrales.find((c) => c.tirada === res.n)
  return (
    <section className="bloque">
      <h3>Colores astrales (d10)</h3>
      <div className="filtros">
        <button className="primario" onClick={tirar}>🎲 Tirar d10</button>
        {res && <Dado key={res.id} caras={10} valor={res.n} />}
        {fila && <strong>{fila.plano} · {fila.color}</strong>}
      </div>
      <table className="tabla">
        <thead><tr><th>d10</th><th>Plano</th><th>Color</th></tr></thead>
        <tbody>
          {deidadesData.colores_astrales.map((c) => (
            <tr key={c.tirada} className={res?.n === c.tirada ? 'resaltada' : ''}>
              <td>{c.tirada}</td><td>{c.plano}</td><td>{c.color}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default function Panteon() {
  const [sp, setSp] = useSearchParams()
  const grupo = (deidadesData.grupos.find((g) => g.id === sp.get('grupo'))?.id ?? '') as GrupoDeidad | ''
  const q = sp.get('q') ?? ''
  const poner = (p: Record<string, string>) => setSp({ grupo, q, ...p }, { replace: true })

  const lista = useMemo(
    () => deidadesData.deidades.filter((d) => (!grupo || d.grupo === grupo) &&
      (!q || sinTildes(`${d.nombre} ${d.virtudes.join(' ')}`).includes(sinTildes(q)))),
    [grupo, q],
  )

  return (
    <>
      <h1>Panteón</h1>
      <p>{deidadesData.introduccion.split(' REY DIOS')[0]}</p>
      <ColoresAstrales />
      <div className="filtros">
        <button className={grupo === '' ? 'activo' : ''} onClick={() => poner({ grupo: '' })}>Todos ({deidadesData.deidades.length})</button>
        {deidadesData.grupos.map((g) => (
          <button key={g.id} className={grupo === g.id ? 'activo' : ''} onClick={() => poner({ grupo: g.id })}>
            {g.nombre} ({deidadesData.deidades.filter((d) => d.grupo === g.id).length})
          </button>
        ))}
      </div>
      <input className="buscador" placeholder="Buscar deidad o virtud…" value={q} onChange={(e) => poner({ q: e.target.value })} />
      <p className="contador">{lista.length} deidades</p>
      <div className="tarjetas deidades">
        {lista.map((d) => (
          <article key={d.id} className="tarjeta deidad">
            <img src={img2(d.simbolo)} alt={`Símbolo de ${d.nombre}`} loading="lazy" />
            <h2>{d.nombre}</h2>
            <small>{d.alineamiento_nombre} ({d.alineamiento}){d.circulo && ` · ${d.circulo}`}</small>
            <small>{d.virtudes.join(' · ')}</small>
            <small>{d.descripcion}</small>
          </article>
        ))}
      </div>
      <details className="nota">
        <summary>Abreviaturas de alineamiento</summary>
        <ul>{Object.entries(deidadesData.abreviaturas_alineamiento).map(([k, v]) => <li key={k}><strong>{k}</strong>: {v}</li>)}</ul>
      </details>
    </>
  )
}
