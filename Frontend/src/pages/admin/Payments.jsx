import React from 'react'
import DashboardLayout from '../../components/DashboardLayout'

const samplePayments = [
  { id: 1, patient: 'Alice Dupont', montant: '65€', date: '2024-10-20', statut: 'Payé' },
  { id: 2, patient: 'Jean Petit', montant: '45€', date: '2024-10-19', statut: 'En attente' },
  { id: 3, patient: 'Fatima Ali', montant: '80€', date: '2024-10-18', statut: 'Payé' },
]

export default function Payments(){
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Paiements & Factures</h1>
        <p className="text-sm text-slate-500">Gestion des transactions financières</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">2,480€</div>
          <div className="text-sm text-slate-500">Revenus ce mois</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">320€</div>
          <div className="text-sm text-slate-500">En attente</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">47</div>
          <div className="text-sm text-slate-500">Transactions</div>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <button className="bg-primary-500 text-white px-4 py-2 rounded">Nouvelle facture</button>
        <select className="border px-3 py-2 rounded">
          <option>Tous les statuts</option>
          <option>Payé</option>
          <option>En attente</option>
          <option>Annulé</option>
        </select>
        <input className="border px-3 py-2 rounded flex-1 max-w-md" placeholder="Rechercher une transaction..." />
      </div>
      
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-slate-500 text-sm border-b">
              <tr>
                <th className="py-3">#</th>
                <th className="py-3">Patient</th>
                <th className="py-3">Montant</th>
                <th className="py-3">Date</th>
                <th className="py-3">Statut</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {samplePayments.map(payment => (
                <tr key={payment.id} className="border-b hover:bg-slate-50">
                  <td className="py-3">{payment.id}</td>
                  <td className="py-3">{payment.patient}</td>
                  <td className="py-3 font-medium">{payment.montant}</td>
                  <td className="py-3">{payment.date}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      payment.statut === 'Payé' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {payment.statut}
                    </span>
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