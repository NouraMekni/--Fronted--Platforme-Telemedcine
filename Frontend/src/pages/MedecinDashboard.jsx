import React, { useState, useEffect, useRef } from 'react';
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
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionRef = useRef(null);
  const stompClient = useRef(null);

  // ------------------ Load notifications from DB ------------------
  useEffect(() => {
    if (!user || !user.id) return;

    fetch(`http://localhost:8083/api/notifications/medecin/${user.id}`, {
      credentials: 'include'
    })
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((n) => ({
          id: n.id,
          message: n.message,
          timestamp: n.timestamp || new Date().toLocaleString('fr-FR'),
          read: n.read || false
        }));
        setNotifications(mapped);
        console.log('📥 Loaded past notifications:', mapped);
      })
      .catch((err) => console.error('❌ Error fetching notifications:', err));
  }, [user]);

  // ------------------ WebSocket for live notifications ------------------
 useEffect(() => {
  if (!user || !user.id) return;

  console.log('Initializing WebSocket connection for medecin:', user.id);

  const socket = new SockJS('http://localhost:8083/ws');
  stompClient.current = over(socket);

  stompClient.current.debug = (str) => {
    console.log('STOMP:', str);
  };

  const onConnect = () => {
    console.log('Connected to WebSocket successfully');
    setIsConnected(true);

    const topic = `/topic/medecin-${user.id}`;
    subscriptionRef.current = stompClient.current.subscribe(topic, (message) => {
      try {
        console.log('📨 Raw message received:', message.body);
        let notifObj;

        try {
          notifObj = JSON.parse(message.body); // backend sends JSON object
        } catch {
          notifObj = { message: message.body }; // fallback
        }

        const formattedNotif = {
          id: notifObj.id || Date.now(),
          message: notifObj.message || 'Nouvelle notification',
          timestamp: notifObj.timestamp || new Date().toLocaleString('fr-FR'),
          read: false
        };

        // ✅ Prevent duplicates by checking id
        setNotifications((prev) => {
          const exists = prev.find((n) => n.id === formattedNotif.id);
          if (exists) return prev; // skip duplicate
          return [formattedNotif, ...prev];
        });
      } catch (error) {
        console.error('❌ Error processing notification:', error);
      }
    });

    console.log(`Subscribed to ${topic}`);
  };

  const onError = (error) => {
    console.error('WebSocket connection error:', error);
    setIsConnected(false);
  };

  stompClient.current.connect({}, onConnect, onError);

  // Cleanup
  return () => {
    console.log('Cleaning up WebSocket connection');
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.disconnect(() => {
        console.log('WebSocket disconnected');
      });
    }
    setIsConnected(false);
  };
}, [user]);


  const handleDeleteNotification = (id) => {
  // Delete from backend
  fetch(`http://localhost:8083/api/notifications/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
    .then((res) => {
      if (res.ok) {
        // Remove from state
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      } else {
        console.error('❌ Failed to delete notification');
      }
    })
    .catch((err) => console.error('❌ Error deleting notification:', err));
};


  // ------------------ Render ------------------
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
              <option key={s} value={s}>{s}</option>
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
              <li key={p.id} className="border rounded p-2">{p.name}</li>
            ))}
          </ul>
        </div>

        {/* Notifications */}
        <div className="md:col-span-3 card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">
              Notifications
              {notifications.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                  {notifications.length}
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isConnected ? '● Connecté' : '● Déconnecté'}
              </span>
              {notifications.length > 0 && (
                <button
                  onClick={() => setNotifications([])}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Tout effacer
                </button>
              )}
            </div>
          </div>

          {notifications.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune notification pour le moment.</p>
          ) : (
           <ul className="space-y-2 max-h-96 overflow-y-auto">
  {notifications.map((notification) => (
    <li
      key={notification.id}
      className={`relative border rounded p-3 ${
        notification.read ? 'bg-blue-50 border-blue-100' : 'bg-blue-100 border-blue-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-6">
          <p className="text-sm font-medium text-slate-800">{notification.message}</p>
          <p className="text-xs text-slate-500 mt-1">{notification.timestamp}</p>
        </div>

        {!notification.read && (
          <span className="w-2 h-2 bg-blue-500 rounded-full mt-1 mr-2"></span>
        )}

        <button
          onClick={() => handleDeleteNotification(notification.id)}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 rounded-full shadow-md transition-all duration-200 transform hover:scale-110"
          title="Delete"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </li>
  ))}
</ul>

          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
