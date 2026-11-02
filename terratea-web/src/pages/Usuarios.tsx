import { useEffect, useState, type FormEvent } from 'react'
import {
  alternarRol, asignarPersonaje, borrarUsuario, crearUsuario, editarUsuario, guardarRoles, listarPersonajesAdmin, listarRoles, listarUsuarios,
  type PersonajeAdmin, type Rol, type Usuario,
} from '../lib/usuarios'

function CampoClave({ value, onChange, required }: { value: string; onChange: (v: string) => void; required?: boolean }) {
  const [ver, setVer] = useState(false)
  return (
    <span style={{ display: 'flex', gap: 8 }}>
      <input type={ver ? 'text' : 'password'} required={required} minLength={8} maxLength={72} autoComplete="new-password"
        style={{ flex: 1 }} value={value} onChange={(e) => onChange(e.target.value)} />
      <button type="button" aria-pressed={ver} onClick={() => setVer(!ver)}>{ver ? 'Ocultar' : 'Mostrar'}</button>
    </span>
  )
}

export default function Usuarios() {
  const [roles, setRoles] = useState<Rol[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null)
  const [personajes, setPersonajes] = useState<PersonajeAdmin[]>([])
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [guardando, setGuardando] = useState<number | null>(null)
  const [nuevo, setNuevo] = useState({ email: '', password: '' })
  const [editando, setEditando] = useState<{ id: number; email: string; password: string } | null>(null)

  useEffect(() => {
    Promise.all([listarRoles(), listarUsuarios(), listarPersonajesAdmin()])
      .then(([r, u, p]) => { setRoles(r); setUsuarios(u); setPersonajes(p) })
      .catch((e: Error) => { setUsuarios([]); setError(e.message) })
  }, [])

  const cambiar = async (u: Usuario, code: string) => {
    const nuevos = alternarRol(u.roles, code)
    if (nuevos.length === 0) return setError('Cada usuario necesita al menos un rol.')
    setError('')
    setGuardando(u.id)
    try {
      const r = await guardarRoles(u.id, nuevos)
      setUsuarios((l) => l?.map((x) => (x.id === u.id ? { ...x, roles: r.roles } : x)) ?? null)
      setRoles((rs) => rs.map((ro) => {
        const antes = u.roles.includes(ro.code), ahora = r.roles.includes(ro.code)
        return antes === ahora ? ro : { ...ro, users: ro.users + (ahora ? 1 : -1) }
      }))
    } catch (e) { setError((e as Error).message) } finally { setGuardando(null) }
  }

  const alta = async (e: FormEvent) => {
    e.preventDefault()
    setError(''); setAviso('')
    try {
      const u = await crearUsuario({ ...nuevo, roles: ['PLAYER'] })
      setUsuarios((l) => [...(l ?? []), u])
      setRoles((rs) => rs.map((r) => (r.code === 'PLAYER' ? { ...r, users: r.users + 1 } : r)))
      setNuevo({ email: '', password: '' })
      setAviso(`Usuario ${u.email} creado como Jugador. Marca más roles en la tabla si hace falta.`)
    } catch (err) { setError((err as Error).message) }
  }

  const guardarEdicion = async (e: FormEvent) => {
    e.preventDefault()
    if (!editando) return
    setError(''); setAviso('')
    try {
      const r = await editarUsuario(editando.id, { email: editando.email, ...(editando.password ? { password: editando.password } : {}) })
      setUsuarios((l) => l?.map((x) => (x.id === r.id ? { ...x, email: r.email } : x)) ?? null)
      setPersonajes((l) => l.map((p) => (p.user_id === r.id ? { ...p, owner_email: r.email } : p)))
      setEditando(null)
      setAviso('Usuario actualizado.')
    } catch (err) { setError((err as Error).message) }
  }

  const borrar = async (u: Usuario) => {
    if (!window.confirm(`¿Borrar a ${u.email}? No se puede deshacer.`)) return
    setError(''); setAviso('')
    try {
      await borrarUsuario(u.id)
      setUsuarios((l) => l?.filter((x) => x.id !== u.id) ?? null)
      setRoles((rs) => rs.map((r) => (u.roles.includes(r.code) ? { ...r, users: r.users - 1 } : r)))
      setAviso(`Usuario ${u.email} borrado.`)
    } catch (err) { setError((err as Error).message) }
  }

  const asignar = async (p: PersonajeAdmin, userId: number) => {
    setError(''); setAviso('')
    try {
      await asignarPersonaje(p.id, userId)
      const [ps, us] = await Promise.all([listarPersonajesAdmin(), listarUsuarios()])
      setPersonajes(ps); setUsuarios(us)
    } catch (err) { setError((err as Error).message) }
  }

  return (
    <>
      <h1>Usuarios y roles</h1>
      <p className="nota">Un usuario puede tener varios roles y un rol puede tener varios usuarios. Aquí das de alta a los usuarios (no hay registro público).</p>
      {error && <p className="nota" role="alert">{error}</p>}
      {aviso && <p className="nota">{aviso}</p>}
      <div className="tarjetas">
        {roles.map((r) => (
          <div key={r.code} className="tarjeta">
            <h2>{r.name}</h2>
            <small>{r.description}</small>
            <small>{r.users} usuario{r.users === 1 ? '' : 's'}</small>
          </div>
        ))}
      </div>

      <h2>Nuevo usuario</h2>
      <form className="form-ficha" onSubmit={alta} style={{ maxWidth: 520 }}>
        <label className="ancho">Email
          <input type="email" required autoComplete="off" value={nuevo.email} onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })} />
        </label>
        <label className="ancho">Contraseña inicial (8-72 caracteres)
          <CampoClave required value={nuevo.password} onChange={(password) => setNuevo({ ...nuevo, password })} />
        </label>
        <button type="submit" className="primario ancho">Dar de alta</button>
      </form>

      {editando && (
        <form className="form-ficha" onSubmit={guardarEdicion} style={{ maxWidth: 520 }}>
          <h2 className="ancho">Editar usuario #{editando.id}</h2>
          <label className="ancho">Email
            <input type="email" required value={editando.email} onChange={(e) => setEditando({ ...editando, email: e.target.value })} />
          </label>
          <label className="ancho">Nueva contraseña (vacío = no cambiarla)
            <CampoClave value={editando.password} onChange={(password) => setEditando({ ...editando, password })} />
          </label>
          <button type="submit" className="primario">Guardar</button>
          <button type="button" onClick={() => setEditando(null)}>Cancelar</button>
        </form>
      )}

      <h2>Usuarios</h2>
      {usuarios == null ? <p>Cargando usuarios…</p> : usuarios.length === 0 ? <p>No hay usuarios.</p> : (
        <table>
          <thead>
            <tr><th>Usuario</th><th></th>{roles.map((r) => <th key={r.code}>{r.name}</th>)}</tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.email} <small>#{u.id} · {u.characters ?? 0} personaje{u.characters === 1 ? '' : 's'}</small></td>
                <td><button type="button" onClick={() => setEditando({ id: u.id, email: u.email, password: '' })}>Editar</button> <button type="button" onClick={() => borrar(u)}>Borrar</button></td>
                {roles.map((r) => (
                  <td key={r.code}>
                    <input
                      type="checkbox"
                      aria-label={`${r.name} para ${u.email}`}
                      checked={u.roles.includes(r.code)}
                      disabled={guardando === u.id}
                      onChange={() => cambiar(u, r.code)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Personajes y dueños</h2>
      {personajes.length === 0 ? <p>No hay personajes.</p> : (
        <table>
          <thead><tr><th>Personaje</th><th>Dueño</th></tr></thead>
          <tbody>
            {personajes.map((p) => (
              <tr key={p.id}>
                <td>{p.name} <small>#{p.id} · nivel {p.level}</small></td>
                <td>
                  <select
                    aria-label={`Dueño de ${p.name}`}
                    value={p.user_id ?? ''}
                    onChange={(e) => e.target.value && asignar(p, Number(e.target.value))}
                  >
                    {p.user_id == null && <option value="">Sin dueño</option>}
                    {(usuarios ?? []).map((u) => <option key={u.id} value={u.id}>{u.email}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
