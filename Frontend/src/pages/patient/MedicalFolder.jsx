import React, { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'

const medicalHistory = [
  { 
    id: 1, 
    date: '2024-10-20', 
    medecin: 'Dr. Ahmed Trabelsi', 
    specialite: 'Médecine générale',
    diagnostic: 'Contrôle de routine',
    notes: 'État général satisfaisant. Poursuivre hygiène de vie.',
    documents: ['Ordonnance', 'Certificat médical']
  },
  { 
    id: 2, 
    date: '2024-09-15', 
    medecin: 'Dr. Fatma Zouari', 
    specialite: 'Dermatologie',
    diagnostic: 'Consultation dermatologique',
    notes: 'Grain de beauté surveillé. RDV de contrôle dans 6 mois.',
    documents: ['Photos médicales']
  },
]

const personalInfo = {
  name: 'Amina Ben Salah',
  dateNaissance: '15/03/1979',
  sexe: 'Féminin',
  groupeSanguin: 'A+',
  allergies: ['Pénicilline', 'Acariens'],
  antecedents: ['Hypertension familiale', 'Diabète type 2 (père)'],
  traitementActuel: ['Amlodipine 5mg', 'Metformine 850mg']
}

export default function MedicalFolder(){
  const [activeTab, setActiveTab] = useState('info')

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Mon Dossier Médical</h1>
        <p className="text-sm text-slate-500">Accès à votre historique et informations médicales</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button 
          className={`px-4 py-2 rounded ${activeTab === 'info' ? 'bg-primary-500 text-white' : 'border'}`}
          onClick={() => setActiveTab('info')}
        >
          Informations personnelles
        </button>
        <button 
          className={`px-4 py-2 rounded ${activeTab === 'history' ? 'bg-primary-500 text-white' : 'border'}`}
          onClick={() => setActiveTab('history')}
        >
          Historique médical
        </button>
        <button 
          className={`px-4 py-2 rounded ${activeTab === 'documents' ? 'bg-primary-500 text-white' : 'border'}`}
          onClick={() => setActiveTab('documents')}
        >
          Documents
        </button>
      </div>

      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold mb-4">Informations de base</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-500">Nom complet</label>
                  <div className="font-medium">{personalInfo.name}</div>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Date de naissance</label>
                  <div className="font-medium">{personalInfo.dateNaissance}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-500">Sexe</label>
                  <div className="font-medium">{personalInfo.sexe}</div>
                </div>
                <div>
                  <label className="text-sm text-slate-500">Groupe sanguin</label>
                  <div className="font-medium">{personalInfo.groupeSanguin}</div>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-500">Allergies connues</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {personalInfo.allergies.map(allergie => (
                    <span key={allergie} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                      {allergie}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-500">Antécédents familiaux</label>
                <div className="text-sm mt-1">
                  {personalInfo.antecedents.map(ant => (
                    <div key={ant} className="mb-1">• {ant}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Traitement actuel</h3>
            <div className="space-y-2">
              {personalInfo.traitementActuel.map(traitement => (
                <div key={traitement} className="border rounded p-3">
                  <div className="font-medium">{traitement}</div>
                  <div className="text-sm text-slate-500">Prescription active</div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <button className="text-primary-600 text-sm">Modifier mes informations</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          {medicalHistory.map(visit => (
            <div key={visit.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold">{visit.diagnostic}</div>
                  <div className="text-sm text-slate-500">{visit.date} • {visit.medecin} ({visit.specialite})</div>
                </div>
                <button className="text-primary-600 text-sm">Voir détails</button>
              </div>
              
              <div className="bg-slate-50 p-3 rounded mb-3">
                <div className="text-sm">{visit.notes}</div>
              </div>
              
              <div>
                <div className="text-sm text-slate-500 mb-2">Documents associés:</div>
                <div className="flex gap-2">
                  {visit.documents.map(doc => (
                    <span key={doc} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      📄 {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="card">
          <h3 className="font-semibold mb-4">Mes documents médicaux</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border rounded p-4 text-center hover:bg-slate-50 cursor-pointer">
              <div className="text-2xl mb-2">📋</div>
              <div className="font-medium">Ordonnances</div>
              <div className="text-sm text-slate-500">3 documents</div>
            </div>
            <div className="border rounded p-4 text-center hover:bg-slate-50 cursor-pointer">
              <div className="text-2xl mb-2">🩺</div>
              <div className="font-medium">Analyses</div>
              <div className="text-sm text-slate-500">5 documents</div>
            </div>
            <div className="border rounded p-4 text-center hover:bg-slate-50 cursor-pointer">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">Imagerie</div>
              <div className="text-sm text-slate-500">2 documents</div>
            </div>
            <div className="border rounded p-4 text-center hover:bg-slate-50 cursor-pointer">
              <div className="text-2xl mb-2">📄</div>
              <div className="font-medium">Comptes-rendus</div>
              <div className="text-sm text-slate-500">8 documents</div>
            </div>
            <div className="border rounded p-4 text-center hover:bg-slate-50 cursor-pointer">
              <div className="text-2xl mb-2">💉</div>
              <div className="font-medium">Vaccinations</div>
              <div className="text-sm text-slate-500">Carnet à jour</div>
            </div>
            <div className="border rounded p-4 text-center hover:bg-slate-50 cursor-pointer">
              <div className="text-2xl mb-2">📞</div>
              <div className="font-medium">Téléconsultations</div>
              <div className="text-sm text-slate-500">7 consultations</div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}