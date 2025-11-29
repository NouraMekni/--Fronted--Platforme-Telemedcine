import React, { useState } from 'react'
import DashboardLayout from "../../components/DashboardLayout";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const tensionData = [
  {date: '10/15', systolique: 135, diastolique: 85},
  {date: '10/16', systolique: 140, diastolique: 90},
  {date: '10/17', systolique: 130, diastolique: 80},
  {date: '10/18', systolique: 125, diastolique: 75},
  {date: '10/19', systolique: 128, diastolique: 78},
  {date: '10/20', systolique: 132, diastolique: 82},
]

const poidsData = [
  {semaine: 'S1', poids: 75.2},
  {semaine: 'S2', poids: 74.8},
  {semaine: 'S3', poids: 74.5},
  {semaine: 'S4', poids: 74.1},
]

const glycemieData = [
  {heure: '7h', glucose: 95},
  {heure: '12h', glucose: 140},
  {heure: '19h', glucose: 110},
  {heure: '22h', glucose: 100},
]

export default function HealthTracking(){
  const [activeMetric, setActiveMetric] = useState('tension')
  const [newValue, setNewValue] = useState({ systolique: '', diastolique: '', poids: '', glucose: '' })

  const currentStats = {
    tension: { last: '132/82 mmHg', trend: 'stable', color: 'text-green-600' },
    poids: { last: '74.1 kg', trend: 'en baisse', color: 'text-green-600' },
    glycemie: { last: '100 mg/dL', trend: 'normal', color: 'text-green-600' }
  }

  const addNewMeasurement = () => {
    // Simulation d'ajout d'une nouvelle mesure
    alert('Nouvelle mesure enregistrée !')
    setNewValue({ systolique: '', diastolique: '', poids: '', glucose: '' })
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Suivi Santé</h1>
        <p className="text-sm text-slate-500">Enregistrez et visualisez vos constantes vitales</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">{currentStats.tension.last}</div>
          <div className="text-sm text-slate-500">Tension artérielle</div>
          <div className={`text-xs ${currentStats.tension.color}`}>Tendance {currentStats.tension.trend}</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{currentStats.poids.last}</div>
          <div className="text-sm text-slate-500">Poids</div>
          <div className={`text-xs ${currentStats.poids.color}`}>Tendance {currentStats.poids.trend}</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">{currentStats.glycemie.last}</div>
          <div className="text-sm text-slate-500">Glycémie</div>
          <div className={`text-xs ${currentStats.glycemie.color}`}>Niveau {currentStats.glycemie.trend}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <button 
                className={`px-3 py-2 rounded text-sm ${activeMetric === 'tension' ? 'bg-primary-500 text-white' : 'border'}`}
                onClick={() => setActiveMetric('tension')}
              >
                Tension
              </button>
              <button 
                className={`px-3 py-2 rounded text-sm ${activeMetric === 'poids' ? 'bg-primary-500 text-white' : 'border'}`}
                onClick={() => setActiveMetric('poids')}
              >
                Poids
              </button>
              <button 
                className={`px-3 py-2 rounded text-sm ${activeMetric === 'glycemie' ? 'bg-primary-500 text-white' : 'border'}`}
                onClick={() => setActiveMetric('glycemie')}
              >
                Glycémie
              </button>
            </div>

            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                {activeMetric === 'tension' && (
                  <LineChart data={tensionData}>
                    <XAxis dataKey="date" />
                    <YAxis domain={[60, 160]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="systolique" stroke="#dc2626" strokeWidth={2} name="Systolique" />
                    <Line type="monotone" dataKey="diastolique" stroke="#2563eb" strokeWidth={2} name="Diastolique" />
                  </LineChart>
                )}
                {activeMetric === 'poids' && (
                  <BarChart data={poidsData}>
                    <XAxis dataKey="semaine" />
                    <YAxis domain={[73, 76]} />
                    <Tooltip />
                    <Bar dataKey="poids" fill="#06b6d4" />
                  </BarChart>
                )}
                {activeMetric === 'glycemie' && (
                  <LineChart data={glycemieData}>
                    <XAxis dataKey="heure" />
                    <YAxis domain={[80, 160]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="glucose" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Historique récent</h3>
            
            {activeMetric === 'tension' && (
              <div className="space-y-2">
                {tensionData.slice(-5).reverse().map((data, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="text-sm">{data.date}</div>
                    <div className="font-medium">{data.systolique}/{data.diastolique} mmHg</div>
                  </div>
                ))}
              </div>
            )}

            {activeMetric === 'poids' && (
              <div className="space-y-2">
                {poidsData.slice(-5).reverse().map((data, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="text-sm">{data.semaine}</div>
                    <div className="font-medium">{data.poids} kg</div>
                  </div>
                ))}
              </div>
            )}

            {activeMetric === 'glycemie' && (
              <div className="space-y-2">
                {glycemieData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="text-sm">Aujourd'hui {data.heure}</div>
                    <div className="font-medium">{data.glucose} mg/dL</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold mb-4">Ajouter une mesure</h3>
            
            {activeMetric === 'tension' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Systolique (mmHg)</label>
                  <input 
                    className="w-full border rounded px-3 py-2"
                    value={newValue.systolique}
                    onChange={e => setNewValue({...newValue, systolique: e.target.value})}
                    placeholder="120"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1">Diastolique (mmHg)</label>
                  <input 
                    className="w-full border rounded px-3 py-2"
                    value={newValue.diastolique}
                    onChange={e => setNewValue({...newValue, diastolique: e.target.value})}
                    placeholder="80"
                  />
                </div>
              </div>
            )}

            {activeMetric === 'poids' && (
              <div>
                <label className="block text-sm text-slate-500 mb-1">Poids (kg)</label>
                <input 
                  className="w-full border rounded px-3 py-2"
                  value={newValue.poids}
                  onChange={e => setNewValue({...newValue, poids: e.target.value})}
                  placeholder="74.0"
                />
              </div>
            )}

            {activeMetric === 'glycemie' && (
              <div>
                <label className="block text-sm text-slate-500 mb-1">Glycémie (mg/dL)</label>
                <input 
                  className="w-full border rounded px-3 py-2"
                  value={newValue.glucose}
                  onChange={e => setNewValue({...newValue, glucose: e.target.value})}
                  placeholder="100"
                />
              </div>
            )}

            <button 
              className="w-full bg-primary-500 text-white py-2 rounded mt-4"
              onClick={addNewMeasurement}
            >
              Enregistrer
            </button>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Objectifs</h3>
            
            <div className="space-y-3">
              <div className="border rounded p-3">
                <div className="font-medium text-sm">Tension artérielle</div>
                <div className="text-xs text-slate-500">Objectif: &lt; 130/80 mmHg</div>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
              </div>
              
              <div className="border rounded p-3">
                <div className="font-medium text-sm">Poids</div>
                <div className="text-xs text-slate-500">Objectif: 72 kg</div>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '60%'}}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Rappels</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Tension (quotidien)</span>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Poids (hebdomadaire)</span>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Glycémie (4x/jour)</span>
                <input type="checkbox" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}