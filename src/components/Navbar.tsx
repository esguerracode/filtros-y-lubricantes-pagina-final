
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from './CartContext';
import { ShoppingCart, Menu, X, ArrowRight, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems } = useCart();
  const location = useLocation();

  const [lastScrollY, setLastScrollY] = useState(0);
  const [showNavbar, setShowNavbar] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);

      // Hide/Show logic: Hide when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Bloqueo de scroll cuando el menú está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('menu-open');
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('menu-open');
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('menu-open');
    };
  }, [isOpen]);

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Nosotros', path: '/nosotros' },
    { name: 'Productos', path: '/productos' },
    { name: 'Contacto', path: '/contacto' },
  ];

  return (
    <nav
      className={`sticky lg:fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled || isOpen
        ? 'bg-emerald-950/95 backdrop-blur-2xl py-3 border-b border-white/10 shadow-2xl'
        : 'bg-emerald-950/60 backdrop-blur-xl py-6 border-b border-white/5'
        } ${isOpen ? 'h-auto overflow-visible !bg-emerald-950/98' : ''} ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group relative z-50">
          <div className="h-10 md:h-12 flex items-center justify-center transition-all duration-500 group-hover:scale-110">
            <img src="/logos/isotipo2.png" alt="Filtros y Lubricantes Logo" className="h-full w-auto object-contain drop-shadow-lg" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-[1000] text-sm md:text-base leading-none tracking-tighter uppercase lg:grayscale group-hover:grayscale-0 transition-all">Filtros & Lubricantes</span>
            <span className="text-brand-yellow font-[1000] text-[10px] md:text-xs leading-none tracking-[0.2em] uppercase">del Llano S.A.S</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center space-x-2 bg-white/5 backdrop-blur-md p-1.5 rounded-full border border-white/10 shadow-inner">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${location.pathname === link.path
                ? 'bg-white text-emerald-950 shadow-xl'
                : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 md:gap-5 relative z-50">
          <Link
            to="/carrito"
            className={`relative p-3 rounded-2xl transition-all duration-500 group ${scrolled ? 'bg-white/5 border border-white/10' : 'bg-white/10 border border-white/20'
              } hover:bg-white hover:text-emerald-950`}
          >
            <ShoppingCart size={20} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#FF8C42] text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg border-2 border-emerald-950 animate-bounce">
                {totalItems}
              </span>
            )}
          </Link>

          <Link
            to="/productos"
            className="hidden sm:flex bg-brand-yellow hover:bg-white text-emerald-950 font-[1000] text-[10px] uppercase tracking-widest px-8 py-3.5 rounded-2xl transition-all shadow-xl hover:-translate-y-1 active:scale-95 border-b-4 border-emerald-800/10"
          >
            Ver Catálogo
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-3 rounded-2xl transition-all lg:hidden ${isOpen ? 'bg-white text-emerald-950' : 'bg-white/10 text-white'
              }`}
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isOpen ? <X size={24} strokeWidth={3} /> : <Menu size={24} strokeWidth={3} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Accordion Style */}
      <div
        className={`lg:hidden transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[600px] opacity-100 py-8' : 'max-h-0 opacity-0'
          } px-8`}
      >
        <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
          {navLinks.map((link, idx) => (
            <Link
              key={link.path}
              to={link.path}
              className={`group flex items-center justify-between p-4 rounded-2xl transition-all duration-500 ${location.pathname === link.path
                ? 'bg-white text-emerald-950 shadow-xl'
                : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              <span className="text-xl font-black tracking-tight uppercase">{link.name}</span>
              <ArrowRight
                className={`transition-all duration-500 ${location.pathname === link.path ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                  }`}
                size={20}
              />
            </Link>
          ))}

          <div className="mt-4 pt-6 border-t border-white/10 space-y-3">
            <Link
              to="/contacto"
              className="w-full bg-brand-yellow text-emerald-950 p-4 rounded-2xl font-black text-lg text-center uppercase tracking-widest block shadow-lg"
            >
              Consultar Ahora
            </Link>
            <div className="flex gap-4">
              <div className="flex-grow bg-white/5 p-4 rounded-2xl flex items-center gap-4 text-white/50 border border-white/5">
                <User size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Portal Clientes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
