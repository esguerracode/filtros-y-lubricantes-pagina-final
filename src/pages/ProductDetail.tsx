
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CONTACT_INFO } from '../constants';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../components/CartContext';
import { ArrowLeft, ArrowRight, ShoppingCart, MessageCircle, Check, ShieldCheck, Star, AlertCircle, TrendingUp, Clock, Zap, Target, Package } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import AddToCartToast from '../components/AddToCartToast';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { products, loading } = useProducts();
  const [quantity, setQuantity] = useState(1);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [showSticky, setShowSticky] = useState(false);

  const product = products.find(p => p.id === Number(id));
  const relatedProducts = products.filter(p => p.category === product?.category && p.id !== product?.id).slice(0, 4);

  // Timer logic for "Regional Dispatch" urgency
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(17, 0, 0, 0); // 5:00 PM cutoff

      if (now > cutoff) {
        cutoff.setDate(cutoff.getDate() + 1);
      }

      const diff = cutoff.getTime() - now.getTime();
      return {
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    const handleScroll = () => {
      const scrollThreshold = window.innerWidth < 768 ? 600 : 1000;
      setShowSticky(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-gray-100 rounded-3xl w-1/3 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-100 rounded-3xl"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-100 rounded-xl w-3/4"></div>
              <div className="h-6 bg-gray-100 rounded-xl w-1/2"></div>
              <div className="h-32 bg-gray-100 rounded-3xl w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-gray-100 inline-block">
          <AlertCircle size={64} className="text-red-400 mx-auto mb-6" />
          <h2 className="text-4xl font-black mb-4 tracking-tighter">Producto no encontrado</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">El producto que buscas no está disponible o ha sido removido de nuestro catálogo.</p>
          <button onClick={() => navigate('/productos')} className="bg-emerald-green text-white px-8 py-4 rounded-full font-black hover:shadow-xl transition-all active:scale-95">
            Volver al catálogo completo
          </button>
        </div>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(product.price);

  const handleWhatsApp = () => {
    window.open(CONTACT_INFO.officialLink, '_blank');
  };

  // Scarcity Mocking Logic
  const isHighDemand = (product.id % 2 === 0);
  const mockViewers = (product.id % 12) + 4;
  const mockStock = (product.id % 8) + 3;

  return (
    <div className="max-w-7xl mx-auto px-4 pt-0 lg:pt-32 pb-12">

      <Link to="/productos" className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-green font-bold mb-8 transition-colors group">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Volver al catálogo
      </Link>

      <div className="bg-white rounded-[4rem] shadow-2xl shadow-emerald-900/5 border border-gray-100 overflow-hidden mb-20 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Column */}
          <div className="p-8 md:p-20 bg-gray-50 flex flex-col items-center justify-center relative">
            <div className="relative group overflow-hidden rounded-[3rem] shadow-3xl bg-white p-8">
              <img src={product.image} alt={product.name} className="w-full h-auto object-contain max-h-[500px] group-hover:scale-105 transition-transform duration-700" />
            </div>

            {/* Visual Social Proof Floating */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-6 py-4 rounded-3xl shadow-xl border border-white/50 flex items-center gap-4 whitespace-nowrap">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${product.id + i}`} alt="user" />
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-[1000] text-gray-900 uppercase tracking-tight">
                {mockViewers} empresas consultando ahora
              </p>
            </div>
          </div>

          {/* Details Column */}
          <div className="p-8 md:p-16 flex flex-col justify-center">
            <div className="flex items-center flex-wrap gap-3 mb-8">
              <span className="bg-brand-yellow text-emerald-950 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                {product.category}
              </span>
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
                <Check size={14} /> Repuesto Certificado
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tighter leading-[0.9]">{product.name}</h1>

            <div className="flex flex-col gap-1 mb-10">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Inversión Profesional</p>
              <div className="text-6xl font-[1000] text-emerald-green flex items-baseline gap-3">
                {formattedPrice}
                <span className="text-sm text-gray-400 font-bold uppercase tracking-widest translate-y-[-10px]">COP</span>
              </div>
              <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">* Los precios pueden variar según volumen de flota</p>
            </div>

            {/* Premium Delivery Urgency */}
            <div className="bg-emerald-950 p-6 rounded-[2.5rem] text-white flex flex-col sm:flex-row items-center gap-6 mb-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-colors"></div>
              <div className="bg-emerald-500/20 p-4 rounded-2xl text-emerald-400">
                <Clock size={32} />
              </div>
              <div className="flex-grow text-center sm:text-left">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-[0.2em] mb-1">Cierre de despacho regional</p>
                <p className="text-xl font-black tracking-tight leading-tight">Ordena en los próximos:</p>
                <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 font-mono text-2xl font-black text-brand-yellow">
                  <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
                  <span className="animate-pulse">:</span>
                  <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
                  <span className="animate-pulse">:</span>
                  <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
                </div>
              </div>
              <div className="bg-emerald-800/50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-700 whitespace-nowrap">
                Envío Hoy Mismo
              </div>
            </div>

            <div className="prose prose-sm text-gray-600 mb-10 max-w-none">
              <p className="text-lg leading-relaxed font-medium text-gray-500">{product.description}</p>
            </div>

            {/* Scarcity Trigger */}
            <div className={`p-5 rounded-2xl flex items-center gap-4 mb-10 border transition-all ${isHighDemand ? 'bg-orange-50 border-orange-100 shadow-orange-500/5' : 'bg-gray-50 border-gray-100'}`}>
              <AlertCircle className={isHighDemand ? "text-orange-500" : "text-gray-400"} size={24} />
              <p className={`text-sm font-bold ${isHighDemand ? 'text-orange-800' : 'text-gray-500'}`}>
                {isHighDemand ? (
                  <>¡Solo quedan <span className="text-xl px-1">{mockStock}</span> unidades! Alta rotación por temporada de cosecha.</>
                ) : (
                  <>Disponibilidad estable en bodega central para entrega inmediata.</>
                )}
              </p>
            </div>

            <div className="space-y-10">
              <div className="flex flex-col sm:flex-row sm:items-center gap-8">
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Seleccionar Volumen</p>
                  <div className="flex items-center border-2 border-gray-100 rounded-[1.5rem] bg-gray-50 overflow-hidden shadow-sm group focus-within:border-emerald-200 transition-all">
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="px-8 py-5 hover:bg-white text-gray-400 hover:text-emerald-green transition-all text-2xl font-black disabled:opacity-30"
                      aria-label="Reducir cantidad"
                      disabled={quantity <= 1}
                    >-</button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 bg-transparent font-black text-2xl text-center outline-none text-gray-900"
                      aria-label="Cantidad de productos"
                      min="1"
                    />
                    <button
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="px-8 py-5 hover:bg-white text-gray-400 hover:text-emerald-green transition-all text-2xl font-black"
                      aria-label="Aumentar cantidad"
                    >+</button>
                  </div>
                </div>
                <div className="bg-gray-50 border border-dashed border-gray-200 p-6 rounded-[1.5rem] flex-grow">
                  <div className="flex items-center gap-3 text-emerald-700 mb-1">
                    <Target size={18} />
                    <p className="text-xs font-black uppercase tracking-tight">Compra Optimizada</p>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase leading-relaxed">
                    Perfecto para mantenimiento preventivo de 1 maquinaria por 500h de operación.
                  </p>
                </div>
              </div>

              <div className="flex flex-col xl:flex-row gap-4">
                <button
                  onClick={() => addToCart(product, quantity)}
                  className="flex-grow bg-[#FF8C42] text-white py-6 rounded-[2rem] font-[1000] text-xl flex items-center justify-center gap-4 hover:bg-[#FF7A21] hover:shadow-2xl hover:shadow-orange-300 transition-all hover:-translate-y-1 active:scale-95 shadow-xl shadow-orange-100 uppercase tracking-widest"
                >
                  <ShoppingCart size={28} strokeWidth={2.5} /> Agregar al Carrito
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="bg-white text-emerald-700 py-6 rounded-[2rem] font-[1000] text-xl flex items-center justify-center gap-4 hover:bg-emerald-50 transition-all active:scale-95 border-2 border-emerald-600/20 px-10 uppercase tracking-widest"
                >
                  <MessageCircle size={28} /> Chat técnico
                </button>
              </div>
            </div>

            <div className="mt-16 pt-10 border-t border-gray-100 flex flex-wrap gap-8">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-500/10 p-4 rounded-2xl text-emerald-600 shadow-sm">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-900 uppercase tracking-tight">ISO 9001 Cert.</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Calidad Garantizada</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-emerald-500/10 p-4 rounded-2xl text-emerald-600 shadow-sm">
                  <Zap size={28} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-900 uppercase tracking-tight">Repuesto OEM</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Rendimiento Original</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="animate-fade-in-up">
          <div className="flex items-center justify-between mb-16 px-4">
            <div>
              <h2 className="text-4xl md:text-5xl font-[1000] text-gray-900 uppercase tracking-tighter leading-tight">
                Optimiza tu compra <br />
                <span className="text-emerald-600">Items Relacionados</span>
              </h2>
            </div>
            <Link to="/productos" className="bg-emerald-950 text-white px-8 py-4 rounded-full font-black flex items-center gap-3 hover:bg-black transition-all shadow-xl shadow-emerald-900/10 text-xs uppercase tracking-widest">
              Ver Catálogo <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {relatedProducts.map(relProduct => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </section>
      )}
      {/* Sticky Mobile CTA */}
      <div className={`md:hidden fixed bottom-20 left-0 w-full z-40 px-4 transition-all duration-500 transform ${showSticky ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="bg-emerald-950/95 backdrop-blur-xl border border-white/20 p-3 rounded-[2rem] shadow-2xl flex items-center justify-between gap-4">
          <div className="flex flex-col pl-2">
            <p className="text-[10px] font-black text-brand-yellow uppercase tracking-widest">Inversión</p>
            <p className="text-xl font-black text-white">{formattedPrice}</p>
          </div>
          <button
            onClick={() => addToCart(product, quantity)}
            className="bg-[#FF8C42] text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all shadow-lg"
          >
            <ShoppingCart size={16} /> Agregar
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      <AddToCartToast />
    </div>
  );
};

export default ProductDetail;
