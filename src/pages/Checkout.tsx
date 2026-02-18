import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import { WompiPaymentForm } from '../components/WompiPaymentForm';
import {
  ShoppingBag,
  ChevronLeft,
  CreditCard,
  Truck,
  ShieldCheck,
  Info,
  ChevronRight,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  ArrowRight,
  AlertCircle,
  Clock,
  Lock
} from 'lucide-react';
import '../styles/checkout.css';

const Checkout: React.FC = () => {
  const { cart, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  const [shipping, setShipping] = useState({
    nombre: '',
    email: '',
    telefono: '',
    ciudad: '',
    direccion: '',
    nit: ''
  });

  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cart.length === 0 && !showPayment) {
      navigate('/carrito');
    }
  }, [cart, navigate, showPayment]);

  const handleOrderStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Guardar borrador
    localStorage.setItem('checkout_draft', JSON.stringify(shipping));

    try {
      // 1. Crear Orden en WooCommerce mediante nuestro Proxy
      const orderRes = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({ id: item.id, quantity: item.quantity, price: item.price })),
          customer: {
            fullName: shipping.nombre,
            email: shipping.email,
            phoneNumber: shipping.telefono,
            address: shipping.direccion,
            city: shipping.ciudad,
            department: shipping.ciudad // Simplificado
          }
        })
      });

      const data = await orderRes.json();

      if (!orderRes.ok) throw new Error(data.error || 'Fallo al crear la orden');

      setOrderData(data);
      setShowPayment(true);

      // Guardar info para la página de success
      localStorage.setItem('last_shipping', JSON.stringify(shipping));
      localStorage.setItem('last_order_ref', `ORD-${data.id}`);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (data: any) => {
    console.log('✅ Pago aprobado:', data);
    navigate(`/success?status=approved&reference=${data.reference}&id=${data.id}`);
  };

  const formattedPrice = (price: number) => new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-8 lg:pt-32">
      {/* Header Simplificado para Checkout */}
      <div className="max-w-7xl mx-auto px-4 mb-8 flex items-center justify-between">
        <Link to="/carrito" className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold text-sm transition-colors">
          <ChevronLeft size={20} />
          Volver al Carrito
        </Link>
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-[#054a29]" />
          <span className="text-xs font-black uppercase tracking-tighter text-gray-400">Checkout Seguro SSL</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Columna Izquierda: Formularios */}
          <div className="lg:col-span-7">

            {!showPayment ? (
              <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 p-8 md:p-12 animate-fade-in-up">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-[#054a29] text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-emerald-100 text-xl">
                    1
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 leading-none">Envío</h2>
                    <p className="text-sm text-gray-400 mt-1">¿A dónde enviamos tus productos?</p>
                  </div>
                </div>

                <form onSubmit={handleOrderStep} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Nombre Completo</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text" placeholder="Juan Pérez" required
                          className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 outline-none transition-all font-medium"
                          value={shipping.nombre} onChange={e => setShipping({ ...shipping, nombre: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Correo Electrónico</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="email" placeholder="juan@correo.com" required
                          className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 outline-none transition-all font-medium"
                          value={shipping.email} onChange={e => setShipping({ ...shipping, email: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">WhatsApp / Teléfono</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="tel" placeholder="310 123 4567" required
                          className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 outline-none transition-all font-medium"
                          value={shipping.telefono} onChange={e => setShipping({ ...shipping, telefono: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Ciudad</label>
                      <div className="relative">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text" placeholder="Villavicencio" required
                          className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 outline-none transition-all font-medium"
                          value={shipping.ciudad} onChange={e => setShipping({ ...shipping, ciudad: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Dirección de Entrega</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text" placeholder="Calle 10 # 5-20, Barrio Centro" required
                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 outline-none transition-all font-medium"
                        value={shipping.direccion} onChange={e => setShipping({ ...shipping, direccion: e.target.value })}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-start gap-3 animate-shake">
                      <AlertCircle className="shrink-0" size={20} />
                      <p className="text-sm font-medium">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#054a29] text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-[#04331d] transition-all shadow-xl shadow-emerald-100 active:scale-[0.98] disabled:opacity-50 mt-4 group"
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <div className="loading-spinner h-6 w-6 border-4 border-white/30 border-t-white animate-spin"></div>
                        <span>Generando Pedido...</span>
                      </div>
                    ) : (
                      <>
                        Continuar al Pago
                        <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 p-8 md:p-12 animate-fade-in-up">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-[#054a29] text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-emerald-100 text-xl">
                    2
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 leading-none">Pago Seguro</h2>
                    <p className="text-sm text-[#054a29] font-bold mt-1 uppercase tracking-tighter italic">Orden #{orderData?.id} Generada</p>
                  </div>
                </div>

                {orderData && (
                  <WompiPaymentForm
                    amount={parseFloat(orderData.total)}
                    orderReference={`WC-${orderData.id}`}
                    customerEmail={shipping.email}
                    onSuccess={handlePaymentSuccess}
                    onError={(msg) => setError(msg)}
                  />
                )}

                <button
                  onClick={() => setShowPayment(false)}
                  className="mt-10 py-4 px-6 text-gray-400 font-bold flex items-center gap-2 hover:text-gray-600 transition-all w-full justify-center bg-gray-50 rounded-2xl"
                >
                  <ChevronLeft size={18} />
                  Corregir información de envío
                </button>
              </div>
            )}

          </div>

          {/* Columna Derecha: Resumen */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 border border-gray-100 sticky top-32">
              <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-50 text-[#054a29] rounded-lg flex items-center justify-center">
                  <ShoppingBag size={18} />
                </div>
                Tu Carrito
              </h3>

              <div className="space-y-6 mb-8 max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl border border-gray-100 p-2 shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 py-1">
                      <h4 className="font-bold text-gray-800 text-sm line-clamp-2 leading-tight">{item.name}</h4>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{item.quantity} Uni.</span>
                        <p className="font-black text-[#054a29] italic">{formattedPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-8 border-t border-gray-100">
                <div className="flex justify-between text-gray-400 font-bold uppercase text-[10px] tracking-widest px-2">
                  <span>Productos ({totalItems})</span>
                  <span>{formattedPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-400 font-bold uppercase text-[10px] tracking-widest px-2">
                  <span>Envío Nacional</span>
                  <span className="text-emerald-500">Gratis 🎉</span>
                </div>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-dashed border-gray-200"></div>
                  </div>
                </div>

                <div className="flex justify-between items-end px-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total a Pagar</span>
                    <span className="text-[10px] font-bold text-gray-300">IVA incluido</span>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black text-gray-900 tracking-tighter leading-none block">
                      {formattedPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Seguridad Extra */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl text-center">
                  <Truck className="text-gray-400 mb-2" size={20} />
                  <p className="text-[9px] font-black uppercase text-gray-500">Entrega rápida</p>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl text-center">
                  <Lock className="text-gray-400 mb-2" size={20} />
                  <p className="text-[9px] font-black uppercase text-gray-500">100% Seguro</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
