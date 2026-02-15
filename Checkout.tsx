
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import { ArrowLeft, Send, MapPin, User, Phone, Check, ShieldCheck, Lock, AlertCircle, Truck, Sparkles } from 'lucide-react';
import { generateWompiPaymentLink, prepareWompiTransaction } from '../services/wompiService';
import { preparePayUPayload, PAYU_CHECKOUT_URL } from '../services/payuService';
import type { WompiCustomer, WompiShippingAddress } from '../services/wompiService';
import ValidatedInput from '../components/ValidatedInput';

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

    // 1. FLUJO WOMPI (ÚNICO MÉTODO ACTIVO)
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

    const subtotal = Math.round(totalPrice / 1.19);
    const iva = totalPrice - subtotal;

    const transactionData = prepareWompiTransaction(
      cart,
      totalPrice, // El total enviado a Wompi ya incluye IVA
      customerData,
      shippingAddress
    );

    localStorage.setItem('last_order_ref', transactionData.reference);
    const paymentLink = generateWompiPaymentLink(transactionData);
    window.location.href = paymentLink;
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
                <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">Finalizar Compra</h1>
                <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                  <ShieldCheck size={18} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Pago con Wompi</span>
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

            <div className="pt-8 border-t border-gray-100">
              {/* Desglose de Costos - Transparencia Total */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-bold">${Math.round(totalPrice / 1.19).toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span className="font-medium">IVA (19%)</span>
                  <span className="font-bold">${(totalPrice - Math.round(totalPrice / 1.19)).toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-emerald-600 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                  <span className="flex items-center gap-2 text-sm font-bold">
                    <Truck size={16} /> Envío Nacional
                  </span>
                  <span className="font-black text-base uppercase tracking-wider">Gratis</span>
                </div>

                <div className="h-px bg-gray-100 my-4"></div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-900 text-sm font-black uppercase tracking-widest">Total a Pagar</span>
                  <span className="text-4xl font-black text-[#054a29] tracking-tighter">
                    ${totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Desktop Button */}
              <button
                type="submit"
                disabled={Object.keys(errors).length > 0 || isSubmitting}
                className="hidden md:flex w-full bg-[#d4e157] text-[#054a29] py-6 rounded-2xl font-black text-xl items-center justify-center gap-3 hover:bg-[#054a29] hover:text-white transition-all active:scale-95 shadow-xl uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? 'Procesando...' : (
                  <>Pagar con Wompi <Send size={24} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>

              {/* Mobile Sticky Button */}
              <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-2xl">
                <button
                  type="submit"
                  disabled={Object.keys(errors).length > 0 || isSubmitting}
                  className="w-full bg-[#d4e157] text-[#054a29] py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 active:scale-95 shadow-xl uppercase tracking-widest disabled:opacity-50"
                >
                  {isSubmitting ? 'Procesando...' : `Pagar $${totalPrice.toLocaleString()}`}
                </button>
              </div>
            </div>
          </form>

          {/* Trust Signals & Reassurance */}
          <div className="px-8 md:px-12 pb-10 space-y-8">
            <div className="flex flex-wrap items-center justify-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
              <img src="https://checkout.wompi.co/img/pse.png" alt="PSE" className="h-6" />
              <img src="https://checkout.wompi.co/img/nequi.png" alt="Nequi" className="h-4" />
              <img src="https://checkout.wompi.co/img/visa.png" alt="Visa" className="h-4" />
              <img src="https://checkout.wompi.co/img/mastercard.png" alt="Mastercard" className="h-6" />
            </div>

            <div className="bg-emerald-50/30 rounded-3xl p-6 border border-emerald-100/50 text-center">
              <p className="text-xs text-emerald-800 font-bold flex items-center justify-center gap-2 mb-2 uppercase tracking-widest">
                <ShieldCheck size={16} /> Transacción Protegida
              </p>
              <p className="text-[10px] text-emerald-700/70 leading-relaxed font-semibold">
                Tus datos financieros viajan encriptados por SSL de 256 bits.<br />
                Procesado de forma segura bajo estándares PCI DSS por Wompi (Grupo Bancolombia).
              </p>
            </div>
          </div>
        </div>

        {/* Footer Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-[10px] text-gray-400 font-black uppercase tracking-widest opacity-40">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} /> <span>Garantía Original</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck size={14} /> <span>Envío Express</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock size={14} /> <span>Pago Seguro</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
