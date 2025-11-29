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

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Planning & Rendez-vous</h1>
        <p className="text-sm text-slate-500">
          Gestion de votre planning médical
        </p>
      </div>

      <div className="flex gap-4 mb-4">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <button className="bg-primary-500 text-white px-4 py-2 rounded">
          Bloquer créneau
        </button>
        <button
          onClick={() => setSelectedDate("")}
          className="border px-4 py-2 rounded"
        >
          Voir tout
        </button>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">
          {selectedDate
            ? `Rendez-vous du ${selectedDate}`
            : "Tous les rendez-vous"}
          <span className="ml-2 text-sm font-normal text-slate-500">
            ({filtered.length} rendez-vous)
          </span>
        </h3>

        {filtered.length === 0 ? (
          <p className="text-slate-500">Aucun rendez-vous.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="border rounded p-4 flex items-center justify-between hover:bg-slate-50"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[80px]">
                    <div className="text-lg font-medium text-primary-600">
                      {r.time || "—"}
                    </div>
                    <div className="text-sm text-slate-500">
                      {r.date}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">
                      {r.patient?.name} {r.patient?.prenom}
                    </div>
                    <div className="text-sm text-slate-500">
                      {r.description}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      📧 {r.patient?.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      r.status === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : r.status === "PENDING"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {r.status}
                  </span>

                  {r.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
  onClick={() => updateStatus(r.id, "APPROVED")}
  className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white text-lg hover:bg-green-600 transition-all duration-300 ease-in-out shadow-lg"
  title="Approuver"
>
  <span role="img" aria-label="approve">✓</span>
</button>

<button
  onClick={() => updateStatus(r.id, "REFUSED")}
  className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500 text-white text-lg hover:bg-red-600 transition-all duration-300 ease-in-out shadow-lg"
  title="Refuser"
>
  <span role="img" aria-label="refuse">✗</span>
</button>

                    </div>
                  )}

                  {/* Modifier button */}
                 <button
  onClick={() => openEditModal(r)}
  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white bg-blue-500 hover:bg-blue-400 text-sm font-semibold transition-all duration-500 ease-in-out shadow-md"
  title="Modifier le rendez-vous"
>
  <span role="img" aria-label="edit">✏️</span>
  <span>Modifier</span>
</button>


                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Modifier le Rendez-vous
            </h2>

            <div className="space-y-4">
              {/* Patient Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient
                </label>
                <div className="border p-2 rounded bg-gray-50">
                  {editing.patient?.name} {editing.patient?.prenom}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={editing.date}
                  onChange={(e) =>
                    setEditing({ ...editing, date: e.target.value })
                  }
                  className="border w-full p-2 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heure
                </label>
                <select
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="border w-full p-2 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description / Motif
                </label>
                <textarea
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                  className="border w-full p-2 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows="3"
                  placeholder="Description de la consultation..."
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut actuel
                </label>
                <div className={`px-3 py-1 rounded text-sm inline-block ${
                  editing.status === "APPROVED"
                    ? "bg-green-100 text-green-800"
                    : editing.status === "PENDING"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {editing.status}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6 pt-4 border-t">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>

              <button
                onClick={updateRDV}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}