import React, { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'

const sampleAppointments = [
  { id: 1, patient: 'Amina Ben Salah', time: '09:00', date: '2024-10-25', type: 'Consultation', status: 'Confirmé' },
  { id: 2, patient: 'Mohamed Kharrat', time: '10:30', date: '2024-10-25', type: 'Suivi', status: 'En attente' },
  { id: 3, patient: 'Nour Kammoun', time: '14:00', date: '2024-10-26', type: 'Urgence', status: 'Nouveau' },
]

export default function Planning(){
  const [selectedDate, setSelectedDate] = useState('2024-10-25')
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Planning & Rendez-vous</h1>
        <p className="text-sm text-slate-500">Gestion de votre planning médical</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">8</div>
          <div className="text-sm text-slate-500">RDV aujourd'hui</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">12</div>
          <div className="text-sm text-slate-500">RDV cette semaine</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">3</div>
          <div className="text-sm text-slate-500">En attente</div>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <input 
          type="date" 
          value={selectedDate} 
          onChange={e => setSelectedDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <button className="bg-primary-500 text-white px-4 py-2 rounded">Bloquer créneau</button>
        <button className="border px-4 py-2 rounded">Vue calendrier</button>
      </div>
      
      <div className="card">
        <h3 className="font-semibold mb-4">Rendez-vous du {selectedDate}</h3>
        <div className="space-y-3">
          {sampleAppointments.map(apt => (
            <div key={apt.id} className="border rounded p-4 flex items-center justify-between hover:bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="text-lg font-medium text-primary-600">{apt.time}</div>
                <div>
                  <div className="font-medium">{apt.patient}</div>
                  <div className="text-sm text-slate-500">{apt.type}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs ${
                  apt.status === 'Confirmé' ? 'bg-green-100 text-green-800' :
                  apt.status === 'En attente' ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {apt.status}
                </span>
                <button className="text-primary-600 text-sm">Consulter</button>
                <button className="text-slate-600 text-sm">Modifier</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}