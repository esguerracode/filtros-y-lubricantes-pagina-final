
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="bg-brand-yellow/10 p-8 rounded-full mb-8 text-brand-yellow animate-bounce">
        <AlertTriangle size={80} />
      </div>
      <h1 className="text-6xl font-black text-[#1B5E3B] mb-4">404</h1>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Oops! Página no encontrada</h2>
      <p className="text-gray-500 mb-10 max-w-md mx-auto">
        Parece que el repuesto que buscas no está en esta ruta. ¡Vuelve al camino principal!
      </p>
      <Link to="/" className="bg-[#1B5E3B] text-white px-10 py-4 rounded-full font-bold shadow-xl hover:-translate-y-1 transition-all">
        Volver al Inicio
      </Link>
    </div>
  );
};

export default NotFound;
