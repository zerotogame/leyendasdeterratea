import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { NOMBRE_PLANO, categoriaInfo, criaturaPorId, img2, reglas, tirarDano, type TiradaDano } from '../lib/bestiario'
import { añadirCombatientes, guardarCombate, leerCombate } from '../lib/combate'
import { IconosTipo } from '../components/Criatura'

export default function DetalleCriatura() {
  const { id } = useParams()
  const c = criaturaPorId(id ?? '')
  const [tiradas, setTiradas] = useState<TiradaDano[]>([])
  const [añadida, setAñadida] = useState(false)
  if (!c) return <p>Criatura no encontrada. <Link to="/bestiario">Volver</Link></p>
  const cat = categoriaInfo(c.categoria)
  const t = c.texto
  const mostrar = (txt: string | null) => txt ?? '¿?'

  const añadirAlCombate = () => {
    guardarCombate(añadirCombatientes(leerCombate(), [c]))
    setAñadida(true)
  }

  return (
    <article className="criatura">
      <Link to="/bestiario" className="volver" onClick={(e) => { if (window.history.length > 1) { e.preventDefault(); window.history.back() } }}>← Bestiario</Link>
      <h1>{c.nombre}</h1>
      <p className="subtitulo">
        <IconosTipo tipos={c.tipos} /> Categoría {c.categoria} · {cat?.nombre}
      </p>

      <div className="stats">
        <div className="stat"><small>Daño</small><strong className="pequeno">{mostrar(t.dano)}</strong></div>
        <div className="stat"><small>C.A.</small><strong>{mostrar(t.ca)}</strong></div>
        <div className="stat"><small>Vitalidad</small><strong>{mostrar(t.vitalidad)}</strong></div>
        <div className="stat"><small>Exp</small><strong className="pequeno">{mostrar(t.px)}</strong></div>
        <div className="stat"><small>Movimiento en combate</small><strong className="pequeno">{mostrar(t.movimiento)}</strong></div>
        <div className="stat"><small>Rango de alcance</small><strong className="pequeno">{mostrar(t.alcance)}</strong></div>
      </div>

      <div className="filtros">
        {c.dano.dados.length > 0
          ? <button className="primario" onClick={() => setTiradas((l) => [tirarDano(c)!, ...l].slice(0, 8))}>🎲 Tirar daño ({c.dano.formula})</button>
          : <span className="nota">El libro no da dados de daño para esta criatura.</span>}
        <button onClick={añadirAlCombate}>⚔ Añadir al combate</button>
        {añadida && <Link to="/master?tab=combate">Ver combate →</Link>}
        {tiradas.length > 0 && <button onClick={() => setTiradas([])}>Borrar tiradas</button>}
      </div>
      {tiradas.length > 0 && (
        <div className="tiradas">
          {tiradas.map((r, i) => (
            <p key={i} className={i === 0 ? 'ultima' : 'nota'}>
              {r.partes.map((p) => `${p.resultados.length}D${p.caras} [${p.resultados.join(', ')}]`).join(' + ')} = <strong>{r.total}</strong>
              {i === 0 && c.dano.descripcion && <> · {c.dano.descripcion}</>}
            </p>
          ))}
        </div>
      )}

      <div className="dos-col">
        <div>
          <h3>Descripción</h3>
          <p>{c.descripcion}</p>
        </div>
        <img className="retrato" src={img2(c.imagen)} alt={c.nombre} />
      </div>

      <div className="dos-col">
        <section className="bloque">
          <h3>Fortalezas</h3>
          <ul className="rasgos bien">{c.fortalezas.map((x, i) => <li key={i}>{x}</li>)}</ul>
        </section>
        <section className="bloque">
          <h3>Debilidades</h3>
          <ul className="rasgos mal">{c.debilidades.map((x, i) => <li key={i}>{x}</li>)}</ul>
        </section>
      </div>

      <section className="bloque">
        <dl className="datos">
          <dt>Localización</dt>
          <dd>{c.localizacion} {c.planos.length > 0 && <span className="nota">({c.planos.map((p) => NOMBRE_PLANO[p]).join(', ')})</span>}</dd>
          <dt>Alineamiento</dt><dd>{c.alineamiento}</dd>
          <dt>Tipo</dt><dd>{c.tipos.map((x) => reglas.tipos.find((y) => y.id === x)?.nombre ?? x).join(', ')}</dd>
          <dt>Categoría</dt><dd>{c.categoria} · {cat?.nombre}</dd>
        </dl>
        <p className="nota">Libro 2, página {c.pagina}. La C.A. más baja es más difícil de golpear. Movimiento y alcance son casillas de la cuadrícula de combate.</p>
      </section>
    </article>
  )
}
