import React from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import UserTable from '../../components/UserTable'

export default function UserManagement(){
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Gestion des utilisateurs</h1>
        <p className="text-sm text-slate-500">Gérer les comptes patients et médecins</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">127</div>
          <div className="text-sm text-slate-500">Total utilisateurs</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">89</div>
          <div className="text-sm text-slate-500">Patients</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">38</div>
          <div className="text-sm text-slate-500">Médecins</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">12</div>
          <div className="text-sm text-slate-500">Nouveaux ce mois</div>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <button className="bg-primary-500 text-white px-4 py-2 rounded">Ajouter utilisateur</button>
        <button className="border px-4 py-2 rounded">Exporter</button>
        <input className="border px-3 py-2 rounded flex-1 max-w-md" placeholder="Rechercher un utilisateur..." />
      </div>
      
      <UserTable />
    </DashboardLayout>
  )
}