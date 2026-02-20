
import React, { useState, useMemo, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { Category } from '../types';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { Search, Filter, SlidersHorizontal, ArrowLeft, X, Sparkles, Zap, Package, ShieldCheck } from 'lucide-react';

const Products: React.FC = () => {
  const { products: allProducts, loading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Todos'>('Todos');
  const [activePromo, setActivePromo] = useState(0);

  const handleCategoryChange = (cat: Category | 'Todos') => {
    setSelectedCategory(cat);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = useMemo(() => {
    const availableCategories = new Set(allProducts.map(p => p.category));
    return ['Todos', ...Object.values(Category).filter(c => availableCategories.has(c))] as (Category | 'Todos')[];
  }, [allProducts]);

  const promoMessages = [
    { text: "Logística Prioritaria: Despachos a Puerto Gaitán en < 24h", icon: <Zap size={14} className="text-brand-yellow" /> },
    { text: "Stock Crítico: Filtros de Aire Caterpillar Serie 300 con alta demanda", icon: <Package size={14} className="text-emerald-400" /> },
    { text: "Garantía Certificada: Repuestos 100% Genuinos", icon: <ShieldCheck size={14} className="text-emerald-400" /> }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePromo((prev) => (prev + 1) % promoMessages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allProducts, searchTerm, selectedCategory]);

  return (
    <div className="bg-[#fcfcfd] min-h-screen pb-20">
      <div className="hidden lg:block h-24"></div>

      {/* Dynamic Urgency Bar */}
      <div className="bg-emerald-950 border-b border-white/10 py-3 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-4 animate-fade-in" key={activePromo}>
            {promoMessages[activePromo].icon}
            <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-[0.2em]">
              {promoMessages[activePromo].text}
            </span>
          </div>
        </div>
      </div>

      {/* Header & Search */}
      <section className="bg-emerald-950 pt-16 pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-yellow/5 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="max-w-7xl mx-auto relative z-10 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-2 text-emerald-400 font-black text-xs uppercase tracking-[0.2em] mb-4">
            <Sparkles size={14} /> Soluciones de Alto Rendimiento
          </div>
          <h1 className="text-5xl md:text-8xl font-[1000] text-white mb-8 tracking-tighter uppercase leading-[0.9]">
            Catálogo <br />
            <span className="text-emerald-500">Premium</span>
          </h1>

          <div className="relative max-w-2xl mx-auto lg:mx-0 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-brand-yellow rounded-full blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
            <div className="relative">
              <input
                type="text"
                placeholder="Busca por marca, referencia o tipo..."
                className="w-full pl-14 pr-6 py-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white placeholder:text-white/40 focus:bg-white focus:text-gray-900 focus:ring-0 transition-all outline-none text-lg font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-400" size={24} strokeWidth={2.5} />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Categories Selector (Quick Access) */}
          <div className="lg:hidden flex overflow-x-auto gap-2 pb-4 scrollbar-hide -mx-4 px-4 sticky top-0 z-30 bg-[#fcfcfd]/90 backdrop-blur-md pt-4 border-b border-gray-100 shadow-sm">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`whitespace-nowrap px-8 py-4 rounded-full text-[11px] font-[1000] uppercase tracking-wider transition-all border-2 ${selectedCategory === cat
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'bg-white border-gray-100 text-gray-400'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Categories Sidebar for Desktop */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-emerald-950/5 lg:sticky lg:top-28">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-[1000] flex items-center gap-3 uppercase tracking-tighter">
                  <SlidersHorizontal size={20} className="text-emerald-600" /> Filtros
                </h2>
                {(selectedCategory !== 'Todos' || searchTerm) && (
                  <button
                    onClick={() => { setSelectedCategory('Todos'); setSearchTerm(''); }}
                    className="text-[10px] font-black text-emerald-600 border-b-2 border-emerald-600 uppercase tracking-tighter"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat as Category | 'Todos')}
                    className={`text-left px-6 py-3.5 rounded-2xl text-xs font-[1000] uppercase tracking-wider transition-all border-2 ${selectedCategory === cat
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-600/20 scale-[1.02]'
                      : 'bg-white border-transparent text-gray-400 hover:border-gray-100 hover:bg-gray-50'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="mt-12 p-6 bg-emerald-950 rounded-3xl relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl group-hover:bg-emerald-500/40 transition-colors"></div>
                <p className="text-[10px] font-black text-brand-yellow uppercase mb-2 tracking-[0.2em] relative z-10">Exclusive Pack</p>
                <p className="text-white text-sm font-bold relative z-10">Paga 10 y lleva 11 en lubricantes de motor.</p>
              </div>
            </div>
          </aside>

          {/* Result Stats & Grid */}
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-8 px-2">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Mostrando <span className="text-emerald-600">{filteredProducts.length}</span> resultados
              </p>
              <div className="h-px flex-grow mx-8 bg-gray-100 hidden md:block"></div>

              <div className="flex items-center gap-4 text-[10px] font-medium text-gray-400 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-gray-100">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Suministro Estable
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <SkeletonLoader key={i} />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 animate-fade-in-up">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-200">
                <div className="bg-emerald-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-600">
                  <Search size={48} />
                </div>
                <h3 className="text-4xl font-[1000] text-gray-900 mb-4 tracking-tighter">Sin coincidencias</h3>
                <p className="text-gray-400 mb-10 max-w-sm mx-auto font-medium">No encontramos productos que coincidan con tu búsqueda. Intenta simplificar tus palabras clave.</p>
                <button
                  onClick={() => { setSearchTerm(''); setSelectedCategory('Todos'); }}
                  className="bg-emerald-950 text-white px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-emerald-900 transition-colors shadow-2xl shadow-emerald-950/20 active:scale-95"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
