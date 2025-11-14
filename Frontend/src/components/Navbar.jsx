import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar(){
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <nav className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-primary-600 font-bold text-lg">🩺 TeleMed</div>
          <div className="hidden md:flex gap-4 text-sm text-slate-600">
            <Link to="/">Accueil</Link>
            <Link to="/features">Fonctionnalités</Link>
            <Link to="/pricing">Tarifs</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <button className="text-sm text-slate-700" onClick={()=>navigate('/login')}>Connexion</button>
              <button className="bg-primary-500 text-white px-4 py-2 rounded-md text-sm" onClick={()=>navigate('/register')}>Inscription</button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="text-sm">{user.name} • <span className="text-xs text-slate-500">{user.role}</span></div>
              <button className="text-sm text-red-600" onClick={logout}>Déconnexion</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
