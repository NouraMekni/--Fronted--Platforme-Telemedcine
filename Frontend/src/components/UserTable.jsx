import React from 'react'

const sampleUsers = [
  { id: 1, name: 'Amina Ben Salah', role: 'patient', email: 'amina.bensalah@example.com' },
  { id: 2, name: 'Dr. Ahmed Trabelsi (Médecine générale)', role: 'medecin', email: 'ahmed.trabelsi@example.com' },
  { id: 3, name: 'Mohamed Kharrat', role: 'patient', email: 'mohamed.kharrat@example.com' },
  { id: 4, name: 'Dr. Fatma Zouari (Dermatologie)', role: 'medecin', email: 'fatma.zouari@example.com' },
  { id: 5, name: 'Dr. Sami Jebali (Pédiatrie)', role: 'medecin', email: 'sami.jebali@example.com' },
  { id: 6, name: 'Dr. Leila Hamdi (Gynécologie)', role: 'medecin', email: 'leila.hamdi@example.com' },
  { id: 7, name: 'Dr. Karim Oueslati (Nutrition)', role: 'medecin', email: 'karim.oueslati@example.com' },
  { id: 8, name: 'Dr. Nesrine Ghanmi (Allergologie)', role: 'medecin', email: 'nesrine.ghanmi@example.com' },
]

export default function UserTable(){
  return (
    <div className="card">
      <h3 className="font-semibold mb-4">Utilisateurs</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-slate-500 text-sm">
            <tr>
              <th className="py-2">#</th>
              <th className="py-2">Nom</th>
              <th className="py-2">Rôle</th>
              <th className="py-2">Email</th>
            </tr>
          </thead>
          <tbody>
            {sampleUsers.map(u => (
              <tr key={u.id} className="border-t">
                <td className="py-2">{u.id}</td>
                <td className="py-2">{u.name}</td>
                <td className="py-2">{u.role}</td>
                <td className="py-2">{u.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
