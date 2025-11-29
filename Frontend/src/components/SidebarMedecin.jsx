import React from 'react'
import { Link } from 'react-router-dom'

export default function SidebarMedecin(){
  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4 hidden md:block">
      <div className="text-xl font-semibold text-primary-600 mb-6">Médecin</div>
      <nav className="flex flex-col gap-2 text-sm">
        <Link className="px-3 py-2 rounded hover:bg-slate-50" to="/medecin/dashboard">Tableau de bord</Link>
        <Link className="px-3 py-2 rounded hover:bg-slate-50" to="/medecin/ChatPanelMed">Messagerie</Link>
        <Link className="px-3 py-2 rounded hover:bg-slate-50" to="/medecin/planning">Planning</Link>
        <Link className="px-3 py-2 rounded hover:bg-slate-50" to="/medecin/CalendarView">Calandar View</Link>
        <Link className="px-3 py-2 rounded hover:bg-slate-50" to="/medecin/patients">Mes patients</Link>
        <Link className="px-3 py-2 rounded hover:bg-slate-50" to="/medecin/consultations">Consultations</Link>
        <Link className="px-3 py-2 rounded hover:bg-slate-50" to="/medecin/prescriptions">Prescriptions</Link>
        
      </nav>
    </aside>
  )
}