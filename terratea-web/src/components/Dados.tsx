import { useEffect, useState } from 'react'

const DURACION = 700 // ms que "rueda" cada dado antes de mostrar su valor

/** Dado que cambia de cara al azar hasta `retraso + DURACION` ms y se queda en `valor`. */
export function Dado({ caras, valor, retraso = 0, descartado = false }: {
  caras: number; valor: number; retraso?: number; descartado?: boolean
}) {
  const [mostrado, setMostrado] = useState<number | null>(null)
  const [rodando, setRodando] = useState(true)

  useEffect(() => {
    const t0 = Date.now()
    const id = setInterval(() => {
      if (Date.now() - t0 >= retraso + DURACION) {
        setMostrado(valor)
        setRodando(false)
        clearInterval(id)
      } else if (Date.now() - t0 >= retraso) {
        setMostrado(1 + Math.floor(Math.random() * caras))
      }
    }, 60)
    return () => clearInterval(id)
  }, [caras, valor, retraso])

  return (
    <span className={`dado ${rodando ? 'rodando' : ''} ${!rodando && descartado ? 'descartado' : ''}`} title={`D${caras}`}>
      {mostrado ?? '·'}
    </span>
  )
}

/** Tiempo total (ms) que tarda en resolverse un dado con ese retraso. */
export const duracionDado = (retraso: number) => retraso + DURACION

/** Marca `true` cuando pasan `ms` milisegundos. */
export function useTerminado(ms: number) {
  const [fin, setFin] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setFin(true), ms)
    return () => clearTimeout(id)
  }, [ms])
  return fin
}

/** Una tirada de 4D6: cuatro dados, el más bajo tachado, y el total al terminar. */
export function FilaTirada({ n, dados, retraso }: { n: number; dados: number[]; retraso: number }) {
  const menor = dados.indexOf(Math.min(...dados))
  const listo = useTerminado(duracionDado(retraso + 3 * 80))
  const total = dados.reduce((s, d) => s + d, 0) - dados[menor]
  return (
    <div className="fila-tirada">
      <span className="etq">Tirada {n}</span>
      {dados.map((d, i) => <Dado key={i} caras={6} valor={d} retraso={retraso + i * 80} descartado={i === menor} />)}
      <span className="total">{listo ? `= ${total}` : ''}</span>
    </div>
  )
}
