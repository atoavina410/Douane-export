// src/components/ProfileCard.jsx
import { useState } from "react";

export default function ProfileCard({ user, onSave }) {
  const [form, setForm] = useState({
    nom: user.nom_utilisateur,
    prenom: user.prenom_utilisateur,
    email: user.mail || "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = (e) => {
    e.preventDefault();

    onSave({
      nom_utilisateur: form.nom,
      prenom_utilisateur: form.prenom,
      mail: form.email,
    });
  };

  return (
    <div className="bg-white shadow rounded-xl p-6 max-w-3xl">
      <h2 className="text-xl font-semibold mb-4 text-douane-primary">
        Informations personnelles
      </h2>

      <form onSubmit={submit} className="grid grid-cols-2 gap-4">

        {/* MATRICULE (lecture seule) */}
        <div>
          <label className="font-semibold text-sm">Matricule</label>
          <input
            value={user.matricule}
            disabled
            className="input-field bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* LOGIN (lecture seule) */}
        <div>
          <label className="font-semibold text-sm">Login</label>
          <input
            value={user.login}
            disabled
            className="input-field bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* NOM */}
        <div>
          <label className="font-semibold text-sm">Nom</label>
          <input
            name="nom"
            value={form.nom}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        {/* PRÉNOM */}
        <div>
          <label className="font-semibold text-sm">Prénom</label>
          <input
            name="prenom"
            value={form.prenom}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        {/* EMAIL */}
        <div className="col-span-2">
          <label className="font-semibold text-sm">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        {/* ROLE (lecture seule) */}
        <div>
          <label className="font-semibold text-sm">Rôle</label>
          <input
            value={user.id_role?.role_nom}
            disabled
            className="input-field bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* DIRECTION / SERVICE */}
        <div>
          <label className="font-semibold text-sm">Direction / Service</label>
          <input
            value={`${user.id_service?.id_direction?.direction_nom || ""} / ${user.id_service?.service_nom || ""}`}
            disabled
            className="input-field bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* ACTIONS */}
        <div className="col-span-2 flex justify-end mt-6">
          <button
            type="submit"
            className="px-6 py-2 bg-douane-primary text-white rounded-lg hover:bg-douane-secondary"
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
}
