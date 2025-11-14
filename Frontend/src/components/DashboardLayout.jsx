import React from 'react'
import SidebarAdmin from './SidebarAdmin'
import SidebarMedecin from './SidebarMedecin'
import SidebarPatient from './SidebarPatient'
import { useAuth } from '../contexts/AuthContext'

export default function DashboardLayout({ children }){
  const { user } = useAuth()
  
  const getSidebar = () => {
    switch(user?.role) {
      case 'admin': return <SidebarAdmin />
      case 'medecin': return <SidebarMedecin />
      case 'patient': return <SidebarPatient />
      default: return <SidebarAdmin />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {getSidebar()}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
