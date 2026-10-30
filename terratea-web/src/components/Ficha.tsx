import { armaduras, razaPorId, clasePorId, img, NOMBRE_ATRIBUTO } from '../lib/datos'
import {
  IDS_ATRIBUTO, aCobre, aporteCA, calcularCA, fmtCobre, fmtMod, modificador, tipoArmadura, vitalidadInicial,
} from '../lib/reglas'
import { costeCompra, nombreCompra, puntuacionesDe, type DatosFicha } from '../lib/personajes'
import { Chip } from './Comunes'
import HabilidadesPorNivel from './HabilidadesPorNivel'
import { TablaSalvacion } from '../pages/DetalleRaza'

export default function Ficha({ e }: { e: DatosFicha }) {
  const raza = razaPorId(e.razaId)!
  const clase = clasePorId(e.claseId)!
  const puntuaciones = puntuacionesDe(e)
  const sub = raza.subrazas?.find((s) => s.id === e.subrazaId)
  const piezas = e.compras.filter((c) => c.tipo === 'armadura').map((c) => armaduras[c.idx])
    .filter((a) => tipoArmadura(a) || /ESCUDO/i.test(a.categoria ?? ''))
  const ca = calcularCA(piezas)
  const modCon = modificador('constitucion', puntuaciones.constitucion ?? 10)
  const vida = e.vida != null ? vitalidadInicial(e.vida, modCon) : null
  const gastado = e.compras.reduce((s, c) => s + (costeCompra(c) ?? 0), 0)
  const resto = e.fortuna ? aCobre(e.fortuna) - gastado : null
  const fortalezas = [...raza.fortalezas, ...(sub?.fortalezas ?? [])]
  const debilidades = [...raza.debilidades, ...(sub?.debilidades ?? [])]
  const m = clase.movimiento

  return (
    <section className="ficha">
      <header className="ficha-cab">
        <img src={img((sub?.imagenes ?? raza.imagenes).ilustraciones[0] ?? '')} alt={raza.nombre} />
        <div>
          <h2>{e.nombre || 'Sin nombre'}</h2>
          <p>{raza.nombre}{sub && ` · ${sub.nombre}`} · {clase.nombre} · Nivel 1</p>
        </div>
        <img src={img(clase.imagenes.ilustraciones[0] ?? '')} alt={clase.nombre} />
      </header>

      <div className="stats">
        {IDS_ATRIBUTO.map((id) => (
          <div key={id} className="stat">
            <small>{NOMBRE_ATRIBUTO[id]}</small>
            <strong>{puntuaciones[id]}</strong>
            <span>{fmtMod(modificador(id, puntuaciones[id]!))}</span>
          </div>
        ))}
        <div className="stat"><small>C.A.</small><strong>{ca}</strong><span>9 + piezas</span></div>
        <div className="stat"><small>Vitalidad</small><strong>{vida ?? '—'}</strong><span>{vida == null ? 'sin tirar' : 'máx.'}</span></div>
      </div>

      <div className="dos-col">
        <div className="bloque">
          <h3>Movimiento</h3>
          <p>Base {m.base} · Combate {m.combate} · Carrera {m.carrera} · Carga {m.carga} · Huida {m.huida}</p>
          <h3>Armadura permitida</h3>
          <p>
            <Chip tono={clase.armadura.ligera ? 'ok' : 'no'}>Ligera</Chip>{' '}
            <Chip tono={clase.armadura.media ? 'ok' : 'no'}>Media</Chip>{' '}
            <Chip tono={clase.armadura.pesada ? 'ok' : 'no'}>Pesada</Chip>
          </p>
          <p className="nota">{clase.armas.join(' ')}</p>
          <p>Alineamiento: {clase.alineamiento.join(', ')}</p>
          {raza.peso_max_carga_kg != null && <p>Peso máximo de carga: {raza.peso_max_carga_kg} kg</p>}
        </div>
        <div className="bloque">
          <h3>Equipo</h3>
          <ul>
            {clase.equipo_inicial.map((x, i) => <li key={`i${i}`}>{x}</li>)}
            {e.compras.map((c, i) => <li key={`c${i}`}>{nombreCompra(c)}</li>)}
          </ul>
          {resto != null && <p>Fortuna restante: <strong>{fmtCobre(Math.max(resto, 0))}</strong></p>}
          {piezas.length > 0 && <p className="nota">C.A. = 9 + suma de piezas ({piezas.map((p) => `${p.nombre}: ${aporteCA(p).toFixed(2)}`).join(', ')}), truncado.</p>}
        </div>
      </div>

      <div className="dos-col">
        <div className="bloque"><h3>Fortalezas</h3><ul className="rasgos bien">{fortalezas.map((r, i) => <li key={i}>{r.texto}</li>)}</ul></div>
        <div className="bloque"><h3>Debilidades</h3><ul className="rasgos mal">{debilidades.map((r, i) => <li key={i}>{r.texto}</li>)}</ul></div>
      </div>

      <div className="bloque">
        <h3>Habilidades por nivel</h3>
        <HabilidadesPorNivel habilidades={clase.habilidades} nivel={1} />
      </div>

      <div className="bloque">
        <h3>Tiradas de salvación (nivel 1)</h3>
        <TablaSalvacion filas={raza.tiradas_salvacion.slice(0, 1)} />
      </div>
    </section>
  )
}
