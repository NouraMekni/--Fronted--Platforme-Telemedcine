import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

import { over } from 'stompjs';
import SockJS from 'sockjs-client';


const samplePatients = [
  { id: 1, name: 'Amina Ben Salah' },
  { id: 2, name: 'Mohamed Kharrat' },
  { id: 3, name: 'Nour Kammoun' }
];

const specialites = [
  'Médecine générale',
  'Pédiatrie',
  'Gynécologie',
  'Dermatologie',
  'Nutrition',
  'Allergologie',
  'Dentiste',
  'ORL',
  'Ophtalmologie',
  'Psychiatrie'
];

export default function MedecinDashboard() {
  const { user } = useAuth();
  const [specialite, setSpecialite] = useState(specialites[0]);
  const [notifications, setNotifications] = useState([]);
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    if (!user) return;

    const socket = new SockJS('http://localhost:8083/ws'); // Spring WS endpoint
    const client = over(socket);

    client.connect({}, () => {
      console.log('Connected to WebSocket');

      client.subscribe(`/topic/medecin-${user.id}`, (message) => {
        const newNotification = message.body;
        console.log('Nouvelle notification:', newNotification);

        setNotifications((prev) => [newNotification, ...prev]);
      });
    });

    setStompClient(client);

    // Cleanup on unmount
    return () => {
      if (client && client.connected) {
        client.disconnect();
      }
    };
  }, [user]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Bonjour {user?.name || 'Docteur'}</h1>
          <p className="text-sm text-slate-500">Tableau de bord médecin</p>
        </div>
        <div>
          <select
            value={specialite}
            onChange={(e) => setSpecialite(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            {specialites.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Planning / Rendez-vous */}
        <div className="md:col-span-2 card p-4">
          <h3 className="font-semibold mb-3">Planning et rendez-vous</h3>
          <p className="text-sm text-slate-600">(Prototype) Liste des prochains rendez-vous...</p>
        </div>

        {/* Patients list */}
        <div className="card p-4">
          <h3 className="font-semibold mb-3">Patients ({samplePatients.length})</h3>
          <ul className="space-y-2">
            {samplePatients.map((p) => (
              <li key={p.id} className="border rounded p-2">
                {p.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Notifications */}
        <div className="md:col-span-3 card p-4">
          <h3 className="font-semibold mb-3">Notifications</h3>
          {notifications.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune notification pour le moment.</p>
          ) : (
            <ul className="space-y-2">
              {notifications.map((n, idx) => (
                <li key={idx} className="border rounded p-2 bg-yellow-50">
                  {n}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
