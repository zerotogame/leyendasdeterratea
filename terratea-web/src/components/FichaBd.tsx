import { clases, razas, img, imgRaza } from '../lib/datos'
import HabilidadesPorNivel from './HabilidadesPorNivel'
import { urlImagen, type PersonajeBd } from '../lib/sync'

const fmtMod = (n: number) => (n > 0 ? `+${n}` : String(n))
const num = (n: number) => n.toLocaleString('es-ES')

/** Ficha de un personaje guardado en la base de datos (nivel, equipo y habilidades reales). */
export default function FichaBd({ p }: { p: PersonajeBd }) {
  const raza = razas.find((r) => r.nombre === p.race)
  const clase = clases.find((c) => c.nombre.toLowerCase() === p.class.trim().toLowerCase())
  const carga = p.inventory.reduce((s, i) => s + (Number(i.weight_kg) || 0) * i.quantity, 0)
    + p.weapons.reduce((s, w) => s + (Number(w.weight) || 0), 0)
  const retrato = p.images?.length > 0
    ? urlImagen(p.images[0].file)
    : raza ? img(imgRaza(raza)) : null
  const progreso = p.required_experience ? Math.min(100, Math.round((p.exp / p.required_experience) * 100)) : null

  return (
    <section className="ficha fbd">
      <header className="fbd-cab">
        {retrato && <img className="fbd-retrato" src={retrato} alt={p.name} />}
        <div className="fbd-id">
          <h2>{p.name}</h2>
          <p>{p.race} · {p.class}</p>
          <div className="fbd-nivel">
            <strong>Nivel {p.level}</strong>
            {progreso != null && (
              <div className="fbd-exp" role="progressbar" aria-valuenow={progreso} aria-valuemin={0} aria-valuemax={100} aria-label="Experiencia">
                <span style={{ width: `${progreso}%` }} />
              </div>
            )}
            <small>EXP {num(p.exp)}{p.required_experience != null && ` / ${num(p.required_experience)}`}</small>
          </div>
        </div>
        {clase && <img className="fbd-emblema" src={img(clase.imagenes.ilustraciones[0] ?? '')} alt={clase.nombre} />}
      </header>

      <div className="fbd-vitales">
        <div className="vital"><small>Vitalidad</small><strong>{p.hit_points}</strong><span>máx.</span></div>
        <div className="vital"><small>C.A.</small><strong>{p.armor_class}</strong><span>esquiva {p.dodge != null ? fmtMod(p.dodge) : '—'}</span></div>
        {Object.entries(p.attributes).map(([nombre, a]) => (
          <div key={nombre} className="attr"><small>{nombre}</small><strong>{a.value}</strong><span>{fmtMod(a.modifier)}</span></div>
        ))}
      </div>

      <div className="fbd-cuerpo">
        <div className="fbd-principal">
          {clase && (
            <div className="bloque">
              <h3>Habilidades por nivel</h3>
              <HabilidadesPorNivel habilidades={clase.habilidades} nivel={p.level} />
            </div>
          )}
          <div className="bloque"><h3>Habilidades especiales</h3><ul>{p.specialSkills.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
          <div className="bloque"><h3>Atributos extra</h3><ul>{p.extraAttributes.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
        </div>

        <aside className="fbd-lateral">
          <div className="bloque">
            <h3>Armamento</h3>
            <ul>{p.weapons.map((w) => <li key={w.slot}>{w.name} — {w.total ?? '—'}{w.special && ` (${w.special})`}</li>)}</ul>
            {p.range_reach && <p className="nota">Rango de alcance: {p.range_reach}</p>}
          </div>
          <div className="bloque">
            <h3>Movimiento</h3>
            <dl className="fbd-pares">{Object.entries(p.rollMovements).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
            <h3>Tiradas de salvación</h3>
            <dl className="fbd-pares">{Object.entries(p.rollSalvations).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          </div>
          <div className="bloque">
            <h3>Equipo</h3>
            <p>Carga: <strong>{carga.toLocaleString('es-ES', { maximumFractionDigits: 2 })}{p.max_carry_kg != null && ` / ${p.max_carry_kg}`} kg</strong></p>
            <ul>{p.inventory.map((i) => <li key={i.object_id}>{i.name}{i.quantity > 1 && ` (${i.quantity})`}{i.note && ` — ${i.note}`}</li>)}</ul>
            <p className="fbd-tesoro"><span>{p.gold} oro</span><span>{p.silver} plata</span><span>{p.copper} cobre</span></p>
          </div>
        </aside>
      </div>
    </section>
  )
}
