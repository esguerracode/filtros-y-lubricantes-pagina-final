import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { useProducts } from '../hooks/useProducts';
import { CONTACT_INFO } from '../constants';
import { ArrowRight, ChevronDown, Play, Pause, Star, ShieldCheck, Zap, Truck, Settings, Droplets, Battery, Disc, MessageCircle } from 'lucide-react';

const Home: React.FC = () => {
  const { products: featuredProducts, loading } = useProducts();
  const [currentVideo, setCurrentVideo] = useState(0);
  const [videoPaused, setVideoPaused] = useState(false);

  const DESKTOP_VIDEOS = [
    '/videos/video1.mp4',
    '/videos/video3.mp4'
  ];

  const MOBILE_VIDEOS = [
    '/videos/video1-mobile.mp4', // Optimized version (suggested)
    '/videos/video3-mobile.mp4'  // Optimized version (suggested)
  ];

  const [isMobile, setIsMobile] = useState(false);
  const [videoSources, setVideoSources] = useState(DESKTOP_VIDEOS);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Fallback to desktop if mobile versions don't exist yet, 
      // but logic is ready for when they are provided
      setVideoSources(mobile ? MOBILE_VIDEOS : DESKTOP_VIDEOS);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const brandLogos = [
    { name: 'Bridgestone', logo: '/brands/bridgestone.png' },
    { name: 'Duncan', logo: '/brands/duncan.png' },
    { name: 'Shell', logo: '/brands/shell.png' },
    { name: 'Donaldson', logo: '/brands/donaldson.png' }
  ];

  // Tomar solo los primeros 6 productos para destacados
  const displayProducts = featuredProducts.slice(0, 6);

  useEffect(() => {
    if (videoPaused) return;
    const interval = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % videoSources.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [videoPaused, videoSources]);

  return (
    <div className="bg-white">
      <section className="relative w-full h-screen-ios lg:h-[calc(100vh+6rem)] flex items-center justify-center overflow-hidden bg-black -mt-20 md:-mt-24 lg:mt-0" aria-label="Hero Section Video">
        {videoSources.map((video, index) => (
          <video
            key={`${isMobile ? 'mo' : 'dt'}-${index}`}
            autoPlay
            loop
            muted
            playsInline
            preload={currentVideo === index ? "auto" : "none"}
            poster="/fotos/DSC_1233-topaz-denoise.jpg"
            onLoadedMetadata={(e) => !videoPaused && e.currentTarget.play()}
            onError={(e) => {
              // Fallback to desktop if mobile video fails to load
              if (isMobile) {
                const target = e.currentTarget;
                const source = target.querySelector('source');
                if (source) {
                  source.src = DESKTOP_VIDEOS[index];
                  target.load();
                }
              }
            }}
            className={`absolute inset-0 w-full h-full object-cover object-center scale-105 transition-opacity duration-[2000ms] ${currentVideo === index ? 'opacity-60' : 'opacity-0'
              } ${index !== currentVideo ? 'hidden' : 'block'}`}
          >
            <source src={video} type="video/mp4" />
          </video>
        ))}

        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black"></div>

        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 md:px-12 flex flex-col items-center justify-center h-full text-center pt-20 pb-24 lg:pt-24 lg:pb-0">
          <div className="w-full max-w-xs px-2 mb-1 md:mb-6 animate-fade-in-up">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 md:p-3 flex items-center justify-between shadow-2xl overflow-hidden group">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping absolute inset-0"></div>
                  <div className="relative w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                </div>
                <span className="text-[8px] md:text-[10px] font-black text-white/70 uppercase tracking-widest leading-none">Logística Activa</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[8px] md:text-[10px] font-black text-[#d4e157] uppercase tracking-widest leading-none">Despachos hoy</span>
                <Truck size={10} className="text-[#d4e157] md:w-3 md:h-3" />
              </div>
            </div>
          </div>

          <div className="mb-2 md:mb-6 animate-fade-in group">
            <img
              src="/Logos/isotipo 2 .png"
              alt="Filtros y Lubricantes Logo"
              className="w-auto object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-700 h-[80px] sx:h-[100px] sm:h-[180px] md:h-[220px]"
            />
          </div>

          <div className="max-w-5xl space-y-1 md:space-y-2 animate-fade-in">
            <p className="text-[#d4e157] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-[7px] md:text-[10px] border-b border-[#d4e157]/30 pb-0.5 inline-block">
              META & CASANARE • COLOMBIA • PUERTO GAITÁN - YOPAL
            </p>

            <h1 className="text-white text-[1.5rem] sm:text-5xl md:text-6xl lg:text-7xl font-[1000] leading-[0.95] tracking-tighter uppercase select-none drop-shadow-2xl">
              FILTROS & LUBRICANTES
              <br />
              <span className="text-[#d4e157] text-[1rem] sm:text-4xl md:text-5xl lg:text-6xl">del Llano S.A.S</span>
            </h1>

            {/* NEW: Trust Banner (Mobile Friendly) */}
            <div className="flex flex-wrap items-center justify-center gap-2 py-2 animate-fade-in-up delay-300">
              <span className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30 text-[8px] md:text-[9px] font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap">
                <ShieldCheck size={10} /> Empresa Certificada
              </span>
              <span className="flex items-center gap-1 px-3 py-1 bg-[#d4e157]/10 rounded-full border border-[#d4e157]/20 text-[8px] md:text-[9px] font-black text-[#d4e157] uppercase tracking-widest whitespace-nowrap">
                🔥 +12 entregas hoy
              </span>
            </div>

            <p className="text-white/80 text-xs md:text-base font-medium max-w-xl mx-auto drop-shadow-md leading-tight mt-2">
              Expertos en maquinaria agrícola e industrial, transporte pesado y vehículos de alto rendimiento. 🚜🚚
            </p>

            <div className="pt-4 md:pt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/productos"
                className="bg-[#d4e157] text-black hover:bg-white px-8 md:px-14 py-3 md:py-4 rounded-full font-black text-xs md:text-base transition-all shadow-xl uppercase tracking-widest active:scale-95 w-full sm:w-auto"
              >
                Ver Catálogo
              </Link>
              <Link
                to="/nosotros"
                className="text-white font-black text-xs md:text-base hover:text-[#d4e157] flex items-center justify-center gap-2 uppercase tracking-widest group px-4 py-2"
              >
                Nuestra Historia <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform md:w-5 md:h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Video Controls & Indicators */}
        <div className="absolute bottom-24 right-8 z-20 flex flex-col gap-4">
          <button
            onClick={() => setVideoPaused(!videoPaused)}
            aria-label={videoPaused ? "Reproducir video" : "Pausar video"}
            className="bg-white/10 backdrop-blur-md p-3 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-all border border-white/10"
          >
            {videoPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
          </button>
        </div>

        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {videoSources.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentVideo(index)}
              aria-label={`Ir al video ${index + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${currentVideo === index ? 'bg-[#d4e157] w-12' : 'bg-white/30 w-4'
                }`}
            />
          ))}
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/20">
          <ChevronDown size={32} />
        </div>
      </section>

      {/* Industrial Category Hub (New conversion driver) */}
      <section className="py-16 md:py-24 bg-white relative -mt-8 md:-mt-32 z-30 rounded-t-[3rem] md:rounded-none">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/productos" className="group bg-gradient-to-br from-[#054a29] to-[#033a20] p-8 md:p-10 rounded-[3rem] shadow-2xl hover:-translate-y-4 transition-all duration-500 flex flex-col justify-between border border-white/5 overflow-hidden relative min-h-[250px] md:min-h-[300px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[#d4e157]/10 transition-colors"></div>
              <div className="bg-[#d4e157] w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-black shadow-lg mb-6 md:mb-8 transform -rotate-12 group-hover:rotate-0 transition-transform">
                <Droplets size={24} className="md:w-7 md:h-7" />
              </div>
              <div>
                <h3 className="text-white text-2xl md:text-3xl font-black uppercase tracking-tighter mb-2">Lubricantes</h3>
                <p className="text-emerald-100/60 text-xs md:text-sm font-medium mb-4 md:mb-6">Protección extrema para maquinaria pesada.</p>
                <div className="flex items-center gap-2 text-[#d4e157] font-black text-xs uppercase tracking-widest">
                  Explorar <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>

            <Link to="/productos" className="group bg-white p-8 md:p-10 rounded-[3rem] shadow-xl hover:-translate-y-4 transition-all duration-500 flex flex-col justify-between border border-gray-100 overflow-hidden relative min-h-[250px] md:min-h-[300px]">
              <div className="bg-gray-100 w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-gray-900 shadow-sm mb-6 md:mb-8 transform rotate-6 group-hover:rotate-0 transition-transform group-hover:bg-[#d4e157] group-hover:text-black">
                <Settings size={24} className="md:w-7 md:h-7" />
              </div>
              <div>
                <h3 className="text-gray-900 text-2xl md:text-3xl font-black uppercase tracking-tighter mb-2">Filtros</h3>
                <p className="text-gray-400 text-xs md:text-sm font-medium mb-4 md:mb-6">Filtración de precisión OEM certificada.</p>
                <div className="flex items-center gap-2 text-emerald-green font-black text-xs uppercase tracking-widest group-hover:text-[#054a29]">
                  Explorar <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>

            <Link to="/productos" className="group bg-white p-8 md:p-10 rounded-[3rem] shadow-xl hover:-translate-y-4 transition-all duration-500 flex flex-col justify-between border border-gray-100 overflow-hidden relative min-h-[250px] md:min-h-[300px]">
              <div className="bg-gray-100 w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-gray-900 shadow-sm mb-6 md:mb-8 transform -rotate-6 group-hover:rotate-0 transition-transform group-hover:bg-[#d4e157] group-hover:text-black">
                <Battery size={24} className="md:w-7 md:h-7" />
              </div>
              <div>
                <h3 className="text-gray-900 text-2xl md:text-3xl font-black uppercase tracking-tighter mb-2">Baterías</h3>
                <p className="text-gray-400 text-xs md:text-sm font-medium mb-4 md:mb-6">Energía imparable para el campo.</p>
                <div className="flex items-center gap-2 text-emerald-green font-black text-xs uppercase tracking-widest group-hover:text-[#054a29]">
                  Explorar <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>

            <Link to="/productos" className="group bg-[#d4e157] p-8 md:p-10 rounded-[3rem] shadow-2xl hover:-translate-y-4 transition-all duration-500 flex flex-col justify-between border border-white/20 overflow-hidden relative min-h-[250px] md:min-h-[300px]">
              <div className="bg-black w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-[#d4e157] shadow-lg mb-6 md:mb-8 transform rotate-12 group-hover:rotate-0 transition-transform">
                <Disc size={24} className="md:w-7 md:h-7" />
              </div>
              <div>
                <h3 className="text-black text-2xl md:text-3xl font-black uppercase tracking-tighter mb-2">Llantas</h3>
                <p className="text-black/60 text-xs md:text-sm font-medium mb-4 md:mb-6">Resistencia Master en terrenos difíciles.</p>
                <div className="flex items-center gap-2 text-black font-black text-xs uppercase tracking-widest">
                  Explorar <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Alliance Bar */}
      <section className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-md text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[#d4e157]/20 text-emerald-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                <ShieldCheck size={14} />
                <span>Aliados de tu inversión</span>
              </div>
              <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter mb-4 leading-none">RESPALDO TÉCNICO <span className="text-[#054a29]">DIRECTO</span></h2>
              <p className="text-gray-500 font-medium leading-relaxed">No solo vendemos repuestos, aseguramos la operatividad de tu flota con marcas líderes mundiales.</p>
            </div>

            <div className="flex-1 w-full flex flex-wrap justify-center lg:justify-end gap-12 items-center grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100">
              {brandLogos.map((brand, idx) => (
                <div key={idx} className="flex flex-col items-center group">
                  <span className="font-black text-3xl text-gray-900 tracking-tighter group-hover:text-emerald-green transition-colors">{brand.name}</span>
                  <div className="h-0.5 w-0 group-hover:w-full bg-[#d4e157] transition-all duration-300"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Promo Banner "Paga 10 Lleva 11" (Custom for Agro) */}
      <section className="py-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="bg-gradient-to-r from-[#054a29] to-[#0a6d3d] rounded-[4rem] p-12 md:p-20 relative overflow-hidden flex flex-col md:flex-row items-center gap-12 shadow-[0_50px_100px_rgba(5,74,41,0.2)]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4e157]/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

            <div className="relative z-10 flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-sm text-[#d4e157] px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-[0.3em] mb-8">
                <Zap size={16} />
                ¡TEMPORADA DE COSECHA!
              </div>
              <h2 className="text-white text-4xl md:text-7xl font-[900] uppercase tracking-tighter leading-[0.9] mb-8">
                PAGA 10 <br />
                <span className="text-[#d4e157]">LLEVA 11</span>
              </h2>
              <p className="text-emerald-100/70 text-lg font-medium mb-10 max-w-xl">
                Asegura el suministro de tu flota con nuestra promoción exclusiva por volumen. Válido en filtración seleccionada John Deere y ACE.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <a href={CONTACT_INFO.officialLink} target="_blank" rel="noopener noreferrer" className="bg-[#d4e157] text-black px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white transition-all shadow-xl active:scale-95 flex items-center gap-3">
                  <MessageCircle size={18} /> Reclamar Promo
                </a>
              </div>
            </div>

            <div className="relative z-10 w-full md:w-1/3 aspect-square bg-white rounded-[4rem] p-8 shadow-2xl rotate-3 flex items-center justify-center">
              <div className="text-center">
                <div className="text-8xl font-black text-gray-900 leading-none">10<span className="text-emerald-green">+</span>1</div>
                <div className="text-sm font-black text-gray-400 uppercase tracking-widest mt-4">Unidades de Potencia</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Potencia del Llano (AI & Regional SEO Utility) */}
      <section className="py-24 bg-emerald-950 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-[#d4e157] rounded-full blur-[120px]"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500 rounded-full blur-[150px]"></div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-7xl font-[1000] uppercase tracking-tighter leading-[0.85] mb-8">
                POTENCIA <br />
                <span className="text-[#d4e157]">DEL LLANO</span>
              </h2>
              <p className="text-xl text-emerald-100/60 font-medium mb-12 max-w-xl">
                Somos el aliado estratégico de las flotas en el Meta y Casanare. Entendemos la exigencia de las trochas y el campo colombiano.
              </p>

              <div className="space-y-6">
                {[
                  { title: "Maquinaria Agrícola", desc: "Soporte total para tractores y cosechadoras en las zonas arroceras y palmeras de Aguazul, Maní y Puerto Gaitán." },
                  { title: "Transporte Pesado", desc: "Filtros y lubricantes certificados para tractomulas y flotas de carga pesada que recorren la ruta del petróleo." },
                  { title: "Sector Industrial", desc: "Soluciones de filtración de alta eficiencia para plantas de proceso y generadores en todo el Casanare." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#d4e157] group-hover:bg-[#d4e157] group-hover:text-black transition-all">
                      <Zap size={20} />
                    </div>
                    <div>
                      <h4 className="font-black uppercase tracking-widest text-sm mb-1">{item.title}</h4>
                      <p className="text-emerald-100/40 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-3xl p-10 md:p-16 rounded-[4rem] border border-white/10 shadow-2xl relative">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#d4e157]/20 rounded-full blur-3xl animate-pulse"></div>
              <h3 className="text-3xl font-black uppercase tracking-tighter mb-6">Expertos en <span className="text-[#d4e157]">Sintonía</span></h3>
              <p className="text-emerald-100/70 mb-10 font-medium italic">"Garantizamos que su maquinaria no se detenga. Conocemos cada filtro de cada marca en el mercado regional."</p>

              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
                <div>
                  <div className="text-4xl font-black text-[#d4e157] mb-2">+1500</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-emerald-100/30">Referencias en stock</div>
                </div>
                <div>
                  <div className="text-4xl font-black text-[#d4e157] mb-2">24/7</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-emerald-100/30">Soporte Técnico Especializado</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-white">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <h2 className="text-5xl md:text-7xl font-black text-black tracking-tighter uppercase">Destacados</h2>
            <Link to="/productos" className="text-emerald-green font-black flex items-center gap-2 hover:underline tracking-tight">
              Todos los productos <ArrowRight size={20} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <SkeletonLoader key={i} />
              ))}
            </div>
          ) : displayProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
              {displayProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">No hay productos disponibles</div>
          )}
        </div>
      </section>

    </div>
  );
};

export default Home;
