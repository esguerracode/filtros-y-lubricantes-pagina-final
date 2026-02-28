
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
        <div className="absolute top-4 left-4 z-[15]">
          <span className="bg-[#054a29] text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg block">
            {product.category}
          </span>
        </div>

        {/* Refined Quick View Action */}
        <div className="absolute top-4 right-4 translate-x-12 group-hover:translate-x-0 transition-transform duration-500 z-10">
          <Link
            to={`/producto/${product.id}`}
            className="p-3 bg-white/90 backdrop-blur-md rounded-2xl text-[#054a29] hover:bg-[#054a29] hover:text-white transition-all shadow-xl flex items-center justify-center"
            aria-label="Ver detalles del producto"
          >
            <Eye size={20} strokeWidth={2.5} />
          </Link>
        </div>
      </div>

      <div className="p-4 md:p-6 flex flex-col flex-grow">
        <Link to={`/producto/${product.id}`} className="group/title">
          <h3 className="text-base md:text-lg font-black text-gray-900 line-clamp-2 mb-2 group-hover/title:text-[#054a29] transition-colors leading-tight tracking-tight">
            {product.name}
          </h3>
        </Link>

        {/* Subdued description (UX improvement for readability) */}
        <p className="text-gray-400 text-sm md:text-xs mb-4 flex-grow line-clamp-2 font-medium leading-relaxed">
          {product.description}
        </p>

        {/* Price and Add button following Brand Standards */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Precio</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl md:text-2xl font-black text-[#054a29] tracking-tighter">
                {formattedPrice}
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">COP</span>
            </div>
          </div>

          <button
            onClick={() => addToCart(product)}
            className="w-14 h-14 md:w-12 md:h-12 bg-[#054a29] text-white rounded-2xl flex items-center justify-center transition-all hover:bg-black hover:scale-105 active:animate-spring shadow-lg shadow-emerald-900/20 group/btn"
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <ShoppingCart size={20} strokeWidth={2.5} className="md:scale-100 scale-110" />
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      <AddToCartToast />
    </div>
  );
};

export default ProductCard;
