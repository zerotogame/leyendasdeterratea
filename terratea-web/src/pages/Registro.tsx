import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export default function Registro() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repetir, setRepetir] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const navegar = useNavigate()

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.')
    if (password !== repetir) return setError('Las contraseñas no coinciden.')
    setEnviando(true)
    try {
      const r = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const datos = await r.json().catch(() => ({}))
      if (!r.ok) {
        setError(r.status === 409 ? 'Ese email ya está registrado.' : datos.error ?? 'No se pudo completar el registro.')
        return
      }
      try { localStorage.setItem('terratea-sesion', JSON.stringify(datos)) } catch { /* sin almacenamiento */ }
      navegar('/personajes')
    } catch {
      setError('No se pudo conectar con el servidor (¿está encendido el backend en el puerto 3000?).')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div>
      <h1>Registro de jugadores</h1>
      <form className="form-ficha" onSubmit={enviar} style={{ maxWidth: 420 }}>
        <label className="ancho">Email
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="ancho">Contraseña
          <input type="password" required minLength={8} maxLength={72} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label className="ancho">Repetir contraseña
          <input type="password" required autoComplete="new-password" value={repetir} onChange={(e) => setRepetir(e.target.value)} />
        </label>
        {error && <p className="aviso mal ancho">{error}</p>}
        <button type="submit" className="primario ancho" disabled={enviando}>{enviando ? 'Registrando…' : 'Registrarme'}</button>
      </form>
    </div>
  )
}
