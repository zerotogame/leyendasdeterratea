import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useConfirmar } from '../components/Confirmar'
import {
  borrarTorneo, campeon, FORMATOS, guardarTorneo, listarTorneos, torneoNuevo, type Formato,
} from '../lib/torneos'

export default function ListaTorneos() {
  const [lista, setLista] = useState(listarTorneos)
  const [nombre, setNombre] = useState('')
  const [formato, setFormato] = useState<Formato>('1v1')
  const confirmar = useConfirmar()
  const ir = useNavigate()

  const crear = () => {
    const t = torneoNuevo(nombre.trim() || FORMATOS[formato].nombre, formato)
    guardarTorneo(t)
    ir(`/torneos/${t.id}`)
  }

  const crearLosTres = () => {
    for (const f of Object.keys(FORMATOS) as Formato[]) guardarTorneo(torneoNuevo(FORMATOS[f].nombre, f))
    setLista(listarTorneos())
  }

  const eliminar = async (id: string, n: string) => {
    if (!(await confirmar(`¿Eliminar el torneo «${n}»? No se puede deshacer.`, { aceptar: 'Eliminar', peligro: true }))) return
    borrarTorneo(id)
    setLista(listarTorneos())
  }

  return (
    <>
      <h1>Torneos</h1>
      <p className="nota">Torneos entre gremios de jugadores. Se guardan en este navegador.</p>
      {lista.length === 0 && (
        <p><button className="primario" onClick={crearLosTres}>Crear los 3 torneos (1 vs 1, 3 vs 3 y Estrategia)</button></p>
      )}
      <div className="tarjetas">
        {lista.map((t) => {
          const ganador = t.equipos.find((e) => e.id === campeon(t))
          return (
            <div key={t.id} className="tarjeta">
              <Link to={`/torneos/${t.id}`} className="enlace-tarjeta">
                <h2>{t.nombre}</h2>
                <small>{FORMATOS[t.formato].titulo} · {t.equipos.length} gremio{t.equipos.length === 1 ? '' : 's'}</small>
                <small>{ganador ? `🏆 ${ganador.nombre}` : t.nodos.length ? 'En juego' : 'Sin cuadro'}</small>
              </Link>
              <button className="peligro" onClick={() => eliminar(t.id, t.nombre)}>Eliminar</button>
            </div>
          )
        })}
      </div>

      <div className="bloque">
        <h3>Nuevo torneo</h3>
        <div className="filtros">
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder={FORMATOS[formato].nombre} aria-label="Nombre del torneo" />
          <select value={formato} onChange={(e) => setFormato(e.target.value as Formato)} aria-label="Formato">
            {(Object.keys(FORMATOS) as Formato[]).map((f) => <option key={f} value={f}>{FORMATOS[f].titulo}</option>)}
          </select>
          <button className="primario" onClick={crear}>Crear torneo</button>
        </div>
      </div>
    </>
  )
}
