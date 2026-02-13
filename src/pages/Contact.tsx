import React, { useState, useEffect } from 'react';
import { CONTACT_INFO } from '../constants';
import { Phone, MapPin, MessageCircle, Send, Mail, Clock, ShieldCheck, Sparkles, Zap, Users, CheckCircle2, ArrowRight } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  });

  // Real-time Urgency Logic: Mocking dynamic slots for 2026 UX trend
  const [slotsRemaining, setSlotsRemaining] = useState(3);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (slotsRemaining > 1) setSlotsRemaining(prev => prev - 1);
    }, 45000); // Simulate scarcity over time
    return () => clearTimeout(timer);
  }, [slotsRemaining]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const message = `📞 NUEVA CONSULTA TÉCNICA
-----------------------------------
*Nombre*: ${formData.nombre}
*Teléfono*: ${formData.telefono}
*Email*: ${formData.email}
-----------------------------------
*Mensaje*:
${formData.mensaje}
-----------------------------------
_Enviado desde el formulario de contacto_`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodedMessage}`;

    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');

    // Limpiar formulario
    setFormData({ nombre: '', email: '', telefono: '', mensaje: '' });
  };

  const handleWhatsApp = () => {
    window.open(CONTACT_INFO.officialLink, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] lg:pt-24">
      {/* Dynamic Urgency Bar */}
      <div className="bg-emerald-950 text-white py-3 overflow-hidden whitespace-nowrap relative border-b border-emerald-800">
        <div className="flex animate-marquee items-center gap-12 text-[10px] font-black uppercase tracking-[0.3em]">
          <span className="flex items-center gap-2"><Zap className="text-brand-yellow" size={12} fill="currentColor" /> Soporte Técnico Prioritario Activo</span>
          <span className="flex items-center gap-2 text-emerald-400"><CheckCircle2 size={12} /> Reducción inmediata de downtime</span>
          <span className="flex items-center gap-2 text-brand-yellow"><Sparkles size={12} /> Disponibilidad limitada hoy</span>
          {/* Duplicate for seamless marquee */}
          <span className="flex items-center gap-2"><Zap className="text-brand-yellow" size={12} fill="currentColor" /> Soporte Técnico Prioritario Activo</span>
          <span className="flex items-center gap-2 text-emerald-400"><CheckCircle2 size={12} /> Reducción inmediata de downtime</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">

          {/* Left Column: Urgency & Trust */}
          <div className="lg:col-span-5 space-y-12">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-yellow/10 text-emerald-900 text-xs font-black uppercase tracking-widest mb-6 border border-brand-yellow/20">
                <Users size={14} className="text-emerald-950" /> Canal para Empresas y Flotas
              </div>
              <h1 className="text-4xl md:text-8xl font-[1000] text-gray-950 mb-8 tracking-tighter leading-[0.85] uppercase">
                Expertos al <span className="text-emerald-700">Rescate.</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-lg leading-relaxed font-medium mb-12">
                Soporte técnico y suministros en todo el **Meta y Casanare**. No dejes que tu operación se detenga. Garantizamos asesoría de ingeniería en filtros y lubricación en tiempo récord.
              </p>
            </div>

            {/* Fast Channels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-between p-6 bg-emerald-50 rounded-3xl hover:bg-emerald-100 transition-all group"
              >
                <div className="text-left">
                  <p className="text-[10px] font-black text-emerald-900/40 uppercase tracking-widest">WhatsApp</p>
                  <p className="font-bold text-emerald-900">SOS Técnico</p>
                </div>
                <MessageCircle className="text-emerald-600 group-hover:scale-110 transition-transform" />
              </button>
              <a
                href={`tel:${CONTACT_INFO.phone}`}
                className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl hover:bg-gray-100 transition-all group"
              >
                <div className="text-left">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Llamada</p>
                  <p className="font-bold text-gray-900">{CONTACT_INFO.phone}</p>
                </div>
                <Phone className="text-gray-400 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Right Column: Form with Scarcity */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 md:p-14 rounded-[4rem] shadow-[0_40px_100px_rgba(6,78,59,0.08)] border border-emerald-50 relative">

              {/* Floating Scarcity Badge */}
              <div className="absolute -top-6 right-10 bg-emerald-950 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 animate-pulse">
                <div className="w-2 h-2 bg-brand-yellow rounded-full"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Solo {slotsRemaining} cupos prioritarios
                </span>
              </div>

              <div className="relative z-10">
                <h2 className="text-4xl font-[1000] text-gray-950 mb-4 uppercase tracking-tighter">
                  Solicitar <span className="text-emerald-700 italic">Prioridad 1</span>
                </h2>
                <p className="text-gray-500 mb-10 font-medium text-lg">
                  Completa este formulario para saltar la fila y recibir atención técnica inmediata.
                </p>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Empresa / Nombre</label>
                      <input
                        required
                        type="text"
                        className="w-full px-8 py-5 bg-gray-50/50 border border-gray-100 rounded-[2rem] focus:ring-4 focus:ring-emerald-50 focus:border-brand-yellow outline-none transition-all font-bold text-gray-950 placeholder:text-gray-300"
                        placeholder="Ingresa tu nombre o empresa"
                        value={formData.nombre}
                        onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Teléfono Directo</label>
                      <input
                        required
                        type="tel"
                        className="w-full px-8 py-5 bg-gray-50/50 border border-gray-100 rounded-[2rem] focus:ring-4 focus:ring-emerald-50 focus:border-brand-yellow outline-none transition-all font-bold text-gray-950 placeholder:text-gray-300"
                        placeholder="Ej: 314 000 0000"
                        value={formData.telefono}
                        onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Tu Mensaje (Sencillo y directo)</label>
                    <textarea
                      required
                      rows={4}
                      className="w-full px-8 py-5 bg-gray-50/50 border border-gray-100 rounded-[2rem] focus:ring-4 focus:ring-emerald-50 focus:border-brand-yellow outline-none transition-all font-bold text-gray-950 placeholder:text-gray-300 resize-none"
                      placeholder="Ej: Necesito 20 filtros para tractor John Deere urgente..."
                      value={formData.mensaje}
                      onChange={e => setFormData({ ...formData, mensaje: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-950 text-white py-8 rounded-[2.5rem] font-[1000] text-xl flex items-center justify-center gap-4 hover:bg-emerald-900 hover:shadow-[0_20px_50px_rgba(6,78,59,0.3)] transition-all active:scale-[0.97] group"
                  >
                    RECLAMAR ATENCIÓN TÉCNICA
                    <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                  </button>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={20} className="text-emerald-500" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Datos Encriptados</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock size={20} className="text-brand-yellow" fill="currentColor" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Respuesta en {'<'} 15 min</span>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Strategic Map with Location Context */}
        <div className="mt-32 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white px-10 py-6 rounded-full shadow-2xl border border-gray-100 flex items-center gap-4">
            <div className="bg-red-500 w-3 h-3 rounded-full animate-ping"></div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-950">Nuestra Sede Logística Principal</span>
          </div>
          <div className="rounded-[4rem] overflow-hidden shadow-2xl border-[12px] border-white h-[500px] relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.2488488906776!2d-71.25634!3d4.163366!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f3f3f3f3f3f3f%3A0x8e3f3f3f3f3f3f3f!2sCarrera%2010%20%2315%20-%2003%2C%20Puerto%20Gait%C3%A1n%2C%20Meta!5e0!3m2!1ses!2sco!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="filter grayscale-[0.3] contrast-[1.2]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
