import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import { ArrowLeft, MapPin, User, Phone, Check, ShieldCheck, Lock, AlertCircle, Truck } from 'lucide-react';
import { generateWompiPaymentLink, createOrderAndGetWompiData, openWompiWidget } from '../services/wompiService';
import type { WompiCustomer, WompiShippingAddress } from '../services/wompiService';

const Checkout: React.FC = () => {
  const { cart, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // State con persistencia desde localStorage
  const [shippingData, setShippingData] = useState(() => {
    const saved = localStorage.getItem('checkout_draft');
    const defaultData = {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      tipoDocumento: 'CC',
      documento: '',
      ciudad: '',
      direccion: '',
      notas: ''
    };
    if (!saved) return defaultData;
    try {
      const parsed = JSON.parse(saved);
      // Ensure apellido exists if loading from old draft
      return { ...defaultData, ...parsed };
    } catch {
      return defaultData;
    }
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
      const cleanPhone = value.replace(/\D/g, '');
      if (cleanPhone && cleanPhone.length !== 10) {
        newErrors.telefono = 'El número de celular debe tener 10 dígitos';
      } else {
        delete newErrors.telefono;
      }
    }
    if (name === 'nombre' || name === 'apellido') {
      if (value && value.trim().length < 2) {
        newErrors[name] = 'Campo muy corto';
      } else {
        delete newErrors[name];
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

    // Final phone number validation
    const phone = shippingData.telefono.replace(/\D/g, '');
    if (phone.length !== 10) {
      setErrors(prev => ({ ...prev, telefono: 'El número de celular debe tener 10 dígitos' }));
      alert('El número de celular debe tener 10 dígitos (Ej: 3001234567)');
      return;
    }

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

      const customerData: WompiCustomer = {
        email: shippingData.email,
        fullName: `${shippingData.nombre.trim()} ${shippingData.apellido.trim()}`,
        phoneNumber: phone,
        phoneNumberPrefix: '+57',
        legalId: shippingData.documento,
        legalIdType: shippingData.tipoDocumento as any
      };

      const shippingAddress: WompiShippingAddress = {
        address: shippingData.direccion,
        city: cleanCity,
        department: department,
        country: 'CO'
      };

      const transactionData = await createOrderAndGetWompiData(
        cart,
        customerData,
        shippingAddress
      );

      localStorage.setItem('last_order_ref', transactionData.reference);

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
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${step.active ? 'bg-[#054a29] text-white shadow-lg' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
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

        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 mb-12">
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
                  <User size={14} className="text-[#054a29]" /> Nombre
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej: Juan"
                  className={`w-full px-6 py-4 bg-gray-50/50 border rounded-2xl focus:ring-4 outline-none transition-all ${errors.nombre ? 'border-red-300 focus:ring-red-100' : 'border-gray-100 focus:ring-emerald-50 focus:border-emerald-200'}`}
                  value={shippingData.nombre}
                  onChange={e => {
                    setShippingData({ ...shippingData, nombre: e.target.value });
                    validateField('nombre', e.target.value);
                  }}
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <User size={14} className="text-[#054a29]" /> Apellido
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej: Pérez"
                  className={`w-full px-6 py-4 bg-gray-50/50 border rounded-2xl focus:ring-4 outline-none transition-all ${errors.apellido ? 'border-red-300 focus:ring-red-100' : 'border-gray-100 focus:ring-emerald-50 focus:border-emerald-200'}`}
                  value={shippingData.apellido}
                  onChange={e => {
                    setShippingData({ ...shippingData, apellido: e.target.value });
                    validateField('apellido', e.target.value);
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <ShieldCheck size={14} className="text-[#054a29]" /> Tipo de Documento
                </label>
                <select
                  className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 outline-none transition-all appearance-none cursor-pointer font-medium text-gray-700"
                  value={shippingData.tipoDocumento}
                  onChange={e => setShippingData({ ...shippingData, tipoDocumento: e.target.value })}
                >
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="NIT">NIT</option>
                  <option value="PP">Pasaporte</option>
                  <option value="CE">Cédula de Extranjería</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <ShieldCheck size={14} className="text-[#054a29]" /> Número de Documento
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej: 10203040"
                  className={`w-full px-6 py-4 bg-gray-50/50 border rounded-2xl focus:ring-4 outline-none transition-all ${errors.documento ? 'border-red-300 focus:ring-red-100' : 'border-gray-100 focus:ring-emerald-50 focus:border-emerald-200'}`}
                  value={shippingData.documento}
                  onChange={e => {
                    setShippingData({ ...shippingData, documento: e.target.value });
                    if (e.target.value.length < 5) {
                      setErrors(prev => ({ ...prev, documento: 'Documento muy corto' }));
                    } else {
                      setErrors(prev => {
                        const { documento, ...rest } = prev;
                        return rest;
                      });
                    }
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <User size={14} className="text-[#054a29]" /> Correo Electrónico
                </label>
                <input
                  required
                  type="email"
                  placeholder="ejemplo@correo.com"
                  className={`w-full px-6 py-4 bg-gray-50/50 border rounded-2xl focus:ring-4 outline-none transition-all ${errors.email ? 'border-red-300 focus:ring-red-100' : 'border-gray-100 focus:ring-emerald-50 focus:border-emerald-200'}`}
                  value={shippingData.email}
                  onChange={e => {
                    setShippingData({ ...shippingData, email: e.target.value });
                    validateField('email', e.target.value);
                  }}
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <Phone size={14} className="text-[#054a29]" /> WhatsApp / Celular
                </label>
                <input
                  required
                  type="tel"
                  maxLength={10}
                  placeholder="Ej: 3001234567"
                  className={`w-full px-6 py-4 bg-gray-50/50 border rounded-2xl focus:ring-4 outline-none transition-all ${errors.telefono ? 'border-red-300 focus:ring-red-100' : 'border-gray-100 focus:ring-emerald-50 focus:border-emerald-200'}`}
                  value={shippingData.telefono}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setShippingData({ ...shippingData, telefono: val });
                    validateField('telefono', val);
                  }}
                />
                {errors.telefono && <p className="text-red-500 text-[10px] font-bold uppercase tracking-tighter mt-1">{errors.telefono}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

            {/* Selector de Método de Pago "High Trust" */}
            <div className="pt-8 border-t border-gray-100 space-y-6">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-black text-[#054a29] uppercase tracking-widest">
                  <ShieldCheck size={16} /> Pago Seguro SSL
                </label>
                <div className="flex gap-2 opacity-60 grayscale hover:grayscale-0 transition-all">
                  <img src="https://wompi.com/assets/img/nequi.svg" alt="Nequi" className="h-6 object-contain" />
                  <img src="https://wompi.com/assets/img/pse.svg" alt="PSE" className="h-6 object-contain" />
                  <img src="https://wompi.com/assets/img/bancolombia.svg" alt="Bancolombia" className="h-6 object-contain" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="relative p-6 rounded-2xl border-2 text-left flex flex-col gap-4 group border-[#054a29] bg-emerald-50/30 cursor-default transition-all shadow-sm hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1 shadow-sm border border-gray-100">
                        <img src="/assets/payments/wompi.png" alt="Wompi Logo" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">Wompi Bancolombia</span>
                        <span className="text-xs text-gray-500 font-medium">Tarjetas, PSE, Nequi y Efectivo</span>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center border-[#054a29] bg-[#054a29]">
                      <Check size={14} className="text-white" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-white/50 p-2 rounded-lg">
                    <span className="flex items-center gap-1"><Lock size={10} /> Cifrado 256-bit</span>
                    <span className="w-px h-3 bg-gray-300"></span>
                    <span className="flex items-center gap-1"><ShieldCheck size={10} /> PCI DSS Certified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary styled as a receipt */}
            <div className="pt-6 border-t border-gray-100">
              <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm text-gray-600 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})</span>
                  <span className="font-medium">${totalPrice.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-[#054a29]">
                  <span className="flex items-center gap-1"><Truck size={14} /> Envío</span>
                  <span className="font-bold">GRATIS</span>
                </div>
              </div>

              <div className="flex items-end justify-between mb-6">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total a Pagar</span>
                <span className="text-3xl font-black text-[#054a29]">${totalPrice.toLocaleString('es-CO')}</span>
              </div>

              {/* Main Action */}
              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={Object.keys(errors).length > 0 || isSubmitting}
                  className="hidden md:flex w-full bg-[#8cc63f] text-[#054a29] py-5 px-8 rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-[#7ab62f] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-lime-200/50 items-center justify-center gap-3 disabled:opacity-70 disabled:grayscale disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Procesando...' : (
                    <>Pagar de forma segura <Lock size={20} /></>
                  )}
                </button>

                {/* Mobile Sticky Button */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                  <button
                    type="submit"
                    disabled={Object.keys(errors).length > 0 || isSubmitting}
                    className="w-full bg-[#8cc63f] text-[#054a29] py-4 rounded-xl font-black text-base uppercase tracking-widest shadow-lg shadow-lime-200/50 flex items-center justify-center gap-2 disabled:opacity-70 disabled:grayscale"
                  >
                    {isSubmitting ? 'Procesando...' : (
                      <>
                        Pagar ${totalPrice.toLocaleString('es-CO')} <Lock size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Manual Fallback Link */}
              <div id="wompi-fallback" className="hidden mt-6 bg-amber-50 border border-amber-100 p-4 rounded-xl text-center animate-fade-in-up">
                <p className="text-amber-800 text-xs font-bold uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                  <AlertCircle size={14} />
                  ¿Problemas con el botón de pago?
                </p>
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  const link = localStorage.getItem('last_wompi_link');
                  if (link) window.location.href = link;
                  else alert('Por favor intenta hacer clic en "Pagar" nuevamente para generar el enlace.');
                }} className="inline-block bg-[#054a29] text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-emerald-900 transition-colors">
                  Usar Enlace Seguro Alternativo
                </a>
              </div>

              <p className="text-center text-[10px] text-gray-400 mt-6 max-w-xs mx-auto flex items-center justify-center gap-2">
                <Lock size={10} />
                Tus datos viajan encriptados y no son almacenados.
              </p>
            </div>
          </form>

          {/* Trust Signals Section */}
          <div className="px-8 md:px-12 pb-10">
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

            <div className="space-y-3">
              <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Métodos de Pago Aceptados</p>
              <div className="flex flex-wrap items-center justify-center gap-4 opacity-60 grayscale hover:grayscale-0 transition-all">
                <img src="https://wompi.com/assets/img/nequi.svg" alt="Nequi" className="h-6 w-auto" />
                <img src="https://wompi.com/assets/img/pse.svg" alt="PSE" className="h-6 w-auto" />
                <img src="https://wompi.com/assets/img/bancolombia.svg" alt="Bancolombia" className="h-6 w-auto" />
                <img src="/assets/payments/wompi.png" alt="Wompi" className="h-6 w-auto" />
              </div>
            </div>

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
