import React, { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import axios from 'axios';
import * as StompJs from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Composant pour afficher la liste des docteurs
const DoctorsList = ({ 
  doctors, 
  selectedDoctor, 
  onSelectDoctor, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading doctors...
      </div>
    );
  }

  if (!doctors?.length) {
    return (
      <div className="p-4 text-center text-gray-500">
        No doctors available
      </div>
    );
  }

  return (
    <>
      {doctors.map((doctor) => (
        <div
          key={doctor.id}
          onClick={() => onSelectDoctor(doctor)}
          className={`p-4 border-b cursor-pointer transition-colors hover:bg-blue-50 ${
            selectedDoctor?.id === doctor.id 
              ? 'bg-blue-100 border-blue-300' 
              : 'bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">
                Dr. {doctor.name} {doctor.prenom}
              </h3>
              <p className="text-sm text-gray-600">{doctor.specialte}</p>
            </div>
            <div className="flex flex-col items-end">
              <span
                className={`inline-block w-3 h-3 rounded-full ${
                  doctor.disponibilite === 'available' 
                    ? 'bg-green-500' 
                    : 'bg-gray-400'
                }`}
              />
              <span className="text-xs text-gray-500 mt-1">
                {doctor.disponibilite === 'available' ? 'Available' : 'Busy'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

// Composant pour une bulle de message
const MessageBubble = ({ 
  message, 
  isOwnMessage, 
  doctorName 
}) => (
  <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
        isOwnMessage
          ? 'bg-blue-500 text-white rounded-br-none'
          : 'bg-gray-200 text-gray-800 rounded-bl-none'
      } ${message.error ? 'border-2 border-red-300' : ''}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className={`text-xs font-semibold ${
            isOwnMessage ? 'text-blue-100' : 'text-gray-600'
          }`}
        >
          {isOwnMessage ? 'You' : `Dr. ${doctorName}`}
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

// Composant pour la liste des messages
const MessagesList = ({ 
  messages, 
  currentUserId, 
  doctorName 
}) => {
  const safeMessages = Array.isArray(messages) ? messages : [];
  
  if (safeMessages.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
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
          doctorName={doctorName}
        />
      ))}
    </>
  );
};

// Composant pour l'en-tête du chat
const ChatHeader = ({ 
  doctor, 
  isConnected 
}) => (
  <div className="bg-blue-600 text-white p-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold">
          Chat with Dr. {doctor.name} {doctor.prenom}
        </h1>
        <p className="text-sm opacity-90">{doctor.specialte}</p>
      </div>
      <div className="text-right font-medium">
        <span className={isConnected ? "text-white-300" : "text-red-300"}>
          {isConnected ? "🟢 Online" : "🔴 Offline"}
        </span>
      </div>
    </div>
  </div>
);

// Composant pour l'input d'envoi de message
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
    <div className="p-4 border-t bg-white">
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
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          disabled={!isConnected || isSending}
        />
        <button
          onClick={onSendMessage}
          disabled={!message.trim() || !isConnected || isSending}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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

// Hook personnalisé pour la gestion WebSocket
const useWebSocket = (user, selectedDoctor, onMessageReceived) => {
  const [isConnected, setIsConnected] = useState(false);
  const stompClient = useRef(null);

  useEffect(() => {
    if (!user?.id || !selectedDoctor) {
      setIsConnected(false);
      return;
    }

    console.log("🔌 Initializing WebSocket connection...");

    const client = new StompJs.Client({
      webSocketFactory: () => new SockJS("http://localhost:8083/ws"),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log("✅ WebSocket connected");
      setIsConnected(true);

      const topic = `/topic/chat/${user.id}/${selectedDoctor.id}`;
      console.log(`📡 Subscribing to: ${topic}`);
      
      client.subscribe(topic, (message) => {
        try {
          const newMessage = JSON.parse(message.body);
          console.log("📩 Message received via WebSocket:", newMessage);
          onMessageReceived(newMessage);
        } catch (error) {
          console.error("❌ Error parsing WebSocket message:", error);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('❌ STOMP error:', frame.headers?.message);
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
  }, [user?.id, selectedDoctor?.id, onMessageReceived]);

  const sendMessage = useCallback((message) => {
    if (stompClient.current?.connected) {
      try {
        stompClient.current.publish({ 
          destination: "/app/chat/send", 
          body: JSON.stringify(message) 
        });
        console.log("📤 Message sent via WebSocket");
        return true;
      } catch (error) {
        console.error("❌ Error sending via WebSocket:", error);
        return false;
      }
    }
    return false;
  }, []);

  return { isConnected, sendMessage };
};

// Hook personnalisé pour charger les docteurs
const useDoctors = (user) => {
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user?.id || user.role !== 'patient') return;

    const loadDoctors = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:8083/api/medecins');
        console.log("🏥 Loaded doctors:", response.data);
        setDoctors(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("❌ Error loading doctors:", error);
        setDoctors([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDoctors();
  }, [user?.id, user?.role]);

  return { doctors, isLoading };
};

// Hook personnalisé pour la gestion de l'historique des messages
const useChatHistory = (user, selectedDoctor) => {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChatHistory = useCallback(async () => {
    if (!selectedDoctor || !user?.id) return;
    
    try {
      console.log(`📨 Loading chat history for user ${user.id} and doctor ${selectedDoctor.id}`);
      const response = await axios.get(
        `http://localhost:8083/api/chat/${user.id}/${selectedDoctor.id}`
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
      
      console.log("📨 Loaded chat history:", messagesData);
      setMessages(Array.isArray(messagesData) ? messagesData : []);
    } catch (error) {
      console.error("❌ Error loading chat history:", error);
      setMessages([]);
    }
  }, [user.id, selectedDoctor]);

  const addMessage = useCallback((newMessage) => {
    setMessages(prev => {
      const safePrev = Array.isArray(prev) ? prev : [];
      
      // Vérifier les doublons basés sur l'ID ou le contenu + timestamp
      const isDuplicate = safePrev.some(existingMsg => {
        // Si les deux messages ont des IDs, comparer les IDs
        if (existingMsg.id && newMessage.id && existingMsg.id === newMessage.id) {
          return true;
        }
        // Sinon, comparer le contenu et le timestamp
        return (
          existingMsg.content === newMessage.content &&
          existingMsg.timestamp === newMessage.timestamp &&
          existingMsg.senderId === newMessage.senderId
        );
      });
      
      if (isDuplicate) {
        console.log("🚫 Duplicate message detected, ignoring:", newMessage);
        return safePrev;
      }
      
      console.log("✅ Adding new message to state:", newMessage);
      return [...safePrev, newMessage];
    });
  }, []);

  const clearMessages = useCallback(() => {
    console.log("🧹 Clearing messages");
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

// Composant principal
export default function ChatPanel() {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isSending, setIsSending] = useState(false);
  
  const { doctors, isLoading } = useDoctors(user);
  const { 
    messages, 
    messagesEndRef, 
    loadChatHistory, 
    addMessage, 
    clearMessages 
  } = useChatHistory(user, selectedDoctor);

  const handleMessageReceived = useCallback((message) => {
    console.log("🔄 Processing received message:", message);
    addMessage(message);
  }, [addMessage]);

  const { isConnected, sendMessage } = useWebSocket(
    user, 
    selectedDoctor, 
    handleMessageReceived
  );

  const handleSelectDoctor = useCallback((doctor) => {
    console.log("👨‍⚕️ Doctor selected:", doctor.name);
    setSelectedDoctor(doctor);
    clearMessages();
  }, [clearMessages]);

  // Fonction pour envoyer un message (UNE SEULE FOIS)
  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || !selectedDoctor || isSending) {
      console.log("⏸️ Message sending blocked:", { 
        hasInput: !!input.trim(), 
        hasDoctor: !!selectedDoctor, 
        isSending 
      });
      return;
    }

    const messageData = {
      senderId: user.id,
      receiverId: selectedDoctor.id,
      senderName: `${user.name} ${user.prenom}`,
      receiverName: `Dr. ${selectedDoctor.name} ${selectedDoctor.prenom}`,
      senderRole: user.role,
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    console.log("🚀 Starting message send process:", messageData);
    setIsSending(true);

    try {
      // STRATÉGIE: Envoyer UNIQUEMENT via WebSocket
      // Le backend WebSocket sauvegarde automatiquement en base de données
      const sentViaWebSocket = sendMessage(messageData);
      
      if (sentViaWebSocket) {
        console.log("✅ Message sent successfully via WebSocket");
        // NE PAS ajouter le message localement ici
        // Il sera ajouté via le callback WebSocket quand il sera reçu du serveur
      } else {
        console.warn("⚠️ WebSocket not connected, trying REST API fallback");
        // Fallback: Envoyer via REST API seulement si WebSocket échoue
        const response = await axios.post(
          'http://localhost:8083/api/chat/send', 
          messageData
        );
        console.log("✅ Message sent via REST API:", response.data);
        
        // Ajouter le message localement seulement pour le fallback REST
        if (response.data.success) {
          addMessage({
            ...messageData,
            id: response.data.data?.id // Inclure l'ID de la base de données si disponible
          });
        }
      }

      // Vider l'input dans tous les cas
      setInput('');

    } catch (error) {
      console.error("❌ Error sending message:", error);
      
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
    selectedDoctor, 
    user, 
    sendMessage, 
    addMessage, 
    isSending
  ]);

  // Charger l'historique quand un docteur est sélectionné
  useEffect(() => {
    if (selectedDoctor) {
      console.log("🔄 Loading chat history for selected doctor");
      loadChatHistory();
    }
  }, [selectedDoctor, loadChatHistory]);

  // États de chargement et restrictions d'accès
  if (!user?.id) {
    return (
      <DashboardLayout>
        <div className="p-4">Loading user information...</div>
      </DashboardLayout>
    );
  }

  if (user.role !== 'patient') {
    return (
      <DashboardLayout>
        <div className="p-4">
          <h1 className="text-xl font-bold text-red-600">Access Restricted</h1>
          <p>This chat panel is only available for patients.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg border flex h-[550px] w-[950px]">
          {/* Sidebar - Liste des docteurs */}
          <div className="w-1/3 border-r bg-gray-50 flex flex-col">
            <div className="p-4 border-b bg-blue-600 text-white">
              <h2 className="text-lg font-bold">Available Doctors</h2>
              <p className="text-sm opacity-90">
                {doctors.length} doctor(s) available
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <DoctorsList
                doctors={doctors}
                selectedDoctor={selectedDoctor}
                onSelectDoctor={handleSelectDoctor}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Zone de chat principale */}
          <div className="flex-1 flex flex-col">
            {selectedDoctor ? (
              <>
                <ChatHeader 
                  doctor={selectedDoctor} 
                  isConnected={isConnected} 
                />
                
                {/* Zone des messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  <MessagesList
                    messages={messages}
                    currentUserId={user.id}
                    doctorName={selectedDoctor.name}
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
              // État quand aucun docteur n'est sélectionné
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-semibold mb-2">Select a Doctor</h3>
                  <p>Choose a doctor from the list to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}