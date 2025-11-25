import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'

const API_URL = 'http://localhost:8083/api/users'

export default function Register(){
  const [name, setName] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('PATIENT')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  async function handleSubmit(e){
    e.preventDefault()
    setError('')
    
    if (!name || !prenom || !email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs')
      return
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (!role) {
      setError('Veuillez sélectionner un rôle')
      return
    }

    setIsLoading(true)

    try {
      const userData = {
        name: name,
        prenom: prenom,
        email: email,
        password: password,
        role: role
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        let errorMessage = 'Erreur lors de l\'inscription'
        try {
          const errorText = await response.text()
          if (errorText) {
            // Try to parse as JSON first
            try {
              const errorJson = JSON.parse(errorText)
              errorMessage = errorJson.message || errorJson.error || errorText
            } catch {
              // If not JSON, use the text directly
              errorMessage = errorText
            }
          }
        } catch (e) {
          console.error('Error reading response:', e)
        }
        throw new Error(errorMessage)
      }

      const savedUser = await response.json()
      
      // Login after successful registration
      login({ 
        name: savedUser.name || name, 
        role: savedUser.role?.toLowerCase() || role.toLowerCase(),
        id: savedUser.id
      })
      
      // Navigate will be handled by login function
    } catch (err) {
      console.error('Registration error:', err)
      setError(err.message || 'Une erreur est survenue lors de l\'inscription')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-center">Inscription</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom</label>
              <input 
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={name} 
                onChange={e=>setName(e.target.value)}
                placeholder="Votre nom"
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Prénom</label>
              <input 
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={prenom} 
                onChange={e=>setPrenom(e.target.value)}
                placeholder="Votre prénom"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input 
                type="email"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={email}
                onChange={e=>setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rôle</label>
              <select 
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={role}
                onChange={e=>setRole(e.target.value)}
                required
                disabled={isLoading}
              >
                <option value="PATIENT">Patient</option>
                <option value="MEDECIN">Médecin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mot de passe</label>
              <input 
                type="password" 
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                placeholder="Choisir un mot de passe"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirmer le mot de passe</label>
              <input 
                type="password" 
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={confirmPassword}
                onChange={e=>setConfirmPassword(e.target.value)}
                placeholder="Confirmer le mot de passe"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <button 
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded w-full font-medium transition-colors"
              >
                {isLoading ? 'Inscription en cours...' : 'Créer un compte'}
              </button>
            </div>

            <div className="text-center text-sm text-gray-600 mt-4">
              Déjà un compte?{' '}
              <a href="/login" className="text-blue-600 hover:underline">
                Se connecter
              </a>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
