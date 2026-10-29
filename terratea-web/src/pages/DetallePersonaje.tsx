import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Ficha from '../components/Ficha'
import FichaBd from '../components/FichaBd'
import { borrarPersonaje, marcarEnBd, obtenerPersonaje } from '../lib/personajes'
import { clasePorId, razaPorId } from '../lib/datos'
import { cargarDeBd, guardarEnBd, type PersonajeBd } from '../lib/sync'

export default function DetallePersonaje() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [version, setVersion] = useState(0) // fuerza releer el personaje local tras marcarlo en la BD
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const p = useMemo(() => obtenerPersonaje(id ?? ''), [id, version])
  const [bd, setBd] = useState<PersonajeBd | null>(null)
  const [errorBd, setErrorBd] = useState<string>((useLocation().state as { errorBd?: string } | null)?.errorBd ?? '')
  // Si el personaje aún no está en la BD (p. ej. el backend estaba apagado), se sube solo y se reintenta cada 5 s
  useEffect(() => {
    if (!p || p.bdId != null) return
    let vivo = true
    let timer: ReturnType<typeof setTimeout>
    const subir = async () => {
      try {
        const bdId = await guardarEnBd(p)
        if (!vivo) return
        marcarEnBd(p.id, bdId); setErrorBd(''); setVersion((v) => v + 1)
      } catch (err) {
        if (!vivo) return
        setErrorBd((err as Error).message)
        timer = setTimeout(() => void subir(), 5000)
      }
    }
    void subir()
    return () => { vivo = false; clearTimeout(timer) }
  }, [p])
  useEffect(() => {
    if (p?.bdId == null) return
    cargarDeBd(p.bdId).then(setBd).catch(() => setBd(null)) // sin backend se ve la ficha local
  }, [p?.bdId])
  if (!p || !razaPorId(p.razaId) || !clasePorId(p.claseId)) {
    return <p>Personaje no encontrado (si borraste los datos del navegador, se pierden). <Link to="/personajes">Mis personajes</Link></p>
  }
  return (
    <>
      <div className="filtros no-print">
        <Link to="/personajes" className="volver">← Mis personajes</Link>
        <button onClick={() => window.print()}>Imprimir</button>
        {p.bdId != null && <Link to={`/personajes/bd/${p.bdId}/editar`} className="boton">Editar ficha</Link>}
        <button
          className="peligro"
          onClick={() => {
            if (confirm(`¿Eliminar a ${p.nombre}? Solo se borra de este navegador, no de la base de datos.`)) { borrarPersonaje(p.id); navigate('/personajes') }
          }}
        >Eliminar</button>
      </div>
      {p.bdId == null && (
        <p className="aviso mal no-print">
          Guardando en la base de datos… {errorBd} Se reintenta automáticamente; mientras tanto el personaje está guardado en este navegador.
        </p>
      )}
      {bd ? <FichaBd p={bd} /> : <Ficha e={p} />}
    </>
  )
}
