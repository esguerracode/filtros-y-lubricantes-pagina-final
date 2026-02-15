
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import { ArrowLeft, Send, MapPin, User, Phone, Check, ShieldCheck, Lock, AlertCircle, Truck, Sparkles } from 'lucide-react';
import { generateWompiPaymentLink, prepareWompiTransaction } from '../services/wompiService';
import type { WompiCustomer, WompiShippingAddress } from '../services/wompiService';

const Checkout: React.FC = () => {
  const { cart, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) return;
    setIsSubmitting(true);

    // Guardar datos de envío localmente para recuperar en success page
    localStorage.setItem('last_shipping', JSON.stringify(shippingData));

    // Preparar ciudad y departamento limpios
    const cleanCity = shippingData.ciudad.replace(/[.,]/g, '').trim();
    const cityParts = shippingData.ciudad.split(',');
    const department = cityParts.length > 1
      ? cityParts[1].replace(/[.,]/g, '').trim()
      : cleanCity;

    // FLUJO WOMPI
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

    const transactionData = prepareWompiTransaction(
      cart,
      totalPrice,
      customerData,
      shippingAddress
    );

    localStorage.setItem('last_order_ref', transactionData.reference);

    // USAR REDIRECCIÓN DIRECTA (Nuclear Option para confiabilidad absoluta)
    import('../services/wompiService').then(wompi => {
      console.log('🚀 Iniciando redirección a Wompi...');

      // Asegurar que la referencia es única
      transactionData.redirectUrl = window.location.origin + '/success'; // Forzar redirect explícito

      // Generar link y redirigir
      const paymentLink = wompi.generateWompiPaymentLink(transactionData);
      console.log('🔗 Link generado:', paymentLink);

      window.location.href = paymentLink;

    }).catch(err => {
      console.error('Error generando link Wompi:', err);
      alert('Error crítico al conectar con Wompi. Verifica tu conexión.');
      setIsSubmitting(false);
    });
  };

  const subtotal = Math.round(totalPrice / 1.19);
  const iva = totalPrice - subtotal;

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

            {/* Pasarela de Pago Única */}
            <div className="pt-8 border-t border-gray-100 space-y-4">
              <label className="flex items-center gap-2 text-[10px] font-black text-[#054a29] uppercase tracking-widest">
                <ShieldCheck size={14} /> Pasarela de Pago
              </label>
              <div className="p-6 rounded-3xl border-2 border-[#054a29] bg-emerald-50/50 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm uppercase tracking-tight">Wompi / Bancolombia</span>
                  <div className="w-5 h-5 rounded-full bg-[#054a29] flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                </div>
                <p className="text-[10px] font-bold text-gray-500 leading-relaxed">PSE, Nequi, Botón Bancolombia y Tarjetas.</p>
                <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all cursor-default">
                  <div className="flex gap-4 mt-3 grayscale opacity-60">
                    <img src="/images/assets/nequi.svg" alt="Nequi" className="h-6 object-contain" />
                    <img src="/images/assets/pse.svg" alt="PSE" className="h-6 object-contain" />
                    <img src="/images/assets/bancolombia.svg" alt="Bancolombia" className="h-6 object-contain" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
              {/* Desglose de Costos Premium */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                  <span>Subtotal ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})</span>
                  <span>
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                  <span className="flex items-center gap-1.5">
                    IVA (19%)
                    <AlertCircle size={14} className="text-gray-300" />
                  </span>
                  <span>
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(iva)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[#054a29] bg-emerald-50/50 px-4 py-2 rounded-xl border border-emerald-100/50">
                  <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                    <Truck size={14} /> Envío Nacional
                  </span>
                  <span className="font-black text-sm">GRATIS</span>
                </div>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-dashed border-gray-200"></div>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-1">Total a Pagar</span>
                    <span className="text-sm font-bold text-gray-400">IVA incluido</span>
                  </div>
                  <span className="text-5xl font-black text-[#054a29] tracking-tighter leading-none">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Botones de Pago */}
              <button
                type="submit"
                disabled={Object.keys(errors).length > 0 || isSubmitting}
                className="hidden md:flex w-full bg-[#d4e157] text-[#054a29] py-6 rounded-2xl font-black text-xl items-center justify-center gap-3 hover:bg-[#054a29] hover:text-white transition-all active:scale-95 shadow-xl uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? 'Procesando Pago...' : (
                  <>Pagar con Wompi <Send size={24} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>

              <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-2xl">
                <button
                  type="submit"
                  disabled={Object.keys(errors).length > 0 || isSubmitting}
                  className="w-full bg-[#d4e157] text-[#054a29] py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 active:scale-95 shadow-xl uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Procesando...' : (
                    <>Pagar {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(totalPrice)} <Send size={20} /></>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Trust Signals */}
          <div className="px-8 md:px-12 pb-12 pt-4 border-t border-gray-50 bg-gray-50/30">
            <div className="flex flex-wrap items-center justify-center gap-6 mb-8 mt-4">
              <div className="flex items-center gap-2 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                <ShieldCheck size={18} className="text-[#054a29]" /> PCI DSS Compliance
              </div>
              <div className="flex items-center gap-2 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                <Lock size={18} className="text-[#054a29]" /> SSL Encriptado
              </div>
            </div>

            <div className="flex items-center justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
              <img src="https://wompi.co/wp-content/uploads/2021/08/logo-nequi.png" alt="Nequi" className="h-5" />
              <img src="https://wompi.co/wp-content/uploads/2021/08/logo-pse.png" alt="PSE" className="h-5" />
              <img src="https://www.bancolombia.com/wps/wcm/connect/649d682e-9d82-4d92-887e-d39f4f46937e/logo-bancolombia.png?MOD=AJPERES&CVID=mO.L8D8" alt="Bancolombia" className="h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
