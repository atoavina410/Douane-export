// src/components/QuickActions.jsx
import React from "react";

export default function QuickActions({ onImport, onExtract }) {
  return (
    <div className="flex gap-3">
      <button onClick={onImport} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Importer (Excel)</button>
      <button onClick={onExtract} className="bg-white border px-4 py-2 rounded hover:bg-gray-50">Extraire depuis SYDONIA</button>
    </div>
  );
}
