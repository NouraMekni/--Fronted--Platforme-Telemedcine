import React from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import StatsCard from '../../components/StatsCard'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const monthlyData = [
  {name: 'Jan', consultations: 40, revenus: 2400},
  {name: 'Feb', consultations: 45, revenus: 2700},
  {name: 'Mar', consultations: 50, revenus: 3000},
  {name: 'Apr', consultations: 60, revenus: 3600},
  {name: 'May', consultations: 70, revenus: 4200},
]

const specialtyData = [
  { name: 'Cardiologie', value: 35, color: '#0088FE' },
  { name: 'Dermatologie', value: 25, color: '#00C49F' },
  { name: 'Diabétologie', value: 20, color: '#FFBB28' },
  { name: 'Autres', value: 20, color: '#FF8042' },
]

export default function Reports(){
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Rapports & Statistiques</h1>
        <p className="text-sm text-slate-500">Analyse des performances de la plateforme</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">1,247</div>
          <div className="text-sm text-slate-500">Total consultations</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">89%</div>
          <div className="text-sm text-slate-500">Taux satisfaction</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">23min</div>
          <div className="text-sm text-slate-500">Durée moyenne</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">42</div>
          <div className="text-sm text-slate-500">Médecins actifs</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Évolution mensuelle</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={monthlyData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="consultations" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Répartition par spécialité</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={specialtyData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value}%)`}
                >
                  {specialtyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">Actions rapides</h3>
        <div className="flex gap-3">
          <button className="bg-primary-500 text-white px-4 py-2 rounded">Exporter rapport mensuel</button>
          <button className="border px-4 py-2 rounded">Générer factures</button>
          <button className="border px-4 py-2 rounded">Rapport satisfaction</button>
        </div>
      </div>
    </DashboardLayout>
  )
}