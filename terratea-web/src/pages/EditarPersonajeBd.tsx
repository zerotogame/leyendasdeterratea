import { pesoNum } from '../lib/carga'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useConfirmar } from '../components/Confirmar'
import { useEsMaster } from '../lib/permisoMonedas'
import { armas as todasArmas, armaduras as todasArmaduras, clases } from '../lib/datos'
import { limpiar } from '../lib/catalogo'
import { armaduraPermitida, calcularCA } from '../lib/reglas'
import {
  actualizarEnBd, añadirObjeto, borrarImagen, cambiarObjeto, cargarDeBd, catalogoObjetos, guardarArmaduras, guardarArmas, quitarObjeto, reglasBd, subirImagen, urlImagen,
  type ArmaBd, type ArmaduraBd, type CambiosFicha, type ImagenBd, type ObjetoCatalogo, type PersonajeBd,
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
  const [inventario, setInventario] = useState<PersonajeBd['inventory']>([])
  const [claseNombre, setClaseNombre] = useState('')
  const [todo, setTodo] = useState(false)
  const [armasPj, setArmasPj] = useState<ArmaBd[]>([])
  const [maxCarga, setMaxCarga] = useState<number | null>(null)
  const [armaNueva, setArmaNueva] = useState('')
  const [armadurasPj, setArmadurasPj] = useState<ArmaduraBd[]>([])
  const [armaduraNueva, setArmaduraNueva] = useState('')
  const [catalogo, setCatalogo] = useState<ObjetoCatalogo[]>([])
  const [nuevo, setNuevo] = useState('')
  const [buscar, setBuscar] = useState('')
  const [cantNueva, setCantNueva] = useState(1)
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const esMaster = useEsMaster()
  const [delta, setDelta] = useState({ gold: '', silver: '', copper: '' })

  useEffect(() => {
    Promise.all([cargarDeBd(id), reglasBd(), catalogoObjetos()])
      .then(([p, r, c]) => { setF(desdeFicha(p)); setNombre(p.name); setClaseNombre(p.class); setImagenes(p.images ?? []); setReglas(r); setInventario(p.inventory); setArmasPj(p.weapons); setArmadurasPj(p.armors ?? []); setMaxCarga(p.max_carry_kg ?? null); setCatalogo(c) })
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

  // Monedas: el jugador solo gasta; el Master suma, resta o fija. El servidor lo vuelve a comprobar.
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

  // El equipo se guarda al momento (no espera a «Guardar cambios»).
  const equipo = async (accion: () => Promise<{ character: PersonajeBd }>) => {
    setError(''); setOcupado(true)
    try { setInventario((await accion()).character.inventory) }
    catch (e) { setError((e as Error).message) }
    setOcupado(false)
  }
  const añadirNuevo = async () => {
    if (!nuevo) return
    await equipo(() => añadirObjeto(id, Number(nuevo), Math.max(1, Math.floor(cantNueva) || 1)))
    setNuevo(''); setCantNueva(1)
  }
  // Filtro por clase: armaduras por su tipo (ligera/media/pesada, dato estructurado) y armas solo por la regla simple
  // «no puede usar armas pesadas». El resto de restricciones del libro son texto libre: se muestran como aviso.
  const sinTilde = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
  const clase = clases.find((c) => sinTilde(c.nombre) === sinTilde(claseNombre))
  const sinPesadas = !!clase?.armas.some((r) => /^no puede (usar |llevar )?armas pesadas\.?$/i.test(r.trim()))
  const catalogoArmas = clase && !todo && sinPesadas ? todasArmas.filter((a) => a.clase_peso !== 'pesada') : todasArmas
  const catalogoArmaduras = clase && !todo ? todasArmaduras.filter((a) => armaduraPermitida(clase, a)) : todasArmaduras

  // Las armas también se guardan al momento: se manda la lista completa ya modificada.
  const cambiarArmas = async (lista: ArmaBd[]) => {
    setError(''); setOcupado(true)
    try { setArmasPj((await guardarArmas(id, lista)).weapons) }
    catch (e) { setError((e as Error).message) }
    setOcupado(false)
  }
  const añadirArma = async () => {
    const a = catalogoArmas.find((x) => x.nombre === armaNueva)
    if (!a) return
    await cambiarArmas([...armasPj, { name: a.nombre, damage: limpiar(a.dano) || null, weight: a.peso ?? null, hands: Number(a.manos) || null }])
    setArmaNueva('')
  }
  const quitarArma = async (i: number) => {
    if (!(await confirmar(`¿Quitar «${armasPj[i].name}» del personaje?`, { aceptar: 'Quitar', peligro: true }))) return
    await cambiarArmas(armasPj.filter((_, k) => k !== i))
  }
  const cambiarEspecial = (i: number, valor: string) => {
    if (valor === (armasPj[i].special ?? '')) return
    void cambiarArmas(armasPj.map((w, k) => (k === i ? { ...w, special: valor.trim() || null } : w)))
  }
  // Equipar/quitar armaduras recalcula la C.A. (9 + aporte de cada pieza) y lo guarda todo junto.
  const cambiarArmaduras = async (lista: ArmaduraBd[]) => {
    const piezas = lista.flatMap((x) => catalogoArmaduras.filter((c) => c.nombre === x.name))
    setError(''); setOcupado(true)
    try {
      const p = await guardarArmaduras(id, lista, calcularCA(piezas))
      setArmadurasPj(p.armors ?? []); setF((g) => (g ? { ...g, armor_class: texto(p.armor_class) } : g))
    } catch (e) { setError((e as Error).message) }
    setOcupado(false)
  }
  const equiparArmadura = async () => {
    const a = catalogoArmaduras.find((x) => x.nombre === armaduraNueva)
    if (!a) return
    await cambiarArmaduras([...armadurasPj, { name: a.nombre, armor_class: a.clase_armadura ?? null, weight: a.peso ?? null, noise: a.ruido ?? null, special: a.atributos_extra ?? null }])
    setArmaduraNueva('')
  }
  const quitarArmadura = async (i: number) => {
    if (!(await confirmar(`¿Quitar «${armadurasPj[i].name}» del personaje?`, { aceptar: 'Quitar', peligro: true }))) return
    await cambiarArmaduras(armadurasPj.filter((_, k) => k !== i))
  }
  const sinTildes = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
  const filtrados = catalogo.filter((o) => String(o.id) === nuevo || sinTildes(o.name).includes(sinTildes(buscar.trim())))
  const quitarObj = async (i: PersonajeBd['inventory'][number]) => {
    if (!(await confirmar(`¿Quitar «${i.name}» del equipo?`, { aceptar: 'Quitar', peligro: true }))) return
    await equipo(() => quitarObjeto(id, i.object_id))
  }
  const cantidad = (i: PersonajeBd['inventory'][number], q: number) => {
    if (q < 1) return
    void equipo(() => cambiarObjeto(id, i.object_id, q))
  }
  const nota = (i: PersonajeBd['inventory'][number], valor: string) => {
    if (valor === (i.note ?? '')) return
    void equipo(() => cambiarObjeto(id, i.object_id, i.quantity, valor.trim()))
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

      <div className="bloque">
        <h3>Armas</h3>
        <p className="nota">Los cambios de armas se guardan al momento.</p>
        {clase && (
          <p className="nota">
            Filtrado para la clase <strong>{clase.nombre}</strong>: {clase.armas.join(' ')}{' '}
            <label><input type="checkbox" checked={todo} onChange={(e) => setTodo(e.target.checked)} /> Mostrar todo el catálogo</label>
          </p>
        )}
        {!armasPj.length && <p className="nota">Sin armas.</p>}
        <ul className="equipo-edicion">
          {armasPj.map((w, i) => (
            <li key={`${w.name}-${i}`} className="filtros">
              <strong>{w.name}</strong>
              <span className="nota">{[w.damage && limpiar(w.damage), w.hands != null && `${w.hands} mano(s)`, w.weight].filter(Boolean).join(' · ')}</span>
              <input aria-label={`Especial de ${w.name}`} placeholder="Especial / nota" defaultValue={w.special ?? ''} key={`s${i}-${w.special ?? ''}`} disabled={ocupado}
                onBlur={(e) => cambiarEspecial(i, e.target.value)} />
              <button type="button" className="peligro" disabled={ocupado} onClick={() => quitarArma(i)}>Quitar</button>
            </li>
          ))}
        </ul>
        <p className="filtros">
          <select value={armaNueva} onChange={(e) => setArmaNueva(e.target.value)} aria-label="Arma a añadir">
            <option value="">— Añadir arma —</option>
            {catalogoArmas.map((a) => <option key={a.nombre} value={a.nombre}>{a.nombre}</option>)}
          </select>
          <button type="button" disabled={ocupado || !armaNueva} onClick={añadirArma}>+ Añadir arma</button>
        </p>
        <h3>Armaduras y escudos</h3>
        <p className="nota">Al equipar o quitar una pieza se recalcula la C.A. (9 + aporte de cada pieza) y se guarda al momento.</p>
        {!armadurasPj.length && <p className="nota">Sin armadura.</p>}
        <ul className="equipo-edicion">
          {armadurasPj.map((a, i) => (
            <li key={`${a.name}-${i}`} className="filtros">
              <strong>{a.name}</strong>
              <span className="nota">{[a.armor_class && `C.A. ${limpiar(a.armor_class)}`, a.weight, a.noise && `ruido: ${limpiar(a.noise)}`].filter(Boolean).join(' · ')}</span>
              <button type="button" className="peligro" disabled={ocupado} onClick={() => quitarArmadura(i)}>Quitar</button>
            </li>
          ))}
        </ul>
        <p className="filtros">
          <select value={armaduraNueva} onChange={(e) => setArmaduraNueva(e.target.value)} aria-label="Armadura a equipar">
            <option value="">— Equipar armadura / escudo —</option>
            {catalogoArmaduras.map((a) => <option key={a.nombre} value={a.nombre}>{a.nombre}</option>)}
          </select>
          <button type="button" disabled={ocupado || !armaduraNueva} onClick={equiparArmadura}>+ Equipar</button>
        </p>
      </div>

      <div className="bloque">
        <h3>Equipamiento</h3>
        <p className="nota">Los cambios de equipo se guardan al momento. No descuentan monedas.</p>
        {!inventario.length && <p className="nota">Sin objetos.</p>}
        <p className="nota">Carga: <strong>{(inventario.reduce((t, i) => t + pesoNum(i.weight_kg) * i.quantity, 0) + armasPj.reduce((t, w) => t + pesoNum(w.weight), 0) + armadurasPj.reduce((t, a) => t + pesoNum(a.weight), 0)).toLocaleString('es-ES', { maximumFractionDigits: 2 })}{maxCarga != null && ` / ${maxCarga}`} kg</strong></p>
        <ul className="equipo-edicion">
          {inventario.map((i) => (
            <li key={i.object_id} className="filtros">
              <strong>{i.name}</strong>
              <input type="number" min={1} aria-label={`Cantidad de ${i.name}`} defaultValue={i.quantity} key={`q${i.object_id}-${i.quantity}`} disabled={ocupado}
                onBlur={(e) => { const q = Number(e.target.value); if (q !== i.quantity) cantidad(i, q) }} />
              <input aria-label={`Nota de ${i.name}`} placeholder="Nota (p. ej. 2/50 usos)" defaultValue={i.note ?? ''} key={`n${i.object_id}-${i.note ?? ''}`} disabled={ocupado}
                onBlur={(e) => nota(i, e.target.value)} />
              <button type="button" className="peligro" disabled={ocupado} onClick={() => quitarObj(i)}>Quitar</button>
            </li>
          ))}
        </ul>
        <p className="filtros">
          <input type="search" value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Buscar objeto…" aria-label="Buscar objeto del catálogo" />
          <select value={nuevo} onChange={(e) => setNuevo(e.target.value)} aria-label="Objeto a añadir">
            <option value="">— Añadir objeto ({filtrados.length}) —</option>
            {filtrados.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <input type="number" min={1} value={cantNueva} onChange={(e) => setCantNueva(Number(e.target.value))} aria-label="Cantidad a añadir" />
          <button type="button" disabled={ocupado || !nuevo} onClick={añadirNuevo}>+ Añadir</button>
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
          <p className="nota">{esMaster ? 'Como Master puedes sumar, restar o fijar las monedas.' : 'Solo puedes gastar monedas; aumentarlas lo hace el Master.'} Se guarda al momento.</p>
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
