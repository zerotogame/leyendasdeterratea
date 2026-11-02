import { useEffect, type CSSProperties } from 'react'
import { CATEGORIAS, conSigno, MOVIMIENTOS, type MascotaBd } from '../lib/mascotas'
import { urlImagen } from '../lib/sync'

const RENGLONES_ESPECIALES = 9
const RENGLONES_INVENTARIO = 15

const Campo = ({ etiqueta, valor }: { etiqueta: string; valor: string | null }) => (
  <p className="hm-campo"><b>{etiqueta}:</b><span>{valor}</span></p>
)

const Medallon = ({ titulo, nombre, imagen, simbolo }: { titulo: string; nombre: string | null; imagen?: string | null; simbolo?: string }) => (
  <div className="hm-medallon">
    <h3>{titulo}</h3>
    <div className="hm-aro">
      {imagen ? <img src={urlImagen(imagen)} alt={nombre ?? titulo} crossOrigin="anonymous" /> : <span>{simbolo}</span>}
    </div>
    <small>{nombre ?? ''}</small>
  </div>
)

/** Hoja de mascota/montura con el aspecto de la plantilla (tinta configurable). Al imprimir solo sale la hoja. */
export default function HojaMascota({ m }: { m: MascotaBd }) {
  // «Guardar como PDF» propone el título de la página como nombre de archivo
  useEffect(() => {
    const original = document.title
    const antes = () => { document.title = `${m.name.replace(/[\\/:*?"<>|]/g, '').trim() || 'mascota'}_ficha_de_mascota` }
    const despues = () => { document.title = original }
    window.addEventListener('beforeprint', antes)
    window.addEventListener('afterprint', despues)
    return () => { window.removeEventListener('beforeprint', antes); window.removeEventListener('afterprint', despues) }
  }, [m.name])

  const filas = (items: string[], minimo: number) => Array.from({ length: Math.max(minimo, items.length) }, (_, i) => items[i] ?? '')

  return (
    <div className="hoja-mascota" style={{ '--mc': m.color } as CSSProperties}>
      <div className="hm-pagina">
        <header className="hm-cabecera">
          <span className="hm-silueta" aria-hidden="true">♞</span>
          <h1>Ficha de<br />Mascota/Montura</h1>
          <span className="hm-silueta" aria-hidden="true">♞</span>
          <div className="hm-logo">
            <div className="hm-logo-titulo"><span aria-hidden="true">✦</span> Leyendas de Terratea</div>
            {m.extras && <p className="hm-extras">{m.extras}</p>}
          </div>
        </header>

        <div className="hm-cuerpo">
          <div className="hm-izqcentro">
            <div className="hm-arriba">
              <div className="hm-izq">
                <Campo etiqueta="Nombre" valor={m.name} />
                <Campo etiqueta="Raza" valor={m.species} />
                <Campo etiqueta="Alineamiento" valor={m.alignment} />
                <Campo etiqueta="Función" valor={m.role} />

                <section className="hm-movimiento">
                  <h2>Movimiento</h2>
                  <div>
                    {MOVIMIENTOS.map(([k, etiqueta]) => (
                      <div key={k}><small>{etiqueta}</small><strong>{m[k] ?? '-'}</strong></div>
                    ))}
                  </div>
                </section>

                <section className="hm-ataque">
                  {m.attack_note && <small>({m.attack_note})</small>}
                  <p><b>Ataque</b><span>{m.attack}</span></p>
                </section>

                <div className="hm-vitales">
                  <div className="hm-vida"><span aria-label="Vida">♥</span><strong>{m.hp}</strong></div>
                  <div className="hm-ca">
                    <div className="hm-escudo"><small>C.A</small><strong>{m.ac}</strong></div>
                    <small>Esquiva(Destr+Habs): <b>{conSigno(m.dodge)}</b></small>
                  </div>
                </div>
              </div>

              <div className="hm-retrato">
                <div className="hm-marco">{m.image && <img src={urlImagen(m.image)} alt={m.name} crossOrigin="anonymous" />}</div>
                <div className="hm-nivel"><small>Nivel</small><strong>{m.level}</strong></div>
              </div>
            </div>

            <div className="hm-abajo">
              <section className="hm-categoria">
                <h2>Categoría</h2>
                {CATEGORIAS.map((c) => (
                  <p key={c.id}>{c.etiqueta}{m.category === c.id && <span className="hm-x" aria-label="marcada">✗</span>}</p>
                ))}
              </section>
              <section className="hm-especiales">
                <h2>Atributos especiales</h2>
                <ul>{filas(m.specials, RENGLONES_ESPECIALES).map((x, i) => <li key={i}>{x}</li>)}</ul>
              </section>
            </div>
          </div>

          <div className="hm-der">
            <h2 className="hm-alcance"><b>Rango de alcance</b><span>{m.reach}</span></h2>
            <div className="hm-duenos">
              <Medallon titulo="Dueño" nombre={m.owner_name} imagen={m.owner_image} simbolo="?" />
              <Medallon titulo="Gremio" nombre={m.guild_name} simbolo="✦" />
            </div>
            <section className="hm-inventario">
              <h2><span>Inventario</span> <small>Carga Total<b>{m.load_total || '-/-'}</b></small></h2>
              <ul>{filas(m.inventory, RENGLONES_INVENTARIO).map((x, i) => <li key={i}>{x}</li>)}</ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
