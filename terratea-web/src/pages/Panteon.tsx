import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { deidadesData, img2, tirarColorAstral } from '../lib/mundo'
import { Dado } from '../components/Dados'
import type { Deidad, GrupoDeidad } from '../data/libro2.types'

const sinTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Un color de acento por reino: solo orienta la vista, no es dato del libro.
const ACENTO: Record<GrupoDeidad, string> = {
  supremo: '#e8c766',
  norte: '#7fb2d9',
  este: '#d68ab0',
  oeste: '#7bbf8a',
  sur: '#e0a040',
  paganos: '#a592e0',
  infernales: '#d9645a',
  titanes: '#9fa3ad',
}

const NOMBRE_ALINEAMIENTO = new Map<string, string>()
for (const d of deidadesData.deidades) NOMBRE_ALINEAMIENTO.set(d.alineamiento, d.alineamiento_nombre)
const ALINEAMIENTOS = [...NOMBRE_ALINEAMIENTO.keys()]

function ColoresAstrales() {
  const [res, setRes] = useState<{ n: number; id: number } | null>(null)
  const tirar = () => setRes({ n: tirarColorAstral().tirada, id: (res?.id ?? 0) + 1 })
  const fila = res && deidadesData.colores_astrales.find((c) => c.tirada === res.n)
  return (
    <details className="bloque colores-astrales" open={!!res}>
      <summary>Colores astrales (d10)</summary>
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
    </details>
  )
}

function Tarjeta({ d, onAbrir }: { d: Deidad; onAbrir: () => void }) {
  return (
    <button className="dios" style={{ ['--acento' as string]: ACENTO[d.grupo] }} onClick={onAbrir}>
      <span className="dios-sello"><img src={img2(d.simbolo)} alt="" loading="lazy" /></span>
      <span className="dios-nombre">{d.nombre}</span>
      <span className="dios-sub">{d.alineamiento_nombre}{d.circulo && ` · ${d.circulo.replace(' Círculo Infernal', ' círculo')}`}</span>
      <span className="dios-virtudes">{d.virtudes.join(', ')}</span>
    </button>
  )
}

function Ficha({ lista, id, onCerrar, onIr, onVirtud }: {
  lista: Deidad[]; id: string; onCerrar: () => void; onIr: (id: string) => void; onVirtud: (v: string) => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const i = lista.findIndex((d) => d.id === id)
  const d = lista[i]
  const grupo = deidadesData.grupos.find((g) => g.id === d?.grupo)
  const ant = lista[(i - 1 + lista.length) % lista.length]
  const sig = lista[(i + 1) % lista.length]

  useEffect(() => {
    const el = ref.current
    if (el && !el.open) el.showModal()
    return () => { if (el?.open) el.close() }
  }, [])

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onIr(ant.id)
      if (e.key === 'ArrowRight') onIr(sig.id)
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [ant, sig, onIr])

  if (!d) return null
  return (
    <dialog
      ref={ref}
      className="ficha-dios"
      style={{ ['--acento' as string]: ACENTO[d.grupo] }}
      aria-label={d.nombre}
      onCancel={(e) => { e.preventDefault(); onCerrar() }}
      onClick={(e) => { if (e.target === ref.current) onCerrar() }}
    >
      <button className="ficha-cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>
      <div className="ficha-cuerpo" key={d.id}>
        <div className="ficha-sello"><img src={img2(d.simbolo)} alt={`Símbolo de ${d.nombre}`} /></div>
        <div className="ficha-texto">
          <p className="ficha-reino">{grupo?.nombre}{d.circulo && ` · ${d.circulo}`}</p>
          <h2>{d.nombre}</h2>
          <p className="ficha-alin"><abbr title={d.alineamiento_nombre}>{d.alineamiento}</abbr> {d.alineamiento_nombre}</p>
          <p className="ficha-desc">{d.descripcion}</p>
          <div className="ficha-virtudes">
            {d.virtudes.map((v) => (
              <button key={v} onClick={() => onVirtud(v)} title={`Ver otras deidades con «${v}»`}>{v}</button>
            ))}
          </div>
          <p className="contador">Libro 2, pág. {d.pagina}</p>
        </div>
      </div>
      <div className="ficha-nav">
        <button onClick={() => onIr(ant.id)}>← {ant.nombre}</button>
        <span className="contador">{i + 1} / {lista.length}</span>
        <button onClick={() => onIr(sig.id)}>{sig.nombre} →</button>
      </div>
    </dialog>
  )
}

export default function Panteon() {
  const [sp, setSp] = useSearchParams()
  const grupo = (deidadesData.grupos.find((g) => g.id === sp.get('grupo'))?.id ?? '') as GrupoDeidad | ''
  const alin = ALINEAMIENTOS.includes(sp.get('alin') ?? '') ? (sp.get('alin') as string) : ''
  const q = sp.get('q') ?? ''
  const abierto = sp.get('dios') ?? ''
  const [plegados, setPlegados] = useState<Set<string>>(new Set())

  const poner = (p: Record<string, string>) => {
    const sig = { grupo, alin, q, dios: abierto, ...p }
    setSp(Object.fromEntries(Object.entries(sig).filter(([, v]) => v)), { replace: true })
  }

  const lista = useMemo(
    () => deidadesData.deidades.filter((d) => (!grupo || d.grupo === grupo) && (!alin || d.alineamiento === alin) &&
      (!q || sinTildes(`${d.nombre} ${d.virtudes.join(' ')}`).includes(sinTildes(q)))),
    [grupo, alin, q],
  )

  const secciones = useMemo(
    () => deidadesData.grupos
      .map((g) => ({ ...g, deidades: lista.filter((d) => d.grupo === g.id) }))
      .filter((s) => s.deidades.length > 0),
    [lista],
  )

  const invocar = () => {
    const pool = lista.length ? lista : deidadesData.deidades
    poner({ dios: pool[Math.floor(Math.random() * pool.length)].id })
  }
  const alternar = (id: string) => setPlegados((p) => {
    const n = new Set(p)
    if (n.has(id)) n.delete(id); else n.add(id)
    return n
  })
  const limpiar = () => poner({ grupo: '', alin: '', q: '' })
  const hayFiltro = !!(grupo || alin || q)

  return (
    <>
      <h1>Panteón</h1>
      <p className="lead">{deidadesData.introduccion.split(' REY DIOS')[0]}</p>
      <ColoresAstrales />

      <div className="filtros">
        <button className={grupo === '' ? 'activo' : ''} onClick={() => poner({ grupo: '' })}>Todos ({deidadesData.deidades.length})</button>
        {deidadesData.grupos.map((g) => (
          <button
            key={g.id}
            className={`chip-reino ${grupo === g.id ? 'activo' : ''}`}
            style={{ ['--acento' as string]: ACENTO[g.id] }}
            onClick={() => poner({ grupo: g.id })}
          >
            {g.nombre} ({deidadesData.deidades.filter((d) => d.grupo === g.id).length})
          </button>
        ))}
      </div>
      <div className="filtros">
        <input className="buscador" placeholder="Buscar deidad o virtud…" value={q} onChange={(e) => poner({ q: e.target.value })} />
        <select value={alin} onChange={(e) => poner({ alin: e.target.value })} aria-label="Alineamiento">
          <option value="">Cualquier alineamiento</option>
          {ALINEAMIENTOS.map((a) => <option key={a} value={a}>{NOMBRE_ALINEAMIENTO.get(a)} ({a})</option>)}
        </select>
        <button className="primario" onClick={invocar}>✦ Invocar una deidad</button>
        {hayFiltro && <button onClick={limpiar}>Quitar filtros</button>}
      </div>
      <p className="contador">{lista.length} deidades</p>

      {lista.length === 0 && (
        <p className="nota">Ninguna deidad coincide. Prueba con otra virtud o <button onClick={limpiar}>quita los filtros</button>.</p>
      )}

      {secciones.map((s) => {
        const cerrada = plegados.has(s.id) && !grupo
        return (
          <section key={s.id} className="reino" style={{ ['--acento' as string]: ACENTO[s.id] }}>
            <h2>
              <button className="reino-cabecera" aria-expanded={!cerrada} onClick={() => alternar(s.id)}>
                <span className="reino-flecha" aria-hidden>{cerrada ? '▸' : '▾'}</span>
                {s.nombre}
                <span className="reino-n">{s.deidades.length}</span>
              </button>
            </h2>
            {!cerrada && (
              <div className="dioses">
                {s.deidades.map((d) => <Tarjeta key={d.id} d={d} onAbrir={() => poner({ dios: d.id })} />)}
              </div>
            )}
          </section>
        )
      })}

      <details className="nota">
        <summary>Abreviaturas de alineamiento</summary>
        <ul>{Object.entries(deidadesData.abreviaturas_alineamiento).map(([k, v]) => <li key={k}><strong>{k}</strong>: {v}</li>)}</ul>
      </details>

      {abierto && lista.some((d) => d.id === abierto) && (
        <Ficha
          lista={lista}
          id={abierto}
          onCerrar={() => poner({ dios: '' })}
          onIr={(id) => poner({ dios: id })}
          onVirtud={(v) => poner({ dios: '', q: v, grupo: '', alin: '' })}
        />
      )}
    </>
  )
}
