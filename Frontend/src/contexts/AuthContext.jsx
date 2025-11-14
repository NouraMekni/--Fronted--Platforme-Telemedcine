import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(()=>{
    const raw = localStorage.getItem('telemed_auth')
    if(raw) setUser(JSON.parse(raw))
  },[])

  function login({ name, role }){
    const u = { name, role }
    localStorage.setItem('telemed_auth', JSON.stringify(u))
    setUser(u)
    // redirect
    navigate(`/${role}/dashboard`, { replace: true })
  }

  function logout(){
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

export function useAuth(){
  return useContext(AuthContext)
}
