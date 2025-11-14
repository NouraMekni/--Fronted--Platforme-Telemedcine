import React, { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../contexts/AuthContext'

const samplePatients = [
  { id:1, name: 'Amina Ben Salah' },
  { id:2, name: 'Mohamed Kharrat' },
  { id:3, name: 'Nour Kammoun' }
]

const specialites = ['Médecine générale', 'Pédiatrie', 'Gynécologie', 'Dermatologie', 'Nutrition', 'Allergologie', 'Dentiste', 'ORL', 'Ophtalmologie', 'Psychiatrie']

export default function MedecinDashboard(){
  const { user } = useAuth()
  const [specialite, setSpecialite] = useState(specialites[0])

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Bonjour {user?.name || 'Docteur'}</h1>
          <p className="text-sm text-slate-500">Tableau de bord médecin</p>
        </div>
        <div>
          <select value={specialite} onChange={e=>setSpecialite(e.target.value)} className="border px-3 py-2 rounded">
            {specialites.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card">
          <h3 className="font-semibold mb-3">Planning et rendez-vous</h3>
          <p className="text-sm text-slate-600">(Prototype) Liste des prochains rendez-vous...</p>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-3">Patients ({samplePatients.length})</h3>
          <ul className="space-y-2">
            {samplePatients.map(p => (
              <li key={p.id} className="border rounded p-2">{p.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  )
}
