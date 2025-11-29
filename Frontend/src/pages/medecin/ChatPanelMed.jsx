import React, { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import axios from 'axios';
import * as StompJs from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Composant pour afficher la liste des patients
const PatientsList = ({ 
  patients, 
  selectedPatient, 
  onSelectPatient, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading patients...
      </div>
    );
  }

  if (!patients?.length) {
    return (
      <div className="p-4 text-center text-gray-500">
        No patients available
      </div>
    );
  }

  return (
    <>
      {patients.map((patient) => (
        <div
          key={patient.id}
          onClick={() => onSelectPatient(patient)}
          className={`p-4 border-b cursor-pointer transition-all duration-200 hover:bg-blue-50 border-blue-100 ${
            selectedPatient?.id === patient.id 
              ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-l-[#1a7bea] shadow-sm' 
              : 'bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">
                {patient.name} {patient.prenom}
              </h3>
              <p className="text-sm text-gray-600">Patient</p>
              {patient.dateNaissance && (
                <p className="text-xs text-gray-500">
                  {new Date(patient.dateNaissance).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end">
              <span className="inline-block w-3 h-3 rounded-full bg-[#1a7bea]" />
              <span className="text-xs text-gray-500 mt-1">Active</span>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

// Composant pour une bulle de message (identique au patient)
const MessageBubble = ({ 
  message, 
  isOwnMessage, 
  patientName 
}) => (
  <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
        isOwnMessage
          ? 'bg-gradient-to-r from-[#1a7bea] to-[#2d8dfc] text-white rounded-br-none'
          : 'bg-white text-gray-800 rounded-bl-none border border-blue-100'
      } ${message.error ? 'border-2 border-red-300' : ''}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className={`text-xs font-semibold ${
            isOwnMessage ? 'text-blue-100' : 'text-gray-600'
          }`}
        >
          {isOwnMessage ? 'You' : patientName}
        </span>
        {message.error && (
          <span className="text-xs text-red-300">(Failed to send)</span>
        )}
      </div>
      <p className="text-sm">{message.content}</p>
      <p
        className={`text-xs mt-1 ${
          isOwnMessage ? 'text-blue-100' : 'text-gray-500'
        }`}
      >
        {new Date(message.timestamp).toLocaleTimeString()}
      </p>
    </div>
  </div>
);

// Composant pour la liste des messages (adapté pour médecin)
const MessagesList = ({ 
  messages, 
  currentUserId, 
  patientName 
}) => {
  const safeMessages = Array.isArray(messages) ? messages : [];
  
  if (safeMessages.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <div className="text-4xl mb-2">💬</div>
        <p className="text-lg">No messages yet</p>
        <p className="text-sm">Start the conversation!</p>
      </div>
    );
  }

  return (
    <>
      {safeMessages.map((message, index) => (
        <MessageBubble
          key={message.id || index}
          message={message}
          isOwnMessage={message.senderId === currentUserId}
          patientName={patientName}
        />
      ))}
    </>
  );
};

// Composant pour l'en-tête du chat (adapté pour médecin)
const ChatHeader = ({ 
  patient, 
  isConnected 
}) => (
    <div className="p-4 border-b bg-gradient-to-r from-[#1a7bea] to-[#2d8dfc] text-white shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold">
          Chat with {patient.name} {patient.prenom}
        </h1>
        <p className="text-sm opacity-90">Patient</p>
        {patient.dateNaissance && (
          <p className="text-xs opacity-80">
            Born: {new Date(patient.dateNaissance).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className="text-right font-medium">
        <span className={isConnected ? "text-white-200" : "text-red-200"}>
          {isConnected ? "🟢 Online" : "🔴 Offline"}
        </span>
      </div>
    </div>
  </div>
);

// Composant pour l'input d'envoi de message (identique)
const MessageInput = ({ 
  message, 
  onMessageChange, 
  onSendMessage, 
  isConnected,
  isSending 
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isSending) {
      onSendMessage();
    }
  };

  return (
    <div className="p-4 border-t bg-white border-blue-100">
      <div className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            isConnected 
              ? "Type your message..." 
              : "Connecting..."
          }
          className="flex-1 border border-blue-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a7bea] focus:border-transparent disabled:bg-gray-100 transition-colors duration-200"
          disabled={!isConnected || isSending}
        />
        <button
          onClick={onSendMessage}
          disabled={!message.trim() || !isConnected || isSending}
          className="bg-gradient-to-r from-[#1a7bea] to-[#2d8dfc] text-white px-6 py-2 rounded-lg hover:from-[#1669d6] hover:to-[#1a7bea] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-sm font-medium"
        >
          {isSending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            'Send'
          )}
        </button>
      </div>
      {!isConnected && (
        <p className="text-yellow-600 text-xs mt-2">
          Connecting to chat server...
        </p>
      )}
    </div>
  );
};

// Hook personnalisé pour la gestion WebSocket (adapté pour médecin)
const useWebSocket = (user, selectedPatient, onMessageReceived) => {
  const [isConnected, setIsConnected] = useState(false);
  const stompClient = useRef(null);

  useEffect(() => {
    if (!user?.id || !selectedPatient) {
      setIsConnected(false);
      return;
    }

    console.log("🔌 Initializing WebSocket connection for doctor...");

    const client = new StompJs.Client({
      webSocketFactory: () => new SockJS("http://localhost:8083/ws"),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log("✅ WebSocket connected for doctor");
      setIsConnected(true);

      // Le médecin écoute les messages destinés à lui depuis ce patient
      const topic = `/topic/chat/${selectedPatient.id}/${user.id}`;
      console.log(`📡 Doctor subscribing to: ${topic}`);
      
      client.subscribe(topic, (message) => {
        try {
          const newMessage = JSON.parse(message.body);
          console.log("Message received by doctor via WebSocket:", newMessage);
          onMessageReceived(newMessage);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP error:', frame.headers?.message);
      setIsConnected(false);
    };

    client.onDisconnect = () => {
      console.log("🔌 WebSocket disconnected");
      setIsConnected(false);
    };

    stompClient.current = client;
    client.activate();

    return () => {
      console.log("🧹 Cleaning up WebSocket...");
      if (client.connected) {
        client.deactivate();
      }
      setIsConnected(false);
    };
  }, [user?.id, selectedPatient?.id, onMessageReceived]);

  const sendMessage = useCallback((message) => {
    if (stompClient.current?.connected) {
      try {
        stompClient.current.publish({ 
          destination: "/app/chat/send", 
          body: JSON.stringify(message) 
        });
        console.log("Message sent by doctor via WebSocket");
        return true;
      } catch (error) {
        console.error("Error sending via WebSocket:", error);
        return false;
      }
    }
    return false;
  }, []);

  return { isConnected, sendMessage };
};

// Hook personnalisé pour charger les patients (nouveau)
const usePatients = (user) => {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user?.id || user.role !== 'medecin') return;

    const loadPatients = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:8083/api/patients');
        console.log("👥 Loaded patients:", response.data);
        setPatients(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("❌ Error loading patients:", error);
        setPatients([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPatients();
  }, [user?.id, user?.role]);

  return { patients, isLoading };
};

// Hook personnalisé pour la gestion de l'historique des messages (adapté)
const useChatHistory = (user, selectedPatient) => {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChatHistory = useCallback(async () => {
    if (!selectedPatient || !user?.id) return;
    
    try {
      console.log(`Loading chat history for doctor ${user.id} and patient ${selectedPatient.id}`);
      const response = await axios.get(
        `http://localhost:8083/api/chat/${selectedPatient.id}/${user.id}`
      );
      
      // Gérer différents formats de réponse
      let messagesData = [];
      if (response.data && Array.isArray(response.data)) {
        messagesData = response.data;
      } else if (response.data && response.data.messages) {
        messagesData = response.data.messages;
      } else if (response.data && response.data.data) {
        messagesData = response.data.data;
      }
      
      console.log("Loaded chat history for doctor:", messagesData);
      setMessages(Array.isArray(messagesData) ? messagesData : []);
    } catch (error) {
      console.error("Error loading chat history:", error);
      setMessages([]);
    }
  }, [user.id, selectedPatient]);

  const addMessage = useCallback((newMessage) => {
    setMessages(prev => {
      const safePrev = Array.isArray(prev) ? prev : [];
      
      // Vérifier les doublons basés sur l'ID ou le contenu + timestamp
      const isDuplicate = safePrev.some(existingMsg => {
        if (existingMsg.id && newMessage.id && existingMsg.id === newMessage.id) {
          return true;
        }
        return (
          existingMsg.content === newMessage.content &&
          existingMsg.timestamp === newMessage.timestamp &&
          existingMsg.senderId === newMessage.senderId
        );
      });
      
      if (isDuplicate) {
        console.log("Duplicate message detected, ignoring:", newMessage);
        return safePrev;
      }
      
      console.log("Adding new message to doctor state:", newMessage);
      return [...safePrev, newMessage];
    });
  }, []);

  const clearMessages = useCallback(() => {
    console.log("🧹 Clearing messages for doctor");
    setMessages([]);
  }, []);

  return { 
    messages, 
    messagesEndRef, 
    loadChatHistory, 
    addMessage, 
    clearMessages 
  };
};

// Composant principal pour le médecin
export default function DoctorChatPanel() {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isSending, setIsSending] = useState(false);
  
  const { patients, isLoading } = usePatients(user);
  const { 
    messages, 
    messagesEndRef, 
    loadChatHistory, 
    addMessage, 
    clearMessages 
  } = useChatHistory(user, selectedPatient);

  const handleMessageReceived = useCallback((message) => {
    console.log("Processing received message by doctor:", message);
    addMessage(message);
  }, [addMessage]);

  const { isConnected, sendMessage } = useWebSocket(
    user, 
    selectedPatient, 
    handleMessageReceived
  );

  const handleSelectPatient = useCallback((patient) => {
    console.log("👤 Patient selected:", patient.name);
    setSelectedPatient(patient);
    clearMessages();
  }, [clearMessages]);

  // Fonction pour envoyer un message en tant que médecin
  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || !selectedPatient || isSending) {
      console.log("⏸️ Message sending blocked by doctor:", { 
        hasInput: !!input.trim(), 
        hasPatient: !!selectedPatient, 
        isSending 
      });
      return;
    }

    const messageData = {
      senderId: user.id,
      receiverId: selectedPatient.id,
      senderName: `Dr. ${user.name} ${user.prenom}`,
      receiverName: `${selectedPatient.name} ${selectedPatient.prenom}`,
      senderRole: user.role,
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    console.log("Starting message send process by doctor:", messageData);
    setIsSending(true);

    try {
      // STRATÉGIE: Envoyer UNIQUEMENT via WebSocket
      const sentViaWebSocket = sendMessage(messageData);
      
      if (sentViaWebSocket) {
        console.log("Message sent successfully by doctor via WebSocket");
        // NE PAS ajouter le message localement ici
        // Il sera ajouté via le callback WebSocket quand il sera reçu du serveur
      } else {
        console.warn("WebSocket not connected, trying REST API fallback");
        // Fallback: Envoyer via REST API seulement si WebSocket échoue
        const response = await axios.post(
          'http://localhost:8083/api/chat/send', 
          messageData
        );
        console.log("Message sent by doctor via REST API:", response.data);
        
        // Ajouter le message localement seulement pour le fallback REST
        if (response.data.success) {
          addMessage({
            ...messageData,
            id: response.data.data?.id
          });
        }
      }

      // Vider l'input dans tous les cas
      setInput('');

    } catch (error) {
      console.error("Error sending message by doctor:", error);
      
      // En cas d'erreur, ajouter le message localement avec indication d'erreur
      addMessage({
        ...messageData,
        error: true,
        errorMessage: error.response?.data?.message || error.message
      });
      
      setInput('');
    } finally {
      setIsSending(false);
    }
  }, [
    input, 
    selectedPatient, 
    user, 
    sendMessage, 
    addMessage, 
    isSending
  ]);

  // Charger l'historique quand un patient est sélectionné
  useEffect(() => {
    if (selectedPatient) {
      console.log("🔄 Loading chat history for selected patient");
      loadChatHistory();
    }
  }, [selectedPatient, loadChatHistory]);

  // États de chargement et restrictions d'accès
  if (!user?.id) {
    return (
      <DashboardLayout>
        <div className="p-4">Loading user information...</div>
      </DashboardLayout>
    );
  }

  if (user.role !== 'medecin') {
    return (
      <DashboardLayout>
        <div className="p-4">
          <h1 className="text-xl font-bold text-red-600">Access Restricted</h1>
          <p>This chat panel is only available for doctors.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 flex h-[550px] overflow-hidden">
          {/* Sidebar - Liste des patients */}
          <div className="w-1/3 border-r border-blue-100 bg-gradient-to-b from-blue-50 to-white flex flex-col">
            <div className="p-4 border-b border-blue-200 bg-gradient-to-r from-[#1a7bea] to-[#2d8dfc] text-white shadow-sm">
              <h2 className="text-lg font-bold">Your Patients</h2>
              <p className="text-sm opacity-90">
                {patients.length} patient(s)
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <PatientsList
                patients={patients}
                selectedPatient={selectedPatient}
                onSelectPatient={handleSelectPatient}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Zone de chat principale */}
          <div className="flex-1 flex flex-col">
            {selectedPatient ? (
              <>
                <ChatHeader 
                  patient={selectedPatient} 
                  isConnected={isConnected} 
                />
                
                {/* Zone des messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-blue-25 to-blue-50">
                  <MessagesList
                    messages={messages}
                    currentUserId={user.id}
                    patientName={`${selectedPatient.name} ${selectedPatient.prenom}`}
                  />
                  <div ref={messagesEndRef} />
                </div>

                {/* Input d'envoi de message */}
                <MessageInput
                  message={input}
                  onMessageChange={setInput}
                  onSendMessage={handleSendMessage}
                  isConnected={isConnected}
                  isSending={isSending}
                />
              </>
            ) : (
              // État quand aucun patient n'est sélectionné
              <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-25 to-blue-100">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-700">Select a Patient</h3>
                  <p className="text-gray-600">Choose a patient from the list to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}