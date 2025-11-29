import React, { useState } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../contexts/AuthContext'

const API_URL = 'http://localhost:8083/api/users'

export default function Register() {
  // Common user fields
  const [name, setName] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('PATIENT')
  
  // Patient-specific fields
  const [dateNaissance, setDateNaissance] = useState('')
  const [adresse, setAdresse] = useState('')
  const [antecedentsMedicaux, setAntecedentsMedicaux] = useState('')

  // Medecin-specific fields
  const [specialte, setSpecialte] = useState('')
  const [disponibilite, setDisponibilite] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!name || !prenom || !email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs obligatoires')
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
    if (role === 'PATIENT' && (!dateNaissance || !adresse)) {
      setError('Veuillez remplir tous les champs spécifiques au patient')
      return
    }
    if (role === 'MEDECIN' && (!specialte || !disponibilite)) {
      setError('Veuillez remplir tous les champs spécifiques au médecin')
      return
    }

    setIsLoading(true)

    try {
      const userData = {
        name,
        prenom,
        email,
        password,
        role,
        ...(role === 'PATIENT' && {
          dateNaissance,
          adresse,
          antecedentsMedicaux
        }),
        ...(role === 'MEDECIN' && {
          specialte,
          disponibilite
        })
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Erreur lors de l\'inscription')
      }

      const savedUser = await response.json()

      // Automatically log in after successful registration
      login({
        name: savedUser.name || name,
        role: savedUser.role?.toLowerCase() || role.toLowerCase(),
        id: savedUser.id
      })

    } catch (err) {
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

          {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Nom</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Votre nom"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={isLoading} required />
            </div>

            {/* Prenom */}
            <div>
              <label className="block text-sm font-medium mb-1">Prénom</label>
              <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Votre prénom"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={isLoading} required />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={isLoading} required />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium mb-1">Rôle</label>
              <select value={role} onChange={e => setRole(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={isLoading} required>
                <option value="PATIENT">Patient</option>
                <option value="MEDECIN">Médecin</option>
              </select>
            </div>

            {/* Patient-specific */}
            {role === 'PATIENT' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Date de naissance</label>
                  <input type="date" value={dateNaissance} onChange={e => setDateNaissance(e.target.value)}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={isLoading} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Adresse</label>
                  <input type="text" value={adresse} onChange={e => setAdresse(e.target.value)} placeholder="Votre adresse"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={isLoading} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Antécédents médicaux</label>
                  <textarea value={antecedentsMedicaux} onChange={e => setAntecedentsMedicaux(e.target.value)}
                    placeholder="Vos antécédents médicaux"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={isLoading} />
                </div>
              </>
            )}

            {/* Medecin-specific */}
            {role === 'MEDECIN' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Spécialité</label>
                  <input value={specialte} onChange={e => setSpecialte(e.target.value)} placeholder="Votre spécialité"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={isLoading} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Disponibilité</label>
                  <input value={disponibilite} onChange={e => setDisponibilite(e.target.value)} placeholder="Votre disponibilité"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={isLoading} required />
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1">Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Choisir un mot de passe"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={isLoading} required />
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium mb-1">Confirmer le mot de passe</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirmer le mot de passe"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={isLoading} required />
            </div>

            <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded w-full font-medium transition-colors">
              {isLoading ? 'Inscription en cours...' : 'Créer un compte'}
            </button>

            <div className="text-center text-sm text-gray-600 mt-4">
              Déjà un compte? <a href="/login" className="text-blue-600 hover:underline">Se connecter</a>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
