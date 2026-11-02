import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  cargarGremio, crearGremio, cuerpoDesde, gremioVacio, guardarGremio, MAX_ESTRELLAS, personajesDisponibles,
  type CuerpoGremio,
} from '../lib/gremios'
import type { ResumenBd } from '../lib/sync'

const lineas = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean)
const numero = (v: string) => (v === '' ? 0 : Number(v))

type ListaTexto = 'storage' | 'harvest' | 'advantages' | 'benefits' | 'properties'

export default function EditorGremio() {
  const idParam = useParams().id
  const id = idParam ? Number(idParam) : null
  const navegar = useNavigate()
  const [f, setF] = useState<CuerpoGremio | null>(id == null ? gremioVacio() : null)
  const [personajes, setPersonajes] = useState<ResumenBd[]>([])
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)

  useEffect(() => {
    const carga = id == null ? Promise.resolve(null) : cargarGremio(id)
    Promise.all([carga, personajesDisponibles()])
      .then(([g, p]) => { if (g) setF(cuerpoDesde(g)); setPersonajes(p) })
      .catch((e: Error) => setError(e.message))
  }, [id])

  if (!f) return <><p>{error || 'Cargando…'}</p><Link to="/mis-gremios" className="volver">← Gremios</Link></>

  const poner = <K extends keyof CuerpoGremio>(k: K, v: CuerpoGremio[K]) => setF({ ...f, [k]: v })
  const texto = (k: 'name' | 'founded' | 'location') => (e: { target: { value: string } }) => poner(k, e.target.value)
  const numCampo = (etiqueta: string, k: 'reputation' | 'stars' | 'gold' | 'silver' | 'copper', max?: number) => (
    <label>{etiqueta}
      <input type="number" min={0} max={max} value={f[k]} onChange={(e) => poner(k, numero(e.target.value))} />
    </label>
  )
  const listaCampo = (etiqueta: string, k: ListaTexto) => (
    <label className="ancho">{etiqueta} (una por línea)
      <textarea rows={6} defaultValue={f[k].join('\n')} onChange={(e) => poner(k, lineas(e.target.value))} />
    </label>
  )
  const alternarMiembro = (pid: number) =>
    poner('members', f.members.includes(pid) ? f.members.filter((m) => m !== pid) : [...f.members, pid])

  const guardar = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setError(''); setOcupado(true)
    try {
      const g = id == null ? await crearGremio(f) : await guardarGremio(id, f)
      navegar(`/mis-gremios/${g.id}`)
    } catch (e) { setError((e as Error).message); setOcupado(false) }
  }

  return (
    <>
      <Link to={id == null ? '/mis-gremios' : `/mis-gremios/${id}`} className="volver">← Volver</Link>
      <h1>{id == null ? 'Crear gremio' : `Editar ${f.name}`}</h1>
      {error && <p className="nota" role="alert">{error}</p>}

      <form onSubmit={guardar}>
        <div className="bloque">
          <h3>Datos</h3>
          <div className="form-ficha">
            <label className="ancho">Nombre<input value={f.name} onChange={texto('name')} required /></label>
            <label>Fecha de fundación<input value={f.founded ?? ''} onChange={texto('founded')} placeholder="07/06/25" /></label>
            <label>Localización<input value={f.location ?? ''} onChange={texto('location')} /></label>
            {numCampo('Reputación (%)', 'reputation', 100)}
            {numCampo(`Estrellas (0-${MAX_ESTRELLAS})`, 'stars', MAX_ESTRELLAS)}
          </div>
        </div>

        <div className="bloque">
          <h3>Miembros</h3>
          {personajes.length === 0 ? <p className="nota">No hay personajes guardados en la BD.</p> : (
            <div className="filtros">
              {personajes.map((p) => (
                <label key={p.id}>
                  <input type="checkbox" checked={f.members.includes(p.id)} onChange={() => alternarMiembro(p.id)} /> {p.name}
                  <small className="nota"> ({p.race} · {p.class})</small>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="bloque">
          <h3>Tesoro</h3>
          <div className="form-ficha">
            {numCampo('Oro', 'gold')}
            {numCampo('Plata', 'silver')}
            {numCampo('Cobre', 'copper')}
          </div>
          <h4>Gemas</h4>
          {f.gems.map((x, i) => (
            <p key={i} className="filtros">
              <input aria-label="Gema" value={x.name} placeholder="Nombre"
                onChange={(e) => poner('gems', f.gems.map((y, j) => (j === i ? { ...y, name: e.target.value } : y)))} />
              <input aria-label="Cantidad" type="number" min={0} value={x.quantity}
                onChange={(e) => poner('gems', f.gems.map((y, j) => (j === i ? { ...y, quantity: numero(e.target.value) } : y)))} />
              <button type="button" className="peligro" onClick={() => poner('gems', f.gems.filter((_, j) => j !== i))}>Quitar</button>
            </p>
          ))}
          <button type="button" onClick={() => poner('gems', [...f.gems, { name: '', quantity: 1 }])}>+ Añadir gema</button>
        </div>

        <div className="bloque">
          <h3>Almacén y cosecha</h3>
          <div className="form-ficha">
            {listaCampo('Almacén', 'storage')}
            {listaCampo('Cosecha', 'harvest')}
          </div>
        </div>

        <div className="bloque">
          <h3>Ventajas, beneficios y propiedades</h3>
          <div className="form-ficha">
            {listaCampo('Ventajas', 'advantages')}
            {listaCampo('Beneficios', 'benefits')}
            {listaCampo('Propiedades', 'properties')}
          </div>
        </div>

        <div className="bloque">
          <h3>Personal</h3>
          <p className="nota">Contratados del gremio. En la nota, lo que cuestan o rinden (p. ej. «5mp/mes»).</p>
          {f.staff.map((x, i) => (
            <p key={i} className="filtros">
              <input aria-label="Nombre" value={x.name} placeholder="Nombre / puesto"
                onChange={(e) => poner('staff', f.staff.map((y, j) => (j === i ? { ...y, name: e.target.value } : y)))} />
              <input aria-label="Nota" value={x.note} placeholder="Nota"
                onChange={(e) => poner('staff', f.staff.map((y, j) => (j === i ? { ...y, note: e.target.value } : y)))} />
              <button type="button" className="peligro" onClick={() => poner('staff', f.staff.filter((_, j) => j !== i))}>Quitar</button>
            </p>
          ))}
          <button type="button" onClick={() => poner('staff', [...f.staff, { name: '', note: '' }])}>+ Añadir personal</button>
        </div>

        <p className="filtros">
          <button type="submit" className="primario" disabled={ocupado}>{id == null ? 'Crear gremio' : 'Guardar cambios'}</button>
          <Link to={id == null ? '/mis-gremios' : `/mis-gremios/${id}`} className="boton">Cancelar</Link>
        </p>
      </form>
    </>
  )
}
