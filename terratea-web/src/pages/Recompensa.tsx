import { useState } from 'react'
import { esJugador, type Combatiente } from '../lib/combate'
import { combatienteDeFicha } from '../lib/jugadores'
import { aplicarPremio, cantidad, hayPremio, pxDerrotados, type Premio } from '../lib/recompensa'

type Campos = { exp: string; oro: string; plata: string; cobre: string }
const VACIO: Campos = { exp: '', oro: '', plata: '', cobre: '' }
const CAMPOS: { id: keyof Campos; etq: string }[] = [
  { id: 'exp', etq: 'P.X.' }, { id: 'oro', etq: 'Oro' }, { id: 'plata', etq: 'Plata' }, { id: 'cobre', etq: 'Cobre' },
]
const premioDe = (c: Campos): Premio => ({ exp: cantidad(c.exp), oro: cantidad(c.oro), plata: cantidad(c.plata), cobre: cantidad(c.cobre) })
const texto = (p: Premio) => [p.exp && `${p.exp} P.X.`, p.oro && `${p.oro} oro`, p.plata && `${p.plata} plata`, p.cobre && `${p.cobre} cobre`].filter(Boolean).join(', ')

/** Reparte experiencia y monedas a los jugadores y lo guarda en su ficha de la base de datos (con confirmación). */
export default function Recompensa({ combate, actualizar, anotar, alCerrar }: Readonly<{
  combate: Combatiente[]
  actualizar: (uid: string, f: (c: Combatiente) => Combatiente) => void
  anotar: (t: string) => void
  alCerrar: () => void
}>) {
  const jugadores = combate.filter((c) => esJugador(c) && c.fichaId != null)
  const sinFicha = combate.filter((c) => esJugador(c) && c.fichaId == null)
  const [filas, setFilas] = useState<Record<string, Campos>>({})
  const [marcados, setMarcados] = useState<Record<string, boolean>>({})
  const [lote, setLote] = useState<Campos>(VACIO)
  const [estado, setEstado] = useState<Record<string, { ok: boolean; texto: string }>>({})
  const [guardando, setGuardando] = useState(false)
  const px = pxDerrotados(combate)

  const fila = (uid: string) => filas[uid] ?? VACIO
  const cambiar = (uid: string, campo: keyof Campos, v: string) => setFilas((f) => ({ ...f, [uid]: { ...fila(uid), [campo]: v } }))
  const darAMarcados = () => {
    setFilas((f) => {
      const n = { ...f }
      for (const j of jugadores) {
        if (!marcados[j.uid]) continue
        n[j.uid] = { ...(n[j.uid] ?? VACIO) }
        for (const { id } of CAMPOS) if (lote[id] !== '') n[j.uid][id] = lote[id]
      }
      return n
    })
  }

  const pendientes = jugadores.map((j) => ({ j, p: premioDe(fila(j.uid)) })).filter((x) => hayPremio(x.p))

  const guardar = async () => {
    if (pendientes.length === 0) return
    const resumen = pendientes.map(({ j, p }) => `• ${j.nombre}: ${texto(p)}`).join('\n')
    if (!confirm(`Se guardará en las fichas (base de datos). La experiencia puede subir de nivel.\n\n${resumen}\n\n¿Confirmar?`)) return
    setGuardando(true)
    for (const { j, p } of pendientes) {
      try {
        const r = await aplicarPremio(j.fichaId!, p)
        const nueva = r.ficha ? combatienteDeFicha(r.ficha) : null
        if (nueva) {
          actualizar(j.uid, (c) => ({ ...c, nivel: nueva.nivel, clase: nueva.clase, habilidades: nueva.habilidades, mods: nueva.mods, extras: nueva.extras, armas: nueva.armas }))
        }
        const msg = `${j.nombre} recibe ${texto(p)}${r.niveles > 0 ? ` y sube ${r.niveles} nivel${r.niveles > 1 ? 'es' : ''} (ahora nivel ${r.ficha?.level})` : ''}.`
        anotar(`🏆 ${msg}`)
        setEstado((e) => ({ ...e, [j.uid]: { ok: true, texto: msg } }))
        setFilas((f) => ({ ...f, [j.uid]: VACIO }))
      } catch (e) {
        setEstado((s) => ({ ...s, [j.uid]: { ok: false, texto: `${(e as Error).message}. Puede que parte ya esté guardada: revisa la ficha antes de repetir.` } }))
      }
    }
    setGuardando(false)
  }

  return (
    <div className="recompensa" role="region" aria-label="Recompensa">
      <div className="pa-titulo">
        <strong>🏆 Recompensa</strong>
        <button onClick={alCerrar}>Cerrar</button>
      </div>
      <p className="nota">
        Enemigos a 0 de vida: <strong>{px.total.toLocaleString('es-ES')} P.X.</strong> según el bestiario
        {px.desconocidos > 0 && ` (más ${px.desconocidos} con P.X. «¿?»)`}. Es solo una pista: tú decides cuánto recibe cada jugador.
      </p>

      {jugadores.length === 0 && <p className="nota">No hay jugadores con ficha de la base de datos en el combate.</p>}
      {sinFicha.length > 0 && <p className="nota">{sinFicha.map((j) => j.nombre).join(', ')}: añadido a mano, no tiene ficha donde guardar.</p>}

      {jugadores.length > 0 && (
        <>
          <div className="pa-fila">
            <span className="pa-etq">Dar a los marcados</span>
            {CAMPOS.map(({ id, etq }) => (
              <label key={id}>{etq} <input type="number" min={0} value={lote[id]} placeholder="0" style={{ width: 80 }}
                onChange={(e) => setLote((l) => ({ ...l, [id]: e.target.value }))} /></label>
            ))}
            <button disabled={!jugadores.some((j) => marcados[j.uid])} onClick={darAMarcados}>Poner</button>
          </div>

          <table className="tabla-recompensa">
            <thead><tr><th /><th>Jugador</th>{CAMPOS.map(({ id, etq }) => <th key={id}>{etq}</th>)}</tr></thead>
            <tbody>
              {jugadores.map((j) => (
                <tr key={j.uid}>
                  <td><input type="checkbox" aria-label={`Marcar a ${j.nombre}`} checked={!!marcados[j.uid]} onChange={(e) => setMarcados((m) => ({ ...m, [j.uid]: e.target.checked }))} /></td>
                  <td>{j.nombre} <small>({j.clase} {j.nivel})</small>
                    {estado[j.uid] && <div className={estado[j.uid].ok ? 'nota' : 'error'}><small>{estado[j.uid].texto}</small></div>}
                  </td>
                  {CAMPOS.map(({ id, etq }) => (
                    <td key={id}><input type="number" min={0} aria-label={`${etq} de ${j.nombre}`} value={fila(j.uid)[id]} placeholder="0" style={{ width: 80 }}
                      onChange={(e) => cambiar(j.uid, id, e.target.value)} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pa-resumen">
            <span>{pendientes.length === 0 ? 'Nada que guardar todavía.' : `Se guardará a ${pendientes.length} jugador${pendientes.length > 1 ? 'es' : ''}.`}</span>
            <button className="primario" disabled={guardando || pendientes.length === 0} onClick={guardar}>
              {guardando ? 'Guardando…' : '💾 Guardar en las fichas'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

