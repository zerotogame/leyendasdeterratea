import { reglas, img2 } from '../lib/bestiario'
import type { TipoCriatura } from '../data/libro2.types'

export function IconosTipo({ tipos, tam = 28 }: { tipos: TipoCriatura[]; tam?: number }) {
  return (
    <span className="iconos-tipo">
      {tipos.map((t) => {
        const info = reglas.tipos.find((x) => x.id === t)
        return <img key={t} src={img2(info?.icono ?? `img/tipos/${t}.webp`)} alt={info?.nombre ?? t} title={info?.nombre ?? t} width={tam} height={tam} />
      })}
    </span>
  )
}
