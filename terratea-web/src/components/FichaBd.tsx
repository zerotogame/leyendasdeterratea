import { clases, razas, img } from '../lib/datos'
import { urlImagen, type PersonajeBd } from '../lib/sync'

const fmtMod = (n: number) => (n > 0 ? `+${n}` : String(n))

/** Ficha de un personaje guardado en la base de datos (nivel, equipo y habilidades reales). */
export default function FichaBd({ p }: { p: PersonajeBd }) {
  const raza = razas.find((r) => r.nombre === p.race)
  const clase = clases.find((c) => c.nombre === p.class)
  const carga = p.inventory.reduce((s, i) => s + (Number(i.weight_kg) || 0) * i.quantity, 0)
    + p.weapons.reduce((s, w) => s + (Number(w.weight) || 0), 0)

  return (
    <section className="ficha">
      <header className="ficha-cab">
        {p.images?.length > 0
          ? <img src={urlImagen(p.images[0].file)} alt={p.name} />
          : raza ? <img src={img(raza.imagenes.ilustraciones[0] ?? '')} alt={raza.nombre} /> : <span />}
        <div>
          <h2>{p.name}</h2>
          <p>{p.race} · {p.class} · Nivel {p.level}</p>
          <p className="nota">EXP {p.exp.toLocaleString('es-ES')}{p.required_experience != null && ` / ${p.required_experience.toLocaleString('es-ES')}`}</p>
        </div>
        {clase ? <img src={img(clase.imagenes.ilustraciones[0] ?? '')} alt={clase.nombre} /> : <span />}
      </header>

      <div className="stats">
        {Object.entries(p.attributes).map(([nombre, a]) => (
          <div key={nombre} className="stat"><small>{nombre}</small><strong>{a.value}</strong><span>{fmtMod(a.modifier)}</span></div>
        ))}
        <div className="stat"><small>C.A.</small><strong>{p.armor_class}</strong><span>esquiva {p.dodge != null ? fmtMod(p.dodge) : '—'}</span></div>
        <div className="stat"><small>Vitalidad</small><strong>{p.hit_points}</strong><span>máx.</span></div>
      </div>

      <div className="dos-col">
        <div className="bloque">
          <h3>Movimiento</h3>
          <p>{Object.entries(p.rollMovements).map(([k, v]) => `${k} ${v}`).join(' · ')}</p>
          <h3>Tiradas de salvación</h3>
          <ul>{Object.entries(p.rollSalvations).map(([k, v]) => <li key={k}>{k}: {v}</li>)}</ul>
          <h3>Armamento</h3>
          <ul>{p.weapons.map((w) => <li key={w.slot}>{w.name} — {w.total ?? '—'}{w.special && ` (${w.special})`}</li>)}</ul>
          {p.range_reach && <p>Rango de alcance: {p.range_reach}</p>}
        </div>
        <div className="bloque">
          <h3>Equipo</h3>
          <p>Carga actual: <strong>{carga.toLocaleString('es-ES', { maximumFractionDigits: 2 })}{p.max_carry_kg != null && ` / ${p.max_carry_kg}`} kg</strong></p>
          <ul>{p.inventory.map((i) => <li key={i.object_id}>{i.name}{i.quantity > 1 && ` (${i.quantity})`}</li>)}</ul>
          <p>Tesoro: <strong>{p.gold} oro · {p.silver} plata · {p.copper} cobre</strong></p>
        </div>
      </div>

      <div className="dos-col">
        <div className="bloque"><h3>Habilidades especiales</h3><ul>{p.specialSkills.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
        <div className="bloque"><h3>Atributos extra</h3><ul>{p.extraAttributes.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
      </div>
    </section>
  )
}
