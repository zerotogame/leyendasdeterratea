import { useState } from 'react'
import { criaturas } from '../lib/bestiario'
import type { ArmaCombate, Combatiente } from '../lib/combate'
import {
  ETIQUETA_MULT, bonoDeExtra, condicionDe, cumpleCondicion, curaMitad, relevanteEnCombate, resolverDano, textoCondicion, tirarExpresion,
  type Multiplicador, type Tirada,
} from '../lib/danio'

export type ResultadoAtaque = { dano: number; cura: number; texto: string }

const MULTS = Object.keys(ETIQUETA_MULT) as Multiplicador[]
const criaturaPorId = (id: string) => criaturas.find((c) => c.id === id)
const entero = (v: string) => Math.floor(Number(v) || 0)
const signo = (n: number) => (n < 0 ? `−${-n}` : `+${n}`)

/** Armas de la ficha (jugador) o ataque de la criatura (monstruo). */
function armasDe(c: Combatiente): ArmaCombate[] {
  if (c.armas?.length) return c.armas
  const cr = criaturaPorId(c.criaturaId)
  return cr?.dano.formula ? [{ nombre: cr.dano.descripcion ?? 'Ataque', dados: cr.dano.formula }] : []
}

export default function PanelAtaque({ atacante, objetivo, alConfirmar, alCancelar, alCambiarObjetivo }: Readonly<{
  atacante: Combatiente; objetivo: Combatiente
  alConfirmar: (r: ResultadoAtaque) => void; alCancelar: () => void; alCambiarObjetivo: () => void
}>) {
  const armas = armasDe(atacante)
  const hs = atacante.habilidades ?? []
  const activas = hs.filter((h) => h.activa)
  const pasivasBono = hs.filter((h) => !h.activa && h.bonoDano != null)
  const pasivasInfo = hs.filter(relevanteEnCombate)
  /** Una pasiva con número entra marcada si la app comprueba que se cumple; si depende de algo que solo sabe el Máster, queda sin marcar con un aviso. */
  const estadoPasiva = (h: { descripcion: string }) => {
    const cond = condicionDe(h.descripcion)
    return { cond, cumple: cumpleCondicion(cond, atacante) }
  }
  const [usada, setUsada] = useState<string | null>(null)
  const [arma, setArma] = useState(0)
  const [base, setBase] = useState('')
  const [tirada, setTirada] = useState<Tirada | null>(null)
  const [bonos, setBonos] = useState<Record<string, boolean>>(
    () => Object.fromEntries(pasivasBono.filter((h) => estadoPasiva(h).cumple === true).map((h) => [h.nombre, true])))
  const [extra, setExtra] = useState('')
  const [mult, setMult] = useState<Multiplicador>('normal')
  // El bloqueo de Constitución del objetivo (Libro 1: «modificador de bloqueo de daño») entra puesto; el Máster puede cambiarlo
  const [reduc, setReduc] = useState(() => String(Math.max(0, objetivo.mods?.constitucion ?? 0) || ''))
  const [usaFuerza, setUsaFuerza] = useState(true)
  const [extrasOn, setExtrasOn] = useState<Record<string, boolean>>({})
  const [cura, setCura] = useState(true)

  const habUsada = activas.find((h) => h.nombre === usada)
  const habCura = (atacante.habilidades ?? []).find((h) => h.curaMitad)
  const crObj = criaturaPorId(objetivo.criaturaId)
  const dados = armas[arma]?.dados ?? null

  const modFuerza = atacante.mods?.fuerza ?? 0
  const extrasConBono = (atacante.extras ?? []).flatMap((t) => { const b = bonoDeExtra(t); return b == null ? [] : [{ texto: t, bono: b }] })
  const bonoFuerza = usaFuerza ? modFuerza : 0
  const sumaBonos = pasivasBono.filter((h) => bonos[h.nombre]).reduce((s, h) => s + (h.bonoDano ?? 0), 0) + (habUsada?.bonoDano ?? 0)
    + extrasConBono.filter((x) => extrasOn[x.texto]).reduce((s, x) => s + x.bono, 0) + bonoFuerza + entero(extra)
  const r = resolverDano(Math.max(0, entero(base)), sumaBonos, mult, Math.max(0, entero(reduc)))
  const curaFinal = cura && habCura ? curaMitad(r.final) : 0

  const tirar = () => {
    const t = dados ? tirarExpresion(dados) : null
    if (t) { setTirada(t); setBase(String(t.total)) }
  }
  const confirmar = () => {
    const partes: string[] = []
    if (bonoFuerza) partes.push(`${signo(bonoFuerza)} Fuerza`)
    if (habUsada?.bonoDano != null) partes.push(`${signo(habUsada.bonoDano)} ${habUsada.nombre}`)
    for (const h of pasivasBono) if (bonos[h.nombre]) partes.push(`${signo(h.bonoDano ?? 0)} ${h.nombre} (pasiva)`)
    for (const x of extrasConBono) if (extrasOn[x.texto]) partes.push(`${signo(x.bono)} ${x.texto.replace(/^\s*\+\d+\s+/, '')}`)
    if (entero(extra)) partes.push(`${signo(entero(extra))} otros`)
    const inicio = habUsada ? `${atacante.nombre} usa ${habUsada.nombre} contra ${objetivo.nombre}` : `${atacante.nombre} ataca a ${objetivo.nombre}`
    const texto = `${inicio}: ${[String(entero(base)), ...partes].join(' ')} = ${r.bruto}`
      + (mult === 'normal' ? '' : ` → ${ETIQUETA_MULT[mult]} = ${r.tras}`)
      + (entero(reduc) > 0 ? ` − ${entero(reduc)} absorbido` : '')
      + ` → ${r.final} de daño.`
      + (curaFinal > 0 && habCura ? ` ${atacante.nombre} se cura ${curaFinal} (${habCura.nombre}).` : '')
    alConfirmar({ dano: r.final, cura: curaFinal, texto })
  }

  return (
    <div className="barra-ataque panel-ataque" role="status">
      <div className="pa-titulo">
        <span>⚔ <strong>{atacante.nombre}</strong> ➜ <strong>{objetivo.nombre}</strong> <small>(vida {objetivo.vida})</small></span>
        <span>
          <button onClick={alCambiarObjetivo}>Cambiar objetivo</button>
          <button onClick={alCancelar}>Cancelar</button>
        </span>
      </div>

      {activas.length > 0 && (
        <div className="pa-fila">
          <span className="pa-etq">¿Qué habilidad usas?</span>
          <button className={usada === null ? 'activo' : ''} onClick={() => setUsada(null)}>Ataque normal</button>
          {activas.map((h) => (
            <button key={h.nombre} className={usada === h.nombre ? 'activo' : ''} title={h.descripcion} onClick={() => setUsada(h.nombre)}>
              ⚡ {h.nombre}{h.bonoDano != null && ` +${h.bonoDano}`}
            </button>
          ))}
          {habUsada && <small className="pa-desc">{habUsada.descripcion}</small>}
        </div>
      )}

      <div className="pa-fila">
        <span className="pa-etq">1. Daño base</span>
        {armas.length > 1 && armas.map((a, i) => (
          <button key={`${a.nombre}-${i}`} className={i === arma ? 'activo' : ''} onClick={() => { setArma(i); setTirada(null) }}>
            {a.nombre}{a.dados ? ` (${a.dados})` : ''}
          </button>
        ))}
        {armas.length === 1 && <small>{armas[0].nombre}{armas[0].dados ? ` (${armas[0].dados})` : ''}</small>}
        {dados && <button onClick={tirar}>🎲 Tirar {dados}</button>}
        <input type="number" min={0} autoFocus aria-label="Daño base" value={base} placeholder="o escríbelo" style={{ width: 100 }}
          onChange={(e) => { setBase(e.target.value); setTirada(null) }} onKeyDown={(e) => { if (e.key === 'Enter') confirmar() }} />
        {tirada && <small>{tirada.detalle} = <strong>{tirada.total}</strong></small>}
      </div>

      <div className="pa-fila">
          <span className="pa-etq">2. Suma</span>
          {modFuerza !== 0 && (
            <label className="chip" title="Modificador de Fuerza: acciones de fuerza o daño (Libro 1)">
              <input type="checkbox" checked={usaFuerza} onChange={(e) => setUsaFuerza(e.target.checked)} />
              Fuerza {signo(modFuerza)}
            </label>
          )}
          {extrasConBono.map((x) => (
            <label key={x.texto} className="chip" title="Extra de la ficha: suele aplicar solo a cierto tipo de daño">
              <input type="checkbox" checked={!!extrasOn[x.texto]} onChange={(e) => setExtrasOn((b) => ({ ...b, [x.texto]: e.target.checked }))} />
              {x.texto}
            </label>
          ))}
          {habUsada?.bonoDano != null && (
            <span className="chip auto" title={habUsada.descripcion}>⚡ {habUsada.nombre} +{habUsada.bonoDano} <small className="chip-nota">✔ la usas</small></span>
          )}
          {pasivasBono.map((h) => {
            const { cond, cumple } = estadoPasiva(h)
            const nota = cumple === true ? (cond === 'ninguna' ? '✔ pasiva' : '✔ se cumple')
              : cumple === false ? '✖ no se cumple'
                : `⚠ ¿aplica?${textoCondicion(h.descripcion) ? ` ${textoCondicion(h.descripcion)}` : ''}`
            return (
              <label key={h.nombre} className={`chip ${cumple === true ? 'auto' : cumple === false ? 'no' : 'revisar'}`} title={h.descripcion}>
                <input type="checkbox" checked={!!bonos[h.nombre]} onChange={(e) => setBonos((b) => ({ ...b, [h.nombre]: e.target.checked }))} />
                {h.nombre} +{h.bonoDano} <small className="chip-nota">{nota}</small>
              </label>
            )
          })}
          <label>Otros <input type="number" value={extra} placeholder="0" style={{ width: 70 }} onChange={(e) => setExtra(e.target.value)} /></label>
      </div>

      {pasivasInfo.length > 0 && (
        <div className="pa-fila">
          <span className="pa-etq">🔔 Ten en cuenta</span>
          {pasivasInfo.map((h) => <span key={h.nombre} className="chip suave" title={h.descripcion}>{h.nombre}</span>)}
        </div>
      )}

      <div className="pa-fila">
        <span className="pa-etq">3. Lo que recibe {objetivo.nombre}</span>
        {MULTS.map((m) => <button key={m} className={m === mult ? 'activo' : ''} onClick={() => setMult(m)}>{ETIQUETA_MULT[m]}</button>)}
        <label title="Libro 1: la Constitución da un «modificador de bloqueo de daño»">Absorbe{objetivo.mods && <small> (Constitución {signo(objetivo.mods.constitucion)})</small>} <input type="number" min={0} value={reduc} placeholder="0" style={{ width: 70 }} onChange={(e) => setReduc(e.target.value)} /></label>
      </div>
      {(crObj || objetivo.habilidades?.length) && (
        <details className="pa-notas">
          <summary>Ver fortalezas y debilidades de {objetivo.nombre}</summary>
          {crObj && (
            <>
              {crObj.fortalezas.length > 0 && <><strong>Fortalezas</strong><ul>{crObj.fortalezas.map((f) => <li key={f}>{f}</li>)}</ul></>}
              {crObj.debilidades.length > 0 && <><strong>Debilidades</strong><ul>{crObj.debilidades.map((f) => <li key={f}>{f}</li>)}</ul></>}
            </>
          )}
          {objetivo.habilidades && <ul>{objetivo.habilidades.map((h) => <li key={h.nombre}><strong>{h.nombre}:</strong> {h.descripcion}</li>)}</ul>}
        </details>
      )}

      {habCura && (
        <div className="pa-fila">
          <label className="chip" title={habCura.descripcion}>
            <input type="checkbox" checked={cura} onChange={(e) => setCura(e.target.checked)} /> {habCura.nombre}: {atacante.nombre} se cura la mitad
          </label>
        </div>
      )}

      <div className="pa-resumen">
        <span>
          Daño: <strong>{r.bruto}</strong>
          {mult !== 'normal' && <> → {ETIQUETA_MULT[mult]}: <strong>{r.tras}</strong></>}
          {entero(reduc) > 0 && <> − {entero(reduc)}</>}
          {' '}= <strong className="pa-final">{r.final}</strong> a {objetivo.nombre}
          {curaFinal > 0 && <> · {atacante.nombre} se cura <strong>{curaFinal}</strong></>}
        </span>
        <button className="primario" onClick={confirmar}>Confirmar ataque</button>
      </div>
    </div>
  )
}
