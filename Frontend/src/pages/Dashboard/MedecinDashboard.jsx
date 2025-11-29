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

export default function MedecinDashboard() {
  const { user } = useAuth();
  const [specialite, setSpecialite] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionRef = useRef(null);
  const stompClient = useRef(null);

  // Calculate notification analytics
  const notificationAnalytics = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    read: notifications.filter(n => n.read).length,
    unreadPercentage: notifications.length > 0 
      ? Math.round((notifications.filter(n => !n.read).length / notifications.length) * 100)
      : 0
  };

  // Fetch doctor's specialty from database
  useEffect(() => {
    if (!user || !user.id) return;

    // Fetch doctor details including specialty
    fetch(`http://localhost:8083/api/medecins/${user.id}`, {
      credentials: 'include'
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch doctor details');
        }
        return res.json();
      })
      .then((doctorData) => {
        console.log('Doctor data received:', doctorData);
        // Use the correct field name from your API response
        if (doctorData.specialte) {
          setSpecialite(doctorData.specialte);
        } else {
          console.warn('Specialty field not found in response, using fallback');
          setSpecialite('Médecine générale');
        }
      })
      .catch((err) => {
        console.error('Error fetching doctor specialty:', err);
        setSpecialite('Médecine générale');
      });
  }, [user]);

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
      .catch((err) => console.error('Error fetching notifications:', err));
  }, [user]);

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
            notifObj = JSON.parse(message.body); 
          } catch {
            notifObj = { message: message.body }; 
          }

          const formattedNotif = {
            id: notifObj.id || Date.now(),
            message: notifObj.message || 'Nouvelle notification',
            timestamp: notifObj.timestamp || new Date().toLocaleString('fr-FR'),
            read: false
          };

          setNotifications((prev) => {
            const exists = prev.find((n) => n.id === formattedNotif.id);
            if (exists) return prev; 
            return [formattedNotif, ...prev];
          });
        } catch (error) {
          console.error('Error processing notification:', error);
        }
      });

      console.log(`Subscribed to ${topic}`);
    };

    const onError = (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    };

    stompClient.current.connect({}, onConnect, onError);

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
    fetch(`http://localhost:8083/api/notifications/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then((res) => {
        if (res.ok) {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        } else {
          console.error('Failed to delete notification');
        }
      })
      .catch((err) => console.error('Error deleting notification:', err));
  };

  const handleMarkAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Bonjour {user?.name || 'Docteur'}</h1>
          <p className="text-sm text-slate-500">Tableau de bord médecin</p>
        </div>
        <div>
          <div className="border px-3 py-2 rounded bg-gray-50 text-gray-700 min-w-[200px] text-center">
            {specialite || 'Chargement...'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Notification Analytics Section */}
        <div className="md:col-span-2 card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Analytique des Notifications</h3>
            {notificationAnalytics.unread > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">{notificationAnalytics.total}</div>
              <div className="text-sm text-blue-600 mt-1">Total</div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-700">{notificationAnalytics.unread}</div>
              <div className="text-sm text-orange-600 mt-1">Non lues</div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-700">{notificationAnalytics.read}</div>
              <div className="text-sm text-green-600 mt-1">Lues</div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-700">{notificationAnalytics.unreadPercentage}%</div>
              <div className="text-sm text-purple-600 mt-1">Non lues</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>Taux de notifications lues</span>
              <span>{100 - notificationAnalytics.unreadPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${100 - notificationAnalytics.unreadPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">Dernière notification</span>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                {notifications.length > 0 
                  ? notifications[0].timestamp 
                  : 'Aucune notification'
                }
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">Statut de connexion</span>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                {isConnected ? 'Connecté en temps réel' : 'Hors ligne'}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold mb-3">Patients ({samplePatients.length})</h3>
          <ul className="space-y-2">
            {samplePatients.map((p) => (
              <li key={p.id} className="border rounded p-2">{p.name}</li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3 card p-4 w-[900px]">
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
    <div className="flex items-start flex-1">
      {/* Checkmark button moved to the left */}
      {!notification.read && (
        <button
          onClick={() => handleMarkAsRead(notification.id)}
          className="w-6 h-6 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-full text-xs mr-3 mt-0.5 transition-colors flex-shrink-0"
          title="Marquer comme lu"
        >
          ✓
        </button>
      )}
      
      <div 
        className="flex-1 pr-6 cursor-pointer"
        onClick={() => !notification.read && handleMarkAsRead(notification.id)}
      >
        <p className="text-sm font-medium text-slate-800">{notification.message}</p>
        <p className="text-xs text-slate-500 mt-1">{notification.timestamp}</p>
      </div>
    </div>

    <button
      onClick={() => handleDeleteNotification(notification.id)}
      className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 rounded-full shadow-md transition-all duration-200 transform hover:scale-110"
      title="Supprimer"
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