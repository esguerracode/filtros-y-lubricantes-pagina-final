import React from 'react';
import { CONTACT_INFO } from '../constants';
import { Star, ShieldCheck, Users, MapPin, Building2 } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="bg-white lg:pt-24">
      {/* Hero Section with Team Background */}
      <section className="bg-[#054a29] text-white py-32 md:py-48 text-center relative overflow-hidden">
        {/* Background Image with Opacity */}
        <div className="absolute inset-0 opacity-15">
          <img
            src="/fotos/DSC_1264-topaz-denoise-faceai.jpg"
            alt="Equipo Filtros y Lubricantes del Llano S.A.S"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="absolute inset-0 opacity-40 bg-gradient-to-b from-[#054a29] via-[#054a29]/70 to-[#054a29]"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

        <div className="max-w-4xl mx-auto px-4 relative z-10 pt-12 md:pt-0">
          <div className="inline-block bg-[#d4e157] text-[#054a29] font-black px-8 py-3 rounded-2xl mb-12 rotate-[-1deg] shadow-2xl text-[10px] md:text-xs uppercase tracking-[0.4em]">
            CALIDAD Y SERVICIO • MÁS DE 10 AÑOS
          </div>
          <h1 className="text-4xl md:text-9xl font-black mb-8 leading-tight uppercase tracking-tighter text-white">
            QUIÉNES <span className="text-[#d4e157]">SOMOS</span>
          </h1>
          <p className="text-sm md:text-3xl text-emerald-100/80 leading-relaxed max-w-3xl mx-auto font-medium">
            Impulsando el motor del Llano Colombiano con la experiencia de expertos certificados y tecnología de vanguardia.
          </p>
        </div>

        {/* Updated Background Tractor silhouette with image */}
        <div className="absolute -bottom-20 -right-20 opacity-10 w-[500px] h-[500px] rotate-[-15deg]">
          <img src="/logos/logo.png" className="w-full h-full object-contain grayscale invert" alt="" />
        </div>
      </section>

      {/* Core Values / Real Story */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="order-2 lg:order-1">
            <div className="flex items-center gap-4 mb-8 text-[#054a29]">
              <Building2 size={32} className="text-[#d4e157]" />
              <span className="font-black uppercase tracking-[0.4em] text-sm">Nuestra Sede Principal</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-10 leading-[0.9] uppercase tracking-tighter">
              UBICACIÓN <span className="text-[#054a29]">ESTRATÉGICA</span> EN PUERTO GAITÁN
            </h2>
            <div className="space-y-8 text-gray-600 leading-relaxed text-xl font-medium">
              <p>
                En <strong>{CONTACT_INFO.name}</strong>, entendemos que el tiempo es el recurso más valioso en la industria. Nuestra sede en Puerto Gaitán cuenta con el inventario más robusto de filtros y lubricantes industriales en el departamento del Meta.
              </p>
              <div className="bg-gray-50 p-10 border-l-[12px] border-[#054a29] rounded-3xl italic font-black text-gray-800 shadow-xl leading-relaxed text-2xl">
                "{CONTACT_INFO.bio}"
              </div>
              <p>
                Somos el punto de referencia para maquinaria <strong>John Deere, Caterpillar, Case y transporte pesado</strong> en el Meta. Nuestra logística está optimizada para que su operación nunca pierda el ritmo.
              </p>
            </div>
          </div>
          <div className="order-1 lg:order-2 relative">
            <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.15)] border-[12px] border-white transform rotate-2">
              <img src="/fotos/DSC_1233-topaz-denoise.jpg" alt="Sede Puerto Gaitán" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-12 -left-12 bg-black p-10 rounded-[3rem] shadow-2xl flex items-center gap-6 max-w-[340px] transform -rotate-3">
              <div className="bg-[#d4e157] p-4 rounded-2xl text-black shrink-0">
                <MapPin size={36} />
              </div>
              <div className="text-sm font-black text-white uppercase leading-tight tracking-widest">
                CARRERA 10 #15-03<br />
                PUERTO GAITÁN • META
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section con Fotos Reales */}
      <section className="py-32 bg-gray-50 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-24">
            <div className="flex justify-center mb-6">
              <img src="/logos/isotipo.png" className="w-24 h-24 object-contain opacity-30 grayscale" alt="Isotipo" />
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-8 uppercase tracking-tighter">NUESTRO <span className="text-[#054a29]">EQUIPO</span> HUMANO</h2>
            <p className="text-gray-500 text-2xl font-bold italic tracking-tight">"Comprometidos con la excelencia y la energía que conecta tu mundo."</p>
          </div>

          {/* Galería de Fotos del Equipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            <div className="relative group overflow-hidden rounded-3xl shadow-xl">
              <div className="aspect-square w-full">
                <img src="/fotos/DSC_1258.jpg" alt="Equipo" loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-3xl shadow-xl">
              <div className="aspect-square w-full">
                <img src="/fotos/DSC_1279-topaz-denoise-enhance-faceai-sharpen.jpg" alt="Equipo" loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-3xl shadow-xl">
              <div className="aspect-square w-full">
                <img src="/fotos/DSC_1346-topaz-denoise.jpg" alt="Equipo" loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-3xl shadow-xl">
              <div className="aspect-square w-full">
                <img src="/fotos/DSC_1264-topaz-denoise-faceai.jpg" alt="Equipo" loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-3xl shadow-xl">
              <div className="aspect-square w-full">
                <img src="/fotos/DSC_1230-topaz-denoise-sharpen.jpg" alt="Equipo" loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-3xl shadow-xl">
              <div className="aspect-square w-full">
                <img src="/fotos/DSC_1237-topaz-denoise.jpg" alt="Equipo" loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7">
              <div className="relative group">
                <div className="aspect-video rounded-[4rem] overflow-hidden shadow-2xl border-[16px] border-white group-hover:scale-[1.02] transition-transform duration-700">
                  <img src="/fotos/DSC_1237-topaz-denoise.jpg" alt="Tienda Física" className="w-full h-full object-cover" />
                </div>
                <div className="absolute top-10 left-10 bg-[#054a29] text-[#d4e157] px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-[0.4em] shadow-2xl">
                  NUESTRA SEDE
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 space-y-10">
              <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-gray-100 hover:translate-y-[-10px] transition-all">
                <h3 className="text-3xl font-black mb-4 text-[#054a29] uppercase tracking-tighter">YEISSON VELEZ</h3>
                <p className="text-[#d4e157] font-black uppercase tracking-[0.4em] text-sm mb-8 bg-[#054a29] inline-block px-4 py-1 rounded-lg">Gerente general</p>
                <p className="text-gray-500 leading-relaxed font-bold text-lg">Como director, lidero un equipo élite de asesores técnicos que brinda soluciones integrales en lubricación y filtración industrial compleja.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands & Infrastructure */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="relative h-[500px] rounded-[4rem] overflow-hidden group shadow-2xl transform -rotate-1 hover:rotate-0 transition-all duration-700">
              <img src="/fotos/LLANTAS BRIDGESTONE.webp" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Bodega Llantas" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-12">
                <h4 className="text-white text-4xl font-black uppercase tracking-tighter">LLANTAS BRIDGESTONE</h4>
                <p className="text-[#d4e157] font-black uppercase tracking-[0.4em] text-xs mt-4">Resistencia extrema para carga pesada</p>
              </div>
            </div>
            <div className="relative h-[500px] rounded-[4rem] overflow-hidden group shadow-2xl transform rotate-1 hover:rotate-0 transition-all duration-700">
              <img src="/fotos/baterias.webp" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Bodega Baterías" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-12">
                <h4 className="text-white text-4xl font-black uppercase tracking-tighter">BATERÍAS MAC & DUNCAN</h4>
                <p className="text-[#d4e157] font-black uppercase tracking-[0.4em] text-xs mt-4">La energía que mueve el llano</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-24 bg-[#054a29] text-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-16 md:gap-32">
          <div className="flex items-center gap-6">
            <ShieldCheck size={56} className="text-[#d4e157]" />
            <div className="text-left">
              <p className="font-black text-3xl uppercase tracking-tighter leading-none">ORIGINAL</p>
              <p className="text-xs font-black text-[#d4e157] uppercase tracking-[0.3em] mt-2">Garantía certificada</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Star size={56} className="text-[#d4e157]" />
            <div className="text-left">
              <p className="font-black text-3xl uppercase tracking-tighter leading-none">EXPERTO</p>
              <p className="text-xs font-black text-[#d4e157] uppercase tracking-[0.3em] mt-2">Asesoría técnica 10/10</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
