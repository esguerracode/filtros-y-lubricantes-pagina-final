import React, { useState, useEffect } from 'react';
import { CreditCard, Building, Lock, AlertCircle, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface WompiPaymentFormProps {
    amount: number;
    orderReference: string;
    customerEmail: string;
    onSuccess: (data: any) => void;
    onError: (message: string) => void;
}

interface CardData {
    number: string;
    cvc: string;
    exp_month: string;
    exp_year: string;
    card_holder: string;
}

interface PseData {
    user_type: string;
    user_legal_id_type: string;
    user_legal_id: string;
    financial_institution_code: string;
    payment_description: string;
}

// 1. LUHN ALGORITHM (Client-side validation)
const validateCardNumber = (cardNumber: string): boolean => {
    const digits = cardNumber.replace(/\s/g, '').split('').reverse();
    let sum = 0;

    for (let i = 0; i < digits.length; i++) {
        let digit = parseInt(digits[i]);
        if (isNaN(digit)) return false;
        if (i % 2 === 1) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
    }

    return sum > 0 && sum % 10 === 0;
};

// 2. USER FRIENDLY ERRORS
const WOMPI_ERRORS: Record<string, string> = {
    'INSUFFICIENT_FUNDS': 'Fondos insuficientes. Por favor intenta con otra tarjeta.',
    'CARD_DECLINED': 'Tarjeta rechazada. Contacta a tu entidad bancaria.',
    'INVALID_CARD': 'El número de tarjeta es inválido.',
    'EXPIRED_CARD': 'La tarjeta ha expirado.',
    'INVALID_CVC': 'El código de seguridad (CVC) es incorrecto.',
    'INVALID_CARD_HOLDER': 'El nombre del titular es inválido.',
    '3DS_AUTH_ERROR': 'Error de autenticación 3DS. Intenta nuevamente.'
};

const getUserFriendlyError = (wompiError: string) => {
    for (const key in WOMPI_ERRORS) {
        if (wompiError.includes(key)) return WOMPI_ERRORS[key];
    }
    return wompiError || 'Ocurrió un error al procesar el pago. Intenta nuevamente.';
};

export const WompiPaymentForm: React.FC<WompiPaymentFormProps> = ({
    amount,
    orderReference,
    customerEmail,
    onSuccess,
    onError
}) => {
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'pse'>('card');
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [banks, setBanks] = useState<any[]>([]);
    const [acceptanceToken, setAcceptanceToken] = useState<string>('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    // PUBLIC KEY
    const PUBLIC_KEY = import.meta.env.VITE_WOMPI_PUBLIC_KEY;

    // Estados de Formularios
    const [cardData, setCardData] = useState<CardData>({
        number: '', cvc: '', exp_month: '', exp_year: '', card_holder: ''
    });

    const [pseData, setPseData] = useState<PseData>({
        user_type: '0',
        user_legal_id_type: 'CC',
        user_legal_id: '',
        financial_institution_code: '',
        payment_description: `Pago Orden ${orderReference}`
    });

    // Cargar Bancos PSE y Acceptance Token
    useEffect(() => {
        if (!PUBLIC_KEY) {
            console.error('Wompi Public Key Missing');
            return;
        }

        // Load Banks
        fetch('https://production.wompi.co/v1/pse/financial_institutions', {
            headers: { 'Authorization': `Bearer ${PUBLIC_KEY}` }
        })
            .then(r => r.json())
            .then(data => {
                if (data.data) setBanks(data.data);
            })
            .catch(err => console.error('Error cargando bancos PSE:', err));

        // Load Acceptance Token
        fetch(`https://production.wompi.co/v1/merchants/${PUBLIC_KEY}`)
            .then(r => r.json())
            .then(data => {
                if (data.data?.presigned_acceptance?.acceptance_token) {
                    setAcceptanceToken(data.data.presigned_acceptance.acceptance_token);
                }
            })
            .catch(err => console.error('Error cargando Acceptance Token:', err));
    }, [PUBLIC_KEY]);

    const handleCardPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        if (!acceptedTerms) {
            onError('Debes aceptar los términos y condiciones para continuar.');
            return;
        }

        if (!validateCardNumber(cardData.number)) {
            onError('El número de tarjeta no es válido. Revisa los dígitos.');
            return;
        }

        setLoading(true);
        setStatusMessage('Validando tarjeta de forma segura...');

        try {
            // 1. Tokenizar Tarjeta en Wompi
            const tokenRes = await fetch('https://production.wompi.co/v1/tokens/cards', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${PUBLIC_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    number: cardData.number.replace(/\s/g, ''),
                    cvc: cardData.cvc,
                    exp_month: cardData.exp_month,
                    exp_year: cardData.exp_year,
                    card_holder: cardData.card_holder
                })
            });

            const tokenData = await tokenRes.json();

            if (tokenData.error) {
                throw new Error(tokenData.error.messages?.[0]?.description || 'Error validando la tarjeta');
            }

            if (tokenData.status === 'ERROR') {
                throw new Error('La tarjeta no pudo ser tokenizada. Revisa los datos.');
            }

            setStatusMessage('Procesando transacción bancaria...');

            // 2. Enviar Token al Backend
            await createBackendTransaction({
                type: 'CARD',
                token: tokenData.data.id,
                installments: 1,
                acceptance_token: acceptanceToken
            });

        } catch (err: any) {
            onError(getUserFriendlyError(err.message));
            setLoading(false);
        }
    };

    const handlePsePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        if (!acceptedTerms) {
            onError('Debes aceptar los términos y condiciones.');
            return;
        }

        setLoading(true);
        setStatusMessage('Conectando con tu banco...');

        try {
            if (!pseData.financial_institution_code) throw new Error('Selecciona tu banco');

            await createBackendTransaction({
                type: 'PSE',
                ...pseData,
                acceptance_token: acceptanceToken
            });

        } catch (err: any) {
            onError(getUserFriendlyError(err.message));
            setLoading(false);
        }
    };

    const createBackendTransaction = async (paymentData: any) => {
        const res = await fetch('/api/payments/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...paymentData,
                amount,
                reference: orderReference,
                email: customerEmail,
                payment_method_type: paymentMethod === 'card' ? 'CARD' : 'PSE'
            })
        });

        const result = await res.json();

        if (!result.success) {
            throw new Error(result.error || 'Error procesando el pago en el servidor');
        }

        // Redirect PSE
        if (paymentMethod === 'pse' && result.data?.payment_method?.extra?.async_payment_url) {
            setStatusMessage('Redirigiendo a tu banco...');
            setTimeout(() => {
                window.location.href = result.data.payment_method.extra.async_payment_url;
            }, 1000);
            return;
        }

        // Verify Status Card
        if (result.data?.status === 'APPROVED') {
            setStatusMessage('¡Pago Aprobado!');
            setTimeout(() => onSuccess(result.data), 1000);
        } else if (result.data?.status === 'DECLINED') {
            throw new Error('Transacción Rechazada por el banco');
        } else {
            // Pending / Error
            onSuccess(result.data);
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden font-sans">

            {/* SECURITY BADGE HEADER */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2 text-emerald-700">
                    <ShieldCheck size={16} />
                    <span className="text-xs font-bold tracking-wide uppercase">Pago Seguro y Encriptado</span>
                </div>
                <div className="flex items-center gap-1 opacity-60">
                    <Lock size={12} className="text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400">SSL 256-bit</span>
                </div>
            </div>

            <div className="p-6 md:p-8">

                {/* OVERLAY LOADING */}
                {loading && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center animate-fade-in text-center p-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20"></div>
                            <Loader2 className="w-16 h-16 text-emerald-600 animate-spin relative z-10" />
                        </div>
                        <h3 className="text-emerald-800 font-bold text-lg mt-6">{statusMessage}</h3>
                        <p className="text-gray-400 text-sm mt-2 max-w-[250px]">Por favor espera un momento sin recargar la página.</p>
                    </div>
                )}

                {/* TABS DE MÉTODO */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setPaymentMethod('card')}
                        className={`flex-1 py-4 px-2 rounded-2xl flex flex-col items-center gap-3 border-2 transition-all duration-300 ${paymentMethod === 'card'
                            ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800 shadow-lg shadow-emerald-100/50 scale-[1.02]'
                            : 'border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <CreditCard size={28} strokeWidth={1.5} />
                        <span className="text-xs font-black uppercase tracking-widest">Tarjeta</span>
                    </button>
                    <button
                        onClick={() => setPaymentMethod('pse')}
                        className={`flex-1 py-4 px-2 rounded-2xl flex flex-col items-center gap-3 border-2 transition-all duration-300 ${paymentMethod === 'pse'
                            ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800 shadow-lg shadow-emerald-100/50 scale-[1.02]'
                            : 'border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <Building size={28} strokeWidth={1.5} />
                        <span className="text-xs font-black uppercase tracking-widest">PSE / Nequi</span>
                    </button>
                </div>

                {/* --- FORMULARIO TARJETA --- */}
                {paymentMethod === 'card' && (
                    <form onSubmit={handleCardPayment} className="space-y-6 animate-fade-in-up">

                        {/* TITULAR */}
                        <div className="space-y-1 group">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 group-focus-within:text-emerald-600 transition-colors">Nombre en la tarjeta</label>
                            <input
                                type="text" placeholder="COMO APARECE EN LA TARJETA" required
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-bold text-gray-700 placeholder-gray-300 text-sm tracking-wide"
                                value={cardData.card_holder}
                                onChange={e => setCardData({ ...cardData, card_holder: e.target.value.toUpperCase() })}
                            />
                        </div>

                        {/* NÚMERO */}
                        <div className="space-y-1 group">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 group-focus-within:text-emerald-600 transition-colors">Número de Tarjeta</label>
                            <div className="relative">
                                <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                <input
                                    type="text" placeholder="0000 0000 0000 0000" required maxLength={19}
                                    className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-mono text-lg text-gray-700"
                                    value={cardData.number}
                                    onChange={e => {
                                        const v = e.target.value.replace(/\D/g, '').substring(0, 16);
                                        const f = v.match(/.{1,4}/g)?.join(' ') || v;
                                        setCardData({ ...cardData, number: f });
                                    }}
                                />
                                {validateCardNumber(cardData.number) && (
                                    <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-pulse" size={20} />
                                )}
                            </div>
                        </div>

                        {/* EXP & CVC */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 group-focus-within:text-emerald-600 transition-colors">Vencimiento</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text" placeholder="MM" required maxLength={2}
                                        className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-center font-bold text-gray-700"
                                        value={cardData.exp_month}
                                        onChange={e => setCardData({ ...cardData, exp_month: e.target.value.replace(/\D/g, '') })}
                                    />
                                    <span className="text-gray-300 self-center text-xl">/</span>
                                    <input
                                        type="text" placeholder="AA" required maxLength={2}
                                        className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-center font-bold text-gray-700"
                                        value={cardData.exp_year}
                                        onChange={e => setCardData({ ...cardData, exp_year: e.target.value.replace(/\D/g, '') })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 group-focus-within:text-emerald-600 transition-colors">CVC / CVV</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500" size={16} />
                                    <input
                                        type="password" placeholder="123" required maxLength={4}
                                        className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-gray-700"
                                        value={cardData.cvc}
                                        onChange={e => setCardData({ ...cardData, cvc: e.target.value.replace(/\D/g, '') })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* TERMINOS LEGALES */}
                        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                            <input
                                type="checkbox"
                                id="terms_card"
                                checked={acceptedTerms}
                                onChange={e => setAcceptedTerms(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <label htmlFor="terms_card" className="text-xs text-emerald-800 leading-relaxed cursor-pointer select-none">
                                Acepto realizar el pago y autorizo el tratamiento de mis datos personales de acuerdo a los <a href="https://wompi.com/terminos-y-condiciones-usuario-pagador/" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-emerald-950">Términos y Condiciones de Wompi</a>.
                            </label>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit" disabled={loading}
                                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Enviando...' : `Pagar $${amount.toLocaleString('es-CO')}`}
                            </button>
                        </div>
                    </form>
                )}

                {/* --- FORMULARIO PSE --- */}
                {paymentMethod === 'pse' && (
                    <form onSubmit={handlePsePayment} className="space-y-6 animate-fade-in-up">
                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3 items-start">
                            <div className="bg-white p-1.5 rounded-full shadow-sm">
                                <AlertCircle className="text-blue-500" size={16} />
                            </div>
                            <p className="text-xs text-blue-800 font-medium leading-relaxed">
                                Serás redirigido a la sucursal virtual de tu banco para completar el pago de forma segura. Asegurate de tener habilitada la segunda clave.
                            </p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Tipo de Persona</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPseData({ ...pseData, user_type: '0' })}
                                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold border-2 transition-all ${pseData.user_type === '0' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                                >
                                    Natural (Persona)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPseData({ ...pseData, user_type: '1' })}
                                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold border-2 transition-all ${pseData.user_type === '1' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                                >
                                    Jurídica (Empresa)
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-[100px_1fr] gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Tipo Doc</label>
                                <select
                                    className="w-full px-2 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-sm focus:border-emerald-500"
                                    value={pseData.user_legal_id_type}
                                    onChange={e => setPseData({ ...pseData, user_legal_id_type: e.target.value })}
                                >
                                    <option value="CC">CC</option>
                                    <option value="CE">CE</option>
                                    <option value="NIT">NIT</option>
                                    <option value="TI">TI</option>
                                    <option value="PP">PP</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Número Documento</label>
                                <input
                                    type="text" required
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-gray-700"
                                    value={pseData.user_legal_id}
                                    onChange={e => setPseData({ ...pseData, user_legal_id: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Entidad Bancaria</label>
                            <div className="relative">
                                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <select
                                    required
                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-gray-700 appearance-none text-sm"
                                    value={pseData.financial_institution_code}
                                    onChange={e => setPseData({ ...pseData, financial_institution_code: e.target.value })}
                                >
                                    <option value="">Selecciona tu banco...</option>
                                    {banks.map((bank: any) => (
                                        <option key={bank.financial_institution_code} value={bank.financial_institution_code}>
                                            {bank.financial_institution_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                            <input
                                type="checkbox"
                                id="terms_pse"
                                checked={acceptedTerms}
                                onChange={e => setAcceptedTerms(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <label htmlFor="terms_pse" className="text-xs text-emerald-800 leading-relaxed cursor-pointer select-none">
                                Acepto realizar el pago y autorizo el tratamiento de mis datos personales de acuerdo a los <a href="https://wompi.com/terminos-y-condiciones-usuario-pagador/" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-emerald-950">Términos y Condiciones de Wompi</a>.
                            </label>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit" disabled={loading}
                                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Enviando...' : `Continuar al Banco`}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* FOOTER */}
            <div className="bg-gray-50 border-t border-gray-100 p-4 flex justify-center items-center gap-4 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                <img src="/images/assets/wompi-logo.png" className="h-5 object-contain" alt="Wompi" onError={(e) => e.currentTarget.style.display = 'none'} />
                <div className="h-4 w-[1px] bg-gray-300"></div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 tracking-wide uppercase">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    Transacción Protegida
                </div>
            </div>
        </div>
    );
};
