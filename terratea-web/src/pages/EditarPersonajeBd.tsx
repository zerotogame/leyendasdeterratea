import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  actualizarEnBd, borrarImagen, cargarDeBd, reglasBd, subirImagen, urlImagen,
  type CambiosFicha, type ImagenBd, type PersonajeBd,
} from '../lib/sync'

const texto = (v: unknown) => (v == null ? '' : String(v))
const lineas = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean)

const desdeFicha = (p: PersonajeBd): CambiosFicha => ({
  name: p.name, player_name: texto(p.player_name), guild: texto(p.guild), alignment: texto(p.alignment), sex: texto(p.sex),
  age: texto(p.age), height: texto(p.height), weight: texto(p.weight),
  hair: texto(p.hair), eyes: texto(p.eyes), marks: texto(p.marks),
  armor_class: texto(p.armor_class), gold: texto(p.gold), silver: texto(p.silver), copper: texto(p.copper),
  specialSkills: p.specialSkills, extraAttributes: p.extraAttributes,
})

export default function EditarPersonajeBd() {
  const id = Number(useParams().id)
  const navegar = useNavigate()
  const [f, setF] = useState<CambiosFicha | null>(null)
  const [nombre, setNombre] = useState('')
  const [imagenes, setImagenes] = useState<ImagenBd[]>([])
  const [reglas, setReglas] = useState<{ alignments: string[]; sexes: string[] }>({ alignments: [], sexes: [] })
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)

  useEffect(() => {
    Promise.all([cargarDeBd(id), reglasBd()])
      .then(([p, r]) => { setF(desdeFicha(p)); setNombre(p.name); setImagenes(p.images ?? []); setReglas(r) })
      .catch((e: Error) => setError(e.message))
  }, [id])

  if (!f) return error ? <p>{error}</p> : <p>Cargando…</p>

  const poner = (k: keyof CambiosFicha) => (e: { target: { value: string } }) =>
    setF({ ...f, [k]: k === 'specialSkills' || k === 'extraAttributes' ? lineas(e.target.value) : e.target.value })
  const campo = (etiqueta: string, k: keyof CambiosFicha, extra: { type?: string; step?: string } = {}) => (
    <label>{etiqueta}<input value={texto(f[k])} onChange={poner(k)} {...extra} /></label>
  )

  const guardar = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setError(''); setOcupado(true)
    try {
      await actualizarEnBd(id, f)
      navegar(`/personajes/bd/${id}`)
    } catch (e) { setError((e as Error).message); setOcupado(false) }
  }

  const añadir = async (files: FileList | null) => {
    if (!files?.length) return
    setError(''); setOcupado(true)
    for (const file of Array.from(files)) {
      try { const nueva = await subirImagen(id, file); setImagenes((l) => [...l, nueva]) }
      catch (e) { setError(`${file.name}: ${(e as Error).message}`) }
    }
    setOcupado(false)
  }

  const quitar = async (i: ImagenBd) => {
    if (!confirm('¿Quitar esta imagen de la ficha?')) return
    try { await borrarImagen(id, i.id); setImagenes((l) => l.filter((x) => x.id !== i.id)) }
    catch (e) { setError((e as Error).message) }
  }

  return (
    <>
      <Link to={`/personajes/bd/${id}`} className="volver">← Volver a la ficha</Link>
      <h1>Editar a {nombre}</h1>
      <p className="nota">Raza, clase, nivel, características y vitalidad solo cambian por las reglas del juego.</p>
      {error && <p className="nota" role="alert">{error}</p>}

      <div className="bloque">
        <h3>Imágenes</h3>
        <div className="imagenes-edicion">
          {imagenes.map((i) => (
            <figure key={i.id}>
              <img src={urlImagen(i.file)} alt={nombre} loading="lazy" />
              <button type="button" className="peligro" onClick={() => quitar(i)}>Quitar</button>
            </figure>
          ))}
        </div>
        {!imagenes.length && <p className="nota">Esta ficha aún no tiene imágenes.</p>}
        <p>
          <label className="boton">
            {ocupado ? 'Espera…' : '+ Añadir imágenes'}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden disabled={ocupado}
              onChange={(e) => { void añadir(e.target.files); e.target.value = '' }} />
          </label>{' '}
          <span className="nota">JPG, PNG, WEBP o GIF · máx. 8 MB</span>
        </p>
      </div>

      <form onSubmit={guardar}>
        <div className="bloque">
          <h3>Datos</h3>
          <div className="form-ficha">
            <label>Nombre<input value={f.name} onChange={poner('name')} required /></label>
            {campo('Jugador', 'player_name')}
            {campo('Gremio', 'guild')}
            <label>Alineamiento
              <select value={f.alignment} onChange={poner('alignment')}>
                <option value="">—</option>
                {reglas.alignments.map((a) => <option key={a}>{a}</option>)}
              </select>
            </label>
            <label>Sexo
              <select value={f.sex} onChange={poner('sex')}>
                <option value="">—</option>
                {reglas.sexes.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            {campo('Edad', 'age', { type: 'number' })}
            {campo('Altura (m)', 'height', { type: 'number', step: '0.01' })}
            {campo('Peso (kg)', 'weight', { type: 'number', step: '0.01' })}
            {campo('Pelo', 'hair')}
            {campo('Ojos', 'eyes')}
            <label className="ancho">Marcas<input value={f.marks} onChange={poner('marks')} /></label>
          </div>
        </div>

        <div className="bloque">
          <h3>Defensa y tesoro</h3>
          <div className="form-ficha">
            {campo('Clase de armadura', 'armor_class', { type: 'number' })}
            {campo('Oro', 'gold', { type: 'number' })}
            {campo('Plata', 'silver', { type: 'number' })}
            {campo('Cobre', 'copper', { type: 'number' })}
          </div>
        </div>

        <div className="bloque">
          <h3>Habilidades</h3>
          <div className="form-ficha">
            <label>Habilidades especiales (una por línea)
              <textarea rows={5} defaultValue={f.specialSkills.join('\n')} onChange={poner('specialSkills')} />
            </label>
            <label>Atributos extra (uno por línea)
              <textarea rows={5} defaultValue={f.extraAttributes.join('\n')} onChange={poner('extraAttributes')} />
            </label>
          </div>
        </div>

        <p className="filtros">
          <button type="submit" className="primario" disabled={ocupado}>Guardar cambios</button>
          <Link to={`/personajes/bd/${id}`} className="boton">Cancelar</Link>
        </p>
      </form>
    </>
  )
}
