// src/pages/PatientRendezVous.jsx
import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../contexts/AuthContext";

const API_URL_MED = "http://localhost:8083/api/medecins";
const API_URL_RDV = "http://localhost:8083/api/rendezvous";

export default function PatientRendezVous() {
  const { user: patient } = useAuth();

  const [rdvs, setRdvs] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [description, setDescription] = useState("");
  const [medecinId, setMedecinId] = useState("");
  const [editingRdv, setEditingRdv] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Load medecins
  useEffect(() => {
    fetchMedecins();
  }, []);

  const fetchMedecins = async () => {
    try {
      const res = await fetch(API_URL_MED);
      if (res.ok) {
        const data = await res.json();
        setMedecins(data.filter(u => u.role === "MEDECIN"));
      }
    } catch (e) {
      console.error("Erreur load med:", e);
    }
  };

  // Load RDVs for THIS patient
  useEffect(() => {
    if (!patient?.id) return;
    fetchRdv();
  }, [patient]);

  const fetchRdv = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL_RDV}/patient/${patient.id}`);
      if (res.ok) {
        const data = await res.json();
        setRdvs(Array.isArray(data) ? data : []);
      } else if (res.status === 204) {
        setRdvs([]);
      }
    } catch (e) {
      console.error("Erreur load rdv:", e);
    } finally {
      setLoading(false);
    }
  };

  // ADD RDV
  const handleAdd = async () => {
    if (!date || !time || !description || !medecinId) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    const medId = Number(medecinId);
    if (isNaN(medId)) {
      alert("ID du médecin invalide !");
      return;
    }

    const body = { date, time, description };

    try {
      const res = await fetch(`${API_URL_RDV}/add/${patient.id}/${medId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Erreur add:", text);
        alert("Erreur lors de l'ajout du rendez-vous.");
        return;
      }

      const newRdv = await res.json();
      setRdvs([...rdvs, newRdv]);
      closeForm();
    } catch (error) {
      console.error("Erreur add:", error);
    }
  };

  // UPDATE RDV - CORRECTED
  const handleUpdate = async () => {
    try {
      const body = { date, time, description };

      const res = await fetch(`${API_URL_RDV}/${editingRdv.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        await fetchRdv();
        closeForm();
      } else {
        alert("Erreur lors de la modification");
      }
    } catch (e) {
      console.error("Erreur update:", e);
    }
  };

  // DELETE RDV
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce rendez-vous ?")) return;

    try {
      const res = await fetch(`${API_URL_RDV}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRdvs(rdvs.filter(r => r.id !== id));
      } else {
        alert("Erreur suppression.");
      }
    } catch (e) {
      console.error("Erreur:", e);
    }
  };

  // Open / Close Modal Form
  const openAddForm = () => {
    setEditingRdv(null);
    setDate("");
    setTime("09:00");
    setDescription("");
    setMedecinId("");
    setShowModal(true);
  };

  const openEditForm = (rdv) => {
    setEditingRdv(rdv);
    setDate(rdv.date);
    setTime(rdv.time || "09:00");
    setDescription(rdv.description);
    setMedecinId(rdv.medecin?.id || "");
    setShowModal(true);
  };

  const closeForm = () => {
    setShowModal(false);
    setEditingRdv(null);
    setDate("");
    setTime("09:00");
    setDescription("");
    setMedecinId("");
  };

  if (!patient) {
    return (
      <DashboardLayout>
        <p>Chargement du patient...</p>
      </DashboardLayout>
    );
  }

  // Helper to display status badge
  const renderStatusBadge = (status) => {
    let colorClass = "bg-gray-500";
    if (status === "PENDING") colorClass = "bg-yellow-500";
    else if (status === "APPROVED") colorClass = "bg-green-500";
    else if (status === "REFUSED") colorClass = "bg-red-500";

    return (
      <span className={`px-2 py-1 rounded text-white ${colorClass}`}>
        {status}
      </span>
    );
  };

  // Generate time slots (every 30 minutes from 08:00 to 18:00)
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

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Mes rendez-vous</h1>
        <button
          onClick={openAddForm}
          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        >
          Nouveau rendez-vous
        </button>
      </div>

      <div className="card p-4">
        {loading ? (
          <p>Chargement...</p>
        ) : rdvs.length === 0 ? (
          <p className="text-slate-500">Aucun rendez-vous.</p>
        ) : (
          <ul className="space-y-3">
            {rdvs.map((r) => (
              <li
                key={r.id}
                className="border p-3 rounded flex justify-between items-center"
              >
                <div>
                  <div>
                    <strong>Description :</strong> {r.description}
                  </div>
                  <div>
                    <strong>Médecin :</strong> {r.medecin?.name} (
                    {r.medecin?.specialte})
                  </div>
                  <div>
                    <strong>Date :</strong> {r.date} à {r.time || "09:00"}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {renderStatusBadge(r.status)}
                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    onClick={() => openEditForm(r)}
                  >
                    Modifier
                  </button>

                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    onClick={() => handleDelete(r.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">
              {editingRdv ? "Modifier rendez-vous" : "Nouveau rendez-vous"}
            </h2>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  className="border p-2 w-full rounded"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heure
                </label>
                <select
                  className="border p-2 w-full rounded"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                placeholder="Description du rendez-vous"
                className="border p-2 w-full rounded"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {!editingRdv && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Médecin
                </label>
                <select
                  className="border p-2 w-full rounded"
                  value={medecinId}
                  onChange={(e) => setMedecinId(e.target.value)}
                >
                  <option value="">-- Choisir un médecin --</option>
                  {medecins.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.specialte || "Pas de spécialité"}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {editingRdv && (
              <div className="mb-4">
                <strong>Status: </strong> {renderStatusBadge(editingRdv.status)}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                className="bg-red-300 px-4 py-2 rounded hover:bg-red-400 transition-colors"
                onClick={closeForm}
              >
                Annuler
              </button>

              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                onClick={editingRdv ? handleUpdate : handleAdd}
              >
                {editingRdv ? "Enregistrer" : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}