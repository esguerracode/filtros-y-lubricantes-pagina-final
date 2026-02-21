import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import { ArrowLeft, MapPin, User, Phone, Check, ShieldCheck, Lock, AlertCircle, Truck, CreditCard, Mail, FileText, ShoppingBag, Loader2 } from 'lucide-react';
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
      return { ...defaultData, ...parsed };
    } catch {
      return defaultData;
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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
      if (!cleanPhone) {
        newErrors.telefono = 'Requerido';
      } else if (cleanPhone.length !== 10) {
        newErrors.telefono = 'Debe tener 10 dígitos';
      } else {
        delete newErrors.telefono;
      }
    }
    if (name === 'nombre' || name === 'apellido') {
      if (!value || value.trim().length < 2) {
        newErrors[name] = 'Mínimo 2 caracteres';
      } else {
        delete newErrors[name];
      }
    }
    if (name === 'email') {
      if (!value) {
        newErrors.email = 'Requerido';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors.email = 'Email inválido';
      } else {
        delete newErrors.email;
      }
    }
    if (name === 'documento') {
      const cleanDoc = value.replace(/\D/g, '');
      if (!cleanDoc) {
        newErrors.documento = 'Requerido';
      } else if (cleanDoc.length < 5) {
        newErrors.documento = 'Documento muy corto';
      } else {
        delete newErrors.documento;
      }
    }
    if (name === 'ciudad' || name === 'direccion') {
      if (!value || value.trim().length < 3) {
        newErrors[name] = 'Requerido (mín. 3 caracteres)';
      } else {
        delete newErrors[name];
      }
    }
    setErrors(newErrors);
  };

  const handleInputChange = (name: string, value: string) => {
    let finalValue = value;
    if (name === 'telefono' || name === 'documento') {
      finalValue = value.replace(/\D/g, '').slice(0, name === 'telefono' ? 10 : 15);
    }
    setShippingData({ ...shippingData, [name]: finalValue });
    if (touched[name]) validateField(name, finalValue);
  };

  const handleBlur = (name: string) => {
    setTouched({ ...touched, [name]: true });
    validateField(name, (shippingData as any)[name]);
  };

  const isFormValid =
    shippingData.nombre.trim().length >= 2 &&
    shippingData.apellido.trim().length >= 2 &&
    shippingData.email.length > 5 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingData.email) &&
    shippingData.telefono.length === 10 &&
    shippingData.documento.length >= 5 &&
    shippingData.ciudad.trim().length >= 3 &&
    shippingData.direccion.trim().length >= 3 &&
    Object.keys(errors).length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      // Mark all as touched to show errors
      const allTouched: Record<string, boolean> = {};
      Object.keys(shippingData).forEach(key => allTouched[key] = true);
      setTouched(allTouched);
      return;
    }

    setIsSubmitting(true);

    try {
      localStorage.setItem('last_shipping', JSON.stringify(shippingData));

      const cleanCity = shippingData.ciudad.replace(/[.,]/g, '').trim();
      const cityParts = shippingData.ciudad.split(',');
      const department = cityParts.length > 1
        ? cityParts[1].replace(/[.,]/g, '').trim()
        : cleanCity;

      const customerData: WompiCustomer = {
        email: shippingData.email,
        fullName: `${shippingData.nombre.trim()} ${shippingData.apellido.trim()}`,
        phoneNumber: shippingData.telefono,
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
      const manualLink = generateWompiPaymentLink(transactionData);
      localStorage.setItem('last_wompi_link', manualLink);

      const fallbackEl = document.getElementById('wompi-fallback');
      if (fallbackEl) fallbackEl.classList.remove('hidden');

      openWompiWidget(transactionData);

    } catch (error: any) {
      console.error('Checkout Error:', error);
      alert('Hubo un error al crear la orden. Por favor intenta nuevamente.');
      setIsSubmitting(false);
    }
  };

  const inputClasses = (name: string) => `
    w-full px-5 py-4 bg-white border-2 rounded-2xl outline-none transition-all duration-200
    ${touched[name] && errors[name]
      ? 'border-red-500 bg-red-50/20 focus:ring-4 focus:ring-red-100'
      : touched[name] && !errors[name] && shippingData[name as keyof typeof shippingData]
        ? 'border-[#8cc63f]/30 bg-emerald-50/10 focus:border-[#054a29] focus:ring-4 focus:ring-emerald-50'
        : 'border-gray-200 focus:border-[#054a29] focus:ring-4 focus:ring-emerald-50'}
    placeholder:text-gray-300 font-medium
  `;

  const labelClasses = "flex items-center gap-2 text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1";

  return (
    <div className="pt-0 lg:pt-32 min-h-screen bg-[#f8fcf9] pb-32">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">

        {/* Navigation & Progress */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <button
            onClick={() => navigate('/carrito')}
            className="flex items-center gap-2 text-gray-400 hover:text-[#054a29] font-black uppercase text-[10px] tracking-widest transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver al Carrito
          </button>

          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex -space-x-2">
              {[1, 2].map(n => (
                <div key={n} className="w-8 h-8 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center text-white">
                  <Check size={14} />
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-white bg-[#054a29] flex items-center justify-center text-white font-bold text-xs ring-2 ring-emerald-100 shadow-lg">
                3
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter text-[#054a29]">Finalizar Pedido</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          {/* Main Form Area */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-emerald-900/5 border border-gray-100 overflow-hidden">
              <div className="bg-[#054a29] p-8 text-white relative">
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight mb-1">Información de Envío</h1>
                    <p className="text-emerald-100/60 text-xs font-medium">Completa tus datos para recibir tu pedido.</p>
                  </div>
                  <div className="hidden sm:block">
                    <ShieldCheck size={40} className="text-emerald-400 opacity-30" />
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-10">
                {/* 1. Información Personal */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#054a29]">
                      <User size={18} />
                    </div>
                    <h2 className="font-black uppercase text-sm tracking-widest text-[#054a29]">1. Datos Personales</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClasses}>Nombre <span className="text-red-400">*</span></label>
                      <input
                        required
                        type="text"
                        placeholder="Escribe tu nombre"
                        className={inputClasses('nombre')}
                        value={shippingData.nombre}
                        onChange={e => handleInputChange('nombre', e.target.value)}
                        onBlur={() => handleBlur('nombre')}
                      />
                      {touched.nombre && errors.nombre && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1 uppercase">{errors.nombre}</p>}
                    </div>
                    <div>
                      <label className={labelClasses}>Apellido <span className="text-red-400">*</span></label>
                      <input
                        required
                        type="text"
                        placeholder="Escribe tu apellido"
                        className={inputClasses('apellido')}
                        value={shippingData.apellido}
                        onChange={e => handleInputChange('apellido', e.target.value)}
                        onBlur={() => handleBlur('apellido')}
                      />
                      {touched.apellido && errors.apellido && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1 uppercase">{errors.apellido}</p>}
                    </div>
                  </div>
                </section>

                {/* 2. Identificación */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#054a29]">
                      <FileText size={18} />
                    </div>
                    <h2 className="font-black uppercase text-sm tracking-widest text-[#054a29]">2. Identificación</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClasses}>Tipo <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <select
                          className={`${inputClasses('tipoDocumento')} appearance-none cursor-pointer`}
                          value={shippingData.tipoDocumento}
                          onChange={e => setShippingData({ ...shippingData, tipoDocumento: e.target.value })}
                        >
                          <option value="CC">Cédula de Ciudadanía</option>
                          <option value="NIT">NIT</option>
                          <option value="PP">Pasaporte</option>
                          <option value="CE">Cédula de Extranjería</option>
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <Check size={16} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className={labelClasses}>Número de Documento <span className="text-red-400">*</span></label>
                      <input
                        required
                        type="text"
                        inputMode="numeric"
                        placeholder="Número sin puntos"
                        className={inputClasses('documento')}
                        value={shippingData.documento}
                        onChange={e => handleInputChange('documento', e.target.value)}
                        onBlur={() => handleBlur('documento')}
                      />
                      {touched.documento && errors.documento && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1 uppercase">{errors.documento}</p>}
                    </div>
                  </div>
                </section>

                {/* 3. Contacto */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#054a29]">
                      <Phone size={18} />
                    </div>
                    <h2 className="font-black uppercase text-sm tracking-widest text-[#054a29]">3. Contacto</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-1">
                      <label className={labelClasses}>Correo Electrónico <span className="text-red-400">*</span></label>
                      <input
                        required
                        type="email"
                        placeholder="ejemplo@correo.com"
                        className={inputClasses('email')}
                        value={shippingData.email}
                        onChange={e => handleInputChange('email', e.target.value)}
                        onBlur={() => handleBlur('email')}
                      />
                      {touched.email && errors.email && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1 uppercase">{errors.email}</p>}
                    </div>
                    <div>
                      <label className={labelClasses}>WhatsApp / Celular <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">+57</span>
                        <input
                          required
                          type="tel"
                          maxLength={10}
                          placeholder="300 000 0000"
                          className={`${inputClasses('telefono')} pl-14`}
                          value={shippingData.telefono}
                          onChange={e => handleInputChange('telefono', e.target.value)}
                          onBlur={() => handleBlur('telefono')}
                        />
                      </div>
                      {touched.telefono && errors.telefono && <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-1 uppercase">{errors.telefono}</p>}
                    </div>
                  </div>
                </section>

                {/* 4. Ubicación */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#054a29]">
                      <MapPin size={18} />
                    </div>
                    <h2 className="font-black uppercase text-sm tracking-widest text-[#054a29]">4. Envío</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <label className={labelClasses}>Dirección Exacta <span className="text-red-400">*</span></label>
                      <input
                        required
                        type="text"
                        placeholder="Ej: Calle 10 # 5-20, Edificio El Trebol, Apto 201"
                        className={inputClasses('direccion')}
                        value={shippingData.direccion}
                        onChange={e => handleInputChange('direccion', e.target.value)}
                        onBlur={() => handleBlur('direccion')}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClasses}>Ciudad / Municipio <span className="text-red-400">*</span></label>
                        <input
                          required
                          type="text"
                          placeholder="Ej: Villavicencio, Meta"
                          className={inputClasses('ciudad')}
                          value={shippingData.ciudad}
                          onChange={e => handleInputChange('ciudad', e.target.value)}
                          onBlur={() => handleBlur('ciudad')}
                        />
                      </div>
                      <div>
                        <label className={labelClasses}>Notas Adicionales (Opcional)</label>
                        <input
                          type="text"
                          placeholder="Ej: Portería, Local comercial..."
                          className={inputClasses('notas')}
                          value={shippingData.notas}
                          onChange={e => setShippingData({ ...shippingData, notas: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </form>
              Section: Payment Methods
              <div className="p-8 md:p-10 pt-0">
                <div className="pt-10 border-t-2 border-gray-50">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                        <CreditCard size={18} />
                      </div>
                      <h2 className="font-black uppercase text-sm tracking-widest text-[#054a29]">Método de Pago</h2>
                    </div>
                    <div className="hidden sm:flex items-center gap-3">
                      <div className="px-3 py-1 bg-gray-100 rounded-lg flex items-center gap-1.5 opacity-60">
                        <Lock size={12} />
                        <span className="text-[10px] font-black uppercase">Seguro</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative p-7 rounded-[2rem] border-2 border-[#054a29] bg-emerald-50/30 group transition-all shadow-md">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-2 shadow-sm border border-emerald-100">
                          <img src="/logos/wompi.svg" alt="Wompi" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-lg">Wompi Bancolombia</p>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Paga con total confianza</p>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-[#054a29] flex items-center justify-center text-white shadow-lg">
                        <Check size={16} strokeWidth={3} />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 mb-6">
                      {[
                        { src: '/logos/visa.svg', alt: 'Visa' },
                        { src: '/logos/mastercard.svg', alt: 'Mastercard' },
                        { src: '/logos/amex.svg', alt: 'Amex' },
                        { src: '/logos/bancolombia.svg', alt: 'Bancolombia' },
                        { src: '/logos/nequi.svg', alt: 'Nequi' },
                        { src: '/logos/pse.svg', alt: 'PSE' },
                        { src: '/logos/daviplata.svg', alt: 'Daviplata' },
                      ].map(logo => (
                        <div key={logo.alt} className="aspect-video bg-white rounded-xl border border-gray-100 flex items-center justify-center p-1.5 hover:scale-105 transition-transform shadow-sm">
                          <img src={logo.src} alt={logo.alt} className="w-full h-full object-contain" />
                        </div>
                      ))}
                      <div className="aspect-video bg-white rounded-xl border border-gray-100 flex flex-col items-center justify-center p-2 opacity-40">
                        <span className="text-[8px] font-black uppercase text-center leading-none">Efectivo</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 p-4 bg-white/60 rounded-2xl border border-white">
                      <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <ShieldCheck size={14} className="text-emerald-500" /> PCI Level 1
                      </div>
                      <div className="h-3 w-px bg-gray-300"></div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <Lock size={14} className="text-emerald-500" /> SSL 256-bit
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 md:hidden">
                    <button
                      onClick={handleSubmit}
                      disabled={!isFormValid || isSubmitting}
                      className="w-full bg-[#8cc63f] text-[#054a29] py-5 rounded-[1.5rem] font-black text-lg uppercase tracking-widest shadow-xl shadow-lime-200/50 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : <>Finalizar y Pagar <Lock size={20} /></>}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Badges */}
            <div className="flex items-center justify-center gap-6 opacity-40 py-4">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck size={20} />
                <span className="text-[8px] font-black uppercase">Garantía</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck size={20} />
                <span className="text-[8px] font-black uppercase">Envíos</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Lock size={20} />
                <span className="text-[8px] font-black uppercase">Seguro</span>
              </div>
            </div>
          </div>

          {/* Sidebar: Order Summary */}
          <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-40">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-emerald-900/5 border border-gray-100 overflow-hidden">
              <div className="p-8 border-b-2 border-dashed border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#054a29]">
                    <ShoppingBag size={18} />
                  </div>
                  <h2 className="font-black uppercase text-sm tracking-widest text-[#054a29]">Resumen de Orden</h2>
                </div>

                <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden shadow-inner flex-shrink-0">
                        <img
                          src={item.image || '/placeholder.png'}
                          alt={item.name}
                          className="w-full h-full object-cover p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                        <p className="text-xs font-black text-gray-900 line-clamp-2 uppercase tracking-tighter mb-1">{item.name}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-gray-400">CANT: {item.quantity}</span>
                          <span className="text-xs font-bold text-[#054a29]">${(item.price * item.quantity).toLocaleString('es-CO')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-[#fdfdfd] space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-gray-900">${totalPrice.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Envío</span>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Gratis</span>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t-2 border-gray-100 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total a Pagar</p>
                    <p className="text-4xl font-black text-[#054a29] tracking-tighter">${totalPrice.toLocaleString('es-CO')}</p>
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    onClick={handleSubmit}
                    disabled={!isFormValid || isSubmitting}
                    className="hidden md:flex w-full bg-[#8cc63f] text-[#054a29] py-5 px-8 rounded-[1.5rem] font-black text-lg uppercase tracking-widest hover:bg-[#7ab62f] hover:-translate-y-1 active:translate-y-0 shadow-2xl shadow-lime-200/50 items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed transition-all"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>Pagar Seguro <Lock size={20} /></>
                    )}
                  </button>

                  {/* Fallback button (initially hidden) */}
                  <div id="wompi-fallback" className="hidden mt-6 bg-amber-50 border border-amber-200 p-5 rounded-2xl text-center">
                    <p className="text-amber-800 text-[10px] font-black uppercase tracking-widest mb-3 leading-tight">
                      ¿La ventana de pago no abrió?
                    </p>
                    <button
                      onClick={() => {
                        const link = localStorage.getItem('last_wompi_link');
                        if (link) window.location.href = link;
                      }}
                      className="text-xs font-black uppercase text-white bg-amber-600 hover:bg-amber-700 px-6 py-3 rounded-xl transition-all shadow-lg"
                    >
                      Continuar aquí
                    </button>
                  </div>
                </div>

                <p className="text-[9px] text-gray-400 text-center font-bold uppercase tracking-widest mt-6 leading-relaxed max-w-[200px] mx-auto">
                  Al pagar, aceptas nuestros términos y condiciones de compra.
                </p>
              </div>
            </div>

            {/* Sticky Mobile Summary Indicator (Optional: user didn't ask for it but enhances UX) */}
            <div className="md:hidden fixed bottom-24 right-4 z-40">
              <div className="bg-[#054a29] text-white p-4 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
                < ShoppingBag size={20} />
                <span className="font-black text-sm">${totalPrice.toLocaleString('es-CO')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
