import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  NOMBRE_PLANO, criaturas, fmtNum, generarEncuentro, img2, reglas, sumaPx, categoriaInfo,
} from '../lib/bestiario'
import { añadirCombatientes, guardarCombate, leerCombate, type Combatiente } from '../lib/combate'
import Combate from './Combate'
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
