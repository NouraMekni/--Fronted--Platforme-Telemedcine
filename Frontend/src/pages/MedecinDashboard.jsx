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
//----------------------------------
export default function MedecinDashboard() {
  const { user } = useAuth();
  const [specialite, setSpecialite] = useState(specialites[0]);
  const [notifications, setNotifications] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (!user || !user.id) {
      console.log('User not available for WebSocket connection');
      return;
    }

    console.log('Initializing WebSocket connection for medecin:', user.id);

    const socket = new SockJS('http://localhost:8083/ws');
    const client = over(socket);

    // Enable debug logging (can be removed in production)
    client.debug = (str) => {
      console.log('STOMP:', str);
    };

    // Connection success callback
    const onConnect = () => {
      console.log('Connected to WebSocket successfully');
      setIsConnected(true);

      // Subscribe to the doctor's notification topic
      const subscription = client.subscribe(`/topic/medecin-${user.id}`, (message) => {
        try {
          const newNotification = message.body;
          console.log('Nouvelle notification reçue:', newNotification);

          // Add notification with timestamp
          const notificationData = {
            id: Date.now(),
            message: newNotification,
            timestamp: new Date().toLocaleString('fr-FR'),
            read: false
          };

          setNotifications((prev) => [notificationData, ...prev]);
        } catch (error) {
          console.error('Error processing notification:', error);
        }
      });

      subscriptionRef.current = subscription;
      console.log(`Subscribed to /topic/medecin-${user.id}`);
    };

    // Connection error callback
    const onError = (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    };

    // Connect to WebSocket
    client.connect({}, onConnect, onError);

    setStompClient(client);

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up WebSocket connection');
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      if (client && client.connected) {
        client.disconnect(() => {
          console.log('WebSocket disconnected');
        });
      }
      setIsConnected(false);
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
              <span className={`text-xs px-2 py-1 rounded ${
                isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
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
                  className={`border rounded p-3 ${
                    notification.read 
                      ? 'bg-slate-50 border-slate-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {notification.timestamp}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
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
