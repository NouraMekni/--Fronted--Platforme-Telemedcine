import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";



const API_URL_RDV = "http://localhost:8083/api/rendezvous";

export default function Planning() {
  const { user: medecin } = useAuth();

  const [selectedDate, setSelectedDate] = useState("");
  const [rdvs, setRdvs] = useState([]);
  const [editing, setEditing] = useState(null); // ⭐ NEW

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

  // ⭐ Update RDV (for modifier)
  const updateRDV = async () => {
    try {
      const res = await fetch(`${API_URL_RDV}/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });

      if (res.ok) {
        setEditing(null);
        fetchRDVs();
      } else {
        alert("Erreur modification RDV");
      }
    } catch (e) {
      console.error(e);
    }
  };

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
                  <div className="text-lg font-medium text-primary-600">
                    {r.date} — {r.time || "—"}
                  </div>
                  <div>
                    <div className="font-medium">
                      {r.patient?.name} {r.patient?.prenom}
                    </div>
                    <div className="text-sm text-slate-500">
                      {r.description}
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
                    <>
                      <button
                        onClick={() => updateStatus(r.id, "APPROVED")}
                        className="text-green-600 text-sm"
                      >
                        Approuver
                      </button>

                      <button
                        onClick={() => updateStatus(r.id, "REFUSED")}
                        className="text-red-600 text-sm"
                      >
                        Refuser
                      </button>
                    </>
                  )}

                  {/* ⭐ Modifier button */}
                  <button
                    className="text-primary-600 text-sm"
                    onClick={() => setEditing(r)}
                  >
                    Modifier
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ⭐ EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h2 className="text-xl font-semibold mb-4">
              Modifier Rendez-vous
            </h2>

            <input
              type="date"
              value={editing.date}
              onChange={(e) =>
                setEditing({ ...editing, date: e.target.value })
              }
              className="border w-full mb-2 p-2 rounded"
            />


            <textarea
              value={editing.description}
              onChange={(e) =>
                setEditing({ ...editing, description: e.target.value })
              }
              className="border w-full mb-3 p-2 rounded"
            />

            <div className="flex justify-between">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 border rounded"
              >
                Annuler
              </button>

              <button
                onClick={updateRDV}
                className="px-4 py-2 bg-primary-600 text-white rounded"
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
