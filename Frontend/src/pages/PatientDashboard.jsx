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
    if (!date || !description || !medecinId) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    const medId = Number(medecinId);
    if (isNaN(medId)) {
      alert("ID du médecin invalide !");
      return;
    }

    const body = { date, description };

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

  // UPDATE RDV
  const handleUpdate = async () => {
    try {
      const body = { date, description };

      const res = await fetch(`${API_URL_RDV}/${editingRdv.id}`, {
        method: "PATCH",
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
    setDescription("");
    setMedecinId("");
    setShowModal(true);
  };

  const openEditForm = (rdv) => {
    setEditingRdv(rdv);
    setDate(rdv.date);
    setDescription(rdv.description);
    setMedecinId(rdv.medecin?.id || "");
    setShowModal(true);
  };

  const closeForm = () => {
    setShowModal(false);
    setEditingRdv(null);
    setDate("");
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

            <input
              type="date"
              className="border p-2 w-full mb-3"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <input
              type="text"
              placeholder="Description"
              className="border p-2 w-full mb-3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {!editingRdv && (
              <select
                className="border p-2 w-full mb-4"
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
            )}

            {editingRdv && (
              <div className="mb-4">
                <strong>Status: </strong> {renderStatusBadge(editingRdv.status)}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                className="bg-red-300 px-4 py-2 rounded hover:bg-red-400"
                onClick={closeForm}
              >
                Annuler
              </button>

              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
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
