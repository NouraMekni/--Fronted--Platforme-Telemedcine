import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

 
  useEffect(() => {
    const raw = localStorage.getItem('telemed_auth')
    if (raw) setUser(JSON.parse(raw))
  }, [])

  function login(userData) {
    if (!userData) return


    const role = userData.role?.toLowerCase()

    const normalizedUser = { ...userData, role }
    localStorage.setItem('telemed_auth', JSON.stringify(normalizedUser))
    setUser(normalizedUser)

    if (!role) {
      console.error("Role missing:", userData)
      navigate('/login', { replace: true })
      return
    }

   
    const dashboardRoutes = {
      admin: "/admin/dashboard",
      medecin: "/medecin/dashboard",
      patient: "/patient/dashboard"
    }

    navigate(dashboardRoutes[role] || "/login", { replace: true })
  }

  function logout() {
    localStorage.removeItem('telemed_auth')
    setUser(null)
    navigate('/login', { replace: true })
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
