import { lazy, Suspense, type ReactNode } from 'react'
import type { DatosHoja } from '../lib/hoja'

const FichaOficial = lazy(() => import('./FichaOficial'))

/** Ficha digital y, al final, la ficha oficial rellena (si existe para esa raza + clase); al imprimir solo sale la oficial. */
export default function FichaConOficial({ datos, children }: { datos: DatosHoja; children: ReactNode }) {
  return (
    <>
      <div className="ficha-digital">{children}</div>
      <Suspense fallback={null}><FichaOficial datos={datos} /></Suspense>
    </>
  )
}
