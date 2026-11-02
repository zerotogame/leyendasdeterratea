import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { guardarSesion, type Sesion } from '../lib/auth'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const navegar = useNavigate()

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      const r = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const datos = await r.json().catch(() => ({}))
      if (!r.ok) return setError(datos.error ?? 'No se pudo iniciar sesión.')
      guardarSesion(datos as Sesion)
      navegar('/')
    } catch {
      setError('No se pudo conectar con el servidor (¿está encendido el backend en el puerto 3000?).')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div>
      <h1>Iniciar sesión</h1>
      <form className="form-ficha" onSubmit={enviar} style={{ maxWidth: 420 }}>
        <label className="ancho">Email
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="ancho">Contraseña
          <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="aviso mal ancho" role="alert">{error}</p>}
        <button type="submit" className="primario ancho" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
      </form>
      <p className="nota">¿No tienes cuenta? Pídesela al administrador.</p>
    </div>
  )
}
