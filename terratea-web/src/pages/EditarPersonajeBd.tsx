import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useConfirmar } from '../components/Confirmar'
import { puede, useSesion } from '../lib/auth'
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
  lore_origin: texto(p.lore_origin), lore_trajectory: texto(p.lore_trajectory),
  armor_class: texto(p.armor_class), gold: texto(p.gold), silver: texto(p.silver), copper: texto(p.copper),
  specialSkills: p.specialSkills, extraAttributes: p.extraAttributes,
})

export default function EditarPersonajeBd() {
  const id = Number(useParams().id)
  const navegar = useNavigate()
  const confirmar = useConfirmar()
  const [intento, setIntento] = useState(0)
  const [f, setF] = useState<CambiosFicha | null>(null)
  const [nombre, setNombre] = useState('')
  const [imagenes, setImagenes] = useState<ImagenBd[]>([])
  const [reglas, setReglas] = useState<{ alignments: string[]; sexes: string[] }>({ alignments: [], sexes: [] })
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const esMaster = puede(useSesion(), 'MASTER')
  const [delta, setDelta] = useState({ gold: '', silver: '', copper: '' })

  useEffect(() => {
    Promise.all([cargarDeBd(id), reglasBd()])
      .then(([p, r]) => { setF(desdeFicha(p)); setNombre(p.name); setImagenes(p.images ?? []); setReglas(r) })
      .catch((e: Error) => setError(e.message))
  }, [id, intento])

  if (!f) {
    return error ? (
      <>
        <p>{error}</p>
        <div className="filtros">
          <button onClick={() => { setError(''); setIntento((n) => n + 1) }}>Reintentar</button>
          <Link to="/personajes" className="volver">← Mis personajes</Link>
        </div>
      </>
    ) : <p>Cargando…</p>
  }

  const poner = (k: keyof CambiosFicha) => (e: { target: { value: string } }) =>
    setF({ ...f, [k]: k === 'specialSkills' || k === 'extraAttributes' ? lineas(e.target.value) : e.target.value })
  const campo = (etiqueta: string, k: keyof CambiosFicha, extra: { type?: string; step?: string } = {}) => (
    <label>{etiqueta}<input value={texto(f[k])} onChange={poner(k)} {...extra} /></label>
  )

  // Monedas: el jugador solo puede gastar; el Master suma, resta o fija un valor. El servidor lo vuelve a comprobar.
  const MONEDAS = [['gold', 'Oro'], ['silver', 'Plata'], ['copper', 'Cobre']] as const
  const cambiarMoneda = async (k: 'gold' | 'silver' | 'copper', nuevo: number) => {
    if (!Number.isFinite(nuevo) || nuevo < 0) { setError('La cantidad de monedas no puede ser negativa.'); return }
    setError(''); setOcupado(true)
    try {
      const p = await actualizarEnBd(id, { [k]: Math.floor(nuevo) })
      setF((g) => (g ? { ...g, [k]: texto(p[k]) } : g)); setDelta((d) => ({ ...d, [k]: '' }))
    } catch (e) { setError((e as Error).message) }
    setOcupado(false)
  }

  const guardar = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setError(''); setOcupado(true)
    try {
      // Las monedas se guardan al momento (con su propia regla de permisos), no con el formulario.
      const { gold: _o, silver: _p, copper: _c, ...resto } = f
      await actualizarEnBd(id, resto)
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
    if (!(await confirmar('¿Quitar esta imagen de la ficha?', { aceptar: 'Quitar', peligro: true }))) return
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
          <h3>Lore</h3>
          <p className="nota">Lo puede leer cualquier Máster que abra la ficha.</p>
          <div className="form-ficha">
            <label className="ancho">Inicios<textarea rows={5} value={f.lore_origin} onChange={poner('lore_origin')} placeholder="Dónde nació, familia, infancia…" /></label>
            <label className="ancho">Trayectoria<textarea rows={8} value={f.lore_trajectory} onChange={poner('lore_trajectory')} placeholder="Qué ha vivido hasta ahora, aliados, enemigos, logros…" /></label>
          </div>
        </div>

        <div className="bloque">
          <h3>Defensa y tesoro</h3>
          <div className="form-ficha">
            {campo('Clase de armadura', 'armor_class', { type: 'number' })}
          </div>
          <p className="nota">{esMaster ? 'Como Master puedes sumar, restar o fijar las monedas. Se guardan al momento.' : 'Solo puedes gastar monedas (descontar); aumentarlas lo hace el Master. Se guarda al momento.'}</p>
          <div className="form-ficha">
            {MONEDAS.map(([k, nombreMoneda]) => {
              const actual = Number(f[k]) || 0
              const n = Number(delta[k])
              return (
                <div key={k}>
                  <p>{nombreMoneda}: <strong>{actual}</strong></p>
                  <p className="filtros">
                    <input type="number" min={0} aria-label={`${nombreMoneda}: cantidad`} placeholder="Cantidad" value={delta[k]} onChange={(e) => setDelta({ ...delta, [k]: e.target.value })} />
                    <button type="button" disabled={ocupado || !(n > 0) || n > actual} onClick={() => cambiarMoneda(k, actual - n)}>− {esMaster ? 'Restar' : 'Gastar'}</button>
                    {esMaster && <button type="button" disabled={ocupado || !(n > 0)} onClick={() => cambiarMoneda(k, actual + n)}>+ Sumar</button>}
                    {esMaster && <button type="button" disabled={ocupado || delta[k] === '' || !(n >= 0)} onClick={() => cambiarMoneda(k, n)}>Fijar en {delta[k] === '' ? '…' : n}</button>}
                  </p>
                </div>
              )
            })}
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
