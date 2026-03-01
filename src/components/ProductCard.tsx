
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from './CartContext';
import { ShoppingCart, Eye } from 'lucide-react';
import AddToCartToast from './AddToCartToast';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <div
      className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(5,74,41,0.1)] transition-all duration-500 group overflow-hidden flex flex-col h-full border border-gray-100 relative animate-fade-in [transform:translateZ(0)]"
      aria-label={`Producto: ${product.name}`}
    >
      {/* Product Image section with UX improvements */}
      <div className="relative aspect-square overflow-hidden bg-gray-50/50 flex items-center justify-center p-4">
        <img
          src={product.image || '/fotos/DSC_1233-topaz-denoise.jpg'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Brand Consistent Badge */}
        <div className="absolute top-3 left-3 md:top-4 md:left-4 z-[15]">
          <span className="bg-[#054a29] text-white text-[8px] md:text-[9px] font-black px-2 py-1 md:px-3 md:py-1.5 rounded-[1rem] uppercase tracking-wider shadow-lg block max-w-[90px] md:max-w-none truncate">
            {product.category}
          </span>
        </div>

        {/* Refined Quick View Action */}
        <div className="absolute top-3 right-3 md:top-4 md:right-4 translate-x-12 group-hover:translate-x-0 transition-transform duration-500 z-10">
          <Link
            to={`/producto/${product.id}`}
            className="p-2 md:p-3 bg-white/90 backdrop-blur-md rounded-xl md:rounded-2xl text-[#054a29] hover:bg-[#054a29] hover:text-white transition-all shadow-xl flex items-center justify-center"
            aria-label="Ver detalles del producto"
          >
            <Eye size={20} strokeWidth={2.5} />
          </Link>
        </div>
      </div>

      <div className="p-3 md:p-6 flex flex-col flex-grow">
        <Link to={`/producto/${product.id}`} className="group/title">
          <h3 className="text-sm md:text-lg font-black text-gray-900 line-clamp-2 md:mb-2 group-hover/title:text-[#054a29] transition-colors leading-tight tracking-tight">
            {product.name}
          </h3>
        </Link>

        {/* Subdued description (UX improvement for readability) */}
        <p className="text-gray-400 text-[10px] md:text-xs mb-3 md:mb-4 flex-grow line-clamp-2 font-medium leading-relaxed">
          {product.description}
        </p>

        {/* Price and Add button following Brand Standards */}
        <div className="flex items-center justify-between mt-auto pt-3 md:pt-4 border-t border-gray-50">
          <div className="flex flex-col">
            <span className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Precio</span>
            <div className="flex items-baseline gap-[2px] md:gap-1">
              <span className="text-base sm:text-lg md:text-2xl font-black text-[#054a29] tracking-tighter leading-none">
                {formattedPrice}
              </span>
              <span className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase">COP</span>
            </div>
          </div>

          <button
            onClick={() => addToCart(product)}
            className="w-10 h-10 md:w-12 md:h-12 bg-[#054a29] text-white rounded-xl md:rounded-2xl flex items-center justify-center transition-all hover:bg-black hover:scale-105 active:animate-spring shadow-lg shadow-emerald-900/20 group/btn shrink-0"
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <ShoppingCart size={18} strokeWidth={2.5} className="md:scale-100 scale-100" />
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      <AddToCartToast />
    </div>
  );
};

export default ProductCard;
