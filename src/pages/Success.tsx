import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import { CONTACT_INFO } from '../constants';
import { CheckCircle, MessageCircle, Home, Download, Mail, Package, XCircle, Clock } from 'lucide-react';
import { downloadInvoice, type InvoiceData } from '../services/invoiceService';
import { trackPurchase } from '../utils/analytics';

const BANK_ACCOUNTS = [
  { bank: 'Banco de Bogotá', type: 'Cuenta Corriente', number: '804-185-643' },
  { bank: 'Bancolombia', type: 'Cuenta de Ahorros', number: '057-491-84142' },
  { bank: 'Davivienda', type: 'Cuenta de Ahorros', number: '0917-000-65948' },
];

const Success: React.FC = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Detectar si viene de Wompi (tiene parámetros status, reference, id)
  const wompiStatus = searchParams.get('status');
  const wompiReference = searchParams.get('reference');
  const wompiTransactionId = searchParams.get('id');
  const isWompiPayment = wompiStatus !== null;

  const shipping = JSON.parse(localStorage.getItem('last_shipping') || '{}');
  const orderRef = wompiReference || localStorage.getItem('last_order_ref') || `ORD-${Date.now()}`;

  const formattedPrice = (price: number) => new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(price);

  // Generar datos para invoice PDF
  const getInvoiceData = (): InvoiceData => ({
    orderReference: orderRef,
    orderDate: new Date(),
    customer: {
      fullName: shipping.nombre || 'Cliente',
      email: shipping.email || '',
      phone: shipping.telefono || '',
      city: shipping.ciudad || '',
      address: shipping.direccion || ''
    },
    items: cart.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price
    })),
    subtotal: totalPrice,
    shipping: 0, // Actualizar si tienes costo de envío
    total: totalPrice,
    wompiTransactionId: wompiTransactionId || undefined,
    paymentMethod: isWompiPayment ? 'Wompi - Tarjeta de Crédito/Débito' : 'Transferencia Bancaria'
  });

  const handleDownloadInvoice = () => {
    downloadInvoice(getInvoiceData());
  };

  const triggerWhatsApp = () => {
    const orderDetails = cart.map(item => `- ${item.quantity}x ${item.name} (${formattedPrice(item.price * item.quantity)})`).join('\n');

    const message = `🚀 NUEVO PEDIDO - ${CONTACT_INFO.name}
-----------------------------------
*Ref*: ${orderRef}
*Cliente*: ${shipping.nombre}
*NIT/CC*: ${shipping.nit || 'No especificado'}
*Teléfono*: ${shipping.telefono}
*Ubicación*: ${shipping.direccion}, ${shipping.ciudad}
-----------------------------------
*Productos*:
${orderDetails}
-----------------------------------
*TOTAL*: ${formattedPrice(totalPrice)}
*Método*: ${isWompiPayment ? 'Pago Wompi (Aprobado)' : 'Transferencia Bancaria'}
-----------------------------------
${isWompiPayment ? '_Pago confirmado por Wompi_' : '_Solicito información para el pago/envío_'}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };



  // ... existing code ...

  useEffect(() => {
    if (cart.length === 0 && !orderRef) {
      navigate('/');
    } else if (orderRef && cart.length > 0) {
      // Analytics: Purchase
      // Only fire if we have items (valid purchase session)
      trackPurchase(orderRef, totalPrice, 'COP');
    }
  }, []);

  const handleFinish = () => {
    clearCart();
    localStorage.removeItem('last_order_ref');
    navigate('/');
  };

  // ============================================================
  // WOMPI - PAGO RECHAZADO
  // ============================================================
  if (wompiStatus === 'declined') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-0 lg:pt-32">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
            <XCircle size={64} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-3">Pago Rechazado</h1>
          <p className="text-gray-600 mb-8">
            Lo sentimos, tu pago no pudo ser procesado. Intenta con otro método de pago.
          </p>
          <div className="space-y-3">
            <Link
              to="/checkout"
              className="block w-full bg-[#d4e157] text-gray-900 py-4 px-6 rounded-2xl font-black text-lg hover:bg-[#c0ca33] transition-all active:scale-95"
            >
              Intentar de Nuevo
            </Link>
            <button
              onClick={handleFinish}
              className="block w-full bg-gray-200 text-gray-700 py-4 px-6 rounded-2xl font-black text-lg hover:bg-gray-300 transition-all active:scale-95"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // WOMPI - PAGO PENDIENTE
  // ============================================================
  if (wompiStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-0 lg:pt-32">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600">
            <Clock size={64} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-3">Pago Pendiente</h1>
          <p className="text-gray-600 mb-6">
            Tu pago está siendo procesado. Te notificaremos por email cuando se confirme.
          </p>
          <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-2xl mb-8">
            Referencia: <span className="font-mono font-bold text-gray-900">{orderRef}</span>
          </p>
          <button
            onClick={handleFinish}
            className="w-full bg-[#d4e157] text-gray-900 py-4 px-6 rounded-2xl font-black text-lg hover:bg-[#c0ca33] transition-all active:scale-95"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGO EXITOSO (WOMPI O TRANSFERENCIA)
  // ============================================================
  return (
    <div className="max-w-2xl mx-auto px-4 pt-0 lg:pt-32 pb-20">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="bg-emerald-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 animate-bounce">
          <CheckCircle size={64} />
        </div>

        <h1 className="text-4xl font-black text-gray-900 mb-4">
          {isWompiPayment ? '¡Pago Exitoso! 🎉' : '¡Pedido Registrado!'}
        </h1>
        <p className="text-xl text-gray-500 mb-4">
          Gracias <strong>{shipping.nombre}</strong>. Tu pedido <strong>{orderRef}</strong> ha sido{' '}
          {isWompiPayment ? 'confirmado y procesado' : 'registrado'}.
        </p>
        {wompiTransactionId && (
          <p className="text-sm text-gray-400">
            ID Transacción: <span className="font-mono">{wompiTransactionId}</span>
          </p>
        )}
      </div>

      {/* Download Invoice Button - Destacado */}
      {cart.length > 0 && (
        <button
          onClick={handleDownloadInvoice}
          className="w-full bg-[#d4e157] text-gray-900 py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-2 hover:bg-[#c0ca33] transition-all shadow-xl active:scale-95 mb-8"
        >
          <Download size={24} />
          Descargar Comprobante PDF
        </button>
      )}

      {/* Bank Accounts - Solo si es transferencia */}
      {!isWompiPayment && (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-black text-[#054a29] uppercase text-sm tracking-widest">{CONTACT_INFO.name}</h3>
              <p className="text-gray-400 text-xs font-bold">NIT: {CONTACT_INFO.nit}</p>
            </div>
            <div className="text-right text-[10px] bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-black uppercase tracking-widest">
              Referencias Bancarias
            </div>
          </div>

          <div className="space-y-4">
            {BANK_ACCOUNTS.map((acc, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <p className="font-black text-gray-800 text-sm">{acc.bank}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{acc.type}</p>
                </div>
                <p className="font-black text-[#054a29] tracking-tighter">{acc.number}</p>
              </div>
            ))}
          </div>

          <div className="h-px bg-gray-100 my-6"></div>

          <div className="flex justify-between items-center font-black text-emerald-green text-2xl">
            <span className="text-gray-400 text-sm uppercase tracking-widest">Total a Pagar</span>
            <span>{formattedPrice(totalPrice)}</span>
          </div>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-6 rounded-2xl text-center">
          <Mail className="w-10 h-10 text-blue-600 mx-auto mb-3" />
          <p className="text-sm font-black text-gray-900">Email Enviado</p>
          <p className="text-xs text-gray-600 mt-1">
            Confirmación a tu correo
          </p>
        </div>

        <div className="bg-yellow-50 p-6 rounded-2xl text-center">
          <Package className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
          <p className="text-sm font-black text-gray-900">Preparando Envío</p>
          <p className="text-xs text-gray-600 mt-1">
            Procesaremos pronto
          </p>
        </div>

        <div className="bg-green-50 p-6 rounded-2xl text-center">
          <a
            href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <MessageCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <p className="text-sm font-black text-gray-900">WhatsApp</p>
            <p className="text-xs text-gray-600 mt-1">
              314 393 0345
            </p>
          </a>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={triggerWhatsApp}
          className="bg-[#25D366] text-white py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-all shadow-xl active:scale-95"
        >
          <MessageCircle size={24} />
          {isWompiPayment ? 'Consultar Pedido' : 'Reportar Pago'}
        </button>
        <button
          onClick={handleFinish}
          className="bg-gray-100 text-gray-600 py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-all active:scale-95"
        >
          <Home size={24} /> Volver al Inicio
        </button>
      </div>

      {!isWompiPayment && (
        <p className="text-gray-400 text-xs mt-8 text-center">
          Una vez realices la transferencia, envía el comprobante por WhatsApp para agilizar tu despacho.
        </p>
      )}
    </div>
  );
};

export default Success;
