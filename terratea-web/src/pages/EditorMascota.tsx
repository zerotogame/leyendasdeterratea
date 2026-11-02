import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { listarGremios, type ResumenGremio } from '../lib/gremios'
import {
  CATEGORIAS, cargarMascota, crearMascota, cuerpoDesde, guardarMascota, mascotaVacia, MOVIMIENTOS,
  quitarImagenMascota, subirImagenMascota, TINTAS, type Categoria, type CuerpoMascota,
} from '../lib/mascotas'
import { listarDeBd, urlImagen, type ResumenBd } from '../lib/sync'

const lineas = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean)
const numero = (v: string) => (v === '' ? 0 : Number(v))
const opcional = (v: string) => (v === '' ? null : Number(v))

type TextoCampo = 'name' | 'species' | 'alignment' | 'role' | 'attack' | 'attack_note' | 'reach' | 'extras' | 'load_total'

export default function EditorMascota() {
  const idParam = useParams().id
  const id = idParam ? Number(idParam) : null
  const navegar = useNavigate()
  const [f, setF] = useState<CuerpoMascota | null>(id == null ? mascotaVacia() : null)
  const [imagen, setImagen] = useState<string | null>(null) // fichero guardado
  const [nueva, setNueva] = useState<File | null>(null)
  const [quitar, setQuitar] = useState(false)
  const [previa, setPrevia] = useState<string | null>(null)
  const [personajes, setPersonajes] = useState<ResumenBd[]>([])
  const [gremios, setGremios] = useState<ResumenGremio[]>([])
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)

  useEffect(() => {
    const carga = id == null ? Promise.resolve(null) : cargarMascota(id)
    Promise.all([carga, listarDeBd(), listarGremios()])
      .then(([m, p, g]) => { if (m) { setF(cuerpoDesde(m)); setImagen(m.image) } setPersonajes(p); setGremios(g) })
      .catch((e: Error) => setError(e.message))
  }, [id])

  useEffect(() => {
    if (!nueva) { setPrevia(null); return }
    const url = URL.createObjectURL(nueva)
    setPrevia(url)
    return () => URL.revokeObjectURL(url)
  }, [nueva])

  const volver = id == null ? '/mis-mascotas' : `/mis-mascotas/${id}`
  if (!f) return <><p>{error || 'Cargando…'}</p><Link to="/mis-mascotas" className="volver">← Mis mascotas</Link></>

  const poner = <K extends keyof CuerpoMascota>(k: K, v: CuerpoMascota[K]) => setF({ ...f, [k]: v })
  const texto = (etiqueta: string, k: TextoCampo, extra?: { requerido?: boolean; ayuda?: string; ancho?: boolean }) => (
    <label className={extra?.ancho ? 'ancho' : undefined}>{etiqueta}
      <input value={f[k]} onChange={(e) => poner(k, e.target.value)} required={extra?.requerido} placeholder={extra?.ayuda} />
    </label>
  )
  const numCampo = (etiqueta: string, k: 'level' | 'hp' | 'ac' | 'dodge', min = 0) => (
    <label>{etiqueta}
      <input type="number" min={min} value={f[k]} onChange={(e) => poner(k, numero(e.target.value))} />
    </label>
  )
  const listaCampo = (etiqueta: string, k: 'specials' | 'inventory') => (
    <label className="ancho">{etiqueta} (uno por línea)
      <textarea rows={7} defaultValue={f[k].join('\n')} onChange={(e) => poner(k, lineas(e.target.value))} />
    </label>
  )

  const guardar = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setError(''); setOcupado(true)
    try {
      const m = id == null ? await crearMascota(f) : await guardarMascota(id, f)
      // La mascota ya está guardada: si la imagen falla se avisa y se puede reintentar editando.
      try {
        if (nueva) await subirImagenMascota(m.id, nueva)
        else if (quitar && imagen) await quitarImagenMascota(m.id)
      } catch (e) {
        setError(`Mascota guardada, pero la imagen falló: ${(e as Error).message}`)
        setOcupado(false)
        if (id == null) navegar(`/mis-mascotas/${m.id}/editar`, { replace: true })
        return
      }
      navegar(`/mis-mascotas/${m.id}`)
    } catch (e) { setError((e as Error).message); setOcupado(false) }
  }

  const mostrada = previa ?? (imagen && !quitar ? urlImagen(imagen) : null)

  return (
    <>
      <Link to={volver} className="volver">← Volver</Link>
      <h1>{id == null ? 'Crear mascota o montura' : `Editar ${f.name}`}</h1>
      {error && <p className="nota" role="alert">{error}</p>}

      <form onSubmit={guardar}>
        <div className="bloque">
          <h3>Datos</h3>
          <div className="form-ficha">
            {texto('Nombre', 'name', { requerido: true, ancho: true })}
            {texto('Raza', 'species')}
            {texto('Alineamiento', 'alignment', { ayuda: 'Neutral' })}
            <label>Función
              <select value={f.role === 'Mascota' || f.role === 'Montura' ? f.role : 'otra'}
                onChange={(e) => poner('role', e.target.value === 'otra' ? '' : e.target.value)}>
                <option>Mascota</option>
                <option>Montura</option>
                <option value="otra">Otra…</option>
              </select>
              {f.role !== 'Mascota' && f.role !== 'Montura' && (
                <input aria-label="Función" value={f.role} onChange={(e) => poner('role', e.target.value)} placeholder="Mascota/Montura" />
              )}
            </label>
            {numCampo('Nivel', 'level')}
            <label>Categoría
              <select value={f.category} onChange={(e) => poner('category', e.target.value as Categoria)}>
                {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.etiqueta}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="bloque">
          <h3>Dueño y gremio</h3>
          <div className="form-ficha">
            <label>Dueño
              <select value={f.owner_id ?? ''} onChange={(e) => poner('owner_id', e.target.value ? Number(e.target.value) : null)}>
                <option value="">— Sin dueño —</option>
                {personajes.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.race} · {p.class})</option>)}
              </select>
            </label>
            <label>Gremio
              <select value={f.guild_id ?? ''} onChange={(e) => poner('guild_id', e.target.value ? Number(e.target.value) : null)}>
                <option value="">— Sin gremio —</option>
                {gremios.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="bloque">
          <h3>Combate</h3>
          <div className="form-ficha">
            {numCampo('Vida', 'hp')}
            {numCampo('C.A.', 'ac')}
            {numCampo('Esquiva (Destr+Habs)', 'dodge', -99)}
            {texto('Rango de alcance', 'reach')}
            {texto('Ataque', 'attack', { ayuda: '2d6 (Garras)' })}
            {texto('Nota del ataque', 'attack_note', { ayuda: 'Mordisco + veneno' })}
            {texto('Texto bajo el logo', 'extras', { ayuda: 'Atq.: 2 | Atq. Transf.: 1 | Cura: 4', ancho: true })}
          </div>
          <h4>Movimiento</h4>
          <div className="form-ficha">
            {MOVIMIENTOS.map(([k, etiqueta]) => (
              <label key={k}>{etiqueta}
                <input type="number" min={0} value={f[k] ?? ''} placeholder="-" onChange={(e) => poner(k, opcional(e.target.value))} />
              </label>
            ))}
          </div>
        </div>

        <div className="bloque">
          <h3>Atributos especiales e inventario</h3>
          <div className="form-ficha">
            {listaCampo('Atributos especiales', 'specials')}
            {listaCampo('Inventario', 'inventory')}
            {texto('Carga total', 'load_total', { ayuda: '-/-' })}
          </div>
        </div>

        <div className="bloque">
          <h3>Aspecto</h3>
          <div className="form-ficha">
            <label>Tinta de la hoja
              <select value={TINTAS.some((t) => t.color === f.color) ? f.color : ''} onChange={(e) => e.target.value && poner('color', e.target.value)}>
                {TINTAS.map((t) => <option key={t.color} value={t.color}>{t.nombre}</option>)}
                <option value="">Personalizada</option>
              </select>
              <input type="color" aria-label="Color de la tinta" value={f.color} onChange={(e) => poner('color', e.target.value)} />
            </label>
            <label className="ancho">Ilustración
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => { setNueva(e.target.files?.[0] ?? null); setQuitar(false) }} />
            </label>
          </div>
          {mostrada && (
            <p>
              <img src={mostrada} alt="Ilustración" style={{ maxWidth: 220, maxHeight: 260 }} />
              {' '}
              <button type="button" className="peligro" onClick={() => { setNueva(null); setQuitar(true) }}>Quitar imagen</button>
            </p>
          )}
        </div>

        <p className="filtros">
          <button type="submit" className="primario" disabled={ocupado}>{id == null ? 'Crear mascota' : 'Guardar cambios'}</button>
          <Link to={volver} className="boton">Cancelar</Link>
        </p>
      </form>
    </>
  )
}
