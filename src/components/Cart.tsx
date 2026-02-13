import { useCart } from './CartContext';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();

  const formattedTotal = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(totalPrice);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={80} className="mx-auto text-gray-300 mb-6" />
        <h2 className="text-3xl font-black text-gray-800 mb-4">Tu carrito está vacío</h2>
        <p className="text-gray-600 mb-8">Agrega productos para empezar tu compra</p>
        <Link to="/" className="inline-block bg-emerald-green text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition">
          Ver Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black text-gray-900">🛒 Mi Carrito</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-800 font-bold flex items-center gap-2 transition"
        >
          <Trash2 size={20} />
          Vaciar carrito
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        {cart.map((item) => {
          const itemTotal = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
          }).format(item.price * item.quantity);

          return (
            <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-6 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-gray-50 p-2 border border-gray-100"
                />

                <div className="flex-grow sm:hidden">
                  <h3 className="font-black text-gray-900 text-sm leading-tight mb-1">{item.name}</h3>
                  <p className="text-emerald-green font-black text-lg">
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      maximumFractionDigits: 0,
                    }).format(item.price)}
                  </p>
                </div>
              </div>

              <div className="hidden sm:block flex-grow">
                <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                <p className="text-emerald-green font-bold">
                  {new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    maximumFractionDigits: 0,
                  }).format(item.price)}
                </p>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-full border border-gray-100">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-10 h-10 sm:w-8 sm:h-8 bg-white hover:bg-gray-100 text-gray-400 rounded-full flex items-center justify-center transition shadow-sm border border-gray-100"
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-black text-lg w-8 text-center text-gray-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-10 h-10 sm:w-8 sm:h-8 bg-emerald-green hover:bg-emerald-700 text-white rounded-full flex items-center justify-center transition shadow-lg shadow-emerald-900/10"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="text-right sm:min-w-[120px]">
                  <p className="font-black text-xl text-gray-900">{itemTotal}</p>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  aria-label="Eliminar producto"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-emerald-green text-white rounded-xl p-6 flex justify-between items-center">
        <div>
          <p className="text-sm opacity-90 mb-1">Total a pagar</p>
          <p className="text-4xl font-black">{formattedTotal}</p>
        </div>
        <button className="bg-brand-yellow text-emerald-green px-8 py-4 rounded-lg font-black text-lg hover:bg-yellow-400 transition">
          Proceder al pago
        </button>
      </div>

      <Link to="/" className="inline-block mt-6 text-emerald-green font-bold hover:underline">
        ← Seguir comprando
      </Link>
    </div>
  );
}

export default Cart;
