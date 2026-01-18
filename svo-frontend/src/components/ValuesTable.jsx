// src/components/ValuesTable.jsx
import React, { useState, useMemo } from "react";

function TableRow({ v }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm text-gray-700">{v.codesh}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{v.description_valeur}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{v.origine_produit}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{v.quantite}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{v.devise_utilisee}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{v.status}</td>
      <td className="px-4 py-3 text-right text-sm">
        <button className="px-2 py-1 text-sm bg-blue-50 text-blue-600 rounded">Voir</button>
      </td>
    </tr>
  );
}

export default function ValuesTable({ data = [] }) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(() => {
    if (!q) return data;
    return data.filter(
      (d) =>
        d.codesh?.toLowerCase().includes(q.toLowerCase()) ||
        d.description_valeur?.toLowerCase().includes(q.toLowerCase()) ||
        d.origine_produit?.toLowerCase().includes(q.toLowerCase())
    );
  }, [data, q]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-white shadow rounded p-4">
      <div className="flex items-center justify-between mb-4">
        <input
          type="search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="Rechercher par code SH, description, origine..."
          className="px-3 py-2 border rounded w-1/3"
          aria-label="Recherche valeurs"
        />
        <div className="text-sm text-gray-500">Résultats: {filtered.length}</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="text-left text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-2">Code SH</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Origine</th>
              <th className="px-4 py-2">Quantité</th>
              <th className="px-4 py-2">Devise</th>
              <th className="px-4 py-2">Statut</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((v) => (
              <TableRow key={v.id_valeur} v={v} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">Page {page} / {pageCount}</div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded" onClick={() => setPage(p => Math.max(1, p - 1))}>Préc</button>
          <button className="px-3 py-1 border rounded" onClick={() => setPage(p => Math.min(pageCount, p + 1))}>Suiv</button>
        </div>
      </div>
    </div>
  );
}
