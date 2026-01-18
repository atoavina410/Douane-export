import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { FiUser, FiLock, FiArrowRight } from "react-icons/fi";
import { useAuth } from "../Context/AuthContext";

export default function Login() {
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login: authlogin } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginValue || !password) {
      alert("Remplissez tous les champs");
      return;
    }

    try {
      const res = await api.post("auth/login/", {
        login: loginValue,
        password,
      });

      authlogin(res.data); // 🔥 POINT CRITIQUE
      navigate("/dashboard");
    } catch (err) {
      alert(
        err.response?.data?.detail ||
        "Identifiants incorrects"
      );
    }
  };

  return (
    // 1. GRAND BACKGROUND IMAGE GLOBAL
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center p-4"
      style={{
        backgroundImage: "url('/image/background.png')", // Ton grand background
      }}
    >
      {/* Overlay sombre global pour le fond */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-0" />

      {/* CARTE PRINCIPALE */}
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* --- COLONNE GAUCHE : FORMULAIRE (Fond Blanc Opaque) --- */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
            
          {/* Titre et Intro */}
          <div className="mb-8">
             <h2 className="text-3xl font-bold text-gray-900">Connectez-vous</h2>
             <p className="text-gray-500 text-sm mt-2">
               Renseignez vos informations ci-dessous.
             </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Champ Login */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Login</label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 transition-all">
                <FiUser className="mr-3 text-gray-400" />
                <input
                  type="text"
                  className="w-full bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none"
                  placeholder="Votre identifiant"
                  value={loginValue}
                  onChange={(e) => setLoginValue(e.target.value)}
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Mot de passe</label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-green-500 transition-all">
                <FiLock className="mr-3 text-gray-400" />
                <input
                  type="password"
                  className="w-full bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Bouton Connexion */}
            <button
              type="submit"
              className="w-full bg-black text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-transform transform hover:scale-[1.01] shadow-lg mt-4"
            >
              Connexion <FiArrowRight />
            </button>
            
            {/* Mot de passe oublié */}
            <div className="text-center mt-4">
                <Link to="/forgot-password" title="Mot de passe oublié" className="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors">
                   Mot de passe oublié ?
                </Link>
            </div>
          </form>
        </div>

        {/* --- COLONNE DROITE : ENTIÈREMENT TRANSPARENTE (Glassmorphism Sombre) --- */}
        <div className="hidden md:flex w-1/2 relative flex-col overflow-hidden text-white bg-black/20 backdrop-blur-md">
  
        {/* 1. ZONE DU LOGO (30% de la hauteur) - Texte et logo en blanc/clair */}
        {/* Le background par défaut est maintenant transparent (bg-black/20) */}
          <div className="h-[30%] flex flex-col items-center justify-center p-4">
     
        {/* Logo Douane Centré */}
            <img 
              src="/image/douane.png" 
              alt="Logo Douane" 
       // Assure que l'image est claire sur le fond sombre
              className="max-h-full h-auto w-auto max-w-[100px] mb-1 filter brightness-150" 
            />
            <h4 className="text-sm font-extrabold text-white">FADINTSARANANA</h4>
            <p className="text-[11px] text-gray-200">⚜️ 1820 ⚜️</p>
          </div>

        {/* 2. ZONE DU TEXTE (70% de la hauteur) - Texte en blanc */}
        {/* Le background est le même transparent (bg-black/20) */}
          <div className="h-[70%] p-8 md:p-12 flex flex-col justify-center relative">
    
        {/* Dé gradé pour améliorer le contraste du texte blanc sur le fond flou/transparent */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-0"/>
    
            <div className="relative z-10">
         {/* Décoration (Ligne verte claire) */}
              <div className="w-12 h-1 bg-green-400 mb-6 rounded-full"></div> 

        {/* Les deux lignes de titre */}
                <h3 className="text-3xl font-extrabold leading-snug mb-3">
                    Direction Générale  <br/> de la Douane.
                </h3>
                <p className="text-md text-gray-200 font-light max-w-sm">
                    Service de la Valeur et de l'Origine
              </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}