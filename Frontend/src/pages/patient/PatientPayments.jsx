import React, { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { useNavigate } from 'react-router-dom'

const samplePayments = [
  { 
    id: 1, 
    date: '2024-10-20', 
    medecin: 'Dr. Ahmed Trabelsi', 
    specialite: 'Médecine générale',
    montant: '80 DT', 
    statut: 'Payé',
    methode: 'Carte bancaire',
    rdvDate: '2024-10-25 14:30'
  },
  { 
    id: 2, 
    date: '2024-09-15', 
    medecin: 'Dr. Fatma Zouari', 
    specialite: 'Dermatologie',
    montant: '150 DT', 
    statut: 'Payé',
    methode: 'PayPal',
    rdvDate: '2024-09-18 10:00'
  },
]

const pendingPayments = [
  {
    id: 3,
    medecin: 'Dr. Sami Jebali',
    specialite: 'Pédiatrie',
    montant: '115 DT',
    rdvDate: '2024-10-28 15:00',
    echeance: '2024-10-26'
  }
]

export default function PatientPayments(){
  const [activeTab, setActiveTab] = useState('pending')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [cardInfo, setCardInfo] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  })
  const navigate = useNavigate()

  const handlePayment = (paymentId) => {
    // Simulation du paiement
    alert('Paiement effectué avec succès ! Votre rendez-vous est confirmé.')
    // Rediriger vers les rendez-vous
    navigate('/patient/appointments')
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Mes Paiements</h1>
        <p className="text-sm text-slate-500">Gestion de vos paiements de consultations</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button 
          className={`px-4 py-2 rounded ${activeTab === 'pending' ? 'bg-primary-500 text-white' : 'border'}`}
          onClick={() => setActiveTab('pending')}
        >
          À payer ({pendingPayments.length})
        </button>
        <button 
          className={`px-4 py-2 rounded ${activeTab === 'history' ? 'bg-primary-500 text-white' : 'border'}`}
          onClick={() => setActiveTab('history')}
        >
          Historique ({samplePayments.length})
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-semibold mb-4 text-orange-600">⚠️ Paiements en attente</h3>
              <div className="bg-orange-50 p-3 rounded mb-4">
                <p className="text-sm text-orange-800">
                  <strong>Important :</strong> Le paiement est obligatoire avant votre consultation. 
                  Réglez maintenant pour confirmer votre rendez-vous.
                </p>
              </div>
              
              {pendingPayments.map(payment => (
                <div key={payment.id} className="border border-orange-200 rounded p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium">{payment.medecin}</div>
                      <div className="text-sm text-slate-500">{payment.specialite}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-orange-600">{payment.montant}</div>
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                        À payer
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-600 mb-3">
                    <div>📅 Rendez-vous : {payment.rdvDate}</div>
                    <div>⏰ À régler avant : {payment.echeance}</div>
                  </div>

                  <button 
                    className="bg-primary-500 text-white px-4 py-2 rounded w-full"
                    onClick={() => handlePayment(payment.id)}
                  >
                    Payer maintenant
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Méthode de paiement</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-500 mb-2">Choisir la méthode</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />
                    💳 Carte bancaire
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />
                    🅿️ PayPal
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="sepa"
                      checked={paymentMethod === 'sepa'}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />
                    🏦 Virement SEPA
                  </label>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">Numéro de carte</label>
                    <input 
                      className="w-full border rounded px-3 py-2"
                      placeholder="1234 5678 9012 3456"
                      value={cardInfo.number}
                      onChange={e => setCardInfo({...cardInfo, number: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-slate-500 mb-1">Expiration</label>
                      <input 
                        className="w-full border rounded px-3 py-2"
                        placeholder="MM/AA"
                        value={cardInfo.expiry}
                        onChange={e => setCardInfo({...cardInfo, expiry: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-500 mb-1">CVV</label>
                      <input 
                        className="w-full border rounded px-3 py-2"
                        placeholder="123"
                        value={cardInfo.cvv}
                        onChange={e => setCardInfo({...cardInfo, cvv: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">Nom sur la carte</label>
                    <input 
                      className="w-full border rounded px-3 py-2"
                      placeholder="Amina Ben Salah"
                      value={cardInfo.name}
                      onChange={e => setCardInfo({...cardInfo, name: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="bg-blue-50 p-4 rounded text-center">
                  <div className="text-blue-600 text-2xl mb-2">🅿️</div>
                  <p className="text-sm text-blue-800">
                    Vous serez redirigé vers PayPal pour finaliser le paiement.
                  </p>
                </div>
              )}

              {paymentMethod === 'sepa' && (
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-sm text-green-800 mb-2">
                    <strong>IBAN :</strong> FR76 1234 5678 9012 3456 7890 123
                  </p>
                  <p className="text-sm text-green-800">
                    <strong>Référence :</strong> TELEMED-{pendingPayments[0]?.id}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="bg-slate-50 p-3 rounded text-sm">
                🔒 Vos données de paiement sont sécurisées et chiffrées
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card">
          <h3 className="font-semibold mb-4">Historique des paiements</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-slate-500 text-sm border-b">
                <tr>
                  <th className="py-3">Date paiement</th>
                  <th className="py-3">Médecin</th>
                  <th className="py-3">Spécialité</th>
                  <th className="py-3">Montant</th>
                  <th className="py-3">Méthode</th>
                  <th className="py-3">RDV</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {samplePayments.map(payment => (
                  <tr key={payment.id} className="border-b hover:bg-slate-50">
                    <td className="py-3">{payment.date}</td>
                    <td className="py-3">{payment.medecin}</td>
                    <td className="py-3">{payment.specialite}</td>
                    <td className="py-3 font-medium">{payment.montant}</td>
                    <td className="py-3">{payment.methode}</td>
                    <td className="py-3 text-sm">{payment.rdvDate}</td>
                    <td className="py-3">
                      <button className="text-primary-600 text-sm">Reçu</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Total payé cette année : <strong>345 DT</strong>
              </div>
              <button className="text-primary-600 text-sm border rounded px-3 py-2">
                Télécharger récapitulatif annuel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}