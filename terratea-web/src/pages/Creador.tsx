import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  armas, armaduras, objetos, razas, razaPorId, clasePorId, clasesParaRaza,
  claveRaza, img, NOMBRE_ATRIBUTO,
} from '../lib/datos'
import {
  IDS_ATRIBUTO, aCobre, armaduraPermitida, costeEnCobre, fmtCobre,
  fmtMod, limpiar, modificador, requisitosAtributo, requisitosCumplidos, requisitosTexto,
  tirar7, totalSinMenor, tirarFortuna, tirarVitalidad,
  type Puntuaciones,
} from '../lib/reglas'
import { Chip } from '../components/Comunes'
import { Dado, FilaTirada, duracionDado } from '../components/Dados'
import type { AtributoId, Clase } from '../data/types'
import {
  guardarPersonaje, marcarEnBd, itemCompra, nombreCompra, costeCompra, puntuacionesDe,
  type Asignacion, type Compra,
} from '../lib/personajes'
import Ficha from '../components/Ficha'
import { guardarEnBd, subirImagen } from '../lib/sync'
import {
  CLAVE, CLAVES_DATOS, DATOS_VACIOS, INICIAL, claveCombo, normalizarGuardado,
  type Datos, type Estado, type Guardado,
} from '../lib/sesion'

const PASOS = ['Raza', 'Clase', 'Atributos', 'Equipo', 'Ficha']

const cargar = (): Guardado => {
  try {
    return normalizarGuardado(JSON.parse(localStorage.getItem(CLAVE) ?? 'null'))
  } catch { return INICIAL }
}

export default function Creador() {
  const [g, setG] = useState<Guardado>(cargar)
  const [paso, setPaso] = useState(0)
  useEffect(() => {
    try { localStorage.setItem(CLAVE, JSON.stringify(g)) } catch { /* sin almacenamiento */ }
  }, [g])
  const combo = claveCombo(g)
  const e: Estado = { ...g, ...(g.guardados[combo] ?? DATOS_VACIOS) }
  const cambiar = (p: Partial<Estado>) =>
    setG((x) => {
      const k = claveCombo(x)
      const datos: Partial<Datos> = {}
      const base: Partial<Estado> = {}
      for (const [campo, valor] of Object.entries(p)) {
        if ((CLAVES_DATOS as string[]).includes(campo)) (datos as Record<string, unknown>)[campo] = valor
        else (base as Record<string, unknown>)[campo] = valor
      }
      const guardados = k && Object.keys(datos).length
        ? { ...x.guardados, [k]: { ...(x.guardados[k] ?? DATOS_VACIOS), ...datos } }
        : x.guardados
      return { ...x, ...base, guardados }
    })

  const raza = razaPorId(e.razaId)
  const clase = clasePorId(e.claseId)
  const puntuaciones: Puntuaciones = useMemo(() => puntuacionesDe(e), [e])
  const navigate = useNavigate()
  // Guarda un personaje aparte y limpia la selección; las tiradas de cada raza + clase se conservan.
  const [guardando, setGuardando] = useState(false)
  const [imagen, setImagen] = useState<File | null>(null)
  const vistaImagen = useMemo(() => (imagen ? URL.createObjectURL(imagen) : ''), [imagen])
  useEffect(() => () => { if (vistaImagen) URL.revokeObjectURL(vistaImagen) }, [vistaImagen])
  const [errorImagen, setErrorImagen] = useState('')
  const elegirImagen = (f: File | undefined) => {
    setErrorImagen('')
    if (!f) return
    if (!/^image\/(jpeg|png|webp|gif)$/.test(f.type)) return setErrorImagen('Formato no admitido: usa JPG, PNG, WEBP o GIF.')
    if (f.size > 8 * 1024 * 1024) return setErrorImagen('La imagen pesa más de 8 MB.')
    setImagen(f)
  }
  const guardar = async () => {
    if (guardando) return
    setGuardando(true)
    const p = guardarPersonaje({ ...e, nombre: e.nombre.trim() })
    // Se espera a la BD para que la ficha ya conozca su id; si falla, queda guardado en el navegador y la ficha ofrece reintentar
    let errorBd = ''
    try {
      const bdId = await guardarEnBd(p)
      marcarEnBd(p.id, bdId)
      if (imagen) {
        try { await subirImagen(bdId, imagen) }
        catch (err) { errorBd = `El personaje se guardó pero la imagen no se pudo subir (${(err as Error).message}). Añádela desde «Editar ficha».` }
      }
    } catch (err) { errorBd = `${(err as Error).message}${imagen ? ' La imagen elegida no se ha subido: añádela desde «Editar ficha» cuando el personaje esté en la base de datos.' : ''}` }
    setImagen(null)
    setG((x) => ({ ...INICIAL, guardados: x.guardados }))
    setPaso(0)
    setGuardando(false)
    navigate(`/personajes/${p.id}`, { state: errorBd ? { errorBd } : undefined })
  }

  const razaOk = !!raza && (!raza.subrazas || !!e.subrazaId)
  const claseOk = !!clase
  const atributosOk = !!clase && !e.editando && IDS_ATRIBUTO.every((id) => puntuaciones[id] != null) && requisitosCumplidos(clase, puntuaciones)
  const equipoOk = e.fortuna != null && e.vida != null // fortuna y vitalidad son obligatorias
  const listo = [razaOk, razaOk && claseOk, claseOk && atributosOk, claseOk && atributosOk && equipoOk, true]

  const elegirRazaSub = (razaId: string, subrazaId: string) => {
    // si la clase elegida no está permitida para la nueva raza, se descarta
    const validas = clasesParaRaza(razaId, subrazaId).map((c) => c.id)
    cambiar({ razaId, subrazaId, claseId: validas.includes(e.claseId) ? e.claseId : '' })
  }

  return (
    <>
      <h1>Creador de personajes</h1>
      <ol className="pasos">
        {PASOS.map((n, i) => {
          const accesible = i === 0 || listo.slice(0, i).every(Boolean)
          return (
            <li key={n}>
              <button className={i === paso ? 'activo' : ''} disabled={!accesible} onClick={() => setPaso(i)}>
                <span>{i + 1}</span> {n}
              </button>
            </li>
          )
        })}
      </ol>

      {(raza || clase) && (
        <p className="resumen">
          {raza && <Chip>Raza: {raza.nombre}{e.subrazaId && ` (${raza.subrazas?.find((s) => s.id === e.subrazaId)?.nombre})`}</Chip>}
          {clase && <> <Chip>Clase: {clase.nombre}</Chip></>}
        </p>
      )}
      {paso === 0 && <PasoRaza e={e} elegir={(r, sr) => { elegirRazaSub(r, sr); setPaso(1) }} />}
      {paso === 1 && <PasoClase e={e} onElegir={(claseId) => { cambiar({ claseId }); setPaso(2) }} />}
      {paso === 2 && clase && <PasoAtributos e={e} clase={clase} puntuaciones={puntuaciones} cambiar={cambiar} />}
      {paso === 3 && clase && <PasoEquipo e={e} clase={clase} cambiar={cambiar} puntuaciones={puntuaciones} />}
      {paso === 4 && raza && clase && (
        <>
          <div className="filtros no-print">
            <input className="buscador" placeholder="Nombre del personaje" value={e.nombre} onChange={(ev) => cambiar({ nombre: ev.target.value })} />
            <button className="primario" disabled={!e.nombre.trim() || guardando} onClick={() => void guardar()}>{guardando ? 'Guardando…' : 'Guardar y ver ficha digital'}</button>
            <button onClick={() => window.print()}>Imprimir</button>
          </div>
          {!e.nombre.trim() && <p className="nota no-print">Ponle un nombre a tu personaje para poder guardarlo.</p>}
          <div className="filtros no-print">
            <label className="boton">
              {imagen ? 'Cambiar imagen' : '+ Imagen del personaje'}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden
                onChange={(ev) => { elegirImagen(ev.target.files?.[0]); ev.target.value = '' }} />
            </label>
            {imagen && <button onClick={() => setImagen(null)}>Quitar imagen</button>}
            {vistaImagen && <img src={vistaImagen} alt="Vista previa" style={{ height: 64, borderRadius: 6 }} />}
            <span className="nota">{errorImagen || 'Opcional · JPG, PNG, WEBP o GIF · máx. 8 MB'}</span>
          </div>
          <Ficha e={e} />
        </>
      )}

      <div className="navegacion">
        <button disabled={paso === 0} onClick={() => setPaso(paso - 1)}>← Anterior</button>
        <button className="peligro" title="Las tiradas de cada raza + clase se conservan" onClick={() => { setG((x) => ({ ...INICIAL, guardados: x.guardados })); setPaso(0) }}>Empezar de nuevo</button>
        {paso < PASOS.length - 1 && (
          <button className="primario" disabled={!listo[paso]} onClick={() => setPaso(paso + 1)}>Siguiente →</button>
        )}
      </div>
    </>
  )
}

// ---------------------------------------------------------------- POPUP
function Popup({ onCerrar, children }: { onCerrar: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const k = (ev: KeyboardEvent) => { if (ev.key === 'Escape') onCerrar() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onCerrar])
  return (
    <div className="popup-fondo" onClick={onCerrar}>
      <div className="popup bloque" role="dialog" aria-modal="true" onClick={(ev) => ev.stopPropagation()}>
        <button className="popup-cerrar" aria-label="Cerrar" onClick={onCerrar}>✕</button>
        {children}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- 1. RAZA
function PasoRaza({ e, elegir }: { e: Estado; elegir: (razaId: string, subrazaId: string) => void }) {
  const [abierta, setAbierta] = useState('')
  const [subId, setSubId] = useState('')
  const raza = razaPorId(abierta)
  const sub = raza?.subrazas?.find((s) => s.id === subId)
  const abrir = (r: typeof razas[number]) => {
    setAbierta(r.id)
    setSubId(e.razaId === r.id ? e.subrazaId : r.subrazas?.length === 1 ? r.subrazas[0].id : '')
  }
  const cerrar = () => setAbierta('')
  return (
    <section>
      <h2>1. Elige tu raza</h2>
      <p className="contador">Pulsa una raza para ver sus características.</p>
      <div className="tarjetas">
        {razas.map((r) => (
          <button key={r.id} className={`tarjeta ${e.razaId === r.id ? 'elegida' : ''}`} onClick={() => abrir(r)}>
            <img src={img(r.imagenes.ilustraciones[0] ?? '')} alt={r.nombre} loading="lazy" />
            <h2>{r.nombre}</h2>
          </button>
        ))}
      </div>
      {raza && (
        <Popup onCerrar={cerrar}>
          <h3>{raza.nombre}</h3>
          {raza.subrazas && (
            <div className="filtros">
              <span>Subraza:</span>
              {raza.subrazas.map((s) => (
                <button key={s.id} className={subId === s.id ? 'activo' : ''} onClick={() => setSubId(s.id)}>{s.nombre}</button>
              ))}
            </div>
          )}
          <p>{raza.descripcion[0]}</p>
          {raza.peso_max_carga_kg != null && <p>Peso máximo de carga: {raza.peso_max_carga_kg} kg</p>}
          <div className="dos-col">
            <div><h4>Fortalezas</h4><ul className="rasgos bien">{[...raza.fortalezas, ...(sub?.fortalezas ?? [])].map((r, i) => <li key={i}>{r.texto}</li>)}</ul></div>
            <div><h4>Debilidades</h4><ul className="rasgos mal">{[...raza.debilidades, ...(sub?.debilidades ?? [])].map((r, i) => <li key={i}>{r.texto}</li>)}</ul></div>
          </div>
          {raza.subrazas && !sub && <p className="nota">Elige una subraza para ver sus fortalezas y debilidades propias.</p>}
          <p><Link to={`/razas/${raza.id}`} target="_blank">Ver ficha completa de la raza ↗</Link></p>
          <div className="navegacion">
            <button onClick={cerrar}>Cancelar</button>
            <button className="primario" disabled={!!raza.subrazas && !sub} onClick={() => { elegir(raza.id, subId); cerrar() }}>
              {raza.subrazas && !sub ? 'Elige una subraza arriba para continuar' : `Elegir ${raza.nombre}${sub ? ` (${sub.nombre})` : ''}`}
            </button>
          </div>
        </Popup>
      )}
    </section>
  )
}

// ---------------------------------------------------------------- 2. CLASE
function PasoClase({ e, onElegir }: { e: Estado; onElegir: (id: string) => void }) {
  const [abierta, setAbierta] = useState('')
  const lista = clasesParaRaza(e.razaId, e.subrazaId)
  const clase = clasePorId(abierta)
  const cerrar = () => setAbierta('')
  return (
    <section>
      <h2>2. Elige tu clase</h2>
      <p className="contador">{lista.length} clases permitidas para {razaPorId(e.razaId)?.nombre}{e.subrazaId && ` (${claveRaza(e.razaId, e.subrazaId)})`}. Pulsa una para ver sus características.</p>
      <div className="tarjetas">
        {lista.map((c) => (
          <button key={c.id} className={`tarjeta ${e.claseId === c.id ? 'elegida' : ''}`} onClick={() => setAbierta(c.id)}>
            <img src={img(c.imagenes.ilustraciones[0] ?? '')} alt={c.nombre} loading="lazy" />
            <h2>{c.nombre}</h2>
            <small>{requisitosAtributo(c).map((r) => `${r.minimo} ${NOMBRE_ATRIBUTO[r.atributo].slice(0, 3)}`).join(' · ') || 'Sin requisitos'}</small>
          </button>
        ))}
      </div>
      {clase && (
        <Popup onCerrar={cerrar}>
          <h3>{clase.nombre}</h3>
          <p>{clase.descripcion[0]}</p>
          <div className="dos-col">
            <div>
              <h4>Movimiento</h4>
              <p>Base {clase.movimiento.base} · Combate {clase.movimiento.combate} · Carrera {clase.movimiento.carrera} · Carga {clase.movimiento.carga} · Huida {clase.movimiento.huida}</p>
              <h4>Armadura permitida</h4>
              <p>
                <Chip tono={clase.armadura.ligera ? 'ok' : 'no'}>Ligera</Chip>{' '}
                <Chip tono={clase.armadura.media ? 'ok' : 'no'}>Media</Chip>{' '}
                <Chip tono={clase.armadura.pesada ? 'ok' : 'no'}>Pesada</Chip>
              </p>
              <p className="nota">{clase.armas.join(' ')}</p>
              <p>Alineamiento: {clase.alineamiento.join(', ')}</p>
            </div>
            <div>
              <h4>Equipo inicial</h4>
              {clase.equipo_inicial.length === 0 ? <p>Ninguno.</p> : <ul>{clase.equipo_inicial.map((x, i) => <li key={i}>{x}</li>)}</ul>}
            </div>
          </div>
          <h4>Habilidades iniciales (nivel 0–1)</h4>
          <ul className="habilidades">
            {clase.habilidades.filter((h) => (h.nivel ?? 99) <= 1).map((h, i) => (
              <li key={i}><span className="nivel">Nv {h.nivel}</span><strong>{h.nombre}</strong> {h.tipo && <Chip>{h.tipo}</Chip>}<p>{h.descripcion}</p></li>
            ))}
          </ul>
          <p><Link to={`/clases/${clase.id}`} target="_blank">Ver ficha completa de la clase ↗</Link></p>
          <div className="navegacion">
            <button onClick={cerrar}>Cancelar</button>
            <button className="primario" onClick={() => { onElegir(clase.id); cerrar() }}>Elegir {clase.nombre}</button>
          </div>
        </Popup>
      )}
    </section>
  )
}


// ---------------------------------------------------------------- 3. ATRIBUTOS
function PasoAtributos({ e, clase, puntuaciones, cambiar }: {
  e: Estado; clase: Clase; puntuaciones: Puntuaciones; cambiar: (p: Partial<Estado>) => void
}) {
  const reqs = requisitosAtributo(clase)
  const minimo = (id: AtributoId) => reqs.find((r) => r.atributo === id)?.minimo
  const usados = new Set(Object.values(e.asignacion))
  const menor = e.pool.length ? e.pool.indexOf(Math.min(...e.pool)) : -1

  // El resultado se guarda al instante (no se puede repetir recargando), pero se muestra al terminar la animación.
  const [detalle, setDetalle] = useState<number[][] | null>(null)
  const [animando, setAnimando] = useState(false)
  const [aviso, setAviso] = useState('')
  const tirar = () => {
    if (e.pool.length > 0 && !e.editando) return
    const rolls = tirar7()
    cambiar({ pool: rolls.map(totalSinMenor), asignacion: {}, editando: false })
    setDetalle(rolls)
    setAnimando(true)
    setTimeout(() => setAnimando(false), duracionDado(6 * 450 + 3 * 80) + 200)
  }
  const editarPool = (i: number, v: number) =>
    cambiar({ pool: e.pool.map((x, j) => (j === i ? Math.min(18, Math.max(3, v || 3)) : x)) })

  // Reparto sugerido: descarta la tirada más baja y da las mejores a los atributos con más requisito.
  const autoasignar = () => {
    const orden = e.pool.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v).slice(0, 6)
    const ids = [...IDS_ATRIBUTO].sort((a, b) => (minimo(b) ?? 0) - (minimo(a) ?? 0))
    const asignacion: Asignacion = {}
    ids.forEach((id, k) => { asignacion[id] = orden[k].i })
    cambiar({ asignacion })
    setAviso(`Reparto automático: se descartó la tirada ${menor + 1} (${e.pool[menor]}) y las mejores tiradas fueron a los atributos que pide ${clase.nombre}.`)
  }

  return (
    <section>
      <h2>3. Atributos</h2>
      <p>Tira 4D6 y descarta el dado más bajo, siete veces. Descarta la tirada más baja y reparte las otras seis, sin dividirlas, entre los atributos.
        También puedes escribir tus tiradas a mano.</p>
      <div className="filtros">
        <button className="primario" disabled={e.pool.length > 0 && !e.editando} onClick={tirar}>🎲 Tirar 4D6 × 7</button>
        {e.pool.length === 7 && !animando && !e.editando && <button onClick={autoasignar}>Repartir automáticamente</button>}
      </div>
      {e.pool.length === 0 && (
        <button onClick={() => cambiar({ pool: [10, 10, 10, 10, 10, 10, 10], editando: true })}>Introducir tiradas de dados físicos</button>
      )}
      {e.editando ? (
        <>
          <p className="aviso">Escribe tus siete tiradas (cada una ya sumando los tres mejores de 4D6) y pulsa «Confirmar». Una vez confirmadas no se pueden cambiar. Si prefieres que tire la web, pulsa «Tirar 4D6 × 7».</p>
          <div className="filtros">
            <button className="primario" onClick={() => cambiar({ editando: false })}>Confirmar tiradas</button>
            <button onClick={() => cambiar({ pool: [], asignacion: {}, editando: false })}>Cancelar</button>
          </div>
        </>
      ) : e.pool.length > 0 && (
        <p className="nota">Solo se tira una vez por raza y clase: se guarda en este navegador y, si vuelves a elegir la misma combinación, te saldrán las mismas tiradas.</p>
      )}
      {detalle && (
        <div className="tiradas">
          {detalle.map((dados, i) => <FilaTirada key={i} n={i + 1} dados={dados} retraso={i * 450} />)}
          {animando && <p className="nota">Tirando los dados…</p>}
          {!animando && <p className="nota">Cada tirada suma los tres dados más altos (el tachado se descarta). La tirada más baja ({e.pool[menor]}) también se descarta al repartir.</p>}
        </div>
      )}
      {e.pool.length === 7 && !animando && (
        <>
          {aviso && <p className="aviso">{aviso}</p>}
          <div className="pool">
            {e.pool.map((v, i) => (
              <label key={i} className={i === menor ? 'descartable' : ''}>
                <input type="number" min={3} max={18} value={v} disabled={!e.editando} onChange={(ev) => editarPool(i, Number(ev.target.value))} />
                {i === menor && <small>más baja</small>}
              </label>
            ))}
          </div>
          <div className="tabla-scroll">
            <table className="attrs">
              <thead><tr><th>Atributo</th><th>Mínimo</th><th>Tirada</th><th>Mod.</th><th></th></tr></thead>
              <tbody>
                {IDS_ATRIBUTO.map((id) => {
                  const min = minimo(id)
                  const val = puntuaciones[id]
                  const ok = min == null || (val != null && val >= min)
                  return (
                    <tr key={id}>
                      <td>{NOMBRE_ATRIBUTO[id]}</td>
                      <td>{min ?? '—'}</td>
                      <td>
                        <select
                          value={e.asignacion[id] ?? ''}
                          onChange={(ev) => {
                            const a = { ...e.asignacion }
                            if (ev.target.value === '') delete a[id]; else a[id] = Number(ev.target.value)
                            cambiar({ asignacion: a })
                          }}
                        >
                          <option value="">—</option>
                          {e.pool.map((v, i) => (
                            <option key={i} value={i} disabled={usados.has(i) && e.asignacion[id] !== i}>{v} (tirada {i + 1})</option>
                          ))}
                        </select>
                      </td>
                      <td>{val != null ? fmtMod(modificador(id, val)) : '—'}</td>
                      <td className={ok ? 'ok' : 'error'}>{val == null ? '' : ok ? '✔' : `✘ necesita ${min}`}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <EstadoRequisitos clase={clase} puntuaciones={puntuaciones} />
          {requisitosTexto(clase).length > 0 && <p className="nota">Otros requisitos de la clase: {requisitosTexto(clase).join(' · ')}</p>}
        </>
      )}
    </section>
  )
}

function EstadoRequisitos({ clase, puntuaciones }: { clase: Clase; puntuaciones: Puntuaciones }) {
  const faltan = IDS_ATRIBUTO.filter((id) => puntuaciones[id] == null).length
  const fallos = requisitosAtributo(clase).filter((r) => puntuaciones[r.atributo] != null && puntuaciones[r.atributo]! < r.minimo)
  if (faltan > 0) return <p className="aviso">Te faltan {faltan} atributo{faltan > 1 ? 's' : ''} por asignar.</p>
  if (fallos.length > 0) {
    return <p className="aviso mal">No cumples los requisitos de {clase.nombre}: {fallos.map((r) => `${NOMBRE_ATRIBUTO[r.atributo]} ${puntuaciones[r.atributo]} (mínimo ${r.minimo})`).join(', ')}. Intercambia tiradas entre atributos.</p>
  }
  return <p className="aviso bien">✔ Cumples todos los requisitos de {clase.nombre}. Ya puedes pasar al equipo.</p>
}

// ---------------------------------------------------------------- 4. EQUIPO
function PasoEquipo({ e, clase, cambiar, puntuaciones }: {
  e: Estado; clase: Clase; cambiar: (p: Partial<Estado>) => void; puntuaciones: Puntuaciones
}) {
  const [cat, setCat] = useState<Compra['tipo']>('arma')
  const [q, setQ] = useState('')
  const fortuna = e.fortuna
  // Se guarda al instante; se muestra al terminar la animación.
  const [rodando, setRodando] = useState<{ fortuna?: boolean; vida?: boolean }>({})
  const rodar = (que: 'fortuna' | 'vida', ms: number) => {
    setRodando((r) => ({ ...r, [que]: true }))
    setTimeout(() => setRodando((r) => ({ ...r, [que]: false })), ms)
  }
  const gastado = e.compras.reduce((s, c) => s + (costeCompra(c) ?? 0), 0)
  const restante = fortuna ? aCobre(fortuna) - gastado : 0

  const catalogo = cat === 'arma' ? armas : cat === 'armadura' ? armaduras : objetos
  const filtrados = catalogo
    .map((it, idx) => ({ it, idx }))
    .filter(({ it }) => it.nombre.toLowerCase().includes(q.toLowerCase()))

  const vida = e.vida
  const mod = modificador('constitucion', puntuaciones.constitucion ?? 10)
  const vidaFinal = vida != null ? Math.max(3, vida + mod) : null

  return (
    <section>
      <h2>4. Equipo inicial</h2>
      <div className="dos-col">
        <div className="bloque">
          <h3>Equipo de la clase</h3>
          {clase.equipo_inicial.length === 0 ? <p>Ninguno.</p> : (
            <ul>{clase.equipo_inicial.map((x, i) => <li key={i}>{x}</li>)}</ul>
          )}
          <p className="nota">Armas y escudos: {clase.armas.join(' ')}</p>
        </div>
        <div className="bloque">
          <h3>Fortuna y vitalidad</h3>
          {(fortuna == null || vida == null) && (
            <p className="aviso">Para continuar tienes que tirar {[fortuna == null && 'la fortuna', vida == null && 'la vitalidad'].filter(Boolean).join(' y ')}.</p>
          )}
          <button className="primario" disabled={!!fortuna} onClick={() => { cambiar({ fortuna: tirarFortuna() }); rodar('fortuna', duracionDado(2 * 250) + 300) }}>🎲 Tirar fortuna (1D20 M.O. · 1D8 M.P. · 1D6 M.C.)</button>
          {fortuna && (
            <div className="tiradas">
              <div className="fila-tirada"><span className="etq">Oro (1D20)</span><Dado caras={20} valor={fortuna.oro} /></div>
              <div className="fila-tirada"><span className="etq">Plata (1D8)</span><Dado caras={8} valor={fortuna.plata} retraso={250} /></div>
              <div className="fila-tirada"><span className="etq">Cobre (1D6)</span><Dado caras={6} valor={fortuna.cobre} retraso={500} /></div>
            </div>
          )}
          {fortuna && !rodando.fortuna && (
            <>
              <p>Fortuna: <strong>{fortuna.oro} M.O. · {fortuna.plata} M.P. · {fortuna.cobre} M.C.</strong></p>
              <p className={restante < 0 ? 'error' : ''}>Te quedan: <strong>{fmtCobre(Math.max(restante, 0))}</strong></p>
            </>
          )}
          <p>
            <button disabled={vida != null} onClick={() => { cambiar({ vida: tirarVitalidad() }); rodar('vida', duracionDado(0) + 300) }}>🎲 Tirar vitalidad (1D12 + mod. CON, mín. 3)</button>
          </p>
          {vida != null && (
            <div className="tiradas"><div className="fila-tirada"><span className="etq">Vitalidad (1D12)</span><Dado caras={12} valor={vida} /></div></div>
          )}
          {vidaFinal != null && !rodando.vida && (
            <p>1D12 = {vida}, CON {fmtMod(mod)} → <strong>{vidaFinal} de vitalidad</strong>{vida! + mod < 3 && ' (mínimo 3)'}</p>
          )}
        </div>
      </div>

      {fortuna && !rodando.fortuna && (
        <div className="bloque">
          <h3>Tienda</h3>
          <div className="filtros">
            {(['arma', 'armadura', 'objeto'] as const).map((t) => (
              <button key={t} className={cat === t ? 'activo' : ''} onClick={() => setCat(t)}>
                {t === 'arma' ? 'Armas' : t === 'armadura' ? 'Armaduras' : 'Objetos'}
              </button>
            ))}
            <input className="buscador" placeholder="Buscar…" value={q} onChange={(ev) => setQ(ev.target.value)} />
          </div>
          <div className="tienda">
            {filtrados.map(({ it, idx }) => {
              const coste = costeEnCobre(it.coste)
              const bloqueada = cat === 'armadura' && !armaduraPermitida(clase, it as typeof armaduras[number])
              const sinFondos = coste == null || coste > restante
              return (
                <div key={idx} className={`articulo ${bloqueada ? 'bloqueado' : ''}`}>
                  {it.imagen && <img src={img(it.imagen)} alt="" loading="lazy" />}
                  <div>
                    <strong>{it.nombre}</strong>
                    <small>{limpiar(it.coste)} · {limpiar(it.peso)}{cat === 'arma' && ` · ${limpiar((it as typeof armas[number]).dano)}`}{cat === 'armadura' && ` · ${limpiar((it as typeof armaduras[number]).clase_armadura)}`}</small>
                    {bloqueada && <small className="error">Tu clase no puede usar este tipo de armadura</small>}
                  </div>
                  <button disabled={bloqueada || sinFondos} onClick={() => cambiar({ compras: [...e.compras, { tipo: cat, idx }] })}>Comprar</button>
                </div>
              )
            })}
          </div>
          {e.compras.length > 0 && (
            <>
              <h3>Compras</h3>
              <ul>
                {e.compras.map((c, i) => (
                  <li key={i}>
                    {nombreCompra(c)} — {limpiar(itemCompra(c).coste)}{' '}
                    <button onClick={() => cambiar({ compras: e.compras.filter((_, j) => j !== i) })}>Quitar</button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </section>
  )
}


