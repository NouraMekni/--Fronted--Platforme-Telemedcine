import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";

const API_URL_RDV = "http://localhost:8083/api/rendezvous";

export default function Planning() {
  const { user: medecin } = useAuth();

  const [selectedDate, setSelectedDate] = useState("");
  const [rdvs, setRdvs] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editTime, setEditTime] = useState("09:00");

  // Load RDVs for THIS doctor
  useEffect(() => {
    if (!medecin?.id) return;
    fetchRDVs();
  }, [medecin]);

  const fetchRDVs = async () => {
    try {
      const res = await fetch(`${API_URL_RDV}/medecin/${medecin.id}`);
      if (!res.ok) return;

      const data = await res.json();
      console.log("📅 RDVs chargés:", data); // Debug log
      setRdvs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur fetch RDVs:", error);
    }
  };
  

  // Approve or Reject
  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL_RDV}/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchRDVs();
      } else {
        alert("Erreur mise à jour statut");
      }
    } catch (e) {
      console.error("Erreur:", e);
    }
  };

  // Update RDV with time
  const updateRDV = async () => {
    if (!editing) return;

    try {
      const updatedData = {
        date: editing.date,
        time: editTime, // Include time in the request
        description: editing.description
      };

      console.log("📤 Données envoyées:", updatedData); // Debug log

      const res = await fetch(`${API_URL_RDV}/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        const updatedRdv = await res.json();
        console.log("✅ RDV mis à jour:", updatedRdv); // Debug log
        setEditing(null);
        setEditTime("09:00");
        fetchRDVs();
        alert("Rendez-vous modifié avec succès !");
      } else {
        const errorText = await res.text();
        console.error("❌ Erreur backend:", errorText);
        alert("Erreur modification RDV: " + errorText);
      }
    } catch (e) {
      console.error("Erreur réseau:", e);
      alert("Erreur réseau lors de la modification");
    }
  };

  // Open edit modal
  const openEditModal = (rdv) => {
    setEditing(rdv);
    setEditTime(rdv.time || "09:00");
    console.log("🕐 RDV sélectionné:", rdv); // Debug log
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditing(null);
    setEditTime("09:00");
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Filter by Date
  const filtered = selectedDate
    ? rdvs.filter((r) => r.date === selectedDate)
    : rdvs;

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      PENDING: { 
        color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
        icon: "⏳", 
        text: "En attente" 
      },
      APPROVED: { 
        color: "bg-green-100 text-green-800 border-green-200", 
        icon: "✅", 
        text: "Confirmé" 
      },
      REFUSED: { 
        color: "bg-red-100 text-red-800 border-red-200", 
        icon: "❌", 
        text: "Refusé" 
      }
    };

    const config = statusConfig[status] || { 
      color: "bg-gray-100 text-gray-800 border-gray-200", 
      icon: "❓", 
      text: status 
    };

    return (
      <span className={`px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-2 ${config.color}`}>
        <span className="text-xs">{config.icon}</span>
        {config.text}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Planning Médical</h1>
          <p className="text-gray-600">
            Gérez votre planning et les rendez-vous des patients
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📅 Filtrer par date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            
            <div className="flex gap-3 mt-6 ">
              <button
                onClick={() => setSelectedDate("")}
                className="bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-700 hover:to-blue-400 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                Voir tout
              </button>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="p-6 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedDate
                  ? `Rendez-vous du ${selectedDate}`
                  : "Tous les rendez-vous"}
              </h3>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                {filtered.length} rendez-vous
              </span>
            </div>
          </div>

          <div className="p-6">
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Aucun rendez-vous
                </h3>
                <p className="text-gray-500">
                  {selectedDate 
                    ? "Aucun rendez-vous programmé pour cette date" 
                    : "Aucun rendez-vous dans votre planning"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((r) => (
                  <div
                    key={r.id}
                    className="bg-gradient-to-r from-white to-blue-50 border border-blue-200 rounded-xl p-6 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        {/* Time Badge */}
                        <div className="text-center min-w-[100px]">
                          <div className="bg-blue-500 text-white rounded-xl p-4 shadow-lg">
                            <div className="text-2xl font-bold">
                              {r.time || "—"}
                            </div>
                            <div className="text-xs opacity-90 mt-1">
                              {r.date}
                            </div>
                          </div>
                        </div>

                        {/* Patient Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <span className="text-lg">👤</span>
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-800">
                                {r.patient?.name} {r.patient?.prenom}
                              </h4>
                              <p className="text-gray-600 text-sm">
                                {r.description}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <span>📧</span>
                              <span>{r.patient?.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col items-end gap-3">
                        <StatusBadge status={r.status} />
                        
                        <div className="flex gap-2">
                          {r.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => updateStatus(r.id, "APPROVED")}
                                className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500 text-white text-lg hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                title="Approuver"
                              >
                                <span role="img" aria-label="approve">✓</span>
                              </button>

                              <button
                                onClick={() => updateStatus(r.id, "REFUSED")}
                                className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-500 text-white text-lg hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                title="Refuser"
                              >
                                <span role="img" aria-label="refuse">✗</span>
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => openEditModal(r)}
                className="bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-700 hover:to-blue-400 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"
                            title="Modifier le rendez-vous"
                          >
                            <span role="img" aria-label="edit">✏️</span>
                            <span>Modifier</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* EDIT MODAL */}
        {editing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-400 to-blue-700 p-6 rounded-t-2xl">
                <h2 className="text-xl font-bold text-white">
                  ✏️ Modifier le Rendez-vous
                </h2>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4">
                {/* Patient Info */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    👤 Patient
                  </label>
                  <div className="border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 font-medium">
                    {editing.patient?.name} {editing.patient?.prenom}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📅 Date
                    </label>
                    <input
                      type="date"
                      value={editing.date}
                      onChange={(e) =>
                        setEditing({ ...editing, date: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ⏰ Heure
                    </label>
                    <select
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📝 Description / Motif
                  </label>
                  <textarea
                    value={editing.description}
                    onChange={(e) =>
                      setEditing({ ...editing, description: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    rows="3"
                    placeholder="Description de la consultation..."
                  />
                </div>

                {/* Status */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700">Statut actuel:</span>
                    <StatusBadge status={editing.status} />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={closeEditModal}
                  className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={updateRDV}
                  className="bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300"
                >
                  💾 Sauvegarder
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}