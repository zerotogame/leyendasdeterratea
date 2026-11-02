import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useConfirmar } from '../components/Confirmar'
import HojaGremio from '../components/HojaGremio'
import MascotasRelacionadas from '../components/MascotasRelacionadas'
import { borrarGremio, cargarGremio, listarGremios, MAX_ESTRELLAS, type GremioBd } from '../lib/gremios'
import { nivelDeGremio, rankingGremios } from '../lib/nivelesGremio'
import { urlImagen } from '../lib/sync'

const Lista = ({ titulo, items }: { titulo: string; items: string[] }) => (
  <div className="bloque">
    <h3>{titulo}</h3>
    {items.length ? <ul>{items.map((x, i) => <li key={i}>{x}</li>)}</ul> : <p className="nota">—</p>}
  </div>
)

export default function DetalleGremio() {
  const id = Number(useParams().id)
  const navegar = useNavigate()
  const confirmar = useConfirmar()
  const [g, setG] = useState<GremioBd | null>(null)
  const [error, setError] = useState('')

  const [puesto, setPuesto] = useState<number | null>(null)

  useEffect(() => { cargarGremio(id).then(setG).catch((e: Error) => setError(e.message)) }, [id])
  // Si la lista no carga, simplemente no se muestra el puesto.
  useEffect(() => {
    listarGremios().then((l) => setPuesto(rankingGremios(l).find((x) => x.id === id)?.puesto ?? null)).catch(() => setPuesto(null))
  }, [id])

  const eliminar = async () => {
    if (!g || !(await confirmar(`¿Eliminar el gremio ${g.name}? No se puede deshacer (los personajes no se borran).`, { aceptar: 'Eliminar', peligro: true }))) return
    try {
      await borrarGremio(id)
      navegar('/mis-gremios')
    } catch (e) { setError((e as Error).message) }
  }

  if (!g) return error ? <><p>{error}</p><Link to="/mis-gremios" className="volver">← Gremios</Link></> : <p>Cargando…</p>
  const nivel = nivelDeGremio(g.stars)

  return (
    <>
      {/* Al imprimir solo sale la plantilla (más abajo): todo lo marcado «no-imprimir» se oculta. */}
      <div className="no-imprimir">
        <Link to="/mis-gremios" className="volver">← Gremios</Link>
        <h1>{g.name}</h1>
        {error && <p className="nota" role="alert">{error}</p>}
        <p className="filtros">
          <Link to={`/mis-gremios/${id}/editar`} className="boton primario">Editar gremio</Link>
          <button className="peligro" onClick={() => void eliminar()}>Eliminar gremio</button>
          <a href="#plantilla" className="boton">Ir a la plantilla</a>
          <button onClick={() => window.print()}>Exportar PDF / Imprimir</button>
        </p>

        <div className="bloque">
          <p><strong>Fundación:</strong> {g.founded || '—'} · <strong>Localización:</strong> {g.location || '—'}</p>
          <p><strong>Reputación:</strong> {g.reputation}% · <span aria-label={`${g.stars} de ${MAX_ESTRELLAS} estrellas`}>{'★'.repeat(g.stars)}{'☆'.repeat(MAX_ESTRELLAS - g.stars)}</span></p>
        </div>

        <div className="bloque">
          <h3>Miembros</h3>
          {g.members.length ? (
            <div className="tarjetas">
              {g.members.map((m) => (
                <div key={m.id} className="tarjeta">
                  <Link to={`/personajes/bd/${m.id}`} className="enlace-tarjeta">
                    {m.image && <img src={urlImagen(m.image)} alt={m.name} loading="lazy" />}
                    <h2>{m.name}</h2>
                    <small>{m.race} · {m.class} · Nivel {m.level}</small>
                  </Link>
                </div>
              ))}
            </div>
          ) : <p className="nota">Sin miembros.</p>}
        </div>

        <div className="bloque">
          <h3>Nivel {g.stars}: {nivel.nombre}</h3>
          <p>{nivel.descripcion}</p>
          {nivel.ventajas.length > 0 && <ul>{nivel.ventajas.map((v, i) => <li key={i}>{v}</li>)}</ul>}
          <p className="nota">
            {puesto != null && <>Puesto {puesto} en el <Link to="/gremios">Ranking de Gremios</Link> · </>}
            <Link to={`/gremios/niveles?nivel=${g.stars}`}>Ver todos los niveles</Link>
          </p>
        </div>

        <MascotasRelacionadas de="gremio" id={id} />

        <div className="bloque">
          <h3>Tesoro</h3>
          <p>Oro: <strong>{g.gold}</strong> · Plata: <strong>{g.silver}</strong> · Cobre: <strong>{g.copper}</strong></p>
          <h4>Gemas</h4>
          {g.gems.length ? <ul>{g.gems.map((x, i) => <li key={i}>{x.name} ({x.quantity})</li>)}</ul> : <p className="nota">—</p>}
        </div>

        <div className="form-ficha">
          <Lista titulo="Almacén" items={g.storage} />
          <Lista titulo="Cosecha" items={g.harvest} />
          <Lista titulo="Ventajas" items={g.advantages} />
          <Lista titulo="Beneficios" items={g.benefits} />
          <div className="bloque">
            <h3>Personal</h3>
            {g.staff.length
              ? <ul>{g.staff.map((x, i) => <li key={i}>{x.name}{x.note && <small className="nota"> · {x.note}</small>}</li>)}</ul>
              : <p className="nota">—</p>}
          </div>
          <Lista titulo="Propiedades" items={g.properties} />
        </div>

        <h2 id="plantilla">Plantilla del gremio</h2>
        <p className="nota">Esto es lo que se imprime. En el diálogo elige «Guardar como PDF», papel A4 apaisado y activa «Gráficos de fondo».</p>
      </div>
      <HojaGremio g={g} />
    </>
  )
}
