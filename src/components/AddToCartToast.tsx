import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { CheckCircle2, ShoppingBag, ArrowRight, X } from 'lucide-react';

const AddToCartToast: React.FC = () => {
    const { showAddToCartToast, lastAddedProduct, totalItems } = useCart();
    const navigate = useNavigate();

    if (!showAddToCartToast || !lastAddedProduct) return null;

    return (
        <div className="fixed top-24 right-4 z-[100] animate-slide-in-right">
            <div className="bg-white rounded-[2rem] shadow-2xl border-2 border-emerald-100 p-6 max-w-sm backdrop-blur-xl animate-bounce-in">
                {/* Success Icon + Close */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="bg-emerald-500 rounded-full p-2 animate-scale-in">
                        <CheckCircle2 size={24} className="text-white" strokeWidth={3} />
                    </div>
                    <div className="flex-grow">
                        <h3 className="text-lg font-black text-gray-900 tracking-tight leading-tight">
                            ¡Agregado al carrito!
                        </h3>
                        <p className="text-xs text-gray-500 font-bold mt-1">
                            {lastAddedProduct.name}
                        </p>
                    </div>
                </div>

                {/* Product Preview */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-4">
                    <img
                        src={lastAddedProduct.image}
                        alt={lastAddedProduct.name}
                        className="w-16 h-16 object-contain rounded-lg bg-white p-2"
                    />
                    <div className="flex-grow">
                        <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight">
                            {lastAddedProduct.name}
                        </p>
                        <p className="text-xs text-emerald-600 font-black mt-1">
                            {new Intl.NumberFormat('es-CO', {
                                style: 'currency',
                                currency: 'COP',
                                maximumFractionDigits: 0,
                            }).format(lastAddedProduct.price)}
                        </p>
                    </div>
                </div>

                {/* Cart Summary */}
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl mb-4">
                    <div className="flex items-center gap-2">
                        <ShoppingBag size={16} className="text-emerald-600" />
                        <span className="text-xs font-black text-emerald-900">
                            Total en carrito:
                        </span>
                    </div>
                    <span className="text-sm font-black text-emerald-600">
                        {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/carrito')}
                        className="flex-grow bg-emerald-600 text-white py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-95"
                    >
                        <ShoppingBag size={16} />
                        Ver Carrito
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddToCartToast;
