
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import { ArrowLeft, Send, MapPin, User, Phone, Check, ShieldCheck, Lock, AlertCircle, Truck, Sparkles } from 'lucide-react';
import { generateWompiPaymentLink, createOrderAndGetWompiData, openWompiWidget } from '../services/wompiService';
import type { WompiCustomer, WompiShippingAddress } from '../services/wompiService';
import ValidatedInput from '../components/ValidatedInput';

const Checkout: React.FC = () => {
  const { cart, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  // const [paymentMethod, setPaymentMethod] = useState<'wompi' | 'payu'>('wompi');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State con persistencia desde localStorage
  const [shippingData, setShippingData] = useState(() => {
    const saved = localStorage.getItem('checkout_draft');
    return saved ? JSON.parse(saved) : {
      nombre: '',
      email: '',
      telefono: '',
      ciudad: '',
      direccion: '',
      notas: ''
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Persistir datos del formulario en localStorage
  useEffect(() => {
    localStorage.setItem('checkout_draft', JSON.stringify(shippingData));
  }, [shippingData]);

  if (cart.length === 0) {
    navigate('/carrito');
    return null;
  }

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };
    if (name === 'telefono') {
      const cleanPhone = value.replace(/\s/g, '');
      if (cleanPhone && !/^[0-9]{10}$/.test(cleanPhone)) {
        newErrors.telefono = 'Ingresa un número válido de 10 dígitos';
      } else {
        delete newErrors.telefono;
      }
    }
    if (name === 'nombre') {
      if (value && value.length < 3) {
        newErrors.nombre = 'El nombre es muy corto';
      } else {
        delete newErrors.nombre;
      }
    }
    if (name === 'email') {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors.email = 'Email inválido';
      } else {
        delete newErrors.email;
      }
    }
    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) return;
    setIsSubmitting(true);

    try {
      // Guardar datos de envío localmente para recuperar en success page
      localStorage.setItem('last_shipping', JSON.stringify(shippingData));

      // Preparar ciudad y departamento limpios
      const cleanCity = shippingData.ciudad.replace(/[.,]/g, '').trim();
      const cityParts = shippingData.ciudad.split(',');
      const department = cityParts.length > 1
        ? cityParts[1].replace(/[.,]/g, '').trim()
        : cleanCity;

      // FLUJO WOMPI ÚNICO
      const customerData: WompiCustomer = {
        email: shippingData.email,
        fullName: shippingData.nombre,
        phoneNumber: shippingData.telefono.replace(/\D/g, ''),
        phoneNumberPrefix: '+57'
      };

      const shippingAddress: WompiShippingAddress = {
        address: shippingData.direccion,
        city: cleanCity,
        department: department,
        country: 'CO'
      };

      // NEW ASYNC FLOW
      const transactionData = await createOrderAndGetWompiData(
        cart,
        customerData,
        shippingAddress
      );

      localStorage.setItem('last_order_ref', transactionData.reference);

      // Usar el Widget directamente
      // const { openWompiWidget } = await import('../services/wompiService'); // Removed redundant dynamic import
      console.log('🔹 Starting Wompi Widget flow with:', transactionData);

      // Generate and save manual link just in case
      const manualLink = generateWompiPaymentLink(transactionData);
      localStorage.setItem('last_wompi_link', manualLink);

      // Show fallback button
      const fallbackEl = document.getElementById('wompi-fallback');
      if (fallbackEl) fallbackEl.classList.remove('hidden');

      openWompiWidget(transactionData);

    } catch (error: any) {
      console.error('Checkout Error:', error);
      alert('Hubo un error al crear la orden. Por favor intenta nuevamente.');
      setIsSubmitting(false);
    }
  };


  return (
    <div className="pt-0 lg:pt-32 min-h-screen bg-gray-50/50 pb-32">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative max-w-md mx-auto">
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-0">
              <div className="h-full bg-[#054a29] transition-all duration-700" style={{ width: '66%' }} />
            </div>

            {[
              { label: 'Carrito', icon: <Check size={18} />, active: true, done: true },
              { label: 'Envío', content: '2', active: true, done: false },
              { label: 'Pago', content: '3', active: true, done: false }
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${step.active ? 'bg-[#054a29] text-white shadow-lg' : 'bg-white border-2 border-gray-200 text-gray-400'
                  }`}>
                  {step.done ? <Check size={20} /> : (step.content || idx + 1)}
                </div>
                <span className={`text-[10px] uppercase font-black mt-2 tracking-widest ${step.active ? 'text-[#054a29]' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate('/carrito')}
          className="flex items-center gap-2 text-gray-400 hover:text-[#054a29] font-black uppercase text-[10px] tracking-widest mb-6 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver al Carrito
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-[#054a29] p-8 md:p-10 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">Datos de Envío</h1>
                <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                  <ShieldCheck size={18} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Pago Seguro Wompi</span>
                </div>
              </div>
              <p className="text-emerald-50/60 font-medium text-sm">Información requerida para facturación y envío.</p>
            </div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <User size={14} className="text-[#054a29]" /> Nombre Completo
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  className={`w-full px-6 py-4 bg-gray-50/50 border rounded-2xl focus:ring-4 outline-none transition-all ${errors.nombre ? 'border-red-300 focus:ring-red-100' : 'border-gray-100 focus:ring-emerald-50 focus:border-emerald-200'
                    }`}
                  value={shippingData.nombre}
                  onChange={e => {
                    setShippingData({ ...shippingData, nombre: e.target.value });
                    validateField('nombre', e.target.value);
                  }}
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <User size={14} className="text-[#054a29]" /> Correo Electrónico
                </label>
                <input
                  required
                  type="email"
                  placeholder="ejemplo@correo.com"
                  className={`w-full px-6 py-4 bg-gray-50/50 border rounded-2xl focus:ring-4 outline-none transition-all ${errors.email ? 'border-red-300 focus:ring-red-100' : 'border-gray-100 focus:ring-emerald-50 focus:border-emerald-200'
                    }`}
                  value={shippingData.email}
                  onChange={e => {
                    setShippingData({ ...shippingData, email: e.target.value });
                    validateField('email', e.target.value);
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <Phone size={14} className="text-[#054a29]" /> WhatsApp / Teléfono
                </label>
                <input
                  required
                  type="tel"
                  placeholder="Ej: 314 000 0000"
                  className={`w-full px-6 py-4 bg-gray-50/50 border rounded-2xl focus:ring-4 outline-none transition-all ${errors.telefono ? 'border-red-300 focus:ring-red-100' : 'border-gray-100 focus:ring-emerald-50 focus:border-emerald-200'
                    }`}
                  value={shippingData.telefono}
                  onChange={e => {
                    setShippingData({ ...shippingData, telefono: e.target.value });
                    validateField('telefono', e.target.value);
                  }}
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <MapPin size={14} className="text-[#054a29]" /> Ciudad / Municipio
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej: Villavicencio, Meta"
                  className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 outline-none transition-all"
                  value={shippingData.ciudad}
                  onChange={e => setShippingData({ ...shippingData, ciudad: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                <Truck size={14} className="text-[#054a29]" /> Dirección Exacta
              </label>
              <input
                required
                type="text"
                placeholder="Ej: Calle 10 # 5-20, Barrio Centro"
                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 outline-none transition-all"
                value={shippingData.direccion}
                onChange={e => setShippingData({ ...shippingData, direccion: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Notas Adicionales (Opcional)</label>
              <textarea
                rows={3}
                placeholder="Instrucciones especiales para la entrega..."
                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 outline-none transition-all resize-none"
                value={shippingData.notas}
                onChange={e => setShippingData({ ...shippingData, notas: e.target.value })}
              />
            </div>

            {/* Selector de Método de Pago "Perfect Checkout" */}
            <div className="pt-8 border-t border-gray-100 space-y-6">
              <label className="flex items-center gap-2 text-[10px] font-black text-[#054a29] uppercase tracking-widest">
                <Sparkles size={14} /> Método de Pago Seguro
              </label>
              <div className="grid grid-cols-1 gap-4">
                {/* Wompi Option (Default & Only) */}
                <div
                  className={`relative p-6 rounded-3xl border-2 text-left flex flex-col gap-3 group border-[#054a29] bg-emerald-50/50 cursor-default`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm uppercase tracking-tight">Wompi / Bancolombia</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center border-[#054a29] bg-[#054a29]`}>
                      <Check size={12} className="text-white" />
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 leading-relaxed">PSE, Nequi, Botón Bancolombia y Tarjetas Débito/Crédito.</p>
                  <div className="flex items-center gap-2 mt-auto grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                    <img src="https://wompi.co/wp-content/uploads/2021/08/logo-nequi.png" alt="Nequi" className="h-4" />
                    <img src="https://wompi.co/wp-content/uploads/2021/08/logo-pse.png" alt="PSE" className="h-4" />
                    <img src="https://brandslogos.com/wp-content/uploads/images/large/bancolombia-logo.png" alt="Bancolombia" className="h-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
              {/* Desglose de Costos - Transparencia Total */}
              <div className="space-y-3 mb-8">
                {/* Subtotal */}
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Subtotal ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})</span>
                  <span className="font-bold">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(totalPrice)}</span>
                </div>

                {/* Envío Gratis */}
                <div className="flex justify-between items-center text-emerald-600">
                  <span className="flex items-center gap-2 text-sm">
                    <Truck size={16} />
                    Envío Nacional
                  </span>
                  <span className="font-black text-base">GRATIS</span>
                </div>

                {/* IVA */}
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>IVA</span>
                  <span>Incluido</span>
                </div>

                {/* Separator */}
                <div className="h-px bg-gray-200 my-4"></div>

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm font-black uppercase tracking-wide">Total a Pagar</span>
                  <span className="text-4xl font-black text-[#054a29] tracking-tighter">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(totalPrice)}
                  </span>
                </div>

                {/* Trust Badge */}
                <div className="bg-emerald-50 rounded-2xl p-4 flex items-center gap-3 border border-emerald-100">
                  <ShieldCheck size={20} className="text-emerald-600" />
                  <span className="text-sm text-emerald-800 font-semibold">Pago 100% seguro con Wompi (PCI DSS Level 1)</span>
                </div>
              </div>

              {/* Desktop Button */}
              <button
                type="submit"
                disabled={Object.keys(errors).length > 0}
                className="hidden md:flex w-full bg-[#d4e157] text-[#054a29] py-6 rounded-2xl font-black text-xl items-center justify-center gap-3 hover:bg-emerald-green hover:text-white transition-all active:scale-95 shadow-xl uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Pagar de forma segura <Send size={24} />
              </button>

              {/* Manual Fallback if Widget fails */}
              <div id="wompi-fallback" className="hidden text-center mt-4">
                <p className="text-sm text-gray-500 mb-2">¿No abre la ventana de pago?</p>
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  const link = localStorage.getItem('last_wompi_link');
                  if (link) window.location.href = link;
                  else alert('Por favor intenta hacer clic en "Pagar" nuevamente.');
                }} className="text-[#054a29] font-bold underline">
                  Clic aquí para pagar directamente en Wompi
                </a>
              </div>

              {/* Mobile Sticky Button */}
              <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-2xl">
                <button
                  type="submit"
                  disabled={Object.keys(errors).length > 0}
                  className="w-full bg-[#d4e157] text-[#054a29] py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 active:scale-95 shadow-xl uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pagar {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(totalPrice)} <Send size={20} />
                </button>
              </div>
            </div>
          </form>

          {/* Trust Signals Section - Estilo E-commerce Colombiano */}
          <div className="px-8 md:px-12 pb-10">
            {/* Security Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-500">
                <Lock size={16} className="text-emerald-600" />
                <span className="text-xs font-bold">Encriptación SSL</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span className="text-xs font-bold">PCI DSS Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <AlertCircle size={16} className="text-emerald-600" />
                <span className="text-xs font-bold">Compra Protegida</span>
              </div>
            </div>

            {/* Payment Methods Accepted */}
            <div className="space-y-3">
              <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Métodos de Pago Aceptados</p>
              <div className="flex flex-wrap items-center justify-center gap-4 opacity-60 grayscale hover:grayscale-0 transition-all">
                {/* Credit Cards */}
                <svg className="h-8" viewBox="0 0 48 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <rect width="48" height="32" rx="4" fill="#1434CB" />
                  <text x="24" y="20" fontSize="10" fontWeight="bold" fill="white" textAnchor="middle">VISA</text>
                </svg>
                <svg className="h-8" viewBox="0 0 48 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <rect width="48" height="32" rx="4" fill="#EB001B" />
                  <circle cx="18" cy="16" r="10" fill="#EB001B" />
                  <circle cx="30" cy="16" r="10" fill="#FF5F00" opacity="0.8" />
                </svg>
                <svg className="h-8" viewBox="0 0 48 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <rect width="48" height="32" rx="4" fill="#016FD0" />
                  <text x="24" y="20" fontSize="8" fontWeight="bold" fill="white" textAnchor="middle">AMEX</text>
                </svg>
                {/* Colombian Methods */}
                <svg className="h-8" viewBox="0 0 48 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <rect width="48" height="32" rx="4" fill="#00A859" />
                  <text x="24" y="20" fontSize="8" fontWeight="bold" fill="white" textAnchor="middle">PSE</text>
                </svg>
                <svg className="h-8" viewBox="0 0 48 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <rect width="48" height="32" rx="4" fill="#FF6B00" />
                  <text x="24" y="12" fontSize="6" fontWeight="bold" fill="white" textAnchor="middle">NEQUI</text>
                  <text x="24" y="22" fontSize="5" fill="white" textAnchor="middle">Bancolombia</text>
                </svg>
              </div>
            </div>

            {/* Reassuring Copy */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-xs text-gray-500 font-medium flex items-center justify-center gap-2">
                <Lock size={14} className="text-emerald-600" />
                <span><strong>Tus datos están protegidos</strong> con encriptación SSL de 256 bits</span>
              </p>
              <p className="text-xs text-gray-400">
                No almacenamos información de tarjetas. Procesado por Wompi (PCI DSS Level 1).
              </p>
            </div>
          </div>
        </div>

        {/* Footer Trust Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-[10px] text-gray-400 font-black uppercase tracking-widest opacity-60">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} />
            <span>Garantía 30 días</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck size={14} />
            <span>Envío Seguro</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock size={14} />
            <span>Datos Encriptados</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
