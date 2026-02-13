
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import { Trash2, ShoppingBag, ArrowLeft, ShoppingCart, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart, totalItems } = useCart();
  const navigate = useNavigate();

  const formattedPrice = (price: number) => new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(price);

  if (cart.length === 0) {
    return (
      <div className="pt-24 md:pt-32 min-h-screen bg-gray-50/50 flex flex-col items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 text-center animate-fade-in">
          <div className="bg-white w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-[#054a29] shadow-sm border border-gray-100">
            <ShoppingBag size={64} strokeWidth={1.5} />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-950 mb-4 tracking-tighter uppercase">Tu carrito está vacío</h2>
          <p className="text-gray-400 mb-12 max-w-sm mx-auto font-medium leading-relaxed">¿Buscas algo específico? Tenemos los mejores repuestos y lubricantes del Llano esperando por ti.</p>
          <Link
            to="/productos"
            className="bg-[#054a29] text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-black transition-all inline-flex items-center gap-3"
          >
            Explorar Catálogo <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-0 lg:pt-32 min-h-screen bg-gray-50/50 flex flex-col pb-32">
      <div className="max-w-[1400px] mx-auto px-6 py-8 md:py-12 flex-grow w-full animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <h1 className="text-4xl md:text-7xl font-black text-gray-950 tracking-tighter uppercase leading-none">Tu Pedido</h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px] mt-2">Revisa tus productos antes de finalizar</p>
          </div>
          <button
            onClick={clearCart}
            className="text-red-500 hover:text-red-700 font-black text-[10px] uppercase tracking-widest border-b border-gray-100 hover:border-red-500 transition-all pb-1 h-fit w-fit"
          >
            Vaciar Todo
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item.id} className="bg-white p-4 md:p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-4 md:gap-8 relative group overflow-hidden">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden shrink-0 bg-gray-50 p-2 flex items-center justify-center">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-contain group-hover:scale-110 transition-transform duration-500" />
                </div>

                <div className="flex-grow text-center md:text-left">
                  <p className="text-[10px] font-black text-[#054a29] uppercase tracking-widest mb-1">{item.category}</p>
                  <h3 className="font-black text-lg md:text-xl text-gray-950 mb-1 leading-tight tracking-tight">{item.name}</h3>
                  <p className="text-gray-400 font-black text-[10px] uppercase">{formattedPrice(item.price)} C/U</p>
                </div>

                <div className="flex items-center border-2 border-gray-50 rounded-2xl bg-gray-50 p-1 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-12 h-12 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-xl text-gray-400 hover:text-[#054a29] transition-all font-black text-xl disabled:opacity-30"
                    disabled={item.quantity <= 1}
                    aria-label="Reducir cantidad"
                  >-</button>
                  <span className="w-16 md:w-12 font-black text-2xl md:text-lg text-center text-gray-950">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-12 h-12 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-xl text-gray-400 hover:text-[#054a29] transition-all font-black text-xl"
                    aria-label="Aumentar cantidad"
                  >+</button>
                </div>

                <div className="text-center md:text-right shrink-0 min-w-[120px]">
                  <p className="font-black text-2xl text-[#054a29] tracking-tighter mb-1">{formattedPrice(item.price * item.quantity)}</p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-200 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-8 text-center md:text-left">
              <Link to="/productos" className="inline-flex items-center gap-3 text-[#054a29] font-black text-[10px] uppercase tracking-[0.2em] group">
                <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> Agregar más productos
              </Link>
            </div>
          </div>

          {/* Order Summary following Brand Standards */}
          <div className="lg:col-span-1 lg:sticky lg:top-28">
            <div className="bg-[#054a29] rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16"></div>

              <h2 className="text-2xl md:text-3xl font-black mb-8 tracking-tighter uppercase border-b border-white/10 pb-4">Resumen</h2>

              <div className="space-y-4 mb-10">
                {/* Subtotal */}
                <div className="flex justify-between items-center text-white/60 font-black uppercase tracking-widest text-[10px]">
                  <span>Subtotal ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})</span>
                  <span className="text-white text-xs font-bold">{formattedPrice(totalPrice)}</span>
                </div>

                {/* Envío Gratis - EXPLÍCITO */}
                <div className="flex justify-between items-center text-emerald-300 font-black uppercase tracking-widest text-[10px]">
                  <span className="flex items-center gap-2">
                    <Sparkles size={14} className="animate-pulse" />
                    Envío Nacional
                  </span>
                  <span className="text-emerald-300 text-sm font-black tracking-tight">GRATIS</span>
                </div>

                {/* IVA Incluido */}
                <div className="flex justify-between items-center text-white/40 font-bold text-[9px] uppercase tracking-wider">
                  <span>IVA</span>
                  <span>Incluido</span>
                </div>

                {/* Separator */}
                <div className="h-px bg-white/10 my-6"></div>

                {/* Total */}
                <div className="flex justify-between items-baseline pt-4">
                  <span className="text-white text-xs font-black uppercase tracking-widest">Total a Pagar</span>
                  <span className="text-4xl font-black text-white tracking-tighter">
                    {formattedPrice(totalPrice)}
                  </span>
                </div>

                {/* Trust Badge Wompi */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center gap-2 text-xs text-white/80 border border-white/5">
                  <ShieldCheck size={16} className="text-emerald-300" />
                  <span className="font-semibold">Pago 100% seguro con Wompi</span>
                </div>
              </div>


              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-[#d4e157] text-[#054a29] py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-white transition-all active:scale-95 shadow-xl uppercase tracking-widest"
              >
                Finalizar Pedido <ArrowRight size={20} />
              </button>

              <div className="mt-8 flex justify-center gap-4 opacity-30 grayscale brightness-200">
                <div className="text-[8px] font-black border border-white px-2 py-1">TRANSACCIÓN SEGURA</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Payment Bar - Lifted to avoid overlap with global MobileActionBar */}
      {cart.length > 0 && (
        <div className="md:hidden fixed bottom-24 left-4 right-4 z-40 animate-fade-in-up">
          <button
            onClick={() => navigate('/checkout')}
            className="w-full flex items-center justify-between bg-[#d4e157] text-[#054a29] p-6 rounded-3xl font-black text-lg uppercase tracking-widest shadow-2xl border-2 border-[#054a29]/20 active:scale-95 transition-all"
          >
            <div className="flex flex-col items-start leading-none">
              <span className="text-xs font-bold uppercase mb-1 opacity-80">Finalizar pedido</span>
              <span className="text-xl tracking-tighter">{formattedPrice(totalPrice)}</span>
            </div>
            <ArrowRight size={24} strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
