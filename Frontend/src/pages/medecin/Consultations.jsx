import React, { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'

const sampleConsultations = [
  { 
    id: 1, 
    patient: 'Amina Ben Salah', 
    date: '2024-10-25', 
    time: '09:00',
    type: 'Consultation',
    status: 'À venir',
    notes: ''
  },
  { 
    id: 2, 
    patient: 'Mohamed Kharrat', 
    date: '2024-10-24', 
    time: '14:30',
    type: 'Suivi',
    status: 'Terminé',
    notes: 'Tension artérielle stable. Poursuivre traitement.'
  },
  { 
    id: 3, 
    patient: 'Nour Kammoun', 
    date: '2024-10-23', 
    time: '11:00',
    type: 'Urgence',
    status: 'Terminé',
    notes: 'Douleurs abdominales. Examens complémentaires prescrits.'
  },
]

export default function Consultations(){
  const [selectedConsultation, setSelectedConsultation] = useState(null)
  const [activeTab, setActiveTab] = useState('upcoming')

  const upcomingConsultations = sampleConsultations.filter(c => c.status === 'À venir')
  const pastConsultations = sampleConsultations.filter(c => c.status === 'Terminé')

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Consultations</h1>
        <p className="text-sm text-slate-500">Gestion de vos consultations médicales</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button 
          className={`px-4 py-2 rounded ${activeTab === 'upcoming' ? 'bg-primary-500 text-white' : 'border'}`}
          onClick={() => setActiveTab('upcoming')}
        >
          À venir ({upcomingConsultations.length})
        </button>
        <button 
          className={`px-4 py-2 rounded ${activeTab === 'past' ? 'bg-primary-500 text-white' : 'border'}`}
          onClick={() => setActiveTab('past')}
        >
          Historique ({pastConsultations.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">
            {activeTab === 'upcoming' ? 'Consultations à venir' : 'Consultations passées'}
          </h3>
          <div className="space-y-2">
            {(activeTab === 'upcoming' ? upcomingConsultations : pastConsultations).map(consultation => (
              <div 
                key={consultation.id} 
                className={`border rounded p-3 cursor-pointer transition-colors ${
                  selectedConsultation?.id === consultation.id ? 'bg-primary-50 border-primary-200' : 'hover:bg-slate-50'
                }`}
                onClick={() => setSelectedConsultation(consultation)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{consultation.patient}</div>
                    <div className="text-sm text-slate-500">
                      {consultation.type} • {consultation.time}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{consultation.date}</div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      consultation.status === 'À venir' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {consultation.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          {selectedConsultation ? (
            <>
              <h3 className="font-semibold mb-4">
                Consultation - {selectedConsultation.patient}
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-500">Date</label>
                    <div className="font-medium">{selectedConsultation.date}</div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">Heure</label>
                    <div className="font-medium">{selectedConsultation.time}</div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-slate-500">Type</label>
                  <div className="font-medium">{selectedConsultation.type}</div>
                </div>
                
                <div>
                  <label className="text-sm text-slate-500">Statut</label>
                  <div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      selectedConsultation.status === 'À venir' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedConsultation.status}
                    </span>
                  </div>
                </div>

                {selectedConsultation.status === 'Terminé' && (
                  <div>
                    <label className="text-sm text-slate-500">Notes de consultation</label>
                    <div className="bg-slate-50 p-3 rounded text-sm">
                      {selectedConsultation.notes || 'Aucune note disponible'}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex gap-2">
                    {selectedConsultation.status === 'À venir' ? (
                      <>
                        <button className="bg-primary-500 text-white px-3 py-2 rounded text-sm">Démarrer consultation</button>
                        <button className="border px-3 py-2 rounded text-sm">Reporter</button>
                        <button className="border px-3 py-2 rounded text-sm text-red-600">Annuler</button>
                      </>
                    ) : (
                      <>
                        <button className="bg-primary-500 text-white px-3 py-2 rounded text-sm">Voir dossier complet</button>
                        <button className="border px-3 py-2 rounded text-sm">Modifier notes</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-slate-500 py-8">
              Sélectionnez une consultation pour voir les détails
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}