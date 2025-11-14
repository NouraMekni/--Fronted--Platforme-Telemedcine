import React, { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../contexts/AuthContext'

const specialites = ['Médecine générale', 'Pédiatrie', 'Gynécologie', 'Dermatologie', 'Nutrition', 'Allergologie', 'Dentiste', 'ORL', 'Ophtalmologie', 'Psychiatrie']

const medecins = [
  { id:1, name: 'Dr. Ahmed Trabelsi', specialite: 'Médecine générale' },
  { id:2, name: 'Dr. Fatma Zouari', specialite: 'Dermatologie' },
  { id:3, name: 'Dr. Sami Jebali', specialite: 'Pédiatrie' },
  { id:4, name: 'Dr. Leila Hamdi', specialite: 'Gynécologie' },
  { id:5, name: 'Dr. Karim Oueslati', specialite: 'Nutrition' },
  { id:6, name: 'Dr. Nesrine Ghanmi', specialite: 'Allergologie' },
  { id:7, name: 'Dr. Hichem Ghorbel', specialite: 'Dentiste' },
  { id:8, name: 'Dr. Rania Belhadj', specialite: 'ORL' },
  { id:9, name: 'Dr. Tarek Chahed', specialite: 'Ophtalmologie' },
  { id:10, name: 'Dr. Mariem Dridi', specialite: 'Psychiatrie' },
  { id:11, name: 'Dr. Youssef Ben Amor', specialite: 'Médecine générale' },
  { id:12, name: 'Dr. Asma Khelifi', specialite: 'Dermatologie' },
  { id:13, name: 'Dr. Nabil Sassi', specialite: 'Pédiatrie' },
  { id:14, name: 'Dr. Rim Cherif', specialite: 'Gynécologie' },
  { id:15, name: 'Dr. Walid Gharbi', specialite: 'Nutrition' },
  { id:16, name: 'Dr. Ines Mkaddem', specialite: 'Allergologie' },
  { id:17, name: 'Dr. Mehdi Jouini', specialite: 'Dentiste' },
  { id:18, name: 'Dr. Salma Ferjani', specialite: 'ORL' },
  { id:19, name: 'Dr. Bassem Abidi', specialite: 'Ophtalmologie' },
  { id:20, name: 'Dr. Monia Daoud', specialite: 'Psychiatrie' },
]

export default function PatientDashboard(){
  const { user } = useAuth()
  const [specialite, setSpecialite] = useState(specialites[0])
  const [selectedDoc, setSelectedDoc] = useState(null)

  const available = medecins.filter(m => m.specialite === specialite)

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Bonjour {user?.name || 'Patient'}</h1>
        <p className="text-sm text-slate-500">Votre espace personnel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card">
          <h3 className="font-semibold mb-4">Prendre un rendez-vous</h3>
          <label className="block text-sm mb-2">Choisir une spécialité</label>
          <select className="w-full border rounded px-3 py-2 mb-4" value={specialite} onChange={e=>setSpecialite(e.target.value)}>
            {specialites.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <h4 className="font-medium mb-2">Médecins disponibles</h4>
          <ul className="space-y-2">
            {available.map(d => (
              <li key={d.id} className="flex items-center justify-between border rounded p-3">
                <div>
                  <div className="font-medium">{d.name}</div>
                  <div className="text-sm text-slate-500">{d.specialite}</div>
                </div>
                <div>
                  <button className="bg-primary-500 text-white px-3 py-1 rounded" onClick={()=>setSelectedDoc(d)}>Choisir</button>
                </div>
              </li>
            ))}
          </ul>

          {selectedDoc && (
            <div className="mt-4 p-3 border rounded bg-slate-50">
              Rendez-vous proposé avec <strong>{selectedDoc.name}</strong> ({selectedDoc.specialite}).
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">Dossier médical</h3>
          <p className="text-sm text-slate-600">Accès rapide à vos ordonnances et constantes.</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
