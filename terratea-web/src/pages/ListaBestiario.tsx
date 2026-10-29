import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  NOMBRE_EJE, NOMBRE_PLANO, aParams, categoriaInfo, criaturas, filtrar, fmtNum, img2,
  leerFiltros, reglas, type Filtros, type Orden, type Rango,
} from '../lib/bestiario'
import { IconosTipo } from '../components/Criatura'

const POR_PAGINA = 48

function CampoRango({ etiqueta, valor, onChange }: { etiqueta: string; valor: Rango; onChange: (r: Rango) => void }) {
  const set = (i: 0 | 1, v: string) => {
    const r: Rango = [...valor]
    r[i] = v === '' ? null : Number(v)
    onChange(r)
  }
  return (
    <label className="rango">
      <span>{etiqueta}</span>
      <input type="number" min={0} placeholder="mín" value={valor[0] ?? ''} onChange={(e) => set(0, e.target.value)} />
      <input type="number" min={0} placeholder="máx" value={valor[1] ?? ''} onChange={(e) => set(1, e.target.value)} />
    </label>
  )
}

export default function ListaBestiario() {
  const [sp, setSp] = useSearchParams()
  const f = useMemo(() => leerFiltros(sp), [sp])
  const [visibles, setVisibles] = useState(POR_PAGINA)
  const cambiar = (p: Partial<Filtros>) => {
    setSp(aParams({ ...f, ...p }), { replace: true })
    setVisibles(POR_PAGINA)
  }
  const lista = useMemo(() => filtrar(criaturas, f), [f])
  const alternar = <T,>(arr: T[], x: T) => (arr.includes(x) ? arr.filter((y) => y !== x) : [...arr, x])
  const hayFiltros = aParams(f).toString() !== ''

  return (
    <>
      <h1>Bestiario</h1>
      <div className="filtros">
        <input className="buscador" placeholder="Buscar criatura…" value={f.q} onChange={(e) => cambiar({ q: e.target.value })} />
        <select value={f.plano} onChange={(e) => cambiar({ plano: e.target.value })}>
          <option value="">Cualquier plano</option>
          {reglas.planos.filter((p) => p !== 'desconocido' || criaturas.some((c) => c.planos.includes(p))).map((p) => <option key={p} value={p}>{NOMBRE_PLANO[p]}</option>)}
        </select>
        <select value={f.ali} onChange={(e) => cambiar({ ali: e.target.value })}>
          <option value="">Cualquier alineamiento</option>
          {Object.entries(NOMBRE_EJE).map(([id, n]) => <option key={id} value={id}>{n}</option>)}
        </select>
        <select value={f.orden} onChange={(e) => cambiar({ orden: e.target.value as Orden })}>
          <option value="nombre">Orden: nombre</option>
          <option value="categoria">Orden: categoría</option>
          <option value="px">Orden: P.X.</option>
          <option value="vitalidad">Orden: vitalidad</option>
          <option value="ca">Orden: C.A.</option>
        </select>
        <button onClick={() => cambiar({ desc: !f.desc })} title="Invertir el orden">{f.desc ? '↓ Descendente' : '↑ Ascendente'}</button>
      </div>

      <div className="filtros">
        <span>Categoría:</span>
        {reglas.categorias.map((c) => (
          <button key={c.id} className={f.cats.includes(c.id) ? 'activo' : ''} title={c.nombre} onClick={() => cambiar({ cats: alternar(f.cats, c.id) })}>{c.id}</button>
        ))}
        <span className="separador" />
        <span>Tipo:</span>
        {reglas.tipos.map((t) => (
          <button key={t.id} className={`tipo-btn ${f.tipos.includes(t.id) ? 'activo' : ''}`} title={t.nombre} onClick={() => cambiar({ tipos: alternar(f.tipos, t.id) })}>
            <img src={img2(t.icono)} alt={t.nombre} width={22} height={22} />
          </button>
        ))}
      </div>

      <div className="filtros">
        <CampoRango etiqueta="P.X." valor={f.px} onChange={(px) => cambiar({ px })} />
        <CampoRango etiqueta="C.A." valor={f.ca} onChange={(ca) => cambiar({ ca })} />
        <CampoRango etiqueta="Vitalidad" valor={f.vit} onChange={(vit) => cambiar({ vit })} />
        {hayFiltros && <button onClick={() => { setSp({}, { replace: true }); setVisibles(POR_PAGINA) }}>Quitar filtros</button>}
      </div>
      {(f.px.some((x) => x != null) || f.ca.some((x) => x != null) || f.vit.some((x) => x != null)) && (
        <p className="nota">Con un rango activo se ocultan las criaturas con valor «¿?», porque no se pueden comparar.</p>
      )}

      <p className="contador">{lista.length} de {criaturas.length} criaturas</p>
      {lista.length === 0 && <p>Ninguna criatura cumple esos filtros.</p>}
      <div className="tarjetas bestiario">
        {lista.slice(0, visibles).map((c) => (
          <Link key={c.id} to={`/bestiario/${c.id}`} className="tarjeta">
            <img src={img2(c.imagen)} alt={c.nombre} loading="lazy" />
            <h2>{c.nombre}</h2>
            <small>Cat. {c.categoria} · {categoriaInfo(c.categoria)?.nombre.replace('Bestiario ', '')}</small>
            <small>P.X. {fmtNum(c.px)} · C.A. {fmtNum(c.ca)} · Vit. {fmtNum(c.vitalidad)}</small>
            <IconosTipo tipos={c.tipos} tam={22} />
          </Link>
        ))}
      </div>
      {visibles < lista.length && (
        <p style={{ textAlign: 'center' }}><button className="primario" onClick={() => setVisibles((v) => v + POR_PAGINA)}>Mostrar más ({lista.length - visibles} restantes)</button></p>
      )}
    </>
  )
}
