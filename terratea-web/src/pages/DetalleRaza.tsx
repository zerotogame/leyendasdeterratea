import { Link, useParams } from 'react-router-dom'
import { razaPorId, clases, img } from '../lib/datos'
import { Galeria, Parrafos, Rasgos } from '../components/Comunes'
import type { Medidas, TiradaSalvacionFila } from '../data/types'

export const TablaSalvacion = ({ filas }: { filas: TiradaSalvacionFila[] }) => (
  <div className="tabla-scroll">
    <table>
      <thead>
        <tr><th>Nivel</th><th>Venenos</th><th>Magia</th><th>Parálisis / Control</th><th>Quemadura / Sangrado</th><th>Sortilegios / Trampas</th></tr>
      </thead>
      <tbody>
        {filas.map((f) => (
          <tr key={f.niveles}>
            <td>{f.niveles}</td><td>{f.venenos_toxicos}</td><td>{f.magia_maldiciones}</td>
            <td>{f.paralisis_petrificacion_control_mental}</td><td>{f.quemadura_desangrado}</td>
            <td>{f.sortilegios_encantamientos_trampas}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export const MedidasLista = ({ m }: { m?: Medidas }) =>
  m ? (
    <dl className="datos">
      {m.altura && <><dt>Altura</dt><dd>{m.altura}</dd></>}
      {m.peso && <><dt>Peso</dt><dd>{m.peso}</dd></>}
      {m.esperanza_vida && <><dt>Esperanza de vida</dt><dd>{m.esperanza_vida}</dd></>}
    </dl>
  ) : null

export default function DetalleRaza() {
  const { id } = useParams()
  const raza = razaPorId(id ?? '')
  if (!raza) return <p>Raza no encontrada. <Link to="/razas">Volver</Link></p>
  const clasesRaza = clases.filter((c) =>
    c.razas_disponibles.some((r) => r.disponible && r.raza.split('/')[0] === raza.id))

  return (
    <article>
      <Link to="/razas" className="volver">← Razas</Link>
      <h1>{raza.nombre}</h1>
      {raza.imagenes.titulo && <img className="titulo-img" src={img(raza.imagenes.titulo)} alt="" />}
      <div className="dos-col">
        <div>
          <Parrafos texto={raza.descripcion} />
          {raza.peso_max_carga_kg != null && <p><strong>Peso máximo de carga:</strong> {raza.peso_max_carga_kg} kg</p>}
          <MedidasLista m={raza.medidas} />
        </div>
        <Galeria imagenes={raza.imagenes} alt={raza.nombre} />
      </div>
      <Rasgos titulo="Fortalezas" rasgos={raza.fortalezas} tipo="bien" />
      <Rasgos titulo="Debilidades" rasgos={raza.debilidades} tipo="mal" />

      {raza.subrazas?.map((s) => (
        <section key={s.id} className="bloque subraza">
          <h2>{s.nombre}</h2>
          <Galeria imagenes={s.imagenes} alt={s.nombre} />
          <MedidasLista m={s.medidas} />
          <Rasgos titulo="Fortalezas" rasgos={s.fortalezas} tipo="bien" />
          <Rasgos titulo="Debilidades" rasgos={s.debilidades} tipo="mal" />
        </section>
      ))}

      <section className="bloque">
        <h3>Tiradas de salvación</h3>
        <TablaSalvacion filas={raza.tiradas_salvacion} />
      </section>
      <section className="bloque">
        <h3>Clases disponibles ({clasesRaza.length})</h3>
        <div className="chips">
          {clasesRaza.map((c) => <Link key={c.id} to={`/clases/${c.id}`} className="chip">{c.nombre}</Link>)}
        </div>
      </section>
    </article>
  )
}
