import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

// Sustituto de window.confirm: `if (!(await confirmar('¿Borrar?'))) return`
type Opciones = { aceptar?: string; cancelar?: string; peligro?: boolean }
type Pedir = (mensaje: string, opciones?: Opciones) => Promise<boolean>
type Pendiente = { mensaje: string; opciones: Opciones; resolver: (ok: boolean) => void }

const Contexto = createContext<Pedir | null>(null)

export function useConfirmar(): Pedir {
  const pedir = useContext(Contexto)
  if (!pedir) throw new Error('useConfirmar necesita <ConfirmarProvider>')
  return pedir
}

export function ConfirmarProvider({ children }: { children: ReactNode }) {
  const [pendiente, setPendiente] = useState<Pendiente | null>(null)
  const pedir = useCallback<Pedir>((mensaje, opciones = {}) =>
    new Promise((resolver) => setPendiente({ mensaje, opciones, resolver })), [])
  const cerrar = (ok: boolean) => { pendiente?.resolver(ok); setPendiente(null) }
  return (
    <Contexto.Provider value={pedir}>
      {children}
      {pendiente && <Dialogo p={pendiente} cerrar={cerrar} />}
    </Contexto.Provider>
  )
}

function Dialogo({ p, cerrar }: { p: Pendiente; cerrar: (ok: boolean) => void }) {
  const aceptar = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    // El foco vuelve al botón que abrió el diálogo al cerrarlo
    const previo = document.activeElement as HTMLElement | null
    aceptar.current?.focus()
    return () => previo?.focus()
  }, [])
  useEffect(() => {
    const k = (ev: KeyboardEvent) => { if (ev.key === 'Escape') cerrar(false) }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [cerrar])
  const { aceptar: si = 'Aceptar', cancelar: no = 'Cancelar', peligro } = p.opciones
  return (
    <div className="popup-fondo" onClick={() => cerrar(false)}>
      <div className="popup bloque confirmar" role="alertdialog" aria-modal="true" aria-labelledby="confirmar-texto"
        onClick={(ev) => ev.stopPropagation()}>
        <p id="confirmar-texto">{p.mensaje}</p>
        <div className="filtros">
          <button onClick={() => cerrar(false)}>{no}</button>
          <button ref={aceptar} className={peligro ? 'peligro' : 'primario'} onClick={() => cerrar(true)}>{si}</button>
        </div>
      </div>
    </div>
  )
}
