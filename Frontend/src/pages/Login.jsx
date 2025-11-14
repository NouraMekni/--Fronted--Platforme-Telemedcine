import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'

export default function Login(){
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('patient')
  const { login } = useAuth()

  function handleSubmit(e){
    e.preventDefault()
    if (!name || !password) {
      alert('Veuillez remplir tous les champs')
      return
    }
    login({ name: name || 'Utilisateur', role })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white p-8 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">Connexion</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm">Nom</label>
              <input 
                className="w-full border rounded px-3 py-2" 
                value={name} 
                onChange={e=>setName(e.target.value)}
                placeholder="Votre nom d'utilisateur"
                required
              />
            </div>
            <div>
              <label className="block text-sm">Mot de passe</label>
              <input 
                type="password"
                className="w-full border rounded px-3 py-2" 
                value={password} 
                onChange={e=>setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                required
              />
            </div>
            <div>
              <label className="block text-sm">Rôle</label>
              <select className="w-full border rounded px-3 py-2" value={role} onChange={e=>setRole(e.target.value)}>
                <option value="patient">Patient</option>
                <option value="medecin">Médecin</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <button className="bg-primary-500 text-white px-4 py-2 rounded">Se connecter</button>
              <a href="#" className="text-sm text-primary-600 hover:underline">Mot de passe oublié ?</a>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
