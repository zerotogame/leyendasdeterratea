import { gremiosData, img2 } from '../lib/mundo'
import { RazaEnlace } from '../components/Raza'

export default function Gremios() {
  return (
    <>
      <h1>Gremios</h1>
      <p>{gremiosData.introduccion}</p>
      {gremiosData.gremios.map((g) => (
        <article key={g.id} className="gremio bloque">
          {g.emblema && <img className="emblema" src={img2(g.emblema)} alt={`Emblema de ${g.nombre}`} loading="lazy" />}
          <div>
            <h2>{g.nombre}</h2>
            <p>{g.descripcion}</p>
            <table className="tabla">
              <thead><tr><th>Cargo</th><th>Nombre</th><th>Raza</th></tr></thead>
              <tbody>
                {g.miembros.map((m, i) => (
                  <tr key={i}>
                    <td>{m.cargo}</td>
                    <td><strong>{m.nombre}</strong><br /><small className="nota">{m.descripcion}</small></td>
                    <td><RazaEnlace texto={m.raza} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="nota">Libro 2, p. {g.pagina}</p>
          </div>
        </article>
      ))}
    </>
  )
}
