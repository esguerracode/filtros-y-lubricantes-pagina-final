
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { CONTACT_INFO } from '../constants';

const WhatsAppButton: React.FC = () => {
  return (
    <a
      href={CONTACT_INFO.officialLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all group"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle size={32} />
      <span className="absolute right-full mr-3 bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block border border-gray-100">
        ¿Cómo podemos ayudarte?
      </span>
    </a>
  );
};

export default WhatsAppButton;
