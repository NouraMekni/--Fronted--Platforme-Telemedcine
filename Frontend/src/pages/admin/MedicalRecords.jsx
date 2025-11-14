import React from 'react'
import DashboardLayout from '../../components/DashboardLayout'

const sampleRecords = [
  { id: 1, patient: 'Amina Ben Salah', medecin: 'Dr. Ahmed Trabelsi (Médecine générale)', date: '2024-10-20', type: 'Consultation' },
  { id: 2, patient: 'Mohamed Kharrat', medecin: 'Dr. Fatma Zouari (Dermatologie)', date: '2024-10-19', type: 'Suivi' },
  { id: 3, patient: 'Nour Kammoun', medecin: 'Dr. Sami Jebali (Pédiatrie)', date: '2024-10-18', type: 'Diagnostic' },
  { id: 4, patient: 'Sarra Mejri', medecin: 'Dr. Leila Hamdi (Gynécologie)', date: '2024-10-17', type: 'Consultation' },
]

export default function MedicalRecords(){
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Dossiers médicaux</h1>
        <p className="text-sm text-slate-500">Gestion des dossiers et ordonnances</p>
      </div>

      <div className="flex gap-4 mb-4">
        <button className="bg-primary-500 text-white px-4 py-2 rounded">Nouveau dossier</button>
        <select className="border px-3 py-2 rounded">
          <option>Tous les types</option>
          <option>Consultation</option>
          <option>Suivi</option>
          <option>Diagnostic</option>
        </select>
        <input className="border px-3 py-2 rounded flex-1 max-w-md" placeholder="Rechercher un dossier..." />
      </div>
      
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-slate-500 text-sm border-b">
              <tr>
                <th className="py-3">#</th>
                <th className="py-3">Patient</th>
                <th className="py-3">Médecin</th>
                <th className="py-3">Date</th>
                <th className="py-3">Type</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sampleRecords.map(record => (
                <tr key={record.id} className="border-b hover:bg-slate-50">
                  <td className="py-3">{record.id}</td>
                  <td className="py-3">{record.patient}</td>
                  <td className="py-3">{record.medecin}</td>
                  <td className="py-3">{record.date}</td>
                  <td className="py-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{record.type}</span>
                  </td>
                  <td className="py-3">
                    <button className="text-primary-600 text-sm mr-3">Voir</button>
                    <button className="text-slate-600 text-sm">Modifier</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}