import { MAX_ESTRELLAS } from '../lib/gremios'

/** Nivel en estrellas: las ganadas en oro y las que faltan en gris claro, para distinguirlas de un vistazo. */
export default function Estrellas({ n, max = MAX_ESTRELLAS }: { n: number; max?: number }) {
  return (
    <span className="estrellas" role="img" aria-label={`Nivel ${n} de ${max}`}>
      <span className="on">{'★'.repeat(n)}</span>
      <span className="off">{'★'.repeat(Math.max(0, max - n))}</span>
    </span>
  )
}
