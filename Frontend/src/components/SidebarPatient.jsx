import React from 'react'
import { Link } from 'react-router-dom'

export default function SidebarPatient(){
  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4 hidden md:block">
      <div className="text-xl font-semibold text-primary-600 mb-6">Patient</div>
      <nav className="flex flex-col gap-2 text-sm">
        <Link className="px-3 py-2 rounded hover:bg-slate-50" to="/patient/dashboard">Tableau de bord</Link>
        <Link className="px-3 py-2 rounded hover:bg-slate-50" to="/patient/appointments">Rendez-vous</Link>
        <Link className="px-3 py-2 rounded hover:bg-slate-50" to="/patient/payments">Paiements</Link>
        <Link className="px-3 py-2 rounded hover:bg-slate-50" to="/patient/medical-folder">Mon dossier</Link>
        <Link className="px-3 py-2 rounded hover:bg-slate-50" to="/patient/prescriptions">Ordonnances</Link>
        <Link className="px-3 py-2 rounded hover:bg-slate-50" to="/patient/health-tracking">Suivi santé</Link>
      </nav>
    </aside>
  )
}