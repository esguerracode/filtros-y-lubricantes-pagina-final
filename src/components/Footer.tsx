
import React from 'react';
import { Link } from 'react-router-dom';
import { CONTACT_INFO } from '../constants';
import { Instagram, Phone, MapPin, MessageCircle, ArrowRight } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-emerald-green text-white pt-24 pb-12 border-t border-white/10">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 mb-20">
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-4 mb-6">
              <img src="/logos/isotipo2.png" alt="Isotipo" className="w-16 h-16 object-contain" />
            </div>
            <h3 className="text-4xl font-black tracking-tighter uppercase leading-none">
              Filtros & <br /> Lubricantes <br /> <span className="text-[#d4e157]">del Llano S.A.S</span>
            </h3>
            <p className="text-white/40 text-lg leading-relaxed max-w-sm">
              Potenciando la industria de Puerto Gaitán con soluciones integrales en lubricación y filtración.
            </p>
            <div className="flex gap-6">
              <a href="#" className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#d4e157] hover:text-black transition-all">
                <Instagram size={20} />
              </a>
              <a href={CONTACT_INFO.officialLink} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#d4e157] hover:text-black transition-all">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-8">
            <h4 className="text-sm font-bold uppercase tracking-[0.3em] text-[#d4e157]">Mapa del sitio</h4>
            <ul className="space-y-4 text-lg">
              <li><Link to="/nosotros" className="hover:text-[#d4e157] transition-colors">Nosotros</Link></li>
              <li><Link to="/productos" className="hover:text-[#d4e157] transition-colors">Catálogo</Link></li>
              <li><Link to="/contacto" className="hover:text-[#d4e157] transition-colors">Contacto</Link></li>
              <li><Link to="/carrito" className="hover:text-[#d4e157] transition-colors">Mi Carrito</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <h4 className="text-sm font-bold uppercase tracking-[0.3em] text-[#d4e157]">Ubicación</h4>
            <ul className="space-y-6 text-white/60">
              <li className="flex items-start gap-4">
                <MapPin size={24} className="shrink-0 text-[#d4e157]" />
                <span className="text-lg leading-snug">{CONTACT_INFO.location}</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone size={24} className="shrink-0 text-[#d4e157]" />
                <span className="text-lg">{CONTACT_INFO.phone}</span>
              </li>
              <li className="pt-4">
                <Link to="/contacto" className="inline-flex items-center gap-3 text-white font-bold group">
                  Agendar Consulta Técnica <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-white/30 font-medium uppercase tracking-widest">
          <p>&copy; {new Date().getFullYear()} Filtros y Lubricantes del Llano S.A.S</p>
          <p>Hecho para Puerto Gaitán • Meta <span className="block md:inline md:ml-2 opacity-50 font-mono text-[10px]">v2.4 (Fix Confirmado)</span></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
