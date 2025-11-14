import React, { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'

const samplePatients = [
  { 
    id: 1, 
    name: 'Amina Ben Salah', 
    age: 45, 
    lastVisit: '2024-10-20', 
    condition: 'Hypertension',
    phone: '20.12.34.56.78',
    email: 'amina.bensalah@example.com'
  },
  { 
    id: 2, 
    name: 'Mohamed Kharrat', 
    age: 32, 
    lastVisit: '2024-10-15', 
    condition: 'Diabète Type 2',
    phone: '23.45.67.89.01',
    email: 'mohamed.kharrat@example.com'
  },
  { 
    id: 3, 
    name: 'Nour Kammoun', 
    age: 28, 
    lastVisit: '2024-10-18', 
    condition: 'Suivi grossesse',
    phone: '25.34.56.78.90',
    email: 'nour.kammoun@example.com'
  },
]

export default function Patients(){
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  
  const filteredPatients = samplePatients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Mes Patients</h1>
        <p className="text-sm text-slate-500">Liste et dossiers de vos patients</p>
      </div>

      <div className="flex gap-4 mb-4">
        <input 
          className="border px-3 py-2 rounded flex-1 max-w-md" 
          placeholder="Rechercher un patient..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button className="bg-primary-500 text-white px-4 py-2 rounded">Nouveau patient</button>
        <select className="border px-3 py-2 rounded">
          <option>Tous les patients</option>
          <option>Vus récemment</option>
          <option>À revoir</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Liste des patients ({filteredPatients.length})</h3>
          <div className="space-y-2">
            {filteredPatients.map(patient => (
              <div 
                key={patient.id} 
                className={`border rounded p-3 cursor-pointer transition-colors ${
                  selectedPatient?.id === patient.id ? 'bg-primary-50 border-primary-200' : 'hover:bg-slate-50'
                }`}
                onClick={() => setSelectedPatient(patient)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{patient.name}</div>
                    <div className="text-sm text-slate-500">{patient.age} ans • {patient.condition}</div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {patient.lastVisit}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          {selectedPatient ? (
            <>
              <h3 className="font-semibold mb-4">Dossier de {selectedPatient.name}</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-500">Âge</label>
                    <div className="font-medium">{selectedPatient.age} ans</div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">Dernière visite</label>
                    <div className="font-medium">{selectedPatient.lastVisit}</div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-slate-500">Condition principale</label>
                  <div className="font-medium">{selectedPatient.condition}</div>
                </div>
                
                <div>
                  <label className="text-sm text-slate-500">Contact</label>
                  <div className="text-sm">
                    <div>{selectedPatient.phone}</div>
                    <div>{selectedPatient.email}</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex gap-2">
                    <button className="bg-primary-500 text-white px-3 py-2 rounded text-sm">Nouvelle consultation</button>
                    <button className="border px-3 py-2 rounded text-sm">Voir historique</button>
                    <button className="border px-3 py-2 rounded text-sm">Prescrire</button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-slate-500 py-8">
              Sélectionnez un patient pour voir son dossier
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}