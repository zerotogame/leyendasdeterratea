import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  NOMBRE_PLANO, criaturas, fmtNum, generarEncuentro, img2, reglas, sumaPx, tirarDano, categoriaInfo, type TiradaDano,
} from '../lib/bestiario'
import { aplicarDano, añadirCombatientes, guardarCombate, leerCombate, type Combatiente } from '../lib/combate'
import { IconosTipo } from '../components/Criatura'
import type { Criatura, TipoCriatura } from '../data/libro2.types'

export default function Master() {
  const [sp, setSp] = useSearchParams()
  const tab = sp.get('tab') === 'combate' ? 'combate' : 'encuentro'
  const [combate, setCombate] = useState<Combatiente[]>(leerCombate)
  useEffect(() => guardarCombate(combate), [combate])

  return (
    <>
      <h1>Herramientas del Máster</h1>
      <div className="filtros">
        <button className={tab === 'encuentro' ? 'activo' : ''} onClick={() => setSp({}, { replace: true })}>Generador de encuentros</button>
        <button className={tab === 'combate' ? 'activo' : ''} onClick={() => setSp({ tab: 'combate' }, { replace: true })}>
          Combate {combate.length > 0 && `(${combate.length})`}
        </button>
      </div>
      {tab === 'encuentro'
        ? <Encuentro alEnviar={(lista) => { setCombate((c) => añadirCombatientes(c, lista)); setSp({ tab: 'combate' }, { replace: true }) }} />
        : <Combate combate={combate} setCombate={setCombate} />}
    </>
  )
}

// ---------------------------------------------------------------- generador de encuentros
function Encuentro({ alEnviar }: { alEnviar: (l: Criatura[]) => void }) {
  const [cat, setCat] = useState(1)
  const [n, setN] = useState(4)
  const [tipo, setTipo] = useState('')
  const [plano, setPlano] = useState('')
  const [repetir, setRepetir] = useState(false)
  const [lista, setLista] = useState<Criatura[]>([])
  const [fijas, setFijas] = useState<boolean[]>([])

  const pool = useMemo(
    () => criaturas.filter((c) => c.categoria === cat && (!tipo || c.tipos.includes(tipo as TipoCriatura)) && (!plano || c.planos.includes(plano as never))),
    [cat, tipo, plano],
  )
  const info = categoriaInfo(cat)
  const { total, desconocidos } = sumaPx(lista)

  const generar = () => {
    const fijadas = lista.map((c, i) => (fijas[i] ? c : null))
    const nueva = generarEncuentro(pool, n, { repetir, fijas: fijadas })
    setLista(nueva)
    setFijas((f) => nueva.map((_, i) => !!f[i] && !!fijadas[i]))
  }
  const cambiarUna = (i: number) => {
    const otras = lista.map((c, j) => (j === i ? null : c))
    const nueva = generarEncuentro(pool, lista.length, { repetir, fijas: otras })
    setLista(nueva)
  }

  return (
    <section>
      <div className="filtros">
        <label>Categoría <select value={cat} onChange={(e) => { setCat(Number(e.target.value)); setLista([]); setFijas([]) }}>
          {reglas.categorias.map((c) => <option key={c.id} value={c.id}>{c.id} · {c.nombre.replace('Bestiario ', '')}</option>)}
        </select></label>
        <label>Criaturas <input type="number" min={1} max={20} value={n} onChange={(e) => setN(Math.min(20, Math.max(1, Number(e.target.value) || 1)))} style={{ width: 70 }} /></label>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="">Cualquier tipo</option>
          {reglas.tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
        </select>
        <select value={plano} onChange={(e) => setPlano(e.target.value)}>
          <option value="">Cualquier plano</option>
          {reglas.planos.map((p) => <option key={p} value={p}>{NOMBRE_PLANO[p]}</option>)}
        </select>
        <label><input type="checkbox" checked={repetir} onChange={(e) => setRepetir(e.target.checked)} /> Permitir repetidas</label>
      </div>
      {info && <p className="nota">{info.desafios}</p>}
      <p className="contador">{pool.length} criaturas disponibles con estos filtros.</p>
      <div className="filtros">
        <button className="primario" disabled={pool.length === 0} onClick={generar}>🎲 {lista.length ? 'Volver a generar' : 'Generar encuentro'}</button>
        {lista.length > 0 && <button onClick={() => alEnviar(lista)}>⚔ Enviar al combate</button>}
      </div>

      {lista.length > 0 && (
        <>
          <p className="aviso">
            P.X. totales del encuentro: <strong>{total.toLocaleString('es-ES')}</strong>
            {desconocidos > 0 && ` (más ${desconocidos} criatura${desconocidos > 1 ? 's' : ''} con P.X. «¿?»)`}
          </p>
          <div className="encuentro">
            {lista.map((c, i) => (
              <div key={`${c.id}-${i}`} className={`articulo ${fijas[i] ? 'fija' : ''}`}>
                <img src={img2(c.imagen)} alt="" loading="lazy" />
                <div>
                  <Link to={`/bestiario/${c.id}`}><strong>{c.nombre}</strong></Link>
                  <small>C.A. {fmtNum(c.ca)} · Vit. {fmtNum(c.vitalidad)} · P.X. {fmtNum(c.px)} · Daño {c.texto.dano ?? '¿?'}</small>
                  <IconosTipo tipos={c.tipos} tam={18} />
                </div>
                <button title="Conservar esta criatura al volver a generar" className={fijas[i] ? 'activo' : ''} onClick={() => setFijas((f) => lista.map((_, j) => (j === i ? !f[j] : !!f[j])))}>📌</button>
                <button title="Cambiar solo esta criatura" onClick={() => cambiarUna(i)}>↻</button>
              </div>
            ))}
          </div>
        </>
      )}
      {lista.length > 0 && lista.length < n && <p className="nota">Solo hay {lista.length} criaturas distintas con estos filtros; activa «Permitir repetidas» para llegar a {n}.</p>}
    </section>
  )
}

// ---------------------------------------------------------------- tracker de combate
function Combate({ combate, setCombate }: { combate: Combatiente[]; setCombate: (f: (c: Combatiente[]) => Combatiente[]) => void }) {
  const [cantidad, setCantidad] = useState<Record<string, string>>({})
  const [tiradas, setTiradas] = useState<Record<string, TiradaDano>>({})
  const actualizar = (uid: string, f: (c: Combatiente) => Combatiente) => setCombate((l) => l.map((c) => (c.uid === uid ? f(c) : c)))
  const cant = (uid: string) => Math.max(0, Math.floor(Number(cantidad[uid]) || 0))
  const criatura = (id: string) => criaturas.find((c) => c.id === id)

  if (combate.length === 0) {
    return <p>No hay nadie en combate. Genera un encuentro o añade criaturas desde su ficha en el <Link to="/bestiario">bestiario</Link>.</p>
  }
  return (
    <section>
      <div className="filtros">
        <button onClick={() => setCombate((l) => l.map((c) => ({ ...c, vida: c.vidaMax ?? c.vida })))}>Curar a todos</button>
        <button className="peligro" onClick={() => { if (confirm('¿Vaciar el combate?')) setCombate(() => []) }}>Vaciar combate</button>
      </div>
      <div className="combate">
        {combate.map((c) => {
          const cr = criatura(c.criaturaId)
          const caida = c.vida <= 0
          const pct = c.vidaMax ? Math.round((c.vida / c.vidaMax) * 100) : null
          const t = tiradas[c.uid]
          return (
            <div key={c.uid} className={`combatiente ${caida ? 'caida' : ''}`}>
              {cr && <img src={img2(cr.imagen)} alt="" loading="lazy" />}
              <div className="info">
                <strong>{cr ? <Link to={`/bestiario/${cr.id}`}>{c.nombre}</Link> : c.nombre}</strong>
                <small>C.A. {fmtNum(c.ca)} · Mov. {fmtNum(c.movimiento)} casillas · Alcance {fmtNum(c.alcance)} casillas</small>
                {pct != null && <div className="barra"><span style={{ width: `${pct}%` }} /></div>}
                <div className="vida">
                  Vitalidad <input type="number" min={0} value={c.vida} onChange={(e) => actualizar(c.uid, (x) => ({ ...x, vida: Math.max(0, Math.floor(Number(e.target.value) || 0)) }))} />
                  / {fmtNum(c.vidaMax)} {caida && <span className="error">· a 0</span>}
                </div>
                {t && <small>Daño: {t.partes.map((p) => `${p.resultados.length}D${p.caras} [${p.resultados.join(', ')}]`).join(' + ')} = <strong>{t.total}</strong></small>}
              </div>
              <div className="acciones">
                <input type="number" min={0} placeholder="cant." value={cantidad[c.uid] ?? ''} onChange={(e) => setCantidad((x) => ({ ...x, [c.uid]: e.target.value }))} />
                <button className="peligro" disabled={!cant(c.uid)} onClick={() => actualizar(c.uid, (x) => aplicarDano(x, cant(c.uid)))}>− Daño</button>
                <button disabled={!cant(c.uid)} onClick={() => actualizar(c.uid, (x) => aplicarDano(x, -cant(c.uid)))}>+ Curar</button>
                {cr && cr.dano.dados.length > 0 && <button onClick={() => setTiradas((x) => ({ ...x, [c.uid]: tirarDano(cr)! }))}>🎲 Daño</button>}
                <button title="Quitar del combate" onClick={() => setCombate((l) => l.filter((x) => x.uid !== c.uid))}>✕</button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
