import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { clasePorId, razasParaClase, img, NOMBRE_ATRIBUTO } from '../lib/datos'
import { Chip, Galeria, Parrafos } from '../components/Comunes'
import { requisitosAtributo, requisitosTexto } from '../lib/reglas'

export default function DetalleClase() {
  const { id } = useParams()
  const clase = clasePorId(id ?? '')
  const [filtro, setFiltro] = useState<'todas' | 'activa' | 'pasiva'>('todas')
  const habilidades = useMemo(
    () => (clase?.habilidades ?? []).filter((h) => filtro === 'todas' || h.tipo === filtro),
    [clase, filtro],
  )
  if (!clase) return <p>Clase no encontrada. <Link to="/clases">Volver</Link></p>
  const razas = razasParaClase(clase)
  const reqs = requisitosAtributo(clase)
  const reqTexto = requisitosTexto(clase)

  return (
    <article>
      <Link to="/clases" className="volver">← Clases</Link>
      <h1>{clase.nombre}</h1>
      {clase.imagenes.titulo && <img className="titulo-img" src={img(clase.imagenes.titulo)} alt="" />}
      <div className="dos-col">
        <div><Parrafos texto={clase.descripcion} /></div>
        <Galeria imagenes={clase.imagenes} alt={clase.nombre} />
      </div>

      <section className="bloque">
        <h3>Requisitos y características</h3>
        <dl className="datos">
          <dt>Requisitos</dt>
          <dd>{reqs.length ? reqs.map((r) => `${r.minimo} ${NOMBRE_ATRIBUTO[r.atributo]}`).join(' · ') : 'Ninguno'}</dd>
          {reqTexto.length > 0 && <><dt>Notas</dt><dd>{reqTexto.join(' · ')}</dd></>}
          <dt>Armadura</dt>
          <dd>
            <Chip tono={clase.armadura.ligera ? 'ok' : 'no'}>Ligera</Chip>{' '}
            <Chip tono={clase.armadura.media ? 'ok' : 'no'}>Media</Chip>{' '}
            <Chip tono={clase.armadura.pesada ? 'ok' : 'no'}>Pesada</Chip>
          </dd>
          <dt>Armas y escudos</dt><dd>{clase.armas.join(' ')}</dd>
          <dt>Rango</dt><dd>{clase.rango_distancia ?? '—'}</dd>
          <dt>Alineamiento</dt><dd>{clase.alineamiento.join(', ')}</dd>
          <dt>Movimiento</dt>
          <dd>Base {clase.movimiento.base} · Combate {clase.movimiento.combate} · Carrera {clase.movimiento.carrera} · Carga {clase.movimiento.carga} · Huida {clase.movimiento.huida}</dd>
          <dt>Equipo inicial</dt><dd>{clase.equipo_inicial.join(' · ') || '—'}</dd>
        </dl>
      </section>

      <section className="bloque">
        <h3>Razas permitidas ({razas.length})</h3>
        <div className="chips">
          {razas.map((r) => <Link key={r.raza} to={`/razas/${r.enlace}`} className="chip">{r.nombre}</Link>)}
        </div>
      </section>

      <section className="bloque">
        <h3>Progresión</h3>
        <div className="tabla-scroll">
          <table>
            <thead><tr><th>Nivel</th><th>Experiencia</th>{clase.progresion.some((p) => p.rango) && <th>Rango</th>}</tr></thead>
            <tbody>
              {clase.progresion.map((p) => (
                <tr key={p.nivel}><td>{p.nivel}</td><td>{p.experiencia}</td>{clase.progresion.some((x) => x.rango) && <td>{p.rango ?? ''}</td>}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {clase.informacion_adicional.length > 0 && (
        <section className="bloque"><h3>Información adicional</h3><Parrafos texto={clase.informacion_adicional} /></section>
      )}

      <section className="bloque">
        <h3>Habilidades</h3>
        <div className="filtros">
          {(['todas', 'activa', 'pasiva'] as const).map((f) => (
            <button key={f} className={filtro === f ? 'activo' : ''} onClick={() => setFiltro(f)}>{f}</button>
          ))}
        </div>
        <ul className="habilidades">
          {habilidades.map((h, i) => (
            <li key={i}>
              <span className="nivel">Nv {h.nivel ?? '—'}</span>
              <strong>{h.nombre}</strong> {h.tipo && <Chip>{h.tipo}</Chip>}
              <p>{h.descripcion}</p>
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}
