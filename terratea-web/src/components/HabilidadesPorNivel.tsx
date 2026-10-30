import type { Habilidad } from '../data/types'
import { Chip } from './Comunes'

/** Habilidades de la clase agrupadas por nivel; las de niveles aún no alcanzados salen atenuadas. */
export default function HabilidadesPorNivel({ habilidades, nivel }: { habilidades: Habilidad[]; nivel: number }) {
  const grupos = new Map<number | null, Habilidad[]>()
  for (const h of habilidades) grupos.set(h.nivel, [...(grupos.get(h.nivel) ?? []), h])
  const niveles = [...grupos.keys()].sort((a, b) => (a ?? 999) - (b ?? 999))

  return (
    <div className="hab-niveles">
      {niveles.map((n) => {
        const disponible = n != null && n <= nivel
        return (
          <details key={n ?? 'sin'} className={disponible ? 'hab-nivel' : 'hab-nivel bloqueado'} open={disponible && n === nivel}>
            <summary>
              {n == null ? 'Sin nivel' : `Nivel ${n}`} · {grupos.get(n)!.length}{' '}
              {disponible ? <Chip tono="ok">disponible</Chip> : <Chip tono="no">bloqueada</Chip>}
            </summary>
            <ul className="habilidades">
              {grupos.get(n)!.map((h, i) => (
                <li key={i}><strong>{h.nombre}</strong> {h.tipo && <Chip>{h.tipo}</Chip>}<p>{h.descripcion}</p></li>
              ))}
            </ul>
          </details>
        )
      })}
    </div>
  )
}
